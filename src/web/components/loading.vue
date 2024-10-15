<script setup lang="ts">
import { errorDetails, errorTitle, setErrorHandler } from '../ErrorHandler';
import { ref, watch } from 'vue';

const props = defineProps<{
    /* from 0 to 1 */
    progressNum: number
}>();

const statusDiv = ref<HTMLDivElement>();

watch(() => props.progressNum, (val) => {
    if (statusDiv.value === undefined) return;
    statusDiv.value.innerText = (val * 100).toFixed() + '%';
});

setErrorHandler(DEV || (API.params.get('debug') !== null));
</script>

<template>
    <div id="screen">
        <img src="../webResources/logo_star.png" alt="Logo" id="logo">
        <img src="../webResources/top_left.png" alt="top_left-log" id="top-left">
        <div id="loadGame">
            <img src="../webResources/logo_title.png" alt="Logo Title">
            <div id="loader" :class="{ 'has-error': errorTitle }">
                <div class="status" ref="statusDiv">Downloading...</div>
                <div>
                    <progress class="progress-bar" id="progress" :value="progressNum" max=1></progress>
                </div>
            </div>
        </div>
        <div class="error-panel" :class="{ 'has-error': errorTitle }">
            <p>{{ errorTitle }}</p>
            <p>
                <span v-for="line in errorDetails">{{ line }}<br></span>
            </p>
        </div>
        <img src="../webResources/bottom_right.png" alt="bottom_right-logo" id="bottom-right">
    </div>
</template>

<style scoped>
.error-panel {
    color: white;
    background-color: red;
    overflow-y: hidden;
    overflow-wrap: break-word;

    visibility: hidden;
    max-width: 80%;
    height: 0;
    opacity: 0;
    transition: all 0.5s ease;
}

.error-panel.has-error {
    visibility: visible;
    height: 20%;
    opacity: 1;
}

#loader {
    position: relative;
    z-index: 1;
    margin: 20px -30px;
    width: 20em;
    max-width: 90;

    visibility: visible;
    opacity: 1;
    transition: all 0.5s ease;
}

#loader.has-error {
    visibility: hidden;
    opacity: 0;
}

.status {
    position: absolute;
    font-weight: bolder;
    font-size: 16px;
    color: white;
    width: 100%;
    color: #383838;
    text-align: center;
}

#screen {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: black;
    background-position: 50% 0%;
    background-repeat: no-repeat;
    background-size: cover;
}

.progress-bar {
    height: 1em;
    width: 20em;
    border: none;
    border-radius: 0.5em;
    max-width: 100%;
    color: #bed62d;
}

#logo {
    position: absolute;
    top: 3vh;
    z-index: 1;
}

#top-left {
    position: absolute;
    top: 0px;
    left: 0px;
}

#bottom-right {
    position: absolute;
    bottom: 0px;
    right: 0px;
}

progress[value]::-webkit-progress-bar {
    border-radius: 0.5em;
}

progress::-webkit-progress-value {
    background: #bed62d;
    border-radius: 0.5em;
}

progress::-moz-progress-bar {
    background: #bed62d;
    border-radius: 0.5em;
}
</style>