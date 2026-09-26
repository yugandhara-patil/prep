import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Tell Vite that .glb files are 3D asset files
  assetsInclude: ["**/*.glb"],
});