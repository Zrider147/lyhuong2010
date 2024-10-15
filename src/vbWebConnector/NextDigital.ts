import type Ajv from 'ajv';
import type { PresetGameDataType, PresetRequestHandlers } from './BaseRequestHandler';
import type { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { vbWebConnector } from './BaseConnector';

type GetDataType<T extends PresetGameDataType> = {
    StartGame: {
        S: {
            action: 'start',
            sessionId: string,
            sessionToken: string
        },
        R: {
            credits: number,
            code: 'OK',
            gameData?: T['StartGame']['R'],
            config: {
                bet:
                {
                    type: 'list',
                    list: number[],
                    default?: number
                } | {
                    type: 'step',
                    min: number,
                    max: number,
                    step: number,
                    default?: number
                }
            }
        }
    },
    Bet: {
        S: {
            action: 'bet',
            sessionId: string,
            sessionToken: string,
            gameData: T['Bet']['S'],
            bet: number,
            /** `"buy-in"` bonus */
            type?: string
        },
        R: {
            credits: number,
            code: 'OK',
            gameData: T['Bet']['R'],
            win: number,
            casinoMessage?: {
                title: string,
                body: string
            }
        }
    },
    Step: {
        S: {
            action: 'step',
            sessionId: string,
            sessionToken: string,
            gameData: T['Step']['S']
        },
        R: {
            credits: number,
            code: 'OK',
            gameData: T['Step']['R'],
            win: number
        }
    },
    UpdateBalance: {
        S: {
            action: 'update',
            sessionId: string,
            sessionToken: string
        },
        R: {
            credits: number,
            code: 'OK'
        }
    },
    Error: {
        code: string,
        message?: string,
        timestamp?: string
    }
}


/** Be sure to let gameDataSchema `as const` */
const getJSONSchema = <
    START_R extends SomeJSONSchema,
    BET_S extends SomeJSONSchema,
    BET_R extends SomeJSONSchema,
    STEP_S extends SomeJSONSchema,
    STEP_R extends SomeJSONSchema
>(gameDataSchema: {
    StartGame: { R: START_R },
    Bet: { S: BET_S, R: BET_R },
    Step: { S: STEP_S, R: STEP_R }
}) => ({
    StartGame: {
        S: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['start'] },
                sessionId: { type: 'string' },
                sessionToken: { type: 'string' }
            },
            required: ['action', 'sessionId', 'sessionToken']
        },
        R: {
            type: 'object',
            properties: {
                credits: { type: 'number' },
                code: { type: 'string', enum: ['OK'] },
                gameData: gameDataSchema.StartGame.R,
                config: {
                    type: 'object',
                    properties: {
                        bet: {
                            anyOf: [
                                {
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['list'] },
                                        list: { type: 'array', items: { type: 'number' } },
                                        default: { type: 'number' }
                                    },
                                    required: ['type', 'list']
                                },
                                {
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', enum: ['step'] },
                                        min: { type: 'number' },
                                        max: { type: 'number' },
                                        step: { type: 'number' },
                                        default: { type: 'number' }
                                    },
                                    required: ['type', 'min', 'max', 'step']
                                }
                            ]
                        }
                    },
                    required: ['bet']
                }
            },
            required: ['credits', 'code', 'config']
        }
    },
    Bet: {
        S: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['bet'] },
                sessionId: { type: 'string' },
                sessionToken: { type: 'string' },
                gameData: gameDataSchema.Bet.S,
                bet: { type: 'number' },
                type: { type: 'string' }
            },
            required: ['action', 'sessionId', 'sessionToken', 'gameData', 'bet']
        },
        R: {
            type: 'object',
            properties: {
                credits: { type: 'number' },
                code: { type: 'string', enum: ['OK'] },
                gameData: gameDataSchema.Bet.R,
                win: { type: 'number' },
                casinoMessage: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        body: { type: 'string' }
                    },
                    required: ['title', 'body']
                }
            },
            required: ['credits', 'code', 'gameData', 'win']
        }
    },
    Step: {
        S: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['step'] },
                sessionId: { type: 'string' },
                sessionToken: { type: 'string' },
                gameData: gameDataSchema.Step.S
            },
            required: ['action', 'sessionId', 'sessionToken', 'gameData']
        },
        R: {
            type: 'object',
            properties: {
                credits: { type: 'number' },
                code: { type: 'string', enum: ['OK'] },
                gameData: gameDataSchema.Step.R,
                win: { type: 'number' }
            },
            required: ['credits', 'code', 'gameData', 'win']
        }
    },
    UpdateBalance: {
        S: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['update'] },
                sessionId: { type: 'string' },
                sessionToken: { type: 'string' }
            },
            required: ['action', 'sessionId', 'sessionToken']
        },
        R: {
            type: 'object',
            properties: {
                credits: { type: 'number' },
                code: { type: 'string', enum: ['OK'] }
            },
            required: ['credits', 'code']
        }
    },
    Error: {
        type: 'object',
        properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string' }
        },
        required: ['code']
    }
} as const);


class Connector<M extends PresetRequestHandlers = PresetRequestHandlers> extends vbWebConnector<M> {
    readonly sessionId: string;
    readonly sessionToken: string;
    readonly platformUrl: string;

    constructor(ajv: Ajv, handlers: M) {
        super(ajv, handlers);
        let ret = globalThis.API.params.get('sessionId');
        this.sessionId = ret !== null ? ret : '0';
        ret = globalThis.API.params.get('sessionToken');
        this.sessionToken = ret !== null ? ret : '0';
        ret = globalThis.API.params.get('platformUrl');
        this.platformUrl = ret !== null ? window.atob(ret) : '0';
    }
    getWebSocketURL() {
        // if (window.location.protocol == 'http:')
        //     return `ws://${this.platformUrl}`;
        // else if (window.location.protocol == 'https:')
        //     return `wss://${this.platformUrl}`;
        // return '';
        if (globalThis.API.params.get('secure') == 'true'
            || window.location.protocol == 'https:')
            return `wss://${this.platformUrl}`;
        if (window.location.protocol == 'http:')
            return `ws://${this.platformUrl}`;
        return '';
    }

    getRequested() {
        if (this.handlers.startGame.state == 'REQUESTED')
            return this.handlers.startGame;
        if (this.handlers.bet.state == 'REQUESTED')
            return this.handlers.bet;
        if (this.handlers.step.state == 'REQUESTED')
            return this.handlers.step;
        if (this.handlers.updateBalance.state == 'REQUESTED')
            return this.handlers.updateBalance;
        return null;
    }

    test(data: unknown) {
        let validate = this.handlers.startGame.validate;
        validate(data);
        let errors = validate.errors;
        if (!errors) return;
        errors.forEach(err => console.log(err));
        validate = this.handlers.startGame.validateError;
        validate(data);
        errors = validate.errors;
        if (!errors) return;
        errors.forEach(err => console.log(err));
    }
}


export {
    getJSONSchema,
    type GetDataType,
    Connector
};