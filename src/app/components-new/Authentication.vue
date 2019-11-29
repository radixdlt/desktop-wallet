<template lang="pug">
    // Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
    div
        div.wrapper
            div.content
                keep-alive
                    component(v-bind:is="stateComponentMap[authenticationState]")
            div.visual
                div.fill.relative
                    p.send-money-tokens.
                        Send #[span.highlight Money] #[br] & #[span.highlight Tokens] instantly
</template>

<script lang="ts">
    import Vue from 'vue'

    import { radixApplication, RadixApplicationStates } from '@/app/modules/RadixApplication'

    import CreateOrRestore from './authentication/CreateOrRestore.vue'
    import Login from './authentication/Login.vue'
    import TermsAndConditions from './authentication/TermsAndConditions.vue'
    import MnemonicBackup from './authentication/MnemonicBackup.vue'
    import MnemonicVerify from './authentication/MnemonicVerify.vue'
    import PasswordSet from './authentication/PasswordSet.vue'
    import MnemonicRestore from './authentication/MnemonicRestore.vue'

    export default Vue.extend({
        components: {
            CreateOrRestore,
            Login,
            TermsAndConditions,
            MnemonicBackup,
            MnemonicVerify,
            PasswordSet,
            MnemonicRestore,
        },
        data() {
            return {
                stateComponentMap: {
                    [RadixApplicationStates.TERMS_AND_CONDITIONS]: TermsAndConditions,
                    [RadixApplicationStates.DECRYPT_KEYSTORE_PASSWORD_REQUIRED]: Login,
                    [RadixApplicationStates.CREATE_OR_RESTORE]: CreateOrRestore,
                    [RadixApplicationStates.MNEMONIC_BACKUP]: MnemonicBackup,
                    [RadixApplicationStates.MNEMONIC_VERIFY]: MnemonicVerify,
                    [RadixApplicationStates.PASSWORD_SET]: PasswordSet,
                    [RadixApplicationStates.MNEMONIC_RESTORE]: MnemonicRestore,
                }
            }
        },
        subscriptions: {
            authenticationState: radixApplication.stateSubject,
        },
    })
</script>

<style lang="scss" scoped>
    .wrapper {
        height: 100%;
        width: 100%;

        display: grid;
        grid-template-columns: 37% auto;

        .content {
            grid-column: 1;
            background-color: $white;
        }

        .visual {
            grid-column: 2;
            background-image: url("../assets/png/auth-main.png");
            background-position: right;
            background-repeat: no-repeat;
            background-size: cover;

            .send-money-tokens {
                position: absolute;
                bottom: 60px;
                left: 60px;
                width: 300px;
                font-size: 56px;
                color: $white;
                text-transform: uppercase;
                line-height: 1.07;

                .highlight {
                    color: $primary;
                }
            }
        }
    }
</style>
