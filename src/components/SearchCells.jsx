import { Check } from 'lucide-react';

export function SearchLegend({ binary }) {
  return (
    <ul className="legend" aria-label="Legend">
      <li><span className="legend__swatch cell-swatch" data-state="current" /> Being checked</li>
      <li><span className="legend__swatch cell-swatch" data-state="eliminated" /> Ruled out</li>
      <li><span className="legend__swatch cell-swatch" data-state="found" /> Found</li>
      {binary && <li><span className="legend__swatch cell-swatch" data-state="range" /> Still in the search space (L left, R right, mid middle)</li>}
    </ul>
  );
}

export default function SearchCells({ array, step, binary }) {
  return (
    <ol className="cells" aria-label={`Array: ${array.join(', ')}`}>
      {array.map((v, i) => {
        let state = 'default';
        if (step.found === i) state = 'found';
        else if (step.current === i) state = 'current';
        else if (step.eliminated[i]) state = 'eliminated';
        else if (binary && step.left !== null && step.right !== null && i >= step.left && i <= step.right) state = 'range';
        const tags = [];
        if (binary) {
          if (i === step.left) tags.push('L');
          if (i === step.mid) tags.push('mid');
          if (i === step.right) tags.push('R');
        } else if (step.current === i && step.found !== i) tags.push('i');
        return (
          <li className="cell" data-state={state} key={i}>
            <span className="cell__index" aria-hidden="true">{i}</span>
            <span className="cell__value">{v}{state === 'found' && <Check size={14} aria-label="found" />}</span>
            <span className="cell__tag" aria-hidden="true">{tags.join(' ')}</span>
          </li>
        );
      })}
    </ol>
  );
}
