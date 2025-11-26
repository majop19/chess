import { root } from "#back/root";
import react from "@vitejs/plugin-react";
import path from "node:path";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [vike(), react(), cloudflare()],
  root: root,
  resolve: {
    alias: [
      {
        find: "#front",
        replacement: path.resolve(__dirname, "./src/frontend/"),
      },
      {
        find: "#back",
        replacement: path.resolve(__dirname, "./src/backend/"),
      },
    ],
  },
});
