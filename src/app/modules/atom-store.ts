import { RadixNEDBAtomStore } from 'radixdlt'
import { remote } from 'electron'
import Config from '../shared/Config'

let atomStore: RadixNEDBAtomStore

export let dataDir = remote.app.getPath('userData')
export let authDBFileName = dataDir + `/apps.db`
export const KEYSTORE_FILENAME = `${dataDir}/${Config.keystoreFilename}`

export function setAtomStore(name: string) {
    console.log('setting atom store for ', name)
    let atomDBFileName = dataDir + `/atoms-${name}-${Config.dbVersion}.db`
    atomStore = RadixNEDBAtomStore.createPersistedStore(atomDBFileName)
    return atomStore
}

export function deleteAtomsDB() {
    if (atomStore) {
        atomStore.reset()
    }
}
