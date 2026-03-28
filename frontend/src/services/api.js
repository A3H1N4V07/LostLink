import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.PROD ? "https://lostlink-wbtc.onrender.com" : "http://localhost:5000");

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;