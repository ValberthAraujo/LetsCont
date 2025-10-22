import React, { useState } from 'react';
import styles from './contato.module.css';
import { Form, FormGroup, FormLabel, FormInput, TextArea, SubmitButton } from '../../ui/Form';
import { HalloweenWebs } from '../../animations/HalloweenWebs';
import { Jumpscare } from '../../animations/Jumpscare';
import { sendContato } from '../../../services/api';

export function Contato() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setStatus({ type: '', text: '' });
    setLoading(true);
    try {
      await sendContato({ nome, email, mensagem });
      setStatus({ type: 'success', text: 'Mensagem enviada com sucesso!' });
      setNome('');
      setEmail('');
      setMensagem('');
    } catch (err) {
      setStatus({ type: 'error', text: err?.message || 'Falha ao enviar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className={styles.hero} aria-labelledby="contato-titulo">
        <HalloweenWebs />
        <div className={styles.container}>
          <div>
            <h1 className='titulo'>Contato</h1>
            <p className='descricao'>Entre em contato conosco caso tenha alguma dúvida sobre o evento!</p>
          </div>

          <Form className={styles.registrationForm} onSubmit={handleSubmit} name="Dúvidas">
            <FormGroup>
              <FormLabel htmlFor="full-name">Nome</FormLabel>
              <FormInput
                type="text"
                id="full-name"
                name="name"
                placeholder="Digite seu nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="email">Email *</FormLabel>
              <FormInput
                type="email"
                id="email"
                name="email"
                placeholder="Digite seu email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="message">Mensagem *</FormLabel>
              <TextArea
                id="message"
                name="message"
                placeholder="Escreva sua mensagem"
                className={styles.campoMensagem}
                rows={6}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
              />
            </FormGroup>
            <SubmitButton disabled={loading}>{loading ? 'Enviando...' : 'Enviar Dúvida!'}</SubmitButton>
            {status.text && (
              <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.success : styles.error}`}>
                {status.text}
              </div>
            )}
          </Form>
        </div>
        <Jumpscare delayMs={6000} />
      </section>
    </main>
  );
}
