const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/** POST /api/reportes — el prefecto se toma de la sesión, no de un texto libre */
router.post('/', requireAuth, async (req, res) => {
  const { estudianteId, tipos, fecha, notas } = req.body || {};
  if (!estudianteId || !Array.isArray(tipos) || tipos.length === 0 || !fecha) {
    return res.status(400).json({ success: false, message: 'Faltan datos del reporte' });
  }
  const estudiante = await prisma.estudiante.findUnique({ where: { id: estudianteId } });
  if (!estudiante) return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });

  const nuevo = await prisma.reporte.create({
    data: {
      estudianteId, tipos: JSON.stringify(tipos), fecha, notas: notas || '',
      prefecto: req.user.nombre, resuelto: false,
    },
  });
  res.status(201).json({ success: true, data: { ...nuevo, tipos: JSON.parse(nuevo.tipos) } });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const { resuelto } = req.body || {};
  const cambios = {};
  if (typeof resuelto === 'boolean') {
    cambios.resuelto = resuelto;
    cambios.resolvedAt = resuelto ? new Date() : null;
  }
  const actualizado = await prisma.reporte.update({ where: { id: req.params.id }, data: cambios });
  res.json({ success: true, data: { ...actualizado, tipos: JSON.parse(actualizado.tipos) } });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.reporte.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

/** GET /api/reportes/resumen — para publicar al cierre del semestre (requiere sesión) */
router.get('/resumen', requireAuth, async (req, res) => {
  const { grupo, minReportes, sortDesc } = req.query;
  const min = Number(minReportes || 1);

  const estudiantes = await prisma.estudiante.findMany({
    where: { activo: true, ...(grupo ? { grupo } : {}) },
    include: { reportes: true },
  });

  let filas = estudiantes.map((s) => {
    const pendientes = s.reportes.filter((r) => !r.resuelto).length;
    const tipos = Array.from(new Set(s.reportes.flatMap((r) => JSON.parse(r.tipos))));
    const ultima = s.reportes.map((r) => r.fecha).sort().reverse()[0] || null;
    return { id: s.id, nombre: s.nombre, grupo: s.grupo, total: s.reportes.length, pendientes, tipos, ultima };
  }).filter((f) => f.total >= min);

  const desc = sortDesc !== 'false';
  filas.sort((a, b) => (desc ? b.total - a.total : a.total - b.total) || a.nombre.localeCompare(b.nombre));

  const totales = {
    totalReportes: estudiantes.reduce((acc, s) => acc + s.reportes.length, 0),
    totalPendientes: estudiantes.reduce((acc, s) => acc + s.reportes.filter((r) => !r.resuelto).length, 0),
    estudiantesConReporte: estudiantes.filter((s) => s.reportes.length > 0).length,
  };

  res.json({ success: true, data: { filas, totales } });
});

module.exports = router;
