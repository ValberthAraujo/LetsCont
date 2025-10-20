import React, { useState } from 'react';
import styles from './styles/admin.module.css';
import { Form, FormGroup, FormLabel, FormInput, SubmitButton } from '../../ui/Form';
import { HalloweenWebs } from '../../animations/HalloweenWebs';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await auth.login(email, password);
      setSuccess(true);
      navigate('/admin/painel', { replace: true });
    } catch (err) {
      setError(err?.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setSuccess(false);
  };

  return (
    <main>
      <section className={styles.adminSection}>
        <HalloweenWebs />
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className='titulo'>Login Administrativo</h1>
            <p className='descricao'>Acesse para gerenciar o conteúdo.</p>
          </header>

          {!auth.isAuthenticated ? (
          <Form className={styles.registrationForm} onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <FormInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="sua senha"
                autoComplete="current-password"
                required
              />
            </FormGroup>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>Login efetuado com sucesso.</div>}
            <SubmitButton disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </SubmitButton>
          </Form>
          ) : (
            <div className={styles.loginCard}>
              <p>Você já está autenticado como <strong>{auth.user?.email}</strong>.</p>
              <p>Nome: {auth.user?.full_name || auth.user?.email || '-'}</p>
              <button type="button" className={styles.primaryButton} onClick={handleLogout}>Sair</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
export default Admin;
