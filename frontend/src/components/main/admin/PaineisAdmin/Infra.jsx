import React, { useEffect, useMemo, useState } from 'react';
import styles from '../styles/admin.module.css';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { listContatos, responderContato } from '../../../../services/api.js';

export function PanelInfra() {
  const { user, token } = useAuth();
  const isAdmin = useMemo(() => Boolean(user?.is_superuser), [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [contatos, setContatos] = useState([]);
  const [marking, setMarking] = useState({});

  const handleMarkRespondido = async (c) => {
    if (!token || !isAdmin || !c?.id || c?.respondido) return;
    setMarking((m) => ({ ...m, [c.id]: true }));
    setError('');
    try {
      const updated = await responderContato(token, c.id, 'Respondido pelo painel');
      setContatos((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
    } catch (err) {
      setError(err?.message || 'Falha ao marcar como respondido');
    } finally {
      setMarking((m) => {
        const n = { ...m };
        delete n[c.id];
        return n;
      });
    }
  };

  useEffect(() => {
    let active = true;
    async function run() {
      if (!token || !isAdmin) return;
      setLoading(true);
      setError('');
      try {
        const data = await listContatos(token);
        if (!active) return;
        setCount(Number(data?.count || (Array.isArray(data) ? data.length : 0)));
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setContatos(arr);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Falha ao carregar contatos');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [token, isAdmin]);

  return (
    <div className={styles.loginCard}>
      <h2>Contatos do Site</h2>
      <p><strong>Total de contatos:</strong> {loading ? 'Carregando...' : count}</p>
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Criado em</th>
                <th className={styles.th}>Nome</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Mensagem</th>
                <th className={styles.th}>Respondido</th>
                <th className={styles.th}>Respondido em</th>
                <th className={styles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {contatos.map((c) => (
                <tr key={c.id}>
                  <td className={styles.td}>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                  <td className={styles.td}>{c.nome}</td>
                  <td className={styles.td}>{c.email}</td>
                  <td className={styles.td}>{c.mensagem}</td>
                  <td className={styles.td}>{c.respondido ? 'Sim' : 'Não'}</td>
                  <td className={styles.td}>{c.respondido_em ? new Date(c.respondido_em).toLocaleString() : '-'}</td>
                  <td className={styles.td}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(c.respondido)}
                        disabled={Boolean(c.respondido) || Boolean(marking[c.id])}
                        onChange={() => handleMarkRespondido(c)}
                        aria-label="Marcar como respondido"
                      />
                      <span style={{ opacity: c.respondido ? 0.6 : 1 }}>
                        {marking[c.id] ? 'Marcando...' : c.respondido ? 'Respondido' : 'Marcar respondido'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
              {contatos.length === 0 && (
                <tr>
                  <td className={`${styles.td} ${styles.tdCenter}`} colSpan={7}>
                    Nenhum contato encontrado.
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

export default PanelInfra;
