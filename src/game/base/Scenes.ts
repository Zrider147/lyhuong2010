import { GUI } from '@g/gameplay/GUI';
import { FrontLayer } from '@g/gameplay/FrontLayer';

export function createAllScenes() {
    const gui = new GUI();
    pgame.gui = gui;
    const msg = new FrontLayer();
    pgame.front = msg;

    pgame.stage
        .addObj(gui)
        .addObj(msg)

    return [];
}