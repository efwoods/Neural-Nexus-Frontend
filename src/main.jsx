// main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { NgrokUrlProvider } from './context/NgrokAPIContext.jsx';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext.jsx';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage.jsx';
import PrivacyPolicy from './components/Landing/PrivacyPolicy.jsx';
import TermsOfService from './components/Landing/TermsOfService.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NgrokUrlProvider>
      <AuthProvider>
        <MediaProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<App />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </BrowserRouter>
        </MediaProvider>
      </AuthProvider>
    </NgrokUrlProvider>
  </StrictMode>
);
