# Bitácora de Conducta — Frontend

Interfaz web (Vite + React) para prefectura del COBAO Plantel 04 "El Tule".
Consume la API del backend — no guarda ningún dato por su cuenta.

## Requisitos

- Node.js 18 o superior
- El backend corriendo (ver `../backend/README.md`)

## Puesta en marcha

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`. Inicia sesión con el usuario administrador que
creaste al correr el seed del backend.

Si el backend corre en otra URL (por ejemplo, ya desplegado en un servidor),
ajusta `VITE_API_URL` en `.env`.

## Notas de diseño

- **Ningún dato de estudiantes vive en el navegador sin sesión activa.** Todo
  pasa por el backend con autenticación; cerrar sesión borra el token local.
- La búsqueda de estudiantes (`SearchView`) nunca muestra un listado por
  defecto — exige al menos 3 caracteres o un grupo seleccionado, y el
  backend limita los resultados a 15.
- El nombre del prefecto que registra cada reporte **ya no se escribe a
  mano**: se toma directamente de la sesión iniciada, evitando que alguien
  registre un reporte a nombre de otra persona.

## Build de producción

```bash
npm run build
```
Genera la carpeta `dist/` lista para servir como sitio estático (Netlify,
Vercel, Nginx, o el propio backend con `express.static`).
