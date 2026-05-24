import axios from "axios";

// Buat instance axios dengan base URL backend Laravel Anda
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Cukup ubah di sini jika endpoint ganti
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor Request: Otomatis menyisipkan token sebelum request dikirim
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor Response: Menangani otomatis jika token expired (Error 401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token"); // Hapus token yang sudah tidak valid
      window.location.href = "/login"; // Lempar paksa ke halaman login
    }
    return Promise.reject(error);
  },
);

export default api;
