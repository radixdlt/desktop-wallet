import { RadixTransactionBuilder, RadixAccount, RadixIdentity, RRI, RadixAtom } from 'radixdlt'
import { store } from '../shared/store'
import Config from '../shared/Config'
import { subscribeConnection, ConnectionEvent } from './hardware-wallet-connection'

let faucetAddress

try {
    const request = new XMLHttpRequest()
    request.open('GET', '../universe.json', false)
    request.send(null)
    const json = JSON.parse(request.responseText)
    if (json.faucetAddress) {
        faucetAddress = json.faucetAddress
    }
} catch (e) {
    faucetAddress = Config.faucetAddress
}

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
    return builder.signAndSubmit(store.state.activeAccount.identity)
}

export async function sendFaucetRequest() {
    await store.state.activeAccount.identity.account.requestTestTokensFromFaucetWithLinearBackingOffRetry()
}

export const prepareTransferAtom = (
    to: RadixAccount,
    tokenRef: string | RRI,
    amount: string | number,
    message?: string
) => {
    const builder = RadixTransactionBuilder.createTransferAtom(
        store.state.activeAccount.identity.account,
        to,
        tokenRef,
        amount,
        message
    )

    return {
        atom: builder.buildAtom(),
        submit: submit.bind(null, builder),
    }
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