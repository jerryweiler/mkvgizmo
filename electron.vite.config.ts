import { resolve } from "path";
import { defineConfig } from "electron-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        $lib: resolve("src/renderer/src/lib"),
      },
    },
    plugins: [svelte()],
  },
});
