import { layoutTree } from '../algorithms/trees/tree.js';

export function TreeLegend() {
  return (
    <ul className="legend" aria-label="Legend">
      <li><span className="legend__swatch tree-swatch" data-state="current" /> Current node</li>
      <li><span className="legend__swatch tree-swatch" data-state="visited" /> Visited (number shows the visit order)</li>
      <li><span className="legend__swatch tree-swatch" data-state="waiting" /> Waiting in the call stack or queue</li>
    </ul>
  );
}

/** Responsive SVG tree. Layout: x from inorder rank, y from depth. Highlights come from the step. */
export default function TreeSvg({ nodes, root, step, small = false }) {
  if (root === null) return <p className="muted tree-empty">The tree is empty. There is nothing to draw or visit.</p>;
  const { positions, edges, width, height } = layoutTree(nodes, root);
  const pos = Object.fromEntries(positions.map((p) => [p.id, p]));
  const visited = step?.visited ?? [];
  const waiting = new Set(step?.stack ?? []);
  const R = small ? 15 : 18;
  return (
    <div className={`tree${small ? ' tree--small' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height + (small ? 0 : 14)}`} style={{ width: '100%', maxWidth: width * (small ? 0.8 : 1.15), minWidth: Math.min(width, small ? 220 : 520) }}
        role="img" aria-label={`Binary tree with ${nodes.length} nodes. Level-order: ${nodes.map((n) => n.value).join(', ')}`}>
        {edges.map((e) => (
          <line key={`${e.from}-${e.to}`} x1={pos[e.from].x} y1={pos[e.from].y} x2={pos[e.to].x} y2={pos[e.to].y} className="tree__edge" />
        ))}
        {positions.map((p) => {
          const order = visited.indexOf(p.id);
          const state = step?.current === p.id ? 'current' : order >= 0 ? 'visited' : waiting.has(p.id) ? 'waiting' : 'default';
          return (
            <g key={p.id} className="tree__node" data-state={state}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" className="tree__value">{p.value}</text>
              {!small && order >= 0 && <text x={p.x} y={p.y + R + 12} textAnchor="middle" className="tree__order">{order + 1}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
