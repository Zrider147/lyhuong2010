import type * as PIXI from 'pixi.js';
import type { vbGraphicObject } from '../vbGraphicObject';


/** Each text style is assigned to a vbLocalizedObject */
type TextStyleItem = Partial<Omit<PIXI.ITextStyle, 'fontFamily'|'fontSize'>>
    & {
    /**
     * `PIXI.TextStyle.fontFamily` \
     * If this property is not specified, then the actual font family depends on the options during init.
     * @see `vbTextInitOptions`. If the object doesn't use default font, it remains unchanged.
     */
    font?: string | string[],
    /** `PIXI.TextStyle.fontSize` */
    size?: number
    /** (maybe) right align for Arabic?  */
    align?: PIXI.TextStyleAlign,
    /** (maybe) break words for CJK language? */
    breakWords?: boolean
}

/** Each name of vbLocalizedObject maps a text style item */
type TextStyleList = {
    [name: string]: TextStyleItem
}

/**
 * Each key name maps a text string. \
 * Sometimes it may be a list or map depends on the need.
 * Note that method `vbText.setKey` assumes it is a string, rather than other types. \
 * For localized image, each key name maps a texture,
 * sometimes different styles (landscape, portrait etc) may also have different textures
 */
type LocalizedDictionary = {
    [key: string]:
        string
        | string[]
        | { [subKey: string]: string }
}


type LocalizationTable = {
    /** abbrev of locale (en, fr, etc.), specified in assets-list.json */
    code: string,
    /** full name of locale */
    name: string,
    /** default font family for this locale */
    defaultFont: string | string[],

    dict: LocalizedDictionary,
    styles: TextStyleList
}

interface vbLocalizedObject extends vbGraphicObject {
    /**
     * Use the localization with a given locale.
     * @note [Can be used for type check: `isLocalizedObject`]
     */
    useLocale(table: LocalizationTable): void;
}

function isLocalizedObject(obj: PIXI.DisplayObject): obj is vbLocalizedObject {
    return (<vbLocalizedObject>obj).useLocale !== undefined;
}

const emptyLocale: LocalizationTable = { code:'', name:'', defaultFont:'', dict:{}, styles:{} };

export {
    type TextStyleItem,
    type TextStyleList,
    type LocalizedDictionary,
    type LocalizationTable,
    type vbLocalizedObject,
    isLocalizedObject,
    emptyLocale
};