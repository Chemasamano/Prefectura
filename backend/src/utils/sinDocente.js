/**
 * Algunas materias, en los horarios originales, no tienen un docente
 * específico asignado: aparecen con placeholders genéricos ("INT.",
 * "INT2", "INTERINO3", etc.) o repiten el nombre de la materia como si
 * fuera el profesor ("TEC. CLÍNICAS I"). Esta función detecta esos casos
 * para que el frontend muestre la leyenda "Sin docente".
 */
const SIN_DOCENTE_RE = /^(INTERINO\d*|INT\d{0,1}\.?)(\s|$)/i;

function esSinDocente(profesor) {
  const p = (profesor || '').trim();
  if (!p) return true;
  if (SIN_DOCENTE_RE.test(p)) return true;
  if (p.toUpperCase() === 'TEC. CLÍNICAS I') return true;
  return false;
}

function displayProfesor(profesor) {
  return esSinDocente(profesor) ? 'Sin docente' : profesor;
}

module.exports = { esSinDocente, displayProfesor };
