export interface GameDataGrid {
    state: string;
    debug: string;
    pick: number;
    dice: number[];
    isBonus: boolean;
    bonusDice: number;
}

const simpleGridSchema = {
    type: 'object',
    properties: {

    },
    required: []
} as const;
const gridSchema = {
    type: 'object',
    properties: {
        ...simpleGridSchema.properties
    },
    required: simpleGridSchema.required
} as const;

export type GameDataType = {
    StartGame: { R: Record<string, never> },
    Bet: {
        S: {
            state: 'bet' | 'cheatbet',
            debug: string,
            pick: number,
            dice: number[],
            isBonus: boolean,
            bonusDice: number
        },
        R: GameDataGrid
    },
    Step: { S: Record<string, never>, R: Record<string, never> }
};

const emptySchema = {
    type: 'object',
    properties: {},
    required: []
} as const;

export const gameDataSchema = {
    StartGame: { R: emptySchema },
    Bet: {
        S: {
            type: 'object',
            properties: {
                state: { type: 'string', enum: ['bet', 'cheatbet'] },
                debug: { type: 'string' },
                pick: { type: 'number' },
                dice: { type: 'array', items: { type: 'number' } },
                isBonus: { type: 'boolean' },
                bonusDice: { type: 'number' }

            },
            required: ['state', 'debug', 'pick', 'dice', 'isBonus', 'bonusDice']
        },
        R: gridSchema
    },
    Step: { S: emptySchema, R: emptySchema }
} as const;


export const CE = new class ClientEngine implements GameDataGrid {
    totalwin = 0
    debug = ''
    state = ''
    pick = 0
    dice = []
    isBonus = false
    bonusDice = 0

    /** number of bets from last time it has a win */
    nNonWin = 0;
    /** Note that this is only the "gameData" part of server response message */
    demoMessages: string[] = [];
    demoResults: GameDataGrid[] = [];

    /** standalone extraction */
    getDemoExtraction(_bet: number) {
        let rand;
        if (pgame.controlCaseGS === true) {
            rand = 9;
        }
        else if (pgame.controlCaseWild === true) {
            rand = 10;
        }
        else {
            rand = 7//Math.randInt(10);  //random demo 
        }
        let demo = this.demoResults[rand];
        Object.assign(this, demo);
    }

    recvBetGameData(gameData: GameDataType['Bet']['R']) {
        Object.assign(this, gameData);
    }

    combCheatTable = (<Record<string, number[][]>>{
        'it':
            [
                [1066456, 738475703, 916907404],        //0
                [64344603, 801505779, 894285542],       //1
                [770991269, 832449767, 985385661],      //2
                [814542285, 872125537, 1027873085],     //3
                [908116364, 962889641, 1086056791],     //4
                [977719840, 1111690215, 1146010273],    //5
                [1129771500, 1152912225, 1162662783],   //6
                [1145692058, 1162657968, 1166510409],   //7
                [1152315930, 1162673562, 1166516494],   //8 
                [1120046750, 1144839119, 1162855544],   //9
            ]
    })[MARKET];
}

export function getInitialGrid() {
    let symbolIDs: number[][] = [];
    for (let reelID of Array.range(N_REEL)) {
        symbolIDs.push([]);
        for (let cellID of Array.range(N_CELL)) {
            symbolIDs[reelID].push(Math.randInt(N_SYMBOL));
        }
    }
    return symbolIDs;
}

CE.demoMessages = [
    // zero-win 1
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[9,4,4,7,4],[9,2,0,0,1],[5,6,3,7,8],[2,1,0,4,6],[5,0,1,6,0]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":0,"winningLines":[]}',
    // zero-win 2
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[1,0,2,4,5],[4,2,9,5,3],[5,7,1,0,2],[0,0,2,4,8],[5,0,8,0,5]],"mysteryWin":0,"nScatter":1,"ready":0,"shootingWild":[],"totalwin":0,"winningLines":[]}',
    // small-win 1
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[3,4,3,0,3],[9,7,4,0,4],[1,7,2,0,1],[9,4,5,5,0],[4,1,7,6,1]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":50,"winningLines":[{"lineID":2,"numWinningSymbs":3,"position":[0,1,2,0,0],"symbID":0,"totWin":50}]}',
    // small-win 2
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[4,2,1,3,5],[2,8,0,3,0],[0,0,3,6,4],[9,1,0,0,3],[0,1,0,4,6]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":150,"winningLines":[{"lineID":6,"numWinningSymbs":3,"position":[0,1,2,0,0],"symbID":3,"totWin":150}]}',
    // large-win
    '{"bonus":null,"bonusWin":3300,"freeSpins":[],"grid":[[6,6,2,2,7],[8,4,2,7,7],[6,4,8,5,8],[0,3,6,3,8],[1,7,7,1,5]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[[0,1]],"totalwin":600,"winningLines":[{"lineID":0,"numWinningSymbs":3,"position":[0,1,2,3,4],"symbID":2,"totWin":100},{"lineID":1,"numWinningSymbs":3,"position":[0,1,2,3,4],"symbID":4,"totWin":250},{"lineID":5,"numWinningSymbs":3,"position":[0,1,2,3,0],"symbID":4,"totWin":250}]}',
    // mystery-win
    '{"bonus":null,"bonusWin":11400,"freeSpins":[],"grid":[[7,5,2,3,2],[0,9,7,5,2],[0,4,2,0,1],[5,3,6,7,3],[7,0,4,0,1]],"mysteryWin":200,"nScatter":1,"ready":0,"shootingWild":[],"totalwin":200,"winningLines":[]}',
    // normal-win + mystery-win
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[3,7,6,2,1],[2,2,8,7,3],[5,0,8,6,7],[5,4,0,1,6],[7,1,3,5,4]],"mysteryWin":500,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":2000,"winningLines":[{"lineID":0,"numWinningSymbs":3,"position":[0,1,2,3,4],"symbID":6,"totWin":1500}]}',
    // wild + no-win
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[7,0,3,9,4],[2,5,7,7,5],[8,5,1,0,1],[1,1,1,3,2],[9,5,0,9,1]],"mysteryWin":500,"nScatter":1,"ready":0,"shootingWild":[[3,1],[0,3]],"totalwin":0,"winningLines":[]}',
    // wild + win + mystery-win
    '{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[1,6,3,5,0],[5,6,4,0,0],[3,6,5,3,2],[0,7,9,1,6],[7,4,9,1,0]],"mysteryWin":1000,"nScatter":2,"ready":0,"shootingWild":[[3,3],[1,3]],"totalwin":3900,"winningLines":[{"lineID":1,"numWinningSymbs":3,"position":[0,1,2,3,4],"symbID":6,"totWin":1500},{"lineID":6,"numWinningSymbs":4,"position":[0,1,2,3,4],"symbID":5,"totWin":1200},{"lineID":8,"numWinningSymbs":4,"position":[0,1,2,3,0],"symbID":3,"totWin":200}]}',
    // bonus freespin
    '{"bonus":{"pickWins":[800,0,0,0,0],"scatters":[{"fakeValues0":600,"fakeValues1":700,"fakeValues2":900,"fakeValues3":1000,"reelID":2,"slotID":0},{"fakeValues0":0,"fakeValues1":0,"fakeValues2":0,"fakeValues3":0,"reelID":3,"slotID":1},{"fakeValues0":0,"fakeValues1":0,"fakeValues2":0,"fakeValues3":0,"reelID":0,"slotID":0},{"fakeValues0":0,"fakeValues1":0,"fakeValues2":0,"fakeValues3":0,"reelID":0,"slotID":0},{"fakeValues0":0,"fakeValues1":0,"fakeValues2":0,"fakeValues3":0,"reelID":0,"slotID":0}]},"bonusWin":500,"freeSpins":[{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[8,4,9,2,4],[8,4,9,1,0],[4,2,4,3,9],[8,4,0,5,0],[2,5,0,5,5]],"mysteryWin":0,"nScatter":2,"ready":0,"shootingWild":[],"totalwin":400,"winningLines":[{"lineID":5,"numWinningSymbs":4,"position":[0,1,2,3,3435973836],"symbID":4,"totWin":400}]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[2,2,0,0,6],[0,5,3,0,0],[2,6,9,5,5],[7,8,5,3,6],[1,3,0,1,3]],"mysteryWin":0,"nScatter":1,"ready":0,"shootingWild":[[0,3]],"totalwin":0,"winningLines":[]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[2,6,2,4,0],[0,0,8,0,9],[6,0,5,3,2],[8,2,1,1,5],[5,6,3,0,0]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":0,"winningLines":[]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[4,3,2,3,2],[8,9,1,1,8],[1,7,3,5,5],[2,4,1,9,8],[1,5,5,5,3]],"mysteryWin":0,"nScatter":2,"ready":0,"shootingWild":[],"totalwin":0,"winningLines":[]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[3,0,1,0,2],[3,1,0,0,6],[1,4,5,4,0],[1,2,1,6,2],[2,2,8,1,1]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":0,"winningLines":[]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[9,4,9,6,5],[7,4,9,1,8],[5,4,3,3,0],[0,4,1,3,4],[3,0,4,7,3]],"mysteryWin":0,"nScatter":2,"ready":0,"shootingWild":[],"totalwin":400,"winningLines":[{"lineID":1,"numWinningSymbs":4,"position":[0,1,2,3,3435973836],"symbID":4,"totWin":400}]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[4,3,5,8,4],[4,4,1,0,7],[9,8,8,3,0],[8,3,6,0,2],[0,0,5,0,7]],"mysteryWin":0,"nScatter":0,"ready":0,"shootingWild":[],"totalwin":300,"winningLines":[{"lineID":4,"numWinningSymbs":3,"position":[0,1,2,3435973836,3435973836],"symbID":1,"totWin":50},{"lineID":6,"numWinningSymbs":5,"position":[0,1,2,3,4],"symbID":0,"totWin":250}]},{"bonus":null,"bonusWin":0,"freeSpins":[],"grid":[[2,2,4,9,1],[6,9,4,4,9],[8,6,4,2,6],[3,5,4,0,1],[6,3,5,5,7]],"mysteryWin":100,"nScatter":2,"ready":0,"shootingWild":[],"totalwin":400,"winningLines":[{"lineID":0,"numWinningSymbs":4,"position":[0,1,2,3,3435973836],"symbID":4,"totWin":400}]}],"grid":[[3,9,2,8,7],[0,0,3,6,6],[9,9,1,2,2],[7,0,9,8,7],[3,3,0,1,4]],"mysteryWin":0,"nScatter":2,"ready":0,"shootingWild":[],"totalwin":1500,"winningLines":[]}',

    '{"bonus":null,"bonusWin":9800,"freeSpins":[],"grid":[[8,8,3,5,6],[2,9,5,3,6],[6,3,4,4,0],[3,2,2,3,6],[6,9,3,6,2]],"mysteryWin":0,"nScatter":2,"shootingWild":[[3,2],[1,2],[2,3]],"totalwin":10900,"winningLines":[{"lineID":3,"numWinningSymbs":4,"position":[0,1,2,3],"symbID":7,"totWin":10000},{"lineID":8,"numWinningSymbs":5,"position":[0,1,2,3,4],"symbID":3,"totWin":700},{"lineID":9,"numWinningSymbs":4,"position":[0,1,2,3],"symbID":3,"totWin":200}]}'
];

CE.demoResults = CE.demoMessages.map(msg => JSON.parse(msg));