
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
} from 'radixdlt'

import Config from '../shared/Config'

import fs from 'fs-extra'

import * as events from 'events'

export  enum RadixApplicationStates {
    STARTING = 'STARTING',
    FIRST_TIME_SETUP_PASSWORD_REQUIRED = 'FIRST_TIME_SETUP_PASSWORD_REQUIRED',
    DECRYPT_KEYSTORE_PASSWORD_REQUIRED = 'DECRYPT_KEYSTORE_PASSWORD_REQUIRED',
    READY = 'READY'
}

export declare interface RadixApplication {
  on(event: 'atom-received:transaction', listener: () => void): this
  on(event: 'atom-received:message', listener: () => void): this
  on(event: string, listener: Function): this
}

export class RadixApplication extends events.EventEmitter {

    public state: RadixApplicationStates = RadixApplicationStates.STARTING
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

        this.loadKeystore()
    }

    public async loadKeystore() {
        // Check if keystore file exists
        const exists = await fs.pathExists(this.keystoreFileName)
        
        console.log(`keyFilePath: ${this.keystoreFileName}`)
        console.log(`keyFileExists: ${exists}`)

        if (exists) {
            this.setState(RadixApplicationStates.DECRYPT_KEYSTORE_PASSWORD_REQUIRED)
        } else {
            this.setState(RadixApplicationStates.FIRST_TIME_SETUP_PASSWORD_REQUIRED)
        }
    }

    private setState(state: RadixApplicationStates) {
        this.state = state
        this.stateSubject.next(state)
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
