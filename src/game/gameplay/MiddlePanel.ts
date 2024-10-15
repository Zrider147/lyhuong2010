import { DrawCircle } from "@g/Ultis/DrawShapes";
import { TextBtnFormat, TextNotiFormat, TextNumberFormat } from "@g/Ultis/TextFormats";
import { vbImage, PivotPoint, vbSpineObject, vbImageLabelButton, vbPrimiLabelButton, vbText, vbImageButton, c } from "@vb/index";
import { vbContainer } from "@vb/vbContainer";
import { Vector2 } from "pixi-spine";

export class ColorsBoard extends vbContainer {
    imgColorsFrame: vbImage;
    imgNotiPanel: vbImage;
    txtNoti: vbText;
    btnColors: vbImageButton[] = []
    colorsValue = [1, 2, 3, 4, 5, 6]

    constructor() {
        super();

        this.imgColorsFrame = new vbImage('Board')
        this.imgColorsFrame.pivotRule = PivotPoint.Center
        this.imgColorsFrame.scale.set(1.38)

        this.imgNotiPanel = new vbImage('NotiPanel')
        this.imgNotiPanel.pivotRule = PivotPoint.Center
        this.imgNotiPanel.position.set(0, -160)
        this.imgNotiPanel.scale.set(1.38, 1.5)

        this.txtNoti = new vbText(TextNotiFormat('', 'noColor'))
        this.txtNoti.pivotRule = PivotPoint.Center;
        this.txtNoti.position.set(0, -160)
        this.txtNoti.fitType = 'Shrink'
        this.txtNoti.setFitBox(600, 40)

        for (let i = 0; i < 6; i++) {
            this.btnColors[i] = new vbImageButton('chip_1$')
            this.btnColors[i].pivotRule = PivotPoint.Center
            if (i < 3) {
                this.btnColors[i].position.set(i * 220 - 220, -60)
            } else {
                this.btnColors[i].position.set(i * 220 - 880, 100)
            }


            this.addObj(this.btnColors[i], 1)
        }

        this
            .addObj(this.imgColorsFrame, 0)
            .addObj(this.imgNotiPanel, 0)
            .addObj(this.txtNoti, 1)
    }

    highlightColor(btnID: number) {
        this.btnColors[btnID].setTex('chip_5$')

        for (let btn of this.btnColors) {
            if (this.btnColors.indexOf(btn) != btnID) {
                btn.setTex('chip_1$')
            }
        }
    }
}

export class Dice extends vbContainer {
    spDice: vbSpineObject[] = []
    dicePos: Vector2[] = [new Vector2(-100, -100),
    new Vector2(0, 0),
    new Vector2(100, -100)
    ]

    constructor() {
        super()

        for (let i = 0; i < 3; i++) {
            this.spDice[i] = new vbSpineObject('sp_dice')
            this.spDice[i].state.setAnimation(0, 'p_1', false)
            this.spDice[i].position = this.dicePos[i]
            this.spDice[i].scale.set(2)

            if (i == 1) {
                this.addObj(this.spDice[i], 1)
            }
            else {
                this.addObj(this.spDice[i], 0)
            }
        }
    }
}

export class Autoplay extends vbContainer {
    btnAuto: vbImageLabelButton
    btnAutoRounds: vbPrimiLabelButton[] = []
    autoRounds: number[] = [10, 25, 50, 100]
    isOpen: boolean = false

    constructor() {
        super()

        this.btnAuto = new vbImageLabelButton('bt_autoplay')
        this.btnAuto.addCenteredTxt(TextBtnFormat('autoplay'), 16)
        this.btnAuto.pivotRule = PivotPoint.Center
        this.btnAuto.txtFitType('Shrink')
        this.btnAuto.txtFitBox(0.9)
        this.btnAuto.setOnClick(() => { this.isOpen === false ? this.twOpenAutoplay() : this.twCloseAutoplay() })

        for (let i = 0; i < 4; i++) {
            this.btnAutoRounds[i] = new vbPrimiLabelButton(DrawCircle())
            this.btnAutoRounds[i].addCenteredTxt(TextNumberFormat(this.autoRounds[i]))
            this.btnAutoRounds[i].pivotRule = PivotPoint.Center
            this.btnAutoRounds[i].txtFitType('Shrink')
            this.btnAutoRounds[i].txtFitBox(1)
            this.btnAutoRounds[i].scale.set(0)

            this.addObj(this.btnAutoRounds[i])
        }

        this
            .addObj(this.btnAuto, 0)
    }

    twOpenAutoplay() {
        this.isOpen = true

        for (let i = 0; i < 4; i++) {
            this.btnAutoRounds[i].scale.set(0)
            if (pgame.currStyle.name === 'landscape') {
                this.tweens.create("openAutoplay" + i, this.btnAutoRounds[i],
                    {
                        alpha: 1,
                        position: {
                            x: this.btnAuto.position.x - 180 + i * 120,
                            y: this.btnAuto.position.y - 100
                        },
                        scale: { x: 1, y: 1 }
                    },
                    500).delay(i * 100).start()
            }
            else {
                this.tweens.create("openAutoplay" + i, this.btnAutoRounds[i],
                    {
                        alpha: 1,
                        position: {
                            x: this.btnAuto.position.x - 540 + i * 120,
                            y: this.btnAuto.position.y
                        },
                        scale: { x: 1, y: 1 }
                    },
                    500).delay(i * 100).start()
            }
        }
    }



    twCloseAutoplay(duration: number = 500, isSwitchView: boolean = false) {
        this.isOpen = false

        for (let i = 0; i < 4; i++) {
            if (pgame.currStyle.name === 'landscape') {
                this.tweens.create("openAutoplay" + i, this.btnAutoRounds[i],
                    {
                        alpha: 0,
                        position: {
                            x: this.btnAuto.position.x,
                            y: this.btnAuto.position.y
                        },
                        scale: { x: 0, y: 0 }
                    },
                    duration).delay((i) * 100).start().on('end', () => {
                        if (isSwitchView) {
                            setTimeout(() => {
                                this.twOpenAutoplay()
                            }, 200)
                        }
                    })
            }
            else {
                this.tweens.create("openAutoplay" + i, this.btnAutoRounds[i],
                    {
                        alpha: 0,
                        position: {
                            x: this.btnAuto.position.x,
                            y: this.btnAuto.position.y
                        },
                        scale: { x: 0, y: 0 }
                    },
                    duration).delay((3 - i) * 100).start().on('end', () => {
                        if (isSwitchView) {
                            setTimeout(() => {
                                this.twOpenAutoplay()
                            }, 200)
                        }
                    })
            }
        }
    }
}

export class MiddlePanel extends vbContainer {
    cnvColorsBoard: ColorsBoard = new ColorsBoard
    cnvDice: Dice = new Dice
    cnvAuto: Autoplay = new Autoplay

    constructor() {
        super()

        this.cnvColorsBoard.pivotRule = PivotPoint.Center
        this.cnvDice.pivotRule = PivotPoint.Center
        this.cnvAuto.pivotRule = PivotPoint.Center

        this
            .addObj(this.cnvColorsBoard, 0, 'cnvColorsBoard')
            .addObj(this.cnvDice, 0, 'cnvDice')
            .addObj(this.cnvAuto, 0, 'cnvAuto')
    }
}