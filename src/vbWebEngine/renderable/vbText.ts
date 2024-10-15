/** https://pixijs.io/pixi-text-style/# */
import * as PIXI from 'pixi.js';
import type { LocalizationTable, TextStyleItem, vbLocalizedObject } from '../core/vbLocalization';
import { c } from '../misc/vbShared';
import { vbGraphicObjectBase } from '../vbGraphicObject';


/**
 * Options while constructing vbText. \
 * It's basically `PIXI.ITextStyle` but with some additional options,
 * and rename a few properties for convenience.
 */
type vbTextInitOptions =  Partial<Omit<PIXI.ITextStyle,
    'fontFamily'|'fontSize'|'fontWeight'|'fontStyle'|'wordWrapWidth'>>
    & {
    text?: string | number,
    /** text and key are mutually exclusive, should only pick one */
    key?: string,
    /**
     * name of this vbText object \
     * Match the name in style json and localization json.
     */
    name?: string,
    /**
     * text color (supports gradient?) \
     * If not specified, default color is white.
     */
    fill?: PIXI.TextStyleFill,
    /**
     * `PIXI.TextStyle.fontFamily` \
     * If this property is not specified, will use the default font of current locale.
     */
    font?: string | string[],
    /** `PIXI.TextStyle.fontSize` */
    size?: number,
    /** `PIXI.TextStyle.fontWeight` */
    weight?: PIXI.TextStyleFontWeight,
    /** `PIXI.TextStyle.fontStyle` */
    style?: PIXI.TextStyleFontStyle,
    /**
     * `PIXI.TextStyle.wordWrapWidth` \
     * Setting it will also set `PIXI.TextStyle.wordWrap` to true, which enables multi-lines.
     * (it's not the concept of "bounding box" or "fit box")
     */
    width?: number,
    /** align only makes sense when multi-lines is enabled */
    align?: PIXI.TextStyleAlign,
    /** stroke (outline) color */
    stroke?: number,
    /** stroke (outline) width */
    strokeThickness?: number,
}


type TextFitType = 'None' | 'Shrink';


/**
 * Text With localization support
 */
class vbText extends vbGraphicObjectBase(PIXI.Text) implements vbLocalizedObject {
    protected _key = '';
    protected _args?: (string | number)[];
    protected _useDefaultFont: boolean;
    protected _fitType: TextFitType = 'None';
    readonly fitBox = { width:Infinity, height:Infinity, scale:1 };

    constructor(options: vbTextInitOptions) {
        const text = options.text;
        const key = options.key;
        const name = options.name ?? '';

        const style = vbText.getStyleFromInitOptions(options, name);
        let useDefaultFont = false;
        if (style.fontFamily === undefined) {
            useDefaultFont = true;
            style.fontFamily = globalThis.pgame.currLocale.defaultFont;
        }

        super(text, style);
        this.name = name;
        this._useDefaultFont = useDefaultFont;
        if (key !== undefined)
            this.setKey(key);
    }

    get text(): string { return super.text; }
    set text(text: string | number) {
        super.text = text;
        if (this.dirty)
            this._fitScale();
    }

    get fitType() { return this._fitType; }
    set fitType(value: TextFitType) {
        if (this._fitType == value) return;
        this._fitType = value;
        switch (value) {
            case 'None':
                this._fitScale = vbText.prototype._fitScale; break;
            case 'Shrink':
                this._fitScale = this._shrinkScale; break;
        }
        this._fitScale();
    }

    /**
     * Fit box adjusts the text scale using the rule of `fitType`.
     * (default are all infinity) \
     * Should set the `fitType` first.
     */
    setFitBox(width=Infinity, height=Infinity, scale=1) {
        this.fitBox.width = width;
        this.fitBox.height = height;
        this.fitBox.scale = scale;
        this._fitScale();
    }

    setTxtStyle(style: Partial<PIXI.ITextStyle>) {
        Object.assign(this.style, style);
    }

    /**
     * Set text using a key in localization table. (It assumes the item is a string, not an array or map)
     */
    setKey(key: string) {
        this._key = key;
        this._args = undefined;
        const text = <string>globalThis.pgame.currLocale.dict[key];
        if (text !== undefined)
            this.text = text;
    }

    /**
     * Set text using a key in localization table. (It assumes the item is a string, not an array or map) \
     * Format {0}, {1}, ... to arguments.
     */
    setKeyFormat(key: string, ...args: (string | number)[]) {
        this._key = key;
        this._args = args;
        const fmtText = <string>globalThis.pgame.currLocale.dict[key];
        if (fmtText !== undefined) {
            this.text = fmtText.format(...args);
        }
    }

    useLocale(table: LocalizationTable) {
        const fmtText = <string>table.dict[this._key];
        if (fmtText !== undefined) {
            if (this._args === undefined)
                this.text = fmtText;
            else
                this.text = fmtText.format(...this._args);
        }

        const item = table.styles[this.name];
        if (item !== undefined)
            Object.assign(this.style, vbText.getStyleFromItem(this, item));
    }

    clear() {
        this.text = '';
    }

    protected _fitScale() {}
    protected _shrinkScale() {
        const box = this.fitBox;
        if (box.width == Infinity && box.height == Infinity) return;
        const bound = this.unscaledBound;
        let scaleWidth = box.width / bound.width;
        let scaleHeight = box.height / bound.height;
        let scale = Math.min(box.scale, scaleWidth, scaleHeight);
        this.scale.set(scale);
    }

    /**
     * Merge init options and text style item, convert to type `PIXI.ITextStyle`
     * (delete or rename properties)
     */
    static getStyleFromInitOptions(options: vbTextInitOptions, name: string) {
        // convert init options to texts style inplace
        const style = options as Partial<PIXI.ITextStyle>;
        delete options.text,delete options.key, delete options.name;

        Object.rename(options, 'font', 'fontFamily');
        Object.rename(options, 'size', 'fontSize');
        Object.rename(options, 'weight', 'fontWeight');
        Object.rename(options, 'style', 'fontStyle');
        style.fill = options.fill ?? c.White;
        if (options.width !== undefined) {
            style.wordWrap = true;
            style.wordWrapWidth = options.width;
            delete options.width;
        }

        const item: TextStyleItem | undefined = globalThis.pgame.currLocale.styles[name];
        if (item !== undefined) {
            Object.rename(item, 'font', 'fontFamily');
            Object.rename(item, 'size', 'fontSize');
            Object.assign(style, item);
        }
        return style;
    }

    /**
     * Convert text style item to type `PIXI.ITextStyle`
     * (delete or rename properties)
     */
    static getStyleFromItem(txt: vbText, item: TextStyleItem) {
        // convert inplace
        const style = item as Partial<PIXI.ITextStyle>;

        if (item.font !== undefined) {
            style.fontFamily = item.font;
            delete item.font;
        }
        else if (txt._useDefaultFont)
            style.fontFamily = globalThis.pgame.currLocale.defaultFont;
        Object.rename(item, 'size', 'fontSize');
        return style;
    }

    static getByKey(key: string) {
        let text = <string>globalThis.pgame.currLocale.dict[key];
        return text ? text : '';
    }
    static getByKeyFormat(key: string, ...args: (string | number)[]) {
        let fmtText = <string>globalThis.pgame.currLocale.dict[key];
        return fmtText ? fmtText.format(...args) : '';
    }
}

export {
    type vbTextInitOptions,
    vbText,
    type TextFitType
}