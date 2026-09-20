const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('bitacora_token');
}
export function setSession(token, usuario) {
  localStorage.setItem('bitacora_token', token);
  localStorage.setItem('bitacora_usuario', JSON.stringify(usuario));
}
export function clearSession() {
  localStorage.removeItem('bitacora_token');
  localStorage.removeItem('bitacora_usuario');
}
export function getSession() {
  const token = getToken();
  const raw = localStorage.getItem('bitacora_usuario');
  if (!token || !raw) return null;
  try { return { token, usuario: JSON.parse(raw) }; } catch { return null; }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({ success: false, message: 'Respuesta inválida del servidor' }));

  if (res.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error('Sesión expirada');
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Error en la solicitud');
  }
  return json.data;
}

export const api = {
  login: (usuario, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ usuario, password }) }),

  buscarEstudiantes: (q, grupo) => request(`/estudiantes/buscar?q=${encodeURIComponent(q || '')}${grupo ? `&grupo=${grupo}` : ''}`),
  gruposResumen: () => request('/estudiantes/grupos-resumen'),
  obtenerEstudiante: (id) => request(`/estudiantes/${id}`),

  listarEstudiantesAdmin: (q, mostrarBaja) => request(`/estudiantes?q=${encodeURIComponent(q || '')}&mostrarBaja=${!!mostrarBaja}`),
  crearEstudiante: (data) => request('/estudiantes', { method: 'POST', body: JSON.stringify(data) }),
  actualizarEstudiante: (id, data) => request(`/estudiantes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarEstudiante: (id) => request(`/estudiantes/${id}`, { method: 'DELETE' }),
  importarMasivo: (filas, estatus) => request('/estudiantes/importar-masivo', { method: 'POST', body: JSON.stringify({ filas, estatus }) }),
  aplicarPromocion: (reglas) => request('/estudiantes/promocion', { method: 'POST', body: JSON.stringify({ reglas }) }),

  crearReporte: (data) => request('/reportes', { method: 'POST', body: JSON.stringify(data) }),
  actualizarReporte: (id, data) => request(`/reportes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  eliminarReporte: (id) => request(`/reportes/${id}`, { method: 'DELETE' }),
  resumen: (params) => request(`/reportes/resumen?${new URLSearchParams(params).toString()}`),

  horarioGrupos: () => request('/horario/grupos'),
  horarioAhora: (grupo, dia, hora) => request(`/horario/ahora?grupo=${grupo}${dia ? `&dia=${dia}` : ''}${hora ? `&hora=${hora}` : ''}`),
  horarioDia: (grupo, dia) => request(`/horario/dia?grupo=${grupo}&dia=${dia}`),
  horarioTodos: (dia, hora) => request(`/horario/todos?${dia ? `dia=${dia}&` : ''}${hora ? `hora=${hora}` : ''}`),
  horarioProfesores: () => request('/horario/profesores'),
  horarioAulas: () => request('/horario/aulas'),
};
