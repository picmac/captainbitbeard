import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ocean-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-ocean p-8 border-4 border-wood-brown">
            <h1 className="text-2xl text-gold mb-4 font-bold">⚠️ Ahoy! Error Ahead</h1>
            <p className="text-skull-white mb-4">
              The ship has encountered rough seas. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-gold cursor-pointer mb-2">Error Details</summary>
                <pre className="text-xs bg-night-sky p-2 overflow-auto text-blood-red">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-retro w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
