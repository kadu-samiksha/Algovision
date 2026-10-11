import { Fragment } from 'react';
import { Check } from 'lucide-react';

export function ListLegend() {
  return (
    <ul className="legend" aria-label="Legend">
      <li><span className="legend__swatch cell-swatch" data-state="current" /> cur: node being examined</li>
      <li><span className="legend__swatch cell-swatch" data-state="prev" /> prev: node before the change</li>
      <li><span className="legend__swatch cell-swatch" data-state="found" /> Found or newly linked</li>
      <li><span className="legend__swatch cell-swatch" data-state="removing" /> Being unlinked</li>
    </ul>
  );
}

/** Draws exactly the node chain stored in the current step: HEAD, nodes with arrows, NULL. */
export default function ListView({ step }) {
  const { nodes, floating } = step;
  const stateOf = (n) => {
    if (step.removing === n.id) return 'removing';
    if (step.found === n.id) return 'found';
    if ((step.type === 'move-head' || step.type === 'link') && step.current === n.id) return 'new';
    if (step.current === n.id) return 'current';
    if (step.prev === n.id) return 'prev';
    return 'default';
  };
  const tagOf = (n, state) => ({ removing: 'unlinked', found: 'found', new: 'new', current: 'cur', prev: 'prev' }[state] ?? '');
  return (
    <div className="ll" role="img" aria-label={`Linked list: HEAD, ${nodes.map((n) => n.value).join(', ') || 'nothing'}, NULL`}>
      <div className="ll__row">
        <div className="ll__ends">HEAD</div>
        <span className="ll-arrow" aria-hidden="true">→</span>
        {nodes.map((n) => {
          const state = stateOf(n);
          return (
            <Fragment key={n.id}>
              <div className="ll-node" data-state={state}>
                <span className="ll-node__val">{n.value}{state === 'found' && <Check size={13} aria-hidden="true" />}</span>
                <span className="ll-node__ptr" aria-hidden="true">next</span>
                <span className="ll-node__tag" aria-hidden="true">{tagOf(n, state)}</span>
              </div>
              <span className={`ll-arrow${step.bypass === n.id ? ' ll-arrow--bypass' : ''}`} aria-hidden="true">{step.bypass === n.id ? '⤏' : '→'}</span>
            </Fragment>
          );
        })}
        <div className="ll__ends ll__ends--null">NULL</div>
      </div>
      {floating && (
        <div className="ll__float" aria-hidden="true">
          <span className="chip">New node</span>
          <div className="ll-node" data-state="floating">
            <span className="ll-node__val">{floating.value}</span>
            <span className="ll-node__ptr">next → {floating.next === null ? 'null' : floating.next}</span>
          </div>
        </div>
      )}
    </div>
  );
}
