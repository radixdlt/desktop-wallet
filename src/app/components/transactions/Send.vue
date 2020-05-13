<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.form
            div.field
                router-link(:to="{name: 'contacts'}") View my contacts
            
            div.field
                label.label.is-small To
                div.control
                    input.input(type="text", placeholder="Recipient", v-model="address", @keyup.enter="send()")  
                // v-autocomplete(:items="contacts", v-model="address", :get-label="getContactLabel", :component-item='template')
            div.field
                div.columns
                    div.field.column.is-half
                        div.columns
                            div.column.is-half
                                label.label.is-small Amount
                            div.column.is-half
                                a.is-small.is-pulled-right.send-all(@click="sendAll()") Send all
                        div.control
                            input.input(type="text", placeholder="Enter amount", v-model="amount", @keyup.enter="send()")    

                    div.field.column.is-half
                        label.label.is-small Token
                        div.control
                            div.select.is-fullwidth
                                select(v-model="token_id")
                                    option(v-for="token in tokens", v-bind:value="token.id") {{token.label}}
                                    option(v-if="tokens.length === 0", disabled, value="") No tokens

            div.field
                label.label.is-small Message
                div.control
                    input.input(type="text", placeholder="Your message", v-model="message", @keyup.enter="send()") 
            
            div.field.columns
                div.control.column.is-half.is-offset-one-quarter
                    button.button.is-primary.is-fullwidth.send(@click="send()") Send
            
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

import { radixApplication } from '@app/modules/RadixApplication'

import RadixContactItemTemplate from './RadixContactItemTemplate.vue'
import Decimal from 'decimal.js'

export default Vue.extend({
  data() {
    return {
      address: '',
      amount: '',
      token_id: '',
      message: '',
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
    this.getRouteAddress()
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.activeAccount.identity
    },
    balance(): { [tokenId: string]: Decimal } {
      return this.identity.account.transferSystem.tokenUnitsBalance
    },
    tokens(): any[] {
      const tokens = []
      for (let token_id in this.balance) {
        const tokenReference = RRI.fromString(token_id)

        if (this.balance[token_id].gt(0)) {
          tokens.push({
            id: token_id,
            label: tokenReference.name,
          })
        }
      }

      tokens.sort((t1, t2) => {
        if (radixTokenManager.nativeToken.toString() === t1.id) {
          return -1
        }
        return t1.label.localeCompare(t2.label)
      })

      return tokens
    },
  },
  watch: {
    $route(to, from) {
      this.getRouteAddress()
    },
  },
  methods: {
    send() {
      this.transactionStatus = 'Sending...'

      try {
        const to = RadixAccount.fromAddress(this.address, true)

        const transactionStatusSubject = RadixTransactionBuilder.createTransferAtom(
          this.identity.account,
          to,
          this.token_id,
          this.amount,
          this.message
        ).signAndSubmit(this.identity)

        transactionStatusSubject.subscribe({
          next: update => {
            if (update.status === 'SUBMITTED') {
              this.transactionStatus = 'Submitted.'
            }
          },
          complete: () => {
            this.transactionStatus = 'Transaction successful.'
            this.amount = ''
          },
          error: error => {
            console.error(error)
            this.transactionStatus = `Transaction failed: ${error.status}`
          },
        })
      } catch (error) {
        console.error(error)
        this.transactionStatus = error.status
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
    },
    sendAll() {
      this.amount = this.balance[this.token_id].toString()
    },
    getRouteAddress() {
      // @ts-ignore
      if (this.$route.params.address) {
        // @ts-ignore
        this.address = this.$route.params.address
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;

  .columns,
  .column {
    margin-bottom: 0;
    margin-top: 0;
    padding-bottom: 0;
    padding-top: 0;
  }

  .send-all {
    font-size: 10px;
    margin-bottom: 0.5em;
  }
}
</style>
