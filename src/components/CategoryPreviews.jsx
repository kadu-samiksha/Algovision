// Small, quiet CSS/SVG previews for the category cards. Decorative only (aria-hidden).
export function SortingPreview() {
  const h = [38, 62, 24, 78, 50, 92, 30];
  return (
    <div className="preview preview--bars" aria-hidden="true">
      {h.map((v, i) => <span key={i} style={{ height: `${v}%` }} data-hl={i === 3 ? 'swap' : i === 4 ? 'compare' : undefined} />)}
    </div>
  );
}
export function SearchingPreview() {
  const v = [3, 8, 14, 21, 27, 35, 42];
  return (
    <div className="preview preview--cells" aria-hidden="true">
      {v.map((x, i) => <span key={x} data-hl={i === 3 ? 'mid' : undefined}>{x}</span>)}
    </div>
  );
}
export function ListPreview() {
  return (
    <svg className="preview" viewBox="0 0 220 70" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${12 + i * 68} 20)`}>
          <rect width="38" height="30" rx="5" className="pv-box" />
          <rect x="38" width="16" height="30" rx="0" className="pv-ptr" />
          <path d={`M54 15 h${i < 2 ? 12 : 8}`} className="pv-line" />
          {i < 2 && <path d="M62 10 l6 5 -6 5" className="pv-line" fill="none" />}
        </g>
      ))}
      <text x="198" y="39" className="pv-text">null</text>
    </svg>
  );
}
export function StackQueuePreview() {
  return (
    <svg className="preview" viewBox="0 0 220 70" aria-hidden="true">
      {[0, 1, 2].map((i) => <rect key={i} x="18" y={46 - i * 18} width="52" height="14" rx="3" className={i === 2 ? 'pv-box pv-hl' : 'pv-box'} />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={100 + i * 30} y="26" width="24" height="24" rx="3" className={i === 0 ? 'pv-box pv-hl' : 'pv-box'} />)}
    </svg>
  );
}
export function TreePreview() {
  const edges = [[110, 14, 70, 38], [110, 14, 150, 38], [70, 38, 48, 62], [70, 38, 92, 62], [150, 38, 128, 62]];
  const nodes = [[110, 14], [70, 38], [150, 38], [48, 62], [92, 62], [128, 62]];
  return (
    <svg className="preview" viewBox="0 0 220 76" aria-hidden="true">
      {edges.map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} className="pv-line" />)}
      {nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" className={i === 1 ? 'pv-box pv-hl' : 'pv-box'} />)}
    </svg>
  );
}
export const PREVIEWS = {
  sorting: SortingPreview,
  searching: SearchingPreview,
  'linked-lists': ListPreview,
  'stack-queue': StackQueuePreview,
  trees: TreePreview,
};
