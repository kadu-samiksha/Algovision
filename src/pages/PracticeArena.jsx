import { useMemo, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import TreeSvg from '../components/TreeSvg.jsx';
import { PRACTICE_TOPICS, QUESTIONS, QUESTION_TYPES, pickNext } from '../data/questions.js';
import { parseLevelOrder } from '../algorithms/trees/tree.js';
import { useProgress } from '../context/ProgressContext.jsx';

export default function PracticeArena() {
  const { state, stats, recordAnswer } = useProgress();
  const [topic, setTopic] = useState('all');
  const pool = useMemo(() => (topic === 'all' ? QUESTIONS : QUESTIONS.filter((x) => x.topic === topic)), [topic]);
  const [currentId, setCurrentId] = useState(() => pickNext(QUESTIONS, state.practice)?.id);
  const [selected, setSelected] = useState(null);

  const question = pool.find((x) => x.id === currentId) ?? pickNext(pool, state.practice);
  const tree = useMemo(() => (question?.tree ? parseLevelOrder(question.tree) : null), [question]);
  const seen = pool.filter((x) => state.practice[x.id]).length;
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : null;
  const answered = selected !== null;

  const changeTopic = (t) => {
    const nextPool = t === 'all' ? QUESTIONS : QUESTIONS.filter((x) => x.topic === t);
    setTopic(t);
    setSelected(null);
    setCurrentId(pickNext(nextPool, state.practice)?.id);
  };
  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    recordAnswer(question.id, i === question.correct);
  };
  const next = () => {
    setSelected(null);
    setCurrentId(pickNext(pool, state.practice, question.id)?.id);
  };

  return (
    <div className="page">
      <div className="page__head">
        <h1>Practice Arena</h1>
        <p>Short questions on sorting, searching, linked lists, stacks and queues, and binary trees. You get feedback straight away, and the questions are fixed (no AI involved), so scores are comparable over time.</p>
      </div>

      <section className="card" aria-label="Your practice results">
        <dl className="home-stats">
          <div><dt>Questions answered</dt><dd>{stats.answered}</dd></div>
          <div><dt>Correct answers</dt><dd>{stats.correct}</dd></div>
          <div><dt>Accuracy</dt><dd>{accuracy === null ? '-' : accuracy}<small>{accuracy === null ? '' : '%'}</small></dd></div>
        </dl>
        <p className="field-hint">Counted in this browser only. Re-answering a question counts again.</p>
      </section>

      <div className="practice-bar">
        <label className="field">
          <span className="field__label">Topic</span>
          <select className="select" value={topic} onChange={(e) => changeTopic(e.target.value)}>
            <option value="all">All topics</option>
            {PRACTICE_TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <p className="muted">{seen} of {pool.length} questions seen in this selection. New questions come first, then the ones you saw longest ago.</p>
      </div>

      {question ? (
        <section className="card question" aria-labelledby="q-prompt">
          <div className="chips">
            <span className="badge">{PRACTICE_TOPICS.find((t) => t.id === question.topic).label}</span>
            <span className="badge">{QUESTION_TYPES[question.type]}</span>
          </div>
          <h2 id="q-prompt">{question.prompt}</h2>
          {tree && !tree.empty && <TreeSvg nodes={tree.nodes} root={tree.root} step={null} small />}
          <ul className="options" role="group" aria-labelledby="q-prompt">
            {question.options.map((opt, i) => {
              const isRight = i === question.correct;
              const isPicked = i === selected;
              const status = !answered ? '' : isRight ? 'correct' : isPicked ? 'wrong' : 'idle';
              return (
                <li key={opt}>
                  <button type="button" className="option" data-status={status} onClick={() => choose(i)} aria-disabled={answered} aria-pressed={isPicked}>
                    <span className="option__letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                    <span className="option__text">{opt}</span>
                    {answered && isRight && <span className="option__flag"><Check size={16} aria-hidden="true" /> Correct answer</span>}
                    {answered && isPicked && !isRight && <span className="option__flag"><X size={16} aria-hidden="true" /> Your answer</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {answered && (
            <div className={`feedback feedback--${selected === question.correct ? 'right' : 'wrong'}`} role="status">
              <strong>{selected === question.correct ? 'Correct.' : `Not quite. The right answer is ${String.fromCharCode(65 + question.correct)}.`}</strong>
              <p>{question.explanation}</p>
              <button type="button" className="btn btn--primary" onClick={next}>Next question <ArrowRight /></button>
            </div>
          )}
        </section>
      ) : (
        <p className="muted">No questions in this selection.</p>
      )}
    </div>
  );
}
