<template>
    <div class="moreinfo-section">
        <h4 data-i18n="autoplay" class="title">{{ $t("message.moreInfo-autoPlay") }}</h4>
        <ul style="padding-left: 0px;">
            <li data-i18n="general" class="param">{{ $t("message.moreInfo-general") }}</li>
            <li data-i18n="note-1" class="param">{{ $t("message.moreInfo-note1") }}</li>
            <li data-i18n="note-2" class="param">{{ $t("message.moreInfo-note2") }}</li>
        </ul>
    </div>
</template>
<script>
export default {
    name: "MoreInfoSection"
}
</script>
<style scoped>
.modals .menu-modal .outer .inner .content-section .moreinfo-section {
    /* margin-left: 450px;
    margin-top: 200px; */
    margin: 0 auto;
    width: 90%;
    max-width: 740px;
}
</style>