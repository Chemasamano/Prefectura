const prisma = require('../db');

const RECESOS = [
  { inicio: '9:30', fin: '10:00', label: 'Receso matutino' },
  { inicio: '16:40', fin: '17:00', label: 'Receso vespertino' },
];
const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function dayKeyFromDate(date) {
  const idx = date.getDay();
  return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][idx];
}

/**
 * Dado un grupo y un momento (día + hora "H:MM"), determina qué está
 * pasando: una clase en curso, un receso, o que no hay horario/clase.
 */
async function resolverHorarioActual(grupo, dayKey, horaStr) {
  const minutos = timeToMinutes(horaStr);

  if (dayKey === 'Sabado' || dayKey === 'Domingo') {
    return { estado: 'fin_de_semana' };
  }

  const totalSesionesGrupo = await prisma.sesion.count({ where: { grupo } });
  if (totalSesionesGrupo === 0) {
    return { estado: 'sin_horario' };
  }

  for (const r of RECESOS) {
    if (minutos >= timeToMinutes(r.inicio) && minutos < timeToMinutes(r.fin)) {
      return { estado: 'receso', label: r.label };
    }
  }

  const sesionesDia = await prisma.sesion.findMany({ where: { grupo, dia: dayKey }, orderBy: { modulo: 'asc' } });
  for (const s of sesionesDia) {
    if (minutos >= timeToMinutes(s.inicio) && minutos < timeToMinutes(s.fin)) {
      return { estado: 'clase', sesion: s };
    }
  }

  return { estado: 'sin_clase' };
}

/** Calcula, para TODOS los grupos con horario, qué está pasando ahora mismo. */
async function calcularEstadoTodosLosGrupos(dayKey, horaStr) {
  const grupos = await prisma.sesion.findMany({ select: { grupo: true }, distinct: ['grupo'] });
  const resultado = {};
  for (const { grupo } of grupos) {
    resultado[grupo] = await resolverHorarioActual(grupo, dayKey, horaStr);
  }
  return resultado;
}

module.exports = { RECESOS, DIAS, timeToMinutes, dayKeyFromDate, resolverHorarioActual, calcularEstadoTodosLosGrupos };
