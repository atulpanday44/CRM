/**
 * API client for Internal CRM backend
 */
import { API_BASE } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('crmToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('crmToken');
    localStorage.removeItem('crmUser');
    localStorage.removeItem('crmRefreshToken');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.message || err.error || 'Request failed');
  }
  return res.json();
};

const wrap = (p) =>
  p.catch((err) => {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error(
        'Cannot reach the server. Make sure the backend is running (e.g. in backend-spring: mvn spring-boot:run -Dspring-boot.run.profiles=dev).'
      );
    }
    throw err;
  });

export const api = {
  get: (path) => wrap(fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() }).then(handleResponse)),
  post: (path, data) =>
    wrap(
      fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse)
    ),
  put: (path, data) =>
    wrap(
      fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse)
    ),
  patch: (path, data) =>
    wrap(
      fetch(`${API_BASE}${path}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse)
    ),
  delete: (path) =>
    wrap(fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse)),
};
