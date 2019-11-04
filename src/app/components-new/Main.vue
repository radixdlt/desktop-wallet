<template lang="pug">
    div.wrapper
        div.main
            div.left-menu
                div.left-menu-list
                    router-link.link(v-for="section in sections", :key="section.name" :to="section.path", tag="span") {{section.name}}
                //- div.extras
                //-     a(@click="exportWallet") Export wallet
            div.content(v-if="identity")
                keep-alive
                    router-view.section
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'

    import {
        radixTokenManager, 
        RadixMessageUpdate, 
        RadixTransactionUpdate, 
        RadixAddress,
        RRI
    } from 'radixdlt'

    import { radixApplication, RadixApplicationStates } from '@/app/modules/RadixApplication'
    import Config from '@/app/shared/Config'

    import fs from 'fs-extra'

    import {filter} from 'rxjs/operators'

    export default Vue.extend({
        data() {
            return {
                sections: [
                    { path: '/main/dashboard', name: 'Dashboard'},
                    { path: '/main/contacts', name: 'Contacts'}
                ],
            }
        },
        created() {
            
        },   
        methods: {
            
        },
        computed: {
            identity: function () {
                return radixApplication.activeIdentity
            },
            contacts: function () {
                // @ts-ignore
                return this.$store.state.contacts[this.identity.account.getAddress()]
            }
        }
    })
</script>

<style lang="scss">

    

</style>

<style lang="scss" scoped>

    .wrapper {
        height: 100vh;
        width: 100vw;
    }
    .main {
        display: grid;
        grid-template-columns: 220px auto;
        grid-template-rows: 50px auto;
        height: 100%;
        width: 100%;
    }

    .content {
        grid-column: 2 / 2;
        grid-row: 2 / 2;
        background-color: #e1eaef;
        overflow: hidden;
        .section {
            width: 100%;
            height: 100%;
        }
    }

    .left-menu {
        grid-column: 1 / 1;
        grid-row: 2 / 2;
        background-color: #00111a;
        
        .left-menu-list {
            margin: 0;
            padding: 0;
        }
        .link {
            font-family: GothamMedium, sans-serif;
            display: block;
            padding-left: 40px;
            margin-bottom: 26px;
            opacity: 0.6;
            color: #cde9ff;
            font-size: 14px;
            letter-spacing: 1px;
            &.router-link-active {
                padding-left: 36px;
                opacity: 1;
                color: #14E1DB !important;
                border-left: 4px solid;
                text-shadow: 0 10px 30px 0 rgba(109, 66, 252, 0.2);
            }

            &:hover {
                opacity: 1;
            }
        }
        .logo {
            margin: 10px 0 52px 40px;
        }

        .extras {
            position: absolute;
            bottom: 0;
            padding-bottom: 26px;

            a {
                font-family: GothamLight, sans-serif;
                padding-left: 40px;
                margin-bottom: 26px;
                opacity: 0.6;
                color: #cde9ff;
                font-size: 14px;
                letter-spacing: 1px;

                &:hover {
                    opacity: 1;
                }
            }
            
        }
    }
    .test {
        color: rebeccapurple;
    }

</style>
