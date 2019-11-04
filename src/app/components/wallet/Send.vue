<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        // div.title
            // h4 Send 
        div.form
            router-link(to="/messaging/contacts") View my contacts
            input(type="text", placeholder="Recipient", v-model="address", @keyup.enter="send()")  
            // v-autocomplete(:items="contacts", v-model="address", :get-label="getContactLabel", :component-item='template')
            label Token
            select(v-model="token_id")
                option(v-for="token in tokens", v-bind:value="token.id") {{token.label}}
                option(v-if="tokens.length === 0", disabled, value="") No tokens
            input(type="text", placeholder="Amount", v-model="amount", @keyup.enter="send()")    
            button.send(v-on:click="send()") Send
            span.status {{transactionStatus}}
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

    import { radixApplication } from '../../modules/RadixApplication'
    
    import RadixContactItemTemplate from './RadixContactItemTemplate.vue'
import BN from 'bn.js'

    export default Vue.extend({
        props: {
            identity: {
                type: Object as () => RadixIdentity
            }
        },
        data() {
            return {
                address: '',
                amount: '',
                token_id: '',
                transactionStatus: '',
                contacts: [],
                template: RadixContactItemTemplate,
            }
        },
        created() {            
            radixApplication.on('atom-received:transaction', this.update)
            radixApplication.on('contact-added', this.update)
        },
        destroyed() {
            radixApplication.removeListener('atom-received:transaction', this.update)
            radixApplication.removeListener('contact-added', this.update)
        },
        mounted() {
            this.update()
        },
        computed: {
            balance(): { [tokenId: string]: BN} {
                // @ts-ignore
                return this.identity.account.transferSystem.balance
            },
            tokens(): any[] {
                const tokens = []
                for (let token_id in this.balance) {
                    const tokenReference = RRI.fromString(token_id)

                    if(this.balance[token_id].ltn(0)) {
                        tokens.push({
                            id: token_id,
                            label: tokenReference.name
                        })
                    }
                }

                tokens.sort((t1, t2) => t1.label.localeCompare(t2.label))

                return tokens
            },
        },
        watch: {
            $route(to, from) {
                // @ts-ignore
                if (this.$route.params.address) {
                    // @ts-ignore
                    this.address = this.$route.params.address
                }
            }
        },      
        methods: {
            send() {
                this.transactionStatus = 'Sending...'

                try {
                    const to = RadixAccount.fromAddress(this.address, true)

                    const transactionStatusSubject = RadixTransactionBuilder
                        .createTransferAtom(this.identity.account, to, this.token_id, this.amount)
                        .signAndSubmit(this.identity)

                    transactionStatusSubject.subscribe({
                        next: (status) => {
                            // Maybe show status
                        },
                        complete: () => {
                            this.transactionStatus = 'Sent'
                            this.amount = ''
                        },
                        error: (error) => {
                            console.error(error)
                            this.transactionStatus = error.message
                        }
                    })
                } catch (error) {
                    console.error(error)
                    this.transactionStatus = error.message
                }
            },
            update() {
                if (!this.token_id && this.tokens.length > 0) {
                    this.token_id = this.tokens[0].id
                }

                this.$forceUpdate()
            },
            getContactLabel(contact) {
                if (contact.alias !== contact.address) {
                    return contact.alias + ' ' + contact.address
                }
                return contact.address
            }
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: max-content auto;
        height: 100%;
        width: 100%;

        .title {
            grid-column: 1;
            grid-row: 1;
        }

        .balance {
            grid-column: 1;
            grid-row: 2;
        }
    }

</style>
