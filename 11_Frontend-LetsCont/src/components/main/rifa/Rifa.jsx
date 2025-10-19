import React from 'react';
import styles from './rifa.module.css';
import { HalloweenWebs } from '../../animations/HalloweenWebs';
import { useNavigate } from 'react-router-dom';
import image from '../../../assets/img/rifa.jpg';

export function Rifa() {
  const navigate = useNavigate();

  const handleParticipate = () => {
    navigate('/rifa/checkout');
  };

  return (
    <main>
      <section className={styles.raffleSection}>
        <HalloweenWebs />
        <div className={styles.container}>
          <div className={styles.raffleCard}>
            <div className={styles.cardDetails}>
              <div className={styles.leftCol}>
                <img
                  src={image}
                  alt="Rifa Let's Cont"
                  className={styles.raffleImage}
                />
              </div>

              <div className={styles.rightCol}>
                <h1 className={styles.raffleTitle}>Rifa</h1>
                <h2 className={styles.raffleSubtitle}>Está com sorte hoje? Compre nossa rifa!</h2>

                <div className={styles.priceSection}>
                  <div className={styles.priceDisplay}>
                    <span className={styles.originalPrice}>R$200,00</span>
                    <span className={styles.currentPrice}>R$5,00</span>
                    <span className={styles.discountWrapper}>-97,5%!</span>
                  </div>
                  <p className={styles.priceNote}>Preço por rifa</p>
                </div>

                <div className={styles.quantitySection}>
                  <div className={styles.raffleDescription}>
                    <p>Não perca essa chance — participar é rápido e 100% online!</p>
                    <p>Nada de papéis ou burocracia: assim que o sorteio for realizado, entraremos em contato imediatamente com o vencedor para entregar o prêmio.</p>
                    <p>Além de concorrer, você ainda contribui com o Let's Cont 2025.2 🎃</p>
                    <p><em>(Evento por tempo limitado)</em></p>
                  </div>

                  <button className={`${styles.primaryButton} ${styles.backButton}`} onClick={handleParticipate}>
                    Participar da Rifa!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
