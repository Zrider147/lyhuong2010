import * as PIXI from 'pixi.js';
import type { ContainerStyleItem, ViewStyleList } from './core/vbViewStyle';
import { type LocalizationTable, isLocalizedObject, type vbLocalizedObject } from './core/vbLocalization';
import { PivotPoint, assignPivotPoint } from './core/vbTransform';
import { c, shared } from './misc/vbShared';
import { type vbGraphicObject, vbGraphicObjectBase } from './vbGraphicObject';
import { vbTweenGroup } from './third-party/vbTweenGroup';


/**
 * Bare minimum empty container that can only add/remove objects or localize children. \
 * Used for simple objects that don't need to recursively update children, tweening and apply view style.
 * e.g. `vbLabel` is a bare minimum container.
 */
class vbMinimalContainer extends vbGraphicObjectBase(PIXI.Container) implements vbLocalizedObject {
    /**
     * @param hasInteractiveChild Set event mode to `passive` to enable hit test (deault false)
     */
    constructor(hasInteractiveChild=false) {
        super();
        this.sortableChildren = true;
        if (hasInteractiveChild) {
            this.eventMode = 'passive';
        }
    }

    /**
     * @param layer keep object's layer if undefined
     * @param name keep object's name if undefined
     */
    setObj(obj: vbGraphicObject, layer?: number, name?: string) {
        if (layer !== undefined)
            obj.layer = layer;
        if (name !== undefined)
            obj.name = name;
        return this;
    }
    /**
     * @note [Can be used for type check: `isMinimalContainer`]
     * @param layer keep object's layer if undefined
     * @param name keep object's name if undefined
     */
    addObj(obj: vbGraphicObject, layer?: number, name?: string) {
        if (layer !== undefined)
            obj.layer = layer;
        if (name !== undefined)
            obj.name = name;
        this.addChild(obj);
        return this;
    }

    removeObj(obj: vbGraphicObject) {
        this.removeChild(obj);
    }

    /**
     * Recursively set language to all localized objects.
     */
    useLocale(table: LocalizationTable) {
        for (const child of this.children) {
            if (isLocalizedObject(child))
                child.useLocale(table);
        }
    }
}

/**
 * Fully functional container that supports
 * recursively updating children, tweening and applying view style.
 * 
 * As is discussed at `vbGraphicObject.debugBox`, `unscaledBound` can be dynamically changed, \
 * So a `desiredSize` will better help with designing the layout, setting the pivot point etc.
 */
class vbContainer extends vbMinimalContainer {
    readonly tweens = new vbTweenGroup();
    /**
     * Desired size
     * @note [Can be used for type check: `isContainer`]
     */
    readonly desz: PIXI.Rectangle;
    /**
     * The mode of interaction for vbContainer is `passive` by default.
     * @see https://pixijs.download/v7.2.4/docs/PIXI.DisplayObject.html#eventMode
     */
    declare eventMode: PIXI.EventMode;
    /**
     * TODO
     * Use this array of objects instead of the actually added children for applying view styles.
     * (In case some objects are not added yet but needs to use view styles)
     */
    sceneObjs?: vbGraphicObject[];
    protected _frontChild?: vbGraphicObject;
    protected _backChild?: vbGraphicObject;

    constructor();
    constructor(desiredWidth: number, desiredHeight: number);
    constructor(desiredWidth: number, desiredHeight: number, x: number, y: number);
    constructor(...rect: number[]) {
        super(true);
        this.desz = new PIXI.Rectangle();
        if (rect.length > 0) {
            this.setDesiredSize(...(<[]>rect));
        }
        this.update = this._update;
    }

    /**
     * If no arguments are specified, use `unscaledBound` as the desiredSize.
     * Changing this one causes debugBox to be redrawn.
     */
    setDesiredSize(): void;
    setDesiredSize(width: number, height: number): void;
    setDesiredSize(width: number, height: number, x: number, y: number): void;
    setDesiredSize(...rect: number[]) {
        if (rect.length == 0) {
            this.getLocalBounds(this.desz, true);
        }
        else {
            if (rect.length >= 2) {
                this.desz.width = rect[0];
                this.desz.height = rect[1];
            }
            if (rect.length >= 4) {
                this.desz.x = rect[2];
                this.desz.y = rect[3];
            }
        }
        assignPivotPoint(this.pivot, this._pivotRule, this.desz);
        // If there's a debugBox, redraw with new size
        if (this.debugBox) this._drawDebugBox(this.desz);
    }

    get pivotRule() { return this._pivotRule; }
    set pivotRule(rule: PivotPoint) {
        this._pivotRule = rule;
        assignPivotPoint(this.pivot, rule, this.desz);
        if (this.debugBox) this._drawDebugBox(this.desz);
    }
    /** vbContainer has `desiredSize`, so it doesn't need to do anything */
    refreshPivotPoint() {}

    /** @note DO NOT override this method, `enable` will switch it. */
    declare update: (deltaFrame: number) => void;
    /**
     * Switch the `update` function between recursive `_update` or doing nothing.
     * @note The only possible use case is you want it to be displayed but not update. \
     *       Other than that, simply set `visible` to false.
     * @default true
     */
    get enable() {
        return this.update === this._update;
    }
    set enable(en: boolean) {
        this.update = en ? this._update : globalThis.doNothing;
    }
    /**
     * Recursively update tweens and children.
     * @note Override this method for derived classes.
     */
    protected _update(deltaFrame: number) {
        this.tweens.update(globalThis.pgame.TotalMS);
        for (const child of this.children) {
            const vbObj = <vbGraphicObject>child;
            if (!vbObj.visible) continue;
            vbObj.update(deltaFrame);
        }
    }

    /**
     * Try to apply view style and localization to the added object as well.
     * Usually it's only used during scene transition.
     */
    addObjWithStyle(obj: vbGraphicObject, viewStyles: ViewStyleList, locTable: LocalizationTable) {
        this.applyObjWithStyle(obj, viewStyles, locTable);
        this.addChild(obj);
    }
    applyObjWithStyle(obj: vbGraphicObject, viewStyles: ViewStyleList, locTable: LocalizationTable) {
        // try to apply view style
        const item = viewStyles[obj.name];
        if (item !== undefined)
            obj.useViewStyle(item);
        // try to localize
        if (isLocalizedObject(obj))
            obj.useLocale(locTable);
    }

    sendObjToBack(obj: vbGraphicObject) {
        // check if there's an object at the back
        if (this._backChild !== undefined) {
            // only keep one child at back layer
            this._backChild.layer = shared.minLayer + 1;
        }
        obj.layer = shared.minLayer;
        this._backChild = obj;
    }

    bringObjToFront(obj: vbGraphicObject) {
        // check if there's an object at the front
        if (this._frontChild !== undefined) {
            // only keep one child at front layer
            this._frontChild.layer = shared.maxLayer - 1;
        }
        obj.layer = shared.maxLayer;
        this._frontChild = obj;
    }

    useViewStyle(item: ContainerStyleItem) {
        super.useViewStyle(item);
        if (item.dwh !== undefined) {
            this.desz.width = item.dwh[0];
            this.desz.height = item.dwh[1];
            this.setDesiredSize();
        }
    }

    /**
     * Recursively apply view style to all the children.
     */
    useViewStyleChildren(styles: ViewStyleList) {
        vbContainer._viewStyleChildren(styles, this.children);
    }
    protected static _viewStyleChildren(styles: ViewStyleList, childs: PIXI.DisplayObject[]) {
        for (const child of childs) {
            const vbObj = <vbGraphicObject>child;
            const item = styles[vbObj.name];
            if (item !== undefined)
                vbObj.useViewStyle(item);

            if (isContainer(vbObj))
                vbObj.useViewStyleChildren(styles);
        }
    }


    static _debugFillStyle = (() => { const s = new PIXI.FillStyle();
        s.visible = true; s.color = c.White; s.alpha = 0.08; return s;
    })();
    static _debugLineStyle = (() => { const s = new PIXI.LineStyle();
        s.visible = true; s.color = c.Red; s.alpha = 1; s.width = 2.5; return s;
    })();
    /**
     * Show a debug rectangle with desiredSize
     */
    get debugBox() {
        return (this._debugBox !== undefined) && (this._debugBox.visible);
    }
    set debugBox(enable: boolean) {
        enable ? this._drawDebugBox(this.desz) : this._hideDebugBox();
    }
}

function isMinimalContainer(obj: vbGraphicObject): obj is vbMinimalContainer {
    return (<vbMinimalContainer>obj).addObj !== undefined;
}

function isContainer(obj: vbGraphicObject): obj is vbContainer {
    return (<vbContainer>obj).desz !== undefined;
}


/**
 * @see PIXI.ParticleContainer
 */
class vbBatchContainer extends vbGraphicObjectBase(PIXI.ParticleContainer) {

}

export {
    vbMinimalContainer,
    vbContainer,
    isMinimalContainer,
    isContainer,
    vbBatchContainer
};