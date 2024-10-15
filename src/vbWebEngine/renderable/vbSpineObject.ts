import type { IAnimationState, IAnimationStateData, ISkeletonData, TextureAtlas } from 'pixi-spine';
import { PivotPoint } from '../core/vbTransform';
import {
    Spine,
    SpineDebugRenderer
} from 'pixi-spine';
import { vbGraphicObjectBase } from '../vbGraphicObject';

// put spine data into PIXI namespace
declare module '@pixi/display' {
    type SpineData = ISkeletonData;
    type SpineAsset = {
        spineData: SpineData,
        spineAtlas: TextureAtlas
    }
}


/**
 * Offical Spine Runtime Documentations
 * - [Runtime Architecture](http://en.esotericsoftware.com/spine-runtime-architecture)
 * - [Applying Animations](http://en.esotericsoftware.com/spine-applying-animations)
 * - [Runtime Skeletons](http://en.esotericsoftware.com/spine-runtime-skeletons)
 * - [Runtime Skins](http://en.esotericsoftware.com/spine-runtime-skins)
 */
class vbSpineObject extends vbGraphicObjectBase(Spine) {
    protected _pivotRule = PivotPoint.Center;
    /**
     * AnimationState supports applying animations over time, queuing animations for later playback,
     * mixing (crossfading) between animations, and applying multiple animations on top of each other (layering).
     */
    declare state: IAnimationState;
    /**
     * When the AnimationState changes the current animation, it will automatically mix (crossfade) between
     * the animations using the mix durations defined in the AnimationStateData, resulting in smooth animation transitions.
     */
    declare stateData: IAnimationStateData;
    /**
     * @param spineName Name of spine in spine map.
     */
    constructor(spineName: string) {
        super(globalThis.pgame.getSpine(spineName).spineData);
        this.autoUpdate = false;
        this.update = this._update;
    }

    /** Spine has its own center pivot so it makes no sense to change it */
    get pivotRule(): PivotPoint.Center { return PivotPoint.Center; }
    /** Use `SpineDebugRenderer` instead */
    get debugBox(): false { return false; }
    /** @note DO NOT override this method, `enable` will switch it. */
    declare update: (deltaFrame: number) => void;
    /**
     * Switch the `update` function between `_update` or doing nothing.
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
     * Update spine transform and animations.
     * @note Override this method for derived classes.
     */
    protected _update(deltaFrame: number) {
        // Spine update function accepts seconds as parameter.
        Spine.prototype.update.call(this, globalThis.pgame.DeltaMS * 0.001);
    }

    /**
     * Shared debug renderer instance, \
     * All spine objects that use this instance share the same debug options.
     */
    static debug = new SpineDebugRenderer();

    /** Can only be used after `constructDebugRenderer` is called */
    get debug(): SpineDebugRenderer {
        return super.debug as SpineDebugRenderer;
    }
    set debug(value: SpineDebugRenderer) {
        super.debug = value;
    }

    /**
     * Construct or destruct debug renderer. \
     * If you just want to enable/disable debug drawing, use `.debug.drawDebug = true/false`
     * 
     * @param shared Whether the use `vbSpineObject.debug` shared instance
     */
    constructDebugRenderer(shared=true) {
        if (this.debug === undefined) {
            if (shared) {
                this.debug = vbSpineObject.debug;
            }
            else {
                this.debug = new SpineDebugRenderer();
            }
            return;
        }
    }
}

export { vbSpineObject };