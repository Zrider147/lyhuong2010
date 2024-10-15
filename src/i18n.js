import { createI18n } from 'vue-i18n'
import en from "@a/lang/en/frontend.json"
import it from "@a/lang/it/frontend.json"
import { ref, watch } from 'vue'

export const locale = ref("")

export const i18n = createI18n({
    locale: locale.value,
    messages: { en, it }
})

watch(locale, (code) => {
    i18n.global.locale = code
})
