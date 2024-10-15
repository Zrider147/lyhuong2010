import type { BetCanvas } from "@g/gameplay/BottomPanel";
import type { FrontLayer } from "@g/gameplay/FrontLayer";
import type { GUI } from "@g/gameplay/GUI";
import type { ColorsBoard } from "@g/gameplay/MiddlePanel";
import { vbState } from "@vb/index";
import { indexOf } from "lodash";

export function tryNewPlay(state: vbState) {
    const pdata = pgame.data;
    const popMsg = pgame.front.popMsg;

    if (pdata.realCredits < pdata.totalBet || pdata.betColor == 0) {
        popMsg.txtKey('no-fund');
        popMsg.pop(1500, 500).start(true);
        state.setNext('Start');
        return false;
    }

    // stop winning increase anim
    pgame.gui.tweens.getByName('credit')?.stop();
    state.setNext('PlayRun');
    return true;
}
export function resetAutoPlay() {
    const sidePanel = pgame.gui.sidePanel;
    pgame.stage.tweens.remove(sidePanel.autoPlayTweens);
    // sidePanel.btnAutoPlay.radian = 0;
    // sidePanel.btnAutoPlay.setTex("autoplay_off");
    // sidePanel.txtAutoPlay.setKey("autoplay")
    // sidePanel.txtAutoPlay.setTxtStyle({ fontSize: 15 });
    // sidePanel.txtAutoPlay.position.set(0, 60);
    pgame.data.nAutoPlays = 0;
    pgame.gui.enableBetButtons();
}

export function autoPlayGame(state: vbState) {
    const sidePanel = pgame.gui.sidePanel;
    if (pgame.data.nAutoPlays < 1) {
        resetAutoPlay();
    } else {
        // sidePanel.btnAutoPlay.setTex("autoplay_on");
        // sidePanel.txtAutoPlay.text = pgame.data.nAutoPlays;
        // sidePanel.txtAutoPlay.setTxtStyle({ fontSize: 20 });
        // sidePanel.txtAutoPlay.position.set(0, 0);
        // sidePanel.autoPlayTweens = pgame.stage.tweens.create('autoplayShow', sidePanel.btnAutoPlay, { radian: 1000000 }, 1000000000)
        //     .easing(Easing.Cubic.Out).start();
        // if (pgame.currState.name === 'Start') {
        //     tryNewPlay(state);
        // }
        // pgame.gui.disableBetButtons();
    }
}

export class SStart extends vbState {
    gui: GUI = pgame.gui;
    msg: FrontLayer = pgame.front

    cnvBet: BetCanvas = this.gui.bottomPanel.cnvBet
    cnvColorsBoard: ColorsBoard = this.gui.middlePanel.cnvColorsBoard

    constructor() {
        super('Start');


    }

    enter(): void {
        console.log('STATE: Start')

        this.setBtnCallbacks()
        this.gui.enableBetButtons()
    }

    update(deltaFrame: number): void {
        if (pgame.data.betColor == 0 || pgame.data.totalBet <= 0) {

        }
    }

    exit(): void {
        this.gui.disableBetButtons()
        conn.request('bet');
    }

    setBtnCallbacks() {
        //--------------- BUTTON PLAY ---------------
        this.cnvBet.btnPlay.setOnClick(() => {
            this.onBtnPlayClicked()
        })

        //--------------- BUTTON RESET ---------------
        this.cnvBet.btnReset.setOnClick(() => {
            console.log('RESET')
            pgame.data.setBetAtId(0)
        })

        //--------------- BUTTON CHIPS ---------------
        for (let btn of this.cnvBet.btnChips) {
            btn.setOnClick(() => {
                pgame.data.addBetByValue(this.cnvBet.configBetList[this.cnvBet.btnChips.indexOf(btn)]);
            })
        }

        //--------------- BUTTON COLORS ---------------
        for (let btn of this.cnvColorsBoard.btnColors) {
            btn.setOnClick(() => {
                pgame.data.setBetColor(this.cnvColorsBoard.colorsValue[this.cnvColorsBoard.btnColors.indexOf(btn)]);
                this.cnvColorsBoard.highlightColor(this.cnvColorsBoard.btnColors.indexOf(btn))
            })
        }
    }

    onBtnPlayClicked() {
        this.cnvBet.btnPlay.setOnClick(false);
        pgame.interact.off("down- ");
        if (pgame.data.nAutoPlays > 0) {
            resetAutoPlay();
        }
        else {
            tryNewPlay(this);
        }
    }

    OnBtnAutoPlayClicked() {
        pgame.sound.Click.play();
        if (pgame.data.nAutoPlays > 0) {
            resetAutoPlay();
        }
        else {
            API.showAutoPlayMenu(true);
        }
    }
}

