import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/theme.css';
import './index.css';
import { seedDevDataOnce } from './data/seedDevData';
import { applyThemeMode, getThemeMode, setupSystemThemeListener } from './theme/theme';

seedDevDataOnce();
applyThemeMode(getThemeMode());
setupSystemThemeListener();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
