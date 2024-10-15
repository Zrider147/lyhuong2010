/** https://pixijs.io/pixi-particles-editor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Emitter, type EmitterConfigV1, type EmitterConfigV3, ParticleUtils, upgradeConfig } from '@pixi/particle-emitter';
import { PivotPoint } from '../core/vbTransform';
import { vbBatchContainer } from '../vbContainer';


/**
 * PixiJs Particle Emitter based on a `PIXI.ParticleContainer` for performance boost
 */
class vbParticle extends vbBatchContainer {
    /** PixiJs Particle Emitter */
    readonly manager: Emitter;

    /**
     * Use v1 config to create particle emitter. \
     * (So far the interactive editor can only export v1 config) \
     * Note that v1 config is different from v3, be careful if you want to change the behaviors later:
     * - For any tweenable config (i.e. an object with `start` and `end` props),
     *   if you initialize `start` and `end` to be the same,
     *   it's a static behavior and can't be set to different later, vice versa.
     * - Same rule applies to texture(s),
     *   if you initialize with a single texture, it can't be set to multiple, vice versa.
     */
    constructor(config: EmitterConfigV1, texNames: string | string[]);
    /** At the moment editor doesn't export v3 config, you have to write it by yourself */
    constructor(config: EmitterConfigV3);
    constructor(config: EmitterConfigV1 | EmitterConfigV3, texNames?: string | string[]) {
        super();
        // do not add update function to ticker, use our own update instead.
        config.autoUpdate = false;
        if (texNames === undefined) {
            const configV3 = config as EmitterConfigV3;
            this.manager = new Emitter(this, configV3);
            this.configV1 = {} as EmitterConfigV1;
        }
        else {
            const configV1 = config as EmitterConfigV1;
            const textures = typeof texNames == 'string'
                ? globalThis.pgame.getTex(texNames)
                : texNames.map(name => globalThis.pgame.getTex(name));
            this.manager = new Emitter(this, upgradeConfig(configV1, textures));
            this.configV1 = configV1;
        }
    }

    /** Config v1 used by constructor */
    readonly configV1: EmitterConfigV1;
    /** Config v3 used by constructor */
    get configV3(): EmitterConfigV3 {
        return (<any>this.manager)._origConfig;
    }

    /** Do not use it for vbParticle */
    get pivotRule(): PivotPoint.None { return PivotPoint.None; }
    /** Do not use it for vbParticle */
    get debugBox(): false { return false; }
    /** `emitter.emit` */
    get enable() { return this.manager.emit; }
    set enable(en: boolean) { this.manager.emit = en; }
    /** Particles spawning position relative to the parent object */
    get spawnPos() {
        return this.manager.spawnPos;
    }
    setParticlesLifetime(min: number, max: number) {
        this.manager.minLifetime = min, this.manager.maxLifetime = max;
    }

    /** '#RRGGBB' or '0xAARRGGBB' */
    setColor(start: string, end: string) {
        const behavior = this._getBehavior('color');
        behavior.list.first.value = ParticleUtils.hexToRGB(start);
        behavior.list.first.next.value = ParticleUtils.hexToRGB(end);
    }
    setColorStatic(color: number) {
        const behavior = this._getBehavior('colorStatic');
        behavior.value = color;
    }

    setTextureSingle(texName: string) {
        const behavior = this._getBehavior('textureSingle');
        behavior.texture = globalThis.pgame.getTex(texName);
    }
    setTexturesRandom(texNames: string[]) {
        const behavior = this._getBehavior('textureRandom');
        behavior.textures = texNames.map(name => globalThis.pgame.getTex(name));
    }
    /** If you set `EmitterConfigV1.orderedArt` to true, it becomes ordered */
    setTexturesOrdered(texNames: string[]) {
        const behavior = this._getBehavior('textureOrdered');
        behavior.textures = texNames.map(name => globalThis.pgame.getTex(name));
        behavior.index = 0;
    }

    setAlpha(start: number, end: number) {
        const behavior = this._getBehavior('alpha');
        behavior.list.first.value = start;
        behavior.list.first.next.value = end;
    }
    setAlphaStatic(alpha: number) {
        const behavior = this._getBehavior('alphaStatic');
        behavior.value = alpha;
    }

    setScale(start: number, end: number, minimumScaleMultiplier?: number) {
        const behavior = this._getBehavior('scale');
        behavior.list.first.value = start;
        behavior.list.first.next.value = end;
        behavior.minMult = minimumScaleMultiplier ?? behavior.minMult;
    }
    setScaleStatic(min: number, max: number) {
        const behavior = this._getBehavior('scaleStatic');
        behavior.min = min, behavior.max = max;
    }

    setSpeed(start: number, end: number, minimumSpeedMultiplier?: number) {
        const behavior = this._getBehavior('moveSpeed');
        behavior.list.first.value = start;
        behavior.list.first.next.value = end;
        behavior.minMult = minimumSpeedMultiplier ?? behavior.minMult;
    }
    setSpeedStatic(min: number, max: number) {
        const behavior = this._getBehavior('moveSpeedStatic');
        behavior.min = min, behavior.max = max;
    }

    setRotation(radians: {
        minStart?: number, maxStart?: number,
        minSpeed?: number, maxSpeed?: number,
        accel?: number
    }) {
        const behavior = this._getBehavior('rotation');
        Object.assign(behavior, radians);
    }
    setRotationStatic(minRadian: number, maxRadian: number) {
        const behavior = this._getBehavior('rotationStatic');
        behavior.min = minRadian, behavior.max = maxRadian;
    }

    setAcceleration(props: {
        minStart?: number, maxStart?: number,
        accel?: Pnt2, maxSpeed?: number
    }) {
        const behavior = this._getBehavior('moveAcceleration');
        Object.assign(behavior, props);
    }

    update(deltaFrame: number): void {
        this.manager.update(globalThis.pgame.DeltaMS * 0.001);
    }

    protected _getBehavior(type: string): any {
        const b = this.manager.getBehavior(type);
        if (b === null) throw new Error('No such behavior, check your config');
        return b;
    }
}

export { vbParticle };