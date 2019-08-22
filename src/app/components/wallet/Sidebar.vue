<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.menu
            div.menu-item.send(v-bind:class="{active: activeSection == 'send'}", v-on:click="goToSend()") Send 
            div.menu-item.receive(v-bind:class="{active: activeSection == 'receive'}", v-on:click="goToReceive()") Receive 
        div.content
            send.component(:identity="identity", v-show="activeSection == 'send'")
            receive.component(:identity="identity", v-show="activeSection == 'receive'")
</template>

<script lang="ts">
    import Vue from 'vue'

    import Send from './Send.vue'
    import Receive from './Receive.vue'

    export default Vue.extend({
        components: {
            Send,
            Receive,
        },
        props: [
            'identity'
        ],
        data() {
            return {
            }
        },
        computed: {
            activeSection() {
                // @ts-ignore
                if (this.$route.params.sidebar === 'receive') {
                    return 'receive'
                }
                return 'send'
            }
        }, 
        methods: {
            goToSend() {
                // @ts-ignore
                this.$router.push({name: 'Wallet', params: {sidebar: 'send'}})
            },
            goToReceive() {
                // @ts-ignore
                this.$router.push({name: 'Wallet', params: {sidebar: 'receive'}})
            },
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: max-content auto;
        height: 100%;
        width: 380px;
        background-color: #ECF2F5;

        .menu {
            grid-column: 1;
            grid-row: 1;

            display: grid;
            grid-template-columns: 1fr 1fr;

            .menu-item {
                display: inline;
                color: #00111A;
                background-color: #DBE5EA;
                padding: 0px 10px 0px 0px;
                height: 50px;
                text-align: center;
                line-height: 50px;

                &.send {
                    grid-column: 1;
                }

                &.receive {
                    grid-column: 2;
                }

                &.active {
                    background-color: #ECF2F5;
                }
            }
        }
        .content {
            grid-column: 1;
            grid-row: 2;
            padding: 30px;

            .component {
                height: 100%;
                width: 100%;
            }
        }
    }
    
</style>
