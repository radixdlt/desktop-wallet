import { radixUniverse, RadixUniverse, RadixUniverseConfig, RadixNodeDiscoveryHardcoded, RadixBootstrapConfig } from 'radixdlt'
import { setAtomStore } from './atom-store'

const connect = <T extends any[]>(func: (...args: T) => RadixBootstrapConfig) => (...args: T) => {
    const store = setAtomStore()
    radixUniverse.bootstrap(func(...args), store)
}

export const connectLocalhost = connect(() => RadixUniverse.LOCALHOST_SINGLENODE)

export const connectCustomNode = connect<[string, boolean, any]>((address: string, useSSL: boolean, universe: any) => {
    const universeConfig = new RadixUniverseConfig(universe)
    return {
        universeConfig,
        nodeDiscovery: new RadixNodeDiscoveryHardcoded([address], useSSL),
        finalityTime: 0,
    }
})

connectCustomNode('', true, {})