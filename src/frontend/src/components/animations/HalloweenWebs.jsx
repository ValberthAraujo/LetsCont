import React from 'react';
import styles from './styles/halloween-webs.module.css';

export function HalloweenWebs({ corners = ['top-left', 'top-right'] }) {
  return (
    <div className={styles.root} aria-hidden="true">
      {corners.includes('top-left') && (
        <svg className={`${styles.web} ${styles.topLeft}`} viewBox="0 0 120 120" preserveAspectRatio="xMinYMin meet">
          <g stroke="var(--primary-color-low)" fill="none" strokeWidth="1.5">
            <path d="M0 0 L120 0 M0 0 L0 120" opacity="0.5" />
            <path d="M0 0 C 30 0, 60 0, 90 0" opacity="0.4" />
            <path d="M0 0 C 0 30, 0 60, 0 90" opacity="0.4" />
            <path d="M0 0 C 30 10, 60 20, 90 30" opacity="0.35" />
            <path d="M0 0 C 10 30, 20 60, 30 90" opacity="0.35" />
          </g>
        </svg>
      )}
      {corners.includes('top-right') && (
        <svg className={`${styles.web} ${styles.topRight}`} viewBox="0 0 120 120" preserveAspectRatio="xMaxYMin meet">
          <g stroke="var(--primary-color-low)" fill="none" strokeWidth="1.5">
            <path d="M120 0 L0 0 M120 0 L120 120" opacity="0.5" />
            <path d="M120 0 C 90 0, 60 0, 30 0" opacity="0.4" />
            <path d="M120 0 C 120 30, 120 60, 120 90" opacity="0.4" />
            <path d="M120 0 C 90 10, 60 20, 30 30" opacity="0.35" />
            <path d="M120 0 C 110 30, 100 60, 90 90" opacity="0.35" />
          </g>
        </svg>
      )}
    </div>
  );
}
