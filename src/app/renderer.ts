import Vue from 'vue'
import * as Rx from 'rxjs/Rx'
import * as VueRx from 'vue-rx'

import App from './App.vue'

import {router} from './shared/router'
import {store} from './shared/store'

import 'vue-awesome/icons'
// @ts-ignore
import Icon from 'vue-awesome/components/Icon'
Vue.component('icon', Icon)

import Popover  from 'vue-js-popover'
Vue.use(Popover)

import vSelect from 'vue-select'
Vue.component('v-select', vSelect)

import VuePassword from 'vue-password'
Vue.component('vue-password', VuePassword)

import Autocomplete from 'v-autocomplete'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'v-autocomplete/dist/v-autocomplete.css'

Vue.use(Autocomplete)


//Sentry
import * as Sentry from '@sentry/electron'

Sentry.init({
  dsn: 'https://928631067058499eb64b254461a3ad43@sentry.io/1211444',
  // more options...
})

Vue.config.productionTip = false

Vue.use(VueRx, Rx)

// tslint:disable-next-line:no-unused-expression
// new Vue(App).$mount('#app')

export const vue = new Vue({
    // @ts-ignore
    router,
    store,
    el: '#app',
    render: h => h(App)
})

