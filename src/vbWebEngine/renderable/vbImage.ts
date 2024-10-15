import * as PIXI from 'pixi.js';
import { AnimatedSprite, Sprite } from 'pixi.js'
import type { ImageStyleItem } from '../core/vbViewStyle';
import type { LocalizationTable, vbLocalizedObject } from '../core/vbLocalization';
import { c } from '../misc/vbShared';
import { vbGraphicObjectBase } from '../vbGraphicObject';


class vbImage extends vbGraphicObjectBase(Sprite) {
    /**
     * @param texName Name of texture in texture map.
     */
    constructor(texName?: string) {
        super(texName !== undefined ? globalThis.pgame.getTex(texName) : undefined);
    }

    setTex(texName: string) {
        this.texture = globalThis.pgame.getTex(texName);
    }

    useViewStyle(item: ImageStyleItem) {
        super.useViewStyle(item);
        if (item.tex !== undefined)
            this.setTex(item.tex);
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Yellow; s.alpha = 1; s.width = 2; return s;
    })();
}


class vbSequence extends vbGraphicObjectBase(AnimatedSprite) {
    /**
     * @param seqName Name of sequence in sequence map.
     * @param FPS (default 60)
     * @param loop (default false)
     */
    constructor(seqName: string, FPS=60, loop=false) {
        super(globalThis.pgame.getSeq(seqName));
        this.FPS = FPS;
        this.loop = loop;
    }

    setSeq(seqName: string) {
        this.textures = globalThis.pgame.getSeq(seqName);
    }

    get FPS() {
        // 60 is the target FPS
        return this.animationSpeed * 60;
    }
    set FPS(fps: number) {
        this.animationSpeed = fps / 60;
    }

    update(deltaFrame: number) {
        AnimatedSprite.prototype.update.call(this, deltaFrame);
    }

    static _debugLineStyle = (() => { let s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Orange; s.alpha = 1; s.width = 2; return s;
    })();
}


class vbLocalizedImage extends vbImage implements vbLocalizedObject {
    protected _key = '';

    /** @param key Key in dict for image name */
    constructor(key: string) {
        super(<string>globalThis.pgame.currLocale.dict[key]);
        this._key = key;
    }

    setKey(key: string) {
        const texName = <string>globalThis.pgame.currLocale.dict[key];
        this._key = key;
        this.texture = globalThis.pgame.getTex(texName);
    }

    useLocale(table: LocalizationTable) {
        const texName = <string>table.dict[this._key];
        this.texture = globalThis.pgame.getTex(texName);
    }
}

class vbLocalizedSeq extends vbSequence implements vbLocalizedObject {
    protected _key = '';

    /** @param key Key in dict for sequence name */
    constructor(key: string, FPS?: number, loop?: boolean) {
        super(<string>globalThis.pgame.currLocale.dict[key], FPS, loop);
        this._key = key;
    }

    setKey(key: string) {
        const seqName = <string>globalThis.pgame.currLocale.dict[key];
        this._key = key;
        this.textures = globalThis.pgame.getSeq(seqName);
    }

    useLocale(table: LocalizationTable){
        const seqName = <string>table.dict[this._key];
        this.textures = globalThis.pgame.getSeq(seqName);
    }
}

export {
    vbImage,
    vbSequence,
    vbLocalizedImage,
    vbLocalizedSeq
};