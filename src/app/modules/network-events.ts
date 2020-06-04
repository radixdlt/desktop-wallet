import { Subject } from 'rxjs'
import { RadixTransactionUpdate, RadixMessageUpdate } from 'radixdlt'
import { WalletAccount } from './account/WalletAccount'

let transactionUpdateSubject: Subject<RadixTransactionUpdate> = new Subject()

export let transferSubscription = new Subject()

export function setTransactionEvents(account: WalletAccount) {
    transferSubscription.subscribe(account.identity.account.transferSystem.transactionSubject)
}