import EventEmitter from 'eventemitter3';

interface DataEvents {
    /** on credit changed */
    'credit': (value: number) => void;
    /** on bet changed */
    'bet': (index: number, value: number) => void;
    /** on autoplay count changed */
    'autoplay': (n: number, oldN: number) => void;
}

export class DATA extends EventEmitter<DataEvents> {
    protected _realCredits = 0;
    protected _credits = 0;
    protected _backupCredits = 0;
    protected _betList: number[] = [];
    protected _betIndex = 0;
    protected _lastBetIndex = 0;
    protected _betColor = 0;
    defaultBet = 0;
    cheatRND?: number;

    //--------------------CREDIT DATA---------------------
    get realCredits() { return this._realCredits; }
    set realCredits(value: number) {
        this._backupCredits = this._realCredits;
        this._realCredits = value;
    }

    get credits() { return this._credits; }
    set credits(value: number) {
        // IMPORTANT javascript number can be both float and integer
        value = Math.round(value);
        this._credits = value;
        this.emit('credit', value);
    }

    syncCredits() {
        this.credits = this.realCredits;
    }
    restore() {
        this._realCredits = this._backupCredits;
    }

    //--------------------BET DATA---------------------
    get totalBet() {
        return this._betList[this._betIndex];
    }
    get betListNum() {
        return this._betList.length;
    }
    get betIndex() {
        return this._betIndex;
    }
    get maxIndex() {
        return this._betList.length - 1;
    }
    get lastBetIndex() {
        return this._lastBetIndex;
    }
    get betColor() {
        return this._betColor;
    }
    isMinBet() {
        return this._betIndex == 0;
    }
    isMaxBet() {
        return this._betIndex == this._betList.length - 1;
    }

    getBetAtId(index: number) {
        if (index < 0 || index >= this.betListNum) {
            throw new Error("Bet Index out of range!");
        }
        return this._betList[index];
    }
    setBetAtId(index: number) {
        if (index < 0 || index >= this.betListNum) {
            throw new Error("Bet Index out of range!");
        }
        this._lastBetIndex = this._betIndex;
        this._betIndex = index;
        this.emit('bet', index, this._betList[index]);
    }

    setBetAtValue(value: number) {
        if (!this._betList.includes(value)) {
            console.log("Invalid Bet Value");
            return;
        }
        const index = this._betList.indexOf(value);
        this.setBetAtId(index);
    }

    addBetByValue(value: number) {
        if (!this._betList.includes(value)) {
            console.log("Invalid Bet Value");
            return;
        }

        const index = this._betList.indexOf(value);
        const addIndex = index + this._betIndex;


        if (addIndex > this.maxIndex) {
            this.setBetAtId(this.maxIndex);
            return;
        }

        this.setBetAtId(addIndex);
    }

    setBetColor(value: number) {
        if (value <= 0 || value > 6) {
            throw new Error("Bet Color Value out of range!");
        }

        this._betColor = value;
    }

    setBetList(step: number, min: number, max: number): void;
    setBetList(list: number[]): void;
    setBetList(step: number | number[], min?: number, max?: number) {
        if (Array.isArray(step)) {
            this._betList = step;
        }
        else {
            this._betList.clear();
            for (let i = <number>min; i <= <number>max; i += step) {
                this._betList.push(i);
            }
        }
    }

    setDefaultBet() {
        let index = this._betList.indexOf(this.defaultBet);
        index = Math.max(0, index); // in case cannot find in list
        this.setBetAtId(index);
        this._lastBetIndex = index; // initial "last" index is the default index
    }

    /** data for game client */

    protected _nAutoplays = 0;
    /** remaining auto play counts */
    get nAutoPlays() { return this._nAutoplays; }
    set nAutoPlays(n: number) {
        if (n < 0) n = 0;
        let oldN = this._nAutoplays;
        if (this.testAutoplay !== undefined && !this.testAutoplay(n, oldN))
            n = 0;

        if (n != oldN) {
            this._nAutoplays = n;
            this.emit('autoplay', n, oldN);
        }
    }

    /** Test if it can actually set the autoplay count, otherwise set to 0 */
    testAutoplay?: (n: number, oldN: number) => boolean;
}