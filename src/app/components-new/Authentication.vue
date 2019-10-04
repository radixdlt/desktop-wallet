<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
    div.wrapper
        div.content
            initial-setup(v-if="walletManagerState == 'FIRST_TIME_SETUP_PASSWORD_REQUIRED'")
            login(v-if="walletManagerState == 'DECRYPT_KEYSTORE_PASSWORD_REQUIRED'")
            //- router-view.component
        div.visual
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'
    
    import { radixApplication, RadixApplicationStates } from  '../modules/RadixApplication'

    import InitialSetup from '../components/InitialSetup.vue'
    import Login from '../components/Login.vue'
    
    export default Vue.extend({
        components: {
            InitialSetup,
            Login
        },
        data() {
            return {
            }
        },     
        subscriptions: {
            walletManagerState: radixApplication.stateSubject,
        },
        methods: {
            
        },
        mounted: function() {
        }
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
