import React, { Component, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary to catch crashes (like missing API keys) and show them on screen
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            padding: '2rem', 
            backgroundColor: '#0f172a', 
            color: '#f8fafc',
            fontFamily: 'sans-serif'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ef4444'}}>Application Error</h1>
            <p style={{marginBottom: '1.5rem', color: '#94a3b8'}}>
              The application encountered a critical error and cannot display the dashboard.
            </p>
            
            <div style={{
                backgroundColor: '#1e293b', 
                border: '1px solid #334155', 
                borderRadius: '0.5rem', 
                padding: '1.5rem',
                overflowX: 'auto',
                marginBottom: '2rem'
            }}>
                <code style={{ fontFamily: 'monospace', color: '#fca5a5' }}>
                    {this.state.error?.message || "Unknown Error"}
                </code>
            </div>

            <button 
              onClick={() => window.location.reload()}
              style={{
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  border: 'none', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
              }}
            >
              Reload Application
            </button>

            <p style={{marginTop: '2rem', fontSize: '0.875rem', color: '#64748b'}}>
                Tip: Check if your VITE_API_KEY is correctly set in Vercel Environment Variables.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
  </React.StrictMode>
);