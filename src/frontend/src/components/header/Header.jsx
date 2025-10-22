import React, { useState } from 'react';
import styles from './header.module.css';
import { NavLink, Link } from 'react-router-dom';
import { FadeIn } from '../animations/FadeIn';
import { Pop } from '../animations/Pop';
import { HalloweenDecor } from '../animations/HalloweenDecor';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);
  const auth = useAuth();

  const links = [
    { link: '/', rotulo: 'Home' },
    { link: '/inscricao', rotulo: 'Inscrição' },
    { link: '/contato', rotulo: 'Contato' },
    { link: '/rifa', rotulo: 'Rifa' },
    // Mostra a guia Admin somente se NÃO estiver autenticado
    ...(!auth.isAuthenticated ? [{ link: '/admin', rotulo: 'Admin' }] : []),
    ...(auth.isSuperuser ? [{ link: '/admin/painel', rotulo: 'Painel' }] : []),
  ];

  const navbar = (
    <ul>
      {links.map(({ link, rotulo }, index) => (
        <li key={link} onClick={() => setOpen(false)}>
          <FadeIn delay={index * 0.1}>
            <Pop>
              <NavLink to={link} className={({ isActive }) => isActive ? styles.active : ''}>
                {rotulo}
              </NavLink>
            </Pop>
          </FadeIn>
        </li>
      ))}
    </ul>
  );

  const hamburguer = (
    <button
      type="button"
      className={`${styles.hamburger} ${open ? styles.open : ''}`}
      onClick={toggleMenu}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Fechar menu' : 'Abrir menu'}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );

  return (
    <header className={styles.mainHeader}>
      <HalloweenDecor />
      <Link to="/" className={styles.logo}>Let's Cont</Link>
      <nav>
        <div className={styles.desktopNav}>{navbar}</div>
        <div className={styles.menuMobile}>
          {hamburguer}
          <div id="mobile-menu" className={`${styles.mobileNav} ${styles.abrirMenu} ${open ? styles.show : ''}`}>
            {navbar}
          </div>
        </div>
      </nav>
    </header>
  );
}
