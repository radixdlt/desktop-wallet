
/*
import { subscribeAppConnection, subscribeDeviceConnection, AppState } from '@radixdlt/hardware-wallet'
import { store } from '../shared/store'

export enum ConnectionEvent {
    DEVICE_CONNECTED,
    DEVICE_DISCONNECTED,
    APP_OPEN,
    APP_CLOSED,
    SIGN_CONFIRM,
    SIGN_REJECT,
}

export async function subscribeConnection(next: (value: ConnectionEvent) => void) {
    let deviceConnected = false

    const subscriptionDevice = await subscribeDeviceConnection(isConnected => {
        deviceConnected = isConnected

        // If the radix app is opened/closed, this will trigger device disconnected
        // and then connected. To ignore that (to help the UI make sense), wait a bit
        // for an event following immediately, and only signal if there was none. 
        setTimeout(() => {
            if (deviceConnected == isConnected) {
                next(isConnected ? ConnectionEvent.DEVICE_CONNECTED : ConnectionEvent.DEVICE_DISCONNECTED)
            }
        }, 1000)
    })

    const appSubscription = subscribeAppConnection(state => {
        next((() => {
            switch (state) {
                case AppState.APP_OPEN:
                    return ConnectionEvent.APP_OPEN
                case AppState.APP_CLOSED:
                    return ConnectionEvent.APP_CLOSED
                case AppState.SIGN_CONFIRM:
                    return ConnectionEvent.SIGN_CONFIRM
                case AppState.SIGN_REJECT:
                    return ConnectionEvent.SIGN_REJECT
            }
        })())
    })

    return {
        unsubscribe: () => {
            appSubscription.unsubscribe()
            subscriptionDevice.unsubscribe()
        },
    }
}

subscribeConnection(event => {
    switch (event) {
        case ConnectionEvent.APP_OPEN:
            store.commit('setLedgerAppOpen', true)
            console.log('ledger app open state set to true')
            break
        case ConnectionEvent.APP_CLOSED:
            store.commit('setLedgerAppOpen', false)
            console.log('ledger app open state set to false')
            break
    }
})
*/