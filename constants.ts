import { JoinType, LevelConfig } from './types';

export const COLORS = {
  background: '#0f172a',
  nodeDefault: '#3b82f6',
  nodeHighlight: '#60a5fa',
  connectionInner: '#ffffff', // Clean white intersection
  connectionLeft: '#a855f7', // Purple expansion
  connectionRight: '#ec4899', // Pink expansion
  connectionFull: '#ef4444', // Red (often dangerous/heavy)
  particleGood: '#4ade80',
  particleBad: '#ef4444',
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "The Intersection",
    description: "Find users who have placed an order. Connect Users to Orders using an Inner Join.",
    availableTables: [
      { id: 'users', label: 'Users', color: '#0ea5e9' },
      { id: 'orders', label: 'Orders', color: '#f59e0b' },
    ],
    requiredConnections: [
      { sourceId: 'users', targetId: 'orders', joinType: JoinType.INNER },
    ],
  },
  {
    id: 2,
    title: "No Order Left Behind",
    description: "List ALL users, and their orders if they have any. Use a Left Join from Users to Orders.",
    availableTables: [
      { id: 'users', label: 'Users', color: '#0ea5e9' },
      { id: 'orders', label: 'Orders', color: '#f59e0b' },
    ],
    requiredConnections: [
      { sourceId: 'users', targetId: 'orders', joinType: JoinType.LEFT },
    ],
    strictDirection: true,
  },
  {
    id: 3,
    title: "Global Supply Chain",
    description: "Find Products in Orders that were shipped to 'Paris'. Connect Products -> Orders -> Cities(Paris). All connections must be exclusive (Inner).",
    availableTables: [
      { id: 'products', label: 'Products', color: '#10b981' },
      { id: 'orders', label: 'Orders', color: '#f59e0b' },
      { id: 'cities', label: 'Cities (Paris)', color: '#8b5cf6' },
    ],
    requiredConnections: [
      { sourceId: 'products', targetId: 'orders', joinType: JoinType.INNER },
      { sourceId: 'orders', targetId: 'cities', joinType: JoinType.INNER },
    ],
  },
  {
    id: 4,
    title: "Data Integrity Check",
    description: "Identify mismatched records between Legacy and New Systems using a Full Outer Join.",
    availableTables: [
      { id: 'legacy', label: 'Legacy DB', color: '#64748b' },
      { id: 'new', label: 'New Cloud', color: '#38bdf8' },
    ],
    requiredConnections: [
      { sourceId: 'legacy', targetId: 'new', joinType: JoinType.FULL },
    ],
  },
];