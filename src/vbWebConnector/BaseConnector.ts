/* eslint-disable @typescript-eslint/no-explicit-any */
import type Ajv from 'ajv';
import type { PresetRequestHandlers, vbRequestHandler } from './BaseRequestHandler';


/**
 * Different from the readyState of WebSocket
 * - `0` No connection at all
 * - `CONNECTING` WebSocket is initializing the connection (with retry)
 * - `NORMAL` Connection is established and is working normally
 * - `CLOSED` Either closed or failed
 */
type vbConnectorState =
    '0'
    | 'CONNECTING'
    | 'NORMAL'
    | 'CLOSED';

export let ws: any;
abstract class vbWebConnector<M extends Record<string, vbRequestHandler> = PresetRequestHandlers> {
    readonly ajv: Ajv;
    readonly handlers: M;

    protected _state: vbConnectorState = '0';
    protected _ws = undefined as unknown as WebSocket;
    idleMS = 599_000;
    protected _isIdle = false;
    protected _idleTimeoutID = -1;

    /** WebSocket connection is established */
    onOpen: (ws: WebSocket) => void = globalThis.doNothing;
    /** Everytime when websocket tries to connect */
    onRetry: (nRemainTry: number) => void = globalThis.doNothing;
    /** WebSocket connection failed */
    onFailed: () => void = globalThis.doNothing;

    /**
     * For some reason the request cannot be sent:
     * - reason "retry-limit": The request exceeds the total retry limit
     * - reason "idle": Client has stayed idle for more than `idleMS`
     */
    onSendFailed: (req: vbRequestHandler, reason: string) => void = globalThis.doNothing;
    /** Received a message but exception occurred while processing */
    onRecvException: (req: vbRequestHandler, err: unknown) => void = globalThis.doNothing;

    constructor(ajv: Ajv, handlers: M) {
        this.ajv = ajv;
        this.handlers = handlers;
    }
    get state() { return this._state; }

    /**
     * Create the socket and try to initialize connection.
     * 
     * @param [timeoutMS] the timeout in milliseconds for opening the websocket
     * @param [nRetry] the number of times socket connection should be retried.
     */
    connect(timeoutMS: number, nRetry: number) {
        if (this._state == 'NORMAL') return;
        if (STANDALONE) {
            window.setTimeout(() => {
                this._state = 'NORMAL';
                this.onOpen(this._ws);
            }, 100);
            return;
        }
        this._state = 'CONNECTING';
        this.initWebsocket(this.getWebSocketURL(), timeoutMS, nRetry).then(
            (websocket) => {
                this._ws = websocket;
                this._state = 'NORMAL';
                this.onOpen(websocket);
                this.setWebSocketCallbacks(websocket);

                ws = this._ws
            },
            () => {
                this._state = 'CLOSED';
                this.onFailed();
            }
        );
    }
    protected getWebSocketURL() { return ''; }
    protected setWebSocketCallbacks(ws: WebSocket) {
        ws.onopen = null;
        ws.onclose = () => {
            this._state = 'CLOSED';
            // TODO?
        };
        ws.onerror = () => {
            this._state = 'CLOSED';
            // TODO?
        }
        ws.onmessage = (event) => {
            this._handleRecv(event.data);
        }
    }

    /**
     * Prepare data and send the request if it's ready,
     * if not, has to wait for other requests to be completed.
     * @note Request handler state will be set to `REQUESTED` if it's not `PENDING`,
     *       and only `IDLE` handler will call `prepareSendData`.
     */
    request<K extends keyof M>(name: K) {
        const req = this.handlers[name];
        const currState = req.state;

        if (currState != 'PENDING') {
            req.state = 'REQUESTED';
        }
        if (currState == 'IDLE') {
            req.prepareSendData();
            this.sendRequestIfAny();
        }
    }

    protected _handleRecv(msg: any) {
        // whenever client receives something, restart idle timer
        window.clearTimeout(this._idleTimeoutID);
        this._idleTimeoutID = window.setTimeout(() => this._isIdle = true, this.idleMS);

        // only one pending request at a time, assume it's the one for this received message
        const req = this.getPending();
        if (req === null) {
            // TODO? No pending request? Maybe duplicate?
            return;
        }
        // no matter what, at least it receives a message, so connector's state backs to normal
        this._state = 'NORMAL';
        req.onRecvAny(req, msg);

        if (msg) {
            this._parseRecv(req, msg);
        }
        else {
            // no message given, maybe it's standalone
            req.state = 'SUCCESS';
            // for standalone client, just emit onReceive event and let it process locally
            req.onRecvSuccess(req, {});
        }

        // callbacks may need retry or doing other things which alters request state
        if (req.state == 'SUCCESS')
            req.state = 'IDLE';
        // finally, send other requests
        this.sendRequestIfAny();
    }
    protected _parseRecv(req: vbRequestHandler, msg: string) {
        try {
            const data = JSON.parse(msg);
            if (req.validate(data)) {
                req.state = 'SUCCESS';
                // reset the try count when it's a success
                req.nTotalTry = 1;
                req.onRecvSuccess(req, data);
            }
            else if (req.validateError(data)) {
                req.state = 'ERROR';
                req.onRecvError(req, data);
            }
            else {
                req.state = 'ERROR';
                req.onRecvInvalid(req, msg);
            }
        }
        catch (err) {
            req.state = 'ERROR';
            this.onRecvException(req, err);
        }
    }

    /** Send a request with "REQUESTED" state (if any) as long as there's no other pending */
    sendRequestIfAny() {
        if (this.getPending() !== null)
            return;
        const req = this.getRequested();
        if (req !== null)
            this._sendRequest(req);
    }
    protected _sendRequest(req: vbRequestHandler) {
        if (!this._checkIfCanSend(req)) {
            req.state = 'ERROR';
            return;
        }
        // whenever client sends something, stop idle timer
        window.clearTimeout(this._idleTimeoutID);

        req.nTried++;
        req.state = 'PENDING';
        req.onSend(req, req.nTried);

        window.setTimeout(() => {
            if (STANDALONE || req.testMode.recvMsg !== undefined) {
                this._handleRecv(req.testMode.recvMsg);
            }
            else {
                this._ws.send(JSON.stringify(req.dataToSend));
            }
        }, req.testMode.sendLatency ?? 0);
    }
    protected _checkIfCanSend(req: vbRequestHandler) {
        if (req.nTried >= req.nTotalTry) {
            this.onSendFailed(req, 'retry-limit'); // WTF
            return false;
        }
        else if (this._isIdle) {
            this.onSendFailed(req, 'idle');
            return false;
        }
        return true;
    }

    /**
     * vbWebConnector is supposed to only have one pending request at a time
     * @returns A pending request or null
     */
    getPending() {
        for (const req of Object.values(this.handlers)) {
            if (req.state == 'PENDING')
                return req;
        }
        return null;
    }
    /** Get one request waiting to be sent based on some priority rules */
    getRequested() { return null as unknown as (vbRequestHandler | null); }

    /**
    * inits a websocket by a given url, returned promise resolves with initialized websocket, rejects after failure/timeout.
    * https://stackoverflow.com/questions/29881957/websocket-connection-timeout
    */
    protected initWebsocket(url: string, timeoutMS: number, nRetry: number) {
        let hasReturned = false;
        const promise = new Promise<WebSocket>((resolve, reject) => {
            const retryOrReject = () => {
                if (nRetry <= 0) {
                    reject();
                } else if (!hasReturned) {
                    nRetry--;
                    hasReturned = true;
                    console.log('retrying connection to websocket! url: ' + url + ', remaining retries: ' + nRetry);
                    this.onRetry(nRetry);
                    this.initWebsocket(url, timeoutMS, nRetry).then(resolve, reject);
                }
            };

            setTimeout(() => {
                if (!hasReturned) {
                    console.log('opening websocket timed out: ' + url);
                    retryOrReject();
                }
            }, timeoutMS);

            const websocket = new WebSocket(url);
            websocket.onopen = () => {
                if (hasReturned) {
                    websocket.close();
                } else {
                    console.log('websocket to opened! url: ' + url);
                    hasReturned = true;
                    resolve(websocket);
                }
            };
            websocket.onclose = () => {
                console.warn('websocket closed! url: ' + url);
                retryOrReject();
            };
            websocket.onerror = () => {
                console.warn('websocket error! url: ' + url);
                retryOrReject();
            };
        });
        return promise;
    }
}


export {
    vbWebConnector
};