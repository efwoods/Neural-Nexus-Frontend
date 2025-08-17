// src/context/NgrokAPIContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setNgrokUrls } from './NgrokAPIStore';

const APIContext = createContext(null);

export const NgrokUrlProvider = ({ children }) => {
  const [ngrokWsUrl, setNgrokWsUrl] = useState(null);
  const [ngrokHttpsUrl, setNgrokHttpsUrl] = useState(null);
  const [dbWsUrl, setDbWsUrl] = useState(null);
  const [dbHttpsUrl, setDbHttpsUrl] = useState(null);

  // Using a known subdomain with proxy
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WSS_URL;
    const httpsUrl = import.meta.env.VITE_HTTPS_URL;
    const dbWsUrl = import.meta.env.VITE_WSS_URL_NN_DB;
    const dbHttpsUrl = import.meta.env.VITE_HTTPS_URL_NN_DB;
    setNgrokWsUrl(wsUrl);
    setNgrokHttpsUrl(httpsUrl);
    setDbWsUrl(dbWsUrl);
    setDbHttpsUrl(dbHttpsUrl);
    setNgrokUrls(httpsUrl, wsUrl, dbWsUrl, dbHttpsUrl); // optional: if you want to share state elsewhere
  }, []);

  return (
    <APIContext.Provider
      value={{ ngrokHttpsUrl, ngrokWsUrl, dbWsUrl, dbHttpsUrl }}
    >
      {children}
    </APIContext.Provider>
  );
};

export const useNgrokApiUrl = () => useContext(APIContext);
