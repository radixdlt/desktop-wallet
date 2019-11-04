<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
    div.wrapper
        div.content
            keep-alive
                component(v-bind:is="stateComponentMap[authenticationState]")
        div.visual
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'
    
    import { radixApplication, RadixApplicationStates } from  '@/app/modules/RadixApplication'

    import InitialSetup from '../components/InitialSetup.vue'
    import Login from './authentication/Login.vue'
    import TermsAndConditions from './authentication/TermsAndConditions.vue'
    
    export default Vue.extend({
        components: {
            InitialSetup,
            Login,
            TermsAndConditions
        },
        data() {
            return {
                stateComponentMap: {
                    [RadixApplicationStates.TERMS_AND_CONDITIONS]: TermsAndConditions,
                    [RadixApplicationStates.DECRYPT_KEYSTORE_PASSWORD_REQUIRED]: Login,
                    [RadixApplicationStates.CREATE_OR_RESTORE]: InitialSetup,
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
        grid-template-columns: 33% auto;
        
        .content {
            grid-column: 1;
            background-color: $white;
        }

        .visual {
            grid-column: 2;
            background-color: aqua;
        }
    }

</style>
