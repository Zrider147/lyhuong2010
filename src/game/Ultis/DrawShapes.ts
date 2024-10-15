import { vbRoundedRectangle, c } from "@vb/index";
import { Color } from "pixi.js";

export function DrawCircle(fillValue: number = 0.8) {
    return new vbRoundedRectangle(100, 100, 100).fill(c.Black, fillValue);
}