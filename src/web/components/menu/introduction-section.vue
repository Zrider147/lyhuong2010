<template>
    <div class="introduction-section">
        <ul>
            <li data-i18n="intro-1st" class="param">{{ $t("message.intro-1") }}</li>
            <li data-i18n="intro-2nd" class="param">{{ $t("message.intro-2") }}</li>
            <li data-i18n="intro-3rd" class="param"><b>BET</b> {{ $t("message.intro-3") }}</li>
            <li data-i18n="intro-4th" class="param"><b>WIN</b> {{ $t("message.intro-4") }}</li>
            <li data-i18n="intro-5th" class="param"><b>BALANCE</b> {{ $t("message.intro-5") }}</li>
            <!-- </ul>
        <ul> -->
            <li>
                <span data-i18n="game-func-header" class="param">
                    {{ $t("message.intro-gameFunc") }}
                </span>
                <table class="game-func">
                    <tr>
                        <th data-i18n="game-func-button" class="param">{{ $t("message.intro-button") }}</th>
                        <th data-i18n="game-func-functions" class="param">{{ $t("message.intro-func") }}</th>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/play_button.png" alt="play icon" width="70" height="70"></td>
                        <td data-i18n="play-button" class="param">{{ $t("message.intro-playButton") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/autoplay_button.png" alt="autoplay icon" width="70"
                                height="70"></td>
                        <td data-i18n="autoplay-button" class="param">{{ $t("message.intro-autoplayButton") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/lefthanded.png" alt="spin amount icon" width="70" height="70">
                        </td>
                        <td data-i18n="spin-amount-button" class="param">{{ $t("message.intro-leftMode") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/maxbet.png" alt="maxbet icon" height="30"></td>
                        <td data-i18n="maxbet-button" class="param">{{ $t("message.intro-maxBet") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/sound.png" alt="sound icon" width="70" height="70"></td>
                        <td data-i18n="sound-button" class="param">{{ $t("message.intro-sound") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/music.png" alt="music icon" width="70" height="70"></td>
                        <td data-i18n="help-button" class="param">{{ $t("message.intro-music") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/minusplus.png" alt="minusplus icon" width="70" height="30">
                        </td>
                        <td data-i18n="minusplus-button" class="param">{{ $t("message.intro-minusPlus") }}</td>
                    </tr>
                    <tr>
                        <td><img src="../../assets/resources/turbo.png" alt="turbo icon" width="70" height="70"></td>
                        <td data-i18n="turbo-button" class="param">{{ $t("message.intro-turbo") }}</td>
                    </tr>
                </table>
            </li>
            <li style="height: 20px"></li>
        </ul>
    </div>
</template>
<script>
export default {

}
</script>
<style scoped>
.introduction-section {
    width: 90%;
    max-width: 740px;
    margin: 0 auto;
}


.game-func, .game-func th, .game-func td {
    border: 1px solid #f0f0f0;
    border-collapse: collapse;
}

.game-func{
    margin-top: 10px;
    width: 100%;
}

.game-func th, .game-func td {
    padding: 10px;
}



@media only screen and (max-width: 850px) {
    .introduction-section ul {
        padding: 0px;
    }
}
</style>