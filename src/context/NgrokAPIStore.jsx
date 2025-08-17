// src/context/NgrokAPIStore.js

let httpsUrl = null;
let wsUrl = null;
let dbWsUrl = null;
let dbHttpsUrl = null;

export const setNgrokUrls = (
  var_HttpsUrl,
  var_WsUrl,
  var_db_Ws_Url,
  var_db_Https_Url
) => {
  httpsUrl = var_HttpsUrl;
  wsUrl = var_WsUrl;
  dbWsUrl = var_db_Ws_Url;
  dbHttpsUrl = var_db_Https_Url;
};

export const getNgrokHttpsUrl = () => httpsUrl;
export const getNgrokWsUrl = () => wsUrl;
export const getDbWsUrl = () => dbWsUrl;
export const getDbHttpsUrl = () => dbHttpsUrl;
