import React from 'react';
import styles from '../../styles/form.module.css';

export function Form({ children, className = '', ...rest }) {
  return (
    <form className={`${styles.form} ${className}`} {...rest}>
      {children}
    </form>
  );
}

export function FormGroup({ children, className = '' }) {
  return <div className={`${styles.formGroup} ${className}`}>{children}</div>;
}

export function FormLabel({ children, htmlFor, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`${styles.formLabel} ${className}`}>
      {children}
    </label>
  );
}

export function FormInput({ className = '', ...rest }) {
  return <input className={`${styles.formInput} ${className}`} {...rest} />;
}

export function TextArea({ className = '', rows = 4, ...rest }) {
  return <textarea className={`${styles.formInput} ${className}`} rows={rows} {...rest} />;
}

export function SubmitButton({ children, className = '', ...rest }) {
  return (
    <button type="submit" className={`${styles.submitButton} ${className}`} {...rest}>
      {children}
    </button>
  );
}
