# Bitácora de Conducta — Backend

API REST en Node.js + Express, con base de datos real vía Prisma (SQLite en
desarrollo local, PostgreSQL recomendado en producción).

## Requisitos

- Node.js 18 o superior
- npm 9+

## Puesta en marcha (primera vez)

```bash
cd backend
npm install
cp .env.example .env
```

Abre `.env` y revisa los valores (para desarrollo local no necesitas cambiar
nada, excepto que sí es buena práctica cambiar `SEED_ADMIN_PASSWORD` antes de
crear la base de datos).

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```

La API queda en `http://localhost:4000`. Verifica que esté viva:
`http://localhost:4000/api/health`

## Qué hace el seed

- Carga los 487 estudiantes del ciclo, **ya con la promoción de semestre
  aplicada** (los grupos que empezaban con 2 pasan a 3, los que empezaban con
  4 pasan a 5) — exactamente el resultado que buscabas lograr.
- Carga las 1,316 sesiones de horario de los 44 grupos (de los tres PDF).
- Crea un usuario administrador inicial con el usuario/contraseña definidos
  en `.env` (`SEED_ADMIN_USUARIO` / `SEED_ADMIN_PASSWORD`). **Inicia sesión y
  crea tu propio usuario cuanto antes; no dejes ese usuario de arranque
  activo en producción.**

El seed solo se ejecuta si la tabla de estudiantes está vacía — no duplica
datos si lo corres dos veces por error.

## Autenticación

Todas las rutas (excepto `/api/auth/login` y `/api/health`) requieren un
token en el header `Authorization: Bearer <token>`, obtenido al iniciar
sesión. Los tokens expiran según `JWT_EXPIRES_IN` (por defecto 12 horas).

Hay dos roles:
- **`prefecto`**: puede buscar estudiantes (por nombre, no listar a todos),
  crear/editar reportes, y consultar el tablero "en vivo" y el resumen.
- **`admin`**: además de lo anterior, administra el listado de estudiantes
  (altas, bajas, cambios de grupo, importación masiva, promoción de
  semestre) y gestiona usuarios.

## Diseño pensado para proteger datos personales

La ruta `GET /api/estudiantes/buscar` **nunca** regresa el listado completo:
solo responde si se escriben al menos 3 caracteres de búsqueda, y limita los
resultados a 15. El listado completo (`GET /api/estudiantes`) solo existe
para el rol `admin`, usado por el panel de administración. Así, aunque el
enlace de la aplicación se comparta fuera de la prefectura, nadie puede
"navegar" el padrón completo de estudiantes — como máximo, ver el resultado
de una búsqueda puntual, y solo si tiene una sesión válida.

## Pasar a producción con PostgreSQL

1. Crea una base de datos PostgreSQL (ver sugerencias de hosting en el
   README raíz del proyecto).
2. En `prisma/schema.prisma`, cambia:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. En `.env` de producción, define `DATABASE_URL` con la cadena de conexión
   de PostgreSQL.
4. Corre `npx prisma migrate deploy` y `npm run seed` (una sola vez) contra
   la base de datos de producción.
5. Cambia `JWT_SECRET` por un valor largo y aleatorio distinto al de
   desarrollo, y ajusta `CORS_ORIGIN` al dominio real del frontend.

## Endpoints principales

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | Inicia sesión |
| GET | `/api/estudiantes/buscar?q=` | prefecto/admin | Busca estudiantes (mín. 3 caracteres) |
| GET | `/api/estudiantes/grupos-resumen` | prefecto/admin | Conteos agregados por grupo |
| GET | `/api/estudiantes/:id` | prefecto/admin | Detalle + historial de un estudiante |
| GET | `/api/estudiantes` | admin | Listado completo |
| POST | `/api/estudiantes/importar-masivo` | admin | Importación masiva |
| POST | `/api/estudiantes/promocion` | admin | Promoción de semestre |
| POST | `/api/reportes` | prefecto/admin | Crea un reporte de conducta |
| PATCH | `/api/reportes/:id` | prefecto/admin | Marca resuelto/pendiente |
| GET | `/api/reportes/resumen` | prefecto/admin | Reporte agregado del semestre |
| GET | `/api/horario/ahora?grupo=` | prefecto/admin | Qué pasa ahora mismo en un grupo |
| GET | `/api/horario/todos` | prefecto/admin | Estado de todos los grupos a la vez |
| GET | `/api/horario/profesores` | prefecto/admin | Nombres reales de profesores |
| GET | `/api/horario/aulas` | prefecto/admin | Aulas conocidas |
