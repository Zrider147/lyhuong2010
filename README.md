# vbWebEngine-project

This boilerplate should help get you started developing with vbWebEngine and Vue 3 in Vite.

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.VSCode-typescript-vue-plugin).

### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Git Setup

To clone the repo, make sure to include submodule by adding flag `--recursive` 

```sh
git clone --recursive xxxx
```

To initialize a repo instead, add the submodules with correct branches 

```sh
git init -b main
# the branch we are currently using is "v7.2"
git submodule add -b v7.2 https://github.com/GlisGames/vbWebEngine.git src/vbWebEngine
# for web socket connection, the branch we are currently using is "next_digital_wip"
git submodule add -b next_digital_wip https://github.com/GlisGames/vbWebConnector.git src/vbWebConnector
```

### Project Setup

If this is **not the first time** you setup project and you already have `node.js`, `pnpm`, you can simply run command:

```sh
pnpm install
```

Then everything should work.

If this is the **first time**, install `pnpm.`

```
npm install -g pnpm
```

### Utilities for Development

VSCode launch configuration:

- `Vite: dev-server`: Launch Vite dev server for debugging.
- `Browser: Chrome/Edge`: Open the browser for debugging.
- `Generate assets-list`: Run `gen-assets-list.cjs`
- `Python: prod-preview`: Host the `/dist` folder at port `4173` after you build the project, using simple python HTTP server. Then you can open it on your browser to test.

Node.js commands:

- `pnpm run dev`: Launch Vite dev server
- `pnpm run build`: Build the project to `/dist` folder.
- `pnpm run type-check`: When you launch VSCode `Development`, it does type check too.
- `pnpm run lint`: Show linting issues but don't fix them.
- `pnpm run lint-fix`: Auto fix some linting issues (primarily about imports) then show the rest.

Dev tools:

- `gen-assets-list.cjs`: Generate `assets/game-dev/assets-list.json`
- `pnpm [exec] dpdm [-T] xxx.ts`: Analyze circular dependency.
