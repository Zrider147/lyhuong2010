import type { MainGame } from '@g/MainGame';
import type { Ref } from 'vue';
import type { createOmniConnector } from '@g/conn/omni';


/**
 * Declare some global variables so that they can be accessed everywhere.
 * @note
 * Difference between `env.d.ts` and `global.d.ts` is that the latter containing import/export
 * is turned into module, so things have to be explicity declared in global scope,
 * while the former is just a script, so ambient declarations are permitted.
 */
declare global {
    /** Target market: it, ma, tr */
    const MARKET: string;
    /** Enable exclusively during development */
    const DEV: boolean;
    /** Shall keep enable before the final delivery */
    const DEBUG: boolean;
    /** Standalone client that doesn't need to communicate with server */
    const STANDALONE: boolean;
    const CHEAT: boolean;

    /** number of columns */
    const N_REEL: number;
    /** number of rows, including hidden */
    const N_CELL: number;
    /** number of visible rows */
    const N_VIS_CELL: number;
    /** number of symbols */
    const N_SYMBOL: number;
    /** number of winning lines */
    const N_WINLINE: number;
    /** Minimum number of symbols to get a winning line */
    const MIN_WIN_SYMBS: number;
    /** Maximum number of symbols in one winning line */
    const MAX_WIN_SYMBS: number;

    /**
     * Game Instance Singleton
     * 
     * @note Typescript doesn't have a thing like "Forward Declaration".
     * Thus, it's easy to get into circular dependency trouble,
     * especially while trying to export a "singleton" variable and use it everywhere. \
     * Singleton is not a good pattern but we definetly need it sometimes.
     * A way to avoid problems is to declare these variables in global scope.
     */
    var pgame: MainGame;
    /** Connector Instance Singleton */
    var conn: ReturnType<typeof createOmniConnector>;
    /**
     * Additional data and methods shared between game and front-end
     */
    var API: APIObject;
}

type APIObject = {
    params: URLSearchParams;
    conf: {
        supportedLocales: string[];
        defaultLocale: string;
        supportedCurrencies: string[];
        defaultCurrency: string;
    };
    locale: Ref<string>;
    currency: string;
    /** global volume setting, ranges from 0 to 1 */
    volume: Ref<number>;
    /** muted flag for sound playing */
    soundMuted: Ref<boolean>;
    /** muted flag for music playing */
    musicMuted: Ref<boolean>;
    /** toggle between game canvas and loading screen */
    toggleCanvas: Ref<boolean>;
    /** landscape or portrait */
    isLandscape: Ref<boolean>;
    /** left hand or right hand */
    isLeftHanded: Ref<boolean>;
    showSoundMenu(en: boolean): void;
    showMainMenu(en: boolean): void;
    showAutoPlayMenu(en: boolean): void;
    showCheatPanel(en: boolean): void;
    /**
     * Show error message on loading screen
     * @param [messageKey] The localization key of the error message
     * @param [details] Stack trace??
     */
    showErrorMessage(message: string | null, details?: string | string[]): void;
};