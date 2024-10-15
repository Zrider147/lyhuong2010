import { gameDataSchema } from './../base/ClientEngine';
import type { GUI } from "@g/gameplay/GUI";
import { vbState } from "@vb/index";
import type { ColorsBoard } from "@g/gameplay/MiddlePanel";

export class SShowin extends vbState {
    gui: GUI = pgame.gui;

    constructor() {
        super('Showin');

    }

    enter(): void {

    }

    exit(): void {

    }

    update() {

    }
}