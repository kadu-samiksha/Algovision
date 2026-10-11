import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import HeroDemo from '../components/HeroDemo.jsx';
import AlgorithmCard from '../components/AlgorithmCard.jsx';
import { CATEGORIES, TOPICS, getTopic } from '../data/catalog.js';
import { useProgress } from '../context/ProgressContext.jsx';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery.js';

const PATH = ['sort-bubble', 'sort-selection', 'sort-insertion', 'search-linear', 'search-binary', 'sq-stack', 'tree-inorder'];

export default function Home() {
  const { state, stats } = useProgress();
  const reduced = usePrefersReducedMotion();
  const last = state.last ? getTopic(state.last.id) : null;
  const resume = last?.available ? last : null;
  const firstTopic = TOPICS.find((t) => t.available);

  const startLearning = () => {
    const el = document.getElementById('learning-path');
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  return (
    <div className="page home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <h1 id="hero-title">Understand DSA. One step at a time.</h1>
          <p>Explore algorithms through interactive visualizations, follow their execution, and understand the logic behind every operation.</p>
          <div className="hero__actions">
            <Link to="/sorting" className="btn btn--primary btn--lg">Explore Algorithms <ArrowRight /></Link>
            <button type="button" className="btn btn--lg" onClick={startLearning}><Compass /> Start Learning</button>
          </div>
        </div>
        <HeroDemo />
      </section>

      <div className="home__row">
        <section className="card" aria-labelledby="continue-title">
          {resume ? (
            <>
              <h2 id="continue-title" className="card__title">Continue learning</h2>
              <p><strong>{resume.title}</strong></p>
              <p className="muted">
                Last opened {new Date(state.last.at).toLocaleDateString()}.{' '}
                {state.completed[resume.id] ? 'You have completed this visualization.' : 'You have not reached the end yet.'}
              </p>
              <Link className="btn btn--primary" to={resume.path}>Resume {resume.title} <ArrowRight /></Link>
            </>
          ) : (
            <>
              <h2 id="continue-title" className="card__title">Getting started</h2>
              <ol className="steps">
                <li>Open Bubble Sort and press Play to watch a full run.</li>
                <li>Use Previous and Next to move through single comparisons.</li>
                <li>Follow the highlighted Java lines to connect the animation to code.</li>
              </ol>
              <Link className="btn btn--primary" to={firstTopic.path}>Open {firstTopic.title} <ArrowRight /></Link>
            </>
          )}
        </section>

        <section className="card" aria-labelledby="stats-title-home">
          <h2 id="stats-title-home" className="card__title">Your activity</h2>
          <dl className="home-stats">
            <div><dt>Topics explored</dt><dd>{stats.visited}<small> of {stats.available}</small></dd></div>
            <div><dt>Visualizations completed</dt><dd>{stats.completed}<small> of {stats.available}</small></dd></div>
            <div><dt>Practice answered</dt><dd>{stats.answered}<small>{stats.answered ? ` (${stats.correct} correct)` : ''}</small></dd></div>
            <div><dt>Overall progress</dt><dd>{stats.percent}<small>%</small></dd></div>
          </dl>
          <p className="field-hint">Counted from this browser only. Nothing here is synced to other devices.</p>
        </section>
      </div>

      <section aria-labelledby="cats-title" className="home__section">
        <h2 id="cats-title">Algorithm categories</h2>
        <div className="cat-grid">
          {CATEGORIES.map((c) => <AlgorithmCard key={c.id} category={c} />)}
        </div>
      </section>

      <section id="learning-path" tabIndex={-1} className="home__section" aria-labelledby="path-title">
        <h2 id="path-title">Beginner learning path</h2>
        <p className="muted">A suggested order, from the simplest idea to the more structured ones. Each step opens a working visualizer.</p>
        <ol className="path">
          {PATH.map((id) => {
            const t = getTopic(id);
            return (
              <li key={id} className={t.available ? '' : 'is-soon'}>
                {t.available ? <Link to={t.path}>{t.title}</Link> : <span>{t.title}</span>}
                {t.available
                  ? <span className={`badge${state.completed[id] ? ' badge--live' : ''}`}>{state.completed[id] ? 'Completed' : state.visited[id] ? 'Visited' : 'Ready'}</span>
                  : <span className="badge">Soon</span>}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
