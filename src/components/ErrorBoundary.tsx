import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { formatFirestoreUiError } from '../firebase';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: formatFirestoreUiError(error),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h1 className="text-lg font-display font-bold text-[#0B162C]">
                  Workspace Data Error
                </h1>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed break-words">
                  {this.state.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Return to RexoraTech</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
