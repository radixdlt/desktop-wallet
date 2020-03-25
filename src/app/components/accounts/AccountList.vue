<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        modal(:visible="editIndex > -1", @close="dismissEdit()")
            div.panel
                div.form.body.modal-panel
                    div.title Edit Account
                    div.field
                        label.label.is-small Name
                        div.control
                            input.input(v-model="editName", placeholder="Account name")

                    div.field
                        label.label.is-small Address
                        div.control
                            input.input.is-static(v-model="editAddress", readonly)
                    
                    div.field
                        div.control
                            button.button.is-primary.is-fullwidth(@click="saveEdit") Save

                    //- div.field
                    //-     div.control
                    //-         button.button.is-fullwidth(@click="deleteContact(editIndex)") Delete contact

        
        modal(:visible="isAdding", @close="cancelAdd")
            div.panel
                div.form.body.modal-panel
                    div.title Add Account
                    div.field
                        label.label.is-small Name
                        div.control
                            input.input(v-model="addAlias", placeholder="Account Name")
                    
                    div.field
                        div.control
                            button.button.is-primary.is-fullwidth(@click="saveAdd") Save

                    div.field
                        div.control
                            button.button.is-fullwidth(@click="cancelAdd") Cancel

        div.panel
            div.header Accounts
            div.controls
                button.button.is-primary(@click="addAccount()") Add Account
            div.component.body
                div.toolbar
                    span.header-text Account
                    span.header-text Actions
                div.accounts
                    div.account(v-for="(account, index) in accountManager.accounts")
                        div.details
                            div.alias.selectable {{account.alias}}                        
                            div.address.selectable {{account.identity.address}}

                        span.icon-container(@click="editAccount(index)") 
                            icon.edit-icon(name="cog")

                        span.icon-container(v-if="account !== activeAccount", @click="activateAccount(account)") 
                            icon.activate-icon-off(name="toggle-off",scale="2")

                        span.icon-container(v-if="account === activeAccount") 
                            icon.activate-icon-on(name="toggle-on",scale="2")
</template>

<script lang="ts">
    import Vue from 'vue'
    
    import { radixApplication } from '@app/modules/RadixApplication'
    import Contact from '@app/shared/contacts/Contact'
    import { RadixIdentity } from 'radixdlt'
    import Modal from '@app/components/shared/Modal.vue'
    import { WalletAccount } from '@app/modules/account/WalletAccount'

    export default Vue.extend({
        components: {
            Modal,
        },
        data() {
            return {
                isAdding: false,
                addAlias: '',
                
                editIndex: -1,
                editName: '',
                editAddress: '',
            }
        },
        methods: {
            activateAccount(account) {
                radixApplication.setActiveAccount(account)
                this.$router.push({ name: 'dashboard'})
            },
            editAccount(index) {
                this.editIndex = index
                this.editName = this.accountManager.accounts[index].alias
                this.editAddress = this.accountManager.accounts[index].identity.address.toString()
            },
            saveEdit() {
                this.accountManager.accounts[this.editIndex].alias = this.editName
                this.accountManager.store(radixApplication.keystorePassword)

                this.dismissEdit()
            },
            deleteContact(index) {
                this.dismissEdit()
            },
            dismissEdit() {
                this.editIndex = -1
            },

            addAccount() {
                this.addAlias = `Account #${this.accountManager.accounts.length + 1}`
                this.isAdding = true
            },
            cancelAdd() {
                this.isAdding = false
            },
            saveAdd() {
                this.accountManager.addAccount(this.accountManager.generateNewAccount(this.addAlias))
                this.isAdding = false

                // Save to disk
                this.accountManager.store(radixApplication.keystorePassword)
            },
        },
        computed: {
            activeAccount(): WalletAccount {
                return this.$store.state.activeAccount
            },
            accountManager() {
                return radixApplication.accountManager
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
                grid-template-rows: 40px;
                grid-template-columns: 1fr max-content;
                padding: 0 $panel-padding;

                .header-text {
                    font-size: 12px;
                    color: $grey;
                    line-height: 40px;
                }
            }

            .accounts {
                height: 100%;

                .account {
                    display: grid;
                    grid-template-rows: 40px;
                    grid-template-columns: 1fr max-content max-content;
                    align-items: center;

                    padding: 0 $panel-padding;
                    border-top: 1px solid  $grey-light;

                    .details {
                        .alias {
                            padding-bottom: 2px;
                        }
                        .address {
                            color: $grey;
                            font-size: 10px;
                            font-weight: 300;
                        }
                    }

                    .icon-container {
                        margin-left: 10px;
                        height: 100%;
                        justify-self: end;

                        .edit-icon {
                            color: $green;
                            height: 100%;
                        }

                        .activate-icon-off {
                            color: $grey;
                            height: 100%;
                        }

                        .activate-icon-on {
                            color: $green;
                            height: 100%;
                        }
                    }
                    
                }
            }
            
        }
    }
    

</style>
