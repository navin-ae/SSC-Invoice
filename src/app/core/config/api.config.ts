const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';

export const API_CONFIG = {
  base: `http://${hostname}:8000/api`,
};
