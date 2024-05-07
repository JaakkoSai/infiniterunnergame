import { defineConfig } from "vite";

export default defineConfig({
  // Specify your project's root directory
  root: "./",
  // Configure the output directory for build files
  build: {
    outDir: "dist",
  },
  // Enable server options for development
  server: {
    open: true, // Automatically open the app in the browser on server start
  },
});
