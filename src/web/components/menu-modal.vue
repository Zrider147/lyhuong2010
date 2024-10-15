<template>
    <div class="modal menu-modal" v-if="enable">
        <div class="outer">
            <div class="inner">
                <div class="general-button close-button" v-on:click="closeModal"></div>
                <div class="content-section" ref="content">
                    <PaytableSection v-if="menuTabIndex < menuTabs.length && menuTabs[menuTabIndex].code === 'Paytable'">
                    </PaytableSection>
                    <SettingsSection v-if="menuTabIndex < menuTabs.length && menuTabs[menuTabIndex].code === 'settings'">
                    </SettingsSection>
                    <IntroductionSection v-if="menuTabIndex < menuTabs.length && menuTabs[menuTabIndex].code === 'intro'">
                    </IntroductionSection>
                    <FeaturesSection v-if="menuTabIndex < menuTabs.length && menuTabs[menuTabIndex].code === 'features'">
                    </FeaturesSection>
                    <MoreinfoSection v-if="menuTabIndex < menuTabs.length && menuTabs[menuTabIndex].code === 'info'">
                    </MoreinfoSection>
                </div>
                <div class="bottom-bar">
                    <div class="tab-selectors">
                        <div class="tab-selector title" v-for="(tab, idx) in menuTabs" style="text-align: center;"
                            :class="{ 'active': menuTabIndex < menuTabs.length && menuTabIndex === idx }"
                            @click="chooseMenuTab(idx)" :key="idx">
                            {{ $t(`message.${tab.name}`) }}
                            <span></span>
                        </div>
                    </div>
                    <div class="dropdown-tabs" style="text-align: center;">
                        <div class="dropdown" v-if="showDropdown">
                            <ul>
                                <li v-on:click="chooseMenuTab(idx); toggleDropdown()" v-for="(tab, idx) in menuTabs"
                                    :key="idx" class="bg-hover">
                                    {{ $t("message." + tab.name) }}
                                </li>
                            </ul>
                        </div>
                        <div class="current-tab" v-on:click="toggleDropdown">
                            <div class="content">
                                {{ $t("message." + menuTabs[menuTabIndex].name) }}
                            </div>
                            <div class="chevron" :style="dropDownChevronStyle"><img
                                    src="../assets/resources/Chevron_Icon.png" style="width: 20px" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import SettingsSection from './menu/settings-section.vue'
import PaytableSection from './menu/paytable-section.vue';
import IntroductionSection from './menu/introduction-section.vue';
import FeaturesSection from './menu/features-section.vue';
import MoreinfoSection from './menu/moreinfo-section.vue';
import { ref } from 'vue';

const enable = ref(false);
let menuTabIndex = ref(4);
let showDropdown = ref(false);
let menuTabs = [
    { name: "paytable-tab", code: "Paytable" },
    { name: "introduction-tab", code: "intro" },
    { name: "features-tab", code: "features" },
    { name: "info-tab", code: "info" },
    { name: "settings-tab", code: "settings" }
];

API.showMainMenu = function (en) {
    enable.value = en
}

const closeModal = () => {
    enable.value = false
    pgame.sound.Click.play()
}

const chooseMenuTab = (idx: any) => {
    menuTabIndex.value = idx;
    pgame.sound.Click.play()
}

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
    pgame.sound.Click.play()
}

const dropDownChevronStyle = () => {
    return {
        transform: showDropdown.value ? 'rotate(0deg)' : 'rotate(-180deg)'
    }
}
</script>
<style scoped>
.bg-hover:hover {
    background-color: #191919;
}

.modals .menu-modal .outer .inner {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
}

.modals .menu-modal .outer .inner .content-section {
    display: block;
    align-items: center;
    overflow: auto;
    justify-content: center;
    width: 100%;
    height: calc(100% - 125px);
    position: absolute;
    top: 0;
    margin-top: 50px;
}

.modals .menu-modal .outer .inner .bottom-bar {
    width: 100%;
    height: 75px;
    background-color: #1c1c1c;
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modals .menu-modal .outer .inner .bottom-bar .tab-selectors {
    height: 100%;
    width: 1000px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modals .menu-modal .outer .inner .bottom-bar .dropdown-tabs {
    height: 100%;
    width: 1000px;
    display: none;
    align-items: center;
    justify-content: center;
}

.modals .menu-modal .outer .inner .bottom-bar .tab-selectors .tab-selector {
    width: 33.33%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* font-size: 22px;
    font-weight: 700; */
    cursor: pointer;
    text-transform: uppercase;
}

.modals .menu-modal .outer .inner .bottom-bar .tab-selectors .tab-selector.active {
    position: relative;
    background: linear-gradient(85.83deg, #5FBC02 1.53%, #BFD72F 98.02%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

.modals .menu-modal .outer .inner .bottom-bar .tab-selectors .tab-selector.active span {
    width: 100%;
    height: 8px;
    /* background: linear-gradient(85.83deg, #5FBC02 1.53%, #BFD72F 98.02%);
    box-shadow: 0px -2px 17px 2px #9AC342;
    border-radius: 10px 10px 0px 0px; */
    background: linear-gradient(85.83deg, #5FBC02 1.53%, #BFD72F 98.02%);
    box-shadow: 0px -2px 17px 2px #9AC342;
    border-radius: 10px 10px 0px 0px;
    position: absolute;
    bottom: 0;
    left: 0;
}

.current-tab {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: bold;
    background: linear-gradient(45deg, #000000 0%, #434343 100%);
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    height: 100%;
}


.content {
    display: flex;
    width: 90%;
    justify-content: center;
    margin-left: 8.5%;
}

.chevron {
    display: flex;
    width: 10%;
    justify-content: center;
}

.dropdown {
    position: absolute;
    bottom: 45px;
    width: 100%;
    right: 1px;
    border-radius: 8px;
}

.dropdown-container {
    position: fixed;
    width: 100vw;
    height: calc(100vh - 45px);
    top: 0;
    left: 0;
    background-color: #00000f;
    opacity: .7;
    z-index: -1;
    border-radius: 8px;
}

.dropdown ul {
    padding-left: 0px;
}

.dropdown ul li {
    text-align: center;
    background-color: #0f0f0f;
    margin: 0px;
    display: block;
    padding: 20px 0;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
}

@media only screen and (max-width: 960px) {

    .modals .menu-modal .outer .inner .bottom-bar {
        height: 45px;
    }

    .modals .menu-modal .outer .inner .bottom-bar .tab-selectors {
        width: 100%;
        display: none;
    }

    .modals .menu-modal .outer .inner .bottom-bar .dropdown-tabs {
        width: 500px;
        display: block;
        z-index: 1000;
    }

    .modals .menu-modal .outer .inner .bottom-bar .tab-selectors .tab-selector {
        font-size: 14px;
    }

    .modals .menu-modal .outer .inner .bottom-bar .tab-selectors .tab-selector.active span {
        height: 6px;
        background: linear-gradient(85.83deg, #5FBC02 1.53%, #BFD72F 98.02%);
        box-shadow: 0px -1.41696px 12.0442px 1.41696px #9AC342;
        border-radius: 7.08482px 7.08482px 0px 0px;
    }
}

@media only screen and (max-width: 960px) and (orientation: landscape) {
    .modals .menu-modal .outer .inner .bottom-bar .dropdown-tabs {
        display: none !important;
    }

    .modals .menu-modal .outer .inner .bottom-bar .tab-selectors {
        display: flex !important;
    }

    /* .modals .menu-modal .outer .inner .content-section {
        width: auto !important;
    } */

    .modals .menu-modal .outer .inner .content-section .paytable-section {
        position: relative !important;
    }
}

.portrait-modals .menu-modal .outer .inner .content-section {
    height: calc(100% - 60px);
    margin-top: 30px;
}
</style>