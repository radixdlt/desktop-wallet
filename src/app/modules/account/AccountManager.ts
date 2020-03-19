import { WalletAccount } from "./WalletAccount";
import { RadixKeyStore, RadixSimpleIdentity, RadixAddress } from 'radixdlt';
import fs from 'fs-extra'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

export default class AccountManager {
    public accounts: WalletAccount[] = []
    public mnemonic: string = ''

    private masterNode: bip32.BIP32Interface
    private coinType = 1 // Testnet

    constructor(readonly keystorePath: string) {
    }

    public setMnemonic(mnemonic: string) {
        if (this.mnemonic) {
            throw new Error('Can only set mnemonic once')
        }

        this.mnemonic = mnemonic
        this.masterNode = bip32.fromSeed(bip39.mnemonicToSeedSync(this.mnemonic))

        this.addAccount(this.generateNewAccount('Main'))
        this.discoverAccounts()
    }

    public generateMnemonic() {
        if (this.mnemonic) {
            throw new Error('Can only set mnemonic once')
        }

        this.mnemonic = bip39.generateMnemonic()
        this.masterNode = bip32.fromSeed(bip39.mnemonicToSeedSync(this.mnemonic))

        this.addAccount(this.generateNewAccount('Main'))
    }

    generateNewAccount(alias?: string): WalletAccount {
        const accountIndex = this.accounts.length;
        const node = this.masterNode.derivePath(`m/44'/${this.coinType}'/${accountIndex}`)
        const identity = RadixSimpleIdentity.fromPrivate(node.privateKey)

        if(!alias) {
            alias = `Account #${accountIndex + 1}`
        }
        const account = {
            alias,
            identity,
        }

        return account
    }

    public addAccount(account: WalletAccount) {
        this.accounts.push(account)
    }

    public discoverAccounts() {
        const account = this.generateNewAccount()
        account.identity.account.isSynced().subscribe(isSynced => {
            if (isSynced && account.identity.account.transferSystem.transactions.length > 0) {
                this.addAccount(account)
                this.discoverAccounts()
            }
        })
    }

    public toString() {
        const accounts = this.accounts.map(account => {
            return {
                alias: account.alias,
                privateKey: account.identity.address.keyPair.getPrivate('hex')
            }
        })

        return JSON.stringify({
            accounts,
            mnemonic: this.mnemonic,
        })
    }

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

        this.accounts = deserializedData.accounts.map(account => {
            return {
                alias: account.alias,
                identity: RadixSimpleIdentity.fromPrivate(account.privateKey)
            }
        })
    }
    

    public async store(password: string) {
        const data = this.toString()
        // Encrypt
        const keystoreData = await RadixKeyStore.encryptData(data, 'multi', password)
        // Write to disk
        await fs.writeJSON(this.keystorePath, keystoreData)
    }

    public async load(password: string) {
        const keystoreData = await fs.readJSON(this.keystorePath)
        const serilaizedData = await RadixKeyStore.decryptKeystore(keystoreData, password)

        this.fromString(serilaizedData)
    }

    public reset() {
        this.accounts = []
        this.masterNode = null
        this.mnemonic = null
    }
}
