import Vue from 'vue'
import Router from 'vue-router'

import {store} from './store'

import Messaging from '../components/messaging/Messaging'
import ChatList from '../components/messaging/chat/ChatList'
import Contacts from '../components/messaging/contacts/Contacts'
import Wallet from '../components/wallet/Wallet'

import InitialSetup from '../components/InitialSetup'
import Login from '../components/Login'

Vue.use(Router)

export const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/initialsetup',
      name: 'InitialSetup',
      component: InitialSetup
    },
    {
      path: '/messaging',
      name: 'Messaging',
      component: Messaging,
      meta: {
        auth: true
      },
      children: [
        {
          path: 'chatlist/:address?',
          name: 'ChatList',
          component: ChatList
        },
        {
          path: 'contacts',
          name: 'Contacts',
          component: Contacts
        },
        {
          path: '',
          redirect: '/messaging/chatlist'
        }
      ]
    },
    {
        path: '/wallet/:sidebar?/:address?',
        name: 'Wallet',
        component: Wallet,
        meta: {
            auth: true
        }
    },
    {
      path: '*',
      redirect: '/wallet'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.auth && !store.getters.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})
