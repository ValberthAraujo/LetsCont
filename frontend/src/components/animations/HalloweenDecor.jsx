import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles/halloween-decor.module.css';

export function HalloweenDecor() {
  return (
    <div className={styles.decorRoot} aria-hidden="true">
      <motion.div
        className={styles.bat}
        initial={{ x: -40, y: 0, rotate: -10, opacity: 0.7 }}
        animate={{ x: 40, y: -10, rotate: 10, opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 64 32" className={styles.icon}>
          <path fill="var(--secondary-color)" d="M2 20c6-6 10-4 16-2 4-10 8-14 14-14s10 4 14 14c6-2 10-4 16 2-8 2-12 2-20-2-4 4-8 6-10 6s-6-2-10-6c-8 4-12 4-20 2z"/>
        </svg>
      </motion.div>

      <motion.div
        className={styles.spider}
        initial={{ y: -50 }}
        animate={{ y: [ -50, 0, -30, 0, -40, 0, -50 ] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 24 48" className={styles.icon}>
          <line x1="12" y1="0" x2="12" y2="14" stroke="var(--secondary-color)" strokeWidth="1"/>
          <circle cx="12" cy="21" r="6" fill="var(--secondary-color)" />
          <circle cx="12" cy="31" r="5" fill="var(--secondary-color)" />
          <path d="M3 22 L9 24 M3 26 L9 28 M21 22 L15 24 M21 26 L15 28" stroke="var(--secondary-color)" strokeWidth="2"/>
        </svg>
      </motion.div>

      <motion.div
        className={styles.pumpkin}
        whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.6 } }}
      >
        <svg viewBox="0 0 64 64" className={styles.icon}>
          <path fill="var(--primary-color)" d="M18 26c-6 0-10 6-10 14s4 14 10 14c2 0 4-1 6-2 2 1 4 2 8 2s6-1 8-2c2 1 4 2 6 2 6 0 10-6 10-14s-4-14-10-14c-2 0-4 1-6 2-2-1-4-2-8-2s-6 1-8 2c-2-1-4-2-6-2z"/>
          <rect x="30" y="16" width="4" height="6" fill="#5c8a3a"/>
          <path fill="#3a5a22" d="M30 16c2-4 6-4 8 0-2-2-6-2-8 0z"/>
          <path fill="#000" opacity="0.5" d="M22 40h8l-4-6-4 6zm12 4h8l-4-8-4 8z"/>
        </svg>
      </motion.div>
    </div>
  );
}

