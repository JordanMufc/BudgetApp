import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const srcDir = path.resolve(rootDir, "src");

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      src: srcDir,
    },
  },
});
