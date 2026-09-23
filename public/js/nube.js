// =====================================================================
//  nube.js — conexión de la app con Cloudflare (sustituye a Firebase)
//
//  Uso rápido:
//    await Nube.entrar("clave");                 // iniciar sesión
//    Nube.escuchar(datos => pintar(datos));      // se llama al cargar y cada vez que algo cambie
//    await Nube.guardarPiso(id, { ... });        // crear o reemplazar un piso
//    await Nube.subirFoto(pisoId, archivo);      // subir foto (File o Blob)
//
//  "datos" tiene esta forma:
//    { pisos: [ {id, ...campos} ], fotos: { pisoId: [ {id, url, orden} ] }, ajustes: { estados: ... } }
// =====================================================================
(function () {
  const INTERVALO = 3000; // cada 3 segundos mira si hay cambios
  let oyentes = [];
  let ultimaVersion = -1;
  let ultimosDatos = null;
  let temporizador = null;
  let comprobando = false;

  async function pedir(ruta, opciones = {}) {
    const r = await fetch("/api/" + ruta, { credentials: "same-origin", ...opciones });
    let cuerpo = null;
    try { cuerpo = await r.json(); } catch {}
    if (r.status === 401) avisarSesion(false);
    if (!r.ok) throw new Error((cuerpo && cuerpo.error) || "Error " + r.status);
    return cuerpo;
  }
  const enviar = (ruta, metodo, datos) =>
    pedir(ruta, { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos ?? {}) });

  // --- sesión ---
  let oyentesSesion = [];
  function avisarSesion(dentro) { oyentesSesion.forEach((f) => f(dentro)); }

  async function entrar(clave) {
    await enviar("entrar", "POST", { clave });
    avisarSesion(true);
    await comprobar(true);
    return true;
  }
  async function salir() {
    await enviar("salir", "POST");
    parar();
    ultimaVersion = -1;
    ultimosDatos = null;
    avisarSesion(false);
  }
  async function estaDentro() {
    try { return (await pedir("sesion")).dentro === true; } catch { return false; }
  }
  function alCambiarSesion(fn) { oyentesSesion.push(fn); }

  // --- sincronización ---
  async function comprobar(forzar = false) {
    if (comprobando) return;
    comprobando = true;
    try {
      const { n } = await pedir("cambios");
      if (forzar || n !== ultimaVersion) {
        const todo = await pedir("todo");
        ultimaVersion = todo.n;
        ultimosDatos = { pisos: todo.pisos, fotos: todo.fotos, ajustes: todo.ajustes };
        oyentes.forEach((f) => { try { f(ultimosDatos); } catch (e) { console.error(e); } });
      }
    } catch (e) {
      // sin conexión o sin sesión: se reintentará en el siguiente ciclo
    } finally {
      comprobando = false;
    }
  }
  function arrancar() {
    if (temporizador) return;
    comprobar(true);
    temporizador = setInterval(() => { if (!document.hidden) comprobar(); }, INTERVALO);
  }
  function parar() { clearInterval(temporizador); temporizador = null; }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && temporizador) comprobar(); });
  window.addEventListener("online", () => temporizador && comprobar());

  function escuchar(fn) {
    oyentes.push(fn);
    if (ultimosDatos) fn(ultimosDatos);
    arrancar();
    return () => { oyentes = oyentes.filter((f) => f !== fn); };
  }

  // tras guardar algo, refrescar enseguida en este dispositivo
  const yRefrescar = (p) => p.then((r) => { comprobar(); return r; });

  // --- pisos ---
  const crearPiso = (datos) => yRefrescar(enviar("pisos", "POST", datos));
  const guardarPiso = (id, datos) => yRefrescar(enviar("pisos/" + encodeURIComponent(id), "PUT", datos));
  const actualizarPiso = (id, cambios) => yRefrescar(enviar("pisos/" + encodeURIComponent(id), "PATCH", cambios));
  const borrarPiso = (id) => yRefrescar(pedir("pisos/" + encodeURIComponent(id), { method: "DELETE" }));

  // --- fotos ---
  function subirFoto(pisoId, archivo) {
    return yRefrescar(pedir("pisos/" + encodeURIComponent(pisoId) + "/fotos", {
      method: "POST",
      headers: { "Content-Type": archivo.type || "image/jpeg" },
      body: archivo,
    }));
  }
  const borrarFoto = (fotoId) => yRefrescar(pedir("fotos/" + encodeURIComponent(fotoId), { method: "DELETE" }));
  const ordenarFotos = (pisoId, ids) =>
    yRefrescar(enviar("pisos/" + encodeURIComponent(pisoId) + "/fotos/orden", "PUT", { ids }));

  // --- ajustes (p. ej. "estados") ---
  const leerAjuste = async (clave) => (await pedir("ajustes/" + encodeURIComponent(clave))).valor;
  const guardarAjuste = (clave, valor) => yRefrescar(enviar("ajustes/" + encodeURIComponent(clave), "PUT", valor));

  // Utilidad: reducir una foto antes de subirla (lado mayor en píxeles, calidad JPEG)
  async function comprimirFoto(archivo, ladoMax = 1600, calidad = 0.82) {
    const img = await createImageBitmap(archivo);
    const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * escala);
    c.height = Math.round(img.height * escala);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok) => c.toBlob(ok, "image/jpeg", calidad));
  }

  window.Nube = {
    entrar, salir, estaDentro, alCambiarSesion,
    escuchar, refrescar: () => comprobar(true),
    crearPiso, guardarPiso, actualizarPiso, borrarPiso,
    subirFoto, borrarFoto, ordenarFotos, comprimirFoto,
    leerAjuste, guardarAjuste,
  };
})();
