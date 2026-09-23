-- Estructura de la base de datos burrangulo-db (ya creada en Cloudflare).
-- Solo hace falta si algún día se crea una base de datos nueva.
CREATE TABLE IF NOT EXISTS pisos (id TEXT PRIMARY KEY, datos TEXT NOT NULL DEFAULT '{}', orden INTEGER NOT NULL DEFAULT 0, creado INTEGER NOT NULL, actualizado INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS fotos (id TEXT PRIMARY KEY, piso_id TEXT NOT NULL, clave TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'image/jpeg', orden INTEGER NOT NULL DEFAULT 0, creado INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_fotos_piso ON fotos(piso_id, orden);
CREATE TABLE IF NOT EXISTS ajustes (clave TEXT PRIMARY KEY, valor TEXT NOT NULL DEFAULT '{}', actualizado INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS version (id INTEGER PRIMARY KEY CHECK (id = 1), n INTEGER NOT NULL);
INSERT OR IGNORE INTO version (id, n) VALUES (1, 0);
