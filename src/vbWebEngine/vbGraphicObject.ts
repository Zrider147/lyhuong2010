/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js';
import { PivotPoint, assignPivotPoint, assignPivotPointRatio } from './core/vbTransform';
import type { ViewStyleItem } from './core/vbViewStyle';
import { c, m, shared } from './misc/vbShared';
import type { vbMinimalContainer } from './vbContainer';


declare global {
    type AnyObject = Record<string, any>;
    namespace FType {
        type AnyVoid = (...args: any[]) => void;
    }
    /** Define "Class" type which has a constructor */
    type ClassType<T> = new (...args: any[]) => T;

    var doNothing: () => void;
    namespace GlobalMixins {
        interface Container {
            update(deltaFrame: number): void;
        }
    }
}
globalThis.doNothing = () => {};
// inject an update method
PIXI.Container.prototype.update = globalThis.doNothing;


/**
 * vbWebEngine base class, inherited from PixiJs Container.
 * Note that in PixiJs everything is container which enables you to add/remove childs,
 * but they lack the features of `vbMinimalContainer` and `vbContainer`.
 * 
 * The reason why we have to "declare" an abstract class first instead of
 * writing an interface or simply writing implementation only
 * is the limitation on mixins, see the mixin function below.
 */
declare abstract class vbGraphicObject extends PIXI.Container {
    /**
     * `name` of an object is used for matching view style or localized text style. \
     * It works like the class names of html elements, except that there's only one name for each object.
     */
    name: string;
    /**
     * The mode of interaction for vbGraphicObject is `none` by default
     * to avoid unnecessary hit-testing and gain better performance.
     * @see https://pixijs.download/v7.2.4/docs/PIXI.DisplayObject.html#eventMode
     */
    declare eventMode: PIXI.EventMode;

    protected _pivotRule: PivotPoint;
    /** For some reason, this debugBox cannot be a derived class of vbGraphicObject (recursive dependency?) */
    protected _debugBox?: PIXI.Graphics;
    /**
     * The display object container that contains this display object.
     * @note Here we assume one's parent is always vbMinimalContainer or its derived classes,
     *       if in reality it's not then you're screwed.
     */
    get parentContainer(): vbMinimalContainer;
    /**
     * Pivot Rule affects positioning, scaling and roation.
     * - For regular object, the pivot is calculated by `unscaledBound`
     * - For sprites like Image, Sequence and Text, they have their texture anchors so you don't worry about boundary.
     * - For vbContainer, the pivot is calculated by `desiredSize`.
     * - If it's `None`, you can set pivot by yourself.
     * @see `unscaledBound`: Set the rule AFTER all necessary childs are added to get a correct boundary.
     * @default None
     */
    get pivotRule(): PivotPoint;
    set pivotRule(rule: PivotPoint);
    /**
     * @see `unscaledBound`: You might need to recalculate pivot point with new bounds if necessary.
     */
    refreshPivotPoint(): void;
    /**
     * Unscaled boundary (x, y, width and height).
     * (AKA `localBounds` in PixiJs. We use it because `width` and `height` properties are scaled relative to parent container)
     * @note It is calculated by object itself and its child which can be dynamically changed. \
     * All objects `debugBox` are shown base on it, and some objects calculate `pivotRule` upon it,
     * both of them are not updated along with the changes on boundary. \
     * Therefore, those two features don't work well with some objects whose boundary can be frequently changed. (Spine, Particle...)
     */
    get unscaledBound(): PIXI.Rectangle;
    /**
     * PixiJs uses deltaFrame instead of delatTime in milliseconds as the parameter of update function.
     * But sometimes we need delatTime, or even the total time since game started (for Tween.js),
     * Thus we could call `DeltaMS`, `TotalMS` etc, from vbGame. \
     * Setting `visible` to false stops the update while setting `renderable` doesn't stop it.
     * 
     * @param deltaFrame Number of (desired) frames since last call.
     *        It is calculated based on the target FPS (by default is 60). \
     *        e.g. If the real FPS is 45, deltaFrame is around 1.5
     */
    update(deltaFrame: number): void;
    /**
     * The larger the value, the highter it closes to the front,
     * and the greater the index in Container.children.
     */
    get layer(): number;
    set layer(z: number);
    hasParent(): boolean;
    /**
     * Rotation in radian:
     * - fit radian to `[0, 2PI)` if it's positive
     * - fit radian to `(-2PI, 0]` if it's negative
     */
    get radian(): number;
    set radian(value: number);
    /**
     * Use the view style with a given item.
     * @note [Can be used for type check: `isGraphicObject`]
     * 
     * @param item make sure `item` is not undefined.
     */
    useViewStyle(item: ViewStyleItem): void;
    addFilter(filter: PIXI.Filter): void;
    /**
     * For some weird reason, `_width` is protected in PIXI.Container, but public in PIXI.Sprite.
     * Thus we have to declare it as public for consistency.
     */
    declare public _width: number;
    /**
     * For some weird reason, `_height` is protected in PIXI.Container, but public in PIXI.Sprite.
     * Thus we have to declare it as public for consistency.
     */
    declare public _height: number;

    /** Different classes can have different debugBox fill style. */
    static _debugFillStyle: PIXI.FillStyle;
    /** Different classes can have different debugBox line style. */
    static _debugLineStyle: PIXI.LineStyle;
    /**
     * Show a debug rectangle as well as a dot represents the original point of object's local coordinate.
     * @see `pivotRule`
     * @see `unscaledBound`
     */
    get debugBox(): boolean;
    set debugBox(enable: boolean);
    protected _drawDebugBox(bound: PIXI.Rectangle): void;
    protected _hideDebugBox(): void;
}

/**
 * Mixin to make other PixiJs classes as vbGraphicObject, like multiple inheritance. \
 * https://www.typescriptlang.org/docs/handbook/mixins.html
 * 
 * Typescript compiler complains and refuses to emit declarations for classes created by mixin functions.
 * This is a well-known issue and has been discussed by lots of developers. \
 * Currently, the only way to get around is to provide enough type annotations
 * for compiler and do some shady type cast. \
 * Because interface can't have any protected or private property, we declare abstract class here.
 * Biggest drawback of this solution is, by using "declare", compiler assumes you have implemented everything correctly.
 * 
 * https://github.com/microsoft/TypeScript/issues/30355
 * https://github.com/microsoft/TypeScript/issues/17744
 * https://github.com/TerriaJS/terriajs/issues/5866
 */
function vbGraphicObjectBase<TOther extends ClassType<PIXI.Container>>(Other: TOther) {
    const Parent = Other as unknown as ClassType<vbGraphicObject>;
    // eslint-disable-next-line
    const isSprite = (<unknown>Parent === PIXI.Sprite) || PIXI.Sprite.prototype.isPrototypeOf(Parent.prototype);

    abstract class Implementation extends Parent {
        name = '';

        protected _pivotRule = PivotPoint.None;
        declare protected _debugBox?: PIXI.Graphics;

        get parentContainer() { return this.parent as vbMinimalContainer; }
        get pivotRule() { return this._pivotRule; }
        set pivotRule(rule: PivotPoint) {
            this._pivotRule = rule;
            if (!this.debugBox) {
                if (isSprite)
                    assignPivotPointRatio((<PIXI.Sprite><unknown>this).anchor, rule);
                else
                    assignPivotPoint(this.pivot, rule, this.unscaledBound);
            }
            else {
                this._hideDebugBox(); // prevent debugBox from affecting the calculated bound
                const bound = this.unscaledBound;
                if (isSprite)
                    assignPivotPointRatio((<PIXI.Sprite><unknown>this).anchor, rule);
                else
                    assignPivotPoint(this.pivot, rule, bound);
                this._drawDebugBox(bound);
            }
        }
        refreshPivotPoint() {
            this.pivotRule = this._pivotRule;
        }

        get unscaledBound(): PIXI.Rectangle {
            return this.getLocalBounds(undefined, true);
        }
        get layer() { return this.zIndex; }
        set layer(z: number) {
            this.zIndex = z;
        }
        hasParent() {
            return !!this.parent;
        }
        get radian() { return this.rotation; }
        set radian(value: number) {
            this.rotation = value % m.pi2;
        }

        useViewStyle(item: ViewStyleItem) {
            if (item.xy !== undefined) {
                this.x = item.xy[0];
                this.y = item.xy[1];
            }
            if (item.s !== undefined) {
                if (!Array.isArray(item.s))
                    this.scale.set(item.s);
                else {
                    this.width = item.s[0];
                    this.height = item.s[1];
                }
            }
            if (item.vis !== undefined) {
                this.visible = item.vis;
            }
        }

        addFilter(filter: PIXI.Filter) {
            if (this.filters === null) {
                this.filters = [];
            }
            this.filters.push(filter);
        }

        static _debugFillStyle = (() => { const s = new PIXI.FillStyle();
            s.visible = false; return s;
        })();
        static _debugLineStyle = (() => { const s = new PIXI.LineStyle();
            s.visible = true; s.color = c.Blue; s.alpha = 1; s.width = 2; return s;
        })();

        get debugBox() {
            return (this._debugBox !== undefined) && (this._debugBox.visible);
        }
        set debugBox(enable: boolean) {
            enable ? this._drawDebugBox(this.unscaledBound) : this._hideDebugBox();
        }
        protected _drawDebugBox(bound: PIXI.Rectangle) {
            if (this._debugBox === undefined) {
                this._debugBox = new PIXI.Graphics();
                this._debugBox.name = 'debugBox';
                this._debugBox.zIndex = shared.maxLayer+1;
                this.addChild(this._debugBox);
            }
            else {
                this._debugBox.visible = true;
            }
            // access the static variable by instance
            const fillStyle: PIXI.FillStyle = Object.getPrototypeOf(this).constructor._debugFillStyle;
            const lineStyle: PIXI.LineStyle = Object.getPrototypeOf(this).constructor._debugLineStyle;
            // inner border so that the debugBox won't exceed the bound
            lineStyle.alignment = 0;
            // represent the original point of object's local coordinate
            const originDot = isSprite ? new PIXI.Rectangle(0, 0, 5, 5) : new PIXI.Rectangle(this.pivot.x, this.pivot.y, 5, 5);
            // redraw debugBox
            this._debugBox.geometry.clear()
                .drawShape(bound, fillStyle, lineStyle)
                .drawShape(originDot, lineStyle, lineStyle);
        }
        protected _hideDebugBox() {
            if (this._debugBox === undefined) return;
            this._debugBox.visible = false;
        }
    }
    return Implementation as unknown as {
        new (...args: any[]): vbGraphicObject;
        _debugFillStyle: PIXI.FillStyle;
        _debugLineStyle: PIXI.LineStyle;
    } & TOther;
}


function isGraphicObject(obj: PIXI.DisplayObject): obj is vbGraphicObject {
    return (<vbGraphicObject>obj).useViewStyle !== undefined;
}

export {
    type vbGraphicObject,
    vbGraphicObjectBase,
    isGraphicObject
};

/**
 * Typescript doesn't support function overloading with different parameter signatures.
 * If we have really have to do it, we should construct a class which omitted those methods. \
 * https://www.damirscorner.com/blog/posts/20190712-ChangeMethodSignatureInTypescriptSubclass.html \
 * https://stackoverflow.com/questions/68021829/i-want-to-extend-from-one-class-but-delete-some-property \
 * This solution is clumsy and can cause lots of issues.
 * @returns "Class" object
 */
const _OmitClassType = <T, K extends string>(Base: new (...args: any) => T):
    new (...args: any) => Omit<T, K> => Base;
