import React, { useEffect, useRef, useState } from 'react';
import styles from './styles/jumpscare.module.css';
import ghostImg from '../../assets/img/ghostJumpscare.svg';
import ghostAudio from '../../assets/sounds/ghost-oooo.mp3';

export function Jumpscare({ delayMs = 6000, durationMs = 1400 }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef(null); // schedules opening
  const closeRef = useRef(null);   // schedules closing fallback
  const audioRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
      try {
        // Vibration if supported
        if (navigator.vibrate) navigator.vibrate(120);

        // Try to play ghost audio asset; fallback to synth if it fails
        const trySynth = () => {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const out = ctx.createGain();
            out.connect(ctx.destination);

            const master = ctx.createGain();
            master.connect(out);
            master.gain.setValueAtTime(0.0001, ctx.currentTime);

            const o1 = ctx.createOscillator();
            o1.type = 'sine';
            o1.frequency.setValueAtTime(240, ctx.currentTime);
            const o2 = ctx.createOscillator();
            o2.type = 'sine';
            o2.frequency.setValueAtTime(360, ctx.currentTime);

            const vibrato = ctx.createOscillator();
            vibrato.frequency.value = 5;
            const vibratoGain = ctx.createGain();
            vibratoGain.gain.value = 6;
            vibrato.connect(vibratoGain);
            vibratoGain.connect(o1.frequency);
            vibratoGain.connect(o2.frequency);

            const tremolo = ctx.createOscillator();
            tremolo.frequency.value = 2.2;
            const tremoloGain = ctx.createGain();
            tremoloGain.gain.value = 0.35;

            const amp = ctx.createGain();
            amp.gain.value = 1;
            tremolo.connect(tremoloGain);
            tremoloGain.connect(amp.gain);

            o1.connect(amp);
            o2.connect(amp);
            amp.connect(master);

            const t0 = ctx.currentTime;
            const d = Math.max(1.0, durationMs / 1000);
            master.gain.setValueAtTime(0.0001, t0);
            master.gain.exponentialRampToValueAtTime(0.6, t0 + 0.25);
            master.gain.exponentialRampToValueAtTime(0.0001, t0 + d);

            o1.start(t0);
            o2.start(t0);
            vibrato.start(t0);
            tremolo.start(t0);
            const stopAt = t0 + d + 0.05;
            o1.stop(stopAt);
            o2.stop(stopAt);
            vibrato.stop(stopAt);
            tremolo.stop(stopAt);
          } catch (_) {}
        };

        const audio = new Audio(ghostAudio);
        audioRef.current = audio;
        audio.volume = 0.85;
        // Close overlay when the audio ends (sync to sound length)
        const onEnded = () => {
          setShow(false);
        };
        audio.addEventListener('ended', onEnded, { once: true });
        audio.play().catch(() => {
          // If playback fails (policy or missing file), use synth fallback
          trySynth();
        });
      } catch (_) {
        // ignore autoplay or API errors
      }
      // Fallback close in case the audio doesn't end (or no audio)
      closeRef.current = setTimeout(() => setShow(false), Math.max(1200, durationMs));
    }, delayMs);
    return () => {
      clearTimeout(timeoutRef.current);
      if (closeRef.current) {
        clearTimeout(closeRef.current);
        closeRef.current = null;
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (_) {}
        audioRef.current = null;
      }
    };
  }, [delayMs, durationMs]);

  // Allow dismiss via ESC and overlay click
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShow(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Aviso" onClick={() => setShow(false)}>
      <div className={styles.flash} />
      <div className={styles.faceWrap} onClick={(e) => e.stopPropagation()}>
        <img className={styles.face} src={ghostImg} alt="" />
      </div>
    </div>
  );
}
