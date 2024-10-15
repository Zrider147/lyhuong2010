/* eslint-disable @typescript-eslint/no-explicit-any */
import type { default as Ajv, ValidateFunction } from 'ajv';
// JSON Schema draft 7 by default?
import type { SomeJSONSchema } from 'ajv/dist/types/json-schema';


type vbRequestState =
    'IDLE'
    | 'REQUESTED'
    | 'PENDING'
    | 'SUCCESS'
    | 'ERROR';

type SendRecvDType = { S:any, R:any };
type SendRecvSchema = { S:SomeJSONSchema, R:SomeJSONSchema };


abstract class vbRequestHandler<DATA extends SendRecvDType = SendRecvDType, ERROR = any> {
    readonly name: string;
    /** Validate received data by JSON Schema */
    readonly validate: ValidateFunction<DATA['R']>;
    /** Validate received data as error message */
    readonly validateError: ValidateFunction<ERROR>;
    /** number of attempts to send request for this time, managed by connector */
    nTried = 0;
    /** number of total attempts, specified by error handling */
    nTotalTry = 1;
    /** timeout in milliseconds used for setTimeout */
    timeoutMS = 15_000;

    protected _state: vbRequestState;
    protected _data: DATA['S'];
    protected _timeoutID = -1;
    protected _intervalID = -1;

    /** Called when the request is sent, including retries */
    onSend: (req: vbRequestHandler, nTried: number) => void = globalThis.doNothing;
    /** Always dispatched when any message received */
    onRecvAny: (req: vbRequestHandler, msg: any) => void = globalThis.doNothing;
    /**
     * Successfully received a valid JSON. \
     * For STANDALONE mode, data is an empty object, you must get the data elsewhere
     */
    onRecvSuccess: (req: vbRequestHandler, data: DATA['R']) => void = globalThis.doNothing;
    /** Successfully received an error JSON */
    onRecvError: (req: vbRequestHandler, data: ERROR) => void = globalThis.doNothing;
    /** Received JSON is incompatible with either valid or error schema */
    onRecvInvalid: (req: vbRequestHandler, msg: string) => void = globalThis.doNothing;

    /** Change connector's behaviors if specified */
    testMode: {
        /** Directly uses this test string as response instead of actually send an request. */
        recvMsg?: string,
        /** Extra delay in MS for sending request */
        sendLatency?: number
    } = {};

    constructor(
        name: string, schema: SendRecvSchema, errorSchema: SomeJSONSchema, ajv: Ajv) {
        this.name = name;
        this.validate = ajv.compile<DATA['R']>(schema.R);
        this.validateError = ajv.compile<ERROR>(errorSchema);
        this._state = 'IDLE';
        this._data = undefined as unknown as DATA['S'];
    }

    /** managed by connector */
    get state() { return this._state; }
    set state(s: vbRequestState) {
        this._state = s;
        if (s == 'IDLE') {
            // reset try count
            this.nTried = 0;
            this.nTotalTry = 1;
        }
    }

    /**
     * Trigger a timeout callback after `timeoutMS`.
     * Automatically clear previous timeout to ensure only one is running.
     */
    setTimeout(callback: FType.AnyVoid) {
        window.clearTimeout(this._timeoutID);
        this._timeoutID = window.setTimeout(callback, this.timeoutMS);
    }
    /**
     * Trigger an interval callback every `intervalMS`.
     * Automatically clear previous interval to ensure only one is running.
     */
    setInterval(callback: FType.AnyVoid, intervalMS: number) {
        window.clearInterval(this._intervalID);
        this._intervalID = window.setInterval(callback, intervalMS);
    }
    clearTimeout() {
        window.clearTimeout(this._timeoutID);
    }
    clearInterval() {
        window.clearInterval(this._intervalID);
    }

    get dataToSend() { return this._data; }
    prepareSendData() {}
}


/** (IDK ???) Though the base class is generic, we usually use these requests */
type PresetRequestHandlers = {
    'startGame': vbRequestHandler,
    'bet': vbRequestHandler,
    'step': vbRequestHandler,
    'updateBalance': vbRequestHandler
}
type PresetGameDataType = {
    StartGame: Omit<SendRecvDType, 'S'>,
    Bet: SendRecvDType,
    Step: SendRecvDType
};

export {
    vbRequestHandler,
    type PresetRequestHandlers,
    type PresetGameDataType
};