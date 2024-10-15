import { vbPopMessage, vbRoundedRectangle, c, vbSpineObject, PivotPoint } from "@vb/index";
import { vbContainer } from "@vb/vbContainer";

export class FrontLayer extends vbContainer {
    popMsg: vbPopMessage;

    // ----------------- MYSTERY + WILD WIN DATA -----------------
    mysteryWinCredit: number = 0
    shootingWild: any[] = []
    GSMysteryWin: number = 0

    constructor() {
        super();
        this.name = 'FRONT-LAYER';

        const popUpRect = new vbRoundedRectangle(500, 200, 20).fill(c.Black, 0.8);
        this.popMsg = new vbPopMessage(popUpRect, { size: 32, weight: '700', width: 400, align: 'center' }, this.tweens);
        this.popMsg.pivotRule = PivotPoint.Center
        this.popMsg.sound = 'hint'

        this.addObj(this.popMsg, 2, 'pop-up-hint')
    }
}