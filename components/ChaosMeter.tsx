import React from 'react';

export const ChaosMeter: React.FC<{ chaos: number }> = ({ chaos }) => {
  return (
    <div className="absolute top-4 right-4 w-64 p-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl z-10">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Data Stability</span>
        <span className={`text-xs font-bold ${chaos > 80 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
          {chaos < 50 ? 'STABLE' : chaos < 80 ? 'UNSTABLE' : 'CRITICAL'}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ease-out ${
            chaos > 80 ? 'bg-red-500' : chaos > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${chaos}%` }}
        />
      </div>
      {chaos > 0 && (
        <p className="mt-2 text-[10px] text-red-400 font-mono">
          Warning: Incorrect JOIN logic detected.
        </p>
      )}
    </div>
  );
};