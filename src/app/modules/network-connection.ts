import { radixUniverse, RadixUniverse, RadixUniverseConfig, RadixNodeDiscoveryHardcoded, RadixBootstrapConfig } from 'radixdlt'
import { RadixPartialBootstrapConfig } from 'radixdlt/build/module/modules/universe/RadixBootstrapConfig'
import { setAtomStore } from './atom-store'

const connect = (bootstrapConfig: RadixPartialBootstrapConfig, useSSL) => {
    const store = setAtomStore()
    radixUniverse.bootstrapTrustedNode(bootstrapConfig, store, useSSL)
}

export const connectLocalhost = connect.bind(null, RadixUniverse.LOCAL_SINGLE_NODE, false)

export const connectCustomNode = (address: string, useSSL: boolean) => {
    //const universeConfig = new RadixUniverseConfig(universe)
    const bootstrapConfig = {
        nodeDiscovery: new RadixNodeDiscoveryHardcoded([address], useSSL),
        finalityTime: 0,
    }
    connect(bootstrapConfig, true)
}