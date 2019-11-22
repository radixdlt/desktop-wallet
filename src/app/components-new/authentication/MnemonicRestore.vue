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
            mnemonic-input.fill(:wordlist="wordlist", v-model="mnemonic", :size="mnemonicSize", @input="clearError()")
        
        div.control
            button.button.is-primary.is-fullwidth(@click="next()")
                | Next

        div.control
            a(@click="back()").back Back

        div.error(v-if="error")
            icon.inline-icon(name="exclamation-circle")
            span.message {{error}}
</template>

<script lang="ts">
    import Vue from 'vue'
    import { radixApplication } from  '@/app/modules/RadixApplication'
    import * as bip39 from 'bip39'
    import MnemonicInput from './MnemonicInput.vue'
    
    export default Vue.extend({
        components: {
            MnemonicInput,
        },
        data() {
            return {
                mnemonicSize: 12,
                mnemonic: '',

                error: '',
                wordlist: radixApplication.wordlist
            }
        },
        methods: {
            next() {
                try {
                    radixApplication.resotreCheckMnemonic(this.mnemonic)
                } catch {
                    this.error = 'Mnemonic is not valid'
                }
            },
            clearError() {
                this.error = ''
            },
            back() {
                radixApplication.goBack()
            },
        },
    })
</script>

<style lang="scss" scoped>

.error {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 60px;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: $red;
    color: $white;

    .inline-icon {
        margin-right: 10px;
        height: 24px;
    }
}
</style>
