/* eslint-disable @typescript-eslint/no-explicit-any */
/** In this file, we hook into the existing classes and instances */
import { type IMediaInstance, type PlayOptions, Sound, SoundLibrary, htmlaudio, sound, utils, webaudio } from '@pixi/sound';


declare module '@pixi/sound' {
    interface PlayOptions {
        /** fadeIn from `start` in milliseconds when `play()` or `resume()` is called, (override settings in `Sound`) */
        fadeIn?: number;
        /**
         * fadeOut till `end` when a non-loop sound is going to end,
         * or when `stop()` or `pause()` is manually called. (override settings in `Sound`)
         */
        fadeOut?: number;
    }

    interface Sound {
        group?: SoundGroup;
        mutexGroup?: MutexSoundGroup;
        /**
         * By default, a sound in mutex group will be stopped when another one starts to play.
         * Setting this flag let the sound to be paused instead.
         */
        mutexPause?: true;
        /**
         * Gets the volume of the sound itself.
         * For the sake of group volume, sound's original `volume` getter has been overrided
         * to return the product of both sound and group volume.
         * Therefore it needs another getter to get the sound volume.
         */
        get selfVolume(): number;
        /**
         * Gets the muted flag of the sound itself.
         * For the sake of group muted flag, sound's original `muted` getter has been overrided
         * to return the OR of both sound and group muted flag.
         * Therefore it needs another getter to get the sound muted flag.
         */
        get selfMuted(): boolean;
        /** fadeIn from `start` in milliseconds when `play()` is called, (can be overrided by `PlayOptions`) */
        fadeIn?: number;
        /**
         * fadeOut till `end` when a non-loop sound is going to end,
         * or when `stop()` or `pause()` is manually called. (can be overrided by `PlayOptions`)
         */
        fadeOut?: number;
    }

    interface SoundLibrary {
        readonly groups: Record<string, SoundGroup>;
        readonly mutexGroups: Record<string, MutexSoundGroup>;
        /**
         * Set a group of sounds which has its own group-level volume and muted flag,
         * apart from global-level, sound-level and instance-level.
         * 
         * @param collection Collection of sound names
         */
        setGroup<M extends Record<string, string>>(groupName: string, collection: M): { [K in keyof M]: Sound };
        /**
         * Set a group of sounds which are mutually exclusive, only one of them can be played at a time.
         * Playing one of them immediately stops the one that is playing at the moment.
         * All sounds in the group are `singleInstance` otherwise it doesn't make sense.
         * 
         * @param list List of sound names
         */
        setMutexGroup(groupName: string, list: string[] | Sound[]): Sound[];
    }

    interface IMediaInstance {
        /** Get parent sound of this instance */
        get sound(): Sound;
        /** Actual loop flag (instance or sound)  */
        get loopReal(): boolean;
        /** If the `play()` has been called at least once, we don't need to set fade callbacks */
        firstPlayed: boolean;
        /** FadeIn related data */
        fadeIn?: FadeInData;
        fadeOut?: FadeOutData;
    }
    namespace webaudio {
        interface WebAudioInstance {
            firstPlayed: boolean;
            get sound(): Sound;
            get loopReal(): boolean;
        }
    }
    namespace htmlaudio {
        interface HTMLAudioInstance {
            firstPlayed: boolean;
            get sound(): Sound;
            get loopReal(): boolean;
        }
    }
}


class SoundGroup {
    list: Sound[];
    protected _volume = 1;
    protected _muted = false;

    constructor(list: Sound[]) {
        this.list = list;
        for (const snd of this.list) {
            snd.group = this;
        }
    }

    get volume() { return this._volume; }
    set volume(value: number) {
        this._volume = value;
        this.refresh();
    }
    get muted() { return this._muted; }
    set muted(value: boolean) {
        this._muted = value;
        this.refresh();
    }

    refresh() {
        for (const snd of this.list) {
            snd.refresh();
        }
    }
}

class MutexSoundGroup {
    prev: Sound | null = null;
    current: Sound | null = null;
    list: Sound[];

    constructor(list: Sound[]) {
        this.list = list;
        for (const snd of this.list) {
            snd.mutexGroup = this;
            snd.singleInstance = true;
        }
    }
}

type FadeInData = {
    timeMS: number,
    startMS: number,
    endMS: number
};
type FadeOutData = {
    timeMS: number,
    startMS: number,
    endMS: number,
    /** When a sound has fadeOut but `stop()` or `pause()` is called manually, it can't be done immediately  */
    wantsTo: ' ' | 'stop' | 'pause',
    /** Coupled with wantsTo, */
    canStop: boolean
}


function playFadingSound(instance: IMediaInstance, options: PlayOptions): void {
    const sound = instance.sound;
    if (!instance.firstPlayed) {
        instance.firstPlayed = true;
        const fadeIn = options.fadeIn || sound.fadeIn;
        const fadeOut = options.fadeOut || sound.fadeOut;
        if (!fadeIn && !fadeOut) return;

        if (fadeIn) {
            instance.fadeIn = {
                timeMS: fadeIn,
                startMS: pgame.TotalMS,
                endMS: pgame.TotalMS + fadeIn
            };
        }
        if (fadeOut) {
            let endMS = 1000 * (options.end || sound.duration);
            instance.fadeOut = {
                timeMS: fadeOut,
                startMS: pgame.TotalMS + endMS - fadeOut,
                endMS: pgame.TotalMS + endMS,
                wantsTo: ' ',
                canStop: false
            };
        }

        const originalVolume = <number>options.volume;
        const onProgress = (_progress: number, _duration: number) => {
            if (
                    instance.fadeOut &&
                    (instance.fadeOut.wantsTo != ' ' || !instance.loopReal) &&
                    (pgame.TotalMS >= instance.fadeOut.startMS)
                ) {
                let rate = (pgame.TotalMS - instance.fadeOut.startMS) / instance.fadeOut.timeMS;
                rate = Math.min(rate, 1);
                // console.log('fadeout', rate);
                if (rate == 1) {
                    instance.fadeOut.canStop = true;
                    if (instance.fadeOut.wantsTo == 'stop')
                        instance.stop();
                    else if (instance.fadeOut.wantsTo == 'pause')
                        instance.refreshPaused();
                }
                else
                    instance.volume = (1 - rate) * originalVolume;
            }
            else if (
                    instance.fadeIn &&
                    (pgame.TotalMS <= instance.fadeIn.endMS || instance.volume < originalVolume)
                ) {
                let rate = (pgame.TotalMS - instance.fadeIn.startMS) / instance.fadeIn.timeMS;
                rate = Math.min(rate, 1);
                // console.log('fadein', rate);
                instance.volume = rate * originalVolume;
            }
        };
        instance.on('progress', onProgress);
    }
    else {
        // not the first time, maybe resume?
        // reset data
        if (instance.fadeIn) {
            instance.fadeIn.startMS = pgame.TotalMS;
            instance.fadeIn.endMS = pgame.TotalMS + instance.fadeIn.timeMS
        }
        if (instance.fadeOut) {
            let endMS = 1000 * ((options.end || sound.duration) - <number>options.start);
            instance.fadeOut.startMS = pgame.TotalMS + endMS - instance.fadeOut.timeMS;
            instance.fadeOut.endMS = pgame.TotalMS + endMS;
            instance.fadeOut.wantsTo = ' ';
            instance.fadeOut.canStop = false;
        }
    } 
}

function stopFadingSound(instance: IMediaInstance, wantsTo: 'stop' | 'pause'): boolean {
    const data = instance.fadeOut;
    if (!data) return true;
    // have to wait until it's been faded out
    if (data.wantsTo != wantsTo) {
        data.wantsTo = wantsTo;
        // reset fadeOut timing
        data.startMS = pgame.TotalMS;
        data.endMS = Math.min(data.endMS, pgame.TotalMS + data.timeMS);
        return false;
    }
    else
        return data.canStop;
}

function switchMutex(toSnd: Sound) {
    if (!toSnd.mutexGroup) return;
    if (toSnd.mutexGroup.current) {
        const currSnd = toSnd.mutexGroup.current;
        if (currSnd.isPlaying) {
            if (currSnd.mutexPause)
                currSnd.pause();
            else
                currSnd.stop();
        }
        toSnd.mutexGroup.prev = currSnd;
    }
    toSnd.mutexGroup.current = toSnd;
}


const webaudio_proto = webaudio.WebAudioInstance.prototype;
const super_webaudio = {
    init: webaudio_proto.init,
    play: webaudio_proto.play,
    stop: webaudio_proto.stop,
    refreshPaused: webaudio_proto.refreshPaused
};

const htmlaudio_proto = htmlaudio.HTMLAudioInstance.prototype;
const super_htmlaudio = {
    init: htmlaudio_proto.init,
    play: htmlaudio_proto.play,
    stop: htmlaudio_proto.stop,
    refreshPaused: htmlaudio_proto.refreshPaused
};

const sound_proto = Sound.prototype;
const super_sound = {
    play: sound_proto.play,
    resume: sound_proto.resume
};
const soundlib_proto = SoundLibrary.prototype;


webaudio_proto.init = function(media) {
    this.firstPlayed = false;
    super_webaudio.init.call(this, media);
}
webaudio_proto.play = function(options) {
    playFadingSound(this, options);
    super_webaudio.play.call(this, options);
}
webaudio_proto.stop = function() {
    if (stopFadingSound(this, 'stop'))
        super_webaudio.stop.call(this);
}
webaudio_proto.refreshPaused = function() {
    if (stopFadingSound(this, 'pause'))
        super_webaudio.refreshPaused.call(this);
}
Object.defineProperties(webaudio_proto, {
    sound: {
        get: function() { return this._media.parent; }
    },
    loopReal: {
        get: function() { return this._loop || this._media.parent.loop; }
    }
});

htmlaudio_proto.init = function(media) {
    this.firstPlayed = false;
    super_htmlaudio.init.call(this, media);
}
htmlaudio_proto.play = function(options) {
    playFadingSound(this, options);
    super_htmlaudio.play.call(this, options);
}
htmlaudio_proto.stop = function() {
    if (stopFadingSound(this, 'stop'))
        super_htmlaudio.stop.call(this);
}
htmlaudio_proto.refreshPaused = function() {
    if (stopFadingSound(this, 'pause'))
        super_htmlaudio.refreshPaused.call(this);
}
Object.defineProperties(htmlaudio_proto, {
    sound: {
        get: function() { return this._media.parent; }
    },
    loopReal: {
        get: function() { return this._loop || this._media.parent.loop; }
    }
});

sound_proto.play = function(source, callback) {
    switchMutex(this);
    return super_sound.play.call(this, source, callback);
}
sound_proto.resume = function() {
    switchMutex(this);
    return super_sound.resume.call(this);
}
Object.defineProperties(sound_proto, {
    volume: {
        get: function() { return this.group ? this.group.volume * this._volume : this._volume; }
    },
    muted: {
        get: function() { return this.group?.muted || this._muted; }
    },
    selfVolume: {
        get: function() { return this._volume; }
    },
    selfMuted: {
        get: function() { return this._muted; }
    }
});

(<any>sound).groups = {};
(<any>sound).mutexGroups = {};
soundlib_proto.setGroup = function(groupName, collection) {
    const soundCollection = Object.fromEntries(
        Object.entries(collection).map(([key, sndName]) => [key, this.find(sndName)])
    ) as any;
    this.groups[groupName] = new SoundGroup(Object.values(soundCollection));
    return soundCollection;
}
soundlib_proto.setMutexGroup = function(groupName, list) {
    const soundList = typeof list[0] == 'string' ? (<string[]>list).map(sndName => this.find(sndName)) : <Sound[]>list;
    this.mutexGroups[groupName] = new MutexSoundGroup(soundList);
    return soundList;
}


export {
    soundAsset,
    type PlayOptions
} from '@pixi/sound';

const SupportedSoundExts = utils.supported;
export {
    Sound as vbSound,
    SoundLibrary as vbSoundManager,
    sound as vbSoundManagerInstance,
    SupportedSoundExts
};