<template>
    <div>
        <div class="features-section">
            <h4 data-i18n="Bonuses" class="title">Bonus</h4>
            <ul style="padding-left: 0px;">
                <li data-i18n="mysterytoken" class="param">
                    <p><b>Mystery Token </b>{{ $t("message.features-mysToken")}} </p>
                </li>
                <!-- <img class="full-size" src="../../assets/resources/mysterytoken.png" data-i18n="mysterytoken_src"> -->
                <br>
                <li>
                    <p data-i18n="overall" class="param"><b>Golden Spin </b>{{ $t("message.features-goldenSpin") }}</p>
                    <p data-i18n="pick-value" class="param">{{ $t("message.features-pickValue") }}</p>
                    <p data-i18n="pick-number" class="param">{{ $t("message.features-pickNumber") }}</p>

                    <table class="pick-number-table">
                        <tr>
                            <th data-i18n="scatters" class="param">{{ $t("message.features-scatters") }}</th>
                            <th data-i18n="picks" class="param">{{ $t("message.features-picks") }}</th>
                        </tr>
                        <tr>
                            <td data-i18n="3" class="param">3</td>
                            <td data-i18n="spin1" class="param">1</td>
                        </tr>
                        <tr>
                            <td data-i18n="4" class="param">4</td>
                            <td data-i18n="spin2" class="param">3</td>
                        </tr>
                        <tr>
                            <td data-i18n="5" class="param">5</td>
                            <td data-i18n="spin3" class="param">5</td>
                        </tr>
                    </table>
                </li>
                <!-- <img src="../../assets/resources/goldenspin.png" class="full-size" data-i18n="goldenspin_src"> -->
                <li data-i18n="freespin">
                    <p class="param">{{ $t("message.features-freeSpin1") }}</p>
                    <p class="param">{{ $t("message.features-freeSpin2") }}</p>
                    <p class="param">{{ $t("message.features-freeSpin3") }}</p>

                </li>
                <!-- <img class="full-size" src="../../assets/resources/freespin.png" data-i18n="freespin_src"> -->
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    name: "FeaturesSection"
}
</script>
<style scoped>
.features-section {
    margin: 0 auto;
    width: 90%;
    max-width: 740px;
}
.img {
    margin: 10px 0px;
}
</style>