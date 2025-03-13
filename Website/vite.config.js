import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    allowedHosts: [
      "https://87c6-2409-40f3-1003-a579-98e8-4f69-6382-2c13.ngrok-free.app" // Add your ngrok domain here
    ],
    proxy: {
      "/asset": {
        target: "https://87c6-2409-40f3-1003-a579-98e8-4f69-6382-2c13.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
    cors: true,
  },
  plugins: [react()],
});
