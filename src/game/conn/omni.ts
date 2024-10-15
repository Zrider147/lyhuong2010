import NextDigital from "./NextDigital";
import { setConnectorCallbacks } from "./callbacks";
import type { vbWebConnector } from "@vbw/index";

export function createOmniConnector() {
    let connector: vbWebConnector;
    connector = NextDigital.createConnector();

    setConnectorCallbacks(connector);
    return connector;
}