import { radixUniverse, RadixUniverse, RadixUniverseConfig, RadixNodeDiscoveryHardcoded, RadixBootstrapConfig } from 'radixdlt'
import { setAtomStore } from './atom-store'

const connect = (bootstrapConfig: RadixBootstrapConfig) => {
    const store = setAtomStore()
    radixUniverse.bootstrapTrustedNode(bootstrapConfig, store)
}

export const connectLocalhost = connect.bind(null, RadixUniverse.LOCAL_SINGLE_NODE)

export const connectCustomNode = (address: string, useSSL: boolean, universe: any) => {
    const universeConfig = new RadixUniverseConfig(universe)
    const bootstrapConfig = {
        universeConfig,
        nodeDiscovery: new RadixNodeDiscoveryHardcoded([address], useSSL),
        finalityTime: 0,
    }
    connect(bootstrapConfig)
}