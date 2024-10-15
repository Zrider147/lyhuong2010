<template>
    <div class="language-settings">
        <div class="left-handed-controller">
            <div class="heading">{{ $t("message.left-hand-mode") }}</div>
            <div class="group">
                <span>
                    {{ $t("message.left-hand-desc") }}
                </span>
                <button class="general-button left" :class="leftHandedButtonStyle"
                    v-on:click="toggleLeftHandedMode"></button>
            </div>
        </div>
        <div class="heading">{{ $t("message.language-settings") }}</div>
        <div class="lang-dropdown">
            <div class="select-menu">
                <div class="select-btn" v-on:click="toggleLangaugeSelect">
                    <span class="sBtn-text label">
                        {{ chonseLanguge }}
                    </span>
                    <div class="general-button chevron" :style="languageChevronStyle"></div>
                </div>
                <ul class="options" v-if="languageSelect">
                    <li class="option" :class="chonseLanguge === selectLanguages[lang] ? 'active' : ''"
                        v-for="(lang, idx) in Object.keys(selectLanguages)" v-on:click="handleSelectLanguage(lang)"
                        :key="idx">
                        <span class="option-text label">{{ selectLanguages[lang] }}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
import messages from '../../../messages'

export default {
    name: "LanguageSetting",
    data() {
        let chonseLanguge;
        if (this.$t("message.language") === "IMPOSTAZIONI LINGUA") {
            chonseLanguge = messages.it.name;
        } else {
            chonseLanguge = messages.en.name;
        }
        return {
            leftHandedMode: pgame.vueLeftHandedMode,
            languageSelect: false,
            chonseLanguge,
            selectLanguages: []
        }
    },
    mounted() {
        Object.keys(messages).forEach(langCode => {
            this.selectLanguages[langCode] = messages[langCode].name
        })
    },
    methods: {
        toggleLeftHandedMode() {
            this.leftHandedMode = !this.leftHandedMode;
            pgame.sound.Click.play()
            if (this.leftHandedMode) {
                pgame.vueLeftHandedMode = true;
                pgame.gui.sidePanel.position.set(75, 30)
                for (let i = 0; i < 10; i++) {
                    pgame.reelsbox.lines[i].numWin.position.set(pgame.reelsbox.lines[i].trace[0].x + 1105, pgame.reelsbox.lines[i].trace[0].y);
                }
            } else {
                pgame.vueLeftHandedMode = false;
                pgame.gui.sidePanel.position.set(1200, 30)
                for (let i = 0; i < 10; i++) {
                    pgame.reelsbox.lines[i].numWin.position.set(pgame.reelsbox.lines[i].trace[0].x, pgame.reelsbox.lines[i].trace[0].y);                    
                }
            }
        },
        toggleLangaugeSelect() {
            pgame.sound.Click.play()
            this.languageSelect = !this.languageSelect
        },
        handleSelectLanguage(lang) {
            API.locale.value = lang
            this.$i18n.locale = lang
            this.languageSelect = false
            this.chonseLanguge = this.selectLanguages[lang]
            pgame.sound.Click.play()
        }
    },
    computed: {
        leftHandedButtonStyle() {
            return {
                leftMode: this.leftHandedMode,
                rightMode: !this.leftHandedMode
            }
        },
        languageChevronStyle() {
            return {
                "transform": this.languageSelect ? "rotate(-180deg)" : "rotate(0deg)"
            }
        }
    },
}
</script>
<style scoped>
.leftMode {
    background-image: url('../../../assets/resources/Left_Handed_On.png');
}

.rightMode {
    background-image: url('../../../assets/resources/Left_Handed_Off.png');
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings {
    width: 50%;
    height: 100%;
    min-height: 60vh;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .heading {
    width: 100%;
    font-size: 18px;
    font-weight: 700;
    margin-top: 50px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu {
    /* max-width: 330px; */
    margin: 50px auto;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .select-btn {
    display: flex;
    height: 55px;
    background: linear-gradient(45deg, #000000 0%, #434343 100%);
    font-size: 18px;
    font-weight: 800;
    border-radius: 8px;
    border: 1px solid #000000;
    align-items: center;
    cursor: pointer;
    justify-content: space-between;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .select-btn span {
    margin-left: 25px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-btn .chevron {
    background-image: url("../../../assets/resources/Chevron_Icon.png");
    width: 17px;
    height: 15px;
    margin-right: 20px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .options {
    position: relative;
    background: #0F0F0F;
    border-radius: 8px;
    /* display: none; */
    padding-inline-start: 0px;
    margin: 10px 0 0 0;
    overflow-y: scroll;
    max-height: 260px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .options::-webkit-scrollbar {
    width: 12px;
    background-color: transparent;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu.active .options {
    display: block;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .options .option {
    display: flex;
    height: 55px;
    cursor: pointer;
    align-items: center;
    background: #0F0F0F;
    padding-left: 20px;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .options .option.active .option-text {
    background: linear-gradient(6.2deg, #5FBC02 21.72%, #BFD72F 96.28%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .options .option:hover {
    background: #191919;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .option .option-text {
    /* font-size: 18px;
    font-weight: 800; */
    color: white;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller {
    width: 100%;
    display: block;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller .heading {
    width: 100%;
    font-size: 18px;
    font-weight: 700;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller .group {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller .group span {
    font-size: 12px;
    /* margin-right: 15px; */
    width: calc(100% - 70px)
}

.modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller .group .left {
    width: 80px;
    height: 56px;
}

@media only screen and (max-width: 960px) {
    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings {
        display: flex;
        flex-direction: column;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .heading {
        font-size: 14px;
        margin-top: 0px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller .heading {
        font-size: 14px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu {
        /* max-width: 120px; */
        margin: 20px 0;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .select-btn {
        height: 30px;
        font-size: 12px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .select-btn .chevron {
        width: 12px;
        height: 10px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .options {
        max-height: 75px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .options .option {
        height: 30px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .lang-dropdown .select-menu .options .option span {
        font-size: 12px;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller {
        width: 100%;
        display: block;
    }

    .modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller .group .left {
        width: 60px;
        height: 43px;
    }
}

.portrait-modals .menu-modal .outer .inner .content-section .settings-section .language-settings {
    width: 90%;
    height: 45%;
    min-height: unset;
}

.portrait-modals .menu-modal .outer .inner .content-section .settings-section .language-settings .left-handed-controller {
    width: 100%;
    display: none;
}
</style>