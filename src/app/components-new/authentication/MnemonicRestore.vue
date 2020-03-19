<template lang="pug">
    // Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
    div.fill
        div.wrapper.auth
            div.field.logo
                img(src="@assets/svg/logo-dark.svg")
            h1.title.
                Restore your account
            h1.subtitle.
                Please enter the 12 word backup seed

            div.form
                mnemonic-input.fill(:wordlist="wordlist", v-model="mnemonic", :size="mnemonicSize")

            div.control
                button.button.is-primary.is-fullwidth(@click="next()")
                    | Next

            div.control
                a(@click="back()").back Back

            div.modal(:class="{'is-active': warningModalIsActive}")
                div.modal-background
                div.modal-content.box
                    div.title Warning
                    div.subtitle.content
                        p Checksum validation for the mnemonic has failed.
                        blockquote {{mnemonic}}
                        p You can still create an account from it. This option is for advanced users.

                    div.field.is-grouped
                        div.control
                            button.button.is-light(@click="proceedUnsafe()") Proceed
                        div.control
                            button.button.is-primary(@click="closeModal()") Go back
</template>

<script lang="ts">
    import Vue from 'vue'
    import { radixApplication } from '@/app/modules/RadixApplication'
    import MnemonicInput from './MnemonicInput.vue'

    export default Vue.extend({
        components: {
            MnemonicInput,
        },
        data() {
            return {
                mnemonicSize: 12,
                mnemonic: '',

                wordlist: radixApplication.wordlist,

                warningModalIsActive: false,
            }
        },
        methods: {
            next() {
                try {
                    radixApplication.restoreCheckMnemonic(this.mnemonic)
                } catch {
                    this.warningModalIsActive = true
                }
            },
            back() {
                radixApplication.goBack()
            },
            closeModal() {
                this.warningModalIsActive = false
            },
            proceedUnsafe() {
                radixApplication.restoreProceedUnsafe(this.mnemonic)
            },
        },
    })
</script>
