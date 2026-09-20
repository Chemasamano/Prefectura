import React from 'react';
import { RefreshCw, Info, LogOut, Mail, Phone, X } from 'lucide-react';
import { PRIMARY, PRIMARY_DARK2, ADMIN_COLOR, INK, MUTED, LINE, PAPER } from '../constants';

export function TopBar({ usuario, lastSync, onRefresh, loading, onShowAbout, onLogout }) {
  return (
    <div style={{ background: `linear-gradient(155deg, ${PRIMARY} 0%, ${PRIMARY_DARK2} 100%)`, color: '#fff', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>
            <img src="/logo-cobao.png" alt="Logotipo COBAO" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              COLEGIO DE BACHILLERES DEL ESTADO DE OAXACA
            </div>
            <div style={{ fontWeight: 800, fontSize: 16.5, letterSpacing: -0.2, lineHeight: 1.15 }}>Bitácora de Conducta</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>Plantel 04 · El Tule</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onShowAbout} title="Acerca de este sistema" style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#fff', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <Info size={16} />
          </button>
          <button onClick={onRefresh} title="Actualizar" style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#fff', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button onClick={onLogout} title="Cerrar sesión" style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#fff', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <LogOut size={16} />
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
      </div>

      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ background: usuario.rol === 'admin' ? ADMIN_COLOR : 'rgba(255,255,255,0.16)', border: usuario.rol === 'admin' ? 'none' : '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 999, padding: '4px 11px', fontSize: 11.5, fontWeight: 700 }}>
          {usuario.nombre} · {usuario.rol === 'admin' ? 'Administrador/a' : 'Prefecto/a'}
        </span>
        {lastSync && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{lastSync.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    </div>
  );
}

export function AboutModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,25,0.5)', zIndex: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ background: `linear-gradient(155deg, ${PRIMARY} 0%, ${PRIMARY_DARK2} 100%)`, padding: '20px 20px 16px', borderRadius: '16px 16px 0 0', color: '#fff', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.16)', border: 'none', color: '#fff', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
            <X size={15} />
          </button>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fff', padding: 4, marginBottom: 10 }}>
            <img src="/logo-cobao.png" alt="Logotipo COBAO" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(255,255,255,0.85)' }}>COLEGIO DE BACHILLERES DEL ESTADO DE OAXACA</div>
          <div style={{ fontWeight: 800, fontSize: 19, marginTop: 3 }}>Bitácora de Conducta</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Plantel 04 · El Tule</div>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 13, color: INK, lineHeight: 1.6, marginBottom: 16 }}>
            Sistema interno de prefectura para registrar incidencias de conducta, dar seguimiento a su
            resolución y consultar en tiempo real la ubicación de grupos, maestros y aulas del plantel.
            Acceso restringido mediante inicio de sesión; ningún dato personal del alumnado es visible
            sin autenticarse.
          </p>
          <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.4, marginBottom: 10 }}>
              ¿INTERESA REPLICAR ESTE MODELO EN TU PLANTEL O INSTITUCIÓN?
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>José Manuel Sámano Mijangos</div>
            <a href="mailto:josemsamano@hotmail.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: PRIMARY, textDecoration: 'none', marginBottom: 7 }}>
              <Mail size={13} /> josemsamano@hotmail.com
            </a>
            <a href="tel:+529514353338" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: PRIMARY, textDecoration: 'none' }}>
              <Phone size={13} /> 951 435 3338
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
