import { Subject } from 'rxjs'
import {
    RadixTransactionUpdate,
    RadixMessageUpdate,
    radixUniverse,
} from 'radixdlt'
import { settingsStore } from './SettingsStore'
import { setState, AppState } from './application-state'
import { accountManager } from './account/AccountManager'


export class RadixApplication {
    public transactionUpdateSubject: Subject<RadixTransactionUpdate> = new Subject()
    public messageUpdateSubject: Subject<RadixMessageUpdate> = new Subject()

    /**
     * Check whether terms and conditions have been accepted
     * Go to TERMS_AND_CONDITIONS or start authentication flow
     */
    public checkTerms() {
        if (!settingsStore.get('termsAccepted')) {
            setState(AppState.TERMS_AND_CONDITIONS)
        } else {
            accountManager.loadKeystore()
        }
    }

    /**
     * Store in settings that terms and conditions have been accepted
     * Start authentication flow
     */
    public acceptTerms() {
        settingsStore.set('termsAccepted', true)
        accountManager.loadKeystore()
    }



    public onQuit = () => {
        radixUniverse.closeAllConnections()
    }
}

export let radixApplication = new RadixApplication()