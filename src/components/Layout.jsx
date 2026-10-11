import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import ShortcutsModal from './ShortcutsModal.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

export default function Layout() {
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const toggleNav = () => (isDesktop ? setCollapsed((c) => !c) : setDrawerOpen((o) => !o));

  return (
    <div className={`app${collapsed ? ' is-collapsed' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Sidebar collapsed={collapsed && isDesktop} drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
      <div className="shell">
        <Topbar
          navExpanded={isDesktop ? !collapsed : drawerOpen}
          isDesktop={isDesktop}
          collapsed={collapsed}
          onToggleNav={toggleNav}
          onHelp={() => setHelpOpen(true)}
        />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <ShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
