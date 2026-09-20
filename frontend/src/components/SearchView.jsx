import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { MUTED, LINE, PRIMARY, DANGER, OK } from '../constants';

export default function SearchView({ onOpen, initialGroup, clearInitialGroup, showToast }) {
  const [q, setQ] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState(initialGroup || '');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (initialGroup) { setGrupoFiltro(initialGroup); clearInitialGroup(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGroup]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 3 && !grupoFiltro) { setResultados([]); return; }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await api.buscarEstudiantes(q.trim(), grupoFiltro);
        setResultados(data);
      } catch (e) {
        showToast('No se pudo buscar', 'error');
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, grupoFiltro]);

  const puedeVerResultados = q.trim().length >= 3 || grupoFiltro;

  return (
    <div style={{ padding: '14px 16px 8px' }}>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={17} color={MUTED} style={{ position: 'absolute', left: 12, top: 12 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Escribe al menos 3 letras del nombre..."
          style={{ width: '100%', padding: '11px 12px 11px 36px', borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14.5, background: '#fff', boxSizing: 'border-box' }} />
      </div>

      {!puedeVerResultados && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#EAF0FE', border: '1px solid #C7D9FC', borderRadius: 10, padding: '11px 13px', fontSize: 12.5, color: '#1B3A8C', marginBottom: 10 }}>
          <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          Por protección de datos del alumnado, aquí no se muestra un listado general — busca por nombre (mín. 3 letras) o filtra por grupo.
        </div>
      )}

      <GruposFiltroChips grupoFiltro={grupoFiltro} setGrupoFiltro={setGrupoFiltro} />

      {buscando && <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 8 }}>Buscando...</div>}
      {puedeVerResultados && !buscando && <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{resultados.length} resultado{resultados.length !== 1 ? 's' : ''}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {puedeVerResultados && !buscando && resultados.length === 0 && (
          <div style={{ textAlign: 'center', color: MUTED, padding: '30px 0', fontSize: 13.5 }}>Sin resultados para tu búsqueda.</div>
        )}
        {resultados.map((s) => (
          <button key={s.id} onClick={() => onOpen(s.id)} style={{ textAlign: 'left', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nombre}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Grupo {s.grupo}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {s.totalReportes === 0 ? (
                <span style={{ fontSize: 11, color: '#A3ABB2' }}>Sin reportes</span>
              ) : s.pendientes > 0 ? (
                <span style={{ background: '#FDEEE8', color: DANGER, fontSize: 11.5, fontWeight: 800, padding: '4px 9px', borderRadius: 999, border: '1px solid #F5C7B3' }}>{s.pendientes} pend.</span>
              ) : (
                <span style={{ background: '#E8F5EE', color: OK, fontSize: 11.5, fontWeight: 800, padding: '4px 9px', borderRadius: 999, border: '1px solid #BFE3CE' }}>{s.totalReportes} resuelto{s.totalReportes > 1 ? 's' : ''}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GruposFiltroChips({ grupoFiltro, setGrupoFiltro }) {
  const [grupos, setGrupos] = useState([]);
  useEffect(() => {
    api.gruposResumen().then((data) => setGrupos(data.map((g) => g.grupo))).catch(() => {});
  }, []);
  if (grupos.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
      <button onClick={() => setGrupoFiltro('')} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, border: `1px solid ${grupoFiltro === '' ? PRIMARY : LINE}`, background: grupoFiltro === '' ? PRIMARY : '#fff', color: grupoFiltro === '' ? '#fff' : '#1C2430', cursor: 'pointer' }}>
        Sin filtro de grupo
      </button>
      {grupos.map((g) => (
        <button key={g} onClick={() => setGrupoFiltro(g === grupoFiltro ? '' : g)} style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, border: `1px solid ${grupoFiltro === g ? PRIMARY : LINE}`, background: grupoFiltro === g ? PRIMARY : '#fff', color: grupoFiltro === g ? '#fff' : '#1C2430', cursor: 'pointer' }}>
          {g}
        </button>
      ))}
    </div>
  );
}
