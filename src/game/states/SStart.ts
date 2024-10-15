import type { GUI } from "@g/gameplay/GUI";
import { vbState } from "@vb/index";

export class SStart extends vbState {
    gui: GUI = pgame.gui;

    constructor() {
        super('Start');


    }

    enter(): void {

    }

    update(deltaFrame: number): void {

    }

    exit(): void {
        this.gui.disableBetButtons()
        conn.request('bet');
    }
}

