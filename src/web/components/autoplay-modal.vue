<template>
    <div class="modal auto-play-modal" v-if="enable">
        <div class="outer">
            <div class="inner">
                <div class="general-button close-button" v-on:click="closeModal"></div>
                <div class="heading">{{ $t("message.autoplay-header") }}</div>
                <div class="sub-heading">{{ $t("message.autoplay-subheader") }}</div>
                <div class="number-buttons">
                    <button class="general-button number" v-for="number in autoplayNumbers" v-on:click="setAutoplay(number)"
                        :class="{ 'on': number === autoplay }" :key="number">{{ number }}</button>
                </div>
                <div class="must-choose-autoNumber">{{ $t(noSpinSelectedMessage) }}</div>
                <div class="sub-heading">{{ $t("message.autoplay-stop") }}</div>
                <div class="condition non-winning">
                    <label for="non-winning">{{ $t("message.autoplay-nonwinning") }}</label>
                    <input type="text" id="non-winning" v-model="roundsToStop" v-on:input="nonWinning()" />
                </div>
                <div class="condition balance-decrease">
                    <label for="balance-decrease">{{ $t("message.autoplay-balance") }}</label>
                    <input type="text" id="balance-decrease" v-model="moneyToStop" v-on:input="balanceDecreases()" />
                </div>
                <div class="condition bonus">
                    <button class="general-button check" :class="update" v-on:click="toggleStopBonus"></button>
                    <span>{{ $t("message.autoplay-stopBonus") }}</span>
                </div>
                <button class="general-button confirm" v-on:click="confirmAutoplay" id="autoPlay">{{
                    $t("message.autoplay-start") }}</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { autoPlayGame } from '@g/states/SStart';
import { computed, ref } from 'vue';

const enable = ref(false)
let autoplayNumbers = [10, 20, 30, 50, 100, 500];
let autoplay = ref(0);
let stopBonus = ref(false);
let roundsToStop = ref();
let moneyToStop = ref();
let noSpinSelectedMessage = ref("message.resetErrorMessage");

API.showAutoPlayMenu = function (en: any) {
    enable.value = en;
}

const nonWinning = () => {
    roundsToStop.value = roundsToStop.value.toString().replace(/\D/g, '')
    if (roundsToStop.value > 999) {
        roundsToStop.value = parseInt(roundsToStop.value.toString().slice(0, 3))
    }
}

const balanceDecreases = () => {
    moneyToStop.value = moneyToStop.value.toString().replace(/\D/g, '')
    if (moneyToStop.value > 9999) {
        moneyToStop.value = parseInt(moneyToStop.value.toString().slice(0, 4))
    }
}

const closeModal = () => {
    enable.value = false
    pgame.sound.Click.play()
}
const setAutoplay = (play: any) => {
    autoplay.value = play;
    pgame.sound.Click.play()
    checkRequirementField()
}
const toggleStopBonus = () => {
    stopBonus.value = !stopBonus.value;
    pgame.sound.Click.play()
    pgame.gui.sidePanel.stopBonus = stopBonus.value;
}
const update = computed(() => {
    return {
        "check-on": stopBonus.value,
        "check-off": !stopBonus.value
    }
})
const confirmAutoplay = () => {
    pgame.nonWinning = roundsToStop.value * 1
    pgame.countNonWinning = roundsToStop.value * 1
    pgame.balanceDecreases = moneyToStop.value * 100
    checkRequirementField()
    if (autoplay.value > 0) {
        enable.value = false;
        pgame.data.nAutoPlays = autoplay.value
        if (pgame.data.realCredits >= pgame.data.totalBet) {
            pgame.gui.disableBetButtons()
        }
        autoPlayGame(pgame.currState)
    }
}
const checkRequirementField = () => {
    if (autoplay.value < 1) {
        noSpinSelectedMessage.value = "message.no-Spin-Selected-Message"
    } else {
        noSpinSelectedMessage.value = "message.resetErrorMessage"
    }
}
</script>
<style scoped>
.must-choose-autoNumber {
    color: red;
    margin: -10px 0px 5px;
    text-align: center;
}

.check-on {
    background-image: url("../assets/resources/Flag_Selected_Box.png");
}

.check-off {
    background-image: url("../assets/resources/Flag_Empty_Box.png");
}

.modals .auto-play-modal .outer .inner {
    width: 473px;
    height: 513px;
}

.modals .auto-play-modal .outer .inner .heading {
    font-size: 18px;
}

.modals .auto-play-modal .outer .inner .sub-heading {
    font-size: 14px;
    margin-top: 15px;
    text-align: center;
}

.modals .auto-play-modal .outer .inner .number-buttons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 360px;
    margin: 30px 0;
}

.modals .auto-play-modal .outer .inner .number-buttons .number {
    background-image: url("../assets/resources/Counter_Black_Button.png");
    width: 100px;
    height: 40px;
    font-size: 18px;
    color: white;
    margin: 0 10px;
}

.modals .auto-play-modal .outer .inner .number-buttons .number.on {
    background-image: url("../assets/resources/Green_Button.png");
    color: black;
}

.modals .auto-play-modal .outer .inner .condition {
    font-size: 14px;
    margin-top: 15px;
}

.modals .auto-play-modal .outer .inner .condition.non-winning,
.modals .auto-play-modal .outer .inner .condition.balance-decrease {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modals .auto-play-modal .outer .inner .condition.non-winning input::-webkit-outer-spin-button,
.modals .auto-play-modal .outer .inner .condition.non-winning input::-webkit-inner-spin-button,
.modals .auto-play-modal .outer .inner .condition.balance-decrease input::-webkit-outer-spin-button,
.modals .auto-play-modal .outer .inner .condition.balance-decrease input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.modals .auto-play-modal .outer .inner .condition.non-winning input[type=number],
.modals .auto-play-modal .outer .inner .condition.balance-decrease input[type=number] {
    -moz-appearance: textfield;
    caret-color: transparent !important;
}

.modals .auto-play-modal .outer .inner .condition.non-winning input,
.modals .auto-play-modal .outer .inner .condition.balance-decrease input {
    width: 100px;
    height: 32px;
    background: linear-gradient(201.6deg, #000000 -25.97%, #434343 125.97%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: white;
    margin-left: 10px;
    text-align: center;
}

.modals .auto-play-modal .outer .inner .condition.bonus {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
}

.modals .auto-play-modal .outer .inner .condition.bonus span {
    font-size: 14px;
    margin-left: 10px;
}

.modals .auto-play-modal .outer .inner .condition.bonus .check {
    /* background-image: url("@/assets/resources/UI/Flag_Empty_Box.png); */
    width: 16px;
    height: 21px;
}


.modals .auto-play-modal .outer .inner .confirm {
    margin-top: 30px;
    /* background-image: url("@/assets/resources/Green_Button.png"); */
    background: linear-gradient(6.2deg, #5FBC02 21.72%, #BFD72F 96.28%);
    border: 1px solid rgba(245, 245, 245, 0.4);
    border-radius: 100px;
    min-width: 180px;
    min-height: 65px;
    font-size: 14px;
    color: black;
}

@media only screen and (max-width: 960px) {
    .modals .auto-play-modal .outer .inner {
        width: 585px;
        height: 293px;
    }

    .modals .auto-play-modal .outer .inner .heading {
        font-size: 14px;
    }

    .modals .auto-play-modal .outer .inner .sub-heading {
        font-size: 12px;
        margin-top: 5px;
    }

    .modals .auto-play-modal .outer .inner .number-buttons {
        width: 100%;
        flex-wrap: nowrap;
        margin: 8px 0;
    }

    .modals .auto-play-modal .outer .inner .number-buttons .number {
        width: 80px;
        height: 28px;
        font-size: 16px;
        margin: 0 6px;
    }

    .modals .auto-play-modal .outer .inner .condition {
        font-size: 12px;
        margin-top: 5px;
    }

    .modals .auto-play-modal .outer .inner .confirm {
        min-width: 122px;
        min-height: 37px;
        font-size: 14px;
        margin-top: 10px;
    }

}

.portrait-modals .auto-play-modal .outer .inner .heading {
    font-size: 18px;
}

.portrait-modals .auto-play-modal .outer .inner .sub-heading {
    font-size: 14px;
    margin-top: 10px;
}

.portrait-modals .auto-play-modal .outer .inner .number-buttons {
    width: 360px;
    flex-wrap: wrap;
    margin: 12px 0;
}

.portrait-modals .auto-play-modal .outer .inner .number-buttons .number {
    width: 100px;
    height: 40px;
    font-size: 18px;
    line-height: 22px;
    margin: 0 10px;
}

.portrait-modals .auto-play-modal .outer .inner .condition {
    font-size: 14px;
    margin-top: 10px;
}

.portrait-modals .auto-play-modal .outer .inner .confirm {
    min-width: 175px;
    min-height: 60px;
    font-size: 14px;
    margin-top: 40px;
    color: black;
}
</style>