import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '400px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            backgroundColor: '#ffffff',
            textAlign: 'center'
          }}>
            <h1 style={{ marginBottom: '1rem', color: '#ef4444' }}>App Error</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              Something went wrong. Please try one of these options:
            </p>
            <button
              onClick={() => window.location.href = '/demo'}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#58cc02',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Go to Demo
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Reload Page
            </button>
            <button
              onClick={this.resetError}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#000000',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;