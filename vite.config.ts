import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // `npm run dev:full` serves the functions on 8888. Use the app on 5173:
        // the SPA rewrite in public/_redirects also catches Vite's module
        // requests when they go through Netlify's dev proxy.
        proxy: { "/api": "http://localhost:8888" },
    },
});
