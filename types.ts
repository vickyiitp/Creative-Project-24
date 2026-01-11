export enum JoinType {
  INNER = 'INNER',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  FULL = 'FULL',
}

export interface TableNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  radius: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  joinType: JoinType;
}

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  availableTables: { id: string; label: string; color: string }[];
  requiredConnections: { sourceId: string; targetId: string; joinType: JoinType }[];
  // If true, the order of source/target matters strictly
  strictDirection?: boolean; 
}

export interface GameState {
  levelIndex: number;
  nodes: TableNode[];
  connections: Connection[];
  status: 'playing' | 'won' | 'overflow';
  chaos: number; // 0 to 100
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  sourceId: string;
  targetId?: string;
}