<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        modal(:visible="editIndex > -1", @close="dismissEdit()")
            div.panel
                div.form.body.modal-panel
                    div.title Edit Contact
                    div.field
                        label.label.is-small Name
                        div.control
                            input.input(v-model="editName", placeholder="Contact name")

                    div.field
                        label.label.is-small Address
                        div.control
                            input.input.is-static(v-model="editAddress", readonly)
                    
                    div.field
                        div.control
                            button.button.is-primary.is-fullwidth(@click="saveEdit") Save
                        p.help.is-danger(v-if="editError") {{editError}}

                    div.field
                        div.control
                            button.button.is-fullwidth(@click="deleteContact(editIndex)") Delete contact

        
        modal(:visible="isAdding", @close="isAdding = false")
            div.panel
                div.form.body.modal-panel
                    div.title Add Contact
                    div.field
                        label.label.is-small Name
                        div.control
                            input.input(v-model="addName", placeholder="Contact name")

                    div.field
                        label.label.is-small Address
                        div.control
                            input.input(
                                v-model="addAddress", 
                                @keyup="addError = ''", 
                                :class="{'is-danger': addError}",
                                placeholder="Contact address",
                            )
                        p.help.is-danger(v-if="addError") {{addError}}
                    
                    div.field
                        div.control
                            button.button.is-primary.is-fullwidth(@click="saveAdd") Save

                    div.field
                        div.control
                            button.button.is-fullwidth(@click="isAdding = false") Cancel

        div.panel
            div.header Contact List
            div.controls
                button.button.is-primary(@click="addContact()") Add Contact
            div.component.body
                div.toolbar
                    input.input.search-contact(placeholder="Search contacts...", v-model="searchPhrase")
                    p.connections
                        b {{Object.keys(contacts).length}}
                        span &nbsp;Connections
                div.contacts
                    div.contact(v-for="(contact, index) in filteredContacts")
                        div.details
                            div.alias.selectable {{contact.alias}}                        
                            div.address.selectable(v-if="contact.address !== contact.alias") {{contact.address}}
                        span.icon-container(@click="editContact(index)") 
                            icon.edit-icon(name="pencil-alt")
                        span.icon-container(@click="sendXRD(contact.address)")
                            icon.exchange-icon(name="exchange-alt")
</template>

<script lang="ts">
    import Vue from 'vue'
    
    import { radixApplication } from '@app/modules/RadixApplication'
    import Contact from '@app/shared/contacts/Contact'
    import { RadixIdentity } from 'radixdlt'

    import Modal from '@app/components/shared/Modal'

    export default Vue.extend({
        components: {
            Modal,
        },
        data() {
            return {
                searchPhrase: '',
                
                editName: '',
                editAddress: '',
                editIndex: -1,
                editError: '',
                
                
                addError: '',
                addName: '',
                addAddress: '',
                isAdding: false,

            }
        },
        methods: {
            sendXRD(address) {
                // @ts-ignore
                this.$router.push({ name: 'send', params: { address: address }})
            },
            async saveContacts() {
                this.$store.dispatch('saveContacts')
            },
            editContact(index) {
                this.editIndex = index
                this.editAddress = this.filteredContacts[index].address
                if (this.filteredContacts[index].alias !== this.filteredContacts[index].address) {
                    this.editName = this.filteredContacts[index].alias
                } else {
                    this.editName = ''
                }
            },
            saveEdit() {
                try {
                    this.$store.commit('addOrUpdateContact', {
                        address: this.editAddress,
                        alias: this.editName,
                    })
                } catch (e) {
                    this.editError = 'The address is not valid'
                    return
                }

                this.saveContacts()
                this.dismissEdit()
            },
            deleteContact(index) {
                let contact = this.filteredContacts[index]
                this.$store.commit('deleteContact', contact.address)
                this.dismissEdit()
            },
            dismissEdit() {
                this.editIndex = -1
            },

            addContact() {
                this.addName = ''
                this.addAddress = ''
                this.isAdding = true
            },
            saveAdd() {
                try {
                    this.$store.commit('addOrUpdateContact', {
                        address: this.addAddress,
                        alias: this.addName,
                    })
                } catch (e) {
                    this.addError = 'The address is not valid'
                    return
                }

                this.saveContacts()
                this.isAdding = false
            },
        },
        computed: {
            identity(): RadixIdentity {
                return this.$store.state.activeAccount.identity
            },
            contacts(): {[address: string]: Contact} {
                return this.$store.state.contacts
            },
            filteredContacts(): Contact[] {
                return Object.values(this.contacts)
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
        padding: 0 20px 20px 20px;
        height: 100%;

        .modal-panel {
            padding: 30px;

            .title {
                font-size: 18px;
            }
        }

        .component {
            min-height: 0;
            
            .toolbar {
                display: grid;
                grid-template-rows: auto;
                grid-template-columns: auto 180px;
                align-items: center;
                padding: 0 $panel-padding;

                .search-contact {
                    margin: 3px 0 -1px 0;
                    padding-left: 0;

                    border: none;
                    border-bottom: 1px solid $grey-light;
                    border-radius: 0;

                    &:focus {
                        margin-bottom: -1px;
                        border-bottom: 1px solid $primary;
                        box-shadow: none;
                    }
                }
                .connections {
                    justify-self: end;
                }
            }
            .contacts {
                height: 100%;

                .contact {
                    display: grid;
                    grid-template-rows: 40px;
                    grid-template-columns: 1fr 40px 40px;
                    align-items: center;

                    padding: 0 $panel-padding;
                    border-top: 1px solid  $grey-light;

                    .icon-container {
                        margin-left: 10px;
                        height: 100%;
                        justify-self: end;

                        .exchange-icon {
                            height: 100%;
                            color: $green;
                        }
                        .edit-icon {
                            color: $green;
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
                            color: $grey;
                            font-size: 10px;
                            font-weight: 300;
                        }
                    }
                    
                }
            }
            
        }
    }
    

</style>
