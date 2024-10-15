/** Here to put some simple objects used for demo purpose, like a message box...  */
import { c } from '../misc/vbShared';
import { vbButton } from './vbButton';
import { vbPrimitive, vbShape } from './vbPrimitive';
import { vbText, type vbTextInitOptions } from './vbText';
import type { vbTween } from '../third-party/vbTween';
import type { vbTweenGroup } from '../third-party/vbTweenGroup';


/**
 * A pop up message box that shows some texts and fades out after a while
 */
class vbPopMessage extends vbButton<vbPrimitive> {
    fadeTween: vbTween<this>;
    /** sound name to play when it pops up */
    sound?: string
    onStartFading?: (obj: this) => void;
    onFadeEnd?: (obj: this) => void;

    /**
     * @param shape Primitive shape of the message box
     * @param txtOptions Options for text
     * @param tweens Reference of the containers' tween map
     */
    constructor(shape: vbShape, txtOptions: vbTextInitOptions, tweens: vbTweenGroup) {
        super(new vbPrimitive(shape));
        this.eventMode = 'static';
        this.fadeTween = tweens.create('fade', this, {alpha: 0});
        this.addCenteredTxt(txtOptions);
        // disable at start
        this.displayed = false;
        // set callback
        this.fadeTween.on('start', (obj) => {
            this.onStartFading?.(obj);
        })
        .on('end', (obj) => {
            this.displayed = false;
            this.onFadeEnd?.(obj);
        });
    }

    get displayed() { return this.visible; }
    set displayed(en: boolean) {
        this.visible = en;
    }

    /**
     * Pop up the message.
     * 
     * @param displayTime
     * @param fadeTime 
     */
    pop(displayTime: number, fadeTime: number) {
        this.displayed = true;
        this.alpha = 1;
        if (this.sound !== undefined)
            globalThis.pgame.soundManager.play(this.sound);
        return this.fadeTween.delay(displayTime).duration(fadeTime);
    }
}


/** Show the average over N_FRAME */
class FPSCounter extends vbText {
    static N_FRAME = 5;
    protected _totalFrames = 0;
    protected _totalFPS = 0;

    constructor() {
        super({ font: 'Arial', size: 20, fill: c.Green });
        this.style.dropShadow = true;
        this.style.dropShadowColor = c.Black;
        this.style.dropShadowDistance = 4;
    }

    update() {
        this._totalFrames++;
        this._totalFPS += globalThis.pgame.FPS;
        if (this._totalFrames >= FPSCounter.N_FRAME) {
            this.text = (this._totalFPS / this._totalFrames).toFixed(0);
            this._totalFrames = 0;
            this._totalFPS = 0;
        }
    }
}

export { vbPopMessage, FPSCounter };