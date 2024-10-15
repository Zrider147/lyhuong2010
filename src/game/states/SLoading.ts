import { createOmniConnector } from '@g/conn/omni';
import { vbState } from "@vb/index";


export class SLoading extends vbState {
    isGameInitialized = false;
    isStartRequestReceived = false;

    constructor() {
        globalThis.conn = createOmniConnector();
        super('Loading');
    }

    enter(): void {
        conn.onOpen = () => {
            conn.request('startGame');
        };
        conn.connect(20000, 3);
    }

    update() {
        if (this.isGameInitialized && this.isStartRequestReceived)
            this.setNext('Start')
    }

    exit(): void {
        if (this._nextState == 'Start') {
            // API.showSoundMenu(true);
            pgame.data.setDefaultBet();
            pgame.data.syncCredits();
            pgame.onGameReady();
            pgame.music.Bg.play();
        }

        // press key to enable cheat panel
        if (API.params.get('cheat') !== null && API.params.get('cheatRND') === null) {
            pgame.interact.on('down-p', () => API.showCheatPanel(true));
            pgame.interact.on('down-P', () => API.showCheatPanel(true));
        }
    }
}