<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Loading from './components/loading.vue';
import Modals from './components/modals.vue'

const canvas = ref<HTMLCanvasElement>();

let isAppMounted = false;
let isGameModuleLoaded = false;
const progressNum = ref(0);
const toggleCanvas = API.toggleCanvas;

const fakeCap = 0.1;

let GameModule: typeof import('@g/MainGame');
import('@g/MainGame').then((Game) => {
    GameModule = Game;
    if (isAppMounted) {
        onGameModuleLoaded();
    }
    isGameModuleLoaded = true;
});


onMounted(() => {
    if (isGameModuleLoaded) {
        onGameModuleLoaded();
    }
    isAppMounted = true;
});


function onGameModuleLoaded() {
    const { vb, MainGame } = GameModule;
    progressNum.value = fakeCap;
    if (canvas.value === undefined) return;

    new MainGame(canvas.value);
    pgame.assets.onTotalProgress = (progress) => {
        progressNum.value = fakeCap + (1 - fakeCap) * progress;
    }

    const startGame = () => {
        if (vb.isMobile() && !vb.isApple()) {
            document.body.ontouchend = () => {
                if (!vb.isFullscreen()) vb.enterFullscreen();
            };
        }
        window.addEventListener('resize', () => {
            pgame.detectStyleAndResize(document.body.clientWidth, window.innerHeight - 0.1);
        });
        // manually call resize
        window.dispatchEvent(new Event('resize'));
        toggleCanvas.value = true;
    }
    pgame.onGameReady = () => {
        if (DEV)
            startGame();
        else
            setTimeout(startGame, 100);
    }
}
</script>

<template>
    <Loading v-show="!toggleCanvas" :progress-num="progressNum"></Loading>
    <div id = "blank-page"></div>
    <canvas id="game-canvas" v-show="toggleCanvas" ref="canvas"></canvas>
    <Modals ref="modals"></Modals>
    <!-- <div :class="{'modals': true, 'portrait-modals': true}" :style="{display: 'block'}">
        <AutoPlayModal></AutoPlayModal>
    </div> -->
</template>

<style scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Mulish&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap'); */

#game-canvas {
    display: block;
    z-index: 1;
    /* width: 100vw !important;
    height: 100vh !important; */
}
</style>