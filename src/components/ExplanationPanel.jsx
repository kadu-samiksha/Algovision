export default function ExplanationPanel({ step, playing }) {
  return (
    <section className="card" aria-labelledby="explain-title">
      <h2 id="explain-title" className="card__title">What's happening?</h2>
      <div className="explain" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
        <span className="badge explain__tag" data-type={step.type}>{step.title}</span>
        <p>{step.text}</p>
      </div>
    </section>
  );
}
