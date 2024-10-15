import testUserAgentIsMobile from '../third-party/isMobile';

Element.prototype.requestFullscreen =
    Element.prototype.requestFullscreen || /* Standard syntax */
    Element.prototype.mozRequestFullScreen || /* Firefox syntax */
    Element.prototype.webkitRequestFullscreen || /* Safari and Opera syntax */
    Element.prototype.msRequestFullscreen || /* IE11 syntax */
    function () {
        // Fallback for unsupported browsers
        return Promise.reject(new Error('Fullscreen API is not supported'));
    };

Document.prototype.exitFullscreen =
    Document.prototype.exitFullscreen || /* Standard syntax */
    Document.prototype.mozCancelFullScreen || /* Firefox syntax */
    Document.prototype.webkitExitFullscreen || /* Safari and Opera syntax */
    Document.prototype.msExitFullscreen || /* IE11 syntax */
    function () {
        // Fallback for unsupported browsers
        return Promise.reject(new Error('Fullscreen API is not supported'));
    };


const isMobileResult = testUserAgentIsMobile();

function isMobile() {
    return isMobileResult.any;
}

function isApple() {
    return isMobileResult.apple.any;
}

function isFirefox() {
    return navigator.userAgent.includes('Firefox');
}

function isFullscreen() {
    return !!(
        document.fullscreenElement || /* Standard syntax */
        document.webkitFullscreenElement || /* Safari and Opera syntax */
        document.msFullscreenElement || /* IE11 syntax */
        document.mozFullScreenElement /* Firefox syntax */
    );
}

function enterFullscreen() {
    const elem = document.documentElement;
    elem.requestFullscreen().catch(() => {
        // do nothing
    });
}

function exitFullscreen() {
    document.exitFullscreen().catch(() => {
        // do nothing
    });
}

function toggleFullscreen() {
    if (isFullscreen())
        exitFullscreen();
    else
        enterFullscreen();
}

let firstTime = true;
let lastTapTime = 0;
function doubleTapEnterFullscreen() {
    if (firstTime) {
        enterFullscreen();
        firstTime = false;
        return;
    }
    let now = performance.now();
    let timesince = now - lastTapTime;
    if ((timesince < 600) && (timesince > 0)) {
        enterFullscreen();
    }
    else {
        // too much time to be a doubletap
    }
    lastTapTime = now;
}

export {
    isMobileResult,
    isMobile,
    isApple,
    isFirefox,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    doubleTapEnterFullscreen
};