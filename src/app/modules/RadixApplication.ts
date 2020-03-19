
import { BehaviorSubject, Subject, Subscription } from 'rxjs'

import {
  radixUniverse,
  RadixUniverse,
  RadixKeyStore,
  RadixIdentityManager,
  RadixSimpleIdentity,
  RadixIdentity,
  RadixTransactionUpdate,
  RadixMessageUpdate,
  RadixLogger,
  RadixNEDBAtomStore,
  RadixAtomStore,
  RadixAddress,
} from 'radixdlt'

import Config from '../shared/Config'
import fs from 'fs-extra'
import * as events from 'events'
import { settingsStore } from './SettingsStore'

import * as bip39 from 'bip39'
import AccountManager from './account/AccountManager'
import { WalletAccount } from './account/WalletAccount'
import Vue from 'vue'
import { store } from '../shared/store'

export  enum RadixApplicationStates {
    STARTING = 'STARTING',
    TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
    DECRYPT_KEYSTORE_PASSWORD_REQUIRED = 'DECRYPT_KEYSTORE_PASSWORD_REQUIRED',
    CREATE_OR_RESTORE = 'CREATE_OR_RESTORE',


    // create flow
    MNEMONIC_BACKUP = 'MNEMONIC_BACKUP',
    MNEMONIC_VERIFY = 'MNEMONIC_VERIFY',
    PASSWORD_SET = 'PASSWORD_SET',
    
    // restore flow
    MNEMONIC_RESTORE = 'MNEMONIC_RESTORE',

    READY = 'READY'
}

export declare interface RadixApplication {
  on(event: 'atom-received:transaction', listener: () => void): this
  on(event: 'atom-received:message', listener: () => void): this
  on(event: string, listener: Function): this
}

export class RadixApplication extends events.EventEmitter {

    public stateSubject: BehaviorSubject<RadixApplicationStates> = new BehaviorSubject(RadixApplicationStates.STARTING)
    private stateHistory: RadixApplicationStates[] = []

    public accountManager: AccountManager

    public dataDir: string
    public keystoreFileName: string
    public authDBFileName: string
    public atomDBFileName: string
    public keystorePassword: string

    private transferSubscription: Subscription
    public transactionUpdateSubject: Subject<RadixTransactionUpdate> = new Subject()
    public messageUpdateSubject: Subject<RadixMessageUpdate> = new Subject()

    readonly wordlist = bip39.wordlists.english

    private atomStore: RadixAtomStore

    constructor() {
        super()
    }

    initialize(dataDir: string) {
        RadixLogger.setLevel('debug')

        if (!(Config.universe in RadixUniverse)) {
            throw new Error(`Invalid universe config ${Config.universe}`)
        }

        this.dataDir = dataDir
        this.keystoreFileName = dataDir + '/keystore.json'
        this.authDBFileName = dataDir + `/apps.db`
        this.atomDBFileName = dataDir + `atoms-${Config.universe}-${Config.dbVersion}.db`

        this.atomStore = RadixNEDBAtomStore.createPersistedStore(this.atomDBFileName)

        // Initialize universe
        radixUniverse.bootstrap(RadixUniverse[Config.universe], this.atomStore)

        this.accountManager = new AccountManager(this.keystoreFileName)

        this.transactionUpdateSubject.subscribe((transactionUpdate) => {
            this.emit('atom-received:transaction', transactionUpdate)
        })

        this.checkTerms()
    }

    
    /**
     * Check whether terms and conditions have been accepted
     * Go to TERMS_AND_CONDITIONS or start authentication flow
     */
    public checkTerms() {
        if (!settingsStore.get('termsAccepted')) {
            this.setState(RadixApplicationStates.TERMS_AND_CONDITIONS)
        } else {
            this.loadKeystore()
        }
    }

    /**
     * Store in settings that terms and conditions have been accepted
     * Start authentication flow
     */
    public acceptTerms() {
        settingsStore.set('termsAccepted', true)
        this.loadKeystore()
    }
    
    /**
     * Check if the keystore file exists on disk
     * Go to either DECRYPT_KEYSTORE_PASSWORD_REQUIRED or CREATE_OR_RESTORE
     */
    public async loadKeystore() {
        // Check if keystore file exists
        const exists = await fs.pathExists(this.keystoreFileName)

        if (exists) {
            this.setState(RadixApplicationStates.DECRYPT_KEYSTORE_PASSWORD_REQUIRED)
        } else {
            this.setState(RadixApplicationStates.CREATE_OR_RESTORE)
        }
    }

    /**
     * Generate a new mnemonic, go to MNEMONIC_BACKUP
     */
    public createWallet() {
        this.accountManager.generateMnemonic()
        this.setState(RadixApplicationStates.MNEMONIC_BACKUP)
    }
    
    /**
     * Get the generated mnemonic
     */
    public getMnemonic() {
        return this.accountManager.mnemonic
    }
    
    /**
     * Go to MNEMONIC_VERIFY
     */
    public mnemonicBackedUp() {
        this.setState(RadixApplicationStates.MNEMONIC_VERIFY)
    }

    /**
     * Compare mnemonic to generated one, go to PASSWORD_SET
     * 
     * @param  {string} mnemonic
     */
    public verifyCheckMnemonic(mnemonic: string) {
        if (mnemonic !== this.getMnemonic()) {
            throw new Error('Mnemonic is not correct')
        }

        this.setState(RadixApplicationStates.PASSWORD_SET)
    }

    
    /**
     * Write private key from mnemonic to disk, encrypted by password
     * Go to READY
     * 
     * @param  {string} password
     */
    public async setPassword(password: string) {
        // Check any requirements
        if (password.length < 6) {
            throw new Error('Password should be at least 6 symbols long')
        }

        this.keystorePassword = password

        await this.accountManager.store(this.keystorePassword)
        
        this.setActiveAccount(this.accountManager.accounts[0])
        this.setState(RadixApplicationStates.READY)
    }

    
    /**
     * Go to MNEMONIC_RESOTRE
     */
    public restoreWallet() {
        this.setState(RadixApplicationStates.MNEMONIC_RESTORE)
    }

    /**
     * Check if the mnemonic is valid, store it and go to PASSWORD_SET
     * 
     * @param  {string} mnemonic
     */
    public restoreCheckMnemonic(mnemonic: string) {
        if (!bip39.validateMnemonic(mnemonic, this.wordlist)) {
            throw new Error('Mnemonic is not valid')
        }

        this.accountManager.setMnemonic(mnemonic)

        this.setState(RadixApplicationStates.PASSWORD_SET)
    }
    /**
     * Proceed with an unvalidated mnemonic
     * This option is for advanced users
     * 
     * @param  {string} mnemonic
     */
    public restoreProceedUnsafe(mnemonic: string) {
        this.accountManager.setMnemonic(mnemonic)
        this.setState(RadixApplicationStates.PASSWORD_SET)
    }

    private setState(state: RadixApplicationStates) {
        this.stateHistory.push(this.getState())
        this.stateSubject.next(state)
    }
    
    /**
     * Go to the previous state
     */
    public goBack() {
        this.stateSubject.next(this.stateHistory.pop())
    }
    
    /**
     * Get the current state of the application
     */
    public getState() {
        return this.stateSubject.getValue()
    }
    /**
     * Decrypt the keystore file on disk and load the private key
     * Go to READY
     * 
     * @param  {string} password
     */
    public async decryptKeystore(password: string) {
        await this.accountManager.load(password)
        this.keystorePassword = password

        this.setActiveAccount(this.accountManager.accounts[0])

        this.setState(RadixApplicationStates.READY)
    }

    public setActiveAccount(account: WalletAccount) {
        // Unsubscribe old updates
        if (this.transferSubscription) {
            this.transferSubscription.unsubscribe()
        }

        store.commit('setActiveAccount', account)

        // Subscribe to updates
        this.transferSubscription = account.identity.account.transferSystem.transactionSubject
            .subscribe(this.transactionUpdateSubject)
        
    }

    public deleteKeystore() {
        fs.removeSync(this.keystoreFileName)
    }

    public deleteAtomsDB() {
        this.atomStore.reset()
    }

    public onQuit = () => {
        radixUniverse.closeAllConnections()
    }

    public logout() {
        this.keystorePassword = ''
        this.accountManager.reset()
        this.transferSubscription.unsubscribe()
        store.commit('logout')
        this.loadKeystore()
    }
}

export let radixApplication = new RadixApplication()
