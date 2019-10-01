<template lang="pug">
    div.container
        initial-setup(v-if="walletManagerState == 'FIRST_TIME_SETUP_PASSWORD_REQUIRED'")
        login(v-if="walletManagerState == 'DECRYPT_KEYSTORE_PASSWORD_REQUIRED'")
        div.main(v-if="walletManagerState == 'READY'")
            div.access-request-container(v-if="currentAccessRequest", v-bind:class="{visible: currentAccessRequest}")
                div.access-request
                    p.title An application is requesting access
                    p.name {{currentAccessRequest.appInfo.name}}
                    p.description {{currentAccessRequest.appInfo.description}}
                    p.permissions Permissions: 
                        span.permission(v-for="(permission, index) in currentAccessRequest.appInfo.permissions") 
                            | {{index === currentAccessRequest.appInfo.permissions.length - 1 ? permission : permission + ', ' }}
                    button.approve(@click="dismissAccessRequest(currentAccessRequest, true)") Approve
                    button.reject(@click="dismissAccessRequest(currentAccessRequest, false)") Reject
            div.top
                // - select(v-model="wallet")
                // -         option(v-for="wallet in wallets", v-bind:value="wallet") {{wallet.keyPair.toString()}}
                // - button(v-on:click='addWallet()') Add Wallet
                span.connection-status 
                    //- | Network status: {{connectionStatus}}
                    //- br
                    | Version: {{version}}
            div.left-menu
                div.logo
                    include assets/svg/logo.html
                div.left-menu-list
                    router-link.link(v-for="section in sections", :key="section.name" :to="section.path", tag="span") {{section.name}}
                div.extras
                    a(@click="exportWallet") Export wallet
            div.content(v-if="identity")
                keep-alive
                    router-view.section
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

    import { radixApplication, RadixApplicationStates } from './modules/RadixApplication'
    import { radixServer } from './server/RadixServer'

    import Config from './shared/Config'
    
    import Messaging from './components/messaging/Messaging.vue'
    import ChatList from './components/messaging/chat/ChatList.vue'
    import InitialSetup from './components/InitialSetup.vue'
    import Wallet from './components/wallet/Wallet.vue'
    import Login from './components/Login.vue'

    import fs from 'fs-extra'

    import {filter} from 'rxjs/operators'

    export default Vue.extend({
        components: {
            InitialSetup,
            Login
        },
        subscriptions: {
            walletManagerState: radixApplication.stateSubject,
            // connectionStatus: this.$store.state.activeWallet.connectionStatus,
        },
        data() {
            return {
                activeSection: Wallet,
                sections: [
                    { path: '/wallet', name: 'Wallet', component: Wallet },
                    { path: '/messaging', name: 'Messaging', component: Messaging }
                ],
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
                    
                    
                    // this.identity.account.connectionStatus.subscribe({
                    //     next: (v) => {this.connectionStatus = v}
                    // })
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
                        this.$router.push({ name: 'Wallet'})
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
            isLoggedIn: function () {
                // @ts-ignore
                return this.$store.getters.isLoggedIn
            },
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

<style lang="scss">

    @font-face {
        font-family: GothamLight;
        src: url(assets/fonts/Gotham-Light.otf) format("opentype");
    }
    @font-face {
        font-family: GothamMedium;
        src: url(assets/fonts/Gotham-Medium.otf) format("opentype");
    }
    @font-face {
        font-family: GothamBook;
        src: url(assets/fonts/Gotham-Book.otf) format("opentype");
    }
    html {
        box-sizing: border-box;
    }
    * {
        box-sizing: inherit;
        &:before {
            box-sizing: inherit;
        }
        &:after {
            box-sizing: inherit;
        }
    }
    body {
        margin: 0;
        letter-spacing: 1px;
        font-weight: 500;
        font-family: GothamMedium, sans-serif;
        background: linear-gradient(134.77deg, #0d1c28 0, #081723 100%);
    }
    h1 {
        font-size: 22px;
        letter-spacing: 0.5px;
        line-height: 26px;
        font-weight: bold;
        text-transform: uppercase;
    }
    :not(input) {
        &:not(textarea) {
            user-select: none;
            cursor: default;
        }
        &:not(textarea)::after {
            user-select: none;
            cursor: default;
        }
        &:not(textarea)::before {
            user-select: none;
            cursor: default;
        }
    }
    input {
        outline: none;
        height: 40px;
        width: 100%;
        padding-left: 10px;
        margin: 0 0 10px 0;
        box-sizing: border-box;
        font-size: 16px;
        color: #00101c;
        border-radius: 2px;
        background-color: #ffffff;
        border-width: 0;
    }
    button {
        outline: none;
        display: inline-block;
        height: 40px;
        width: 100%;
        border-radius: 2px;
        border-style: none;
        border-width: 0;
        padding: 0;
        margin: 0 0 10px 0;
        box-sizing: border-box;
        background: linear-gradient(153.43deg, #9b5aff 0, #6d42fc 100%);
        box-shadow: 0 10px 30px 0 rgba(109, 66, 252, 0.2);
        text-align: center;
        font-size: 16px;
        color: #fff;

        &:hover {
            background: linear-gradient(153.43deg, #6d42fc 0, #5433BE 100%);
        }
    }
    textarea {
        outline: none;
        box-sizing: border-box;
        color: #00101c;
        border-radius: 2px;
        background-color: #ffffff;
        border-width: 0;
        resize: none;
    }
    :focus {
        outline: none;
    }
    .selectable {
        user-select: text;
        cursor: auto;
        word-break: break-all;
    }
    .VuePassword__Toggle {
        height: 40px !important;
    }

</style>

<style lang="scss" scoped>

    .container {
        height: 100vh;
        width: 100vw;
    }
    .main {
        display: grid;
        grid-template-columns: 220px auto;
        grid-template-rows: 50px auto;
        height: 100%;
        width: 100%;
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

    .top {
        grid-column: 1 / 3;
        grid-row: 1 / 1;
        background-color: #00111a;

        .connection-status {
            color: #fff;
            float: right;
            margin: 10px;
            font-size: 10px;	
            font-weight: 200;	

            text-align: right;
            font-family: GothamLight, sans-serif;
        }
    }
    .content {
        grid-column: 2 / 2;
        grid-row: 2 / 2;
        background-color: #e1eaef;
        overflow: hidden;
        .section {
            width: 100%;
            height: 100%;
        }
    }
    .left-menu {
        grid-column: 1 / 1;
        grid-row: 2 / 2;
        background-color: #00111a;
        
        .left-menu-list {
            margin: 0;
            padding: 0;
        }
        .link {
            font-family: GothamMedium, sans-serif;
            display: block;
            padding-left: 40px;
            margin-bottom: 26px;
            opacity: 0.6;
            color: #cde9ff;
            font-size: 14px;
            letter-spacing: 1px;
            &.router-link-active {
                padding-left: 36px;
                opacity: 1;
                color: #14E1DB !important;
                border-left: 4px solid;
                text-shadow: 0 10px 30px 0 rgba(109, 66, 252, 0.2);
            }

            &:hover {
                opacity: 1;
            }
        }
        .logo {
            margin: 10px 0 52px 40px;
        }

        .extras {
            position: absolute;
            bottom: 0;
            padding-bottom: 26px;

            a {
                font-family: GothamLight, sans-serif;
                padding-left: 40px;
                margin-bottom: 26px;
                opacity: 0.6;
                color: #cde9ff;
                font-size: 14px;
                letter-spacing: 1px;

                &:hover {
                    opacity: 1;
                }
            }
            
        }
    }
    .test {
        color: rebeccapurple;
    }

</style>
