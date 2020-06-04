import { radixUniverse, RadixUniverse, RadixUniverseConfig, RadixNodeDiscoveryHardcoded, RadixBootstrapConfig } from 'radixdlt'
import { setAtomStore } from './atom-store'

const connect = (bootstrapConfig: RadixBootstrapConfig) => {
    const store = setAtomStore()
    radixUniverse.bootstrap(bootstrapConfig, store)
}

export const connectLocalhost = connect.bind(null, RadixUniverse.LOCALHOST_SINGLENODE)

export const connectCustomNode = (address: string, useSSL: boolean, universe: any) => {
    const universeConfig = new RadixUniverseConfig(universe)
    const bootstrapConfig = {
        universeConfig,
        nodeDiscovery: new RadixNodeDiscoveryHardcoded([address], useSSL),
        finalityTime: 0,
    }
    connect(bootstrapConfig)
}