<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container.panel
        div.body.navbar
            div.navbar-menu
                div.navbar-start
                  div(v-if="hardwareWallet").navbar-item.hw-wallet-info
                    p Ledger app version: 
                    p(style="font-weight: bold; margin-left: 10px;") {{ hardwareWalletVersion }}
                    p.
                      Connection status:
                    p(v-if="ledgerAppOpen")
                        icon.checkIcon(name="check")
                    p(v-else)
                        icon.crossIcon(name="times")
                div.navbar-end
                    div(v-if="hardwareWallet").navbar-item
                   
                    div.navbar-item.has-dropdown.is-hoverable
                        a.navbar-link {{account.alias}}
                        div.navbar-dropdown
                            a.navbar-item(
                                v-for="acc in favouriteAccounts"
                                v-bind:class="{'is-active': acc === account}"
                                @click="activateAccount(acc)"
                            ) {{acc.alias}}

                            router-link.navbar-item(:to="{name: 'accounts'}") See all accounts
                            hr.navbar-divider
                            a.navbar-item(@click="logout") Logout

                    div.navbar-item.has-dropdown.is-hoverable
                        a.navbar-link Transactions
                        div.navbar-dropdown
                            router-link.navbar-item(:to="{name: 'send'}") Send
                            router-link.navbar-item(:to="{name: 'receive'}") Receive
</template>

<script lang="ts">
import Vue from 'vue'
import { RadixIdentity } from 'radixdlt'
import { WalletAccount } from '../modules/account/WalletAccount'
import { accountManager } from '../modules/account/AccountManager'
import { Subscription } from 'rxjs'
/*
import {
  subscribeConnection,
  ConnectionEvent,
} from '../modules/hardware-wallet-connection'
*/
// import { ledgerApp } from '@radixdlt/hardware-wallet'

export default Vue.extend({
  data() {
    return {
      hardwareWalletVersion: '',
    }
  },
  computed: {
    account(): WalletAccount {
      return this.$store.state.activeAccount
    },
    hardwareWallet(): boolean {
      return this.$store.state.hardwareWallet
    },
    ledgerAppOpen(): boolean {
      return this.$store.state.ledgerAppOpen
    },
  },
  methods: {
    logout() {
      accountManager.logout()
      this.$router.push({ name: 'auth' })
    },
    activateAccount(account) {
      accountManager.setActiveAccount(account)
    },
  },
  subscriptions() {
    return {
      favouriteAccounts: accountManager
        .getAccountsUpdatesObservable()
        .map(accounts => accounts.slice(0, 3)),
    }
  },
  async created() {
    /*
    ledgerApp.getVersion().then(version => {
      this.hardwareWalletVersion = version
    })
    */
  },
})
</script>

<style lang="scss" scoped>
.container {
  padding: 0 20px 0px 20px;

  .body {
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    height: 60px;
    padding: 0 20px;
  }

  .checkIcon {
    margin-left: 10px;
    margin-bottom: 10px;
    color: $green;
  }
  .crossIcon {
    margin-left: 10px;
    margin-bottom: 10px;
    color: $red;
  }
  .hw-wallet-info {
    padding-top: 17px;
    display: grid;
    grid: 1fr / 1fr 1fr 1fr 1fr;
    column-gap: 10px;
  }
}
</style>
