import React, { useEffect, useState } from "react";
import styles from "./styles/switchpage.module.css";

export function SwitchPage({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.fadeContainer} ${visible ? styles.fadeIn : styles.fadeOut}`}>
      {children}
    </div>
  );
}
