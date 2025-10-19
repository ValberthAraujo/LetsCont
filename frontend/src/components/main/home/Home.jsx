import React from 'react';
import styles from './home.module.css';

import feeac from '../../../assets/img/feeac.jpg';
import feeac2 from '../../../assets/img/feeac2.jpg';

import { HalloweenWebs } from '../../animations/HalloweenWebs';
import { CarouselMotion } from '../../animations/Carrossel';

export function Home() {
  const sources = React.useMemo(() => ([
    { fallback: feeac, alt: 'Fachada da FEEAC (UFC)' },
    { fallback: feeac2, alt: 'Audit��rio da FEEAC (UFC)' },
  ]), []);

  return (
    <main className={styles.principal}>
      <HalloweenWebs />

      <h1 className={styles.titulo}>Lets Cont 2025.2</h1>

      <section className={styles.containerPrincipal}>
        <div className={styles.corpoCard}>
          <div className={styles.fundoCard}>
            <CarouselMotion
              sources={sources}
              autoPlay={false}
              interval={5000}
              prevAriaLabel="Slide anterior"
              nextAriaLabel="Próximo slide"
              dotAriaLabel="Ir para slide"
            />
          </div>

          <div className={styles.detalhesCartao}>
            <div className={styles.colunaEsquerda}>
              <h2 className={styles.tituloCartao}>Descrição do Evento</h2>
              <p className={styles.textoCartao}>
                Este evento é organizado pelos estudantes de Ciências Contǭbeis da UFC e
                conta com a participação de egressos da universidade, oferecendo uma
                excelente oportunidade para <strong>networking e integração</strong>.
              </p>
              <p className={styles.textoCartao}>
                <strong>Todos estão convidados a participar!</strong>
              </p>
              <h3 className={`${styles.tituloCartao} ${styles.tituloCompacto}`}>Horário</h3>
              <p className={styles.textoCartao}>Ainda será definido...</p>
            </div>
            <div className={styles.colunaDireita}>
              <h2 className={styles.tituloCartao}>Local</h2>
              <p className={styles.textoCartao}>O Let's Cont desse ano acontecerǭ no:</p>
              <p className={styles.textoCartao}><strong>Auditório Pedro Viera</strong></p>
              <address className={styles.textoCartao}>
                R. Mal. Deodoro, 400 - Benfica, Fortaleza - CE, 60020-060
              </address>
              <a
                className={styles.linkMapa}
                href="https://www.google.com/maps/search/?api=1&query=FEAAC+NOVA+-+Bloco+Didático+III+Fortaleza"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir localização no Google Maps"
              >
                Ver no mapa
              </a>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 className={styles.titulo}>Let's Conts Anteriores</h2>

        <div className={styles.gradeVideos}>
          <div>
            <h3 className={styles.subtitulo}>Sorteio do Ano Anterior!</h3>
            <iframe
              src="https://www.youtube.com/embed/ausQCI-qagU"
              title="Sorteio do Ano Anterior"
              allowFullScreen
            ></iframe>
          </div>

          <div>
            <h3 className={styles.subtitulo}>Evento do Ano Anterior!</h3>
            <iframe
              src="https://www.youtube.com/embed/UzKITYqEYcc"
              title="Evento do Ano Anterior"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}

