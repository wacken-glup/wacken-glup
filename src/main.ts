import { registerSW } from 'virtual:pwa-register'

let onOfflineReadyCall: any = undefined
if ("serviceWorker" in navigator) {
    registerSW({ immediate: true, onOfflineReady() {
        if(onOfflineReadyCall !== undefined) onOfflineReadyCall()
    } })
}

import './assets/main.css'

/* ui */
import "beercss";
import "material-dynamic-colors";
import '@mdi/font/css/materialdesignicons.css';

/* vue */
import { createApp, ref, type Ref } from 'vue'
import VueQrcode from '@chenfengyuan/vue-qrcode';
import VueLazyload from 'vue3-lazyload';

import Client from '@/sdk/Client'
import Context from './Context';

import { initializeApp, type FirebaseOptions } from 'firebase/app';

/* view */
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n';

import en from "@/locales/en.json"
import de from "@/locales/de.json"

/* set ui theme */
ui("theme", import.meta.env.VITE_THEME_COLOR || "#9AB14D");

const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FB_APP_ID
}
  
const firebaseApp = initializeApp(firebaseConfig)
const context = new Context(firebaseApp)

declare module 'vue' {
    interface ComponentCustomProperties {
        $client: Client,
        $ctx: Context,
        openLoginNeededDialog: Ref<Boolean>,
        showOfflineReadyToast: Ref<Boolean>
    }
}

const i18n = createI18n({
    locale: navigator.language.substring(0, 2),
    fallbackLocale: 'en',
    messages: {
        en,
        de
    }
})

const app = createApp(App)

const client = new Client(context)
app.config.globalProperties.$client = client
app.config.globalProperties.$ctx = context
app.config.globalProperties.openLoginNeededDialog = ref(false)
app.config.globalProperties.showOfflineReadyToast = ref(false)
client.fetchAll()

app.use(i18n)
app.use(router)
app.use(VueLazyload, { })

app.component(VueQrcode.name || "", VueQrcode)

app.mount('body')

onOfflineReadyCall = () => {
    app.config.globalProperties.showOfflineReadyToast.value = true
}