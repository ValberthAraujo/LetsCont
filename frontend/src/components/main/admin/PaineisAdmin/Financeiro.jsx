import React from 'react';
import styles from '../styles/admin.module.css';

export function PanelFinanceiro() {
  const { user, token } = useAuth();
  const isAdmin = useMemo(() => Boolean(user?.is_superuser), [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [financeiro, setRifas] = useState([]);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!token || !isAdmin) return;
      setLoading(true);
      setError('');
      try {
        const data = await listRifas(token);
        if (!active) return;
        setCount(Number(data?.count || 0));
        setRifas(Array.isArray(data?.data) ? data.data : []);
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
    <div className={styles.loginCard}>
      <h2>Painel Financeiro</h2>
      <p>Área para relatórios e controles financeiros. Em breve.</p>
    </div>
  );
}

export default PanelFinanceiro;

