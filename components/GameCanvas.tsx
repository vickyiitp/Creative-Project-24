import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Connection, GameState, JoinType, LevelConfig, TableNode, Particle } from '../types';
import { COLORS } from '../constants';

interface GameCanvasProps {
  level: LevelConfig;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onLevelComplete: () => void;
  onOverflow: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  level, 
  gameState, 
  setGameState,
  onLevelComplete,
  onOverflow
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [creatingConnection, setCreatingConnection] = useState<{ sourceId: string, currentX: number, currentY: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Refs for animation loop
  const stateRef = useRef(gameState);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Sync state ref
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Check Win/Lose Conditions
  useEffect(() => {
    const checkWinCondition = () => {
      const { connections } = stateRef.current;
      const { requiredConnections, strictDirection } = level;

      if (connections.length !== requiredConnections.length) return false;

      const allMatched = requiredConnections.every(req => {
        return connections.some(conn => {
          const typeMatch = conn.joinType === req.joinType;
          const directMatch = conn.sourceId === req.sourceId && conn.targetId === req.targetId;
          const reverseMatch = !strictDirection && conn.sourceId === req.targetId && conn.targetId === req.sourceId;
          
          if (req.joinType === JoinType.INNER || req.joinType === JoinType.FULL) {
             return typeMatch && (directMatch || reverseMatch);
          }
          return typeMatch && directMatch;
        });
      });

      return allMatched;
    };

    if (stateRef.current.status === 'playing') {
      const isWin = checkWinCondition();
      if (isWin) {
        onLevelComplete();
      } else if (stateRef.current.chaos >= 100) {
        onOverflow();
      }
    }
  }, [gameState.connections, gameState.chaos, level, onLevelComplete, onOverflow]);

  // Main Game Loop
  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    // const deltaTime = time - lastTimeRef.current; // unused currently but useful for physics
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear Canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Background
    const gridSize = 40;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)'; // Dark subtle grid lines
    
    // Dynamic offset based on time for "moving" effect (optional, kept static for gameplay clarity)
    // const offset = (time / 50) % gridSize; 
    const offset = 0;

    for (let x = offset; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = offset; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }


    const { nodes, connections } = stateRef.current;

    // 1. Draw Connections
    connections.forEach(conn => {
      const source = nodes.find(n => n.id === conn.sourceId);
      const target = nodes.find(n => n.id === conn.targetId);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      const cx = (source.x + target.x) / 2;
      const cy = (source.y + target.y) / 2;
      ctx.quadraticCurveTo(cx, cy - 50, target.x, target.y); 
      
      let strokeColor = COLORS.connectionInner;
      if (conn.joinType === JoinType.LEFT) strokeColor = COLORS.connectionLeft;
      if (conn.joinType === JoinType.RIGHT) strokeColor = COLORS.connectionRight;
      if (conn.joinType === JoinType.FULL) strokeColor = COLORS.connectionFull;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.setLineDash(conn.joinType === JoinType.LEFT || conn.joinType === JoinType.RIGHT ? [5, 5] : []);
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0; // Reset

      // Connection Label Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      const textWidth = ctx.measureText(conn.joinType).width;
      ctx.fillRect(cx - textWidth/2 - 4, cy - 70, textWidth + 8, 16);

      ctx.fillStyle = strokeColor;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(conn.joinType, cx, cy - 60);
    });

    // 2. Draw Creating Connection Line
    if (creatingConnection) {
      const source = nodes.find(n => n.id === creatingConnection.sourceId);
      if (source) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(creatingConnection.currentX, creatingConnection.currentY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 3. Update & Draw Particles
    connections.forEach(conn => {
      if (Math.random() < 0.1) { 
        const source = nodes.find(n => n.id === conn.sourceId);
        if (source) {
           const req = level.requiredConnections.find(r => 
             (r.sourceId === conn.sourceId && r.targetId === conn.targetId && r.joinType === conn.joinType) ||
             (!level.strictDirection && r.sourceId === conn.targetId && r.targetId === conn.sourceId && r.joinType === conn.joinType)
           );
           const isBad = !req;

           particlesRef.current.push({
             x: source.x,
             y: source.y,
             vx: 0, 
             vy: 0,
             life: 1.0,
             color: isBad ? COLORS.particleBad : COLORS.particleGood,
             sourceId: conn.sourceId,
             targetId: conn.targetId
           });

           if (isBad && stateRef.current.status === 'playing') {
             setGameState(prev => ({ ...prev, chaos: Math.min(100, prev.chaos + 0.05) }));
           } else if (stateRef.current.status === 'playing') {
             setGameState(prev => ({ ...prev, chaos: Math.max(0, prev.chaos - 0.02) }));
           }
        }
      }
    });

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      const source = nodes.find(n => n.id === p.sourceId);
      const target = nodes.find(n => n.id === p.targetId);

      if (source && target) {
        const t = 1 - p.life;
        const cx = (source.x + target.x) / 2;
        const cy = (source.y + target.y) / 2 - 50;
        
        const b1 = (1-t)*(1-t);
        const b2 = 2*(1-t)*t;
        const b3 = t*t;

        const nextX = b1*source.x + b2*cx + b3*target.x;
        const nextY = b1*source.y + b2*cy + b3*target.y;

        p.x = nextX;
        p.y = nextY;
        p.life -= 0.01; 
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      } else {
        particlesRef.current.splice(i, 1);
      }
    }

    // 4. Draw Nodes
    nodes.forEach(node => {
      // Glow/Pulse Effect
      const pulse = Math.sin(time / 200) * 5;
      const glow = ctx.createRadialGradient(node.x, node.y, node.radius * 0.5, node.x, node.y, node.radius * 2 + pulse);
      glow.addColorStop(0, node.color);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 2 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Main Orb Body
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a'; // Dark core
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Inner Highlight
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = `${node.color}55`; // Semi-transparent inner ring
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(node.label, node.x, node.y);
      ctx.shadowBlur = 0;
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [gameState, level, setGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    });
    
    resizeObserver.observe(container);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
    };
  }, [animate]);


  // Input Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameState.status !== 'playing') return;
    const { nodes, connections } = stateRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const conn of connections) {
      const s = nodes.find(n => n.id === conn.sourceId);
      const t = nodes.find(n => n.id === conn.targetId);
      if (s && t) {
        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2 - 50; 
        if (Math.sqrt((x - mx) ** 2 + (y - my) ** 2) < 25) {
             const types = [JoinType.INNER, JoinType.LEFT, JoinType.RIGHT, JoinType.FULL];
             const nextIndex = (types.indexOf(conn.joinType) + 1) % types.length;
             const nextType = types[nextIndex];
             setGameState(prev => ({
               ...prev,
               connections: prev.connections.map(c => c.id === conn.id ? { ...c, joinType: nextType } : c)
             }));
             return;
        }
      }
    }

    const clickedNode = nodes.find(n => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < n.radius + 10);
    
    if (clickedNode) {
      if (e.shiftKey || e.button === 2) {
        setCreatingConnection({ sourceId: clickedNode.id, currentX: x, currentY: y });
      } else {
        setDraggedNode(clickedNode.id);
        setDragStart({ x: x - clickedNode.x, y: y - clickedNode.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { nodes } = stateRef.current;
    const hovered = nodes.find(n => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < n.radius);
    setHoveredNode(hovered ? hovered.id : null);
    if (canvasRef.current) canvasRef.current.style.cursor = hovered ? 'grab' : 'default';

    if (draggedNode && dragStart) {
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      setGameState(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggedNode ? { ...n, x: x - dragStart.x, y: y - dragStart.y } : n)
      }));
    }

    if (creatingConnection) {
      setCreatingConnection(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedNode) {
      setDraggedNode(null);
      setDragStart(null);
    }

    if (creatingConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { nodes, connections } = stateRef.current;
        const targetNode = nodes.find(n => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < n.radius + 10);

        if (targetNode && targetNode.id !== creatingConnection.sourceId) {
          const exists = connections.some(c => 
            (c.sourceId === creatingConnection.sourceId && c.targetId === targetNode.id) ||
            (c.targetId === creatingConnection.sourceId && c.sourceId === targetNode.id)
          );

          if (!exists) {
            setGameState(prev => ({
              ...prev,
              connections: [...prev.connections, {
                id: Math.random().toString(36).substr(2, 9),
                sourceId: creatingConnection.sourceId,
                targetId: targetNode.id,
                joinType: JoinType.INNER
              }]
            }));
          }
        }
      }
      setCreatingConnection(null);
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="block touch-none"
        aria-label="Game Canvas: Connect data nodes to solve the puzzle"
        role="img"
      />
    </div>
  );
};