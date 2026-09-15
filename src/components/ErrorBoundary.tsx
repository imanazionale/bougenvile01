import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { safeStorage } from '../lib/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Terjadi kesalahan sistem yang tidak terduga',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Captured error in ErrorBoundary:', error, errorInfo);
  }

  private handleResetAndReload = () => {
    safeStorage.remove('ad_hero_photo');
    safeStorage.remove('ad_mezzanine_photo');
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0E1013] text-neutral-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Memulihkan Aplikasi</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Terjadi kendala pada pemrosesan aset atau data tampilan. Anda dapat memuat ulang aplikasi dengan foto bawaan asli.
            </p>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Muat Ulang Aplikasi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
