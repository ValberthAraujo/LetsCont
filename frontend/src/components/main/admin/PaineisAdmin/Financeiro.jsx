import React, { useEffect, useMemo, useState } from 'react';
import styles from '../styles/admin.module.css';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { listRifas } from '../../../../services/api.js';

export function PanelFinanceiro() {
  const { user, token } = useAuth();
  const isAdmin = useMemo(() => Boolean(user?.is_superuser), [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [pedidos, setPedidos] = useState([]);

  const totals = useMemo(() => {
    const totalQuantidade = pedidos.reduce((acc, p) => acc + Number(p?.quantidade || 0), 0);
    const totalValor = pedidos.reduce((acc, p) => acc + Number(p?.valor || 0), 0);
    return { totalQuantidade, totalValor };
  }, [pedidos]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!token || !isAdmin) return;
      setLoading(true);
      setError('');
      try {
        const data = await listRifas(token);
        if (!active) return;
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setPedidos(arr);
        setCount(arr.length);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Falha ao carregar pedidos');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [token, isAdmin]);

  return (
    <div className={styles.loginCard}>
      <h2>Painel Financeiro</h2>
      <p><strong>Total de pedidos:</strong> {loading ? 'Carregando...' : count}</p>
      <p>
        <strong>Total de rifas vendidas:</strong> {loading ? '—' : totals.totalQuantidade} &nbsp;|&nbsp;
        <strong>Arrecadação (R$):</strong> {loading ? '—' : totals.totalValor.toFixed(2)}
      </p>
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Criado em</th>
                <th className={styles.th}>Nome</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Qtd</th>
                <th className={styles.th}>Valor (R$)</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>MP ID</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td className={styles.td}>{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
                  <td className={styles.td}>{p.nome}</td>
                  <td className={styles.td}>{p.email}</td>
                  <td className={styles.td}>{p.quantidade ?? '-'}</td>
                  <td className={styles.td}>{Number(p.valor || 0).toFixed(2)}</td>
                  <td className={styles.td}>{p.status}</td>
                  <td className={styles.td}>{p.mp_payment_id || '-'}</td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td className={`${styles.td} ${styles.tdCenter}`} colSpan={7}>
                    Nenhum pedido encontrado.
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

export default PanelFinanceiro;
