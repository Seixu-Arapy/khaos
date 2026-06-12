import tailwindcss from "@tailwindcss/vite"
import basicSsl from "@vitejs/plugin-basic-ssl"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")

  const plugins = [react(), tailwindcss()]

  const isLocal = env.VITE_ENVIRONMENT === "local"

  if (isLocal) {
    plugins.push(basicSsl())
  }

  return {
    plugins,
    server: {
      https: isLocal,
      port: Number(env.VITE_KHAOS_FRONTEND_PORT) || 5173
    }
  }
})
