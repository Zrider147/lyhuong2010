<template>
    <div class="sound-settings">
        <div class="heading title">{{ $t("message.sound-settings") }}</div>
        <div class="sound-controllers">
            <SoundOptions></SoundOptions>
            
        </div>
        <div class="sub-heading param">{{ $t("message.volume-settings") }}</div>
            <div class="volume-range">
                <form class="range">
                    <div class="form-group range__slider">
                        <input :style="scrollBar" type="range" class="volume-slider" v-model.number="volume" step=0.01 min=0 max=1>
                    </div>
                </form>
            </div>
    </div>
</template>
<script setup lang="ts">
import SoundOptions from '../../../components/sound/sound-options.vue';
import { computed } from 'vue';

const volume = API.volume;

const scrollBar = computed(() => ({
    'background-image': `linear-gradient(89.01deg, #5FBC02 2.47%, #BFD72F ${100*volume.value}%, rgba(0, 0, 0, 0) ${100*volume.value}%, rgba(0, 0, 0, 0) 100%)`
}));
</script>
<style scoped>
.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 50%;
    /* height: 100%;
    min-height: 60vh; */
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .heading {
    width: 100%;
    font-size: 18px;
    font-weight: 700;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: left;
    margin-top: 17px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sub-heading {
    width: 100%;
    font-size: 14px;
    font-weight: 500;
    margin-top: 50px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range {
    width: 100%;
    margin-top: 21px;
    /* custom thumb */
    /* remove border */
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range {
    display: flex;
    width: 100%;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range__slider {
    width: 100%;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range__value {
    width: 35%;
    margin-left: 45px;
    text-align: center;
    border-left: #e6e4e4 1px solid;
}


.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .form-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .form-group label {
    text-transform: uppercase;
    font-size: 0.7rem;
    color: #222;
    margin-bottom: 5px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .form-group span {
    font-size: 2rem;
    font-weight: 600;
    color: #3c3b3b;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range__slider label {
    margin-bottom: 10px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range__slider [type=range] {
    width: 100%;
    -webkit-appearance: none;
    height: 8px;
    border-radius: 16px;
    /* background: linear-gradient(360deg, #434343 0%, #1C1C1C 87.5%); */
    outline: none;
    padding: 0;
    margin: 0;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range__slider [type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: linear-gradient(6.2deg, #5FBC02 21.72%, #BFD72F 96.28%);
    cursor: pointer;
    -webkit-transition: background 0.15s ease-in-out;
    transition: background 0.15s ease-in-out;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range .range__slider [type=range]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border: 0;
    border-radius: 50%;
    background: linear-gradient(6.2deg, #5FBC02 21.72%, #BFD72F 96.28%);
    cursor: pointer;
    -webkit-transition: background 0.15s ease-in-out;
    transition: background 0.15s ease-in-out;
}

.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range input::-moz-focus-inner,
.modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .volume-range input::-moz-focus-outer {
    border: 0;
}

@media only screen and (max-width: 960px) {
    .modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .heading {
        font-size: 14px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sub-heading {
        font-size: 12px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers {
        margin-top: 17px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .sound-settings .sound-controllers .selector-buttons .group button {
        width: 60px;
        height: 50px;
    }
}

.portrait-modals .menu-modal .outer .inner .content-section .settings-section .sound-settings {
    width: 90%;
    height: 45%;
    min-height: unset;
}

</style>