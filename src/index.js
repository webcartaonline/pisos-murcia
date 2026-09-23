// =====================================================================
//  Burrangulo — Worker de Cloudflare
//  - Sirve la web (carpeta /public)
//  - Guarda los datos de los pisos en la base de datos D1 (burrangulo-db)
//  - Guarda las fotos en el almacén R2 (burrangulo-fotos)
//  - Protege todo con una clave (secreto CLAVE_APP en Cloudflare)
// =====================================================================

const COOKIE = "burro_sesion";
const MAX_FOTO = 10 * 1024 * 1024; // 10 MB por foto

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Todo lo que no sea /api/ es la web: se sirve tal cual desde /public
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      return await api(request, env, url);
    } catch (err) {
      console.error(err);
      return json({ error: "Error interno" }, 500);
    }
  },
};

// ---------------------------------------------------------------------
//  Rutas de la API
// ---------------------------------------------------------------------
async function api(request, env, url) {
  const metodo = request.method;
  const partes = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean);

  if (!env.CLAVE_APP) {
    return json({ error: "Falta configurar el secreto CLAVE_APP en Cloudflare" }, 503);
  }

  // ---- Sesión (no necesitan estar dentro) ----
  if (partes[0] === "entrar" && metodo === "POST") {
    const { clave } = await leerJSON(request);
    if (typeof clave !== "string" || !(await igualSeguro(clave, env.CLAVE_APP))) {
      await esperar(800); // frena a quien intente adivinar la clave
      return json({ error: "Clave incorrecta" }, 401);
    }
    const token = await firmar(env.CLAVE_APP);
    return json({ ok: true }, 200, {
      "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
    });
  }
  if (partes[0] === "salir" && metodo === "POST") {
    return json({ ok: true }, 200, {
      "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    });
  }
  if (partes[0] === "sesion" && metodo === "GET") {
    return json({ dentro: await autorizado(request, env) });
  }

  // ---- A partir de aquí hay que haber entrado con la clave ----
  if (!(await autorizado(request, env))) {
    return json({ error: "No has iniciado sesión" }, 401);
  }

  const db = env.DB;

  // GET /api/cambios -> número que sube cada vez que algo cambia
  if (partes[0] === "cambios" && metodo === "GET") {
    return json({ n: await leerVersion(db) });
  }

  // GET /api/todo -> todos los datos de golpe
  if (partes[0] === "todo" && metodo === "GET") {
    const [v, pisos, fotos, ajustes] = await db.batch([
      db.prepare("SELECT n FROM version WHERE id = 1"),
      db.prepare("SELECT id, datos, creado, actualizado FROM pisos ORDER BY creado ASC"),
      db.prepare("SELECT id, piso_id, orden, creado FROM fotos ORDER BY piso_id, orden ASC, creado ASC"),
      db.prepare("SELECT clave, valor FROM ajustes"),
    ]);
    const fotosPorPiso = {};
    for (const f of fotos.results) {
      (fotosPorPiso[f.piso_id] ||= []).push({ id: f.id, url: `/api/fotos/${f.id}`, orden: f.orden });
    }
    const ajustesObj = {};
    for (const a of ajustes.results) ajustesObj[a.clave] = parse(a.valor);
    return json({
      n: v.results[0]?.n ?? 0,
      pisos: pisos.results.map((p) => ({
        ...parse(p.datos),
        id: p.id,
        _creado: p.creado,
        _actualizado: p.actualizado,
      })),
      fotos: fotosPorPiso,
      ajustes: ajustesObj,
    });
  }

  // ---------- PISOS ----------
  if (partes[0] === "pisos") {
    const pisoId = partes[1];

    // POST /api/pisos -> crear piso nuevo
    if (!pisoId && metodo === "POST") {
      const datos = limpiarDatos(await leerJSON(request));
      const id = datos.id && validoId(datos.id) ? datos.id : nuevoId();
      delete datos.id;
      const ahora = Date.now();
      await db.batch([
        db.prepare("INSERT INTO pisos (id, datos, creado, actualizado) VALUES (?, ?, ?, ?)")
          .bind(id, JSON.stringify(datos), ahora, ahora),
        subirVersion(db),
      ]);
      return json({ ok: true, id });
    }

    if (pisoId && !validoId(pisoId)) return json({ error: "Id no válido" }, 400);

    // PUT /api/pisos/:id -> guardar (crea o reemplaza todos sus datos)
    if (pisoId && !partes[2] && metodo === "PUT") {
      const datos = limpiarDatos(await leerJSON(request));
      delete datos.id;
      const ahora = Date.now();
      await db.batch([
        db.prepare(
          `INSERT INTO pisos (id, datos, creado, actualizado) VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET datos = excluded.datos, actualizado = excluded.actualizado`
        ).bind(pisoId, JSON.stringify(datos), ahora, ahora),
        subirVersion(db),
      ]);
      return json({ ok: true, id: pisoId });
    }

    // PATCH /api/pisos/:id -> cambiar solo algunos campos
    if (pisoId && !partes[2] && metodo === "PATCH") {
      const cambios = limpiarDatos(await leerJSON(request));
      delete cambios.id;
      const fila = await db.prepare("SELECT datos FROM pisos WHERE id = ?").bind(pisoId).first();
      if (!fila) return json({ error: "Ese piso no existe" }, 404);
      const datos = { ...parse(fila.datos), ...cambios };
      await db.batch([
        db.prepare("UPDATE pisos SET datos = ?, actualizado = ? WHERE id = ?")
          .bind(JSON.stringify(datos), Date.now(), pisoId),
        subirVersion(db),
      ]);
      return json({ ok: true, id: pisoId });
    }

    // DELETE /api/pisos/:id -> borrar piso y sus fotos
    if (pisoId && !partes[2] && metodo === "DELETE") {
      const fotos = await db.prepare("SELECT clave FROM fotos WHERE piso_id = ?").bind(pisoId).all();
      const claves = fotos.results.map((f) => f.clave);
      if (claves.length) await env.FOTOS.delete(claves);
      await db.batch([
        db.prepare("DELETE FROM fotos WHERE piso_id = ?").bind(pisoId),
        db.prepare("DELETE FROM pisos WHERE id = ?").bind(pisoId),
        subirVersion(db),
      ]);
      return json({ ok: true });
    }

    // POST /api/pisos/:id/fotos -> subir una foto (el cuerpo es la imagen)
    if (pisoId && partes[2] === "fotos" && !partes[3] && metodo === "POST") {
      const tipo = (request.headers.get("Content-Type") || "image/jpeg").split(";")[0].trim();
      if (!tipo.startsWith("image/")) return json({ error: "Solo se admiten imágenes" }, 400);
      const cuerpo = await request.arrayBuffer();
      if (!cuerpo.byteLength) return json({ error: "La foto está vacía" }, 400);
      if (cuerpo.byteLength > MAX_FOTO) return json({ error: "La foto pesa demasiado (máx. 10 MB)" }, 413);

      const id = nuevoId();
      const clave = `pisos/${pisoId}/${id}`;
      await env.FOTOS.put(clave, cuerpo, { httpMetadata: { contentType: tipo } });
      const sig = await db
        .prepare("SELECT COALESCE(MAX(orden), -1) + 1 AS o FROM fotos WHERE piso_id = ?")
        .bind(pisoId).first();
      await db.batch([
        db.prepare("INSERT INTO fotos (id, piso_id, clave, tipo, orden, creado) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(id, pisoId, clave, tipo, sig.o, Date.now()),
        subirVersion(db),
      ]);
      return json({ ok: true, id, url: `/api/fotos/${id}` });
    }

    // PUT /api/pisos/:id/fotos/orden -> cambiar el orden { ids: [...] }
    if (pisoId && partes[2] === "fotos" && partes[3] === "orden" && metodo === "PUT") {
      const { ids } = await leerJSON(request);
      if (!Array.isArray(ids)) return json({ error: "Falta la lista ids" }, 400);
      const ops = ids.filter(validoId).map((fid, i) =>
        db.prepare("UPDATE fotos SET orden = ? WHERE id = ? AND piso_id = ?").bind(i, fid, pisoId)
      );
      ops.push(subirVersion(db));
      await db.batch(ops);
      return json({ ok: true });
    }
  }

  // ---------- FOTOS ----------
  if (partes[0] === "fotos" && partes[1]) {
    const fotoId = partes[1];
    if (!validoId(fotoId)) return json({ error: "Id no válido" }, 400);
    const fila = await db.prepare("SELECT clave, tipo FROM fotos WHERE id = ?").bind(fotoId).first();
    if (!fila) return json({ error: "Esa foto no existe" }, 404);

    // GET /api/fotos/:id -> ver la foto
    if (metodo === "GET") {
      const obj = await env.FOTOS.get(fila.clave);
      if (!obj) return json({ error: "Foto no encontrada" }, 404);
      return new Response(obj.body, {
        headers: {
          "Content-Type": fila.tipo,
          "Cache-Control": "private, max-age=31536000, immutable",
        },
      });
    }

    // DELETE /api/fotos/:id -> borrar la foto
    if (metodo === "DELETE") {
      await env.FOTOS.delete(fila.clave);
      await db.batch([
        db.prepare("DELETE FROM fotos WHERE id = ?").bind(fotoId),
        subirVersion(db),
      ]);
      return json({ ok: true });
    }
  }

  // ---------- AJUSTES (estados, preferencias...) ----------
  if (partes[0] === "ajustes" && partes[1]) {
    const clave = partes[1];
    if (!validoId(clave)) return json({ error: "Nombre no válido" }, 400);

    if (metodo === "GET") {
      const fila = await db.prepare("SELECT valor FROM ajustes WHERE clave = ?").bind(clave).first();
      return json({ clave, valor: fila ? parse(fila.valor) : null });
    }
    if (metodo === "PUT") {
      const valor = await leerJSON(request);
      await db.batch([
        db.prepare(
          `INSERT INTO ajustes (clave, valor, actualizado) VALUES (?, ?, ?)
           ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, actualizado = excluded.actualizado`
        ).bind(clave, JSON.stringify(valor), Date.now()),
        subirVersion(db),
      ]);
      return json({ ok: true });
    }
  }

  return json({ error: "Ruta no encontrada" }, 404);
}

// ---------------------------------------------------------------------
//  Ayudantes
// ---------------------------------------------------------------------
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}

async function leerJSON(request) {
  try {
    const d = await request.json();
    return d && typeof d === "object" ? d : {};
  } catch {
    return {};
  }
}

function parse(txt) {
  try { return JSON.parse(txt); } catch { return {}; }
}

function limpiarDatos(d) {
  const copia = { ...d };
  for (const k of Object.keys(copia)) if (k.startsWith("_")) delete copia[k];
  return copia;
}

function validoId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

function nuevoId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

function subirVersion(db) {
  return db.prepare("UPDATE version SET n = n + 1 WHERE id = 1");
}

async function leerVersion(db) {
  const f = await db.prepare("SELECT n FROM version WHERE id = 1").first();
  return f?.n ?? 0;
}

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Token de sesión = firma HMAC de la clave. Si cambias la clave, todas
// las sesiones abiertas se cierran solas.
async function firmar(clave) {
  const k = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(clave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const firma = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode("burrangulo-sesion-v1"));
  return [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function igualSeguro(a, b) {
  const [ha, hb] = await Promise.all([a, b].map((s) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))));
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let dif = 0;
  for (let i = 0; i < x.length; i++) dif |= x[i] ^ y[i];
  return dif === 0;
}

async function autorizado(request, env) {
  const galletas = request.headers.get("Cookie") || "";
  const m = galletas.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  if (!m) return false;
  return igualSeguro(m[1], await firmar(env.CLAVE_APP));
}
