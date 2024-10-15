<template>
    <div class="modal sound-modal" v-if="enable">
        <div class="outer">
            <div class="inner" style="color: white;">
                <div class="general-button close-button" @click="soundConfirm"></div>
                <div class="heading">{{ $t("message.modal-sound-header") }}</div>
                <div class="sub-heading">{{ $t("message.modal-sound-subheader") }}</div>
                <SoundOptions ref="soundOption"></SoundOptions>
                <button class="general-button confirm" @click="soundConfirm">{{ $t("message.confirm") }}</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import SoundOptions from './sound/sound-options.vue'
import { ref } from 'vue';

let enable = ref(false);
API.showSoundMenu = function (en) {
    enable.value = en
}
let soundConfirm = () => {
    enable.value = false
    pgame.sound.Click.play()
}
</script>
<style scoped>
.modals .sound-modal {
    display: block;
}

.modals .sound-modal .outer .inner {
    width: 504px;
    height: 322px;
}

.modals .sound-modal .outer .inner .heading {
    font-size: 18px;
}

.modals .sound-modal .outer .inner .sub-heading {
    font-size: 14px;
    margin-top: 20px;
}


.modals .sound-modal .outer .inner .confirm {
    margin-top: 30px;
    background-image: url("../assets/resources/Green_Button.png");
    min-width: 180px;
    min-height: 65px;
    color: black;
}

@media only screen and (max-width: 960px) {
    .modals .modal .outer .inner .close-button {
        width: 20px;
        height: 20px;
    }

    .modals .sound-modal .outer .inner {
        width: 416px;
        height: 226px;
    }

    .modals .sound-modal .outer .inner .heading {
        font-size: 14px;
    }

    .modals .sound-modal .outer .inner .sub-heading {
        font-size: 10px;
        margin-top: 10px;
    }

    .modals .sound-modal .outer .inner .confirm {
        margin-top: 15px;
        min-width: 100px;
        min-height: 30px;
        font-size: 14px;
    }
}

.portrait-modals .sound-modal .outer .inner .heading {
    font-size: 18px;
    width: 75%;
    text-align: center;
}

.portrait-modals .sound-modal .outer .inner .sub-heading {
    font-size: 14px;
    margin-top: 10px;
    width: 75%;
    text-align: center;
}

.portrait-modals .sound-modal .outer .inner .confirm {
    margin-top: 15px;
    min-width: 130px;
    min-height: 42px;
    font-size: 14px;
    color: black;
}
</style>