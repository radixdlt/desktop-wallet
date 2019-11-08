import Store from 'electron-store'


type TypedStore = {
    termsAccepted: boolean
}

export const settingsStore = new Store<TypedStore>({
    defaults: {
        termsAccepted: false,
    }
})

// // Debug
// settingsStore.set('termsAccepted', false)
