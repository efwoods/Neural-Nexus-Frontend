// src/context/NgrokAPIContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setNgrokUrls } from './NgrokAPIStore';

const APIContext = createContext(null);

export const NgrokUrlProvider = ({ children }) => {
  const [ngrokWsUrl, setNgrokWsUrl] = useState(null);
  const [ngrokHttpsUrl, setNgrokHttpsUrl] = useState(null);

  // Using a known subdomain with proxy
  setNgrokWsUrl('wss://api.neuralnexus.site');
  setNgrokHttpsUrl('https://api.neuralnexus.site');

  // useEffect(() => {
  //   const fetchNgrokUrl = async () => {
  //     if (
  //       !import.meta.env.VITE_GITHUB_FETCH_URL_ROOT ||
  //       !import.meta.env.VITE_GITHUB_GIST_ID ||
  //       !import.meta.env.VITE_GITHUB_GIST_FILENAME
  //     ) {
  //       console.error('Missing VITE environment variables');
  //       return;
  //     }

  //     try {
  //       const fetch_url =
  //         import.meta.env.VITE_GITHUB_FETCH_URL_ROOT +
  //         import.meta.env.VITE_GITHUB_GIST_ID +
  //         import.meta.env.VITE_GITHUB_GIST_FILENAME +
  //         '?t=' +
  //         Date.now();

  //       console.log('fetch_url:', fetch_url);

  //       console.log('Calling NGROK FETCH URL FROM NGROKAPICONTEXT');
  //       const response = await fetch(fetch_url, { cache: 'no-store' });
  //       const data = await response.text();
  //       console.log('data:', data);
  //       console.log('response:', response);
  //       const cleanHttpUrl = data.trim().replace(/^wss:\/\//, 'https://');
  //       console.log('ngrok_url:', data);
  //       console.log('cleanHttpUrl:', cleanHttpUrl);
  //       if (!cleanHttpUrl.startsWith('https')) {
  //         console.error('Invalid URL fetched:', cleanHttpUrl);
  //         return;
  //       }
  //       setNgrokWsUrl(data);
  //       setNgrokHttpsUrl(cleanHttpUrl);
  //       setNgrokUrls(cleanHttpUrl, data);
  //     } catch (error) {
  //       console.error('Error fetching ngrok URL:', error);
  //     }
  //   };

  //   fetchNgrokUrl();
  // }, []);

  return (
    <APIContext.Provider value={{ ngrokHttpsUrl, ngrokWsUrl }}>
      {children}
    </APIContext.Provider>
  );
};

export const useNgrokApiUrl = () => useContext(APIContext);
