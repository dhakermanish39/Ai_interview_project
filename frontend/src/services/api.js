import axios from 'axios';

const API = axios.create({
  baseURL: 'https://ai-interview-project-p9nc.onrender.com/api'
});

// Har request mein token automatically lagao
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;