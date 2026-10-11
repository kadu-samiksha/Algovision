import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/visualizer.css';
import './styles/structures.css';
import App from './App.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';

// HashRouter keeps routing working on any static host without rewrite rules.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </HashRouter>
  </React.StrictMode>,
);
