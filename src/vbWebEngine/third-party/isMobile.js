const appleIphone = /iPhone/i;
const appleIpod = /iPod/i;
const appleTablet = /iPad/i;
const androidPhone = /\bAndroid(?:.+)Mobile\b/i; // Match 'Android' AND 'Mobile'
const androidTablet = /Android/i;
const windowsPhone = /Windows Phone/i;
const windowsTablet = /\bWindows(?:.+)ARM\b/i; // Match 'Windows' AND 'ARM'
const otherBlackBerry = /BlackBerry/i;
const otherBlackBerry10 = /BB10/i;
const otherOpera = /Opera Mini/i;
const otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
const otherFirefox = /Mobile(?:.+)Firefox\b/i; // Match 'Mobile' AND 'Firefox'


const isAppleTabletOnIos13 = (navigator) => {
    return (
        typeof navigator !== 'undefined' &&
        navigator.platform === 'MacIntel' &&
        typeof navigator.maxTouchPoints === 'number' &&
        navigator.maxTouchPoints > 1
    );
};

/**
 * @typedef {Object} isMobileResult
 * @prop {Object} apple
 * @prop {boolean} apple.phone
 * @prop {boolean} apple.ipod
 * @prop {boolean} apple.tablet
 * @prop {boolean} apple.any
 * 
 * @prop {Object} android
 * @prop {boolean} android.phone
 * @prop {boolean} android.tablet
 * @prop {boolean} android.any
 * 
 * @prop {Object} windows
 * @prop {boolean} windows.phone
 * @prop {boolean} windows.tablet
 * @prop {boolean} windows.any
 * 
 * @prop {Object} other
 * @prop {boolean} other.blackberry
 * @prop {boolean} other.opera
 * @prop {boolean} other.firefox
 * @prop {boolean} other.chrome
 * @prop {boolean} other.any
 * 
 * @prop {boolean} phone
 * @prop {boolean} tablet
 * @prop {boolean} any
 * @return {isMobileResult}
 */
function testUserAgentIsMobile() {
    const nav = navigator;
    let userAgent = nav.userAgent;

    // Facebook mobile app's integrated browser adds a bunch of strings that
    // match everything. Strip it out if it exists.
    let tmp = userAgent.split('[FBAN');
    if (typeof tmp[1] !== 'undefined') {
        userAgent = tmp[0];
    }

    // Twitter mobile app's integrated browser on iPad adds a "Twitter for
    // iPhone" string. Same probably happens on other tablet platforms.
    // This will confuse detection so strip it out if it exists.
    tmp = userAgent.split('Twitter');
    if (typeof tmp[1] !== 'undefined') {
        userAgent = tmp[0];
    }

    const match = (regex) => regex.test(userAgent);

    const result = {
        apple: {
            phone: match(appleIphone) && !match(windowsPhone),
            ipod: match(appleIpod),
            tablet:
                !match(appleIphone) &&
                (match(appleTablet) || isAppleTabletOnIos13(nav)) &&
                !match(windowsPhone),
            any: false,
        },
        android: {
            phone:
                (!match(windowsPhone) && match(androidPhone)),
            tablet:
                !match(windowsPhone) &&
                !match(androidPhone) &&
                match(androidTablet),
            any: false,
        },
        windows: {
            phone: match(windowsPhone),
            tablet: match(windowsTablet),
            any: false,
        },
        other: {
            blackberry: match(otherBlackBerry) || match(otherBlackBerry10),
            opera: match(otherOpera),
            firefox: match(otherFirefox),
            chrome: match(otherChrome),
            any: false,
        },
        any: false,
        phone: false,
        tablet: false,
    };

    result.apple.any =
        result.apple.phone ||
        result.apple.ipod ||
        result.apple.tablet;
    result.android.any =
        result.android.phone ||
        result.android.tablet ||
        match(/\bokhttp\b/i);
    result.windows.any =
        result.windows.phone ||
        result.windows.tablet;
    result.other.any =
        result.other.blackberry ||
        result.other.opera ||
        result.other.firefox ||
        result.other.chrome;

    result.any =
        result.apple.any ||
        result.android.any ||
        result.windows.any ||
        result.other.any;
    // excludes 'other' devices and ipods, targeting touchscreen phones
    result.phone =
        result.apple.phone ||
        result.android.phone ||
        result.windows.phone;
    result.tablet =
        result.apple.tablet ||
        result.android.tablet ||
        result.windows.tablet;

    return result;
}

export default testUserAgentIsMobile;