import React, { useEffect, useRef } from 'react';
import styles from './styles/jumpscare.module.css';
import witchLaugh from '../../assets/sounds/evil-witch.mp3';
import witchImg from '../../assets/img/bruxa_jumpscare.svg';

export function WitchJumpscare({ open, onClose, durationMs = 1600 }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // Play witch laugh from asset (gesture-initiated via button click)
    try {
      const audio = new Audio(witchLaugh);
      audioRef.current = audio;
      audio.volume = 0.9;
      audio.play().catch(() => {});
      // Fechar quando o áudio terminar (sincroniza duração do overlay)
      audio.addEventListener('ended', () => {
        onClose && onClose();
      }, { once: true });
      if (navigator.vibrate) navigator.vibrate(200);
    } catch (_) {
      // ignore autoplay or construction errors
    }

    // Fallback: garante fechamento mesmo se o evento 'ended' não disparar
    const timer = setTimeout(() => onClose && onClose(), Math.max(1200, durationMs));
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (_) {}
        audioRef.current = null;
      }
    };
  }, [open, onClose, durationMs]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Aviso" onClick={onClose}>
      <div className={styles.flash} />
      <div className={styles.faceWrap} onClick={(e) => e.stopPropagation()}>
        <img className={styles.face} src={witchImg} alt="" />
      </div>
    </div>
  );
}
