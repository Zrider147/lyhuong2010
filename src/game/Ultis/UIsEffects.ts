import { c, vb } from "@vb/index";

export function SetDefaultButtonEffect(target: any[]) {
    for (let i = 0; i < target.length; i++) {
        target[i].defaultHoverEffect(c.White, 0.3, vb.shared.colorFilter)
            .defaultClickEffect(c.Black, 0.3, vb.shared.colorFilter)
    }
}