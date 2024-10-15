import { DATA } from './base/DATA';
import type { FrontLayer } from './gameplay/FrontLayer';
import type { GUI } from './gameplay/GUI';
import { type MusicCollection, MusicNames, type SoundCollection, SoundNames, configSounds } from './base/SoundConfig';
import { SLoading } from './states/SLoading';
import { SPlayRun } from './states/SPlayRun';
import { SShowin } from './states/SShowin';
import { SStart } from './states/SStart';
import { createAllScenes } from './base/Scenes';
import { vb, vbGame, vbInteractionManager, vbSpineObject } from '@vb/index';
export { vb } from '@vb/index';
import { CE } from './base/ClientEngine';
import { watch } from 'vue';
import { SBonus } from './states/SBonus';

declare module '@vb/core/vbState' {
    interface vbStateMap {
        'Loading': SLoading;
        'Start': SStart;
        'PlayRun': SPlayRun;
        'Bonus': SBonus;
        'Showin': SShowin;
    }
}

export class MainGame extends vbGame {
    interact = new vbInteractionManager();
    data = undefined as unknown as DATA;
    ce = CE;

    title = undefined as unknown as vbSpineObject;
    gui = undefined as unknown as GUI;
    front = undefined as unknown as FrontLayer;

    music = undefined as unknown as MusicCollection;
    sound = undefined as unknown as SoundCollection;

    vueLeftHandedMode = false;
    balanceDecreases = undefined as unknown as number;
    nonWinning = undefined as unknown as number;
    countNonWinning = undefined as unknown as number;

    controlCaseGS = false;
    controlCaseWild = false;

    constructor(canvas: HTMLCanvasElement) {
        super({
            view: canvas,
            autoStart: true,
            sharedTicker: true,
            autoDensity: true,
            antialias: true,
            backgroundAlpha: 0,
            backgroundRect: true
        });

        globalThis.pgame = this;
        // vb.setNumberFormat(API.currency);

        this.ticker.minFPS = 30;

        this.assets.prepareLoading();
        this.assets.onPreprocessAssetList = (list) => {

        }
        this.assets.addCSSFont('Mulish', undefined, "abc")
        this.assets.addCSSFont('Aachen Bold', undefined, "abc")

        this.data = new DATA();

        this.addState(new SLoading());
        this.setState('Loading');
        this.startLoop(); // Current state is Boot

        // async function is annoying but we have to wrap the following codes into then().
        this.loadAssets().then(() => {
            this.initSounds()
            // if (DEV)
            this.interact.listenKeyboard(document);
            // init default style and landscape first
            this.setLocale(API.locale.value);
            this.addScenes(...createAllScenes());

            this.addState(new SStart());
            this.addState(new SPlayRun());
            this.addState(new SBonus())
            this.addState(new SShowin());

            // if (DEV)
            //     this.showFPS(); // debug
            this.setGameAPI();

            window.addEventListener('message', this.updateBalanceListener.bind(this));
            this.state('Loading').isGameInitialized = true;
            return this;
        });
    }

    mainLoop(deltaFrame: number) {
        let next = this.currState.runFSM(deltaFrame);
        if (next != '') {
            this.setState(next);
        }
        this.stage.update(deltaFrame);
    }

    detectStyleAndResize(contentWidth: number, contentHeight: number) {
        if (contentWidth >= contentHeight) {
            if (this.currStyle.name != 'landscape')
                this.applyLandscape();
        }
        else {
            if (this.currStyle.name != 'portrait')
                this.applyPortrait();
        }
        this.resizeAppView(contentWidth, contentHeight);
    }

    resizeAppView(contentWidth: number, contentHeight: number) {
        // doesn't need to scale the resolution when we turn on the autodensity
        let resizedWidth = contentWidth; /// this.renderer.resolution;
        let resizedHeight = contentHeight; /// this.renderer.resolution;
        if (contentWidth * this.desiredRatio <= contentHeight) {
            // fit width
            resizedHeight = resizedWidth * this.desiredRatio;
        }
        else {
            // fit height
            resizedWidth = resizedHeight / this.desiredRatio;
        }
        this.renderer.resize(resizedWidth, resizedHeight);
        this.stage.scale.set(resizedWidth / this.desiredWidth, resizedHeight / this.desiredHeight);
    }

    prepareStyle() {
        this.stage.tweens.endAll();
        // get resolution
        const res = this.currStyle.Resolution;
        this.setResolution(res[0], res[1]);
    }

    applyLandscape() {
        this.setViewStyle('landscape');
        this.prepareStyle();
        this.useCurrentViewStlye();
        API.isLandscape.value = true;
    }

    applyPortrait() {
        this.setViewStyle('portrait');
        this.prepareStyle();
        this.useCurrentViewStlye();
        API.isLandscape.value = false;
    }

    initSounds() {
        this.music = this.soundManager.setGroup('music', MusicNames);
        this.sound = this.soundManager.setGroup('sound', SoundNames);
        this.soundManager.setMutexGroup('bg', Object.values(this.music));
        configSounds(this.music, this.sound);
    }

    setGameAPI() {
        watch(API.locale, (code) => {
            this.setLocale(code);
            this.useCurrentLocale();
        });
        watch(API.volume, (volume) => {
            this.soundManager.volumeAll = volume;
        }, { immediate: true });
        watch([API.musicMuted, API.soundMuted], ([newMusicMuted, newSoundMuted]) => {
            const musicGroup = this.soundManager.groups['music'];
            const soundGroup = this.soundManager.groups['sound'];
            musicGroup.muted = newMusicMuted;
            soundGroup.muted = newSoundMuted;
        }, { immediate: true });
        // watch(API.isLeftHanded, () => {
        //     this.useCurrentViewStlye(); // TODO
        // });
    }

    updateBalanceListener(event: MessageEvent) {
        if (event.data != null && event.data.command == 'EVO:REFRESH_BALANCE'
            && event.data.expectedBalance != null && !isNaN(event.data.expectedBalance)) {
            const twWin = this.gui.tweens.getByName('win');
            if (twWin) {
                twWin.stop(); // prevent credits to be overwritten by tween
            }
            this.data.realCredits = event.data.expectedBalance;
            this.data.syncCredits();
        }
    }
}