/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js';
import type { LocalizationTable } from '../core/vbLocalization';
import { PivotPoint } from '../core/vbTransform';
import { type TextFitType, vbText, type vbTextInitOptions } from './vbText';
import { c } from '../misc/vbShared';
import type { vbGraphicObject } from '../vbGraphicObject';
import { vbImage, vbSequence } from './vbImage';
import { vbMinimalContainer } from '../vbContainer';
import { vbPrimitive } from './vbPrimitive';


/**
 * Label is based on an GraphicObject (preferably image or primitive?) with text, \
 * its localization support may change both the text and the graphic object(?).
 * @note The name of label object iself will be used for applying view style,
 * and the name of its text object will be used for apply text style. \
 * By default, if you use `addCenteredTxt` or `addTxtObj` method, they will set
 * the name of label the same as text.
 */
class vbLabel<T extends vbGraphicObject> extends vbMinimalContainer {
    readonly bg: T;
    readonly txt = undefined as unknown as vbText;

    constructor(bg: T) {
        super();
        this.bg = bg;
    }

    /**
     * Add a text object at the center of graphic object `bg`. \
     * Set vbLabel object's name by text's name.
     */
    addCenteredTxt(options: vbTextInitOptions, offsetX=0, offsetY=0) {
        console.assert(this.txt === undefined, 'Duplicate text objects');
        (<any>this).txt = new vbText(options);
        this.centerTxt(offsetX, offsetY);
        // sync name
        this.name = this.txt.name;
        this._addBoth();
    }

    centerTxt(offsetX=0, offsetY=0) {
        this.txt.pivotRule = PivotPoint.Center;
        this.txt.position.set(this.bg.width/2 + offsetX, this.bg.height/2 + offsetY);
    }

    addTxtObj(options: vbTextInitOptions) {
        console.assert(this.txt === undefined, 'Duplicate text objects');
        (<any>this).txt = new vbText(options);
        // sync name
        this.name = this.txt.name;
        this._addBoth();
    }

    setText(s: string | number) {
        this.txt.text = s;
    }

    txtFitType(value: TextFitType) {
        this.txt.fitType = value;
        return this;
    }

    /**
     * Set the text fit box to width and height of `bg`, multiplied by ratio.
     * (default are all infinity) \
     * Should set the `fitType` first.
     * 
     * @param reversed Set `bg.height` to fit box `width`, vice versa.
     */
    txtFitBox(widthRatio=Infinity, heightRatio=Infinity, scale=1, reversed=false) {
        if (!reversed)
            this.txt.setFitBox(this.bg.width * widthRatio, this.bg.height * heightRatio, scale);
        else
            this.txt.setFitBox(this.bg.height * heightRatio, this.bg.width * widthRatio, scale);
        return this;
    }

    txtStyle(style: Partial<PIXI.ITextStyle>) {
        Object.assign(this.txt.style, style);
    }

    txtKey(key: string) {
        this.txt.setKey(key);
    }

    txtKeyFormat(key: string, ...args: (string | number)[]) {
        this.txt.setKeyFormat(key, ...args);
    }

    update(deltaFrame: number) {
        this.bg.update(deltaFrame);
        this.txt.update(deltaFrame);
    }

    useLocale(table: LocalizationTable) {
        this.txt.useLocale(table);
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Magneta; s.alpha = 1; s.width = 2; return s;
    })();

    protected _addBoth() {
        if (this.isInteractive())
            this.bg.eventMode = this.txt.eventMode = 'auto';
        this.addObj(this.bg, 0)
            .addObj(this.txt, 1);
    }
}


class vbImageLabel extends vbLabel<vbImage> {
    constructor(texName: string) {
        super(new vbImage(texName));
    }
}

class vbPrimiLabel extends vbLabel<vbPrimitive> {
    constructor(shapeData: Exclude<ConstructorParameters<typeof vbPrimitive>[0], undefined>) {
        super(new vbPrimitive(shapeData));
    }
}

/**
 * Centered text position is relative to the first texture in the sequence,
 * so it is recommended to ensure all textures in the sequence have the same size.
 */
class vbSeqLabel extends vbLabel<vbSequence> {
    constructor(...args: [seqName: string, FPS?: number, loop?: boolean]) {
        super(new vbSequence(...args));
    }
}

export {
    vbLabel,
    vbImageLabel,
    vbPrimiLabel,
    vbSeqLabel
};