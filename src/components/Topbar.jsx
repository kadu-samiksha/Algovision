import { Link, useLocation } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Keyboard } from 'lucide-react';
import { getCrumbs } from '../data/catalog.js';
import { getInitials, useProgress } from '../context/ProgressContext.jsx';

export default function Topbar({ navExpanded, isDesktop, collapsed, onToggleNav, onHelp }) {
  const { pathname } = useLocation();
  const { state, stats } = useProgress();
  const crumbs = getCrumbs(pathname);
  const NavIcon = isDesktop ? (collapsed ? PanelLeftOpen : PanelLeftClose) : Menu;
  const navLabel = isDesktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open navigation';

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn btn--icon"
        onClick={onToggleNav}
        aria-label={navLabel}
        aria-expanded={navExpanded}
        aria-controls="sidebar"
        title={navLabel}
      >
        <NavIcon />
      </button>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((c, i) => (
            <li key={c.label} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
              {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}
            </li>
          ))}
        </ol>
      </nav>
      <div className="topbar__spacer" />
      <button type="button" className="btn btn--icon" onClick={onHelp} aria-label="Keyboard shortcuts" title="Keyboard shortcuts">
        <Keyboard />
      </button>
      <Link
        to="/progress"
        className="avatar"
        aria-label={`Learning summary: ${stats.completed} of ${stats.available} visualizations completed`}
        title={`${state.prefs.displayName || 'Guest'}: ${stats.completed} of ${stats.available} visualizations completed`}
      >
        {getInitials(state.prefs.displayName)}
      </Link>
    </header>
  );
}
