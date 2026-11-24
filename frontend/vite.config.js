import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// Arqon frontend. The dev server proxies /api to the backend (default: the
// local FastAPI server on 127.0.0.1:8000).
export default defineConfig({
    plugins: [tailwindcss(), react()],
    server: {
        proxy: {
            "/api": {
                target: process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
});
