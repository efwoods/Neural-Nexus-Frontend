export const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('data:image/')) {
    return url.includes('base64,');
  }
  return /^(https?:\/\/|\/)/.test(url);
};
