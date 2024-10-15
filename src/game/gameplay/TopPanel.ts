import { TextCurrencyFormat, TextSmallTitleFormat } from "@g/Ultis/TextFormats";
import { PivotPoint, vbImage, vbSpineButton, vbText } from "@vb/index";
import { vbContainer } from "@vb/vbContainer";

export class Credit extends vbContainer {
    imgCreditFrame: vbImage;
    txtCreditValue: vbText;
    txtCreditTitle: vbText;

    constructor() {
        super();

        this.imgCreditFrame = new vbImage("bet_amount");
        this.imgCreditFrame.pivotRule = PivotPoint.Center;
        this.imgCreditFrame.scale.set(0.8, 1)

        this.txtCreditValue = new vbText(TextCurrencyFormat(9999999))
        this.txtCreditValue.pivotRule = PivotPoint.Center
        this.txtCreditValue.fitType = 'Shrink'
        this.txtCreditValue.setFitBox(260, 100)
        this.txtCreditValue.position.set(0, 2)

        this.txtCreditTitle = new vbText(TextSmallTitleFormat('credit'))
        this.txtCreditTitle.pivotRule = PivotPoint.Center
        this.txtCreditTitle.fitType = 'Shrink'
        this.txtCreditTitle.setFitBox(120, 100)
        this.txtCreditTitle.position.set(0, -42)

        this
            .addObj(this.imgCreditFrame, 0, "imgCreditFrame")
            .addObj(this.txtCreditValue, 0, "txtCreditValue")
            .addObj(this.txtCreditTitle, 0, "txtCreditTitle")
    }
}

export class TopPanel extends vbContainer {
    cnvCredit = new Credit;
    spGameTitle: vbSpineButton;

    constructor() {
        super();

        this.cnvCredit.pivotRule = PivotPoint.Center;

        this.spGameTitle = new vbSpineButton("spTitle");
        this.spGameTitle.state.setAnimation(0, "animation", true);

        this
            .addObj(this.cnvCredit, 0, "cnvCredit")
            .addObj(this.spGameTitle, 0, "spGameTitle")
    }
}