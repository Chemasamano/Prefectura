import React, { useState, useEffect } from 'react';
import { Download, Printer, Filter as FilterIcon } from 'lucide-react';
import { api } from '../api';
import { StatBox, CategoryChip } from './Shared';
import { TYPE_BY_ID, MUTED, LINE, PAPER, PRIMARY, DANGER, INK } from '../constants';
import { formatDateDisplay, todayISO } from '../utils';

export default function SummaryView({ showToast }) {
  const [grupos, setGrupos] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [minReportes, setMinReportes] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);
  const [filas, setFilas] = useState([]);
  const [totales, setTotales] = useState({ totalReportes: 0, totalPendientes: 0, estudiantesConReporte: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.gruposResumen().then((data) => setGrupos(data.map((g) => g.grupo))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.resumen({ grupo, minReportes, sortDesc })
      .then((data) => { setFilas(data.filas); setTotales(data.totales); })
      .catch(() => showToast('No se pudo cargar el resumen', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupo, minReportes, sortDesc]);

  function downloadCSV() {
    const header = ['Estudiante', 'Grupo', 'Total reportes', 'Pendientes', 'Tipos de incidencia', 'Último reporte'];
    const lines = [header.join(',')];
    filas.forEach((r) => {
      const tiposTxt = r.tipos.map((t) => TYPE_BY_ID[t]?.label || t).join(' | ');
      const vals = [r.nombre, r.grupo, r.total, r.pendientes, tiposTxt, r.ultima ? formatDateDisplay(r.ultima) : ''];
      lines.push(vals.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });
    const csv = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reporte_conducta_${todayISO()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: '14px 16px 8px' }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Resumen general</div>
      <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 12 }}>Para publicar al cierre del semestre</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        <StatBox label="Reportes totales" value={totales.totalReportes} />
        <StatBox label="Pendientes" value={totales.totalPendientes} color={totales.totalPendientes > 0 ? DANGER : undefined} />
        <StatBox label="Estudiantes con reporte" value={totales.estudiantesConReporte} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <select value={grupo} onChange={(e) => setGrupo(e.target.value)} style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12.5, background: '#fff' }}>
          <option value="">Todos los grupos</option>
          {grupos.map((g) => <option key={g} value={g}>Grupo {g}</option>)}
        </select>
        <select value={minReportes} onChange={(e) => setMinReportes(Number(e.target.value))} style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12.5, background: '#fff' }}>
          <option value={1}>1 o más reportes</option>
          <option value={2}>2 o más reportes</option>
          <option value={3}>3 o más reportes</option>
          <option value={5}>5 o más reportes</option>
        </select>
        <button onClick={() => setSortDesc(!sortDesc)} style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12.5, background: '#fff', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <FilterIcon size={12} /> {sortDesc ? 'Mayor a menor' : 'Menor a mayor'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={downloadCSV} style={{ flex: 1, background: PRIMARY, color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
          <Download size={14} /> Descargar CSV
        </button>
        <button onClick={() => window.print()} style={{ flex: 1, background: '#fff', color: INK, border: `1px solid ${LINE}`, borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
          <Printer size={14} /> Imprimir
        </button>
      </div>

      {loading && <div style={{ fontSize: 13, color: MUTED }}>Cargando...</div>}
      {!loading && <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{filas.length} resultado{filas.length !== 1 ? 's' : ''}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!loading && filas.length === 0 && <div style={{ textAlign: 'center', color: MUTED, padding: '40px 0', fontSize: 13.5 }}>Sin estudiantes que cumplan el filtro.</div>}
        {filas.map((r) => (
          <div key={r.id} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.nombre}</div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>Grupo {r.grupo} · último: {r.ultima ? formatDateDisplay(r.ultima) : '—'}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <span style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 999, padding: '3px 9px', fontSize: 11.5, fontWeight: 800 }}>{r.total}</span>
                {r.pendientes > 0 && <span style={{ background: '#FDEEE8', color: DANGER, border: '1px solid #F5C7B3', borderRadius: 999, padding: '3px 9px', fontSize: 11.5, fontWeight: 800 }}>{r.pendientes} pend.</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {r.tipos.map((t) => <CategoryChip key={t} catId={TYPE_BY_ID[t]?.cat} small />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
