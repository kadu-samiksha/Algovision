import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const TOKEN = /(\/\/.*$)|\b(static|void|for|if|else|while|break|return|new|boolean|int|class|private|final|throw|true|false|null)\b|(\b\d+\b)/g;

function highlight(line) {
  const out = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? 'tok-comment' : m[2] ? 'tok-keyword' : 'tok-number';
    out.push(<span className={cls} key={m.index}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** `java` is { lines, notes }. When it is missing, the panel says the code is unavailable. */
export default function CodePanel({ java, step }) {
  const [open, setOpen] = useState(true);
  const active = new Set(step?.lines ?? []);
  const v = step?.vars;
  const show = (x) => (x === null || x === undefined ? '-' : String(x));

  return (
    <section className="card" aria-labelledby="code-title">
      <div className="code__head">
        <h2 id="code-title">Java implementation</h2>
        <button type="button" className="btn btn--icon" onClick={() => setOpen((o) => !o)} aria-expanded={open}
          aria-controls="code-body" aria-label={open ? 'Hide code panel' : 'Show code panel'} title={open ? 'Hide code' : 'Show code'}>
          {open ? <ChevronDown /> : <ChevronRight />}
        </button>
      </div>
      {open && (
        <div id="code-body">
          {!java ? (
            <p className="muted">Synchronized Java code is not available for this algorithm yet.</p>
          ) : (
            <>
              <p className="code__disclaimer">
                Reference Java, not executed. The visualization runs a JavaScript version of the algorithm, and each step
                is mapped to these lines by fixed metadata.
              </p>
              <ol className="code" aria-label="Java source">
                {java.lines.map((text, i) => {
                  const no = i + 1;
                  const on = active.has(no);
                  return (
                    <li key={no} className={on ? 'code__line is-active' : 'code__line'} aria-current={on ? 'step' : undefined}>
                      <span className="code__no" aria-hidden="true">{no}</span>
                      <code>{text ? highlight(text) : ' '}</code>
                    </li>
                  );
                })}
              </ol>
              {step && (
                <div className="code__state">
                  {step.line ? <p className="code__note"><strong>Line {step.line}:</strong> {java.notes[step.line] ?? ''}</p> : null}
                  {Object.keys(v ?? {}).length > 0 && (
                  <dl className="vars" aria-label="Algorithm state">
                    {Object.entries(v ?? {}).map(([name, value]) => (
                      <div key={name}><dt>{name}</dt><dd>{show(value)}</dd></div>
                    ))}
                  </dl>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
