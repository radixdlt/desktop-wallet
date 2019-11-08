
import { BehaviorSubject, Subject } from 'rxjs'

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


    READY = 'READY'
}

export declare interface RadixApplication {
  on(event: 'atom-received:transaction', listener: () => void): this
  on(event: 'atom-received:message', listener: () => void): this
  on(event: string, listener: Function): this
}

export class RadixApplication extends events.EventEmitter {

    public stateSubject: BehaviorSubject<RadixApplicationStates> = new BehaviorSubject(RadixApplicationStates.STARTING)

    public identityManager: RadixIdentityManager
    public activeIdentity: RadixIdentity

    public dataDir: string
    public keystoreFileName: string
    public authDBFileName: string
    public atomDBFileName: string

    public transactionUpdateSubject: Subject<RadixTransactionUpdate> = new Subject()
    public messageUpdateSubject: Subject<RadixMessageUpdate> = new Subject()

    private atomStore: RadixAtomStore

    private mnemonic: string

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

        this.identityManager = new RadixIdentityManager()

        this.transactionUpdateSubject.subscribe((transactionUpdate) => {
            this.emit('atom-received:transaction', transactionUpdate)
        })

        this.messageUpdateSubject.subscribe((messageUpdate) => {
            this.emit('atom-received:message', messageUpdate)
        })

        this.checkTerms()
    }

    public checkTerms() {
        if (!settingsStore.get('termsAccepted')) {
            this.setState(RadixApplicationStates.TERMS_AND_CONDITIONS)
        } else {
            this.loadKeystore()
        }
    }

    public acceptTerms() {
        settingsStore.set('termsAccepted', true)
        this.loadKeystore()
    }

    public async loadKeystore() {
        // Check if keystore file exists
        const exists = await fs.pathExists(this.keystoreFileName)

        if (exists) {
            this.setState(RadixApplicationStates.DECRYPT_KEYSTORE_PASSWORD_REQUIRED)
        } else {
            this.setState(RadixApplicationStates.CREATE_OR_RESTORE)
        }
    }

    public createWallet() {
        // Generate Mnemonic
        this.mnemonic = bip39.generateMnemonic()

        this.setState(RadixApplicationStates.MNEMONIC_BACKUP)
    }

    public getMnemonic() {
        return this.mnemonic
    }

    public mnemonicBackedUp() {
        this.setState(RadixApplicationStates.MNEMONIC_VERIFY)
    }

    public mnemonicVerified(mnemonic: string) {
        if (mnemonic !== this.getMnemonic()) {
            throw new Error('Mnemonic is not correct')
        }

        this.setState(RadixApplicationStates.PASSWORD_SET)
    }

    public async setPassword(password: string) {
        const identity = new RadixSimpleIdentity(
            RadixAddress.fromPrivate(
                bip39.mnemonicToSeedSync(this.getMnemonic())
            ))
        
        // Save to disk
        const encryptedKey = await RadixKeyStore.encryptKey(identity.address, password)
        await fs.writeJSON(this.keystoreFileName, encryptedKey)
        
        this.setActiveIdentity(identity)
        this.setState(RadixApplicationStates.READY)
    }

    public restoreWallet() {
        throw new Error('Not implemented')
    }

    private setState(state: RadixApplicationStates) {
        this.stateSubject.next(state)
    }

    public getState() {
        return this.stateSubject.getValue()
    }

    public async setFirstTimePassword(password: string) {
        // Check any requirements
        if (password.length < 6) {
            throw new Error('Password should be at least 6 symbols long')
        }

        const identity = this.identityManager.generateSimpleIdentity()
        this.setActiveIdentity(identity)
        const encryptedKey = await RadixKeyStore.encryptKey(identity.address, password)
        await fs.writeJSON(this.keystoreFileName, encryptedKey)

        this.setState(RadixApplicationStates.READY)
    }

    public async decryptKeystore(password: string) {
        const encryptedKey = await fs.readJSON(this.keystoreFileName)
        const keyPair = await RadixKeyStore.decryptKey(encryptedKey, password)
        const identity = new RadixSimpleIdentity(keyPair)

        this.setActiveIdentity(identity)

        this.setState(RadixApplicationStates.READY)
    }

    public setActiveIdentity(identity: RadixIdentity) {
        this.activeIdentity = identity
        const account = identity.account

        // Subscribe to updates
        account.transferSystem.transactionSubject.subscribe(this.transactionUpdateSubject)
        account.messagingSystem.messageSubject.subscribe(this.messageUpdateSubject)
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
}

export let radixApplication = new RadixApplication()
