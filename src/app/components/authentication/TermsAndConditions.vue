<template lang="pug">
    // Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
    div
        div.wrapper.auth
            div.field.logo
                img(src="../../assets/svg/logo-dark.svg")
            h1.title.
                Welcome to Radix Wallet
            h1.subtitle.
                Lorem ipsum dolar sit amet, consectatur

            div.form
                div.field.is-horizontal
                    label.checkbox
                        input(type="checkbox",v-model="termsAccepted")
                        | I agree to the
                        |
                        a(href="#") Terms and Conditions
                div.field.is-horizontal
                    label.checkbox
                        input(type="checkbox",v-model="privacyPolicyAccepted")
                        | I agree to the
                        |
                        a(href="#") Privacy Policy
            div.control
                button.button.is-primary.is-fullwidth(:disabled="!termsAccepted || !privacyPolicyAccepted",@click="acceptTerms()")
                    | Get Started
</template>

<script lang="ts">
import Vue from 'vue'
import { settingsStore } from '../../modules/SettingsStore'
import { accountManager } from '../../modules/account/AccountManager'
import { loadKeystore } from '../../modules/application-state'

export default Vue.extend({
  data() {
    return {
      termsAccepted: false,
      privacyPolicyAccepted: false,
    }
  },
  methods: {
    acceptTerms() {
      settingsStore.set('termsAccepted', true)
      loadKeystore()
    },
  },
})
</script>
