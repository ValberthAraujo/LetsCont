import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/header/Header';
import { Contato } from './components/main/contato/Contato';
import { Home } from './components/main/home/Home';
import { Inscricao } from './components/main/inscricao/Inscricao';
import { Rifa } from './components/main/rifa/Rifa';
import './App.css';
import { Checkout } from './components/main/rifa/checkout/Checkout';
import { Admin } from './components/main/admin/Admin';
import { AdminPanel } from './components/main/admin/AdminPanel';
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
          path="/admin/painel"
          element={
            <ProtectedRoute requireAuth requireSuperuser>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
export default App;
