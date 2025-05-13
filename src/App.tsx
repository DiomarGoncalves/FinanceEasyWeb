import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';

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

function App() {
  const [user, loading] = useAuthState(auth);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Simulando um tempo de carregamento para mostrar a tela de loading
    // Em produção, isso seria substituído pelo carregamento real dos dados
    if (!loading) {
      const timer = setTimeout(() => {
        setAppIsReady(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || !appIsReady) {
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