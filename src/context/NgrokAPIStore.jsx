// src/context/NgrokAPIStore.js

let ngrokHttpsUrl = null;
let ngrokWsUrl = null;

export const setNgrokUrls = (httpsUrl, wsUrl) => {
  ngrokHttpsUrl = httpsUrl;
  ngrokWsUrl = wsUrl;
};

export const getNgrokHttpsUrl = () => ngrokHttpsUrl;
export const getNgrokWsUrl = () => ngrokWsUrl;
