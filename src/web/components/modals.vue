<template>
    <div :class="modalsClass" :style="modalStyle">
        <autoplayModalVue ref="autoplay"></autoplayModalVue>
        <soundModalVue ref="sound"></soundModalVue>
        <menuModalVue ref="menu"></menuModalVue>
        <cheatModalVue></cheatModalVue>
    </div>
</template>
<script>

import autoplayModalVue from './autoplay-modal.vue';
import soundModalVue from './sound-modal.vue';
import menuModalVue from './menu-modal.vue';
import cheatModalVue from './cheat-modal.vue';

export default {
    name: "Modals",
    data() {
        return {
            app_bg: "url('img/loader_black.png')",
            bg_position: "top",
            soundOn: false,
            musicOn: false,
            modalOn: "menu",
            enableModal: true,
            isLandscape: window.innerWidth > window.innerHeight,
            canvasLoaded: false
        };
    },
    created() {
        window.addEventListener("resize", this.myEventHandler);
    },
    destroyed() {
        window.removeEventListener("resize", this.myEventHandler);
    },
    methods: {
        myEventHandler(e) {
            this.isLandscape = window.innerWidth > window.innerHeight;
        },
        showAutoplay() {
            this.$refs.autoplay.enable = true
        }
    },
    computed: {
        modalStyle() {
            return {
                "display": this.enableModal ? "block" : "none"
            };
        },
        modalsClass() {
            return {
                "modals": true,
                "portrait-modals": !this.isLandscape
            };
        }
    },
    components: { autoplayModalVue, soundModalVue, menuModalVue, cheatModalVue }
}
</script>
<style>
html,
body {
    margin: 0;
    padding: 0;
    font-family: 'Open Sans', sans-serif;


}

body {
    font-family: "Mulish", sans-serif;
    color: white;
    background-color: black;
}

* {
    touch-action: manipulation;
}

/* HEADER DESIGNS */
.header {
    position: fixed;
    width: 100%;
    left: 0;
    display: flex;
    background: #000;
    z-index: 1;
}

.header {
    top: 0;
}

.texts {
    color: #fff;
    padding: 1px 5px;
    font-weight: bold;
    display: inline-block;
    letter-spacing: 2px;
}


/* CANVAS MAIN LAYOUT */
.canvasMainDiv {
    height: 100vh;
    width: 100vw;
    position: relative;
    /* background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1)), url(back.png); */
}

#canvas {
    object-fit: contain;
    display: none;
    width: 100%;
    height: 100%;
    z-index: 0;
    margin: 0;
    overflow: scroll;
    position: fixed;
    max-width: 100vw;
    max-height: 100vh;
    overflow: scroll;
    touch-action: pan-y !important;
    pointer-events: all !important;
}


/*   SPINNER ANIMATION */
:not(:root):fullscreen #canvas {
    aspect-ratio: 16/10;
    object-fit: fill;
    width: 100vw;
    height: 100vh;
    top: 50%;
    left: 50%;
    transform: -webkit-translate(-50%, -50%);
    transform: -moz-translate(-50%, -50%);
    transform: translate(-50%, -50%);
    margin: 0;
}

.general-button {
    font-family: "Mulish", sans-serif;
    font-weight: 800;
    background-color: transparent;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 100%;
    border: none;
    cursor: pointer;
    outline: none;
}

.general-button:focus {
    outline: 0;
}

.general-button:disabled {
    opacity: 0.7;
}

.full-size {
    width: 100%;
}

ul {
    list-style-type: none;
}

li {
    margin: 5px 0px;
}


.modals {
    display: none;
}

.modals .modal .outer {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modals .modal .inner {
    border-radius: 20px;
    background: black;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.modals .modal .inner .close-button {
    background-image: url("../assets/resources/close.png");
    width: 30px;
    height: 30px;
    position: absolute;
    top: 10px;
    right: 10px;
}

.portrait-modals .modal .outer .inner {
    width: 100% !important;
    height: 100% !important;
}

.portrait-modals .modal .outer .inner .close-button {
    width: 20px;
    height: 20px;
}

.title {
    font-family: Mulish;
    font-size: 18px;
    font-weight: 700;
    line-height: 23px;
    letter-spacing: 0em;
    text-align: left;
}

.param {
    font-family: 'Mulish';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
}

.label {
    font-family: 'Mulish';
    font-style: normal;
    font-weight: 800;
    font-size: 14px;
    line-height: 18px;
}
</style>