import EventEmitter from 'eventemitter3';


namespace vbTimer {
    /**
     * - `start` Called on start
     * - `end` Called on end
     * - `repeat` Called at the end of each repeat
     * - `update` Called on every frame
     */
    export interface EventMap {
        'start': (elapsed: number) => void;
        'end': (elapsed: number) => void;
        /** @param repeat Remaining repeats */
        'repeat': (elapsed: number, repeat: number) => void;
        'update': (elapsed: number, delta: number) => void;
    }
}


class vbTimer extends EventEmitter<vbTimer.EventMap> {
    /** The activation status of timer. */
    enable: boolean;
    /** * The time until timer triggered. */
    time: number;
    /** Delay in ms before timer starts */
    delay: number;
    /** The repeat count before timer stop */
    repeat: number;
    /** Status indicator: whether this timer is ended. */
    isEnded: boolean;
    /** Status indicator: whether this timer is started. */
    isStarted: boolean;
    preserved: boolean;
    protected _delayTime: number;
    protected _elapsedTime: number;
    protected _repeat: number;
    protected _timerManager: vbTimerManager;
    protected _next?: vbTimer;

    /**
     * Creates an instance of Timer. \
     *
     * @param manager must specify a TimerManager
     * @param time The time is ms before timer end or repedeated.
     * @param repeat Number of repeat times. If set to Infinity it will loop forever. (default 0)
     * @param delay Delay in ms before timer starts (default 0)
     * @param preserved
     *          Normal timer will only be added to the TimerManager when it's running, and will be removed when it's ended. \
     *          Preserved timer will stay in TimerManager to avoid constantly being added or removed.
     *          (get rid of any duplication problem)
     */
    constructor(manager: vbTimerManager, time: number, repeat = 0, delay = 0, preserved = false) {
        super();
        this.time = time;
        this.enable = false;
        this.delay = delay;
        this.repeat = repeat;
        this.preserved = preserved;
        this.isEnded = false;
        this.isStarted = false;
        this._delayTime = 0;
        this._elapsedTime = 0;
        this._repeat = 0;
        this._timerManager = manager;
        if (this.preserved) {
            manager.add(this);
        }
    }
    /**
     * The TimerManager this timer is assigned to.
     */
    get timerManager() { return this._timerManager; }
    set timerManager(manager: vbTimerManager) {
        if (this._timerManager !== manager) {
            this._timerManager.remove(this);
            this._timerManager = manager;
            if (this.preserved) {
                manager.add(this);
            }
        }
    }
    /**
     * Start timer from it's current time. \
     * If it's not a preserved timer, add it to its TimerManager. \
     * A `start` event will be emitted.
     * 
     * @param reset Used for reusing timer (default false)
     */
    start(reset=false): this {
        if (reset) this.reset();
        this.enable = true;
        if (!this.preserved) {
            this._timerManager.add(this);
        }
        return this;
    }
    /**
     * Stop timer.
     * 
     * @param fireEndCallback Whether to emit `end` event (default true).
     */
    stop(fireEndCallback=true): this {
        this.isEnded = true;
        this.enable = false;
        if (fireEndCallback)
            this.emit('end', this._elapsedTime);
        return this;
    }
    /**
     * Rest timer to it's initial status.
     * (doesn't necessarily stop the timer)
     */
    reset(): this {
        this._elapsedTime = 0;
        this._repeat = 0;
        this._delayTime = 0;
        this.isStarted = false;
        this.isEnded = false;
        return this;
    }
    /**
     * Remove this timer from its TimerManager.
     */
    remove(): this {
        this._timerManager.remove(this);
        return this;
    }
    /**
     * Start another timer when this one is ended.
     * @returns this
     */
    chain(next: vbTimer): this {
        this._next = next;
        next.timerManager = this.timerManager;
        return this;
    }

    /** Only keep one listener for this event type */
    single<E extends keyof vbTimer.EventMap>(event: E, fn: EventEmitter.EventListener<vbTimer.EventMap,E>, context?: unknown): this {
        return this.off(event).on(event, fn, context);
    }

    /**
     * Increment timer's time. Should be put in main logic loop. \
     * Using `TimerManager.update()` method instead is recommended.
     *
     * @param delta The amount of increment in ms.
     */
    update(delta: number) {
        if (this.delay > this._delayTime) {
            this._delayTime += delta;
            return;
        }

        if (!this.isStarted) {
            this.isStarted = true;
            this.emit('start', this._elapsedTime);
        }

        if (this.time > this._elapsedTime) {
            const t = this._elapsedTime + delta;
            const ended = (t >= this.time);

            this._elapsedTime = (ended) ? this.time : t;
            this.emit('update', this._elapsedTime, delta);

            if (ended) {
                if (this.repeat > this._repeat) {
                    this._repeat++;
                    this.emit('repeat', this._elapsedTime, this._repeat);
                    this._elapsedTime = 0;
                    return;
                }
                this.stop();
                this._next?.start();
            }
        }
    }
}


/**
 * Manager class for Timers
 */
class vbTimerManager {
    protected _timers: vbTimer[] = [];
    protected _timersToDelete: vbTimer[] = [];

    size() { return this._timers.length; }
    /**
     * Increment all managed timers' time.\
     * Better to use this method instead of `timers.update()` for centralized control.
     *
     * @param delta The increment amount in ms.
     */
    update(delta: number) {
        if (this._timersToDelete.length) {
            for (const timerToDel of this._timersToDelete) {
                this._remove(timerToDel);
            }
            this._timersToDelete.length = 0;
        }

        for (const timer of this._timers) {
            if (timer.enable) {
                timer.update(delta);
                if (timer.isEnded && !timer.preserved) {
                    this.remove(timer);
                }
            }
        }
    }
    /**
     * Add timer to this TimerManager. \
     * If it's not a preserved timer, only add when it starts.
     */
    add(timer: vbTimer) {
        if (timer.preserved) {
            this._timers.push(timer);
        }
        else {
            if (timer.enable) {
                this._timers.push(timer);
            }
        }
    }
    /**
     * Stop all timers from this TimerManager.
     * 
     * @param fireEndCallback Wheter to emit `end` event (default false)
     */
    stopAll(fireEndCallback=false) {
        for (const timer of this._timers) {
            timer.stop(fireEndCallback);
        }
    }
    /**
     * Remove timer from this TimerManager.
     */
    remove(timer: vbTimer) {
        this._timersToDelete.push(timer);
    }
    protected _remove(timer: vbTimer) {
        const index = this._timers.indexOf(timer);
        if (index > -1) {
            this._timers.splice(index, 1);
        }
    }
}

export { vbTimer, vbTimerManager };