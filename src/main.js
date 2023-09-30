import {createApp} from 'vue'
import {Notify, Dialog, Quasar} from 'quasar'
import { createPinia } from 'pinia'
import router from './router/router'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'
import langRu from 'quasar/lang/ru'

const myApp = createApp(App)
const pinia = createPinia()

myApp.use(router);
myApp.use(pinia);

myApp.use(
    Quasar, {
        plugins: {
            Notify,
            Dialog
        },
        lang: langRu,
    });
myApp.mount('#app')