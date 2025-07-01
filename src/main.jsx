// main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { NgrokUrlProvider } from './context/NgrokAPIContext.jsx';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NgrokUrlProvider>
      <AuthProvider>
        <MediaProvider>
          <App />
        </MediaProvider>
      </AuthProvider>
    </NgrokUrlProvider>
  </StrictMode>
);
