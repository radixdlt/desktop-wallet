<template lang="pug">
    div.wrapper
        div.header
            div.navbar
        div.content
            keep-alive
                router-view.fill
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'

    import {
        radixTokenManager, 
        RadixMessageUpdate, 
        RadixTransactionUpdate, 
        RadixAddress,
        RRI
    } from 'radixdlt'

    import { radixApplication, RadixApplicationStates } from '@app/modules/RadixApplication'
    import { radixServer } from '@app/server/RadixServer'

    import Config from '@app/shared/Config'

    import fs from 'fs-extra'

    import {filter} from 'rxjs/operators'

    export default Vue.extend({
        subscriptions: {
            walletManagerState: radixApplication.stateSubject,
        },
        data() {
            return {
                connectionStatus: 'STARTING',
                version: Config.version,
                accessRequestQueue: [],
                currentAccessRequest: null,
            }
        },
        created() {
            radixApplication.initialize(remote.app.getPath('userData'))
            radixServer.start()

            // @ts-ignore
            this.$store.state.contactsFileName = `${radixApplication.dataDir}/contacts.json`
            
            this.$observables.walletManagerState
                .pipe(filter(state => state == RadixApplicationStates.READY))
                .subscribe(state => {
                    // @ts-ignore
                    this.$store.state.contacts[radixApplication.activeIdentity.account.getAddress()] = []

                    try {
                        this.addContact(Config.faucetAddress, 'Faucet')
                        this.loadContacts()
                    } catch (e) {
                        console.error(e)
                    }

                    // @ts-ignore
                    this.$router.push('main')
                })
            
            // Notifications
            radixApplication.on('atom-received:message', (messageUpdate: RadixMessageUpdate) => {
                const message = messageUpdate.message
                const address =  message.from

                // Add sender to contacts
                this.addContact(address)

                // Don't notify about old messages
                const timeDifference = Date.now() - message.timestamp
                if (timeDifference > 10000) return

                if(message.is_mine) return // Only incoming messages

                let displayName = address.toString()
                if (address.toString() in this.contacts) {
                    displayName = this.contacts[address.toString()].alias
                }

                let messageNotification = new Notification(displayName, {
                    body: message.content
                })

                messageNotification.onclick = () => {
                    // @ts-ignore
                    this.$router.push({ path: '/messaging/chatlist/' + message.from.getAddress() })
                }
            })

            radixApplication.on('atom-received:transaction', (transactionUpdate: RadixTransactionUpdate) => {
                const transaction = transactionUpdate.transaction
                const address =  Object.keys(transaction.participants)[0]
                
                // Add sender to contacts
                this.addContact(address)
                
                // Don't notify about old messages
                const timeDifference = Date.now() - transaction.timestamp
                if (timeDifference > 10000) return

                const tokenId = Object.keys(transaction.balance)[0] // Assume single token transactions
                const tokenReference = RRI.fromString(tokenId)
                const timeString = new Date(transaction.timestamp).toLocaleTimeString()
                const balance = transaction.tokenUnitsBalance[tokenId]

                let displayName = address
                if (address in this.contacts) {
                    displayName = this.contacts[address].alias
                }

                if(balance.gt(0)) { // Only incoming transactions
                    let transactionNotification = new Notification(
                        `Received ${balance} ${tokenReference.name}`, 
                        { body: `From ${displayName}` }
                    )
                    transactionNotification.onclick = () => {
                        // @ts-ignore
                        this.$router.push({ name: 'main.dashboard'})
                    }
                }
            })
        },   
        methods: {
            addWallet: () => {
                // radixApplication.walletManager.generateWallet()
            },
            exportWallet() {
                remote.dialog.showSaveDialog({
                    title: 'Export wallet',
                    defaultPath: 'keystore.json'
                }, function (filePath) {
                    if (filePath === undefined) {
                        return
                    }
                    fs.copyFile(radixApplication.keystoreFileName, filePath, (error) => {
                        if(error) throw error
                    })
                })
            },
            addContact(address: string | RadixAddress, alias = null) {
                if (typeof address == 'string') {
                    address = RadixAddress.fromAddress(address)
                } else if (!(address instanceof RadixAddress)) {
                    console.log(address)
                    throw new Error('Invalid address type')
                }

                if (address.getAddress() in this.contacts) {
                    return
                }
                if (alias === null) {
                    alias = address.getAddress()
                }

                const contact = {
                    keyPair: address,
                    address: address.getAddress(),
                    alias: alias
                }

                this.contacts[address.getAddress()] = contact
            },
            async loadContacts() {
                try {
                    // @ts-ignore
                    const serializedContacts = await fs.readJson(this.$store.state.contactsFileName)

                    // Merge with contacts list
                    for (let contact of serializedContacts) {
                        if (contact.address in this.contacts) {
                            this.contacts[contact.address].alias = contact.alias
                            radixApplication.emit('contact-added')
                        } else {
                            this.addContact(contact.address, contact.alias)
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            },
            requestApplicationAccess(appInfo) {
                console.log(`${appInfo.name} Requesting access`)

                const accessRequest = {
                    appInfo: appInfo,
                    promise: null,
                    resolve: null,
                    reject: null,
                }

                accessRequest.promise = new Promise((resolve, reject) => {
                    accessRequest.resolve = resolve
                    accessRequest.reject = reject
                })

                if (this.currentAccessRequest) {
                    this.accessRequestQueue.push(accessRequest)
                } else {
                    this.showAccessRequest(accessRequest)
                }

                return accessRequest.promise
            },
            showAccessRequest(accessRequest) {
                this.currentAccessRequest = accessRequest

                // Bring window to front
                remote.getCurrentWindow().focus()
            },
            dismissAccessRequest(accessRequest, approve: boolean) {
                if(this.accessRequestQueue.length > 0) {
                    this.showAccessRequest(this.accessRequestQueue.shift())
                } else {
                    this.currentAccessRequest = null
                }

                if (approve) {
                    accessRequest.resolve()
                } else {
                    accessRequest.reject('Access denied')
                }
            }
        },
        computed: {
            identity: function () {
                return radixApplication.activeIdentity
            },
            contacts: function () {
                // @ts-ignore
                return this.$store.state.contacts[this.identity.account.getAddress()]
            }
        }
    })
</script>

<style lang="scss" scoped>

    // @import "./assets/sass/main.scss";

    .wrapper {
        height: 100vh;
        min-height: 500px;
        width: 100vw;

        display: grid;
        grid-template-columns: auto;
        grid-template-rows: max-content minmax(0, 1fr);

        .header {
            grid-row: 1;
            background-color: $white;
        }

        .content {
            grid-row: 2;
            background-color: $grey-light;

            .section {
                width: 100%;
                height: 100%;
            }
        }
    }

    .access-request-container {
        grid-column: 1 / 3;
        grid-row: 1 / 3;

        height: 100%;
        width: 100%;

        z-index: 100;
        // opacity: 0.7;
        background-color: rgba(229, 237, 241, 0.7); // #E5EDF1

        display: none; 

        &.visible {
            display: grid;

            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 25% 1fr 25%;
        }

        .access-request {
            grid-column: 2;
            grid-row: 2;
            // opacity: 100%;
            background-color: white;

            padding: 30px;

            .title {

            }

            .name {
                font-size: 20px;	
            }

            .description {

            }

            .permissions {
                .permission {
                    font-size: 12px;	
                }
            }

            .approve .reject {
                display: inline;
                width: auto;
                padding: 0 16px 0 16px;
                margin-right: 10px;
            }
        }
    }

    

</style>
