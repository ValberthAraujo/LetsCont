import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/header/Header';
import { Contato } from './components/main/contato/Contato';
import { Home } from './components/main/home/Home';
import { Inscricao } from './components/main/inscricao/Inscricao';
import { Rifa } from './components/main/rifa/Rifa';
import './App.css';
import { Checkout } from './components/main/rifa/checkout/Checkout';
import { Admin } from './components/main/admin/Admin';
import { AdminPanel } from './components/main/admin/AdminPanel';
import { PanelFinanceiro } from './components/main/admin/PaineisAdmin/Financeiro';
import { PanelInfra } from './components/main/admin/PaineisAdmin/Infra';
import { PanelInscricoes } from './components/main/admin/PaineisAdmin/Inscricoes';
import { PanelLetsCoffe } from './components/main/admin/PaineisAdmin/LetsCoffe';
import { ProtectedRoute } from './components/routes/ProtectedRoute';

export function App() {
  return (
    <Router>
      <Header />
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
    </Router>
  );
}
export default App;
