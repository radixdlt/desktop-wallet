<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
    div.wrapper.auth
        div.field.logo
            img(src="@assets/svg/logo-dark.svg")
        h1.title.
            Backup your Wallet seed
        h1.subtitle.
            The following 12 words are the seed of your
            new account.

            As long as you have them, you will always
            be able to recover your account, but remember not to
            store them digitally.

        div.form.mnemonic.columns.is-multiline.is-gapless
            div.column.is-4(v-for="(word, index) in mnemonicWords")
                div.mnemonic-word {{index + 1}} - {{word}}
        
        div.control
            button.button.is-primary.is-fullwidth(@click="next()")
                | Next
        
        div.control
            a(@click="back()").back Back
</template>

<script lang="ts">
    import Vue from 'vue'
    import { radixApplication} from  '@/app/modules/RadixApplication'
    
    export default Vue.extend({
        data() {
            return {
                mnemonic: '',
            }
        },
        mounted() {
            this.mnemonic = radixApplication.getMnemonic()
        },
        computed: {
            mnemonicWords(): string[] {
                return this.mnemonic.split(' ')
            }
        },
        methods: {
            next() {
                radixApplication.mnemonicBackedUp()
            },
            back() {
                radixApplication.goBack()
            },
        },
    })
</script>

<style lang="scss" scoped>

.mnemonic-word {
    background-color: $purple;
    color: $grey-light;
    font-size: 12px;
    text-align: center;
    border-radius: 3px;
    margin: 4px;
    height: 34px;
    line-height: 34px;
}

</style>
