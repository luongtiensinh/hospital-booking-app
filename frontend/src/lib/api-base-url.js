const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');
