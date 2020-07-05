import { RadixTransactionBuilder, RadixAccount, RadixIdentity, RRI } from 'radixdlt'
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

async function submit(builder: RadixTransactionBuilder) {
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