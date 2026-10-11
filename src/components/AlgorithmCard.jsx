import { Link } from 'react-router-dom';
import { PREVIEWS } from './CategoryPreviews.jsx';
import { topicsIn } from '../data/catalog.js';

export default function AlgorithmCard({ category }) {
  const topics = topicsIn(category.id);
  const ready = topics.filter((t) => t.available).length;
  const available = ready > 0;
  const Preview = PREVIEWS[category.id];
  const Icon = category.icon;

  return (
    <article className={`cat-card${available ? '' : ' is-soon'}`}>
      <Preview />
      <div className="cat-card__body">
        <h3 className="cat-card__title"><Icon aria-hidden="true" size={16} /> {category.title}</h3>
        <p className="muted">{category.description}</p>
        <div className="chips">
          <span className="chip">{category.difficulty}</span>
          <span className="chip">{ready} of {topics.length} available</span>
        </div>
      </div>
      {available ? (
        <Link className="cat-card__action btn btn--primary" to={category.path}>
          Open {category.title.toLowerCase()} visualizer
        </Link>
      ) : (
        <p className="cat-card__action cat-card__soon" aria-label={`${category.title}: not built yet`}>Not built yet</p>
      )}
    </article>
  );
}
