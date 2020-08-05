import { RadixTransactionBuilder, RadixAccount, RRI } from 'radixdlt'
import { store } from '../shared/store'
import { subscribeConnection, ConnectionEvent } from './hardware-wallet-connection'
import { faucetAddress } from './network-connection'

export async function submit(builder: RadixTransactionBuilder) {
    store.commit('setIsSigning', true)
    if (store.state.hardwareWallet && !store.state.ledgerAppOpen) {
        await new Promise(async (resolve, reject) => {
            const subscription = await subscribeConnection(event => {
                if (event === ConnectionEvent.APP_OPEN) {
                    subscription.unsubscribe()
                    resolve()
                }
            })
        })
        return builder.signAndSubmit(store.state.activeAccount.identity)
    }
    console.log('yep')
    return builder.signAndSubmit(store.state.activeAccount.identity)
}

export async function sendFaucetRequest() {
    console.log(faucetAddress)
    console.log(store.state.activeAccount.identity.account)
    const faucetAccount = RadixAccount.fromAddress(faucetAddress, true)

    const builder = RadixTransactionBuilder.createRadixMessageAtom(
        store.state.activeAccount.identity.account,
        faucetAccount,
        'Send me some money, pretty please!'
    )
    return submit(builder)
}

export function sendTransfer(
    to: RadixAccount,
    tokenRef: string | RRI,
    amount: string | number,
    message?: string
) {
    const builder = RadixTransactionBuilder.createTransferAtom(
        store.state.activeAccount.identity.account,
        to,
        tokenRef,
        amount,
        message
    )
    return submit(builder)
}

export function sendMessage(to: RadixAccount, message: string) {
    const builder = RadixTransactionBuilder.createRadixMessageAtom(
        store.state.activeAccount.identity.account,
        to,
        message
    )
    return submit(builder)
}