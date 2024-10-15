import * as PIXI from 'pixi.js';
import FontFaceObserver from 'fontfaceobserver';
import type { LocalizationTable } from '../core/vbLocalization';
import { SupportedSoundExts } from './vbSound';
import { type ViewStyleList, type ViewStyleTable, loadViewStyleFromData } from '../core/vbViewStyle';


interface AssetList {
    img: Record<string, string>;
    /**
     * JSON of texture pack,
     * if it's a multipack, only show the first one.
     */
    img_atlas: Record<string, string>;
    /**
     * If there's a multipack json in `img_atlas`,
     * here stores the rest of them.
     */
    img_atlas_multipacks: Record<string, string[]>;
    spine_json: Record<string, string>;
    sound: Record<string, string>;
    /** View styles. Production build bundle all into one single file. */
    style: { DEV: Record<string, string>, PROD: Record<string, string> };
    /** Localizations. Production build bundle all into one single file. */
    lang: { DEV: Record<string, string>, PROD: Record<string, string> };
    custom: Record<string, string>;
    fileSize: number;
}

/** Progress data for all the starter assets */
type StarterPackData = {
    all: {
        /** total number of all assets */
        n: number,
        nLoaded: number,
        fileSize: number
    },
    bundles: {
        [bundleName: string]: {
            /** total number of assets in bundle */
            n: number,
            nLoaded: number,
            fileSize: number
        }
    },
    promises: (() => Promise<void>)[],
    logProgress: (bundleName: string, bundleProgress: number) => void;
}

declare module 'pixi.js' {
    interface AssetsClass {
        prepareLoading(useFileSizeProgress?: boolean): void;
        list: AssetList;
        starter: StarterPackData;
        /** Called before loading resources from the list */
        onPreprocessAssetList?: (list: AssetList) => void;
        /** Pass the total progress (0 - 1.0) as argument */
        onTotalProgress?: (progress: number) => void;

        /**
         * First import your css font styles into somewhere, then use this method to watch if it's loaded
         * 
         * @param variant see `FontFaceObserver`
         * @param testString see `FontFaceObserver` documentation, for non-latin languages.
         * @param timeout default is nearly infinite (9,999,999)
         */
        addCSSFont(fontFamily: string, variant?: FontFaceObserver.FontVariant, testString?: string, timeout?: number): void;
        /** Load all the assets we need as described in `AssetList` */
        loadFromList(list: AssetList): Promise<void[]>;
        /** Get both texture map and sequence map, no matter they are multipacked or not. */
        get_multipack_textureMap(list: Pick<AssetList, 'img'|'img_atlas'>): [Record<string, PIXI.Texture>, Record<string, PIXI.Texture[]>];
        get_SpineMap(list: AssetList['spine_json']): Record<string, PIXI.SpineAsset>;
        get_viewStyleMap(list: AssetList['style']): Record<string, ViewStyleTable>;
        get_localeMap(list: AssetList['lang']): Record<string, LocalizationTable>;
    }
}


/**
 * Load a single json
 */
function load_json(filename: string) {
    return fetch(filename)
        .then((response: Response) => response.json());
}
/**
 * Load multiple json files
 */
function load_jsons(filenames: string[]) {
    return Promise.all(
        filenames.map((filename: string) => {
            return fetch(filename).then((response: Response) => response.json());
        })
    );
}


PIXI.AssetsClass.prototype.prepareLoading = function(useFileSizeProgress=false) {
    this.starter = {
        all: { n:0, nLoaded:0, fileSize:0 },
        bundles: {}, promises: [],
    } as unknown as StarterPackData;

    let getTotalProgress: () => number;
    if (useFileSizeProgress) {
        getTotalProgress = () => {
            let loadedFileSize = Object.values(this.starter.bundles)
                .reduce<number>((accumulator, current) => {
                    return accumulator += (current.nLoaded / current.n) * current.fileSize;
                }, 0);
            return loadedFileSize / this.starter.all.fileSize;
        };
    }
    else {
        getTotalProgress = () => (this.starter.all.nLoaded / this.starter.all.n);
    }
    this.starter.logProgress = (bundleName, bundleProgress) => {
        const bundlePercent = (100 * bundleProgress).toFixed(2).padStart(6, ' ') + '%';
        const totProgress = getTotalProgress();
        const totPercent = (100 * totProgress).toFixed(2).padStart(6, ' ') + '%';

        console.debug(`[LOADED] Total:${totPercent}  |  ${bundleName}:${bundlePercent}`);
        this.onTotalProgress?.(totProgress);
    }
}


PIXI.AssetsClass.prototype.addCSSFont = function(fontFamily, variant, testString, timeout=9999_999) {
    let info = this.starter.bundles['CSS-Font'];
    if (info === undefined) {
        info = this.starter.bundles['CSS-Font'] = {
            n:0, nLoaded:0, fileSize:0
        }
    }
    /** don't care about the accurate file size, just set a fake one */
    const fakeSize = 200_000;
    info.n++;
    info.fileSize += fakeSize;
    this.starter.all.n++;
    this.starter.all.fileSize += fakeSize;

    const font = new FontFaceObserver(fontFamily, variant);
    this.starter.promises.push(() =>
        font.load(testString, timeout).then(() => {
            info.nLoaded++;
            this.starter.all.nLoaded++;
            this.starter.logProgress('CSS-Font', (info.nLoaded / info.n));
        })
    );
}


PIXI.AssetsClass.prototype.loadFromList = function(list) {
    this.onPreprocessAssetList?.(list);
    this.list = list;
    this.starter.all.fileSize += list.fileSize;

    // temporarily hide annoying texture cache warning
    // https://www.html5gamedevs.com/topic/42438-warging-texture-added-to-the-cache-with-an-id-0-that-already-had-an-entry-when-using-spritesheetparse/
    // const console_warn = console.warn;
    // console.warn = globalThis.doNothing;

    const createOnProgress = (bundleName: string, bundleInfo: StarterPackData['bundles']['']) => {
        return (progress: number) => {
            bundleInfo.nLoaded++;
            this.starter.all.nLoaded++;
            this.starter.logProgress(bundleName, progress);
        }
    }
    const addBundle = (bundleName: string, bundle: Record<string, string>) => {
        let fileSize = 0;
        if ('fileSize' in bundle) {
            fileSize = <number><unknown>bundle['fileSize'];
            delete bundle['fileSize'];
        }
        const num = Object.keys(bundle).length;
        if (num == 0) return;

        this.starter.all.n += num;
        const bundleInfo = this.starter.bundles[bundleName] = {
            n:num, nLoaded:0, fileSize:fileSize
        }
        this.addBundle(bundleName, bundle);
        this.starter.promises.push(() =>
            this.loadBundle(bundleName, createOnProgress(bundleName, bundleInfo))
        );
    }
    addBundle('Image', list.img);
    addBundle('Texture', list.img_atlas);
    addBundle('Spine', list.spine_json);
    addBundle('Sound', list.sound);
    addBundle('Style', DEV ? list.style.DEV : list.style.PROD);
    addBundle('Localization', DEV ? list.lang.DEV : list.lang.PROD);
    console.debug('SupportedSoundExts:', JSON.stringify(SupportedSoundExts, undefined, 2));
    addBundle('Custom', list.custom);

    return Promise.all(this.starter.promises.map(f => f()));
}


PIXI.AssetsClass.prototype.get_multipack_textureMap = function(list) {
    const textureMap: Record<string, PIXI.Texture> = {};
    // get textures from each of the single image
    for (const name of Object.keys(list.img)) {
        const tex = this.get<PIXI.Texture>(name);
        textureMap[name] = tex;
    }

    const getAtlasTextures = (sheet: PIXI.Spritesheet) => {
        Object.assign(textureMap, sheet.textures);
    }
    // get textures from texture atlas
    for (const name of Object.keys(list.img_atlas)) {
        const sheet = this.get<PIXI.Spritesheet>(name);
        if (sheet === undefined) continue;
        getAtlasTextures(sheet);
        for (const linkedSheet of sheet.linkedSheets) {
            getAtlasTextures(linkedSheet);
        }
    }

    const sequenceMap: Record<string, PIXI.Texture[]> = {};
    // get animation sequences
    for (const name of Object.keys(list.img_atlas)) {
        const sheet = this.get<PIXI.Spritesheet>(name);
        if (sheet === undefined || sheet.data.animations === undefined) continue;
        // here if the textures of an animation sequence are spreaded across multiple spritesheet
        // PixiJs cannot automatically combine them, we have to do it by ourselves
        for (const seqName in sheet.data.animations) {
            const texNames = sheet.data.animations[seqName];
            sequenceMap[seqName] = texNames.map((texName) => textureMap[texName]);
        }
    }
    return [textureMap, sequenceMap];
}


PIXI.AssetsClass.prototype.get_SpineMap = function(list) {
    const spineMap: Record<string, PIXI.SpineAsset> = {};
    for (const name of Object.keys(list)) {
        const data = this.get<PIXI.SpineAsset>(name);
        spineMap[name] = data;
    }
    return spineMap;
}


PIXI.AssetsClass.prototype.get_viewStyleMap = function(list) {
    const styleMap: Record<string, ViewStyleTable> = {};
    if (DEV) {
        for (const name of Object.keys(list.DEV)) {
            const styleGroups = this.get(name);
            if (styleGroups === undefined) continue;
            styleMap[name] = loadViewStyleFromData(name, styleGroups);
        }
    }
    else {
        const bundle = this.get<Record<string, Record<string, ViewStyleList>>>('styleBundle');
        for (const [name, styleGroups] of Object.entries(bundle)) {
            styleMap[name] = loadViewStyleFromData(name, styleGroups);
        }
    }
    return styleMap;
}


PIXI.AssetsClass.prototype.get_localeMap = function(list) {
    const localeMap: Record<string, LocalizationTable> = {};
    if (DEV) {
        for (const code of Object.keys(list.DEV)) {
            const table = this.get<Omit<LocalizationTable, 'code'>>(code);
            if (table === undefined) continue;
            localeMap[code] = { code, ...table };
        }
    }
    else {
        const bundle = this.get<Record<string, Omit<LocalizationTable, 'code'>>>('langBundle');
        for (const [code, table] of Object.entries(bundle)) {
            localeMap[code] = { code, ...table };
        }
    }
    return localeMap;
}

export {
    type AssetList,
    load_json,
    load_jsons
};