import React, { useState } from 'react';
import { LevelConfig, TableNode } from '../types';

interface SidebarProps {
  level: LevelConfig;
  spawnNode: (tableId: string, label: string, color: string) => void;
  existingNodes: TableNode[];
}

export const Sidebar: React.FC<SidebarProps> = ({ level, spawnNode, existingNodes }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden absolute top-4 left-4 z-20 p-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded text-cyan-400 shadow-lg"
        aria-label={isCollapsed ? "Open Guide" : "Close Guide"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
        </svg>
      </button>

      <div className={`absolute top-16 md:top-4 left-4 w-72 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10 text-slate-100 transition-all duration-300 origin-top-left ${isCollapsed ? 'scale-0 md:scale-100 opacity-0 md:opacity-100' : 'scale-100 opacity-100'}`}>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-[Orbitron] tracking-wide">
            {level.title}
            </h2>
            <div className="text-[10px] text-slate-500 font-mono border border-slate-700 px-1 rounded">LVL {level.id}</div>
        </div>
        
        <p className="text-sm text-slate-300 mb-6 leading-relaxed border-b border-white/5 pb-4">
          {level.description}
        </p>

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-2">Data Sources</h3>
          {level.availableTables.map((table) => {
            const isPlaced = existingNodes.some(n => n.id === table.id);
            return (
              <button
                key={table.id}
                onClick={() => !isPlaced && spawnNode(table.id, table.label, table.color)}
                disabled={isPlaced}
                className={`group w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 relative overflow-hidden
                  ${isPlaced 
                    ? 'border-slate-800 bg-slate-800/30 text-slate-600 cursor-not-allowed' 
                    : 'border-slate-700 bg-slate-800/60 hover:border-cyan-400/50 hover:bg-slate-700/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                  }`}
              >
                {!isPlaced && <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                <span className="font-mono font-bold text-sm relative z-10">{table.label}</span>
                <div 
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] relative z-10 transition-transform group-hover:scale-125" 
                  style={{ backgroundColor: table.color, opacity: isPlaced ? 0.3 : 1 }} 
                />
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-slate-950/50 rounded-xl text-xs text-slate-400 border border-slate-800 font-mono">
          <div className="flex items-start mb-2">
             <span className="text-cyan-500 mr-2">➜</span>
             <p><span className="text-slate-200">Drag</span> nodes to reposition.</p>
          </div>
          <div className="flex items-start mb-2">
             <span className="text-cyan-500 mr-2">➜</span>
             <p><span className="text-slate-200">Drag from edge</span> to connect.</p>
          </div>
          <div className="flex items-start">
             <span className="text-cyan-500 mr-2">➜</span>
             <p><span className="text-slate-200">Click link</span> to toggle JOIN.</p>
          </div>
        </div>
      </div>
    </>
  );
};