import React, { useMemo, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { HalloweenWebs } from '../../animations/HalloweenWebs';
import { useAuth } from '../../../context/AuthContext';
import styles from './styles/admin.module.css';

export function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = useMemo(() => Boolean(user?.is_superuser), [user]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const tabClass = useCallback(
    ({ isActive }) => (isActive ? `${styles.tabLink} ${styles.tabActive}` : styles.tabLink),
    []
  );

  const navItems = [
    { to: '/admin/painel/inscricoes', label: 'Painel Inscrições' },
    { to: '/admin/painel/financeiro', label: 'Painel Financeiro' },
    { to: '/admin/painel/infra', label: 'Painel Infra' },
    { to: '/admin/painel/letscoffe', label: 'Painel LetsCoffe' },
  ];

  return (
    <main>
      <section className={styles.adminSection}>
        <HalloweenWebs />
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerRow}>
              <div className={styles.headerSpacer} />

              <div className={styles.headerCenter}>
                <h1 className="titulo">Painel Administrativo</h1>
                <p className="descricao">Acesso restrito a administradores.</p>
              </div>

              <button
                type="button"
                className={`${styles.primaryButton} ${styles.headerLogout}`}
                onClick={handleLogout}
                aria-label="Sair"
              >
                Sair
              </button>
            </div>
          </header>

          <div className={styles.panelCard}>
            <div className={styles.loginCard}>
              <p>
                Bem-vindo, <strong>{user?.full_name || user?.email}</strong>.
              </p>

              {!isAdmin && (
                <p className={styles.error}>
                  Apenas administradores podem acessar este painel.
                </p>
              )}
            </div>

            {/* Navegação do painel */}
            <nav className={styles.subnav} aria-label="Seções do painel">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={tabClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.contentWrap}>
              <Outlet />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminPanel;
