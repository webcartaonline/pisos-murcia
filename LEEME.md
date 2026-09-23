# Burrangulo (Pisos Murcia) en Cloudflare

Esta carpeta es el repositorio completo. Se publica como un **Worker** llamado **burrangulo**
(no como "Pages"). Cada vez que se sube un cambio a GitHub, Cloudflare lo publica solo.

- `public/` → la app (index.html, css, img, js/app.js)
- `public/js/nube.js` → conexión de la app con Cloudflare
- `src/index.js` → el "cerebro": guarda pisos, fotos y ajustes
- `wrangler.jsonc` → dice a Cloudflare qué base de datos y qué almacén usar

Recursos en Cloudflare (solo de Burrangulo, nada compartido con webcartaonline):
- Base de datos D1: `burrangulo-db`
- Almacén de fotos R2: `burrangulo-fotos`
- Secreto necesario en el Worker: `CLAVE_APP` (la clave para entrar en la app)

Configuración del Worker en Cloudflare (Settings → Build):
- Build command: vacío
- Deploy command: `npx wrangler deploy`
