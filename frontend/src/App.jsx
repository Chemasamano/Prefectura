import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSession, clearSession } from './api';
import Login from './components/Login';
import { TopBar, AboutModal } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Shared';
import SearchView from './components/SearchView';
import GroupsView from './components/GroupsView';
import LiveView from './components/LiveView';
import SummaryView from './components/SummaryView';
import AdminView from './components/AdminView';
import StudentPanel from './components/StudentPanel';
import { PAPER, INK } from './constants';

export default function App() {
  const [session, setSessionState] = useState(() => getSession());
  const [view, setView] = useState('buscar');
  const [selectedId, setSelectedId] = useState(null);
  const [groupFilterFromGroups, setGroupFilterFromGroups] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [toast, setToast] = useState({ message: '', type: 'ok' });
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'ok') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ message: '', type: 'ok' }), 2600);
  }, []);

  function handleLogout() {
    clearSession();
    setSessionState(null);
  }

  if (!session) {
    return <Login onLogin={(usuario) => setSessionState({ usuario })} />;
  }

  const usuario = session.usuario;
  const isAdmin = usuario.rol === 'admin';

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: PAPER, minHeight: '100vh', color: INK, paddingBottom: 76 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select, button { font-family: inherit; }
        body { margin: 0; }
      `}</style>

      <TopBar
        usuario={usuario}
        lastSync={lastSync}
        loading={false}
        onRefresh={() => setLastSync(new Date())}
        onShowAbout={() => setShowAbout(true)}
        onLogout={handleLogout}
      />

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {!selectedId && view === 'buscar' && (
        <SearchView onOpen={setSelectedId} initialGroup={groupFilterFromGroups} clearInitialGroup={() => setGroupFilterFromGroups(null)} showToast={showToast} />
      )}
      {!selectedId && view === 'grupos' && (
        <GroupsView onSelectGroup={(g) => { setGroupFilterFromGroups(g); setView('buscar'); }} showToast={showToast} />
      )}
      {!selectedId && view === 'en_vivo' && <LiveView showToast={showToast} />}
      {!selectedId && view === 'resumen' && <SummaryView showToast={showToast} />}
      {!selectedId && view === 'admin' && isAdmin && <AdminView showToast={showToast} />}

      {selectedId && <StudentPanel studentId={selectedId} onClose={() => setSelectedId(null)} showToast={showToast} />}

      {!selectedId && <BottomNav view={view} setView={setView} isAdmin={isAdmin} />}
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
