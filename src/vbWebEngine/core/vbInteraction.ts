/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';
import type { ColorOverlayFilter } from 'pixi-filters'
import type { PlayOptions, vbSound } from '../misc/vbSound';
import { isMobile } from '../misc/WebUtils';
import { c, shared } from '../misc/vbShared';
import type { vbGraphicObject } from '../vbGraphicObject';


declare global {
    /** Function types */
    namespace FType {
        type Pointer = (e: PIXI.FederatedPointerEvent) => void;
    }
    /** https://github.com/Moh-Snoussi/keyboard-event-key-type */
    namespace Keyboard {
        type UpperAlpha = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
        type LowerAlpha = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
        type NumericKeys = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
        type ModifierKeys = 'Alt' | 'CapsLock' | 'Control' | 'NumLock' | 'ScrollLock' | 'Shift';
        type SpaceKeys = 'Enter' | 'Tab' | ' ';
        type NavigationKeys = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'End' | 'Home' | 'PageDown' | 'PageUp';
        type FunctionKeys = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12';
        type AllKeys = UpperAlpha | LowerAlpha | NumericKeys | ModifierKeys | SpaceKeys | NavigationKeys | FunctionKeys;
    }
}

/** Some additional event name aliases for vbInteractiveObject */
type _vbEventMap = {
    'hovereffect': FType.Pointer,
    'clearhover': FType.Pointer,
    'clickeffect': FType.Pointer,
    'clearclick': FType.Pointer,
    'clicksound': FType.Pointer
}
type PixiEventNames = keyof PIXI.DisplayObjectEvents;
type PixiEventMap = {
    [K in PixiEventNames]: (...args: PIXI.DisplayObjectEvents[K]) => void
};
type vbEventMap = _vbEventMap & PixiEventMap;
type vbEventNames = keyof vbEventMap;


/**
 * A utility class to easily set or toggle events, provides with frequently used effects.
 * - EventEmitter allows to add multiple listener callbacks for one event,
 * but if you want to remove a specific one, you have to keep a reference of the callback.
 * - This class helps keep a single callback reference for each event,
 * then you can set one callback at a time to toggle on/off, which get rids of the verbosity.
 * - Of course, you can still manage by yourself since all objects are EventEmitter.
 */
declare abstract class vbInteractiveObject extends vbGraphicObject {
    /** The mode of interaction for vbButtons are `static` by default. */
    declare eventMode: PIXI.EventMode;
    isPointerDown: boolean;
    isPointerOver: boolean;
    /**
     * Stored event names and their listener callbacks. \
     * (`EventEmitter` doesn't keep the callbacks after you remove them)
     */
    protected _vbEvents: Partial<vbEventMap>;
    protected _defaultColorFilter?: ColorOverlayFilter;

    getListener<K extends vbEventNames>(event: K): vbEventMap[K] | undefined;
    /**
     * Only keep one listener for this event type
     * 
     * @param event Event name
     * @param fn Listener function
     * @param on If callback has already been set, toggles the listener on/off
     */
    toggle<K extends PixiEventNames>(event: K, fn: PixiEventMap[K]): this;
    toggle<K extends PixiEventNames>(event: K, on: boolean): this;
    protected _toggle(event: PixiEventNames, vbEvent: vbEventNames, fn: FType.AnyVoid | boolean): this;
    /**
     * Set a click callback for `pointertap` event.
     * @see `toggle` method
     */
    setOnClick(fn: FType.Pointer): this;
    setOnClick(on: boolean): this;
    /**
     * Set a play sound callback for `pointertap` event.
     */
    setClickSound(snd: vbSound, options?: PlayOptions): this;
    setClickSound(on: boolean): this;
    /**
     * - Set a hover effect for `pointerover` event.
     * - Set a clear effect callback for `pointerout` event.
     * - It manages `isPointerOver` state.
     * - Ignored on mobile platform.
     * 
     * @param fn Effect function
     * @param clearFn Clear effect function
     * @param on If effect has already been set, toggles hover effect on/off
     */
    setHoverEffect(fn: FType.Pointer, clearFn: FType.Pointer): this;
    setHoverEffect(on: boolean): this;
    /**
     * - Set a click effect for `pointerdown` event.
     * - Set a clear effect callback for `pointerup` and `pointerupoutside` event.
     * - It manages `isPointerDown` state.
     * 
     * @param fn Effect function
     * @param clearFn Clear effect function
     * @param on If effect has already been set, toggles hover effect on/off
     */
    setClickEffect(fn: FType.Pointer, clearFn: FType.Pointer): this;
    setClickEffect(on: boolean): this;
    /**
     * Use default color overlay effect when the pointer hovers over it. \
     * Use `pointerover` and `pointerout` events. (Ignore on mobile devices)
     * 
     * @param filter The color filter to be used (default `vb.Shared.colorFilter`)
     */
    defaultHoverEffect(color: number, alpha: number, filter?: ColorOverlayFilter): this;
    /**
     * Use default color overlay effect when the pointer clicks on it. \
     * Use `pointerdown`, `pointerup` and `pointerupoutside` events.
     * 
     * @param filter The color filter to be used (default `vb.Shared.colorFilter`)
     */
    defaultClickEffect(color: number, alpha: number, filter?: ColorOverlayFilter): this;
    /**
     * Reset `isPointerDown` and `isPointerOver`;
     * Only used for clearing default color overlay effect.
     */
    clearEffect(): void;
}

/**
 * Mixin to make other classes as InteractiveObject.
 */
function vbInteractiveObjectBase<TOther extends ClassType<vbGraphicObject>>(Other: TOther) {
    const Parent = Other as unknown as ClassType<vbInteractiveObject>;
    abstract class Implementation extends Parent {
        isPointerDown = false;
        isPointerOver = false;
        protected _vbEvents: Partial<vbEventMap> = {};

        constructor(...args: any[]) {
            super(...args);
            this.eventMode = 'static';

            this.defaultClickEffect(c.Black, 0.2)
                .defaultHoverEffect(c.White, 0.3)
        }
        getListener<K extends vbEventNames>(event: K): vbEventMap[K] | undefined {
            return this._vbEvents[event];
        }

        protected _toggle(event: PixiEventNames, vbEvent: vbEventNames, fn: FType.AnyVoid | boolean) {
            const oldFn = <FType.AnyVoid>this._vbEvents[vbEvent];
            // clear the current callback anyway to prevent duplication
            if (oldFn !== undefined)
                this.off(event, oldFn);

            if (fn === true) {
                if (oldFn !== undefined)
                    this.on(event, oldFn);
            }
            else if (fn !== false) {
                this._vbEvents[vbEvent] = fn;
                this.on(event, fn);
            }
            return this;
        }
        toggle<K extends PixiEventNames>(event: K, fn: PixiEventMap[K] | boolean) {
            return this._toggle(event, event, fn);
        }
        setOnClick(fn: FType.Pointer | boolean) {
            return this._toggle('pointertap', 'pointertap', fn);
        }
        setClickSound(snd: vbSound | boolean, options?: PlayOptions) {
            if (typeof snd == 'object') {
                const fn = () => snd.play(options);
                return this._toggle('pointertap', 'clicksound', fn);
            }
            else return this._toggle('pointertap', 'clicksound', snd);
        }

        setHoverEffect(fn: FType.Pointer | boolean, clearFn?: FType.Pointer) {
            if (isMobile()) {
                return this;
            }
            if (typeof fn == 'boolean') {
                return this._toggle('pointerover', 'hovereffect', fn)
                    ._toggle('pointerout', 'clearhover', fn);
            }

            const overFn: FType.Pointer = (e) => {
                this.isPointerOver = true;
                if (this.isPointerDown) {
                    this._vbEvents['clickeffect']?.(e);
                    return;
                }
                fn(e);
            };
            const clearOverFn: FType.Pointer = (e) => {
                this.isPointerOver = false;
                clearFn!(e);
            };
            return this._toggle('pointerover', 'hovereffect', overFn)
                ._toggle('pointerout', 'clearhover', clearOverFn);
        }

        setClickEffect(fn: FType.Pointer | boolean, clearFn?: FType.Pointer) {
            if (typeof fn == 'boolean') {
                return this._toggle('pointerdown', 'clickeffect', fn)
                    ._toggle('pointerup', 'clearclick', fn)
                    ._toggle('pointerupoutside', 'clearclick', fn);
            }

            const downFn: FType.Pointer = (e) => {
                this.isPointerDown = true;
                fn(e);
            };
            const clearDownFn: FType.Pointer = (e) => {
                this.isPointerDown = false;
                // if (this.isPointerOver) {
                //     // pointer is still hover the object
                //     this._vbEvents['hovereffect']?.(e);
                //     return;
                // }
                clearFn!(e);
            };
            return this._toggle('pointerdown', 'clickeffect', downFn)
                ._toggle('pointerup', 'clearclick', clearDownFn)
                ._toggle('pointerupoutside', 'clearclick', clearDownFn);
        }

        defaultHoverEffect(color: number, alpha: number, filter = shared.colorFilter) {
            if (this._defaultColorFilter === undefined)
                this._defaultColorFilter = filter;
            return this.setHoverEffect(
                () => {
                    filter.color = color;
                    filter.alpha = alpha;
                    if (!this.filters?.includes(filter))
                        this.addFilter(filter);
                },
                () => {
                    this.filters?.removeOnce(filter);
                }
            );
        }

        defaultClickEffect(color: number, alpha: number, filter = shared.colorFilter) {
            if (this._defaultColorFilter === undefined)
                this._defaultColorFilter = filter;
            return this.setClickEffect(
                () => {
                    filter.color = color;
                    filter.alpha = alpha;
                    if (!this.filters?.includes(filter))
                        this.addFilter(filter);
                },
                () => {
                    this.filters?.removeOnce(filter);
                }
            );
        }

        clearEffect() {
            this.isPointerDown = this.isPointerOver = false;
            this.filters?.removeOnce(this._defaultColorFilter);
        }
    }
    return Implementation as unknown as {
        new(...args: any[]): vbInteractiveObject;
        _debugFillStyle: PIXI.FillStyle;
        _debugLineStyle: PIXI.LineStyle;
    } & TOther;
}


type KeyboardEventNames = `down-${Keyboard.AllKeys}` | `up-${Keyboard.AllKeys}` | 'down-any' | 'up-any';
type KeyboardEventMap = {
    [K in KeyboardEventNames]: (e: KeyboardEvent, interaction: vbInteractionManager) => void;
};
namespace vbInteractionManager {
    export interface EventMap extends KeyboardEventMap { }
}

class vbInteractionManager extends EventEmitter<vbInteractionManager.EventMap> {
    protected _keySet = new Set<string>();

    constructor() {
        super();
    }
    /** Call this method to start listening keyboard events */
    listenKeyboard(eventTarget: HTMLElement | Document | Window) {
        eventTarget.addEventListener('keydown', (e: any) => {
            this._keySet.add(e.key);
            this.emit('down-any', e, this);
            this.emit(`down-${e.key as Keyboard.AllKeys}`, e, this);
        });
        eventTarget.addEventListener('keyup', (e: any) => {
            this._keySet.delete(e.key);
            this.emit('up-any', e, this);
            this.emit(`up-${e.key as Keyboard.AllKeys}`, e, this);
        });
    }
    isKeyDown(key: Keyboard.AllKeys) { return this._keySet.has(key); }
    isKeyNotPressed(key: Keyboard.AllKeys) { return !this._keySet.has(key); }

    /**
     * An example code snippet for a specific use case,
     * where there's a button to open something (typically a container), and you expect to tap anywhere on **canvas**
     * except that object itself to close it.
     * 
     * @param btn the button to set onClick event
     * @param openFn the callback to open the object
     * @param closeFn the callback to close the object
     * @param bound an object to detect if the closeFn should be called
     */
    canvasTapSnippet(btn: vbInteractiveObject, openFn: FType.Pointer, closeFn: FType.Pointer, bound: vbGraphicObject) {
        const mainStage = globalThis.pgame.stage;

        const wrappedCloseFn: FType.Pointer = (e) => {
            const p = e.global;
            const rect = bound.getBounds(true);
            if (rect.contains(p.x, p.y)) {
                // player taps inside bound, does nothing
                return;
            }

            closeFn(e);
            // turn off the close callback
            mainStage.off('pointertapcapture', wrappedCloseFn);
            // just close it, prevent dispatching other pointertap events
            e.stopPropagation();
        }

        const wrappedOpenFn: FType.Pointer = (e) => {
            openFn(e);
            mainStage.on('pointertapcapture', wrappedCloseFn);
        }

        btn.setOnClick(wrappedOpenFn);
    }
}

function isKeyDown(key: Keyboard.AllKeys) { return !!pgame.interact?.isKeyDown(key); }
function isKeyNotPressed(key: Keyboard.AllKeys) { return !pgame.interact?.isKeyDown(key); }
/** Recursively set the eventMode of all its children */
function recurseEventMode(obj: PIXI.Container, mode: PIXI.EventMode) {
    for (const child of obj.children) {
        child.eventMode = mode;
        if (child.children !== undefined) {
            recurseEventMode(<PIXI.Container>child, mode);
        }
    }
}

export {
    type vbInteractiveObject,
    vbInteractionManager,
    vbInteractiveObjectBase,
    isKeyDown,
    isKeyNotPressed,
    recurseEventMode
};