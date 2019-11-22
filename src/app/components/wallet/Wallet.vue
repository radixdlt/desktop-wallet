<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.main-grayout(v-bind:class="{visible: isSidebarOpen}", v-on:click="closeSidebar()")
        div.main
            div.title
                h1 Wallet 
                //- span.selectable My address: {{ wallet.keyPair.toString() }}
            balance.balance(:identity="identity")
            transactions.transactions(:identity="identity")
        sidebar.sidebar(:identity="identity", v-bind:class="{open: isSidebarOpen}")
</template>

<script lang="ts">
    import Vue from 'vue'
    
    import { radixApplication } from '../../modules/RadixApplication'

    import Balance from './Balance.vue'
    import Transactions from './Transactions.vue'
    import Sidebar from './Sidebar.vue'

    export default Vue.extend({
        components: {
            Balance,
            Transactions,
            Sidebar
        },
        data() {
            return {
                // isSidebarOpen: false
            }
        },    
        methods: {
            closeSidebar() {
                // @ts-ignore
                this.$router.push({name: 'main.dashboard'})
            },
        },
        computed: {
            identity() {
                // @ts-ignore
                return radixApplication.activeIdentity
            },
            isSidebarOpen() {
                // @ts-ignore
                return this.$route.params.sidebar ? true : false
            },
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-columns: 1fr min-content;
        grid-template-rows: auto;
        height: 100%;
        width: 100%;

        .main-grayout {
            grid-column: 1;
            grid-row: 1;

            height: 100%;
            width: 100%;

            opacity: 0.7;
            background-color: #E5EDF1;

            display: none; 

            &.visible {
                display: block;
            }
        }

        .main {
            grid-column: 1 / 3;
            grid-row: 1;
            width: auto;

            display: grid;
            grid-template-columns: auto;
            grid-template-rows: max-content max-content 1fr;
            overflow: hidden;

            min-height: 0;

            padding: 90px 90px 0px 90px;

            .title {
                grid-column: 1;
                grid-row: 1;
                width: 100%;
            }

            .balance {
                grid-column: 1;
                grid-row: 2;
                width: 100%;
            }
            
            .transactions {
                grid-column: 1;
                grid-row: 3;
                width: 100%;
                overflow: hidden;
            }
        }

        .sidebar {
            grid-column: 2;
            grid-row: 1;
            height: 100%;
            width: 0px;
            transition: all 0.2s;
            overflow: hidden;
            z-index: 100;

            &.open {
                width: 380px;
            }
        }
    }

</style>
