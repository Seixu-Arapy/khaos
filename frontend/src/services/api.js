import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_KHAOS_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use(
  config => {
    const token = import.meta.env.VITE_KHAOS_API_KEY

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default api
