import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MUTED, LINE, PAPER, DANGER } from '../constants';

export default function GroupsView({ onSelectGroup, showToast }) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.gruposResumen()
      .then(setGrupos)
      .catch(() => showToast('No se pudo cargar los grupos', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalAlumnos = grupos.reduce((a, g) => a + g.alumnos, 0);

  return (
    <div style={{ padding: '14px 16px' }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Grupos</div>
      <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>{totalAlumnos} estudiantes activos en {grupos.length} grupos</div>
      {loading && <div style={{ fontSize: 13, color: MUTED }}>Cargando...</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {grupos.map((r) => (
          <button key={r.grupo} onClick={() => onSelectGroup(r.grupo)} style={{ textAlign: 'left', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '13px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Grupo {r.grupo}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{r.alumnos} alumnos · {r.conReporte} con reportes</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.pendientes > 0 && <span style={{ background: '#FDEEE8', color: DANGER, fontSize: 11.5, fontWeight: 800, padding: '4px 9px', borderRadius: 999, border: '1px solid #F5C7B3' }}>{r.pendientes} pend.</span>}
              <span style={{ background: PAPER, color: MUTED, fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 999, border: `1px solid ${LINE}` }}>{r.total} total</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
