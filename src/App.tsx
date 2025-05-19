import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreditCards from './pages/CreditCards';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState(getUser());
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    const timer = setTimeout(() => {
      setAppIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      
      {/* Rotas protegidas */}
      <Route element={<Layout />}>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/cartoes" element={user ? <CreditCards /> : <Navigate to="/login" replace />} />
        <Route path="/despesas" element={user ? <Expenses /> : <Navigate to="/login" replace />} />
        <Route path="/receitas" element={user ? <Income /> : <Navigate to="/login" replace />} />
        <Route path="/relatorios" element={user ? <Reports /> : <Navigate to="/login" replace />} />
        <Route path="/configuracoes" element={user ? <Settings /> : <Navigate to="/login" replace />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;