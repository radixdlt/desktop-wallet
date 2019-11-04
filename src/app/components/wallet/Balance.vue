<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.token-menu
            div.token-menu-item(
                v-for="(balance, token_id) in balance", 
                v-bind:class="{active: token_id === activeToken}",
                v-on:click="setActiveToken(token_id)") {{ tokens[token_id].name }}
        div.token-info(v-if="activeToken")
            div.balance
                div.header Balance
                div.funds.selectable {{ balance[activeToken].toString()  }}
                //- img(v-bind:src="'data:image/png;base64,'+tokens[activeToken].icon.data.toString('base64')")
            div.buttons
                button(v-on:click="claimFaucet") Get Test Tokens
                button(v-on:click="openSidebarSend") Send
                button(v-on:click="openSidebarReceive") Receive
</template>

<script lang="ts">
import Vue from 'vue'

import {
    radixTokenManager,
    RadixTransactionBuilder,
    RadixAccount,
    RRI,
    RadixIdentity,
} from 'radixdlt'

import Config from '../../shared/Config'

import { radixApplication }  from '../../modules/RadixApplication'
import Decimal from 'decimal.js'

export default Vue.extend({
    props: {
        identity: {
            type: Object as () => RadixIdentity
        }
    },
    data() {
        return {
            activeToken: '',
            tokens: Object.keys(this.identity.account.transferSystem.tokenUnitsBalance)
                .reduce((output, tokenUri) => {
                    output[tokenUri] = RRI.fromString(tokenUri)
                    return output
                }, {}),
        }
    },
    created() {
        this.activeToken = radixTokenManager.nativeToken.toString()
        
        radixApplication.on('atom-received:transaction', this.update)
    },
    destroyed() {
        radixApplication.removeListener('atom-received:transaction', this.update)
    },
    computed: {
        balance(): {[rri: string]: Decimal} {
            return this.identity.account.transferSystem.tokenUnitsBalance
        }
    },
    mounted() {
        this.$forceUpdate()
    },        
    methods: {
        openSidebarSend() {
            // @ts-ignore
            this.$router.push({name: 'Wallet', params: {sidebar: 'send'}})
        },
        openSidebarReceive() {
            // @ts-ignore
            this.$router.push({name: 'Wallet', params: {sidebar: 'receive'}})
        },
        setActiveToken(token_id) {
            this.activeToken = token_id
        },
        update() {
            this.$forceUpdate()

            this.tokens = Object.keys(this.identity.account.transferSystem.tokenUnitsBalance)
                .reduce((output, tokenUri) => {
                    output[tokenUri] = RRI.fromString(tokenUri)
                    return output
                }, {})
        },
        claimFaucet() {
            const recipient = RadixAccount.fromAddress(Config.faucetAddress, true)
            RadixTransactionBuilder
                .createRadixMessageAtom(this.identity.account, recipient, 'Send me some money, pretty please!')
                .signAndSubmit(this.identity)

            // @ts-ignore
            this.$router.push({ path: `/messaging/chatlist/${Config.faucetAddress}`})
        }
    },
    watch: {
        identity() {
            this.activeToken = radixTokenManager.nativeToken.toString()
        }
    }
})
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: auto;
        height: 100%;
        width: 100%;

        .token-menu {
            padding-bottom: 5px;
            border-bottom: 1px solid  lightgray;

            .token-menu-item {
                display: inline;
                padding-bottom: 8px;
                margin-right: 30px;
                font-size: 12px;
                color: #00101c;
                opacity: 0.5;


                &.active {
                    color: #693cf5;
                    border-bottom: 1px solid #693cf5;
                    opacity: 1;
                }
            }
        }

        .token-info {
            padding: 35px 0 70px 0;

            .balance {
                float: left;

                .header {
                    opacity: 0.3;	
                    color: #00101C;		
                    font-size: 9px;	
                    font-weight: 500;	
                    letter-spacing: 1px;	
                    line-height: 11px;

                    text-transform: uppercase;
                }

                .funds {
                    color: #00101C;	
                    font-size: 32px;	
                    font-weight: 500;	
                    letter-spacing: 0.5px;	
                    line-height: 38px;
                }
            }

            .buttons {
                float: right;

                button {
                    display: inline;
                    width: auto;
                    padding: 0 16px 0 16px;
                    margin-left: 10px;
                }
            }
        }
    }

</style>
