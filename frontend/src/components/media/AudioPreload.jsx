import React, { useEffect, useMemo } from 'react';

// Default sounds bundled with the app
import witch from '../../assets/sounds/evil-witch.mp3';
import ghost from '../../assets/sounds/ghost-oooo.mp3';

/**
 * AudioPreload
 * - Preloads a list of audio files using hidden <audio preload="auto" /> tags
 * - Additionally hints the browser by creating Audio() objects once
 *
 * Props:
 * - sources?: string[]  // optional custom list of audio URLs
 */
export function AudioPreload({ sources }) {
  const list = useMemo(() => (Array.isArray(sources) && sources.length ? sources : [witch, ghost]), [sources]);

  useEffect(() => {
    // Hint preloading by creating Audio objects (won't play without user gesture)
    const audios = list.map((src) => {
      try {
        const a = new Audio(src);
        a.preload = 'auto';
        return a;
      } catch {
        return null;
      }
    });
    return () => {
      // Best-effort cleanup
      audios.forEach((a) => {
        try { if (a) { a.src = ''; } } catch {}
      });
    };
  }, [list]);

  return (
    <div style={{ display: 'none' }} aria-hidden>
      {list.map((src, idx) => (
        <audio key={idx} src={src} preload="auto" />
      ))}
    </div>
  );
}

export default AudioPreload;

