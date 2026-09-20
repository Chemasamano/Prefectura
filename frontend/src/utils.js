export function normalize(str) {
  return (str || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
export function formatDateDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
export function dayKeyFromDate(date) {
  const idx = date.getDay();
  return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][idx];
}
const SIN_DOCENTE_RE = /^(INTERINO\d*|INT\d{0,1}\.?)(\s|$)/i;
export function esSinDocente(profesor) {
  const p = (profesor || '').trim();
  if (!p) return true;
  if (SIN_DOCENTE_RE.test(p)) return true;
  if (p.toUpperCase() === 'TEC. CLÍNICAS I') return true;
  return false;
}
export function displayProfesor(profesor) {
  return esSinDocente(profesor) ? 'Sin docente' : profesor;
}
