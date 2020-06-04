import { BehaviorSubject } from 'rxjs'
import { accountManager, wordlist } from './account/AccountManager'
import * as bip39 from 'bip39'

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


export let stateSubject: BehaviorSubject<AppState> = new BehaviorSubject(AppState.STARTING)
export let stateHistory: AppState[] = []

export function setState(state: AppState) {
    stateHistory.push(getState())
    stateSubject.next(state)
}

export function getState() {
    return stateSubject.getValue()
}

export function goBack() {
    stateSubject.next(stateHistory.pop())
}

export function restoreWallet() {
    setState(AppState.MNEMONIC_RESTORE)
}

export function mnemonicBackedUp() {
    setState(AppState.MNEMONIC_VERIFY)
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