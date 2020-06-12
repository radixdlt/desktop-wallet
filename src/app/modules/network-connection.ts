import { radixUniverse, RadixUniverse, RadixUniverseConfig, RadixNodeDiscoveryHardcoded, RadixBootstrapConfig, RadixSimpleIdentity } from 'radixdlt'
import { setAtomStore } from './atom-store'
import { RadixPartialBootstrapConfig } from 'radixdlt/build/module/modules/universe/RadixBootstrapConfig'

const connect = (bootstrapConfig: RadixBootstrapConfig, atomStoreName?: string) => {
    let store
    if (atomStoreName) {
        store = setAtomStore(atomStoreName)
    }
    radixUniverse.bootstrap(bootstrapConfig, store)
}

const connectTrusted = (bootstrapConfig: RadixPartialBootstrapConfig, atomStoreName?: string) => {
    let store
    if (atomStoreName) {
        store = setAtomStore(atomStoreName)
    }
    radixUniverse.bootstrapTrustedNode(bootstrapConfig, store)
}

export let faucetAddress

export const connectLocalhost = connect.bind(null, RadixUniverse.LOCALHOST_SINGLENODE)

export const connectCustomNode = (address: string, useSSL: boolean, universe: any, name: string) => {
    const universeConfig = new RadixUniverseConfig(universe)
    const bootstrapConfig = {
        universeConfig,
        nodeDiscovery: new RadixNodeDiscoveryHardcoded([address], useSSL),
        finalityTime: 0,
    }
    connect(bootstrapConfig, name)
}

export const connectTrustedCustomNode = (address: string, useSSL, name: string) => {
    const bootstrapConfig = {
        nodeDiscovery: new RadixNodeDiscoveryHardcoded([address], useSSL),
        finalityTime: 0,
    }
    connectTrusted(bootstrapConfig, name)
}

export const setFaucet = (address: string) => {
    faucetAddress = address
}