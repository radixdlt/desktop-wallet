<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        nav-menu.nav
        div.component
            div.toolbar
                input.search-contact(placeholder="Search", v-model="searchPhrase")
                p.connections
                    b {{Object.keys(contacts).length}}
                    span &nbsp;Connections
            div.contacts
                div.contact(v-for="(contact, index) in filteredContacts")
                    div.details
                        popover(:name=" 'edit'+index ", :width="600") 
                            input.edit-alias(
                                type="text",
                                v-model.lazy="contact.alias",
                                @keyup.enter.exact="saveContacts()"
                                @keydown.enter.shift.exact="")
                        div.alias.selectable {{contact.alias}}                        
                        div.address.selectable(v-if="contact.address !== contact.alias") {{contact.address}}
                    span.icon-container(v-popover.left="{ name: 'edit'+index}") 
                        icon.edit-icon(name="pencil-alt")
                    span.icon-container(@click="sendMessage(contact.address)")
                        icon.chat-icon(name="regular/comment-alt")
                    span.icon-container(@click="sendXRD(contact.address)")
                        icon.exchange-icon(name="exchange-alt")
</template>

<script lang="ts">
    import Vue from 'vue'
    
    import { radixApplication } from '../../../modules/RadixApplication'
    
    import NavMenu from '../NavMenu.vue'

    import fs from 'fs-extra'

    export default Vue.extend({
        components: {
            NavMenu
        },
        data() {
            return {
                searchPhrase: ""
            }
        },
        methods: {
            sendMessage(address) {
                // @ts-ignore
                this.$router.push({ path: '/messaging/chatlist/' + address })
            },
            sendXRD(address) {
                // @ts-ignore
                this.$router.push({ name: 'Wallet', params: { sidebar: 'send', address: address }})
            },
            async saveContacts() {
                const serializedContacts = []

                for (const address in this.contacts) {
                    serializedContacts.push({
                        address: address,
                        alias: this.contacts[address].alias
                    })
                }

                // TODO: encrypt
                // @ts-ignore
                await fs.writeJson(this.$store.state.contactsFileName, serializedContacts)

                this.$forceUpdate()
            }
        },
        computed: {
            identity() {
                // @ts-ignore
                return radixApplication.activeIdentity
            },
            contacts() {
                // @ts-ignore
                return this.$store.state.contacts[this.identity.account.getAddress()]
            },
            filteredContacts() {
                // @ts-ignore
                return Object.values(this.$store.state.contacts[this.identity.account.getAddress()])
                    .filter((contact: any) => {
                        const phrase = this.searchPhrase.trim().toLowerCase()
        
                        if (phrase.length < 1) {
                            return true
                        }
                        if (contact.address.toLowerCase().indexOf(phrase) > -1) {
                            return true
                        }
                        if (contact.alias.toLowerCase().indexOf(phrase) > -1) {
                            return true
                        }

                        return false
                    })
            }
        },
    })
</script>

<style lang="scss" scoped>

    .container {
        display: grid;
        grid-template-rows: 80px 1fr;
        grid-template-areas: 'nav' 'component';

        padding: 90px 90px 0 90px;
        height: 100%;
        background-color: #e5edf1;
    }
    .nav {
        grid-area: nav;
    }
    .component {
        grid-area: component;
        min-height: 0;
        
        .toolbar {
            display: grid;
            grid-template-rows: 40px;
            grid-template-columns: auto 180px;
            align-items: center;
            .search-contact {
                margin: 0;
                background-color: #e5edf1;
                &::-webkit-input-placeholder {
                    color: darkgray;
                    opacity: 0.5;
                }
            }
            .connections {
                justify-self: end;
            }
        }
        .contacts {
            overflow: auto;
            height: 100%;
            padding-bottom: 50px;

            .contact {
                display: grid;
                grid-template-rows: 40px;
                grid-template-columns: 1fr 40px 40px 40px;
                align-items: center;

                border-top: 1px solid  lightgray;
                .icon-container {
                    padding-right: 10px;
                    height: 100%;
                    justify-self: end;

                    .chat-icon {
                        height: 100%;
                        color: #693cf5;
                    }
                    .exchange-icon {
                        height: 100%;
                        color: #35b0e5;
                    }
                    .edit-icon {
                        color: #693cf5;
                        height: 100%;
                    }
                }

                .details {
                    .edit-alias {
                        margin: 0;
                    }
                    .alias {
                        padding-bottom: 2px;
                    }
                    .address {
                        color: #5A666E;
                        font-size: 10px;
                        font-weight: 300;
                    }
                }

                
            }
        }
        
    }

</style>
