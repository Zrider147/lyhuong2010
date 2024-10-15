import * as PIXI from 'pixi.js';
import { type AssetList, load_json } from './misc/vbLoader'
import { FPSCounter } from './renderable/vbDemoItems';
import { type LocalizationTable, emptyLocale } from './core/vbLocalization';
import { type ViewStyleTable, emptyViewStyle } from './core/vbViewStyle';
import { c, shared } from './misc/vbShared';
import { vbContainer } from './vbContainer';
import type { vbInteractionManager } from './core/vbInteraction';
import { vbPrimitive, vbRectangle } from './renderable/vbPrimitive';
import type { vbScene } from './core/vbScene';
import { vbSoundManagerInstance } from './misc/vbSound';
import type { vbState, vbStateMap } from './core/vbState';
import { vbTimer, vbTimerManager } from './third-party/vbTimer';


interface vbGameOptions extends PIXI.IApplicationOptions {
    /**
     * Enable `globalmousemove`, `globalpointermove` and `globaltouchmove` events,
     * which are commonly used for dragging interactions
     * because they are dispatched globally regardless of hit-testing the current object. \
     * Enabling this slightly affects performance.
     * @default false
     */
    dragEvent: true
    /**
     * Add an invisible rectangle at the background with the size of entire stage,
     * used for dispatching events on stage (i.e. wherever you click). \
     * The color of rectangle can be provided with a number value.
     * @default false (white color)
     */
    backgroundRect: true | number;
}


/**
 * Main PixiJs application,
 * managing all the assets, states, ticking etc...
 */
abstract class vbGame extends PIXI.Application<HTMLCanvasElement> {
    /**
     * The root display container that's rendered whose name is "`MAIN`".
     * It is interactive by default (`eventMode`: `static`)
     * @member {PIXI.Container}
     */
    readonly stage = new vbContainer();
    readonly bgRect: vbPrimitive;

    readonly assets = PIXI.Assets;
    readonly soundManager = vbSoundManagerInstance;
    /** global timers */
    readonly timers: vbTimerManager;
    readonly interact?: vbInteractionManager;

    desiredWidth = 0;
    desiredHeight = 0;
    /** height / width */
    desiredRatio = 0;

    /** current state */
    currState = undefined as unknown as vbState;
    /** current view style */
    currStyle = emptyViewStyle;
    /** current locale */
    currLocale = emptyLocale;
    /** current scenes and their root containers' names */
    currScene: Record<string, vbScene> = {};

    /**
     * https://pixijs.download/v7.2.4/docs/PIXI.IApplicationOptions.html
     * https://pixijs.download/v7.2.4/docs/PIXI.IRendererOptionsAuto.html
     * https://pixijs.download/v7.2.4/docs/PIXI.IRendererOptions.html
     * @param options - The optional application parameters.
     */
    constructor(options: Partial<vbGameOptions>) {
        options.resolution = PIXI.settings.RESOLUTION = window.devicePixelRatio;
        PIXI.Filter.defaultResolution = window.devicePixelRatio;
        // set default event mode
        options.eventMode = 'none';
        options.eventFeatures = {
            globalMove: !!options.dragEvent,
        };
        super(options);

        shared.init();
        this.timers = new vbTimerManager();
        this.stage.name = 'MAIN';
        // the root stage is always interactive
        this.stage.eventMode = 'static';

        if (options.backgroundRect !== undefined) {
            let color = options.backgroundRect !== true ? options.backgroundRect : c.White;
            const rect = new vbRectangle(100, 100).fill(color, 1);
            this.bgRect = new vbPrimitive(rect);
            this.bgRect.alpha = 0;
            this.bgRect.eventMode = 'auto';
            this.stage.addObj(this.bgRect);
            this.stage.sendObjToBack(this.bgRect);
        }
        else {
            this.bgRect = new vbPrimitive();
        }
    }

    mainLoop(deltaFrame: number) {}

    startLoop() {
        this.mainLoop = this.mainLoop.bind(this);
        this.ticker.add(this.mainLoop, {}, PIXI.UPDATE_PRIORITY.HIGH);
    }

    /**
     * The resize callback that shall be called whenever
     * the desiredResolution (style change, etc.)
     * or the canvas size to display (window resize, etc.) have changed.
     */
    resizeAppView(contentWidth: number, contentHeight: number) {}

    setResolution(width: number, height: number) {
        this.desiredWidth = width;
        this.desiredHeight = height;
        this.desiredRatio = height / width;

        this.bgRect.width = width;
        this.bgRect.height = height;
        if (this._txtFPS !== undefined) {
            this._txtFPS.x = width - 40;
        }
        // set the size of main container as well
        this.stage.setDesiredSize(width, height);
    }

    /**
     * Creates an instance of Timer that is running at any time.
     *
     * @param time The time is ms before timer end or repedeated.
     * @param repeat Number of repeat times. If set to Infinity it will loop forever. (default 0)
     * @param delay Delay in ms before timer starts (default 0)
     * @param preserved Normal timer will only be added to the TimerManager when it's running, and will be removed when it's ended. \
     *              Preserved timer will stay to avoid constantly being added or removed.
     */
    createGlobalTimer(time: number, repeat = 0, delay = 0, preserved = false) {
        return new vbTimer(this.timers, time, repeat, delay, preserved);
    }

    protected _states = {} as vbStateMap;
    protected _viewStyles: Record<string, ViewStyleTable> = { '':emptyViewStyle };
    protected _locales: Record<string, LocalizationTable> = { '':emptyLocale };
    protected _scenes: Record<string, vbScene> = {};

    protected _textures = undefined as unknown as Record<string, PIXI.Texture>;
    protected _sequences = undefined as unknown as Record<string, PIXI.Texture[]>;
    protected _spines = undefined as unknown as Record<string, PIXI.SpineAsset>;

    async loadAssets() {
        // file list json has all the assets that need to be fetched
        const list = <AssetList>(await load_json('assets-list.json'));
        const assets = this.assets;
        await assets.loadFromList(list);

        [this._textures, this._sequences] = assets.get_multipack_textureMap(list);
        this._spines = assets.get_SpineMap(list.spine_json);
        Object.assign(this._viewStyles, assets.get_viewStyleMap(list.style));
        Object.assign(this._locales, assets.get_localeMap(list.lang));
    }
    /** Callback when everything is ready for game to start */
    onGameReady: () => void = globalThis.doNothing;

    useCurrentViewStlye() {
        this.stage.useViewStyleChildren(this.currStyle.list);
    }
    useCurrentLocale() {
        this.stage.useLocale(this.currLocale);
    }

    /**
     * If `DEV` variable is true, do the runtime check if an asset exists, otherwise throw exception.
     * If `DEV` is false, check nothing.
     * @note The return type of assets getters doesn't have `undefined` for convenience,
     *       which assumes all assets are ready. But you may have to check it by yourself in some cases.
     */
    static readonly runtimeCheck = (() => {
        if (DEV)
            return <T>(dict: Record<string, T>, name: string, hint: string) => {
                const r = dict[name];
                if (r === undefined) throw new ReferenceError(`Cannot find ${hint} ${name}`);
                return r;
            }
        else 
            return <T>(dict: Record<string, T>, name: string, _hint: string) => {
                return dict[name];
            }
    })();

    /** Assume all the states are ready, no undefined */
    state<K extends keyof vbStateMap>(stateName: K) {
        return this._states[stateName];
    }
    setState(stateName: keyof vbStateMap) {
        this.currState = this.state(stateName);
    }
    addState(...states: vbState[]) {
        for (const state of states) {
            // eslint-disable-next-line
            this._states[state.name] = <any>state;
        }
    }

    viewStyle(name: string) {
        return vbGame.runtimeCheck(this._viewStyles, name, 'style');
    }
    setViewStyle(name: string) {
        this.currStyle = this.viewStyle(name);
    }

    locale(code: string) {
        return vbGame.runtimeCheck(this._locales, code, 'locale');
    }
    setLocale(code: string) {
        this.currLocale = this.locale(code);
    }
    addLocale(code: string, table: LocalizationTable) {
        this._locales[code] = table;
    }

    scene(name: string) {
        return vbGame.runtimeCheck(this._scenes, name, 'scene');
    }
    setScene(scene: vbScene) {
        this.currScene[scene.rootContainer.name] = scene;
    }
    addScenes(...scenes: vbScene[]) {
        for (const scene of scenes) {
            this._scenes[scene.name] = scene;
        }
    }

    getTex(name: string) {
        return vbGame.runtimeCheck(this._textures, name, 'texture');
    }
    addTextures(textures: Record<string, PIXI.Texture>) {
        Object.assign(this._textures, textures);
    }
    getSeq(name: string) {
        return vbGame.runtimeCheck(this._sequences, name, 'sequence');
    }
    addSequences(sequences: Record<string, PIXI.Texture[]>) {
        Object.assign(this._sequences, sequences);
    }
    getSpine(name: string) {
        return vbGame.runtimeCheck(this._spines, name, 'spine');
    }
    addSpines(spines: Record<string, PIXI.SpineAsset>) {
        Object.assign(this._spines, spines);
    }

    get DeltaMS() {
        return this.ticker.elapsedMS;
    }
    get TotalMS() {
        return this.ticker.lastTime;
    }
    get FPS() {
        return this.ticker.FPS;
    }

    protected _txtFPS?: FPSCounter;
    showFPS() {
        if (this._txtFPS !== undefined) return;
        this._txtFPS = new FPSCounter();
        this._txtFPS.x = this.desiredWidth - 40;
        this._txtFPS.y = 0;
        this.stage.addObj(this._txtFPS, shared.maxLayer+1);
    }
}

export { vbGame };