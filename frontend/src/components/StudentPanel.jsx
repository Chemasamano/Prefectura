import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Check, Calendar, Trash2 } from 'lucide-react';
import { api } from '../api';
import { StatBox, CategoryChip, StatusPill, EstatusChip, EstadoHorarioCard } from './Shared';
import { INCIDENT_TYPES, TYPE_BY_ID, CAT_META, PRIMARY, PRIMARY_DARK2, PAPER, MUTED, LINE, DANGER } from '../constants';
import { todayISO, formatDateDisplay, dayKeyFromDate } from '../utils';
import { DIAS, DIAS_LABEL } from '../constants';

export default function StudentPanel({ studentId, onClose, showToast }) {
  const [estudiante, setEstudiante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const cargar = () => {
    setLoading(true);
    api.obtenerEstudiante(studentId).then(setEstudiante).catch(() => showToast('No se pudo cargar el estudiante', 'error')).finally(() => setLoading(false));
  };
  useEffect(cargar, [studentId]);

  async function handleAddReport(payload) {
    await api.crearReporte(payload);
    showToast('Reporte guardado');
    setShowForm(false);
    cargar();
  }
  async function toggleResuelto(id, next) {
    await api.actualizarReporte(id, { resuelto: next });
    showToast(next ? 'Marcado como resuelto' : 'Marcado como pendiente');
    cargar();
  }
  async function eliminarReporte(id) {
    await api.eliminarReporte(id);
    showToast('Reporte eliminado');
    cargar();
  }

  if (loading || !estudiante) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: PAPER, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: MUTED }}>Cargando...</div>
      </div>
    );
  }

  const pendientes = estudiante.reportes.filter((r) => !r.resuelto).length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: PAPER, zIndex: 100, overflowY: 'auto' }}>
      <div style={{ background: `linear-gradient(155deg, ${PRIMARY} 0%, ${PRIMARY_DARK2} 100%)`, color: '#fff', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 5 }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#fff', borderRadius: 8, padding: 7, cursor: 'pointer', marginBottom: 10 }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25 }}>{estudiante.nombre}</div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', marginTop: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
          Grupo {estudiante.grupo}
          {estudiante.estatus && estudiante.estatus !== 'regular' && <EstatusChip estatus={estudiante.estatus} />}
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <StatBox label="Reportes totales" value={estudiante.reportes.length} />
          <StatBox label="Pendientes" value={pendientes} color={pendientes > 0 ? DANGER : undefined} />
        </div>

        <HorarioAhoraCard grupo={estudiante.grupo} />

        <button onClick={() => setShowForm(true)} style={{ width: '100%', background: PRIMARY, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', marginBottom: 18 }}>
          <Plus size={16} /> Nuevo reporte
        </button>

        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8, color: MUTED }}>HISTORIAL</div>
        {estudiante.reportes.length === 0 && <div style={{ textAlign: 'center', color: MUTED, padding: '30px 0', fontSize: 13 }}>Sin reportes registrados.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {estudiante.reportes.map((r) => (
            <div key={r.id} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '12px 13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: MUTED }}><Calendar size={12} /> {formatDateDisplay(r.fecha)}</div>
                <StatusPill resuelto={r.resuelto} />
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0' }}>
                {r.tipos.map((t) => <CategoryChip key={t} catId={TYPE_BY_ID[t]?.cat} />)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: r.notas ? 4 : 0 }}>{r.tipos.map((t) => TYPE_BY_ID[t]?.label || t).join(' · ')}</div>
              {r.notas && <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 6 }}>{r.notas}</div>}
              <div style={{ fontSize: 11, color: '#A3ABB2', marginBottom: 8 }}>Registró: {r.prefecto}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleResuelto(r.id, !r.resuelto)} style={{ flex: 1, fontSize: 12, fontWeight: 700, padding: '7px', borderRadius: 7, border: `1px solid ${LINE}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Check size={12} /> {r.resuelto ? 'Marcar pendiente' : 'Marcar resuelto'}
                </button>
                <button onClick={() => { if (window.confirm('¿Eliminar este reporte?')) eliminarReporte(r.id); }} style={{ padding: '7px 10px', borderRadius: 7, border: `1px solid ${LINE}`, background: '#fff', cursor: 'pointer', color: DANGER }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <NewReportForm studentId={studentId} onCancel={() => setShowForm(false)} onSave={handleAddReport} />}
    </div>
  );
}

function HorarioAhoraCard({ grupo }) {
  const [override, setOverride] = useState(null);
  const [estado, setEstado] = useState(null);
  const [sesionesDia, setSesionesDia] = useState([]);

  const now = new Date();
  const dia = override ? override.dia : dayKeyFromDate(now);
  const hora = override ? override.hora : `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  useEffect(() => {
    api.horarioAhora(grupo, dia, hora).then(setEstado).catch(() => {});
  }, [grupo, dia, hora]);

  useEffect(() => {
    api.horarioDia(grupo, dia).then(setSesionesDia).catch(() => {});
  }, [grupo, dia]);

  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '14px 15px', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5 }}>Horario {override ? 'consultado' : 'en este momento'}</div>
        {!override && dia !== 'Sabado' && dia !== 'Domingo' && <span style={{ fontSize: 11, color: MUTED }}>{DIAS_LABEL[dia] || dia} {hora}</span>}
      </div>

      <EstadoHorarioCard estado={estado} />

      <details style={{ marginTop: 10 }}>
        <summary style={{ fontSize: 12, color: PRIMARY, cursor: 'pointer', fontWeight: 600 }}>Consultar otro día u hora / ver el día completo</summary>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {DIAS.map((d) => (
              <button key={d} onClick={() => setOverride({ dia: d, hora: override?.dia === d ? override.hora : '8:00' })}
                style={{ padding: '5px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, border: `1px solid ${(override?.dia || dia) === d ? PRIMARY : LINE}`, background: (override?.dia || dia) === d ? PRIMARY : '#fff', color: (override?.dia || dia) === d ? '#fff' : '#1C2430', cursor: 'pointer' }}>
                {DIAS_LABEL[d]}
              </button>
            ))}
            {override && <button onClick={() => setOverride(null)} style={{ padding: '5px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, border: `1px solid ${LINE}`, background: '#fff', color: MUTED, cursor: 'pointer' }}>Volver a "ahora"</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sesionesDia.length === 0 && <div style={{ fontSize: 12, color: MUTED }}>Sin sesiones registradas ese día.</div>}
            {sesionesDia.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, padding: '5px 0', borderBottom: i < sesionesDia.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                <span style={{ minWidth: 78, color: MUTED }}>{s.inicio}-{s.fin}</span>
                <span style={{ flex: 1 }}><strong>{s.materia}</strong> · {s.profesor}{s.aula ? ` · ${s.aula}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

function NewReportForm({ studentId, onCancel, onSave }) {
  const [selected, setSelected] = useState([]);
  const [fecha, setFecha] = useState(todayISO());
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleType = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const needsNotes = selected.includes('otro');
  const canSave = selected.length > 0 && (!needsNotes || notas.trim().length >= 3) && !saving;
  const categories = ['uniforme', 'presentacion', 'conducta', 'otro'];

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({ estudianteId: studentId, tipos: selected, fecha, notas });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,25,0.45)', zIndex: 150, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', width: '100%', maxHeight: '88vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Nuevo reporte</div>
          <button onClick={onCancel} style={{ background: PAPER, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, marginBottom: 8 }}>TIPO DE INCIDENCIA (puedes elegir varias)</div>
        {categories.map((catId) => (
          <div key={catId} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: CAT_META[catId].color, marginBottom: 6 }}>{CAT_META[catId].label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {INCIDENT_TYPES.filter((t) => t.cat === catId).map((t) => {
                const active = selected.includes(t.id);
                const m = CAT_META[t.cat];
                return (
                  <button key={t.id} onClick={() => toggleType(t.id)} style={{ padding: '8px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${active ? m.color : LINE}`, background: active ? m.bg : '#fff', color: active ? m.color : '#1C2430' }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 6, marginBottom: 12 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>FECHA DE LA INCIDENCIA</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>NOTAS {needsNotes ? '(requerido para "Otro")' : '(opcional)'}</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} placeholder={needsNotes ? 'Describe brevemente la incidencia...' : 'Detalles adicionales...'}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: 9, border: `1px solid ${LINE}`, background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={!canSave} style={{ flex: 1.4, padding: '12px', borderRadius: 9, border: 'none', background: canSave ? PRIMARY : '#C9AAB0', color: '#fff', fontSize: 14, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed' }}>
            {saving ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
