import Vue from 'vue'
import Router from 'vue-router'
import Contacts from '@app/components/contacts/Contacts.vue'
import Wallet from '@app/components/wallet/Wallet.vue'
import Main from '@app/components/Main.vue'
import Transactions from '@app/components/transactions/Transactions.vue'
import Send from '@app/components/transactions/Send.vue'
import Receive from '@app/components/transactions/Receive.vue'
import Accounts from '@app/components/accounts/Accounts.vue'
import Authentication from '@app/components/Authentication.vue'
import Settings from '@app/components/settings/Settings.vue'
import ChangePassword from '@app/components/settings/ChangePassword.vue'
import { store } from './store'

Vue.use(Router)

export const router = new Router({
    routes: [
        {
            path: '/auth',
            name: 'auth',
            component: Authentication,
        },

        {
            path: '/main',
            component: Main,
            meta: {
                requiresAuth: true
            },
            children: [
                {
                    path: '',
                    name: 'main',
                    redirect: {name: 'dashboard'}
                },
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: Wallet,
                },
                {
                    path: 'transactions',
                    name: 'transactions',
                    component: Transactions,
                    redirect: {name: 'send'},
                    children: [
                        {
                            path: 'send/:address?',
                            name: 'send',
                            component: Send,
                        },
                        {
                            path: 'receive',
                            name: 'receive',
                            component: Receive,
                        },
                    ],
                },
                {
                    path: 'contacts',
                    name: 'contacts',
                    component: Contacts
                },
                {
                    path: 'accounts',
                    name: 'accounts',
                    component: Accounts
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: Settings,
                    redirect: {name: 'changePassword'},
                    children: [
                        {
                            path: 'changePassword',
                            name: 'changePassword',
                            component: ChangePassword,
                        },
                    ],
                },
            ],
        },
        {
            path: '*',
            redirect: 'main'
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && store.state.activeAccount === null) {
        next({name: 'auth'})
    } else {
        next()
    }
})
