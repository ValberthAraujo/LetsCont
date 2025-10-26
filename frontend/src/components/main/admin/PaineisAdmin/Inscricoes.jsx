import React, { useEffect, useMemo, useState } from 'react';
import styles from '../styles/admin.module.css';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { listInscricoes } from '../../../../services/api.js';

export function PanelInscricoes() {
  const { user, token } = useAuth();
  const isAdmin = useMemo(() => Boolean(user?.is_superuser), [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [inscricoes, setInscricoes] = useState([]);

  useEffect(() => {
    let active = true;
    const ac = new AbortController();
    async function run() {
      if (!token || !isAdmin) return;
      setLoading(true);
      setError('');
      try {
        const data = await listInscricoes(token, { signal: ac.signal });
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
    return () => { active = false; ac.abort(); };
  }, [token, isAdmin]);

  return (
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
  );
}

export default PanelInscricoes;
