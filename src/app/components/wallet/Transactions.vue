<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.title Recent transactions         
        div.transaction-list
            div.transaction(v-for="transaction in transactions") 
                div.time {{transaction.time}}
                div.icon
                    icon.direction-icon.sent(name="regular/arrow-alt-circle-up", v-if="transaction.balance < 0")
                    icon.direction-icon.received(name="regular/arrow-alt-circle-down", v-else)       
                div.info
                    span.explaination {{transaction.balance < 0 ? 'Sent' : 'Received' }} {{ transaction.token.label }}
                    br
                    span.selectable.address {{transaction.balance < 0 ? 'To' : 'From' }} {{ transaction.displayName }}
                div.balance
                    span.value {{ transaction.balance }} 
                    span.token {{ transaction.token.name }}
                div.buttons
                    span.chat-button-container(v-on:click="$router.push({ path: '/messaging/chatlist/' + transaction.address })")
                        icon.button.chat-button(name="regular/comment-alt")
                    span.transaction-button-container(v-on:click="$router.push({ name: 'main.dashboard', params: { sidebar: 'send', address: transaction.address }})") 
                        icon.button.transaction-icon(name="exchange-alt")
</template>

<script lang="ts">
    import Vue from 'vue'
    import _ from 'lodash'
    
    import { 
        radixTokenManager, 
        RRI,
        RadixIdentity,
    } from 'radixdlt'

    import { radixApplication } from '../../modules/RadixApplication'

    export default Vue.extend({
        props: {
            identity: {
                type: Object as () => RadixIdentity
            }
        },
        data() {
            return {
                transactions: [],
            }
        },
        created() {
            radixApplication.on('atom-received:transaction', this.updateTransactionList)
            radixApplication.on('contact-added', this.updateTransactionList)
        },
        destroyed() {
            radixApplication.removeListener('atom-received:transaction', this.updateTransactionList)
            radixApplication.removeListener('contact-added', this.updateTransactionList)
        },
        mounted() {
            this.updateTransactionList()
        },        
        methods: {
            updateTransactionList() {
                const rawTransactions = this.identity.account.transferSystem.transactions.values()

                this.transactions = _.orderBy(rawTransactions, ['timestamp'], ['desc'])
                    .map((transaction) => {
                        const token_id = Object.keys(transaction.balance)[0] // Assume single token transactions
                        const token = this.tokens[token_id]
                        const timeString = new Date(transaction.timestamp).toLocaleTimeString()
                        const address = Object.keys(transaction.participants)[0] // Assume single participant transactions
                        
                        let displayName = address
                        if (address in this.contacts) {
                            displayName = this.contacts[address].alias       
                        }

                        return {
                            token: token,
                            balance: transaction.tokenUnitsBalance[token_id].toString(),
                            address: address, 
                            displayName: displayName,
                            time: timeString,
                        }
                    })

                this.$forceUpdate()
            }
        },
        computed: {
            tokens(): {[key: string]: RRI} {
                return Object.keys(this.identity.account.transferSystem.tokenUnitsBalance)
                    .reduce((output, tokenUri) => {
                        output[tokenUri] = RRI.fromString(tokenUri)
                        return output
                    }, {})
            },
            contacts(): any {
                // @ts-ignore
                return this.$store.state.contacts[this.identity.account.getAddress()]
            },
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: max-content 1fr;
        width: 100%;
        height: 100%;
        min-height: 0;

        .title {
            grid-column: 1;
            grid-row: 1;
            margin-bottom: 20px;

            color: #00101C;	
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.25px;	
            line-height: 13px;
        }

        .transaction-list {
            grid-column: 1;
            grid-row: 2;

            overflow: auto;
            border-top: 1px solid lightgray;

            padding: 0 5px 25px 5px;

            .transaction {
                width: 100%;
                height: 60px;
                border-bottom: 1px solid lightgray;

                display: grid;
                grid-template-columns: 70px 50px auto 140px 70px;

                align-items: center;
                padding: 0 10px 0 10px;

                .time {
                    grid-column: 1;

                    opacity: 0.5;	
                    color: #00101C;		
                    font-size: 12px;	
                    font-weight: 500;	
                    letter-spacing: 0.5px;	
                    line-height: 14px;
                }

                .icon {
                    grid-column: 2;

                    .direction-icon{

                        width: 31px;
                        height: 31px;

                        &.sent {
                            color: #14E1DB;
                        }

                        &.received {
                            color: #693CF5;
                        }
                    }
                }

                .info {
                    grid-column: 3;

                    .explaination {
                        color: #00101C;	
                        font-size: 13px;
                        font-weight: 500;	
                        line-height: 16px;
                    }

                    .address {
                        color: #5A666E;
                        font-size: 10px;
                        font-weight: 300;
                        line-height: 13px;
                    }
                }

                .balance {
                    grid-column: 4;

                    text-align: right;
                    color: #00101C;	
                    font-size: 14px;	
                    font-weight: 500;	
                    line-height: 17px;
                }

                .buttons {
                    grid-column: 5;

                    span {
                        margin-left: 10px;

                        .button {
                            color: #693cf5;
                        }

                        .transaction-icon {
                            color: #35b0e5;
                        }         
                    }
                }
            }
        }
    }

</style>
