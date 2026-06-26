// // API_BASE_URL phải trỏ đúng tới prefix của backend.
// // Backend đang mount: app.use('/api/....', ...)
// // Tức là baseURL đúng là: http://localhost:5000/api
// const rawApiBaseUrl =
//   import.meta.env.VITE_API_BASE_URL ??
//   `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

// export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("API_BASE_URL =", API_BASE_URL);