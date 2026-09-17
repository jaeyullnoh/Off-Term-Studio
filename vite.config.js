import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// publicDir를 static으로 둔 이유: 예전 버전의 public/ 폴더가 저장소에 남아 있어도 빌드에 섞이지 않게
export default defineConfig({
  plugins: [react()],
  publicDir: "static",
  build: { outDir: "dist", chunkSizeWarningLimit: 800 },
});
