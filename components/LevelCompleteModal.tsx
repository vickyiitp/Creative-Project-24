import React from 'react';

interface Props {
  status: 'won' | 'overflow';
  onNext: () => void;
  onRetry: () => void;
}

export const LevelCompleteModal: React.FC<Props> = ({ status, onNext, onRetry }) => {
  if (status === 'won') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-emerald-500/50 p-8 rounded-2xl shadow-2xl max-w-md text-center transform scale-100 animate-[fadeIn_0.3s_ease-out]">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-emerald-400 mb-2">Query Optimized!</h2>
          <p className="text-slate-300 mb-8">The data is flowing perfectly. Excellent work architect.</p>
          <button 
            onClick={onNext}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Next Level
          </button>
        </div>
      </div>
    );
  }

  if (status === 'overflow') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
        <div className="bg-slate-900 border border-red-500/50 p-8 rounded-2xl shadow-2xl max-w-md text-center">
           <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-red-500 mb-2">Data Overflow!</h2>
          <p className="text-slate-300 mb-8">Your join logic created an infinite loop or Cartesian explosion. The system crashed.</p>
          <button 
            onClick={onRetry}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
          >
            Reset System
          </button>
        </div>
      </div>
    );
  }

  return null;
};