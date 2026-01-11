import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../App';

interface Props {
  onNavigate: (view: ViewState) => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const isMobile = w < 768;
    const particleCount = isMobile ? 35 : 70;
    const connectionDistance = isMobile ? 110 : 160;

    const points: {x: number, y: number, vx: number, vy: number, size: number}[] = [];
    for(let i=0; i<particleCount; i++) {
        points.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1
        });
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
        time += 0.005;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        
        // Draw subtle grid
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)'; // Cyan trace
        ctx.lineWidth = 1;
        const gridSize = 60;
        const offsetX = (time * 10) % gridSize;
        const offsetY = (time * 10) % gridSize;

        for(let x = offsetX; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for(let y = offsetY; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Update and draw particles
        points.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            
            if(p.x < 0 || p.x > w) p.vx *= -1;
            if(p.y < 0 || p.y > h) p.vy *= -1;

            // Draw glowing node
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            glow.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Connections
            for(let j=i+1; j<points.length; j++) {
                const p2 = points[j];
                const d = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
                if(d < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(34, 211, 238, ${0.15 * (1 - d/connectionDistance)})`;
                    ctx.stroke();
                }
            }
        });
        animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" aria-hidden="true" />
        
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-white/5 bg-slate-900/60 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <div className="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-[Orbitron] hover:brightness-125 transition-all cursor-pointer">
                SQL MASTER
            </div>

            <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => scrollToSection('mechanics')} className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Mechanics</button>
                <button onClick={() => scrollToSection('story')} className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Story</button>
                <button onClick={() => onNavigate('game')} className="group relative px-6 py-2 rounded-full overflow-hidden border border-cyan-500/30 hover:border-cyan-400 transition-all text-xs font-bold tracking-widest font-[Orbitron] uppercase">
                    <div className="absolute inset-0 w-full h-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all"></div>
                    <span className="relative z-10 text-cyan-400 group-hover:text-cyan-200">Launch_Terminal</span>
                </button>
            </div>

            <button 
              className="md:hidden text-cyan-400 focus:outline-none p-2 hover:bg-white/5 rounded-lg transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    )}
                </svg>
            </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8 transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <button onClick={() => scrollToSection('mechanics')} className="text-2xl font-bold text-slate-300 hover:text-cyan-400 font-[Orbitron]">MECHANICS</button>
             <button onClick={() => scrollToSection('story')} className="text-2xl font-bold text-slate-300 hover:text-cyan-400 font-[Orbitron]">THE STORY</button>
             <button onClick={() => { setIsMenuOpen(false); onNavigate('game'); }} className="px-8 py-4 bg-cyan-600/20 border border-cyan-500 text-cyan-400 font-bold rounded-lg font-[Orbitron] shadow-[0_0_20px_rgba(34,211,238,0.2)]">LAUNCH GAME</button>
        </div>

        {/* Hero Section */}
        <header className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-sm text-cyan-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase font-[Orbitron] shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <span className="animate-pulse">●</span> System V.1.0 Online
            </div>

            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8 font-[Montserrat] z-10 leading-none">
                <span className="block text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.15)] animate-float">VISUALIZE</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-float-delayed">THE FLOW</span>
            </h1>
            
            <p className="max-w-2xl text-lg md:text-xl text-slate-300 mb-12 z-10 leading-relaxed font-light px-4 drop-shadow-lg">
                Master the art of <span className="text-cyan-400 font-bold border-b border-cyan-500/50">Relational Logic</span> in a stunning abstract environment. 
                Drag, connect, and filter data streams to save the network from chaos.
            </p>

            <button 
                onClick={() => onNavigate('game')}
                className="group relative z-10 px-10 py-5 md:px-14 md:py-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg md:text-xl tracking-[0.2em] uppercase rounded-sm transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_80px_rgba(34,211,238,0.6)] hover:-translate-y-1 font-[Orbitron] overflow-hidden"
            >
                <span className="relative z-10">Play Now</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            <div className="absolute bottom-10 animate-bounce text-slate-500 z-10 opacity-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
        </header>

        {/* Mechanics Section */}
        <section id="mechanics" className="relative z-10 py-24 md:py-32 px-4 bg-slate-900/50 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 font-[Orbitron] text-white tracking-tight">SYSTEM MECHANICS</h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 mx-auto rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="group relative p-8 md:p-10 rounded-3xl bg-slate-800/40 border border-white/5 backdrop-blur-md overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(6,182,212,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-bold mb-4 text-white font-[Orbitron] group-hover:text-cyan-300 transition-colors">Connect Nodes</h3>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base group-hover:text-slate-300 transition-colors">
                            Drag distinct data tables and forge connections using the visual interface. Establish the neural pathways of your database.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="group relative p-8 md:p-10 rounded-3xl bg-slate-800/40 border border-white/5 backdrop-blur-md overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-bold mb-4 text-white font-[Orbitron] group-hover:text-purple-300 transition-colors">Filter Logic</h3>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base group-hover:text-slate-300 transition-colors">
                            Apply specific JOIN types (Inner, Left, Full) to refine the flow. Logic errors result in immediate system instability and chaos.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="group relative p-8 md:p-10 rounded-3xl bg-slate-800/40 border border-white/5 backdrop-blur-md overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]">
                         <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-bold mb-4 text-white font-[Orbitron] group-hover:text-emerald-300 transition-colors">Execute & Solve</h3>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base group-hover:text-slate-300 transition-colors">
                            Complete the graph to achieve 100% flow efficiency. Optimization is key to unlocking advanced security tiers.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Story Section */}
        <section id="story" className="relative z-10 py-24 md:py-32 px-4 border-t border-white/5 bg-slate-900 scroll-mt-20 overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900 pointer-events-none"></div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
                 <h2 className="text-3xl md:text-6xl font-black mb-8 md:mb-10 font-[Orbitron] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 animate-gradient-x">
                    THE DATAVERSE NEEDS YOU
                </h2>
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/5 shadow-2xl">
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed md:leading-9 mb-8 font-light px-4">
                      In a world drowned in unorganized information, the structure of reality is fraying.
                      As a newly awakened <strong className="text-cyan-400 font-bold glow-text">Architect</strong>, your ability to visualize relationships is the only thing standing between order and total entropy. 
                      Dive into the stream. Make the connections. Restore the flow.
                  </p>
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-8" />
                  
                  <button 
                      onClick={() => onNavigate('game')}
                      className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-200 font-[Orbitron] font-bold tracking-widest uppercase transition-all hover:scale-105"
                  >
                      <span>Initiate Sequence</span>
                      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4 border-t border-white/5 bg-slate-950">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
                <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold text-white font-[Orbitron] mb-2 tracking-wide">Vickyiitp</h4>
                    <p className="text-slate-500 text-sm mb-2">&copy; 2025 Vicky Kumar. All Rights Reserved.</p>
                    <a href="mailto:themvaplatform@gmail.com" className="text-cyan-600 hover:text-cyan-400 text-sm transition-colors">themvaplatform@gmail.com</a>
                </div>

                <div className="flex space-x-6">
                    <a href="https://linkedin.com/in/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors transform hover:scale-110 hover:-translate-y-1" aria-label="LinkedIn">
                         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a href="https://x.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors transform hover:scale-110 hover:-translate-y-1" aria-label="X (Twitter)">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://github.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors transform hover:scale-110 hover:-translate-y-1" aria-label="GitHub">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                     <a href="https://instagram.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors transform hover:scale-110 hover:-translate-y-1" aria-label="Instagram">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    <a href="https://youtube.com/@vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors transform hover:scale-110 hover:-translate-y-1" aria-label="YouTube">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    </a>
                </div>

                <div className="flex space-x-6 text-sm text-slate-500">
                    <button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
                    <button onClick={() => onNavigate('terms')} className="hover:text-cyan-400 transition-colors">Terms of Service</button>
                </div>
            </div>
        </footer>

        <button 
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 p-4 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 z-50 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            aria-label="Back to Top"
        >
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
    </div>
  );
};