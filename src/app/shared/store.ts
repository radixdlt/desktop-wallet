import Vue from 'vue'
import Vuex from 'vuex'
import { RadixAddress } from 'radixdlt'
import fs from 'fs-extra'
import Contact from './contacts/Contact'
import { WalletAccount } from '@app/modules/account/WalletAccount'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        contacts: <{ [address: string]: Contact }>{},
        contactsFileName: '',

        activeAccount: <WalletAccount>null,
        hardwareWallet: false,
        isSigning: false,
        ledgerAppOpen: false,
        universe: '',
    },
    mutations: {
        addOrUpdateContact({ contacts }, contact: Contact) {
            // Validate address
            RadixAddress.fromAddress(contact.address)

            if (!contact.alias) {
                contact.alias = contact.address
            }

            Vue.set(contacts, contact.address, contact)
        },
        deleteContact({ contacts }, address: string) {
            Vue.delete(contacts, address)
        },
        setActiveAccount(state, account: WalletAccount) {
            state.activeAccount = account
        },
        setHardwareWallet(state, value: boolean) {
            state.hardwareWallet = value
        },
        setIsSigning(state, value: boolean) {
            state.isSigning = value
        },
        setLedgerAppOpen(state, value: boolean) {
            state.ledgerAppOpen = value
        },
        setUniverse(state, universe: string) {
            state.universe = universe
        },
        logout(state) {
            state.activeAccount = null
        },
    },
    actions: {
        async loadContacts({ state, commit }) {
            try {
                const serializedContacts = await fs.readJson(state.contactsFileName)

                // Merge with contacts list
                for (let contact of serializedContacts) {
                    commit('addOrUpdateContact', contact)
                }
            } catch (error) {
                console.log(error)
            }
        },
        async saveContacts({ state }) {
            const serializedContacts = Object.values(state.contacts)

            // TODO: encrypt
            await fs.writeJson(state.contactsFileName, serializedContacts)
        },
    },
    getters: {
        contacts: state => {
            return state.contacts
        },
        contactsFileName: state => {
            return state.contactsFileName
        },
        activeAccount: state => {
            return state.activeAccount
        },
        hardwareWallet: state => {
            return state.hardwareWallet
        },
        isSigning: state => {
            return state.isSigning
        },
        ledgerAppOpen: state => {
            return state.ledgerAppOpen
        },
    },
})
