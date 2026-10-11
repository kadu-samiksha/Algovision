import { Link } from 'react-router-dom';

export default function NotFound({ message = 'This page does not exist.', backTo = '/', backLabel = 'Back to Home' }) {
  return (
    <div className="page">
      <div className="page__head">
        <h1>Page not found</h1>
        <p>{message}</p>
      </div>
      <div><Link className="btn" to={backTo}>{backLabel}</Link></div>
    </div>
  );
}
