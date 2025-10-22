import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./styles/carousel.module.css";

export function CarouselMotion({
  images = [],            // legacy: array of fallback image URLs
  altTexts = [],          // legacy: alt texts for images
  sources = null,         // new: array of { fallback, webp?, avif?, alt? }
  autoPlay = true,
  interval = 3000,
  prevAriaLabel = "Slide anterior",
  nextAriaLabel = "Próximo slide",
  dotAriaLabel = "Ir para slide",
}) {
  const [index, setIndex] = useState(0);

  const total = sources ? sources.length : images.length;

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, total]);

  if (total === 0) {
    return null;
  }

  const nextSlide = () => setIndex((prev) => (prev + 1) % total);
  const prevSlide = () => setIndex((prev) => (prev - 1 + total) % total);

  const currentAlt = sources ? (sources[index]?.alt ?? '') : (altTexts[index] ?? '');
  const showControls = total > 1;

  return (
    <div className={styles.carousel}>
      <div className={styles.imageWrapper}>
        <AnimatePresence mode="wait">
          {sources ? (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className={styles.image}
            >
              <picture>
                {sources[index]?.avif && (
                  <source srcSet={sources[index].avif} type="image/avif" />
                )}
                {sources[index]?.webp && (
                  <source srcSet={sources[index].webp} type="image/webp" />
                )}
                <img
                  src={sources[index].fallback}
                  alt={currentAlt}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  className={styles.innerImg}
                />
              </picture>
            </motion.div>
          ) : (
            <motion.img
              key={index}
              src={images[index]}
              alt={currentAlt}
              className={styles.image}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
            />
          )}
        </AnimatePresence>
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className={styles.btn + " " + styles.prev}
            aria-label={prevAriaLabel}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className={styles.btn + " " + styles.next}
            aria-label={nextAriaLabel}
          >
            ›
          </button>

          <div className={styles.dots}>
            {(sources || images).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === index ? styles.active : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`${dotAriaLabel} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
