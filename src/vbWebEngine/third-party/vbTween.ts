/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import Easing from './Easing'
import Interpolation from './Interpolation'
import type { vbTweenGroup } from './vbTweenGroup'


declare global {
    namespace FType {
        type Easing = (amount: number) => number
        type Interpolation = (v: number[], k: number) => number
    }
}

namespace vbTween {
    /**
     * - `start` Called on start
     * - `end` Called on end
     * - `repeat` Called at the end of each repeat
     * - `yoyo` Called at the middle of each yoyo round
     * - `update` Called on every frame
     * - `stop` Called on `stop()` method
     */
    export interface EventMap<T> {
        'start': (obj: T) => void
        'end': (obj: T) => void
        /** @param repeat Remaining repeats */
        'repeat': (obj: T, repeat: number) => void
        /** @param repeat Remaining repeats */
        'yoyo': (obj: T, repeat: number) => void
        /** @param elapsed From 0 to 1 */
        'update': (obj: T, elapsed: number) => void
        'stop': (obj: T) => void
    }
    export type EventListener<T, K extends keyof EventMap<T>> = (...args: Parameters<EventMap<T>[K]>) => void
    /** Unwrap the object type of a tween */
    export type Unbox<V> = V extends vbTween<infer U> ? U : never
    export type UnboxRet<F> = F extends (...args: any[]) => infer V ? Unbox<V> : never
}

type EventListenersMap<T> = {
    [K in keyof vbTween.EventMap<T>]: Array<vbTween.EventListener<T,K>>
}


class vbTween<T extends AnyObject = AnyObject> {
    protected _name: string
    protected _object: T
    protected _group: vbTweenGroup | false
    protected _valuesStart: AnyObject = {}
    protected _valuesEnd: Record<string, number | string> = {}
    protected _valuesStartRepeat: AnyObject = {}

    protected _startTime = 0
    protected _delayTime = 0
    protected _duration = 1000
    protected _repeat = 0
    protected _repeatDelayTime = 0
    protected _isPlaying = false
    protected _isPaused = false
    protected _pauseStart = 0
    protected _yoyo = false
    protected _yoyoDelayTime = 0
    protected _reversed = false

    protected _easingFunction: FType.Easing = Easing.Linear.None
    protected _interpolationFunction: FType.Interpolation = Interpolation.Linear

    protected _chainedTweens: Array<vbTween> = []
    protected _isChainStopped = false
    protected _allowChainedStop = true

    /** All the callbacks */
    protected _events: Partial<EventListenersMap<T>> = {}
    protected _onStartCallbackFired = false

    constructor(name: string, obj: T, group: vbTweenGroup | false) {
        this._name = name
        this._object = obj
        this._group = group
    }

    get name() { return this._name }
    isPlaying(): boolean { return this._isPlaying }
    isPaused(): boolean { return this._isPaused }
    isReversed(): boolean { return this._reversed }
    getRepeat(): number { return this._repeat }

    to(properties: AnyObject, duration=1000): this {
        // TODO? restore this, then update the 07_dynamic_to example to set fox
        // tween's to on each update. That way the behavior is opt-in (there's
        // currently no opt-out).
        // for (const prop in properties) this._valuesEnd[prop] = properties[prop]
        this._valuesEnd = Object.create(properties)
        this._duration = duration
        return this
    }

    /**
     * @param force Whether to restart if it's already playing (default false)
     */
    start(force=false, time=globalThis.pgame.TotalMS): this {
        // Do not add to group twice if we force to restart
        if (this._isPlaying) {
            if (!force) return this
        }
        else {
            this._group && this._group.add(this as any)
        }

        if (this._reversed) {
            // If we were reversed (f.e. using the yoyo feature) then we need to
            // flip the tween direction back to forward.

            this._reversed = false

            for (const property in this._valuesStartRepeat) {
                this._swapEndStartRepeatValues(property)
                this._valuesStart[property] = this._valuesStartRepeat[property]
            }
        }

        this._isPlaying = true
        this._isPaused = false

        this._onStartCallbackFired = false
        this._isChainStopped = false

        this._startTime = time
        this._startTime += this._delayTime

        this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat)
        return this
    }

    /** @param fireEndCallback Also fire onEnd callback (default false) */
    stop(fireEndCallback=false): this {
        this.stopChainedTweens()
        if (!this._isPlaying) {
            return this
        }

        this._group && this._group.remove(this as any)

        this._isPlaying = false
        this._isPaused = false

        this.emit('stop', this._object)
        if (fireEndCallback)
            this.emit('end', this._object)
        return this
    }


    /**
     * Unlike `stop()` which simply stop the current tweening,
     * `end()` make sure to update values to the end.
     */
    end(): this {
        this.updateTillEnd()
        this._group && this._group.remove(this as any)
        return this
    }
    /**
     * Used for repeated tweens. \
     * Doesn't end the tweens immediately,
     * instead, it sets `repeat` to zero to ensure the last animation can be played.
     */
    endRepeat(): this {
        if (this._yoyo) {
            if (this._reversed)
                this._repeat = 0
            else
                this._repeat = 1
        }
        else
            this._repeat = 0
        return this
    }

    pause(time=globalThis.pgame.TotalMS): this {
        if (this._isPaused || !this._isPlaying) {
            return this
        }
        this._isPaused = true
        this._pauseStart = time

        this._group && this._group.remove(this as any)
        return this
    }

    /**
     * If it's neither paused nor playing, start the tween instead
     */
    resume(time=globalThis.pgame.TotalMS): this {
        if (!this._isPaused || !this._isPlaying) {
            return this.start(false, time)
        }
        this._isPaused = false
        this._startTime += time - this._pauseStart
        this._pauseStart = 0

        this._group && this._group.add(this as any)
        return this
    }

    group(group: vbTweenGroup | false): this {
        this._group = group
        return this
    }
    duration(d: number): this {
        this._duration = d
        return this
    }
    delay(amount: number): this {
        this._delayTime = amount
        return this
    }
    /**
     * For yoyo tweens, `repeat` stands for the count of
     * complete round trips, should be at least 1.
     */
    repeat(times: number): this {
        this._repeat = times
        return this
    }
    repeatDelay(amount: number): this {
        this._repeatDelayTime = amount
        return this
    }
    yoyo(yoyo: boolean): this {
        this._yoyo = yoyo
        return this
    }
    /** The delay time in the middle of a round */
    yoyoDelay(amount: number): this {
        this._yoyoDelayTime = amount
        return this
    }
    easing(easingFunction: FType.Easing): this {
        this._easingFunction = easingFunction
        return this
    }
    interpolation(interpolationFunction: FType.Interpolation): this {
        this._interpolationFunction = interpolationFunction
        return this
    }

    /** Add an event listener */
    on<K extends keyof vbTween.EventMap<T>>(event: K, callback: vbTween.EventListener<T,K>): this {
        const listeners = this._events[event]
        if (listeners === undefined)
            (<any>this._events)[event] = [callback]
        else
            listeners.push(callback)
        return this
    }
    /** Only keep one listener for this event type */
    single<K extends keyof vbTween.EventMap<T>>(event: K, callback: vbTween.EventListener<T,K>): this {
        const listeners = this._events[event]
        if (listeners === undefined)
            (<any>this._events)[event] = [callback]
        else {
            listeners.clear()
            listeners.push(callback)
        }
        return this
    }
    off<K extends keyof vbTween.EventMap<T>>(event: K): this {
        const listeners = this._events[event]
        if (listeners !== undefined)
            listeners.clear()
        return this
    }
    emit<K extends keyof vbTween.EventMap<T>>(event: K, ...args: Parameters<vbTween.EventListener<T,K>>): this {
        const listeners = this._events[event]
        if (listeners !== undefined) {
            for (const cb of listeners) {
                cb(...args)
            }
        }
        return this
    }

    chain(...tweens: Array<vbTween>): this {
        this._chainedTweens = tweens
        return this
    }
    allowChainedStop(allow: boolean): this {
        this._allowChainedStop = allow
        return this
    }
    stopChainedTweens(): this {
        if (this._isChainStopped) return this
        for (const tw of this._chainedTweens) {
            if (tw._allowChainedStop) tw.stop()
        }
        this._isChainStopped = true
        return this
    }
    endChainedTweens(): this {
        if (this._isChainStopped) return this
        for (const tw of this._chainedTweens) {
            if (tw._allowChainedStop) tw.end()
        }
        this._isChainStopped = true
        return this
    }

    /**
     * @returns true if the tween is still playing after the update, false
     * otherwise (calling update on a paused tween still returns true because
     * it is still playing, just paused).
     */
    update(time: number): boolean {
        if (this._isPaused) return true
        if (!this._isPlaying) return false

        if (time < this._startTime) {
            return true
        }

        if (this._onStartCallbackFired === false) {
            this.emit('start', this._object)
            this._onStartCallbackFired = true
        }

        let elapsed = this._duration !== 0 ? ((time - this._startTime) / this._duration) : 1
        let overflow: number
        // MUST HANDLE OVERFLOW
        if (elapsed > 1) {
            overflow = 1
            if (this._yoyo)
                elapsed = elapsed % 2
            else
                elapsed = elapsed % 1
        }
        else {
            overflow = 0
        }

        do {
            if (overflow > 0 || elapsed >= 1) {
                if (this._repeat > 0) {
                    let currElapsed = Math.min(elapsed, 1)
                    const value = this._easingFunction(currElapsed)
                    this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value)
                    this.emit('update', this._object, currElapsed)

                    this._handleRepeatEnd()
                }
                else {
                    this._updateProperties(this._object, this._valuesStart, this._valuesEnd, 1)
                    this.emit('update', this._object, 1)

                    this._isPlaying = false
                    return this._handleEndPlaying()
                }
            }
            else {
                let currElapsed = Math.min(elapsed, 1)
                const value = this._easingFunction(currElapsed)
                this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value)
                this.emit('update', this._object, currElapsed)
            }
            elapsed -= 1
            overflow = 0
        } while (elapsed > 0)

        return true
    }

    protected _handleRepeatEnd(): boolean {
        // Reassign starting values, restart by making startTime = now
        for (const property in this._valuesStartRepeat) {
            if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
                this._valuesStartRepeat[property] =
                    // @ts-ignore FIXME?
                    this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property])
            }

            if (this._yoyo) {
                this._swapEndStartRepeatValues(property)
            }

            this._valuesStart[property] = this._valuesStartRepeat[property]
        }

        if (this._yoyo) {
            if (this._reversed) {
                this._reversed = false
                this.emit('repeat', this._object, this._repeat)
                this._startTime += this._duration + this._repeatDelayTime
            }
            else {
                this._repeat--
                this._reversed = true
                this.emit('yoyo', this._object, this._repeat)
                this._startTime += this._duration + this._yoyoDelayTime
            }
        }
        else {
            this._repeat--
            this.emit('repeat', this._object, this._repeat)
            this._startTime += this._duration + this._repeatDelayTime
        }

        return true
    }

    protected _handleEndPlaying(): boolean {
        this.emit('end', this._object)

        for (const tw of this._chainedTweens) {
            // Make the chained tweens start exactly at the time they should,
            // even if the `update()` method was called way past the duration of the tween
            tw.start(false, this._startTime + this._duration)
        }

        // callback may trigger a restart
        return this._isPlaying
    }

    updateTillEnd() {
        if (this._onStartCallbackFired === false) {
            this.emit('start', this._object)
            this._onStartCallbackFired = true
        }

        if (this._yoyo && !this._reversed) {
            // yoyo tweens should go back to the start point
            this._updateProperties(this._object, this._valuesEnd, this._valuesStart, 1)
        }
        else {
            this._updateProperties(this._object, this._valuesStart, this._valuesEnd, 1)
        }

        this.emit('update', this._object, 1)
        this.emit('end', this._object)

        this.endChainedTweens()

        this._isPlaying = false
        return false
    }

    protected _setupProperties(
        _object: AnyObject,
        _valuesStart: AnyObject,
        _valuesEnd: AnyObject,
        _valuesStartRepeat: AnyObject,
    ): void {
        for (const property in _valuesEnd) {
            const startValue = _object[property]
            const startValueIsArray = Array.isArray(startValue)
            const propType = startValueIsArray ? 'array' : typeof startValue
            const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property])

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (propType === 'undefined' || propType === 'function') {
                continue
            }

            // Check if an Array was provided as property value
            if (isInterpolationList) {
                let endValues = _valuesEnd[property] as Array<number | string>

                if (endValues.length === 0) {
                    continue
                }

                // handle an array of relative values
                endValues = endValues.map(this._handleRelativeValue.bind(this, startValue as number))

                // Create a local copy of the Array with the start value at the front
                _valuesEnd[property] = [startValue].concat(endValues)
            }

            // handle the deepness of the values
            if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                _valuesStart[property] = startValueIsArray ? [] : {}

                for (const prop in startValue as object) {
                    // @ts-ignore FIXME?
                    _valuesStart[property][prop] = startValue[prop]
                }

                _valuesStartRepeat[property] = startValueIsArray ? [] : {} // TODO? repeat nested values? And yoyo? And array values?

                // @ts-ignore FIXME?
                this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property])
            } else {
                // Save the starting value, [--but only once--].
                // NO WTF why only once if sometimes we want to reuse a tween???
                _valuesStart[property] = startValue

                if (!startValueIsArray) {
                    // @ts-ignore FIXME?
                    _valuesStart[property] *= 1.0 // Ensures we're using numbers, not strings
                }

                if (isInterpolationList) {
                    // @ts-ignore FIXME?
                    _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse()
                } else {
                    _valuesStartRepeat[property] = _valuesStart[property] || 0
                }
            }
        }
    }

    protected _updateProperties(
        _object: AnyObject,
        _valuesStart: AnyObject,
        _valuesEnd: AnyObject,
        value: number,
    ): void {
        for (const property in _valuesEnd) {
            // Don't update properties that do not exist in the source object
            if (_valuesStart[property] === undefined) {
                continue
            }

            const start = _valuesStart[property] || 0
            let end = _valuesEnd[property]
            const startIsArray = Array.isArray(_object[property])
            const endIsArray = Array.isArray(end)
            const isInterpolationList = !startIsArray && endIsArray

            if (isInterpolationList) {
                _object[property] = this._interpolationFunction(end as Array<number>, value)
            } else if (typeof end === 'object' && end) {
                // @ts-ignore FIXME?
                this._updateProperties(_object[property], start, end, value)
            } else {
                // Parses relative end values with start as base (e.g.: +10, -3)
                end = this._handleRelativeValue(start as number, end as number | string)

                // Protect against non numeric properties.
                if (typeof end === 'number') {
                    // @ts-ignore FIXME?
                    _object[property] = start + (end - start) * value
                }
            }
        }
    }

    protected _handleRelativeValue(start: number, end: number | string): number {
        if (typeof end !== 'string') {
            return end
        }

        if (end.charAt(0) === '+' || end.charAt(0) === '-') {
            return start + parseFloat(end)
        } else {
            return parseFloat(end)
        }
    }

    protected _swapEndStartRepeatValues(property: string): void {
        const tmp = this._valuesStartRepeat[property]
        const endValue = this._valuesEnd[property]

        if (typeof endValue === 'string') {
            this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue)
        } else {
            this._valuesStartRepeat[property] = this._valuesEnd[property]
        }

        this._valuesEnd[property] = tmp
    }
}

export { vbTween }