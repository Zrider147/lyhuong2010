import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'node:path';
import { normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
/**
 * @typedef {import('vite-plugin-static-copy').Target} Target
 * @typedef {import('vite').Plugin} Plugin
 * @typedef {import('vite').ResolvedConfig} PluginConfig
 */

/**
 * @param {string} mainAssetGlob 
 * @param {string} styleAssetPath 
 * @param {string} langAssetPath 
 * @returns {Plugin[]}
 */
function getDevCopyPlugin(mainAssetGlob, styleAssetPath, langAssetPath) {
  /** @type {Target} */
  const assetTargets = {
    src: [
      normalizePath(path.resolve(process.cwd(), mainAssetGlob)),
      normalizePath(path.resolve(process.cwd(), styleAssetPath)),
      normalizePath(path.resolve(process.cwd(), langAssetPath))
    ],
    dest: './'
  };
  return viteStaticCopy({
    targets: [assetTargets]
  });
}


/**
 * Bundle all language files into a single one, used for build
 * @param {string} styleAssetGlob 
 * @param {string} langAssetGlob 
 * @return {Plugin}
 */
function vbAssetPlugin(styleAssetGlob, langAssetGlob) {
  let rootDir, outDir;
  async function writeViewStyleBundle(inputGlobPath, outputPath) {
    const styles = {};
    for (let filename of glob.sync(inputGlobPath)) {
      let name = path.parse(filename).name;
      styles[name] = await fs.readJson(filename);
    }
    await fs.writeJson(path.resolve(outputPath, 'view-style.json'), styles);
  }
  async function writeLangBundle(inputGlobPath, outputPath) {
    const locales = {};
    for (let filename of glob.sync(inputGlobPath)) {
      let code = filename.split('/').at(-2);
      locales[code] = await fs.readJson(filename);
    }
    await fs.writeJson(path.resolve(outputPath, 'lang-game.json'), locales, { spaces:2 });
  }

  return {
    name: 'vb-lang-asset-plugin:build',
    apply: 'build',
    configResolved(config) {
      rootDir = config.root, outDir = config.build.outDir;
    },
    writeBundle() {
      const outputPath = path.resolve(rootDir, outDir, 'json');
      fs.ensureDirSync(outputPath);
      return Promise.all([
        writeViewStyleBundle(styleAssetGlob, outputPath),
        writeLangBundle(langAssetGlob, outputPath)
      ]);
    }
  }
}

/**
 * @param {string} mainAssetGlob 
 * @param {string} styleAssetGlob 
 * @param {string} langAssetGlob 
 * @returns {Plugin[]}
 */
function getProdCopyPlugin(mainAssetGlob, styleAssetGlob, langAssetGlob) {
  /** @type {Target} */
  const mainAssetTarget = {
    src: normalizePath(path.resolve(process.cwd(), mainAssetGlob)),
    dest: './',
    preserveTimestamps: true
  };
    
  const vbPlugin = vbAssetPlugin(styleAssetGlob, langAssetGlob);
  return [...viteStaticCopy({
    targets: [mainAssetTarget]
  }), vbPlugin];
}

export { getDevCopyPlugin, getProdCopyPlugin };