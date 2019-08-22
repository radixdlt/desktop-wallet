import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const LOGIN = 'LOGIN'
const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
const LOGOUT = 'LOGOUT'

export const store = new Vuex.Store({
  state: {
    isLoggedIn: !!localStorage.getItem('token'),
    contacts: {},
    contactsFileName: ''
  },
  mutations: {
    [LOGIN] (state) {
      state.pending = true
    },
    [LOGIN_SUCCESS] (state) {
      state.isLoggedIn = true
      state.pending = false
    },
    [LOGOUT] (state) {
      state.isLoggedIn = false
    }
  },
  actions: {
    login ({commit}, creds) {
        commit(LOGIN) 
        localStorage.setItem('token', 'logged-in')
        commit(LOGIN_SUCCESS)
    
    },
    logout ({commit}) {
      localStorage.removeItem('token')
      commit(LOGOUT)
    }
  },
  getters: {
    isLoggedIn: state => {
      return state.isLoggedIn
    },
    activeWallet: state => {
      return state.activeWallet
    },
    contacts: state => {
      return state.contacts
    },
    contactsFileName: state => {
      return state.contactsFileName
    }
  }
})
