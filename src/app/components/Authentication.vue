<template lang="pug">
    // Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
    div
        div.wrapper
            div.header
            div.interface
                keep-alive
                    component(v-bind:is="stateComponentMap[authenticationState]")
            div.visual
                div.fill.relative
                    p.send-money-tokens.
                        Send #[span.highlight Money] #[br] & #[span.highlight Tokens] instantly
</template>

<script lang="ts">
    import Vue from 'vue'
    import CreateOrRestore from './authentication/CreateOrRestore.vue'
    import Login from './authentication/Login.vue'
    import TermsAndConditions from './authentication/TermsAndConditions.vue'
    import MnemonicBackup from './authentication/MnemonicBackup.vue'
    import MnemonicVerify from './authentication/MnemonicVerify.vue'
    import PasswordSet from './authentication/PasswordSet.vue'
    import MnemonicRestore from './authentication/MnemonicRestore.vue'
import { AppState, stateSubject } from '../modules/application-state'

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
                    [AppState.TERMS_AND_CONDITIONS]: TermsAndConditions,
                    [AppState.DECRYPT_KEYSTORE_PASSWORD_REQUIRED]: Login,
                    [AppState.CREATE_OR_RESTORE]: CreateOrRestore,
                    [AppState.MNEMONIC_BACKUP]: MnemonicBackup,
                    [AppState.MNEMONIC_VERIFY]: MnemonicVerify,
                    [AppState.PASSWORD_SET]: PasswordSet,
                    [AppState.MNEMONIC_RESTORE]: MnemonicRestore,
                },
            }
        },
        subscriptions: {
            authenticationState: stateSubject,
        },
    })
</script>

<style lang="scss" scoped>
    .wrapper {
        height: 100%;
        width: 100%;

        display: grid;
        grid-template-columns: 37% auto;
        grid-template-rows: 30px 1fr;

        .header {
            grid-row: 1;
            grid-column: 1 / 3;
            background-color: $white;
        }

        .interface {
            grid-row: 2;
            grid-column: 1;
            background-color: $white;
        }

        .visual {
            grid-row: 2;
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
