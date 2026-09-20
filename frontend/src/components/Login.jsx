import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { api, setSession } from '../api';
import { PRIMARY, PRIMARY_DARK2, INK, MUTED, LINE, PAPER, DANGER } from '../constants';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!usuario.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.login(usuario.trim(), password);
      setSession(data.token, { nombre: data.nombre, rol: data.rol });
      onLogin({ nombre: data.nombre, rol: data.rol });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ background: `linear-gradient(155deg, ${PRIMARY} 0%, ${PRIMARY_DARK2} 100%)`, borderRadius: '16px 16px 0 0', padding: '28px 24px 22px', textAlign: 'center', color: '#fff' }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: '#fff', margin: '0 auto 14px', padding: 6 }}>
            <img src="/logo-cobao.png" alt="Logotipo COBAO" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(255,255,255,0.85)' }}>COLEGIO DE BACHILLERES DEL ESTADO DE OAXACA</div>
          <div style={{ fontWeight: 800, fontSize: 20, marginTop: 4 }}>Bitácora de Conducta</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Plantel 04 · El Tule</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '0 0 16px 16px', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: MUTED, marginBottom: 16 }}>
            <Lock size={13} /> Acceso exclusivo para personal de prefectura
          </div>

          <label style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Usuario</label>
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus autoCapitalize="none"
            style={{ width: '100%', padding: '11px 12px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, display: 'block', marginBottom: 6 }}>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '11px 12px', borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />

          {error && <div style={{ background: '#FDEEE8', color: DANGER, border: '1px solid #F5C7B3', borderRadius: 9, padding: '9px 11px', fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 9, border: 'none', background: loading ? '#C9AAB0' : PRIMARY, color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
