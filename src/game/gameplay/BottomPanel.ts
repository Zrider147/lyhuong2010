import { TextBtnFormat, TextCurrencyFormat, TextSmallTitleFormat } from "@g/Ultis/TextFormats";
import { PivotPoint, vbContainer, vbImage, vbImageLabelButton, vbText, } from "@vb/index";

export class BetCanvas extends vbContainer {
    imgBetFrame: vbImage;
    txtBetTitle: vbText;
    txtBetValue: vbText;

    btnPlay: vbImageLabelButton;
    btnReset: vbImageLabelButton;

    btnChips: vbImageLabelButton[] = []
    configBetList = [100, 200, 500, 1000, 2000]
    chipsList = [
        'chip_1$',
        'chip_2$',
        'chip_5$',
        'chip_10$',
        'chip_20$'
    ]

    constructor() {
        super();

        this.imgBetFrame = new vbImage("bet_amount")
        this.imgBetFrame.pivotRule = PivotPoint.Center

        this.txtBetTitle = new vbText(TextSmallTitleFormat('bet'))
        this.txtBetTitle.pivotRule = PivotPoint.Center
        this.txtBetTitle.fitType = 'Shrink'
        this.txtBetTitle.setFitBox(64, 100)
        this.txtBetTitle.position.set(0, -48)

        this.txtBetValue = new vbText(TextCurrencyFormat(99999999))
        this.txtBetValue.pivotRule = PivotPoint.Center
        this.txtBetValue.fitType = 'Shrink'
        this.txtBetValue.setFitBox(120, 100)
        this.txtBetValue.position.set(0, 0)

        this.btnPlay = new vbImageLabelButton("bt_play_on")
        this.btnPlay.addCenteredTxt(TextBtnFormat('play'))
        this.btnPlay.txtFitType('Shrink')
        this.btnPlay.txtFitBox(1, 1)
        this.btnPlay.pivotRule = PivotPoint.Center
        this.btnPlay.position.set(270, 0)

        this.btnReset = new vbImageLabelButton("bt_cancel_on")
        this.btnReset.addCenteredTxt(TextBtnFormat('reset'))
        this.btnReset.txtFitType('Shrink')
        this.btnReset.txtFitBox(1, 1)
        this.btnReset.pivotRule = PivotPoint.Center
        this.btnReset.position.set(-270, 0)

        for (let i = 0; i < 5; i++) {
            this.btnChips[i] = new vbImageLabelButton(this.chipsList[i])
            this.btnChips[i].addCenteredTxt(TextCurrencyFormat(this.configBetList[i]), 0, -5)
            this.btnChips[i].txtFitType('Shrink')
            this.btnChips[i].txtFitBox(0.7, 1)
            this.btnChips[i].pivotRule = PivotPoint.Center

            this.addObj(this.btnChips[i])
        }

        this
            .addObj(this.imgBetFrame, 0, 'imgBetFrame')
            .addObj(this.txtBetTitle, 0, "txtBetTitle")
            .addObj(this.txtBetValue, 0, "txtBetValue")
            .addObj(this.btnPlay, 0, 'btnPlay')
            .addObj(this.btnReset, 0, 'btnReset')
    }
}

export class BottomPanel extends vbContainer {
    cnvBet: BetCanvas = new BetCanvas

    constructor() {
        super()

        this.cnvBet.pivotRule = PivotPoint.Center


        this
            .addObj(this.cnvBet, 0, 'cnvBet')
    }
}
