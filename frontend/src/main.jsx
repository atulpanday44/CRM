import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LeaveProvider } from './context/LeaveContext.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LeaveProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LeaveProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
