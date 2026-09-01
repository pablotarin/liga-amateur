import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Adjunta automaticamente el token guardado en localStorage a cada peticion,
// asi ningun componente necesita preocuparse de la cabecera Authorization.
axiosClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem("liga-amateur-auth");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza los errores de la API para que los componentes solo tengan
// que leer `error.message`.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Ha ocurrido un error inesperado";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
