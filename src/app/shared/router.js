import Vue from 'vue'
import Router from 'vue-router'


import { radixApplication } from '@app/modules/RadixApplication'

import Contacts from '@app/components/messaging/contacts/Contacts'
import Wallet from '@app/components/wallet/Wallet'
import Main from '@app/components-new/Main'

import InitialSetup from '@app/components/InitialSetup'
import Login from '@app/components-new/authentication/Login'

import Authentication from '@app/components-new/Authentication.vue'

Vue.use(Router)

export const router = new Router({
  routes: [
    {
      path: '/auth',
      component: Authentication,
      children: [
        {
            path: 'login',
            name: 'auth.login',
            component: Login,
        },
        {
            path: 'initial-setup',
            name: 'auth.initial-setup',
            component: InitialSetup
        },
      ],
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
                redirect: { name: 'main.dashboard' }
            },
            {
                path: 'dashboard',
                name: 'main.dashboard',
                component: Wallet,
            },
            {
                path: 'contacts',
                name: 'main.contacts',
                component: Contacts
            },
        ],
    },
    {
      path: '*',
      redirect: 'main'
    }
  ]
})
// export const router = new Router({
//   routes: [
//     {
//       path: '/login',
//       name: 'Login',
//       component: Login
//     },
//     {
//       path: '/initialsetup',
//       name: 'InitialSetup',
//       component: InitialSetup
//     },
//     {
//       path: '/messaging',
//       name: 'Messaging',
//       component: Messaging,
//       meta: {
//         auth: true
//       },
//       children: [
//         {
//           path: 'chatlist/:address?',
//           name: 'ChatList',
//           component: ChatList
//         },
//         {
//           path: 'contacts',
//           name: 'Contacts',
//           component: Contacts
//         },
//         {
//           path: '',
//           redirect: '/messaging/chatlist'
//         }
//       ]
//     },
//     {
//         path: '/wallet/:sidebar?/:address?',
//         name: 'Wallet',
//         component: Wallet,
//         meta: {
//             auth: true
//         }
//     },
//     {
//       path: '*',
//       redirect: '/wallet'
//     }
//   ]
// })

router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (!radixApplication.activeIdentity) {
            next('auth')
        } else {
            next()
        }
    } else {
        next()
    }
})
