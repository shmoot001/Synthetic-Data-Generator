import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

let csrfToken = null;

api.interceptors.request.use(async (config) => {
  const needsToken = !['get', 'head', 'options'].includes(config.method);
  if (needsToken) {
    if (!csrfToken) {
      const response = await axios.get('/api/csrf', { withCredentials: true });
      csrfToken = response.data.token;
    }
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

export async function fetchCars(params = {}) {
  const response = await api.get('/cars', { params });
  return response.data;
}

export async function fetchCar(id) {
  const response = await api.get(`/cars/${id}`);
  return response.data;
}

export async function submitContact(carId, payload) {
  const response = await api.post(`/cars/${carId}/contact`, payload);
  return response.data;
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function currentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function createCar(payload) {
  const response = await api.post('/cars', payload);
  return response.data;
}

export async function updateCar(id, payload) {
  const response = await api.put(`/cars/${id}`, payload);
  return response.data;
}

export async function deleteCar(id) {
  await api.delete(`/cars/${id}`);
}

export async function fetchRevisions(id) {
  const response = await api.get(`/cars/${id}/revisions`);
  return response.data;
}

export default api;
