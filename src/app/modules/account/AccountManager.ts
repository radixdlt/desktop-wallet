import { WalletAccount } from './WalletAccount'
import { RadixKeyStore, RadixSimpleIdentity, RadixTransactionUpdate } from 'radixdlt'
import fs from 'fs-extra'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs'
import { loadKeystore } from '../application-state'
import { store } from '../../shared/store'
import { KEYSTORE_FILENAME } from '../atom-store'

export const wordlist = bip39.wordlists.english
export let keystorePassword: string

let transferSubscription: Subscription | any
let transactionUpdateSubject: Subject<RadixTransactionUpdate> = new Subject()

class AccountManager {
    public accounts: WalletAccount[] = []
    public mnemonic: string = ''
    private accountsUpdatesSubject: BehaviorSubject<WalletAccount[]> = new BehaviorSubject(this.accounts)

    public masterNode: bip32.BIP32Interface
    public coinType = 1 // Testnet

    constructor(readonly keystorePath: string) {
    }


    /**
     * Provide an existing mnemonic for the root account
     * This will initiate an account discovery process, 
     * by checking which derrived accounts have a transaction history
     * 
     * @param  {string} mnemonic A mnemonic following the bip39 standard
     */
    public setMnemonic(mnemonic: string) {
        if (this.mnemonic) {
            throw new Error('Can only set mnemonic once')
        }

        this.mnemonic = mnemonic
        this.masterNode = bip32.fromSeed(bip39.mnemonicToSeedSync(this.mnemonic))

        this.addAccount(this.generateNewAccount('Main'))
        this.discoverAccounts()
    }
    /**
     * Generate a new BIP39 mnemonic and create the first account for it
     */
    public generateMnemonic() {
        if (this.mnemonic) {
            throw new Error('Can only set mnemonic once')
        }

        this.mnemonic = bip39.generateMnemonic()
        this.masterNode = bip32.fromSeed(bip39.mnemonicToSeedSync(this.mnemonic))

        this.addAccount(this.generateNewAccount('Main'))
    }
    /**
     * Derrive the next HD account
     * This does not automacially add the account to the accounts list
     * 
     * @param  {string} alias? Default alias will be 'Account #[account number]'
     * @returns WalletAccount
     */
    generateNewAccount(alias?: string): WalletAccount {
        const accountIndex = this.accounts.length
        const node = this.masterNode.derivePath(`m/44'/${this.coinType}'/${accountIndex}`)
        const identity = RadixSimpleIdentity.fromPrivate(node.privateKey)

        if (!alias) {
            alias = `Account #${accountIndex + 1}`
        }
        const account = {
            alias,
            identity,
        }

        return account
    }
    /**
     * Add an account to the accounts list
     * 
     * @param  {WalletAccount} account
     */
    public addAccount(account: WalletAccount) {
        if (this.accounts.indexOf(account) < 0) {
            this.accounts.push(account)
        }

        this.accountsUpdatesSubject.next(this.accounts)
    }

    public setKeystorePassword(password: string) {
        keystorePassword = password
    }

    /**
     * Set the accounts list
     * 
     * @param  {WalletAccount[]} accounts
     */
    public setAccounts(accounts: WalletAccount[]) {
        this.accounts = accounts
        this.accountsUpdatesSubject.next(this.accounts)
    }

    /**
     * Initiate an account discovery process, according to the BIP44 standard
     * This will generate new accounts and check their transaction history,
     * until the first account without any history
     * 
     */
    public discoverAccounts() {
        const account = this.generateNewAccount()
        account.identity.account.isSynced().subscribe(isSynced => {
            if (isSynced && account.identity.account.transferSystem.transactions.length > 0) {
                console.log('synced', account.identity.address.toString())
                this.addAccount(account)
                this.discoverAccounts()
            }
        })
    }

    /**
     * Serialize the account manager to a json string
     */
    public toString() {
        const accounts = this.accounts.map(account => {
            return {
                alias: account.alias,
                privateKey: account.identity.address.keyPair.getPrivate('hex'),
            }
        })

        return JSON.stringify({
            accounts,
            mnemonic: this.mnemonic,
        })
    }


    /**
     * Deserialize AccountManager state from a json string
     * 
     * @param  {string} data
     * @returns st
     */
    public fromString(data: string) {
        const deserializedData = JSON.parse(data) as {
            accounts: Array<{
                alias: string,
                privateKey: string
            }>,
            mnemonic: string,
        }

        this.mnemonic = deserializedData.mnemonic
        this.masterNode = bip32.fromSeed(bip39.mnemonicToSeedSync(this.mnemonic))

        const accounts = deserializedData.accounts.map(account => {
            return {
                alias: account.alias,
                identity: RadixSimpleIdentity.fromPrivate(account.privateKey),
            }
        })
        this.setAccounts(accounts)
    }

    public setActiveAccount(account: WalletAccount) {
        // Unsubscribe old updates
        if (transferSubscription) {
            transferSubscription.unsubscribe()
        }

        store.commit('setActiveAccount', account)

        // Subscribe to updates
        transferSubscription = account.identity.account.transferSystem.transactionSubject
            .subscribe(transactionUpdateSubject)
    }

    public setUniverse(universe: string) {
        for (let i = 0; i < this.accounts.length; i++) {
            const node = this.masterNode.derivePath(`m/44'/${this.coinType}'/${i}`)
            this.accounts[i].identity = RadixSimpleIdentity.fromPrivate(node.privateKey)
        }
        store.commit('setUniverse', universe)
        this.setActiveAccount(this.accounts[0])
    }

    public subscribeToTransferEvents(func: any) {
        transactionUpdateSubject.subscribe(func)
    }

    /**
     * Store the AccountManager state at the provided path, encrypted with the password provided
     * 
     * @param  {string} password
     */
    public async store(password: string) {
        const data = this.toString()
        // Encrypt
        const keystoreData = await RadixKeyStore.encryptData(data, 'multi', password)
        // Write to disk
        await fs.writeJSON(this.keystorePath, keystoreData)
    }
    /**
     * Load the AccountManager state from the path provided in the constructor, 
     * decrypting it with the password provided
     * 
     * @param  {string} password
     */
    public async load(password: string) {
        const keystoreData = await fs.readJSON(this.keystorePath)
        const serilaizedData = await RadixKeyStore.decryptKeystore(keystoreData, password)

        this.fromString(serilaizedData)
    }

    public logout() {
        this.reset()
        transferSubscription.unsubscribe()
        store.commit('logout')
        loadKeystore()
    }

    /**
     * Clear mnemonic and account information
     * Useful for logging out
     */
    public reset() {
        this.accounts = []
        this.masterNode = null
        this.mnemonic = null
    }

    public deleteKeystore() {
        fs.removeSync(KEYSTORE_FILENAME)
    }

    /**
     * Check if the current keystore is encrypted with the password provided
     * 
     * @param  {string} password
     * @returns Promise<boolean>
     */
    public async checkPassword(password: string): Promise<boolean> {
        try {
            const keystoreData = await fs.readJSON(this.keystorePath)
            await RadixKeyStore.decryptKeystore(keystoreData, password)
        } catch (e) {
            return false
        }

        return true
    }

    /**
     * Get an RxJs observable for accounts updates
     */
    public getAccountsUpdatesObservable(): Observable<WalletAccount[]> {
        return this.accountsUpdatesSubject.share()
    }
}

export const accountManager = new AccountManager(KEYSTORE_FILENAME)