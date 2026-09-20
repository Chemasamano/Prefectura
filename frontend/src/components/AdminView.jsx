import React, { useState, useEffect } from 'react';
import { Search, Plus, Save, Pencil, Trash2, UploadCloud, ArrowRightLeft, X, UserCog } from 'lucide-react';
import { api } from '../api';
import { ADMIN_COLOR, PRIMARY, MUTED, LINE, PAPER, DANGER, OK } from '../constants';
import { normalize, todayISO } from '../utils';

export default function AdminView({ showToast }) {
  const [tab, setTab] = useState('estudiantes');

  return (
    <div style={{ padding: '14px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
        <UserCog size={18} color={ADMIN_COLOR} />
        <div style={{ fontWeight: 800, fontSize: 16 }}>Administración</div>
      </div>
      <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>Gestión del listado de estudiantes</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: `1px solid ${LINE}` }}>
        {[['estudiantes', 'Estudiantes'], ['importar', 'Importar'], ['promocion', 'Promoción de semestre']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 4px', marginRight: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: tab === id ? ADMIN_COLOR : MUTED, borderBottom: tab === id ? `2.5px solid ${ADMIN_COLOR}` : '2.5px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'estudiantes' && <AdminEstudiantes showToast={showToast} />}
      {tab === 'importar' && <AdminImportar showToast={showToast} />}
      {tab === 'promocion' && <AdminPromocion showToast={showToast} />}
    </div>
  );
}

function AdminEstudiantes({ showToast }) {
  const [q, setQ] = useState('');
  const [mostrarBaja, setMostrarBaja] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editG, setEditG] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const cargar = () => {
    setLoading(true);
    api.listarEstudiantesAdmin(q, mostrarBaja).then(setEstudiantes).catch(() => showToast('No se pudo cargar', 'error')).finally(() => setLoading(false));
  };
  useEffect(cargar, [mostrarBaja]);
  useEffect(() => { const t = setTimeout(cargar, 300); return () => clearTimeout(t); }, [q]);

  async function actualizar(id, cambios) {
    await api.actualizarEstudiante(id, cambios);
    showToast('Estudiante actualizado');
    cargar();
  }
  async function eliminar(id, nombre) {
    if (!window.confirm(`¿Eliminar permanentemente a ${nombre}? Esta acción no se puede deshacer.`)) return;
    await api.eliminarEstudiante(id);
    showToast('Estudiante eliminado');
    cargar();
  }
  async function agregar(data) {
    await api.crearEstudiante(data);
    showToast('Estudiante agregado');
    cargar();
  }

  const startEdit = (s) => { setEditingId(s.id); setEditG(s.grupo); };
  const saveEdit = (s) => { actualizar(s.id, { grupo: editG.trim() }); setEditingId(null); };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} color={MUTED} style={{ position: 'absolute', left: 10, top: 10 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o grupo..."
            style={{ width: '100%', padding: '9px 10px 9px 32px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, boxSizing: 'border-box' }} />
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: ADMIN_COLOR, color: '#fff', border: 'none', borderRadius: 9, padding: '0 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={15} /> Agregar
        </button>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: MUTED, marginBottom: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={mostrarBaja} onChange={(e) => setMostrarBaja(e.target.checked)} /> Mostrar estudiantes dados de baja
      </label>

      {showAddForm && <AddStudentForm onAdd={agregar} onDone={() => setShowAddForm(false)} />}

      {loading && <div style={{ fontSize: 13, color: MUTED }}>Cargando...</div>}
      {!loading && <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{estudiantes.length} estudiantes</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {estudiantes.map((s) => (
          <div key={s.id} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 12px', opacity: s.activo ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nombre}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  {editingId === s.id ? (
                    <>
                      <input value={editG} onChange={(e) => setEditG(e.target.value)} style={{ width: 60, padding: '3px 6px', borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 12 }} />
                      <button onClick={() => saveEdit(s)} style={{ background: OK, color: '#fff', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}><Save size={11} /> Guardar</button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 12, color: MUTED }}>Grupo {s.grupo}</span>
                      <button onClick={() => startEdit(s)} title="Cambiar de grupo" style={{ background: 'none', border: 'none', cursor: 'pointer', color: PRIMARY, padding: 2, display: 'flex' }}><Pencil size={12} /></button>
                      {!s.activo && <span style={{ fontSize: 10.5, color: DANGER, fontWeight: 700 }}>· DADO DE BAJA</span>}
                    </>
                  )}
                </div>
              </div>
              <select value={s.estatus} onChange={(e) => actualizar(s.id, { estatus: e.target.value })} style={{ fontSize: 11, padding: '4px 6px', borderRadius: 6, border: `1px solid ${LINE}`, background: '#fff' }}>
                <option value="regular">Regular</option>
                <option value="recursador">Recursador</option>
                <option value="nuevo_ingreso">Nuevo ingreso</option>
              </select>
              <button onClick={() => actualizar(s.id, { activo: !s.activo })} title={s.activo ? 'Dar de baja' : 'Reactivar'}
                style={{ background: s.activo ? '#FDEEE8' : '#E8F5EE', color: s.activo ? DANGER : OK, border: 'none', borderRadius: 7, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {s.activo ? 'Dar de baja' : 'Reactivar'}
              </button>
              <button onClick={() => eliminar(s.id, s.nombre)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DANGER, padding: 4 }}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddStudentForm({ onAdd, onDone }) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [estatus, setEstatus] = useState('nuevo_ingreso');
  const canSave = nombre.trim().length > 2 && grupo.trim().length > 0;

  return (
    <div style={{ background: '#F4EEFE', border: '1px solid #DCC9FB', borderRadius: 10, padding: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8, color: ADMIN_COLOR }}>Agregar estudiante</div>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={grupo} onChange={(e) => setGrupo(e.target.value)} placeholder="Grupo (ej. 331)" style={{ width: 110, padding: '8px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13 }} />
        <select value={estatus} onChange={(e) => setEstatus(e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13 }}>
          <option value="nuevo_ingreso">Nuevo ingreso</option>
          <option value="recursador">Recursador</option>
          <option value="regular">Regular</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDone} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${LINE}`, background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
        <button disabled={!canSave} onClick={() => { onAdd({ nombre, grupo, estatus }); setNombre(''); setGrupo(''); onDone(); }}
          style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: canSave ? ADMIN_COLOR : '#C9BEE5', color: '#fff', fontSize: 13, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed' }}>
          Guardar
        </button>
      </div>
    </div>
  );
}

function AdminImportar({ showToast }) {
  const [texto, setTexto] = useState('');
  const [estatus, setEstatus] = useState('nuevo_ingreso');
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [existentes, setExistentes] = useState([]);

  useEffect(() => { api.listarEstudiantesAdmin('', false).then(setExistentes).catch(() => {}); }, []);

  function parsearTexto() {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const filas = [];
    for (const linea of lineas) {
      const partes = linea.includes('\t') ? linea.split('\t') : linea.split(',');
      if (partes.length < 2) { filas.push({ raw: linea, valido: false }); continue; }
      const n = partes[0].trim();
      const g = partes[1].trim();
      if (/^(nombre|estudiante)/i.test(n) && /^grupo/i.test(g)) continue;
      if (!n || !g) { filas.push({ raw: linea, valido: false }); continue; }
      const existe = existentes.some((s) => s.activo && normalize(s.nombre) === normalize(n));
      filas.push({ n, g, valido: true, estado: existe ? 'actualiza' : 'nuevo' });
    }
    setPreview(filas);
  }

  async function confirmar() {
    const validas = preview.filter((f) => f.valido).map((f) => ({ n: f.n, g: f.g }));
    if (validas.length === 0) return;
    setImporting(true);
    try {
      const r = await api.importarMasivo(validas, estatus);
      showToast(`Importación completa: ${r.creados} nuevos, ${r.actualizados} actualizados`);
      setTexto(''); setPreview(null);
    } catch (e) {
      showToast('No se pudo importar', 'error');
    } finally {
      setImporting(false);
    }
  }

  const nuevos = preview ? preview.filter((f) => f.valido && f.estado === 'nuevo').length : 0;
  const actualiza = preview ? preview.filter((f) => f.valido && f.estado === 'actualiza').length : 0;
  const invalidas = preview ? preview.filter((f) => !f.valido).length : 0;

  return (
    <div>
      <div style={{ background: '#EAF0FE', border: '1px solid #C7D9FC', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12.5, color: '#1B3A8C' }}>
        <UploadCloud size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
        Copia dos columnas desde Excel (Nombre y Grupo) y pégalas aquí abajo — una fila por estudiante.
        Si un nombre ya existe entre los estudiantes activos, se actualizará su grupo en vez de duplicarlo.
      </div>
      <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Estatus para los estudiantes nuevos</label>
      <select value={estatus} onChange={(e) => setEstatus(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13, marginBottom: 12, width: '100%' }}>
        <option value="nuevo_ingreso">Nuevo ingreso</option>
        <option value="recursador">Recursador</option>
        <option value="regular">Regular</option>
      </select>
      <textarea value={texto} onChange={(e) => { setTexto(e.target.value); setPreview(null); }} rows={7}
        placeholder={'Juan Pérez López\t331\nMaría García Ruiz\t331\n...'}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 12.5, fontFamily: 'monospace', resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }} />
      <button onClick={parsearTexto} disabled={!texto.trim()} style={{ width: '100%', padding: '10px', borderRadius: 9, border: 'none', background: texto.trim() ? ADMIN_COLOR : '#C9BEE5', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: texto.trim() ? 'pointer' : 'not-allowed', marginBottom: 14 }}>
        Vista previa
      </button>

      {preview && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ background: '#E8F5EE', color: OK, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>{nuevos} nuevos</span>
            <span style={{ background: '#EAF0FE', color: '#2554C7', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>{actualiza} actualizarán grupo</span>
            {invalidas > 0 && <span style={{ background: '#FDEEE8', color: DANGER, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>{invalidas} filas inválidas</span>}
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', border: `1px solid ${LINE}`, borderRadius: 9, marginBottom: 12 }}>
            {preview.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', fontSize: 12, borderTop: i ? `1px solid ${LINE}` : 'none', background: !f.valido ? '#FDEEE8' : '#fff' }}>
                {f.valido ? (
                  <>
                    <span>{f.n} <span style={{ color: MUTED }}>· Grupo {f.g}</span></span>
                    <span style={{ color: f.estado === 'nuevo' ? OK : '#2554C7', fontWeight: 700 }}>{f.estado === 'nuevo' ? 'Nuevo' : 'Actualiza'}</span>
                  </>
                ) : <span style={{ color: DANGER }}>Fila inválida: "{f.raw}"</span>}
              </div>
            ))}
          </div>
          <button onClick={confirmar} disabled={importing || (nuevos + actualiza === 0)} style={{ width: '100%', padding: '11px', borderRadius: 9, border: 'none', background: (nuevos + actualiza > 0 && !importing) ? PRIMARY : '#B9C6C1', color: '#fff', fontSize: 14, fontWeight: 700, cursor: (nuevos + actualiza > 0 && !importing) ? 'pointer' : 'not-allowed' }}>
            {importing ? 'Importando...' : `Confirmar importación (${nuevos + actualiza})`}
          </button>
        </div>
      )}
    </div>
  );
}

function AdminPromocion({ showToast }) {
  const [reglas, setReglas] = useState([{ de: '2', a: '3' }, { de: '4', a: '5' }]);
  const [applying, setApplying] = useState(false);
  const [activos, setActivos] = useState([]);

  useEffect(() => { api.listarEstudiantesAdmin('', false).then(setActivos).catch(() => {}); }, []);

  const preview = {};
  for (const s of activos) {
    const regla = reglas.find((r) => r.de && s.grupo[0] === r.de);
    if (regla && regla.a) {
      const nuevoGrupo = regla.a + s.grupo.slice(1);
      const key = `${s.grupo} → ${nuevoGrupo}`;
      preview[key] = (preview[key] || 0) + 1;
    }
  }
  const totalAfectados = Object.values(preview).reduce((a, b) => a + b, 0);

  function updateRegla(i, campo, valor) {
    const nuevas = [...reglas];
    nuevas[i] = { ...nuevas[i], [campo]: valor.replace(/[^0-9]/g, '').slice(0, 1) };
    setReglas(nuevas);
  }
  function agregarRegla() { setReglas([...reglas, { de: '', a: '' }]); }
  function quitarRegla(i) { setReglas(reglas.filter((_, idx) => idx !== i)); }

  async function aplicar() {
    if (!window.confirm(`Esto cambiará el grupo de ${totalAfectados} estudiantes activos. ¿Continuar?`)) return;
    setApplying(true);
    try {
      const r = await api.aplicarPromocion(reglas.filter((r) => r.de && r.a));
      showToast(`Promoción aplicada a ${r.cambiados} estudiantes`);
      api.listarEstudiantesAdmin('', false).then(setActivos);
    } catch (e) {
      showToast('No se pudo aplicar la promoción', 'error');
    } finally {
      setApplying(false);
    }
  }

  return (
    <div>
      <div style={{ background: '#EAF0FE', border: '1px solid #C7D9FC', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12.5, color: '#1B3A8C' }}>
        <ArrowRightLeft size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
        Al iniciar un nuevo semestre, el primer dígito del grupo cambia. Define aquí las reglas de este ciclo y revisa la vista previa antes de aplicar.
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, marginBottom: 8 }}>REGLAS DE PROMOCIÓN</div>
      {reglas.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, color: MUTED }}>Grupos que inician con</span>
          <input value={r.de} onChange={(e) => updateRegla(i, 'de', e.target.value)} maxLength={1} style={{ width: 40, textAlign: 'center', padding: '7px', borderRadius: 7, border: `1px solid ${LINE}`, fontSize: 14, fontWeight: 700 }} />
          <ArrowRightLeft size={13} color={MUTED} />
          <span style={{ fontSize: 12.5, color: MUTED }}>pasan a iniciar con</span>
          <input value={r.a} onChange={(e) => updateRegla(i, 'a', e.target.value)} maxLength={1} style={{ width: 40, textAlign: 'center', padding: '7px', borderRadius: 7, border: `1px solid ${LINE}`, fontSize: 14, fontWeight: 700 }} />
          <button onClick={() => quitarRegla(i)} style={{ background: 'none', border: 'none', color: DANGER, cursor: 'pointer', marginLeft: 'auto' }}><X size={15} /></button>
        </div>
      ))}
      <button onClick={agregarRegla} style={{ background: 'none', border: `1px dashed ${LINE}`, borderRadius: 8, padding: '7px 12px', fontSize: 12.5, color: ADMIN_COLOR, cursor: 'pointer', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Plus size={13} /> Agregar otra regla
      </button>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, marginBottom: 8 }}>VISTA PREVIA</div>
      {totalAfectados === 0 ? (
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>Ningún estudiante activo coincide con estas reglas todavía.</div>
      ) : (
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 9, marginBottom: 18, overflow: 'hidden' }}>
          {Object.entries(preview).map(([k, count], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', fontSize: 13, borderTop: i ? `1px solid ${LINE}` : 'none' }}>
              <span style={{ fontWeight: 600 }}>{k}</span>
              <span style={{ color: MUTED }}>{count} estudiante{count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={aplicar} disabled={totalAfectados === 0 || applying}
        style={{ width: '100%', padding: '12px', borderRadius: 9, border: 'none', background: (totalAfectados > 0 && !applying) ? ADMIN_COLOR : '#C9BEE5', color: '#fff', fontSize: 14, fontWeight: 700, cursor: (totalAfectados > 0 && !applying) ? 'pointer' : 'not-allowed' }}>
        {applying ? 'Aplicando...' : `Aplicar promoción a ${totalAfectados} estudiantes`}
      </button>
    </div>
  );
}
