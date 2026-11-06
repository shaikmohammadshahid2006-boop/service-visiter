import axios from 'axios';

// Smart base URL resolver:
// - Locally: defaults to '/api' (proxied by Vite to localhost:5000)
// - On Vercel: uses VITE_API_URL pointing to Render (e.g. https://service-visiter.onrender.com)
const resolveBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.warn(
        '[SVT API] VITE_API_URL is not set. API calls are using relative path "/api". ' +
        'If deployed on Vercel, set VITE_API_URL in Vercel project environment variables to your Render URL (e.g. https://<app>.onrender.com).'
      );
    }
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds to handle Render free-tier cold spin-up
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('svt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('svt_token');
        localStorage.removeItem('svt_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

