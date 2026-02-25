import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 'var(--space-8)',
          maxWidth: '560px',
          margin: 'var(--space-8) auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <h1 style={{ color: 'var(--color-text)', marginBottom: 'var(--space-2)', fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontSize: '0.9375rem' }}>
            {this.state.error?.message || 'An error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
