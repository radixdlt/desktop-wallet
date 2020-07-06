import { BehaviorSubject } from 'rxjs'
import { accountManager, wordlist } from './account/AccountManager'
import * as bip39 from 'bip39'
import { KEYSTORE_FILENAME } from './atom-store'
import fs from 'fs-extra'
import { settingsStore } from './SettingsStore'

function setState(state: AppState) {
    stateHistory.push(getState())
    stateSubject.next(state)
}

export enum AppState {
    STARTING,
    TERMS_AND_CONDITIONS,
    DECRYPT_KEYSTORE_PASSWORD_REQUIRED,
    CREATE_OR_RESTORE,

    // create flow
    MNEMONIC_BACKUP,
    MNEMONIC_VERIFY,
    PASSWORD_SET,

    // restore flow
    MNEMONIC_RESTORE,

    READY,
}

export const stateSubject: BehaviorSubject<AppState> = new BehaviorSubject(AppState.STARTING)
export const stateHistory: AppState[] = []

export function getState() {
    return stateSubject.getValue()
}

export function goBack() {
    stateSubject.next(stateHistory.pop())
}

export function createWallet() {
    accountManager.generateMnemonic()
    setState(AppState.MNEMONIC_BACKUP)
}

export function restoreWallet() {
    setState(AppState.MNEMONIC_RESTORE)
}

export async function connectHardwareWallet() {
    await accountManager.loadHardwareWalletAccount()
    setState(AppState.READY)
}

export function mnemonicBackedUp() {
    setState(AppState.MNEMONIC_VERIFY)
}

export function checkTerms() {
    if (!settingsStore.get('termsAccepted')) {
        setState(AppState.TERMS_AND_CONDITIONS)
    } else {
        loadKeystore()
    }
}

/**
* Proceed with an unvalidated mnemonic
* This option is for advanced users
* 
* @param  {string} mnemonic
*/
export function restoreProceedUnsafe(mnemonic: string) {
    accountManager.setMnemonic(mnemonic)
    setState(AppState.PASSWORD_SET)
}

export function verifyCheckMnemonic(mnemonic: string) {
    if (mnemonic !== accountManager.mnemonic) {
        throw new Error('Mnemonic is not correct')
    }

    setState(AppState.PASSWORD_SET)
}

export function restoreCheckMnemonic(mnemonic: string) {
    if (!bip39.validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Mnemonic is not valid')
    }

    accountManager.setMnemonic(mnemonic)

    setState(AppState.PASSWORD_SET)
}

/**
* Write private key from mnemonic to disk, encrypted by password
* Go to READY
* 
* @param  {string} password
*/
export async function setPassword(password: string) {
    if (password.length < 6) {
        throw new Error('Password should be at least 6 symbols long')
    }

    accountManager.setKeystorePassword(password)

    await accountManager.store(password)

    accountManager.setActiveAccount(accountManager.accounts[0])
    setState(AppState.READY)
}

/**
 * Decrypt the keystore file on disk and load the private key
 * Go to READY
 * 
 * @param  {string} password
 */
export async function decryptKeystore(password: string) {
    await accountManager.load(password)
    accountManager.setKeystorePassword(password)

    accountManager.setActiveAccount(accountManager.accounts[0])

    setState(AppState.READY)
}

/**
* Check if the keystore file exists on disk
* Go to either DECRYPT_KEYSTORE_PASSWORD_REQUIRED or CREATE_OR_RESTORE
*/
export async function loadKeystore() {
    const exists = await fs.pathExists(KEYSTORE_FILENAME)

    if (exists) {
        setState(AppState.DECRYPT_KEYSTORE_PASSWORD_REQUIRED)
    } else {
        setState(AppState.CREATE_OR_RESTORE)
    }
}