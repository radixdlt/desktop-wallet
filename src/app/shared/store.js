import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    contacts: {},
    contactsFileName: ''
  },
  mutations: {
  },
  actions: {
  },
  getters: {
    contacts: state => {
      return state.contacts
    },
    contactsFileName: state => {
      return state.contactsFileName
    }
  }
})
