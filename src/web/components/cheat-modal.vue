<template>
    <div class="modal cheat-modal" v-if="enable">
        <div class="outer">
            <div class="inner">
                <p>
                    <input type="checkbox" id="cheat-enable" v-model="cheatEnable" />
                    <label for="cheat-enable">Enable cheat</label>
                </p>
                <p>
                    <input type="radio" id="cheat-option-comb" name="cheat-option" value="comb" v-model="cheatOption" />
                    <label for="cheat-option-comb">Choose combination</label>
                    <input type="radio" id="cheat-option-input" name="cheat-option" value="input" v-model="cheatOption" />
                    <label for="cheat-option-input">Input a number</label>
                </p>
                <p v-show="cheatOption == 'comb'">
                    <label for="cheat-symbid">Symbol ID: </label>
                    <select id="cheat-symbid" v-model="symbID">
                        <option v-for="i in symbIDs" :key="i" :value="i">
                            <p v-if="i === 8">Wild</p>
                            <p v-else-if="i === 9">Scatter</p>
                            <p v-else>{{ i }}</p>
                        </option>
                    </select>
                    &nbsp;&nbsp;&nbsp;
                    <label for="cheat-nsymb">Number of symbols: </label>
                    <select id="cheat-nsymb" v-model="nSymb">
                        <option v-for="i in nSymbs" :key="i" :value="i">
                            <h1 v-if="i < 10">{{ i }}</h1>
                            <h1 v-else>{{ ">=10" }}</h1>
                        </option>
                    </select>
                </p>
                <p v-show="cheatOption == 'input'">
                    <label for="cheat-rnd">Random number: </label>
                    <input type="number" id="cheat-rnd" min=0 step=1 v-model="inputRND" />
                <div style="text-align: center;">
                    <p>MYSTERY WIN CHEAT CODE:</p>
                    <p>1149077684, 1153342357</p>
                </div>
                </p>
                <button @click="confirm">Confirm</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const enable = ref(false);
API.showCheatPanel = (en) => {
    enable.value = en;
}

let cheatEnable = true;
const cheatOption = ref<'comb' | 'input'>('comb');

let symbID = 0;
const symbIDs: any = Array.from({ length: N_SYMBOL }, (_, i) => i);

let nSymb = MIN_WIN_SYMBS;
const nSymbs: any = Array.from({ length: MAX_WIN_SYMBS - MIN_WIN_SYMBS + 1 }, (_, i) => MIN_WIN_SYMBS + i);

let inputRND = 0;

function confirm() {
    enable.value = false;
    if (!cheatEnable) {
        pgame.data.cheatRND = undefined;
        return;
    }

    if (cheatOption.value == 'comb') {
        pgame.data.cheatRND = pgame.ce.combCheatTable[symbID][nSymb - MIN_WIN_SYMBS];
    }
    else {
        pgame.data.cheatRND = inputRND = Math.floor(inputRND);
    }
    console.debug(`Choose random number: ${pgame.data.cheatRND}`);
}
</script>

<style scoped>
.cheat-modal {
    display: block;
}

.inner {
    width: 450px;
    height: 260px;
}

.inner>p {
    margin-top: 0;
    margin-bottom: 1em;
}
</style>