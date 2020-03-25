<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container.panel
        div.body.navbar
            div.navbar-menu
                div.navbar-end
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

import { radixApplication }  from '@app/modules/RadixApplication'
import { RadixIdentity } from 'radixdlt'
import { WalletAccount } from '../modules/account/WalletAccount'

export default Vue.extend({
    computed: {
        account(): WalletAccount {
            return this.$store.state.activeAccount
        },
    },
    methods: {
        logout() {
            radixApplication.logout()
            this.$router.push({name: 'auth'})
        },
        activateAccount(account) {
            radixApplication.setActiveAccount(account)
        },
    },
    subscriptions() {
        return {
            favouriteAccounts: radixApplication.accountManager.getAccountsUpdatesObservable()
                .map((accounts) => accounts.slice(0, 3))
        }
    }
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
    }

</style>
