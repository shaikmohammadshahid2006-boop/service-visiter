import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('svt_user');
      localStorage.removeItem('svt_profile');
      localStorage.removeItem('svt_token');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              The application encountered an unexpected runtime error. This can happen if local storage contains outdated session data or if the backend API returned an unexpected response.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center mb-6">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset & Reload App</span>
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600">
                <summary className="font-semibold cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  Technical Error Details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] text-rose-600 bg-rose-50/50 p-2 rounded border border-rose-100 overflow-x-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

