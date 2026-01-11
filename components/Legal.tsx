import React from 'react';

interface Props {
  onBack: () => void;
  title: string;
}

export const LegalPage: React.FC<Props> = ({ onBack, title }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 md:p-16 font-sans">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-mono uppercase text-sm tracking-wider"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Terminal
        </button>
        
        <h1 className="text-4xl font-bold text-white mb-8 font-[Orbitron]">{title}</h1>
        
        <div className="space-y-6 bg-slate-800/50 p-8 rounded-xl border border-slate-700">
          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-2">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to SQL Master. By accessing this application, you agree to comply with our protocols for data visualization and logic puzzle engagement. This is a demonstration of data security and puzzle mechanics.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-2">2. Data Usage</h2>
            <p className="leading-relaxed">
              We do not collect personal data from your neural interface. All game logic is processed locally within your browser's execution environment. No backend servers store your puzzle solutions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-cyan-400 mb-2">3. Intellectual Property</h2>
            <p className="leading-relaxed">
              The visual algorithms, abstract assets, and "Chaos Meter" mechanics are the intellectual property of the developer. Unauthorized replication of the source code may result in digital overflow.
            </p>
          </section>
          
          <section>
             <p className="text-sm text-slate-500 mt-8 pt-4 border-t border-slate-700">Last Updated: 2025-01-01</p>
          </section>
        </div>
      </div>
    </div>
  );
};