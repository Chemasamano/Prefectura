# Bitácora de Conducta — COBAO Plantel 04 "El Tule"

Sistema de prefectura con **base de datos real** (ya no depende del
almacenamiento de un artifact de Claude): backend en Node.js/Express +
Prisma + SQLite, y frontend en Vite/React. Pensado para correr en tu
computadora con Visual Studio Code y, más adelante, desplegarse en un
servidor real.

```
bitacora-cobao/
  backend/    API REST + base de datos (Node.js, Express, Prisma, SQLite)
  frontend/   Interfaz web (Vite, React)
```

---

## 1. Por qué cambió de arquitectura (el problema que reportaste)

El artifact de Claude usa un almacenamiento (`window.storage`) que queda
ligado a esa instancia publicada. Cuando importabas datos y luego
**volvías a publicar** una versión nueva del código, Anthropic no garantiza
que el almacenamiento anterior se herede — en la práctica, cada publicación
puede terminar apuntando a un espacio de almacenamiento distinto, por lo que
la aplicación vuelve a sembrar los datos originales. Es una limitación real
del mecanismo de los artifacts para este caso de uso, no un error en el
código que te había generado.

Por eso esta versión usa una **base de datos de verdad**: los datos ya no
dependen de qué tan reciente sea la publicación de un artifact, viven en un
archivo (`backend/prisma/dev.db`) o en un servidor de base de datos que tú
controlas.

**Los estudiantes ya vienen con la promoción de semestre aplicada** (grupos
que iniciaban con 2 → ahora inician con 3; los que iniciaban con 4 → ahora
inician con 5), exactamente el resultado que buscabas lograr con la
importación. Ver el seed en `backend/prisma/seed.js`.

---

## 2. Puesta en marcha en Visual Studio Code (paso a paso)

### Requisitos previos
- **Node.js 18 o superior** — descarga la versión LTS desde
  [nodejs.org](https://nodejs.org). Verifica con `node -v` en una terminal.
- Extensiones recomendadas de VS Code: **ESLint**, **Prisma** (de Prisma,
  para resaltar `schema.prisma`).

### Paso 1 — Abrir el proyecto
`Archivo → Abrir carpeta...` y selecciona la carpeta `bitacora-cobao`
completa (contiene `backend/` y `frontend/`).

### Paso 2 — Backend (primera terminal)
```bash
cd backend
npm install
cp .env.example .env
```
Abre `.env` y cambia `SEED_ADMIN_PASSWORD` por una contraseña propia antes
de continuar.

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Deja esta terminal abierta — verás `API de Bitácora de Conducta escuchando
en http://localhost:4000`.

### Paso 3 — Frontend (segunda terminal, `Ctrl+Ñ` → ícono `+`)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Abre **http://localhost:5173** en tu navegador. Inicia sesión con el
usuario y contraseña que definiste en `backend/.env`
(`SEED_ADMIN_USUARIO` / `SEED_ADMIN_PASSWORD`).

### Paso 4 — Crea tu propio usuario y da de baja el de arranque
Una vez dentro, ve a **Admin** (o pide a otro admin) para dar de alta a cada
prefecto con su propio usuario y contraseña — evita que varias personas
compartan una sola cuenta, así cada reporte queda ligado a quien
efectivamente lo hizo.

> Nota: la gestión de usuarios vive en el backend
> (`POST /api/auth/usuarios`); si quieres una pantalla dedicada dentro del
> panel de Admin para crear/editar usuarios sin usar la API directamente,
> lo agregamos en la siguiente iteración — dímelo y lo construyo.

---

## 3. Privacidad: qué cambió respecto al artifact

- **Ya no hay un listado navegable de todo el alumnado.** La búsqueda exige
  escribir al menos 3 letras (o elegir un grupo); el backend nunca regresa
  el padrón completo a un rol `prefecto`, solo resultados puntuales,
  limitados a 15.
- **Acceso con inicio de sesión real**, no solo un enlace. Aunque alguien
  reenvíe la URL del sitio por error, sin usuario y contraseña válidos no
  puede consultar ni un solo estudiante.
- El listado completo (`GET /api/estudiantes`) solo existe para el rol
  `admin`, usado exclusivamente por el panel de administración.
- Los reportes quedan firmados con el nombre de quien inició sesión, no un
  texto libre que cualquiera pudo haber escrito.

---

## 4. Aspectos legales a considerar (Oaxaca, México)

**Aviso importante: no soy abogado ni sustituyo una asesoría legal formal.**
Lo siguiente es orientación general para que la valides con el área
jurídica o de transparencia de tu plantel/COBAO antes de un despliegue
formal — sobre todo porque se trata de datos de menores de edad.

- El COBAO, como institución pública del estado de Oaxaca, es un **"sujeto
  obligado"** conforme a la **Ley de Protección de Datos Personales en
  Posesión de Sujetos Obligados del Estado de Oaxaca** (reglamentaria de la
  Ley General homóloga), vigilada por el órgano garante estatal de acceso a
  la información y protección de datos de Oaxaca.
- Los nombres, grupo y registros de conducta de estudiantes son **datos
  personales**; al tratarse de menores de edad en muchos casos, conviene un
  estándar de cuidado más alto (minimizar quién accede, por cuánto tiempo,
  y con qué finalidad).
- Principios prácticos que esta versión ya refuerza (y que puedes citar
  ante tu institución): **minimización de datos** (solo se guarda nombre,
  grupo y la incidencia — nada de CURP, domicilio, etc.), **control de
  acceso** (login + roles), y **trazabilidad** (cada reporte identifica
  quién lo capturó).
- Como paso formal, tu institución normalmente necesita contar con un
  **aviso de privacidad** para este tratamiento de datos (a quién
  pertenecen los datos, con qué fin se usan, quién los resguarda, cómo
  ejercer derechos ARCO). Si quieres, puedo ayudarte a redactar un borrador
  una vez que definan quién sería el responsable formal del sistema ante la
  institución.
- Antes de un despliegue "oficial" (fuera de una prueba interna acotada),
  vale la pena que el plantel consulte con su unidad de transparencia si el
  sistema requiere registro ante el órgano garante estatal o una evaluación
  de impacto en protección de datos, dado que administra información de
  menores.

---

## 5. Opciones para desplegar en un servidor (cuando estés listo)

Esta sección resume alternativas vigentes; los precios y límites de los
planes gratuitos cambian con frecuencia, así que conviene confirmarlos en el
sitio de cada proveedor antes de decidir.

### Backend (API Node.js) + base de datos PostgreSQL

| Proveedor | Qué ofrece | Notas |
|---|---|---|
| **Render** (render.com) | Plan gratuito real para el servicio web (se "duerme" tras 15 min sin uso, tarda unos segundos en despertar) + PostgreSQL gratuito los primeros 90 días, luego de pago | Buen punto de partida sin tarjeta para empezar a probar |
| **Railway** (railway.app) | Ya no tiene plan gratuito permanente — $5 USD de crédito de prueba y luego plan Hobby desde $5 USD/mes con cobro por uso | Muy sencillo de desplegar, buena experiencia de desarrollador |
| **Fly.io** | Capa gratuita limitada + Postgres administrado | Requiere un poco más de configuración (Docker) |
| **Supabase** | Base de datos PostgreSQL administrada con plan gratuito generoso | Útil si solo quieres la base de datos en la nube y sigues corriendo la API en otro lado |
| **VPS propio** (DigitalOcean, Hostinger, DonWeb, etc.) | Control total, requiere que tú (o alguien de sistemas) mantenga el servidor | Recomendable solo si ya hay soporte técnico disponible en la institución |

### Frontend (sitio estático)
Una vez que corras `npm run build` en `frontend/`, la carpeta `dist/` se
puede alojar gratis en **Vercel**, **Netlify** o **Cloudflare Pages** —
cualquiera de los tres sirve bien para esta parte, independientemente de
dónde quede el backend.

### Un factor adicional a verificar con tu institución
Al ser datos de una institución pública mexicana, vale la pena confirmar si
existe algún lineamiento interno de COBAO/gobierno del estado sobre **dónde
puede alojarse** este tipo de información (por ejemplo, preferencia por
proveedores con presencia o cumplimiento en México). No es algo que pueda
confirmarte con certeza desde aquí — es justo el tipo de pregunta para la
misma área de transparencia/jurídica mencionada arriba.

### Al desplegar en producción, no olvides:
1. Cambiar el `provider` de `sqlite` a `postgresql` en
   `backend/prisma/schema.prisma` (ver `backend/README.md`).
2. Generar un `JWT_SECRET` nuevo y largo — nunca reutilices el de
   desarrollo local.
3. Ajustar `CORS_ORIGIN` en el backend al dominio real del frontend.
4. Servir el sitio por **HTTPS** (todos los proveedores de la tabla lo
   dan por defecto).
