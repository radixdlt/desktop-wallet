import VirtualSocketServer from './virtualSocket/VirtualSocketServer'
import JsonRpcServer from './JsonRpcServer'

import { ipcRenderer } from 'electron'
import { authSystem } from './AuthSystem'
import { store } from '../shared/store'

import { radixApplication } from  '../modules/RadixApplication'

import {
    radixTokenManager,
    RadixTransactionBuilder,
    RadixAccount,
    RadixTransactionUpdate,
    RadixECIES,
    RadixAtom,
    RadixSerializer,
} from 'radixdlt'

import * as jsonrpc from 'jsonrpc-lite'

export class RadixServer {

    identity() {
        return store.state.activeAccount.identity
    }

    start() {
        authSystem.initialize()

        let server = new JsonRpcServer(new VirtualSocketServer(ipcRenderer))  

        server.register('register', async (params, ws) => {
            if (!store || !this.identity()) {
                throw new Error('Wallet not ready')
            }

            const token = await authSystem.register(params)

            return { token: token }
        })

        server.register('hi', async (params, ws) => {
            await authSystem.authenticate(params.token, ['say_hi'])

            return 'hello ' + params.name
        })

        server.register('ping', async (params, ws) => {
            await authSystem.authenticate(params.token, [])

            return 'pong'
        })

        server.register('address', async (params, ws) => {
            await authSystem.authenticate(params.token, ['address'])

            return this.identity().account.getAddress()
        })

        server.register('send_transaction', async (params, ws) => {
            await authSystem.authenticate(params.token, ['send_transactions'])
            
            await RadixTransactionBuilder.createTransferAtom(
                this.identity().account,
                RadixAccount.fromAddress(params.recipient),
                params.asset,
                params.quantity,
                params.message)
            .signAndSubmit(this.identity())
            .toPromise()
        })

        server.register('send_message', async (params, ws) => {
            await authSystem.authenticate(params.token, ['send_messages'])

            await RadixTransactionBuilder.createRadixMessageAtom(
                this.identity().account,
                RadixAccount.fromAddress(params.recipient),
                params.message)
            .signAndSubmit(this.identity())
            .toPromise()
        })

        server.register('send_application_message', async (params, ws) => {
            await authSystem.authenticate(params.token, ['send_application_messages'])

            const readers = params.recipients.map(recipient => {
                return RadixAccount.fromAddress(recipient)
            }).push(this.identity().account)

            await RadixTransactionBuilder.createPayloadAtom(
                readers,
                params.application_id,
                params.payload,
                params.encrypted)
            .signAndSubmit(this.identity())
            .toPromise()
        })

        server.register('balance', async (params, ws) => {
            await authSystem.authenticate(params.token, ['balance'])

            const sub = this.identity().account.transferSystem.getTokenUnitsBalanceUpdates()
                .subscribe((balance) => {
                    const strigifiedBalance = {}
                    for (const tokenId in balance) {
                        strigifiedBalance[tokenId] = balance[tokenId].toString()
                    }

                    ws.send(JSON.stringify(jsonrpc.notification('balance.update', strigifiedBalance)))
                })
            

            ws.on('close', () => {
                sub.unsubscribe()
            })

            return 'OK'
        })

        server.register('transactions', async (params, ws) => {
            await authSystem.authenticate(params.token, ['transactions'])
            
            const sub = this.identity().account.transferSystem.getAllTransactions().subscribe({
                next: (transactionUpdate: RadixTransactionUpdate) => {
                    const transaction = transactionUpdate.transaction

                    let transactionCopy = JSON.parse(JSON.stringify(transaction))

                    const strigifiedBalance = {}
                    for (const tokenId in transaction.tokenUnitsBalance) {
                        strigifiedBalance[tokenId] = transaction.tokenUnitsBalance[tokenId].toString()
                    }

                    transactionCopy.balance = strigifiedBalance

                    ws.send(JSON.stringify(jsonrpc.notification('transaction.update', transactionCopy)))
                },
            })

            ws.on('close', () => {
                sub.unsubscribe()
            })

            return 'OK'
        })

        server.register('messages', async (params, ws) => {
            await authSystem.authenticate(params.token, ['messages'])
     
            const sub = this.identity().account.messagingSystem.getAllMessages().subscribe({
                next: (message: any) => {
                    let messageCopy = JSON.parse(JSON.stringify(message))

                    messageCopy.to = message.to.getAddress()
                    messageCopy.from = message.from.getAddress()

                    ws.send(JSON.stringify(jsonrpc.notification('message.update', messageCopy)))
                },
            })

            ws.on('close', () => {
                sub.unsubscribe()
            })

            return 'OK'
        })

        server.register('application_messages', async (params, ws) => {
            await authSystem.authenticate(params.token, ['application_messages'])

            const sub = this.identity().account.dataSystem.getApplicationData(params.application_id).subscribe({
                next: (applicationMessage) => {
                    ws.send(JSON.stringify(jsonrpc.notification('application_message.update', applicationMessage)))
                },
            })

            ws.on('close', () => {
                sub.unsubscribe()
            })

            return 'OK'
        })

        server.register('sign_atom', async (params, ws) => {
            await authSystem.authenticate(params.token, ['sign_atom'])

            const atom: RadixAtom = RadixSerializer.fromJSON(params.atom)

            return RadixSerializer.toJSON((await this.identity().signAtom(atom)).signatures)
        })

        server.register('decrypt_ecies_payload', async (params, ws) => {
            await authSystem.authenticate(params.token, ['decrypt_ecies_payload'])

            return this.identity().decryptECIESPayload(Buffer.from(params.payload))
        })

        server.register('decrypt_ecies_payload_with_protectors', async (params, ws) => {
            await authSystem.authenticate(params.token, ['decrypt_ecies_payload'])

            const protectors = params.protectors.map(p => Buffer.from(p))

            return this.identity().decryptECIESPayloadWithProtectors(protectors, Buffer.from(params.payload))
        })

        server.register('get_public_key', async (params, ws) => {
            await authSystem.authenticate(params.token, ['get_public_key'])

            return this.identity().getPublicKey()
        })
    }
}

export let radixServer = new RadixServer
