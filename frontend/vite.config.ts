import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  //백엔드연결성공시삭제예정
  // CORS 오류허용을 위한 임시장치
  server: {
    proxy: {
      "/api": {
        target: "https://eatsfine.co.kr",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
