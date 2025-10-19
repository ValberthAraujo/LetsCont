import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '1rem' }}>
          <h2>Algo deu errado.</h2>
          <p>Tente recarregar a página. Se persistir, contate o suporte.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

