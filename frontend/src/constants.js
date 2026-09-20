export const INCIDENT_TYPES = [
  { id: 'pantalon', label: 'Pantalón no oficial', cat: 'uniforme' },
  { id: 'playera', label: 'Playera no oficial', cat: 'uniforme' },
  { id: 'sueter', label: 'Suéter no oficial', cat: 'uniforme' },
  { id: 'calzado', label: 'Sin zapato de vestir', cat: 'uniforme' },
  { id: 'cabello', label: 'Corte de cabello fuera de reglamento', cat: 'presentacion' },
  { id: 'maquillaje', label: 'Exceso de maquillaje', cat: 'presentacion' },
  { id: 'afecto', label: 'Muestras de afecto excesivas', cat: 'conducta' },
  { id: 'mobiliario', label: 'Daños a mobiliario o equipo', cat: 'conducta' },
  { id: 'pelea', label: 'Riña / pelea', cat: 'conducta' },
  { id: 'otro', label: 'Otro', cat: 'otro' },
];
export const TYPE_BY_ID = Object.fromEntries(INCIDENT_TYPES.map((t) => [t.id, t]));

export const CAT_META = {
  uniforme: { label: 'Uniforme', color: '#2554C7', bg: '#EAF0FE', border: '#C7D9FC' },
  presentacion: { label: 'Presentación personal', color: '#7C3AED', bg: '#F4EEFE', border: '#DCC9FB' },
  conducta: { label: 'Conducta', color: '#C2340B', bg: '#FDEEE8', border: '#F5C7B3' },
  otro: { label: 'Otro', color: '#52606D', bg: '#F1F3F5', border: '#D6DBE0' },
};

export const ESTATUS_META = {
  regular: { label: 'Regular', color: '#2554C7', bg: '#EAF0FE' },
  recursador: { label: 'Recursador', color: '#B45309', bg: '#FEF3E2' },
  nuevo_ingreso: { label: 'Nuevo ingreso', color: '#1A7A45', bg: '#E8F5EE' },
};

export const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
export const DIAS_LABEL = { Lunes: 'Lunes', Martes: 'Martes', Miercoles: 'Miércoles', Jueves: 'Jueves', Viernes: 'Viernes' };

export const INK = '#1C2430';
export const MUTED = '#66707C';
export const LINE = '#E3E6EA';
export const PAPER = '#F6F7F8';
export const PRIMARY = '#A6192E';
export const PRIMARY_DARK2 = '#7D1322';
export const BRAND_RED = '#FF0000';
export const DANGER = '#C2340B';
export const OK = '#1A7A45';
export const ADMIN_COLOR = '#6D3FBF';
