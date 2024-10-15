<template>
    <div class="paytable-section">
        <h1>{{ $t("message.paytable-header") }}</h1>
        <!-- <img class="paytable-img" src="../../assets/resources/paytable.png" alt="paytable" style="width: 100%;"> -->
        <table>
            <thead>
                <tr>
                    <td>{{ $t("message.paytable-NoOfSymbol") }}</td>
                    <td><img src="../../assets/resources/10.png" alt="SYMBOL 1"></td>
                    <td><img src="../../assets/resources/J.png" alt="SYMBOL 2"></td>
                    <td><img src="../../assets/resources/Q.png" alt="SYMBOL 3"></td>
                    <td><img src="../../assets/resources/K.png" alt="SYMBOL 4"></td>
                    <td><img src="../../assets/resources/A.png" alt="SYMBOL 5"></td>
                    <td><img src="../../assets/resources/fox.png" alt="SYMBOL 6"></td>
                    <td><img src="../../assets/resources/buffalo.png" alt="SYMBOL 7"></td>
                    <td><img src="../../assets/resources/eagle.png" alt="SYMBOL 8"></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="winCase in winCases">
                    <td v-for="item in winCase"> {{ typeof item === 'number' ? item / 100 : item }}</td>
                </tr>
            </tbody>
        </table>

        <div class="tableDemo">
            <table class="winDemo" v-for="demo in winDemo">
                <tr v-for="example in demo">
                    <td v-for="box in example" :style="{ backgroundColor: box === 1 ? 'red' : 'white' }"></td>
                </tr>
            </table>
        </div>

        <div class="wild">
            <img src="../../assets/resources/Wild.png" alt="WILD">
            <div>
                <p>{{ $t("message.paytable-wild") }}</p>
                <p><span>5 </span><b>500 </b></p>
                <p><span>4 </span><b>100 </b>{{ $t("message.paytable-wild4") }}</p>
                <p><span>3 </span><b>30 </b>{{ $t("message.paytable-wild3") }}</p>
            </div>
        </div>

        <div class="scatter">
            <img src="../../assets/resources/Scatter.png" alt="SCATTER">
            <div>
                <p>{{ $t("message.paytable-scatter1") }}</p>
                <p>{{ $t("message.paytable-scatter2") }}</p>
                <p>3 Scatters = 1 Golden Spin</p>
                <p>4 Scatters = 3 Golden Spins</p>
                <p>5 Scatters = 5 Golden Spins</p>
            </div>
        </div>

        <ul style="width: 100%; margin: 20px auto;">
            <li class="param" data-i18n="rule-1th">{{ $t("message.paytable-rule1") }}</li>
            <li class="param" data-i18n="rule-2st">{{ $t("message.paytable-rule2") }}</li>
            <li class="param" data-i18n="rule-3rd">{{ $t("message.paytable-rule3") }}</li>
            <li class="param" data-i18n="rule-4th">{{ $t("message.paytable-rule4") }}</li>
            <li class="param" data-i18n="rule-5th" style="margin-bottom: 25px;">{{ $t("message.paytable-rule5") }}</li>
        </ul>
    </div>
</template>
<script>
export default {
    name: "PaytableSection",
    data() {
        return {
            winCases: [
                ["3", 50, 50, 100, 150, 250, 500, 1500, 3000],
                ["4", 100, 100, 150, 200, 400, 1200, 5000, 10000],
                ["5", 250, 250, 500, 700, 1000, 3000, 10000, 50000]
            ],
            winDemo: [
                [
                    [0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1],
                    [0, 0, 0, 0, 0]
                ],
                [
                    [1, 1, 1, 1, 1],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1]
                ],
                [
                    [1, 0, 0, 0, 1],
                    [0, 1, 0, 1, 0],
                    [0, 0, 1, 0, 0]
                ],
                [
                    [0, 0, 1, 0, 0],
                    [0, 1, 0, 1, 0],
                    [1, 0, 0, 0, 1]
                ],
                [
                    [1, 1, 0, 1, 1],
                    [0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0],
                    [1, 1, 0, 1, 1]
                ],
                [
                    [0, 1, 1, 1, 0],
                    [1, 0, 0, 0, 1],
                    [0, 0, 0, 0, 0]
                ],
                [
                    [0, 0, 0, 0, 0],
                    [1, 0, 0, 0, 1],
                    [0, 1, 1, 1, 0]
                ],
                [
                    [1, 0, 1, 0, 1],
                    [0, 1, 0, 1, 0],
                    [0, 0, 0, 0, 0]
                ],
            ]
        }
    },
    computed: {}
}
</script>
<style scoped>
.wild,
.scatter {
    display: flex;
}

.wild div {
    margin-left: 15px
}

table {
    text-align: center;
    margin: 0px 0px 20px;
}

img {
    width: 80%;
}

tr td {
    font-weight: bold;
    font-size: 18px;
    padding: 5px 0px;
    border: 1px solid white;
}

tr:hover {
    background-color: gray;
}

.wild img,
.scatter img {
    width: 150px;
    height: 150px;
    margin-right: 10px;
}

.wild p,
.scatter p {
    font-weight: bold;
    line-height: 0.6;
}

.wild p:first-child {
    line-height: 1.5;
}

.wild span {
    color: #d5d204;
    font-size: 20px;
    font-weight: bold;
}

.wild b {
    font-size: 20px;
}

.paytable-section {
    width: 90%;
    max-width: 740px;
    margin: 0 auto;
}

.tableDemo {
    display: flex;
    justify-content: space-between;
}

.winDemo tr td {
    width: 10px;
    height: 0px;
}


@media only screen and (max-width: 940px) {
    .wild p {
        font-size: 12px;
        line-height: 1.1;
    }

    .wild span {
        color: #d5d204;
        font-size: 15px;
        font-weight: bold;
    }

    .wild b {
        font-size: 15px;
    }

    .scatter p {
        font-size: 12px;
        line-height: 1.5;
    }

    .tableDemo {
        display: block;
        text-align: center;
    }

    .winDemo {
        display: inline-block;
        margin: 10px;
    }

    img {
        width: 100%;
    }
}
</style>