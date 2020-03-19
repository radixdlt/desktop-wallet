import Vue from 'vue'
import Router from 'vue-router'
import Contacts from '@app/components-new/contacts/Contacts.vue'
import Wallet from '@app/components/wallet/Wallet.vue'
import Main from '@app/components-new/Main.vue'
import Transactions from '@app/components-new/transactions/Transactions.vue'
import Send from '@app/components-new/transactions/Send.vue'
import Receive from '@app/components-new/transactions/Receive.vue'
import AccountList from '@app/components-new/accounts/AccountList.vue'
import Authentication from '@app/components-new/Authentication.vue'
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
                    component: AccountList
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
