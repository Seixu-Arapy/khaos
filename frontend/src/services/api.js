import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_KHAOS_API_URL
})

api.interceptors.request.use(config => {
  config.headers["X-API-Key"] = import.meta.env.VITE_KHAOS_API_KEY

  return config
})

export default api
