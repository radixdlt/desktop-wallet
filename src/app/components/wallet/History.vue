<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container.panel
        div.header Recent transactions
        div.transaction-list.body
            div.no-transactions(v-if="transactions.length === 0") 
                p You don't have any transaction history yet

            div.transactons-table(v-if="transactions.length > 0")
                div.transaction.header-row
                    div.time Timestamp
                    div.info Participants
                    div.balance Balance
                    div.buttons Actions

                div.transaction(v-for="transaction in transactions") 
                    div.time {{transaction.time}}
                    div.icon
                        icon.direction-icon.sent(name="regular/arrow-alt-circle-up", v-if="transaction.balance < 0")
                        icon.direction-icon.received(name="regular/arrow-alt-circle-down", v-else)       
                    div.info
                        div.explaination {{transaction.balance < 0 ? 'Sent' : 'Received' }} {{ transaction.token.label }}
                        div.selectable.address {{transaction.balance < 0 ? 'To' : 'From' }} {{ transaction.displayName }}
                        div.message Note: {{transaction.message}}
                    div.balance
                        span.value {{ transaction.balance }} 
                        span.token {{ transaction.token.name }}
                    div.buttons
                        span.transaction-button-container(@click="$router.push({ name: 'send', params: { address: transaction.address }})") 
                            icon.action.transaction-icon(name="external-link-square-alt")
            
</template>

<script lang="ts">
    import Vue from 'vue'
    import _ from 'lodash'
    
    import { 
        radixTokenManager, 
        RRI,
        RadixIdentity,
        RadixTransaction,
    } from 'radixdlt'

    import { radixApplication } from '../../modules/RadixApplication'
    import moment from 'moment'

    export default Vue.extend({
        data() {
            return {
                transactions: [],
            }
        },
        created() {
            radixApplication.on('atom-received:transaction', this.updateTransactionList)
        },
        destroyed() {
            radixApplication.removeListener('atom-received:transaction', this.updateTransactionList)
        },
        activated() {
            this.updateTransactionList()
        },        
        methods: {
            updateTransactionList() {
                const rawTransactions = this.identity.account.transferSystem.transactions.values()

                this.transactions = _.orderBy(rawTransactions, ['timestamp'], ['desc'])
                    .map((transaction: RadixTransaction) => {
                        const token_id = Object.keys(transaction.balance)[0] // Assume single token transactions
                        const token = this.tokens[token_id]
                        const timeString = moment(transaction.timestamp).format('DD/MM/Y \n HH:mm')
                        const address = Object.keys(transaction.participants)[0] // Assume single participant transactions
                        const message = transaction.message

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
                            message,
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
                return this.$store.state.contacts
            },
            identity(): RadixIdentity {
                return this.$store.state.activeAccount.identity
            },
        },
        watch: {
            contacts() {
                this.updateTransactionList()
            },
            identity() {
                this.updateTransactionList()
            }
        },
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

        .transaction-list {
            overflow: auto;
            grid-column: 1;
            grid-row: 2;

            .no-transactions {
                display: flex; 
                width: 100%;
                height: 100%;

                p {
                    margin: auto; 
                    text-align: center; 
                }
            }

            .transaction {
                width: 100%;
                min-height: 60px;
                border-bottom: 1px solid $grey-light;

                display: grid;
                grid-template-columns: 70px 50px auto 140px 70px;

                align-items: center;
                padding: 0 $panel-padding;

                &.header-row {
                    height: 40px;

                    div {
                        font-size: 12px !important; 
                        color: $grey !important;
                        line-height: 40px !important;
                        font-weight: 500 !important;
                        margin: 0 !important;
                    }
                }

                .time {
                    grid-column: 1;
	
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
                            color: $red;
                        }

                        &.received {
                            color: $green;
                        }
                    }
                }

                .info {
                    grid-column: 3;

                    .explaination {
                        font-size: 13px;
                        font-weight: 500;	
                        line-height: 16px;
                    }

                    .address {
                        margin-top: 4px;
                        color: $grey;
                        font-size: 10px;
                        font-weight: 300;
                        line-height: 13px;
                    }

                    .message {
                        margin-top: 8px;
                        color: $grey;
                        font-size: 10px;
                        font-weight: 300;
                        line-height: 13px;
                    }
                }

                .balance {
                    grid-column: 4;

                    text-align: right;
                    font-size: 14px;	
                    font-weight: 500;	
                    line-height: 17px;
                }

                .buttons {
                    grid-column: 5;
                    justify-content: flex-end;

                    span {
                        margin-left: 20px;

                        .action {
                            color: $grey;

                            &:hover {
                                color: $grey-dark;
                            }
                        }        
                    }
                }
            }
        }
    }

</style>
