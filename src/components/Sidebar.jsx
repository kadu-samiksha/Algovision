import { NavLink } from 'react-router-dom';
import { House, ArrowDownUp, Search, Link2, Layers, Network, Target, TrendingUp, Settings, X } from 'lucide-react';
import ProgressCard from './ProgressCard.jsx';
import { isCategoryAvailable } from '../data/catalog.js';

const NAV = [
  { to: '/', label: 'Home', icon: House, end: true, available: true },
  { to: '/sorting', label: 'Sorting Algorithms', icon: ArrowDownUp, available: isCategoryAvailable('sorting') },
  { to: '/searching', label: 'Searching Algorithms', icon: Search, available: isCategoryAvailable('searching') },
  { to: '/linked-lists', label: 'Linked Lists', icon: Link2, available: isCategoryAvailable('linked-lists') },
  { to: '/stacks-queues', label: 'Stacks and Queues', icon: Layers, available: isCategoryAvailable('stack-queue') },
  { to: '/trees', label: 'Trees', icon: Network, available: isCategoryAvailable('trees') },
  { to: '/practice', label: 'Practice Arena', icon: Target, available: true },
  { to: '/progress', label: 'My Progress', icon: TrendingUp, available: true },
  { to: '/settings', label: 'Settings', icon: Settings, available: true },
];

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#151A2A" stroke="#36405F" />
      <rect x="6" y="16" width="4" height="10" rx="1" fill="#42517A" />
      <rect x="12" y="11" width="4" height="15" rx="1" fill="#42517A" />
      <rect x="18" y="7" width="4" height="19" rx="1" fill="#8B5CF6" />
      <rect x="24" y="13" width="3" height="13" rx="1" fill="#34D399" />
    </svg>
  );
}

export default function Sidebar({ collapsed, drawerOpen, onCloseDrawer }) {
  return (
    <aside id="sidebar" className={`sidebar${drawerOpen ? ' is-open' : ''}`} aria-label="Primary">
      <div className="sidebar__brand">
        <Logo />
        <span className="sidebar__brand-text">AlgoVision</span>
        <button type="button" className="btn btn--icon sidebar__close" onClick={onCloseDrawer} aria-label="Close navigation">
          <X />
        </button>
      </div>
      <nav aria-label="Main">
        <ul>
          {NAV.map(({ to, label, icon: Icon, end, available }) => (
            <li key={to}>
              {available ? (
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon aria-hidden="true" />
                  <span className="nav-item__label">{label}</span>
                </NavLink>
              ) : (
                <span className="nav-item is-disabled" aria-disabled="true" title={`${label}: not built yet`}>
                  <Icon aria-hidden="true" />
                  <span className="nav-item__label">{label}</span>
                  <span className="badge">Soon</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar__foot">
        <ProgressCard compact={collapsed} />
      </div>
    </aside>
  );
}
