import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Sidebar } from './components/Sidebar';
import { ChaosMeter } from './components/ChaosMeter';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LandingPage } from './components/LandingPage';
import { LegalPage } from './components/Legal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LEVELS } from './constants';
import { GameState } from './types';

export type ViewState = 'landing' | 'game' | 'privacy' | 'terms';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    levelIndex: 0,
    nodes: [],
    connections: [],
    status: 'playing',
    chaos: 0,
  });

  const currentLevel = LEVELS[currentLevelIndex];

  useEffect(() => {
    setGameState({
      levelIndex: currentLevelIndex,
      nodes: [],
      connections: [],
      status: 'playing',
      chaos: 0,
    });
  }, [currentLevelIndex]);

  const handleSpawnNode = (id: string, label: string, color: string) => {
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
    
    setGameState(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id, label, color, x, y, radius: 40 }]
    }));
  };

  const nextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      alert("You are a SQL Master! Returning to level 1.");
      setCurrentLevelIndex(0);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onNavigate={setView} />;
      case 'privacy':
        return <LegalPage title="Privacy Policy" onBack={() => setView('landing')} />;
      case 'terms':
        return <LegalPage title="Terms of Service" onBack={() => setView('landing')} />;
      case 'game':
        return (
          <div className="relative w-screen h-screen bg-slate-900 overflow-hidden select-none animate-[fadeIn_0.5s_ease-out]">
            <GameCanvas 
              level={currentLevel} 
              gameState={gameState} 
              setGameState={setGameState}
              onLevelComplete={() => setGameState(prev => ({ ...prev, status: 'won' }))}
              onOverflow={() => setGameState(prev => ({ ...prev, status: 'overflow' }))}
            />
            
            <Sidebar 
              level={currentLevel} 
              spawnNode={handleSpawnNode} 
              existingNodes={gameState.nodes}
            />
            
            <ChaosMeter chaos={gameState.chaos} />

            {(gameState.status === 'won' || gameState.status === 'overflow') && (
              <LevelCompleteModal 
                status={gameState.status} 
                onNext={nextLevel} 
                onRetry={() => setGameState(prev => ({ ...prev, status: 'playing', chaos: 0, connections: [], nodes: [] }))} 
              />
            )}

            <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none opacity-50 text-[10px] text-slate-500 font-mono">
              SQL Master v1.1 • Canvas API • React 19
            </div>
            
            <button 
              onClick={() => setView('landing')}
              className="absolute top-4 right-1/2 translate-x-1/2 opacity-30 hover:opacity-100 transition-opacity text-xs text-slate-400 border border-slate-700 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800"
              aria-label="Exit to Menu"
            >
              EXIT TO MENU
            </button>
          </div>
        );
      default:
        return <LandingPage onNavigate={setView} />;
    }
  };

  return (
    <ErrorBoundary>
      {renderContent()}
    </ErrorBoundary>
  );
}