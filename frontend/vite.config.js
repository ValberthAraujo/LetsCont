import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // listen on 0.0.0.0
    port: 5173,
    strictPort: true,
    // Allow custom hostnames routed via Traefik in dev (e.g., letscont.org / localhost.tiangolo.com)
    allowedHosts: true,
    cors: true,
  },
  preview: {
    allowedHosts: true,
  },
})
