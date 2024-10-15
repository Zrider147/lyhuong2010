import type { vbRequestHandler, vbWebConnector } from "@vbw/index";
import { vbText } from "@vb/index";
import { i18n } from "../../i18n";

export function getSendBetGameData() {
    let cheatRND: string | undefined;
    if (API.params.get('cheatRND') !== null) {
        cheatRND = (pgame.interact.isKeyDown('p') || pgame.interact.isKeyDown('P')) ? API.params.get('cheatRND')! : undefined;
    }
    else if (API.params.get('cheat') !== null) {
        cheatRND = pgame.data.cheatRND?.toString();
    }

    return {
        state: cheatRND !== undefined ? 'cheatbet' : 'bet',
        bet: pgame.data.totalBet,
        debug: cheatRND ?? '',
        pick: pgame.data.betColor,
        dice: [] as number[],
        isBonus: false as boolean,
        bonusDice: 255 as number,

    } as const;
}

export function getSendStepGameData() {
    return {};
}

export function setStandaloneStartGameData() {
    const pdata = pgame.data;
    pdata.realCredits = 3000_00;
    pdata.setBetList(100, 0, 10000);
    pdata.defaultBet = 100;
}

export function popTextBoth(durationMS: number, text: string) {
    if (API.toggleCanvas.value) {
        pgame.front.popMsg.setText(text);
        pgame.front.popMsg.pop(durationMS, 500).start(true);
    }
    else {
        API.showErrorMessage(text);
        // window.setTimeout(() => API.showErrorMessage(null), durationMS + 500);
    }
}
export function popLocalizedBoth(durationMS: number, key: string, ...args: (string | number)[]) {
    if (API.toggleCanvas.value) {
        if (args.length == 0)
            pgame.front.popMsg.txtKey(key);
        else
            pgame.front.popMsg.txtKeyFormat(key, ...args);
        pgame.front.popMsg.pop(durationMS, 500).start(true);
    }
    else {
        if (args.length == 0)
            API.showErrorMessage(vbText.getByKey(key));
        else
            API.showErrorMessage(vbText.getByKeyFormat(key, ...args));
        // window.setTimeout(() => API.showErrorMessage(null), durationMS + 500);
    }
}


export function setConnectorCallbacks(connector: vbWebConnector) {
    connector.onRetry = (nRemainTry) => {
        API.showErrorMessage(i18n.global.t("message.websocketCannotRetry") + nRemainTry);
    };

    connector.onFailed = () => {
        API.showErrorMessage(i18n.global.t("message.wesocketFail"));
    };

    connector.onSendFailed = (req, reason) => {
        let text = 'onSendFailed';
        if (reason == 'retry-limit')
            text = `cannotRetry`;
        else if (reason == 'idle') {
            text = 'expireSession';
            popLocalizedBoth(2000, text);
            window.setInterval(() => popLocalizedBoth(2000, text), 4000);
            return;
        }
        popLocalizedBoth(4000, text);
    };

    connector.onRecvException = (req, err) => {
        let e = err as Error;
        API.showErrorMessage(e.message, e.stack);
    };
}

export function setRequestHandlerCallbacks(request: vbRequestHandler) {
    request.onSend = (req) => {
        // pop up a wait response message occasionally
        req.setInterval(() => {
            popLocalizedBoth(2000, "waitResponse");
        }, 4000);
        // after timeout, pop up another message
        req.setTimeout(() => {
            req.setInterval(() => {
                popLocalizedBoth(2000, `requestTimeout`);
            }, 4000);
        });
    };

    request.onRecvAny = (req) => {
        req.clearTimeout();
        req.clearInterval();
        if (!API.toggleCanvas.value) {
            API.showErrorMessage(null); // if we receive anything, turn off error showing
        }
    };

    request.onRecvInvalid = (req, msg) => {
        let text = `${req.name} Request received an invalid object`;
        console.error(text);
        console.log(msg);
        API.showErrorMessage(i18n.global.t("message.recInvalidObj"));
    };
}