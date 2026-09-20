import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, User, MapPin } from 'lucide-react';
import { api } from '../api';
import { StatBox, EstadoHorarioCard } from './Shared';
import { DIAS, DIAS_LABEL, MUTED, LINE, PRIMARY, DANGER, OK } from '../constants';
import { normalize, dayKeyFromDate, displayProfesor } from '../utils';

function DayTimePicker({ override, setOverride, dia, hora }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {DIAS.map((d) => (
          <button key={d} onClick={() => setOverride({ dia: d, hora: override?.dia === d ? override.hora : hora })}
            style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 700, border: `1px solid ${dia === d ? PRIMARY : LINE}`, background: dia === d ? PRIMARY : '#fff', color: dia === d ? '#fff' : '#1C2430', cursor: 'pointer' }}>
            {DIAS_LABEL[d]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <input type="time" value={hora.length === 4 ? '0' + hora : hora} onChange={(e) => setOverride({ dia, hora: e.target.value })}
          style={{ padding: '6px 9px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13 }} />
        {override && <button onClick={() => setOverride(null)} style={{ fontSize: 11.5, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Volver a "ahora mismo"</button>}
      </div>
    </div>
  );
}

export default function LiveView({ showToast }) {
  const [tab, setTab] = useState('grupo');
  const [override, setOverride] = useState(null);
  const [tick, setTick] = useState(0);
  const [estadoTodos, setEstadoTodos] = useState({});
  const [gruposSchedule, setGruposSchedule] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const dia = override ? override.dia : dayKeyFromDate(now);
  const hora = override ? override.hora : `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  useEffect(() => {
    api.horarioGrupos().then(setGruposSchedule).catch(() => {});
  }, []);

  useEffect(() => {
    api.horarioTodos(dia, hora).then((r) => setEstadoTodos(r.estado)).catch(() => showToast('No se pudo cargar el estado de los grupos', 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, hora, tick]);

  return (
    <div style={{ padding: '14px 16px 8px' }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>En vivo</div>
      <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 14 }}>Ubicación de grupos, maestros y aulas en tiempo real</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: `1px solid ${LINE}` }}>
        {[['grupo', 'Por grupo'], ['maestro', 'Por maestro'], ['aulas', 'Aulas libres']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 4px', marginRight: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: tab === id ? PRIMARY : MUTED, borderBottom: tab === id ? `2.5px solid ${PRIMARY}` : '2.5px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      <DayTimePicker override={override} setOverride={setOverride} dia={dia} hora={hora} />

      {tab === 'grupo' && <GrupoTab gruposSchedule={gruposSchedule} estadoTodos={estadoTodos} />}
      {tab === 'maestro' && <MaestroTab estadoTodos={estadoTodos} />}
      {tab === 'aulas' && <AulasTab estadoTodos={estadoTodos} />}
    </div>
  );
}

function GrupoTab({ gruposSchedule, estadoTodos }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const filtrados = gruposSchedule.filter((g) => g.includes(q.trim()));

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={16} color={MUTED} style={{ position: 'absolute', left: 11, top: 10 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar por número de grupo (ej. 331)"
          style={{ width: '100%', padding: '9px 10px 9px 34px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: '#fff', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {filtrados.map((g) => (
          <button key={g} onClick={() => setSelected(g)} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1px solid ${selected === g ? PRIMARY : LINE}`, background: selected === g ? PRIMARY : '#fff', color: selected === g ? '#fff' : '#1C2430', cursor: 'pointer' }}>
            {g}
          </button>
        ))}
      </div>
      {selected && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Grupo {selected}</div>
          <EstadoHorarioCard estado={estadoTodos[selected]} />
        </div>
      )}
      {!selected && <div style={{ fontSize: 13, color: MUTED, textAlign: 'center', padding: '20px 0' }}>Selecciona un grupo para ver dónde está en este momento.</div>}
    </div>
  );
}

function MaestroTab({ estadoTodos }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [profesores, setProfesores] = useState([]);

  useEffect(() => { api.horarioProfesores().then(setProfesores).catch(() => {}); }, []);
  const filtrados = profesores.filter((p) => normalize(p).includes(normalize(q)));

  const actual = useMemo(() => {
    if (!selected) return null;
    for (const [g, estado] of Object.entries(estadoTodos)) {
      if (estado.estado === 'clase' && estado.sesion.profesor === selected) return { grupo: g, sesion: estado.sesion };
    }
    return null;
  }, [selected, estadoTodos]);

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={16} color={MUTED} style={{ position: 'absolute', left: 11, top: 10 }} />
        <input value={q} onChange={(e) => { setQ(e.target.value); setSelected(null); }} placeholder="Buscar maestro/a por nombre..."
          style={{ width: '100%', padding: '9px 10px 9px 34px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: '#fff', boxSizing: 'border-box' }} />
      </div>
      {!selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 320, overflowY: 'auto' }}>
          {filtrados.length === 0 && <div style={{ fontSize: 13, color: MUTED, textAlign: 'center', padding: '20px 0' }}>Sin coincidencias.</div>}
          {filtrados.map((p) => (
            <button key={p} onClick={() => setSelected(p)} style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 9, border: `1px solid ${LINE}`, background: '#fff', fontSize: 13, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      )}
      {selected && (
        <div>
          <button onClick={() => setSelected(null)} style={{ fontSize: 12, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={13} /> Cambiar maestro/a
          </button>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{selected}</div>
          {actual ? (
            <div>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Actualmente en grupo <strong>{actual.grupo}</strong>:</div>
              <EstadoHorarioCard estado={{ estado: 'clase', sesion: actual.sesion }} />
            </div>
          ) : <div style={{ fontSize: 13, color: MUTED }}>No tiene clase asignada en este momento (según el horario cargado).</div>}
        </div>
      )}
    </div>
  );
}

function AulasTab({ estadoTodos }) {
  const [todasAulas, setTodasAulas] = useState([]);
  useEffect(() => { api.horarioAulas().then(setTodasAulas).catch(() => {}); }, []);

  const ocupadas = {};
  Object.entries(estadoTodos).forEach(([g, estado]) => {
    if (estado.estado === 'clase' && estado.sesion.aula) ocupadas[estado.sesion.aula] = { grupo: g, sesion: estado.sesion };
  });
  const libres = todasAulas.filter((a) => !ocupadas[a]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <StatBox label="Aulas libres" value={libres.length} color={OK} />
        <StatBox label="Aulas ocupadas" value={Object.keys(ocupadas).length} color={DANGER} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, color: OK, marginBottom: 8 }}>LIBRES AHORA</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {libres.length === 0 && <div style={{ fontSize: 13, color: MUTED }}>No hay aulas libres en este momento.</div>}
        {libres.map((a) => <span key={a} style={{ background: '#E8F5EE', color: OK, border: '1px solid #BFE3CE', borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 700 }}>{a}</span>)}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, color: DANGER, marginBottom: 8 }}>OCUPADAS AHORA</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(ocupadas).sort(([a], [b]) => a.localeCompare(b)).map(([aula, info]) => (
          <div key={aula} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 9, padding: '9px 12px', fontSize: 12.5 }}>
            <strong>{aula}</strong> <span style={{ color: MUTED }}>· Grupo {info.grupo}</span>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{info.sesion.materia} · {displayProfesor(info.sesion.profesor)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
