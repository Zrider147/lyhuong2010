import { Ajv, NextDigital, vbRequestHandler } from '@vbw/index';
import { type GameDataType, gameDataSchema, CE } from '@g/base/ClientEngine';
import { getSendBetGameData, getSendStepGameData, popTextBoth, setRequestHandlerCallbacks, setStandaloneStartGameData } from './callbacks';

type DType = NextDigital.GetDataType<GameDataType>;
const Schema = NextDigital.getJSONSchema(gameDataSchema);


class StartGameRequest extends vbRequestHandler<DType['StartGame'], DType['Error']> {
    constructor(ajv: Ajv) {
        super('StartGame', Schema.StartGame, Schema.Error, ajv);
        this.onRecvError = handleError;
        setRequestHandlerCallbacks(this);
    }
    prepareSendData() {
        let conn = globalThis.conn as NextDigital.Connector;
        this._data = {
            action: 'start',
            sessionId: conn.sessionId,
            sessionToken: conn.sessionToken
        }
    }
    onRecvSuccess = (req: vbRequestHandler, data: DType['StartGame']['R']) => {
        const loadState = pgame.state('Loading');
        if (!loadState.isStartRequestReceived) {
            loadState.isStartRequestReceived = true;
            if (STANDALONE) {
                setStandaloneStartGameData();
                return;
            }

            const pdata = pgame.data;
            pdata.realCredits = data.credits;
            const betConfig = data.config.bet;
            if (betConfig.default)
                pdata.defaultBet = betConfig.default;
            if (betConfig.type == 'list') {
                pdata.setBetList(betConfig.list);
            }
            else {
                pdata.setBetList(betConfig.step, betConfig.min, betConfig.max);
            }

        }
        else {
            // do nothing
        }
    }
}

class BetRequest extends vbRequestHandler<DType['Bet'], DType['Error']> {
    constructor(ajv: Ajv) {
        super('Bet', Schema.Bet, Schema.Error, ajv);
        this.onRecvError = handleError;
        setRequestHandlerCallbacks(this);
        // this.testMode.sendLatency = 6000;
        // this.testMode.recvMsg = '{"code":"BetException", "message":"Bet could not be completed"}';
    }
    prepareSendData() {
        let conn = globalThis.conn as NextDigital.Connector;
        this._data = {
            action: 'bet',
            sessionId: conn.sessionId,
            sessionToken: conn.sessionToken,
            bet: pgame.data.totalBet,
            gameData: getSendBetGameData()
        }
    }
    onRecvSuccess = (req: vbRequestHandler, data: DType['Bet']['R']) => {
        const pdata = pgame.data;
        if (STANDALONE) {
            pgame.ce.getDemoExtraction(pdata.totalBet);
            pdata.realCredits += pgame.ce.totalwin;
        }
        else {
            pgame.ce.recvBetGameData(data.gameData);
            pdata.realCredits = data.credits;
        }
    }
}

class StepRequest extends vbRequestHandler<DType['Step'], DType['Error']> {
    constructor(ajv: Ajv) {
        super('Step', Schema.Step, Schema.Error, ajv);
        this.onRecvError = handleError;
        setRequestHandlerCallbacks(this);
    }
    prepareSendData() {
        let conn = globalThis.conn as NextDigital.Connector;
        this._data = {
            action: 'step',
            sessionId: conn.sessionId,
            sessionToken: conn.sessionToken,
            gameData: getSendStepGameData()
        }
    }
    onRecvSuccess = (req: vbRequestHandler, data: DType['Step']['R']) => {
        if (STANDALONE) {

        }
        else {

        }
    }
}

class UpdateBalanceRequest extends vbRequestHandler<DType['UpdateBalance'], DType['Error']> {
    constructor(ajv: Ajv) {
        super('UpdateBalance', Schema.UpdateBalance, Schema.Error, ajv);
        this.onRecvError = handleError;
        setRequestHandlerCallbacks(this);
    }
    prepareSendData() {
        let conn = globalThis.conn as NextDigital.Connector;
        this._data = {
            action: 'update',
            sessionId: conn.sessionId,
            sessionToken: conn.sessionToken
        }
    }
    onRecvSuccess = (req: vbRequestHandler, data: DType['UpdateBalance']['R']) => {
        if (STANDALONE) {

        }
        else {

        }
    }
}

function handleError(req: vbRequestHandler, data: DType['Error']) {
    const retry = () => {
        // keep retrying
        req.state = 'REQUESTED';
        popTextBoth(2000, `Retrying ${req.name} request... (${req.nTried + 1}/${req.nTotalTry})`);
    }

    switch (data.code) {
        case 'StartException': {
            // Start new round again. After 3 further non successful attempts, show error message
            if (req.nTried <= 1) {
                // it is the first attempt of this retry, start retry
                req.nTotalTry = (req === conn.handlers.startGame) ? 4 : 3;
                conn.request('startGame');
                return;
            }
            else if (req.nTried < req.nTotalTry) {
                retry(); return;
            }
            // no more retry
            if (pgame.state('Loading').isStartRequestReceived) {
                // error happens during the game, just pop the error
                break;
            }
            else {
                // error happens on start, cannot proceed
                API.showErrorMessage(`${data.code}: ${data.message}`);
                return;
            }
        }
        case 'StepException': {
            // Step again until 3 times, then start new round
            break;
        }
        case 'BetException': {
            // Show error message and restore game status before bet request.
            pgame.data.restore();
            break;
        }
        case 'RoundError': {
            // Start new round
            conn.request('startGame');
            return;
        }
    }

    popTextBoth(6000, `${data.code}: ${data.message}`);
    // pretend nothing happened
    req.state = 'SUCCESS';
    // TODO stop reel anim at a standard non-winning grid and reset to start state?
    if (pgame.currState.name == 'PlayRun') {
        pgame.state('PlayRun').setNext('Start');
    }
}

function createConnector() {
    const ajv = new Ajv();
    const handlers = {
        'startGame': new StartGameRequest(ajv),
        'bet': new BetRequest(ajv),
        'step': new StepRequest(ajv),
        'updateBalance': new UpdateBalanceRequest(ajv)
    };
    const connector = new NextDigital.Connector(ajv, handlers);

    return connector;
}


export default {
    createConnector
};