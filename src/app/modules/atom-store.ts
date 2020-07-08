import { RadixNEDBAtomStore } from 'radixdlt'
import { remote } from 'electron'
import Config from '../shared/Config'

let atomDBFileName
let atomStore: RadixNEDBAtomStore

export let dataDir = remote.app.getPath('userData')
export let authDBFileName = dataDir + `/apps.db`
export const KEYSTORE_FILENAME = `${dataDir}/${Config.keystoreFilename}`

export function setAtomStore() {
    atomDBFileName = dataDir + `/atoms-${Config.universe}-${Config.dbVersion}.db`
    atomStore = RadixNEDBAtomStore.createPersistedStore(atomDBFileName)
    return atomStore
}

export function deleteAtomsDB() {
    atomStore.reset()
}
