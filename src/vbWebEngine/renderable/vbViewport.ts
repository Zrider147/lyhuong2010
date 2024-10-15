import * as PIXI from 'pixi.js';
import type { LocalizationTable } from '../core/vbLocalization';
import type { ViewStyleList } from '../core/vbViewStyle';
import { Viewport } from 'pixi-viewport';
import { vbContainer } from '../vbContainer';
import { type vbGraphicObject, vbGraphicObjectBase } from '../vbGraphicObject';
import type { vbImage } from './vbImage';
import { vbPrimitive, vbRectangle } from './vbPrimitive';


/**
 * @note Not an actual vbContainer
 */
class _vbInteractiveViewport extends vbGraphicObjectBase(Viewport) {
    get parentContainer() { return this.parent as vbContainer; }
    sendObjToBack(obj: vbGraphicObject) {
        this.parentContainer.sendObjToBack(obj);
    }
    bringObjToFront(obj: vbGraphicObject) {
        this.parentContainer.bringObjToFront(obj);
    }
}
/**
 * Interactive viewport from library `pixi-viewport` \
 * https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html
 * https://github.com/davidfig/pixi-viewport
 * 
 * The class itself is a container that wraps up the `Viewport`
 * as child object for better relativeness management. \
 * Then it "hacks" the container's methods so that it behaves like `Viewport` is the container.
 * 
 * Desired size is used for setting world size of `Viewport`
 */
class vbInteractiveViewport extends vbContainer {
    /** The actual viewport container */
    readonly vp: _vbInteractiveViewport;
    area?: vbPrimitive | vbImage;
    protected _autoHitArea = false;

    /**
     * @param hitArea `full`: the whole canvas is the hit area;
     *                 `auto`: use desired size as hit area; 
     *                 `custom`: maintain hit are by yourself
     */
    constructor(hitArea: 'full'|'auto'|'custom');
    constructor(hitArea: 'full'|'auto'|'custom', desiredWidth: number, desiredHeight: number);
    constructor(hitArea: 'full'|'auto'|'custom', ...rect: number[]) {
        super();
        this.updateInteraction = this.updateInteraction.bind(this);

        let _forceHitArea: PIXI.Rectangle | undefined;
        if (hitArea != 'full') {
            _forceHitArea = new PIXI.Rectangle(0, 0, 0, 0);
        }
        if (hitArea == 'auto') {
            this._autoHitArea = true;
        }
        this.vp = new _vbInteractiveViewport({
            noTicker: true,
            stopPropagation: true,
            forceHitArea: _forceHitArea,
            events: globalThis.pgame.renderer.events
        });
        this.setDesiredSize(...(<[]>rect));
        this.addChild(this.vp);
    }

    setDesiredSize(): void;
    setDesiredSize(width: number, height: number): void;
    setDesiredSize(...rect: number[]) {
        super.setDesiredSize(...(<[]>rect));
        this.vp.worldWidth = this.desz.width;
        this.vp.worldHeight = this.desz.height;
        if (this._autoHitArea) {
            const hitArea = <PIXI.Rectangle>this.vp.hitArea;
            hitArea.width = this.desz.width;
            hitArea.height = this.desz.height;
        }
    }

    /**
     * For real-time concerns we don't put the interaction update into main loop.
     */
    updateInteraction() {
        Viewport.prototype.update.call(this.vp, globalThis.pgame.DeltaMS);
        if (this._autoHitArea) {
            const hitArea = <PIXI.Rectangle>this.vp.hitArea;
            hitArea.x = this.vp.left;
            hitArea.y = this.vp.top;    
        }
    }
    /**
     * Add the interaction update to ticker as a separate loop function.
     */
    startUpdate() {
        globalThis.pgame.ticker.add(this.updateInteraction, {}, PIXI.UPDATE_PRIORITY.NORMAL);
    }

    /**
     * Create a default rectangle mask with desired size.
     */
    createDefaultMask() {
        let rect = new vbRectangle(this.desz.width, this.desz.height).fill(0, 0.3);
        this.useMask(new vbPrimitive(rect));
    }
    useMask(area: vbPrimitive | vbImage) {
        if (this.area !== undefined) {
            this.removeChild(this.area);
        }
        this.area = area;
        area.layer = 1;
        this.addChild(area);
        this.mask = area;
    }

    toggleMask(on: boolean) {
        if (on && this.area !== undefined) {
            this.mask = this.area;
        }
        else {
            this.mask = null;
        }
    }

    addObj(obj: vbGraphicObject, layer=NaN, name='') {
        vbContainer.prototype.addObj.call(this.vp, obj, layer, name); return this;
    }
    addObjWithStyle(obj: vbGraphicObject, viewStyles: ViewStyleList, locTable: LocalizationTable) {
        vbContainer.prototype.addObjWithStyle.call(this.vp, obj, viewStyles, locTable);
    }
    removeObj(obj: vbGraphicObject) {
        vbContainer.prototype.removeObj.call(this.vp, obj);
    }
    protected _update(deltaFrame: number) {
        this.tweens.update(globalThis.pgame.TotalMS);
        for (const child of this.vp.children) {
            const vbObj = <vbGraphicObject>child;
            if (!vbObj.visible) continue;
            vbObj.update(deltaFrame);
        }
    }
    useLocale(table: LocalizationTable) {
        vbContainer.prototype.useLocale.call(this.vp, table);
    }
    useViewStyleChildren(styles: ViewStyleList) {
        vbContainer.prototype.useViewStyleChildren.call(this.vp, styles);
    }
}


/**
 * A simple viewport implemented by using mask.
 */
class vbSimpleViewport extends vbContainer {
    readonly obj: vbContainer;
    area: vbPrimitive | vbImage;

    /**
     * @param obj The actual container to display
     * @param area The mask of the viewport, it's a primitive shape or sprite.
     *               If it's not specified, create a rectangle with the size of container.
     */
    constructor(obj: vbContainer, area?: vbPrimitive | vbImage) {
        if (area !== undefined) {
            super(area.width, area.height);
            this.area = area;
        }
        else {
            super(obj.width, obj.height);
            let rect = new vbRectangle(obj.width, obj.height);
            this.area = new vbPrimitive(rect.fill(0, 0.3));
        }
        this.obj = obj;
        this.addObj(this.area, 1);
        this.addObj(obj, 0);
    }

    toggleMask(on: boolean) {
        if (on) {
            this.mask = this.area;
        }
        else {
            this.mask = null;
        }
    }
}

export { vbInteractiveViewport, vbSimpleViewport };