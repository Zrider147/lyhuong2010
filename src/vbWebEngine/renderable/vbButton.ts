import * as PIXI from 'pixi.js';
import { recurseEventMode, vbInteractiveObjectBase } from '../core/vbInteraction';
import type { vbGraphicObject } from '../vbGraphicObject';
import { vbImage, vbSequence } from './vbImage';
import { vbImageLabel, vbLabel, vbPrimiLabel, vbSeqLabel } from './vbLabel';
import { vbMinimalContainer } from '../vbContainer';
import { vbPrimitive } from './vbPrimitive';
import { vbSpineObject } from './vbSpineObject';


class vbImageButton extends vbInteractiveObjectBase(vbImage) {}

class vbImageLabelButton extends vbInteractiveObjectBase(vbImageLabel) {}

class vbPrimiButton extends vbInteractiveObjectBase(vbPrimitive) {}

class vbPrimiLabelButton extends vbInteractiveObjectBase(vbPrimiLabel) {}

class vbSequenceButton extends vbInteractiveObjectBase(vbSequence) {}

class vbSeqLabelButton extends vbInteractiveObjectBase(vbSeqLabel) {}

/**
 * TL;DR, if you are OK with a **simple rectangle** hit area, set it in constructor.
 * Otherwise, if you are expecting a more "accurate" hit shape, read following:
 * 
 * Spine object is basically a container with many nested sprites as children,
 * which leads to expensive hit-testing when it is interactive. \
 * For performance concerns, vbWebEngine set `none` eventMode as default to skip hit-testing.
 * This means a spine button has to recursively set all its children to
 * `auto` eventMode to enable hit-testing. \
 * However, as a spine plays different animations, sprites can be removed or added.
 * Newly added children still have `none` eventMode to not be hit-tested. \
 * Therefore, you may have to call `reurseAutoHitTest()` method to set their eventMode again.
 * 
 * Overall, the first rectangle hit area is more recommended.
 */
class vbSpineButton extends vbInteractiveObjectBase(vbSpineObject) {
    constructor(spineName: string, hitArea?: ConstructorParameters<typeof PIXI.Rectangle>) {
        super(spineName);
        if (hitArea !== undefined) {
            this.hitArea = new PIXI.Rectangle(...hitArea);
        }
        else {
            recurseEventMode(this, 'auto');
        }
    }

    /**
     * Utility method in case additional objects are not included in hit-testing
     * 
     * @param setDelay Delay in milliseconds to set the eventMode
     */
    recurseAutoHitTest(setDelay=0) {
        if (setDelay == 0) {
            recurseEventMode(this, 'auto');
        }
        else {
            const timer = globalThis.pgame.createGlobalTimer(setDelay);
            timer.on('end', () => recurseEventMode(this, 'auto'));
            timer.start();
        }
    }
}

/**
 * If there's not hit area specified,
 * children added into button container will be set to `auto` eventMode
 */
class vbButtonContainer extends vbInteractiveObjectBase(vbMinimalContainer) {
    constructor(hitArea?: ConstructorParameters<typeof PIXI.Rectangle>) {
        super(false);
        if (hitArea !== undefined) {
            this.hitArea = new PIXI.Rectangle(...hitArea);
        }
        else {
            this.addObj = this.addObjWithAutoMode;
        }
    }

    addObjWithAutoMode(obj: vbGraphicObject, layer?: number, name?: string): this {
        obj.eventMode = 'auto';
        return super.addObj(obj, layer, name);
    }
}

/**
 * Basically it's an interactive vbLabel.
 */
class vbButton<T extends vbGraphicObject> extends vbInteractiveObjectBase(vbLabel)<T> {

}

export {
    vbButton,
    vbImageButton,
    vbImageLabelButton,
    vbPrimiButton,
    vbPrimiLabelButton,
    vbSequenceButton,
    vbSeqLabelButton,
    vbSpineButton,
    vbButtonContainer
};