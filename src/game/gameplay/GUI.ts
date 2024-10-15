import { BottomPanel } from "./BottomPanel";
import type { DATA } from "@g/base/DATA";
import { Easing, PivotPoint, c, vb, vbContainer, vbImage, vbPrimitive, vbRectangle, vbSpineObject } from "@vb/index";
import { SidePanel } from "./SidePanel";
import { fmt } from "src/shared/NumberFormat";
import { TopPanel } from "./TopPanel";
import { MiddlePanel } from "./MiddlePanel";

export class GUI extends vbContainer {
    // title: vbSpineObject
    topPanel: TopPanel = new TopPanel
    middlePanel: MiddlePanel = new MiddlePanel
    bottomPanel: BottomPanel = new BottomPanel
    sidePanel: SidePanel = new SidePanel;

    protected _win = 0;
    protected isFirstStart: boolean = true;

    constructor() {
        super()
        this.name = 'GUI'

        // this.title = new vbSpineObject('spTitle')
        // this.title.state.addAnimation(0, 'title', true, 0)

        this.bottomPanel.pivotRule = PivotPoint.Center
        this.middlePanel.pivotRule = PivotPoint.Center
        this.topPanel.pivotRule = PivotPoint.Center

        this._setBtnCallBack();
        this._setBtnEffect();

        this
            // .addObj(this.title, 0, 'title')
            .addObj(this.middlePanel, 0, 'middlePanel')
            .addObj(this.bottomPanel, 0, 'bottomPanel')
            .addObj(this.sidePanel, 0, 'sidePanel')
            .addObj(this.topPanel, 0, "topPanel")
    }

    get winMeter() { return this._win; }
    set winMeter(value: number) {
        this._win = Math.round(value);
    }

    creditAnim(toCredits: number, duration = 500) {
        return this.tweens.create('credit', pgame.data, { credits: toCredits }, duration)
            .on('start', () => {
                pgame.sound.CoinIncrement.play();
            })
            .on('end', () => {
                pgame.sound.CoinIncrement.stop();
            })
    }
    winMeterAnim(toWin: number, duration = 500) {
        return this.tweens.create('win', this, { winMeter: toWin }, duration)
            .on('start', () => {
                pgame.sound.CoinIncrement.play();
            })
            .on('end', () => {
                pgame.sound.CoinIncrement.stop();
            })
    }
    startClearWinAnim(duration = 500, delay = 0) {
        const twClear = this.tweens.create('clear-win', this, { winMeter: 0 }, duration).delay(delay);
        const twWin = this.tweens.getByName('win');
        if (twWin !== undefined)
            twWin.chain(twClear);
        else
            twClear.start();
        return twClear;
    }

    /** sound is turned on initially */
    toggleSound() {
        (API.musicMuted.value && API.soundMuted.value) ?
            API.musicMuted.value = API.soundMuted.value = false :
            API.musicMuted.value = API.soundMuted.value = true
    }

    setBtnSoundTex(on: boolean) {
        // if (on)
        // this.bottomPanel.btnSound.setTex('sound_on')
        // else
        // this.bottomPanel.btnSound.setTex('sound_off')
    }

    bindDataEvents(data: DATA) {
        data.on('credit', (value) => {
            this.topPanel.cnvCredit.txtCreditValue.text = fmt.currency(value);
        });
        data.on('bet', (_index, value) => {
            this.bottomPanel.cnvBet.txtBetValue.text = fmt.currency(value);
        });
    }

    disableBetButtons() {
        this.bottomPanel.cnvBet.btnReset.setOnClick(false);
        this.bottomPanel.cnvBet.btnReset.alpha = 0.5;

        this.bottomPanel.cnvBet.btnPlay.setOnClick(false)
        this.bottomPanel.cnvBet.btnPlay.alpha = 0.5

        this.middlePanel.cnvAuto.btnAuto.setOnClick(false)
        this.middlePanel.cnvAuto.btnAuto.alpha = 0.5

        for (let i = 0; i < 6; i++) {
            if (i < 5) {
                this.bottomPanel.cnvBet.btnChips[i].setOnClick(false)
                this.bottomPanel.cnvBet.btnChips[i].alpha = 0.5
            }
            this.middlePanel.cnvColorsBoard.btnColors[i].setOnClick(false)
            this.middlePanel.cnvColorsBoard.btnColors[i].alpha = 0.5
        }
    }

    enableBetButtons() {
        this.bottomPanel.cnvBet.btnReset.alpha = 1;

        this.bottomPanel.cnvBet.btnPlay.alpha = 1

        this.middlePanel.cnvAuto.btnAuto.alpha = 1

        for (let i = 0; i < 6; i++) {
            if (i < 5) {
                this.bottomPanel.cnvBet.btnChips[i].alpha = 1
            }
            this.middlePanel.cnvColorsBoard.btnColors[i].alpha = 1
        }
    }

    toggleMaxBet() {
        pgame.sound.Click.play();
        if (!pgame.data.isMaxBet()) {
            pgame.data.setBetAtId(pgame.data.maxIndex);
        }
        else {
            pgame.data.setBetAtId(pgame.data.lastBetIndex);
        }
    }

    getServerData() {

    }

    protected _setBtnCallBack() {
        //-------------------- TOGGLE SOUND -----------------------------
        // this.bottomPanel.btnSound.setOnClick(() => this.toggleSound());
    }

    protected _setBtnEffect() {

    }

    useViewStyle(item: vb.ContainerStyleItem): void {
        if (pgame.currStyle.name === 'landscape') {
            //Chips Bet
            for (let i = 0; i < 5; i++) {
                this.bottomPanel.cnvBet.btnChips[i].position.set(i * 150 + 520, 0)
                this.bottomPanel.cnvBet.btnChips[i].scale.set(1.5)
            }
        }
        else {
            //Chips Bet
            for (let i = 0; i < 5; i++) {
                this.bottomPanel.cnvBet.btnChips[i].scale.set(1.5)
                this.bottomPanel.cnvBet.btnChips[i].position.set(i * 150 - 300, -180)
            }
        }

        if (!this.isFirstStart && this.middlePanel.cnvAuto.isOpen) {
            this.middlePanel.cnvAuto.twCloseAutoplay(500, true)
        }
        else if (this.isFirstStart) {
            this.isFirstStart = false
        }
    }

}