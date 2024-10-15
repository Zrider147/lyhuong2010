import type { FrontLayer } from "@g/gameplay/FrontLayer";
import type { GUI } from "@g/gameplay/GUI";
import { Easing, vbState } from "@vb/index";
import type { Dice } from "@g/gameplay/MiddlePanel";
import { PI_2 } from "pixi.js";

const DEFAULT_SPIN_REPEAT = 5;
const TURBO_SPIN_REPEAT = 0;

export class SPlayRun extends vbState {

    constructor() {
        super('PlayRun');

    }

    enter(): void {
    }

    update() {

    }

    exit(): void {

    }
}