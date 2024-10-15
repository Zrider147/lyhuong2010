import type { FrontLayer } from "@g/gameplay/FrontLayer";
import type { GUI } from "@g/gameplay/GUI";
import { Easing, vbState } from "@vb/index";
import type { Dice } from "@g/gameplay/MiddlePanel";
import { PI_2 } from "pixi.js";

const DEFAULT_SPIN_REPEAT = 5;
const TURBO_SPIN_REPEAT = 0;

export class SPlayRun extends vbState {
    [x: string]: any;
    gui: GUI = pgame.gui;
    msg: FrontLayer = pgame.front

    cnvDice: Dice = this.gui.middlePanel.cnvDice

    isReceivedData: boolean = false
    isBonus: boolean = false
    dice: number[] = []

    constructor() {
        super('PlayRun');

    }

    enter(): void {
        console.log('STATE: PlayRun')

        this.rollDice()
    }

    update() {
        if (this.isReceivedData) {
            this.isReceivedData = false
            // this.dice = [1, 2, 2]
            this.isBonus = true
            if (this.isBonus) {
                this.setDice([0, 1, 2])
            } else {
                this.setDice(this.findIdenticalDice())
            }
        }
    }

    exit(): void {

    }

    rollDice() {
        for (let i = 0; i < 3; i++) {
            this.cnvDice.spDice[i].state.setAnimation(0, 'p_b', true)
            this.cnvDice.spDice[i].state.timeScale = 2
        }
    }

    setDice(diceValue: number[]) {
        let isSpecial: boolean = false

        if (diceValue[0] != 0) isSpecial = true
        // console.log(diceValue)

        for (let i = 0; i < 3; i++) {
            if (this.isBonus || isSpecial) {
                // console.log('special')
                if (i == 0) {
                    setTimeout(() => {
                        this.cnvDice.spDice[diceValue[i]].state.timeScale = 1
                        this.cnvDice.spDice[diceValue[i]].state.setAnimation(0, 'p_' + this.dice[diceValue[i]], false)
                    }, 500)
                }
                else if (i == 1) {
                    this.nearMissEffect(this.cnvDice.spDice[diceValue[i]])
                    setTimeout(() => {
                        this.cnvDice.spDice[diceValue[i]].state.timeScale = 1
                        this.cnvDice.spDice[diceValue[i]].state.setAnimation(0, 'p_' + this.dice[diceValue[i]], false)
                    }, 3000)
                }
                else {
                    setTimeout(() => {
                        this.nearMissEffect(this.cnvDice.spDice[diceValue[i]])
                    }, 4000)
                    setTimeout(() => {
                        this.cnvDice.spDice[diceValue[i]].state.timeScale = 1
                        this.cnvDice.spDice[diceValue[i]].state.setAnimation(0, 'p_' + this.dice[diceValue[i]], false)

                        if (this.isBonus) {
                            this.twBonusCelebration()

                        } else {
                            this.setNext('Showin')
                        }
                    }, 7000)
                }
            }
            else {
                setTimeout(() => {
                    // console.log('nothing')
                    this.cnvDice.spDice[diceValue[i]].state.timeScale = 1
                    this.cnvDice.spDice[diceValue[i]].state.setAnimation(0, 'p_' + this.dice[diceValue[i]], false)

                    if (i == 2)
                        this.setNext('Showin');
                }, i * 600)
            }
        }
    }

    findIdenticalDice() {
        if (this.dice[0] == this.dice[1] && this.dice[0] == pgame.data.betColor) {
            return [1, 0, 2]
        }
        else if (this.dice[0] == this.dice[2] && this.dice[0] == pgame.data.betColor) {
            return [2, 0, 1]
        }
        else if (this.dice[1] == this.dice[2] && this.dice[1] == pgame.data.betColor) {
            return [1, 2, 0]
        }
        else {
            return [0, 1, 2]
        }
    }

    nearMissEffect(target: any) {
        this.cnvDice.tweens.create("nearMissRoll", target,
            {
                scale: { x: 2.5, y: 2.5 }
            },
            3000).start().on('end', () => {
                console.log("Stop")
                this.cnvDice.tweens.create("nearMissRollBack", target,
                    {
                        scale: { x: 2, y: 2 }
                    }, 1000).start()
            })
    }

    twBonusCelebration() {
        console.log('Bonus Celebration')

        let tw1 = this.cnvDice.tweens.create("bonusDice1MoveUp", this.cnvDice.spDice[0], {
            position: { y: -200 }
        }, 500).start().easing(Easing.Cubic.InOut).on('end', () => {
            this.cnvDice.tweens.create("bonusDice1Scale", this.cnvDice.spDice[0], {
                scale: { x: 2.5, y: 2.5 }
            }, 1000).start().easing(Easing.Elastic.InOut).on('end', () => {
                this.cnvDice.tweens.create("bonusDice1Fly", this.cnvDice.spDice[0], {
                    radian: PI_2 / -8,
                    position: { x: -400, y: -300 }
                }, 500).start()
            })
        })

        return tw1
    }
}