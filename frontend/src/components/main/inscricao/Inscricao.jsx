import React, { useState } from "react";
import styles from "./inscricao.module.css";
import { HalloweenWebs } from "../../animations/HalloweenWebs";
import { WitchJumpscare } from "../../animations/WitchJumpscare";
import { apiFetch } from "../../../services/api";
import form from "../../../styles/form.module.css";

export function Inscricao() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [origem, setOrigem] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [showWitch, setShowWitch] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    const inscricao = { nome, email, origem };
    setMensagem("");
    setLoading(true);

    try {
      await apiFetch('/inscricoes/', { method: 'POST', body: inscricao });
      setMensagem("Inscrição realizada com sucesso!");
      setShowSuccess(true);
      setShowWitch(true);
      setNome("");
      setEmail("");
      setOrigem("");
    } catch (error) {
      setMensagem("Erro ao enviar: " + (error?.message || "Tente novamente"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className={styles.hero}>
        <HalloweenWebs />
        <div className={styles.container}>
          <h1 className='titulo'>InscriÃ§Ã£o</h1>
          <p className='descricao'>
            Preencha o formulÃ¡rio abaixo para se inscrever no Let's Cont!<br/>
            A participaÃ§Ã£o no evento Ã© gratuita!
          </p>

          <form className={`${styles.registrationForm} ${form.form}`} onSubmit={handleSubmit}>
            <div className={form.formGroup}>
              <label htmlFor="firstName" className={form.formLabel}>Nome *</label>
              <input 
                type="text" 
                id="firstName" 
                className={form.formInput} 
                placeholder="Seu nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
            </div>

            <div className={form.formGroup}>
              <label htmlFor="email" className={form.formLabel}>Email *</label>
              <input 
                type="email" 
                id="email" 
                className={form.formInput} 
                placeholder="Seu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Participante</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="participantType" 
                    value="Estudante de Contabilidade"
                    checked={origem === "Estudante de Contabilidade"}
                    onChange={(e) => setOrigem(e.target.value)}
                  />
                  Estudante de Contabilidade
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="participantType" 
                    value="Estudante de Outros Cursos"
                    checked={origem === "Estudante de Outros Cursos"}
                    onChange={(e) => setOrigem(e.target.value)}
                  />
                  Estudante de Outros Cursos
                </label>
                <label className={styles.radioOption}>
                  <input 
                    type="radio" 
                    name="participantType" 
                    value="Egresso / Educador"
                    checked={origem === "Egresso / Educador"}
                    onChange={(e) => setOrigem(e.target.value)}
                  />
                  Egresso / Educador
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={`${form.submitButton} ${styles.submitButton}`}
              onClick={() => setShowWitch(true)}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Confirmar InscriÃ§Ã£o!'}
            </button>

            {mensagem && (
              <div className={styles.successMessage}>
                {mensagem}
              </div>
            )}
          </form>
          <div className={styles.pumpkinDeco} aria-hidden="true">
            <img src="/pumpkin-favicon.svg" alt="" />
          </div>
        </div>
        <WitchJumpscare open={showWitch} onClose={() => setShowWitch(false)} />
        {showSuccess && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="InscriÃ§Ã£o confirmada" onClick={() => setShowSuccess(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>InscriÃ§Ã£o confirmada</h2>
              <p>Sua inscriÃ§Ã£o foi registrada com sucesso.</p>
              <button type="button" className={styles.submitButton} onClick={() => setShowSuccess(false)}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

