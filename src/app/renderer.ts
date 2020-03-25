import Vue from 'vue'
import * as Rx from 'rxjs/Rx'
import * as VueRx from 'vue-rx'
import './assets/sass/main.scss'
import 'vue-awesome/icons'

// @ts-ignore
import Icon from 'vue-awesome/components/Icon'
import Popover from 'vue-js-popover'
import vSelect from 'vue-select'
import VuePassword from 'vue-password'
import Autocomplete from 'v-autocomplete'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'v-autocomplete/dist/v-autocomplete.css'
//Sentry
import * as Sentry from '@sentry/electron'
import App from './App.vue'
import { router } from './shared/router'
import { store } from './shared/store'

Vue.component('icon', Icon)
Vue.use(Popover)
Vue.component('v-select', vSelect)
Vue.component('vue-password', VuePassword)
Vue.use(Autocomplete)
Vue.use(VueRx, Rx)

Sentry.init({
    dsn: 'https://928631067058499eb64b254461a3ad43@sentry.io/1211444',
    // more options...
})

Vue.config.productionTip = false

export const vue = new Vue({
    // @ts-ignore
    router,
    store,
    el: "#app",
    render: h => h(App)
})
