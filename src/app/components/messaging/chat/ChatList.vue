<template lang="pug">
// Always have an empty outer div, due to this issue https:// github.com/vuejs/vue-loader/issues/957
div 
    div.container
        nav-menu.nav
        div.chat-list-container
            div.new-chat
                input.new-chat-address(v-model="newChatAddress", placeholder="new chat address", @keyup.enter="addNewChat()", @input="addressError=''")
                span(@click="addNewChat()")
                    icon.new-chat-icon(name="plus")
                span.error {{addressError}}
            div.chat-list
                div.chat-item(
                        v-for="chat in chatList",
                        v-on:click="activeChat = chat",
                        v-bind:class="{ 'active-chat-item': activeChat == chat }"
                    ) 
                    span {{chat.title}}
        div.active-chat
            chat.chat(v-if="activeChat != null", :chat="activeChat")
            h3.chat-else(v-else) No chat selected
</template>

<script lang="ts">
    import Vue from 'vue'
    
    import { radixApplication } from '../../../modules/RadixApplication'

    import { 
        RadixMessagingAccountSystem, 
        RadixAddress 
    } from 'radixdlt'

    import NavMenu from '../NavMenu.vue'
    import Chat from './Chat.vue'

    export default Vue.extend({
        components: {
            Chat,
            NavMenu
        },
        data() {
            return {
                chatList: [],
                activeChat: null,
                // @ts-ignore
                newChatAddress: this.$route.params.address,
                addressError: '',
            }
        },
        created() {
            radixApplication.on('atom-received:message', this.updateChatList)
            radixApplication.on('contact-added', this.updateChatList)
        },
        destroyed() {
            radixApplication.removeListener('atom-received:message', this.updateChatList)
            radixApplication.removeListener('contact-added', this.updateChatList)
        },
        mounted() {
            this.updateChatList()
            this.loadChat()
        },
        methods: {
            addNewChat() {
                try {
                    // this.wallet.startNewChat(this.newChatAddress)
                    this.startNewChat(this.newChatAddress)
                    // @ts-ignore
                    this.$router.push({ path: '/messaging/chatlist/' + this.newChatAddress })
                    this.newChatAddress = ''
                } catch (error) {
                    console.error(error)
                    this.addressError = error.message
                }
            },
            startNewChat(address) {
                // Parse and check address for validity
                let to = RadixAddress.fromAddress(address)

                // Add at the top
                this.messagingSystem.startNewChat(to)

                // radixApplication.emit('atom-received:message')

                this.addContact(to)
            },
            addContact(address, alias = null) {
                if (typeof address == 'string') {
                    address = RadixAddress.fromAddress(address)
                } else if(address instanceof RadixAddress) {
                    // Do nothing
                } else {
                    throw new Error('Invalid address type supplied')
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
            loadChat() {
                // Comment this if you don't want the sidebar to pop-up directly
                // @ts-ignore
                if (this.$route.params.address) {
                    for (let chat of this.chatList) {
                        // @ts-ignore                
                        if (chat.address == this.$route.params.address) {
                            this.activeChat = chat
                            this.newChatAddress = ''
                            break
                        }
                    }
                    // If it's the first message to this address
                    if (!this.activeChat) {
                        this.addNewChat()
                        // @ts-ignore
                        this.chatList = this.messagingSystem.chats.values()
                        // Search again for the right chatList
                        for (let chat of this.chatList) {
                            // @ts-ignore
                            if (chat.chat_id == this.$route.params.address) {
                                this.activeChat = chat
                                this.newChatAddress = ''
                                break
                            }
                        }
                    }
                }
            },
            updateChatList() {
                this.chatList = this.messagingSystem.chats.values().slice().reverse().map((chat) => {
                    const address = chat.address
                    let title = chat.title
                    if (address in this.contacts) {
                        title = this.contacts[address].alias
                    }
                    chat.title = title

                    return chat
                })
            }
        },
        computed: {
            identity () {
                return radixApplication.activeIdentity
            },
            messagingSystem () {
                return radixApplication.activeIdentity.account.messagingSystem
            },
            contacts () {
                // @ts-ignore
                return this.$store.state.contacts[this.identity.account.getAddress()]
            }
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-columns: 50% 50%;
        grid-template-rows: 170px 1fr;
        grid-template-areas: 'nav active-chat' 'chat-list-container active-chat';

        height: 100%;
        background-color: #e5edf1;
    }
    .nav {
        grid-area: nav;
        margin: 90px 0 0 90px;
    }
    .chat-list-container {
        grid-area: chat-list-container;
        margin-left: 90px;
        min-height: 0;

        .new-chat {
            display: grid;
            grid-template-rows: 30px 20px;
            grid-template-columns: auto 30px;
            align-items: center;

            // padding-bottom: 10px;
            .new-chat-address {
                grid-row: 1;
                grid-column: 1;
                height: 30px;

                margin: 0;
                background-color: #e5edf1;
                &::-webkit-input-placeholder {
                    color: darkgray;
                    opacity: 0.5;
                }
            }
            .new-chat-icon {
                grid-row: 1;
                grid-column: 2;

                height: 100%;
                color: #693cf5;
            }

            .error {
                grid-row: 2;
                grid-column: 1;

                height: 20px;
                padding-bottom: 5px;
                font-weight: 300;
                font-size: 10px;
                color: #FF4E59;
            }
        }
        .chat-list {
            display: flex;
            flex-direction: column;

            height: calc(100% - 50px);
            overflow: auto;

            .chat-item {
                padding: 10px;

                span {
                    width: 100%;
                    
                    white-space: nowrap; 
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .active-chat-item {
                border: none;
                border-radius: 4px 0 0 4px;
                background-color: #ecf2f5;
                z-index: 1;
            }
        }
    }
    .active-chat {
        grid-area: active-chat;
        height: 100%;
        background-color: #ecf2f5;
        box-shadow: 0 10px 20px 0 rgba(0, 16, 28, 0.03);
        .chat {
            height: 100%;
        }
        .chat-else {
            padding-left: 20px;
        }
    }

</style>
