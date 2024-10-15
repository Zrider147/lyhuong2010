<template>
    <div class="settings-section">
        <SoundSetting></SoundSetting>
        <div class="gapSettings"></div>
        <LanguageSetting></LanguageSetting>
    </div>
</template>
<script>
import SoundSetting from './settings/sound-setting.vue';
import LanguageSetting from './settings/language-setting.vue';
export default {
    name: "SettingSection",
    components: { 
        SoundSetting, 
        LanguageSetting 
    }
}
</script>
<style scoped>
.gapSettings {
    margin: 0px 50px;
}
.modals .menu-modal .outer .inner .content-section .settings-section {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    width: 90%;
    max-width: 740px;
    min-height: 60vh;
    margin: 0 auto;
}
.portrait-modals .menu-modal .outer .inner .content-section .settings-section {
    flex-direction: column;
    flex-wrap: wrap;
    width: 90%;
    height: 475px;
    align-items: center;
    margin: 0 auto;
}
/* @media only screen and (max-width: 960px) {
    .modals .menu-modal .outer .inner .content-section .settings-section {
        width: 450px;
        height: 200px;
        margin-left: 0px;
    }
} */
</style>