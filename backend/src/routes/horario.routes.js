const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');
const { dayKeyFromDate, resolverHorarioActual, calcularEstadoTodosLosGrupos } = require('../utils/horario');
const { esSinDocente } = require('../utils/sinDocente');

const router = express.Router();

function momentoActual(req) {
  const dia = req.query.dia || dayKeyFromDate(new Date());
  const hora = req.query.hora || (() => {
    const n = new Date();
    return `${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`;
  })();
  return { dia, hora };
}

router.get('/grupos', requireAuth, async (req, res) => {
  const grupos = await prisma.sesion.findMany({ select: { grupo: true }, distinct: ['grupo'] });
  const lista = grupos.map((g) => g.grupo).sort((a, b) => Number(a) - Number(b));
  res.json({ success: true, data: lista });
});

router.get('/ahora', requireAuth, async (req, res) => {
  const { grupo } = req.query;
  if (!grupo) return res.status(400).json({ success: false, message: 'Falta el parámetro grupo' });
  const { dia, hora } = momentoActual(req);
  const estado = await resolverHorarioActual(grupo, dia, hora);
  res.json({ success: true, data: { dia, hora, ...estado } });
});

router.get('/dia', requireAuth, async (req, res) => {
  const { grupo, dia } = req.query;
  if (!grupo || !dia) return res.status(400).json({ success: false, message: 'Faltan parámetros' });
  const sesiones = await prisma.sesion.findMany({ where: { grupo, dia }, orderBy: { modulo: 'asc' } });
  res.json({ success: true, data: sesiones });
});

router.get('/todos', requireAuth, async (req, res) => {
  const { dia, hora } = momentoActual(req);
  const estado = await calcularEstadoTodosLosGrupos(dia, hora);
  res.json({ success: true, data: { dia, hora, estado } });
});

router.get('/profesores', requireAuth, async (req, res) => {
  const sesiones = await prisma.sesion.findMany({ select: { profesor: true }, distinct: ['profesor'] });
  const reales = sesiones.map((s) => s.profesor).filter((p) => !esSinDocente(p)).sort((a, b) => a.localeCompare(b));
  res.json({ success: true, data: reales });
});

router.get('/aulas', requireAuth, async (req, res) => {
  const sesiones = await prisma.sesion.findMany({ select: { aula: true }, distinct: ['aula'] });
  const aulas = sesiones.map((s) => s.aula).filter(Boolean).sort((a, b) => a.localeCompare(b));
  res.json({ success: true, data: aulas });
});

module.exports = router;
