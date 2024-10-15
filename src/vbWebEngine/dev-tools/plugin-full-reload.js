/** Repo: https://github.com/ElMassimo/vite-plugin-full-reload */
import colors from 'picocolors';
import picomatch from 'picomatch';
import { relative, resolve } from 'path';
/** @typedef { import('vite').Plugin } Plugin */
import { normalizePath } from 'vite';
export function normalizePaths(root, path) {
    return (Array.isArray(path) ? path : [path]).map(path => resolve(root, path)).map(normalizePath);
}
/**
 * @typedef {Object} Config
 * @prop {boolean} [always=true] - Whether full reload should happen regardless of the file path.
 * @prop {number} [delay=0] - How many milliseconds to wait before reloading the page after a file change.
 * @prop {boolean} [log=true] - Whether to log when a file change triggers a full reload.
 * @prop {string} [root=process.cwd()] - Files will be resolved against this path.
 */
/**
 * Allows to automatically reload the page when a watched file changes.
 * 
 * @param {string|string[]} paths
 * @param {Config} config
 * @return {Plugin} Vite Plugin
 */
export default (paths, config = {}) => ({
    name: 'vite-plugin-full-reload',
    apply: 'serve',
    // NOTE: Enable globbing so that Vite keeps track of the template files.
    config: () => ({ server: { watch: { disableGlobbing: false } } }),
    configureServer({ watcher, ws, config: { logger } }) {
        const { root = process.cwd(), log = true, always = true, delay = 0 } = config;
        const files = normalizePaths(root, paths);
        const shouldReload = picomatch(files);
        const checkReload = (path) => {
            if (shouldReload(path)) {
                setTimeout(() => ws.send({ type: 'full-reload', path: always ? '*' : path }), delay);
                if (log)
                    logger.info(`${colors.green('page reload')} ${colors.dim(relative(root, path))}`, { clear: true, timestamp: true });
            }
        };
        // Ensure Vite keeps track of the files and triggers HMR as needed.
        watcher.add(files);
        // Do a full page reload if any of the watched files changes.
        watcher.on('add', checkReload);
        watcher.on('change', checkReload);
    },
});
