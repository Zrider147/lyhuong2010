<template>
    <div>
        <div class="selector-buttons">
            <div class="group">
                <span>{{ $t("message.modal-sound-active-sound") }}</span>
                <button class="general-button sound" :class="soundStyle" v-on:click="toggleSound"></button>
            </div>
            <div class="group">
                <span>{{ $t("message.modal-sound-active-music") }}</span>
                <button class="general-button music" :class="musicStyle" v-on:click="toggleMusic"></button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

function toggleMusic() {
    API.musicMuted.value = !API.musicMuted.value;
}
function toggleSound() {
    API.soundMuted.value = !API.soundMuted.value;
}

const musicStyle = computed(() => ({
    'musicOn': !API.musicMuted.value,
    'musicOff': API.musicMuted.value
}));
const soundStyle = computed(() => ({
    'soundOn': !API.soundMuted.value,
    'soundOff': API.soundMuted.value
}));
</script>
<style scoped>
.soundOn {
    background-image: url("../../assets/resources/Sound_On.png");
}

.soundOff {
    background-image: url("../../assets/resources/Sound_Off.png");
}

.musicOn {
    background-image: url("../../assets/resources/Music_On.png");
}

.musicOff {
    background-image: url("../../assets/resources/Music_Off.png");
}

.modals .sound-modal .outer .inner .selector-buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin-top: 30px;
}

.modals .sound-modal .outer .inner .selector-buttons .group {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modals .sound-modal .outer .inner .selector-buttons .group span {
    font-size: 14px;
    margin-right: 15px;
    margin-bottom: 1em;
    margin-left: 5px;
}

.modals .sound-modal .outer .inner .selector-buttons .group .sound {
    width: 80px;
    height: 56px;
}

.modals .sound-modal .outer .inner .selector-buttons .group .music {
    width: 80px;
    height: 56px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .group {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .group span {
    font-size: 14px;
    margin-right: 15px;
    margin-bottom: 1em;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .group .sound {
    width: 80px;
    height: 56px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .group .music {
    width: 80px;
    height: 56px;
}

@media only screen and (max-width: 960px) {
    .modals .sound-modal .outer .inner .selector-buttons {
        margin-top: 20px;
    }

    .modals .sound-modal .outer .inner .selector-buttons .group span {
        font-size: 14px;
    }

    .modals .sound-modal .outer .inner .selector-buttons .group button {
        width: 60px;
        height: 30px;
    }

    .modals .sound-modal .outer .inner .selector-buttons .group .sound {
        width: 70px;
        height: 50px;
    }

    .modals .sound-modal .outer .inner .selector-buttons .group .music {
        width: 70px;
        height: 50px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .group .sound {
        width: 60px;
        height: 43px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .group .music {
        width: 60px;
        height: 43px;
    }
}

.portrait-modals .sound-modal .outer .inner .selector-buttons {
    margin-top: 20px;
    flex-direction: column;
}

.portrait-modals .sound-modal .outer .inner .selector-buttons .group {
    width: 100%;
    justify-content: space-around;
}

.portrait-modals .sound-modal .outer .inner .selector-buttons .group span {
    font-size: 14px;
}

.portrait-modals .sound-modal .outer .inner .selector-buttons .group button {
    width: 65px !important;
    height: 50px !important;
}
</style>