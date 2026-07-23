export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' && window.location.origin.includes('localhost') 
    ? 'http://localhost:8080' 
    : (typeof window !== 'undefined' ? window.location.origin : '')
};
export const API_BASE_URL = environment.apiUrl;
