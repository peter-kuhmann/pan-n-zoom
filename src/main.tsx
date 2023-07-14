import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import Router from './Router.tsx';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
