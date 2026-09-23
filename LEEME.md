# Burrangulo en Cloudflare

Esta carpeta es el repositorio completo. Se publica como un Worker llamado **burrangulo**.

- `public/` → la web (aquí va la app de Pisos Murcia: index.html, css, js...)
- `public/js/nube.js` → conexión con Cloudflare (sustituye a Firebase)
- `src/index.js` → el "cerebro": guarda pisos, fotos y ajustes
- `wrangler.jsonc` → dice a Cloudflare qué base de datos y qué almacén usar

Recursos en Cloudflare (solo de Burrangulo, nada compartido con webcartaonline):
- Base de datos D1: `burrangulo-db`
- Almacén de fotos R2: `burrangulo-fotos`
- Secreto necesario: `CLAVE_APP` (la contraseña para entrar en la app)
