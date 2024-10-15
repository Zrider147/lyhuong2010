import { vb, vbContainer } from "@vb/index";

export class GUI extends vbContainer {

    protected _win = 0;
    protected isFirstStart: boolean = true;

    constructor() {
        super()
        this.name = 'GUI'


        this._setBtnCallBack();
        this._setBtnEffect();

        this
        // .addObj(this.title, 0, 'title')
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

    disableBetButtons() {

    }

    enableBetButtons() {

    }

    protected _setBtnCallBack() {
        //-------------------- TOGGLE SOUND -----------------------------
        // this.bottomPanel.btnSound.setOnClick(() => this.toggleSound());
    }

    protected _setBtnEffect() {

    }

    useViewStyle(item: vb.ContainerStyleItem): void {

    }

}