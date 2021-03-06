<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container.panel
        div.header Assets
        div.body
            div.tabs.token-menu
                div.tab(
                    v-for="(token, token_id) in tokens", 
                    v-bind:class="{'is-active': token_id === activeToken}",
                    v-on:click="setActiveToken(token_id)") {{ tokens[token_id].rri.name }}
            div.token-info(v-if="activeToken")
                div.balance
                    div.header Balance
                    div.funds.selectable {{ tokens[activeToken].balance.toString()  }}
                    //- img(v-bind:src="'data:image/png;base64,'+tokens[activeToken].icon.data.toString('base64')")
                div.buttons
                    button.button.is-primary(v-on:click="claimFaucet") Get Test Tokens
                    button.button.is-primary(v-on:click="send") Send
                    button.button.is-primary(v-on:click="receive") Receive
</template>

<script lang="ts">
import Vue from 'vue'

import {
  radixTokenManager,
  RadixTransactionBuilder,
  RadixAccount,
  RRI,
  RadixIdentity,
  RadixSimpleIdentity,
} from 'radixdlt'

import Config from '@app/shared/Config'
import Decimal from 'decimal.js'
import { Subscription } from 'rxjs'
import { accountManager } from '../../modules/account/AccountManager'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import EC, { curves } from 'elliptic'
import { sendFaucetRequest } from '../../modules/send-transactions'

export default Vue.extend({
  data() {
    return {
      activeToken: '',
      tokens: {},
    }
  },
  async created() {
    this.update()
    this.setActiveToken(radixTokenManager.nativeToken.toString())

    accountManager.subscribeToTransferEvents(this.update)
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.activeAccount.identity
    },
    hardwareWallet(): boolean {
      return this.$store.state.hardwareWallet
    },
  },
  mounted() {
    this.update()
  },
  methods: {
    send() {
      this.$router.push({ name: 'send' })
    },
    receive() {
      this.$router.push({ name: 'receive' })
    },
    setActiveToken(token_id) {
      this.activeToken = token_id
    },
    update() {
      const balances = this.identity.account.transferSystem.tokenUnitsBalance
      this.tokens = Object.entries(balances).reduce(
        (output, [uri, balance]) => {
          if (
            !(radixTokenManager.nativeToken.toString() === uri) &&
            balance.equals(0)
          ) {
            if (this.activeToken === uri) {
              this.setActiveToken(radixTokenManager.nativeToken.toString())
            }
            return output
          }
          output[uri] = {
            rri: RRI.fromString(uri),
            balance,
          }
          return output
        },

        {}
      )
      this.$forceUpdate()
    },
    async claimFaucet() {
      await sendFaucetRequest()
    },
  },
  watch: {
    identity() {
      this.update()
      this.setActiveToken(radixTokenManager.nativeToken.toString())
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  .body {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    height: 100%;
    width: 100%;

    .token-menu {
      margin: 6px $panel-padding 0;
    }

    .token-info {
      padding: 35px $panel-padding 70px;

      .balance {
        float: left;

        .header {
          opacity: 0.3;
          color: $text;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 1px;
          line-height: 11px;

          text-transform: uppercase;
        }

        .funds {
          color: $text;
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
          margin-left: 10px;
        }
      }
    }
  }
}
</style>



    