import { URL, fileURLToPath } from "node:url";

import defines from "./src/defines";
import definesLocal from "./src/defines.local";
import fullReload from "./src/vbWebEngine/dev-tools/plugin-full-reload";
import viteChecker from "vite-plugin-checker";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import {
  getDevCopyPlugin,
  getProdCopyPlugin,
} from "./src/vbWebEngine/dev-tools/plugin-assets";

/** Development Global Defines */
const devDefines = {
  DEV: true,
  ...defines,
  ...definesLocal,
};
/** Production Global Defines */
const prodDefines = {
  DEV: false,
  ...defines,
  ...definesLocal,
};

/** @type { import('vite').UserConfig } */
const sharedConfig = defineConfig({
  base: "",
  root: "./src",
  publicDir: "../assets/public",
  plugins: [vue()],

  resolve: {
    alias: {
      src: fileURLToPath(new URL("./src/", import.meta.url)),
      "@vb": fileURLToPath(new URL("./src/vbWebEngine", import.meta.url)),
      "@g": fileURLToPath(new URL("./src/game", import.meta.url)),
      "@a": fileURLToPath(new URL("./assets", import.meta.url)),
      "@vbw": fileURLToPath(new URL("./src/vbWebConnector", import.meta.url)),
    },
  },

  server: {
    strictPort: true,
    // unfortunately, module hot reload doesn't work well for games which need initialization
    hmr: false,
  },

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2015",
    minify: "terser",
    rollupOptions: {
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
      },
    },
  },

  preview: {
    port: 4173,
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  // conditional config
  console.log("[Vite Config]", command, mode, ssrBuild);

  if (mode == "development") {
    sharedConfig.define = devDefines;
    // plugins for dev server
    const checkerPlugin = viteChecker({ vueTsc: true });
    // host game assets for dev
    const copyPlugin = getDevCopyPlugin(
      "./assets/game-dev/*",
      "./assets/style",
      "./assets/lang"
    );
    // watch file changes and perform full page reload instead of hmr
    const reloadPlugin = fullReload(["./src/**/*", "./assets/**/*.json"]);
    sharedConfig.plugins.push(checkerPlugin, copyPlugin, reloadPlugin);
  } else if (mode == "production") {
    sharedConfig.define = prodDefines;
    sharedConfig.build.sourcemap = false;
    // copy game assets for production build
    const copyPlugin = getProdCopyPlugin(
      "./assets/game-dev/*",
      "./assets/style/*",
      "./assets/lang/*/game.json"
    );
    if (command == "build") {
      sharedConfig.plugins.push(copyPlugin);
    }
    // https://terser.org/docs/api-reference#minify-options-structure
    // terser minify options, including macro defines
    sharedConfig.build.terserOptions = {
      ecma: 2015,
      format: {
        comments: false,
      },
    };
  }

  return sharedConfig;
});
