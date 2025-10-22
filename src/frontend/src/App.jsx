import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/header/Header';
import { Contato } from './components/main/contato/Contato';
import { Home } from './components/main/home/Home';
import { Inscricao } from './components/main/inscricao/Inscricao';
import { Rifa } from './components/main/rifa/Rifa';
import './App.css';
import AudioPreload from './components/media/AudioPreload.jsx';
const Checkout = lazy(() => import('./components/main/rifa/checkout/Checkout'));
const Admin = lazy(() => import('./components/main/admin/Admin'));
const AdminPanel = lazy(() => import('./components/main/admin/AdminPanel'));
const PanelFinanceiro = lazy(() => import('./components/main/admin/PaineisAdmin/Financeiro'));
const PanelInfra = lazy(() => import('./components/main/admin/PaineisAdmin/Infra'));
const PanelInscricoes = lazy(() => import('./components/main/admin/PaineisAdmin/Inscricoes'));
const PanelLetsCoffe = lazy(() => import('./components/main/admin/PaineisAdmin/LetsCoffe'));
import { ProtectedRoute } from './components/routes/ProtectedRoute';

export function App() {
  return (
    <Router>
      <Header />
      <AudioPreload />
      <Suspense fallback={<div style={{ padding: '1rem' }}>Carregando…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="/rifa" element={<Rifa />} />
          <Route path="/rifa/checkout" element={<Checkout />}/>
          <Route
            path="/admin/painel/*"
            element={
              <ProtectedRoute requireAuth requireSuperuser>
                <AdminPanel />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="inscricoes" replace />} />
            <Route path="financeiro" element={<PanelFinanceiro />} />
            <Route path="infra" element={<PanelInfra />} />
            <Route path="inscricoes" element={<PanelInscricoes />} />
            <Route path="letscoffe" element={<PanelLetsCoffe />} />
            <Route path="*" element={<Navigate to="inscricoes" replace />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
export default App;
