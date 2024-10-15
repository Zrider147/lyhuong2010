import { gameDataSchema } from './../base/ClientEngine';
import type { GUI } from "@g/gameplay/GUI";
import { vbState } from "@vb/index";
import type { ColorsBoard } from "@g/gameplay/MiddlePanel";

export class SShowin extends vbState {
    gui: GUI = pgame.gui;

    cnvColorsBoard: ColorsBoard = this.gui.middlePanel.cnvColorsBoard

    winAmount: number = 0;

    constructor() {
        super('Showin');

        this.onBtnPlayClicked = this.onBtnPlayClicked.bind(this);
    }

    enter(): void {
        setTimeout(() => {
            if (this.winAmount == 0) {
                this.goBackToStart()
            }
            else if (this.winAmount > 0) {
                this.cnvColorsBoard.txtNoti.setKey('playerWin')
                this.goBackToStart()
            }
        }, 500)
    }

    exit(): void {

    }

    update() {

    }
    onBtnPlayClicked() {

    }

    goBackToStart() {
        // this.setCreditsAnim();
        setTimeout(() => {
            this.setNext("Start");
            conn.request('startGame');
        }, 500)
    }
}