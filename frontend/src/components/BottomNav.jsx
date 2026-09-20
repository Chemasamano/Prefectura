import React from 'react';
import { Search, Users, Clock, BarChart3, UserCog } from 'lucide-react';
import { LINE, ADMIN_COLOR, BRAND_RED } from '../constants';

export function BottomNav({ view, setView, isAdmin }) {
  const items = [
    { id: 'buscar', label: 'Buscar', icon: Search },
    { id: 'grupos', label: 'Grupos', icon: Users },
    { id: 'en_vivo', label: 'En vivo', icon: Clock },
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
  ];
  if (isAdmin) items.push({ id: 'admin', label: 'Admin', icon: UserCog });

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1px solid ${LINE}`, display: 'flex', zIndex: 60 }}>
      {items.map((it) => {
        const active = view === it.id;
        const Icon = it.icon;
        const color = it.id === 'admin' ? ADMIN_COLOR : BRAND_RED;
        return (
          <button key={it.id} onClick={() => setView(it.id)} style={{ flex: 1, padding: '10px 0 8px', background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', color: active ? color : '#98A2AC' }}>
            <Icon size={19} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
