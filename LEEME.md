# Pisos Murcia — cómo ponerla en marcha

La app son archivos normales (una página web) que se publican gratis en **GitHub Pages**.
Los datos (pisos, notas, fotos, estados) se guardan en **Firebase**, un servicio gratuito de Google que funciona como una "libreta compartida en internet":
cuando alguien cambia algo en el ordenador, el móvil lo ve al momento, sin recargar.

> Ejemplo: tu hermano cambia un piso a «Visitado» en el portátil → en su móvil la tarjeta cambia de color en 1 segundo.
> Si el móvil no tiene cobertura, los cambios se guardan en el propio móvil y se envían solos cuando vuelve la conexión.

Solo hay que hacer la configuración **una vez** (unos 15 minutos).

---

## Paso 1 · Crear el proyecto de Firebase

1. Entra en <https://console.firebase.google.com> con una cuenta de Google.
2. Pulsa **«Crear un proyecto»** (o «Add project»).
3. Nombre: `pisos-murcia` (o el que quieras). Pulsa **Continuar**.
4. Cuando pregunte por **Google Analytics**, desactívalo (no hace falta). Pulsa **Crear proyecto** y espera.

## Paso 2 · Activar el inicio de sesión con correo

1. En el menú de la izquierda: **Compilación (Build) → Authentication** → botón **Comenzar**.
2. Pestaña **Método de inicio de sesión (Sign-in method)** → elige **Correo electrónico/contraseña** → activa el primer interruptor → **Guardar**.
3. Pestaña **Usuarios (Users)** → **Agregar usuario**:
   - Tu correo y una contraseña.
   - Repite con el correo de tu hermano y otra contraseña.

   *(Así solo vosotros dos podéis entrar.)*

## Paso 3 · Crear la base de datos

1. Menú izquierdo: **Compilación (Build) → Firestore Database** → **Crear base de datos**.
2. Ubicación: elige **`eur3 (europe-west)`** o **`europe-southwest1 (Madrid)`**. Pulsa Siguiente.
3. Elige **Iniciar en modo de producción** → **Crear**.
4. Cuando se abra, ve a la pestaña **Reglas (Rules)**.
5. Borra todo lo que hay y pega el contenido del archivo **`firestore.rules`** de esta carpeta.
6. En esas reglas, cambia `CORREO_DE_TU_HERMANO@gmail.com` por el correo real de tu hermano (el mismo del paso 2). Escríbelo **en minúsculas**.
7. Pulsa **Publicar**.

> Las reglas son el "portero": aunque la página sea pública, solo esos dos correos pueden ver o cambiar los datos.

## Paso 4 · Conectar la app con Firebase

1. En Firebase, arriba a la izquierda, pulsa la **rueda dentada ⚙ → Configuración del proyecto**.
2. Baja hasta **Tus apps** y pulsa el icono **`</>`** (Web).
3. Nombre: `pisos-web`. **No** marques «Firebase Hosting». Pulsa **Registrar app**.
4. Te enseñará un bloque de código con algo así:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "pisos-murcia-xxxx.firebaseapp.com",
     projectId: "pisos-murcia-xxxx",
     storageBucket: "pisos-murcia-xxxx.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```
5. Abre el archivo **`js/config.js`** de esta carpeta (con el Bloc de notas vale) y sustituye cada `PEGA_AQUI...` por los valores de tu bloque. Guarda.

> Es normal que estas claves queden visibles en GitHub: no son una contraseña. La protección real son las reglas del paso 3.

## Paso 5 · Publicar en GitHub Pages

1. Sube **todo el contenido de esta carpeta** al repositorio (que `index.html` quede en la raíz, no dentro de otra carpeta).
2. En GitHub, dentro del repositorio: **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, rama **`main`**, carpeta **`/ (root)`** → **Save**.
4. Espera 1–2 minutos. La dirección será: `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`

## Paso 6 · Instalarla en el móvil

- **Android (Chrome):** abre la dirección → menú **⋮** → **Añadir a pantalla de inicio** / **Instalar app**.
  Además, desde Idealista o Fotocasa podrás usar **Compartir → Pisos** y se abrirá el formulario con el enlace ya puesto.
- **iPhone (Safari):** abre la dirección → botón **Compartir** → **Añadir a pantalla de inicio**.

La primera vez pedirá correo y contraseña; después se queda la sesión abierta.

---

## Preguntas rápidas

**¿Cuesta dinero?** No. El plan gratuito de Firebase (Spark) permite 1 GB de datos y 50.000 lecturas al día; para dos personas sobra muchísimo. No pide tarjeta.

**¿Cuántas fotos caben?** Cada foto se reduce a unos 150–300 KB. 1 GB son unas 3.000–5.000 fotos.

**¿Por qué no se importan las fotos del anuncio solas?** Idealista y Fotocasa bloquean que otras webs lean sus anuncios. Por eso la app guarda el enlace, adivina el municipio y las fotos se añaden con capturas, desde la galería o pegándolas.

**Olvidé la contraseña.** En la pantalla de entrada pulsa «He olvidado la contraseña» y llegará un correo.

**Quiero añadir a otra persona.** Créale un usuario (paso 2) y añade su correo a la lista de las reglas (paso 3).

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página principal |
| `css/` | Colores, tipografías y diseño |
| `js/app.js` | Todo el funcionamiento de la app |
| `js/config.js` | **El único archivo que tienes que editar** (paso 4) |
| `firestore.rules` | Las reglas de acceso que pegas en Firebase (paso 3) |
| `manifest.webmanifest`, `img/` | Icono y datos para instalarla en el móvil |
| `.nojekyll` | Le dice a GitHub Pages que publique los archivos tal cual |
