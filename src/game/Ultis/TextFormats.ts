import { type vbTextInitOptions, c } from "@vb/index"
import { fmt } from "src/shared/NumberFormat";

export function TextSmallTitleFormat(key: string) {
    let txtFormat: vbTextInitOptions;

    txtFormat = {
        key: key, fill: [c.White, c.Yellow], size: 64, weight: "100",
        font: "Impact", stroke: c.DarkRed, strokeThickness: 10, lineJoin: "round"
    }

    return txtFormat;
}

export function TextCurrencyFormat(value: number) {
    let txtFormat: vbTextInitOptions;

    txtFormat = {
        text: fmt.currency(value), fill: c.White, size: 80, weight: "100",
        font: "Impact", stroke: c.Black, strokeThickness: 5, lineJoin: "round"
    }

    return txtFormat;
}

export function TextBtnFormat(key: string) {
    let txtFormat: vbTextInitOptions;

    txtFormat = {
        key: key, fill: c.White, size: 28, weight: "100",
        font: "Aachen Bold", stroke: c.Black, strokeThickness: 5, lineJoin: "round"
    }

    return txtFormat;
}

export function TextNumberFormat(value: number) {
    let txtFormat: vbTextInitOptions;

    txtFormat = {
        text: value, fill: c.White, size: 32, weight: "100",
        font: "Aachen Bold", stroke: c.Black, strokeThickness: 5, lineJoin: "round"
    }

    return txtFormat;
}

export function TextNotiFormat(text: string = "Noti goes to here", key: string) {
    let txtFormat: vbTextInitOptions;

    txtFormat = {
        text: text, key: key, fill: [c.White, c.Gold], size: 164, weight: "100",
        font: "Aachen Bold", stroke: c.Black, strokeThickness: 5, lineJoin: "round"
    }

    return txtFormat;
}