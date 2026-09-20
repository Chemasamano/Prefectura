import React from 'react';
import { CircleAlert, CircleCheck, User, MapPin, Clock } from 'lucide-react';
import { CAT_META, ESTATUS_META, INK, MUTED, LINE, DANGER, OK, PRIMARY } from '../constants';
import { displayProfesor, esSinDocente } from '../utils';

export function Toast({ message, type }) {
  if (!message) return null;
  const bg = type === 'error' ? '#FDEEE8' : '#E8F5EE';
  const fg = type === 'error' ? DANGER : OK;
  const border = type === 'error' ? '#F5C7B3' : '#BFE3CE';
  return (
    <div style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', background: bg, color: fg, border: `1px solid ${border}`, padding: '10px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, zIndex: 300, boxShadow: '0 6px 20px rgba(0,0,0,0.12)', maxWidth: '90vw', textAlign: 'center' }}>
      {message}
    </div>
  );
}

export function CategoryChip({ catId, small }) {
  const m = CAT_META[catId] || CAT_META.otro;
  return (
    <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontSize: small ? 10.5 : 11.5, fontWeight: 700, padding: small ? '2px 7px' : '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

export function EstatusChip({ estatus }) {
  const m = ESTATUS_META[estatus] || ESTATUS_META.regular;
  return <span style={{ background: m.bg, color: m.color, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{m.label}</span>;
}

export function StatusPill({ resuelto }) {
  return resuelto ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E8F5EE', color: OK, border: '1px solid #BFE3CE', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
      <CircleCheck size={12} /> Resuelto
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FDEEE8', color: DANGER, border: '1px solid #F5C7B3', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
      <CircleAlert size={12} /> Pendiente
    </span>
  );
}

export function StatBox({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || INK }}>{value}</div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 2, lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

/** Tarjeta de estado de horario (materia/profesor/aula o receso/sin clase) */
export function EstadoHorarioCard({ estado }) {
  if (!estado) return null;
  if (estado.estado === 'fin_de_semana') return <div style={{ fontSize: 13, color: MUTED }}>No hay clases (fin de semana).</div>;
  if (estado.estado === 'sin_horario') return <div style={{ fontSize: 13, color: MUTED }}>Sin horario cargado para este grupo.</div>;
  if (estado.estado === 'sin_clase') return <div style={{ fontSize: 13, color: MUTED }}>Sin clase programada en este momento.</div>;
  if (estado.estado === 'receso') return (
    <div style={{ background: '#FFF7E8', border: '1px solid #F5DFA8', borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#8A5A12', fontWeight: 600 }}>
      En {estado.label.toLowerCase()}.
    </div>
  );
  const s = estado.sesion;
  const sinDoc = esSinDocente(s.profesor);
  return (
    <div style={{ background: '#E8F5EE', border: '1px solid #BFE3CE', borderRadius: 9, padding: '11px 13px' }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{s.materia}</div>
      <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: sinDoc ? '#B45309' : '#1A7A45', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: sinDoc ? 700 : 400 }}><User size={12} /> {displayProfesor(s.profesor)}</span>
        {s.aula && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {s.aula}</span>}
        <span>{s.inicio} - {s.fin}</span>
      </div>
    </div>
  );
}
