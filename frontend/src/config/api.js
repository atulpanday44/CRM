/**
 * API configuration for Internal CRM
 * - Dev: uses /api (Vite proxy → Spring backend on localhost:8080)
 * - Prod: set VITE_API_URL in .env (e.g. https://api.example.com/api)
 */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api');
