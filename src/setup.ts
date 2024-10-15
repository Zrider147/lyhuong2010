import "./web/main.css"
import App from './web/App.vue';
import { createApp, ref } from 'vue';
import { i18n, locale } from './i18n';
import { setNumberFormat } from './shared/NumberFormat';

// init API
globalThis.API = {
    params: new URLSearchParams(window.location.search),
    conf: {
        supportedLocales: ['en', 'it'],
        defaultLocale: ({ 'it': 'en' })[MARKET],
        supportedCurrencies: ['EUR'],
        defaultCurrency: ({ 'it': 'EUR' })[MARKET]
    },
    locale: locale,
    volume: ref(1),
    soundMuted: ref(true),
    musicMuted: ref(true),
    toggleCanvas: ref(false),
    isLandscape: ref(true)
} as typeof API;

// setup configs
{
    let urlLocaleCode = API.params.get('locale')?.toLowerCase();
    // let navLocaleCode = navigator.language.split('-')[0].toLowerCase();
    let navLocaleCode = '';
    API.locale.value =
        (urlLocaleCode && API.conf.supportedLocales.includes(urlLocaleCode))
            ? urlLocaleCode : (API.conf.supportedLocales.includes(navLocaleCode)
                ? navLocaleCode : API.conf.defaultLocale);

    let urlCurrencyCode = API.params.get('currency')?.toUpperCase();
    API.currency =
        (urlCurrencyCode && API.conf.supportedCurrencies.includes(urlCurrencyCode))
            ? urlCurrencyCode : API.conf.defaultCurrency;
    setNumberFormat(API.currency);
}



createApp(App).use(i18n).mount('#app');
