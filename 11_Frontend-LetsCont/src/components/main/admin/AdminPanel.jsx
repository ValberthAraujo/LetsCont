import React, { useEffect, useMemo, useState } from 'react';
import styles from './admin.module.css';
import { HalloweenWebs } from '../../animations/HalloweenWebs';
import { useAuth } from '../../../context/AuthContext';
import { listInscricoes } from '../../../services/api.js';
import { useNavigate } from 'react-router-dom';

export function AdminPanel() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [inscricoes, setInscricoes] = useState([]);

  const isAdmin = useMemo(() => Boolean(user?.is_superuser), [user]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!token || !isAdmin) return;
      setLoading(true);
      setError('');
      try {
        const data = await listInscricoes(token);
        if (!active) return;
        setCount(Number(data?.count || 0));
        setInscricoes(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Falha ao carregar inscrições');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [token, isAdmin]);

  return (
    <main>
      <section className={styles.adminSection}>
        <HalloweenWebs />
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerRow}>
              <div className={styles.headerSpacer} />
              <div className={styles.headerCenter}>
                <h1 className='titulo'>Painel Administrativo</h1>
                <p className='descricao'>Acesso restrito a administradores.</p>
              </div>
              <button
                type="button"
                className={`${styles.primaryButton} ${styles.headerLogout}`}
                onClick={() => { logout(); navigate('/'); }}
                aria-label="Sair"
              >
                Sair
              </button>
            </div>
          </header>

          <div className={styles.panelCard}>
            <div className={styles.loginCard}>
              <p>Bem-vindo, <strong>{user?.full_name || user?.email}</strong>.</p>
              <p>Nome: {user?.full_name || user?.email || '-'}</p>
            </div>

            {isAdmin && (
              <div className={styles.loginCard}>
                <h2>Inscrições</h2>
                <p><strong>Total de inscritos:</strong> {loading ? 'Carregando...' : count}</p>
                {error && <p className={styles.error}>{error}</p>}
                {!loading && !error && (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Nome</th>
                          <th className={styles.th}>Email</th>
                          <th className={styles.th}>Origem</th>
                          <th className={styles.th}>Criado em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inscricoes.map((i) => (
                          <tr key={i.id}>
                            <td className={styles.td}>{i.nome}</td>
                            <td className={styles.td}>{i.email}</td>
                            <td className={styles.td}>{i.origem}</td>
                            <td className={styles.td}>
                              {i.created_at ? new Date(i.created_at).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                        {inscricoes.length === 0 && (
                          <tr>
                            <td className={`${styles.td} ${styles.tdCenter}`} colSpan={4}>
                              Nenhuma inscrição encontrada.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
