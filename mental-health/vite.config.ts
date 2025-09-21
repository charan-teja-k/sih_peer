import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/auth": "http://localhost:8000",
      "/users": "http://localhost:8000",
      "/questions": "http://localhost:8000",
      "/chat": {
        target: "ws://localhost:8000",
        ws: true
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));