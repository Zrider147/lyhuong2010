import { autoPlayGame } from "@g/states/SStart";
import { Easing, PivotPoint, c, vb, vbButtonContainer, vbImage, vbImageButton, vbPrimiLabelButton, vbRoundedRectangle, vbText } from "@vb/index";
import { vbContainer } from "@vb/vbContainer";

export class SidePanel extends vbContainer {

    cnvAutoPlay: vbButtonContainer
    // btnAutoPlay: vbImageButton

    // txtAutoPlay: vbText
    turboIsOn = false;
    autoPlayTweens: any;
    stopBonus = false;
    cnvAutoPlayList: vbContainer;
    isShowAutoplay: boolean = false;

    constructor() {
        super()

        // --------------------- AUTOPLAY --------------------------
        this.cnvAutoPlay = new vbButtonContainer();
        // this.btnAutoPlay = new vbImageButton("bet_amount")
        // this.btnAutoPlay.pivotRule = PivotPoint.Center;
        // this.txtAutoPlay = new vbText({
        //     key: "autoplay", fill: c.White, size: 15, weight: "600", font: "Mulish",
        // });
        // this.txtAutoPlay.pivotRule = PivotPoint.Center;
        // this.txtAutoPlay.position.set(0, 60);

        // this.cnvAutoPlay.addObj(this.btnAutoPlay)
        //     .addObj(this.txtAutoPlay, 0, "txtNumAuto")


        this.cnvAutoPlayList = new vbContainer();

        this.addObj(this.cnvAutoPlayList, 0, "cnvAutoPlayList")
            .addObj(this.cnvAutoPlay, 0, "cnvAutoPlay")
    }
}
