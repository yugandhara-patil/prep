import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Expose both VITE_ and GOOGLE_ environment variables to import.meta.env
  envPrefix: ["VITE_", "GOOGLE_"],

  // Tell Vite that .glb files are 3D asset files
  assetsInclude: ["**/*.glb"],
});