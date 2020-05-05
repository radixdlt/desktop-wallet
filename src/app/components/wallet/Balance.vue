<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container.panel
        div.header Assets
        div.body
            div.tabs.token-menu
                div.tab(
                    v-for="(balance, token_id) in balance", 
                    v-bind:class="{'is-active': token_id === activeToken}",
                    v-on:click="setActiveToken(token_id)") {{ tokens[token_id].name }}
            div.token-info(v-if="activeToken")
                div.balance
                    div.header Balance
                    div.funds.selectable {{ balance[activeToken].toString()  }}
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
} from 'radixdlt'

import Config from '@app/shared/Config'

import { radixApplication } from '@app/modules/RadixApplication'
import Decimal from 'decimal.js'

export default Vue.extend({
  data() {
    return {
      activeToken: '',
      tokens: {},
    }
  },
  created() {
    this.update()
    this.setActiveToken(radixTokenManager.nativeToken.toString())

    radixApplication.on('atom-received:transaction', this.update)
  },
  destroyed() {
    radixApplication.removeListener('atom-received:transaction', this.update)
  },
  computed: {
    balance(): { [rri: string]: Decimal } {
      return this.identity.account.transferSystem.tokenUnitsBalance
    },
    identity(): RadixIdentity {
      return this.$store.state.activeAccount.identity
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
      this.tokens = Object.keys(
        this.identity.account.transferSystem.tokenUnitsBalance
      ).reduce((output, tokenUri) => {
        output[tokenUri] = RRI.fromString(tokenUri)
        return output
      }, {})

      this.$forceUpdate()
    },
    claimFaucet() {
      let faucetAddress

      try {
        const request = new XMLHttpRequest()
        request.open('GET', '../universe.json', false)
        request.send(null)
        const json = JSON.parse(request.responseText)
        if (json.faucetAddress) {
          faucetAddress = json.faucetAddress
        }
      } catch (e) {
        faucetAddress = Config.faucetAddress
      }

      const recipient = RadixAccount.fromAddress(faucetAddress, true)
      RadixTransactionBuilder.createRadixMessageAtom(
        this.identity.account,
        recipient,
        'Send me some money, pretty please!'
      ).signAndSubmit(this.identity)
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
