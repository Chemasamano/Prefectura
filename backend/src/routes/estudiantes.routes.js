const express = require('express');
const prisma = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function normalizar(str) {
  return (str || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * GET /api/estudiantes/buscar?q=...
 *
 * IMPORTANTE (privacidad): a diferencia de un listado completo, este
 * endpoint SOLO regresa resultados si se escribe una búsqueda de al
 * menos 3 caracteres, y limita el numero de resultados. Así, ningún
 * prefecto puede "listar" a todo el alumnado de un solo vistazo —
 * solo puede consultar al estudiante que busca por nombre.
 */
router.get('/buscar', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const grupo = (req.query.grupo || '').toString().trim();

  if (q.length < 3 && !grupo) {
    return res.json({ success: true, data: [], message: 'Escribe al menos 3 caracteres para buscar' });
  }

  const candidatos = await prisma.estudiante.findMany({
    where: { activo: true, ...(grupo ? { grupo } : {}) },
    select: { id: true, nombre: true, grupo: true, estatus: true },
  });

  const nq = normalizar(q);
  const filtrados = (q.length >= 3 ? candidatos.filter((s) => normalizar(s.nombre).includes(nq)) : candidatos).slice(0, 15);

  const conConteos = await Promise.all(filtrados.map(async (s) => {
    const total = await prisma.reporte.count({ where: { estudianteId: s.id } });
    const pendientes = await prisma.reporte.count({ where: { estudianteId: s.id, resuelto: false } });
    return { ...s, totalReportes: total, pendientes };
  }));

  res.json({ success: true, data: conConteos });
});

/** GET /api/estudiantes/grupos-resumen — solo agregados, nunca nombres individuales */
router.get('/grupos-resumen', requireAuth, async (req, res) => {
  const estudiantes = await prisma.estudiante.findMany({ where: { activo: true }, select: { id: true, grupo: true } });
  const grupos = Array.from(new Set(estudiantes.map((e) => e.grupo))).sort((a, b) => Number(a) - Number(b));

  const resultado = [];
  for (const g of grupos) {
    const ids = estudiantes.filter((e) => e.grupo === g).map((e) => e.id);
    const total = await prisma.reporte.count({ where: { estudianteId: { in: ids } } });
    const pendientes = await prisma.reporte.count({ where: { estudianteId: { in: ids }, resuelto: false } });
    const conReporte = await prisma.reporte.groupBy({ by: ['estudianteId'], where: { estudianteId: { in: ids } } });
    resultado.push({ grupo: g, alumnos: ids.length, total, pendientes, conReporte: conReporte.length });
  }
  res.json({ success: true, data: resultado });
});

/** GET /api/estudiantes/:id — detalle + historial de reportes de UN estudiante consultado */
router.get('/:id', requireAuth, async (req, res) => {
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: req.params.id },
    include: { reportes: { orderBy: { fecha: 'desc' } } },
  });
  if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
  res.json({ success: true, data: { ...estudiante, reportes: estudiante.reportes.map((r) => ({ ...r, tipos: JSON.parse(r.tipos) })) } });
});

/* ============== A partir de aquí, solo administrador ============== */

/** GET /api/estudiantes — listado completo, únicamente para el panel de administración */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { q, mostrarBaja } = req.query;
  const where = {};
  if (!(mostrarBaja === 'true')) where.activo = true;
  let estudiantes = await prisma.estudiante.findMany({ where, orderBy: { nombre: 'asc' } });
  if (q) {
    const nq = normalizar(q);
    estudiantes = estudiantes.filter((s) => normalizar(s.nombre).includes(nq) || s.grupo.includes(q));
  }
  res.json({ success: true, data: estudiantes });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { nombre, grupo, estatus } = req.body || {};
  if (!nombre || !grupo) return res.status(400).json({ success: false, message: 'Nombre y grupo son requeridos' });
  const nuevo = await prisma.estudiante.create({ data: { nombre, grupo, estatus: estatus || 'nuevo_ingreso', activo: true } });
  res.status(201).json({ success: true, data: nuevo });
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { grupo, estatus, activo } = req.body || {};
  const cambios = {};
  if (grupo !== undefined) cambios.grupo = grupo;
  if (estatus !== undefined) cambios.estatus = estatus;
  if (activo !== undefined) cambios.activo = activo;
  const actualizado = await prisma.estudiante.update({ where: { id: req.params.id }, data: cambios });
  res.json({ success: true, data: actualizado });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.estudiante.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

/** POST /api/estudiantes/importar-masivo { filas: [{n,g}], estatus } */
router.post('/importar-masivo', requireAuth, requireAdmin, async (req, res) => {
  const { filas, estatus } = req.body || {};
  if (!Array.isArray(filas) || filas.length === 0) {
    return res.status(400).json({ success: false, message: 'No se recibieron filas para importar' });
  }
  const activos = await prisma.estudiante.findMany({ where: { activo: true } });
  let creados = 0, actualizados = 0;
  for (const fila of filas) {
    const existente = activos.find((s) => normalizar(s.nombre) === normalizar(fila.n));
    if (existente) {
      await prisma.estudiante.update({ where: { id: existente.id }, data: { grupo: fila.g } });
      actualizados++;
    } else {
      await prisma.estudiante.create({ data: { nombre: fila.n, grupo: fila.g, estatus: estatus || 'nuevo_ingreso', activo: true } });
      creados++;
    }
  }
  res.json({ success: true, data: { creados, actualizados } });
});

/** POST /api/estudiantes/promocion { reglas: [{de,a}] } */
router.post('/promocion', requireAuth, requireAdmin, async (req, res) => {
  const { reglas } = req.body || {};
  if (!Array.isArray(reglas) || reglas.length === 0) {
    return res.status(400).json({ success: false, message: 'No se recibieron reglas de promoción' });
  }
  const activos = await prisma.estudiante.findMany({ where: { activo: true } });
  let cambiados = 0;
  for (const s of activos) {
    const regla = reglas.find((r) => r.de && s.grupo[0] === r.de);
    if (regla && regla.a) {
      await prisma.estudiante.update({ where: { id: s.id }, data: { grupo: regla.a + s.grupo.slice(1) } });
      cambiados++;
    }
  }
  res.json({ success: true, data: { cambiados } });
});

module.exports = router;
