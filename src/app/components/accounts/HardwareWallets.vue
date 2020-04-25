<template lang="pug">
    div
        div.container
            modal(:visible="isAdding", @close="cancelAdd")
                div.panel
                    div.form.body.modal-panel
                        div.title Add Wallet
                        div
                            h1(v-if="isConnected")
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
                            h1(v-else).
                                    Please connect your Ledger Nano S device and open the Radix app.

            div.panel
                div.header Hardware Wallet
                div.component.body
                  span(v-if="!isConnected && !accountManager.wallets[0]").
                      Please connect your Ledger Nano S device and open the Radix app.
                  div(v-else)
                    div.toolbar
                        span.header-text Wallet
                        span.header-text Connected
                        span.header-text Actions
                    
                    div.accounts
                        div.account(v-for="(account, index) in accountManager.wallets")
                            div.details
                                div.alias.selectable {{account.alias}}                 
                                div.address.selectable {{account.identity.address}}

                            span.ledger-icon-container(v-if="!isConnected") 
                                icon.activate-icon-off(name="toggle-off",scale="2")
                            span.ledger-icon-container(v-else) 
                                icon.activate-icon-on(name="toggle-on",scale="2")

                            span.account-icon-container(v-if="account !== activeAccount", @click="activateAccount(account)") 
                                icon.activate-icon-off(name="toggle-off",scale="2")

                            span.account-icon-container(v-if="account === activeAccount") 
                                icon.activate-icon-on(name="toggle-on",scale="2")
</template>

<script lang="ts">
import Vue from "vue";

import { radixApplication } from "@app/modules/RadixApplication";
import Contact from "@app/shared/contacts/Contact";
import { RadixIdentity } from "radixdlt";
import Modal from "@app/components/shared/Modal.vue";
import { WalletAccount } from "@app/modules/account/WalletAccount";
import { RadixLedgerIdentity, subscribe } from "radixdlt";

export default Vue.extend({
  components: {
    Modal
  },
  data() {
    return {
      isAdding: false,
      addAlias: "",

      editIndex: -1,
      editName: "",
      editAddress: "",

      isConnected: false,
      connectionError: undefined,

      publicKey: undefined,
      identity: undefined,
      subscription: undefined
    };
  },
  methods: {
    activateAccount(account) {
      radixApplication.setActiveAccount(account);
    },
    editAccount(index) {
      this.editIndex = index;
      //this.editName = this.accountManager.accounts[index].alias
      //this.editAddress = this.accountManager.accounts[index].identity.address.toString()
    },
    saveEdit() {
      //this.accountManager.accounts[this.editIndex].alias = this.editName
      //this.accountManager.store(radixApplication.keystorePassword)

      this.dismissEdit();
    },
    deleteContact(index) {
      this.dismissEdit();
    },
    dismissEdit() {
      this.editIndex = -1;
    },

    addWallet() {
      this.isAdding = true;
    },
    cancelAdd() {
      this.isAdding = false;
    },
    saveAdd() {
      this.accountManager.addWallet(this.identity, this.addAlias);
      this.isAdding = false;
    }
  },
  computed: {
    activeAccount(): WalletAccount {
      return this.$store.state.activeAccount;
    },
    accountManager() {
      return radixApplication.accountManager;
    }
  },
  created() {
    RadixLedgerIdentity.createNew().then(async identity => {
      this.isConnected = true;
      this.publicKey = identity.getPublicKey();
      const deviceInfo = (await identity.getDeviceInfo()) as any;
      this.addAlias = `${deviceInfo.manufacturer} ${deviceInfo.product}`;
      this.identity = identity;

      this.saveAdd();

      this.subscription = subscribe(
        () => {
          this.isConnected = true;
        },
        () => {
          this.isConnected = false;
        }
      );
    });
  },
  beforeDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
});
</script>


<style lang="scss" scoped>
.container {
  padding: 0px 20px 20px 20px;
  height: 100%;

  .component {
    min-height: 101px;
    padding: 10px;

    .toolbar {
      display: grid;
      grid-column-gap: 15px;
      grid-template-rows: 40px;
      grid-template-columns: 70% 1fr 1fr;
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
        grid-template-columns: 75% 1fr 1fr;
        align-items: center;

        padding: 0 $panel-padding;
        border-top: 1px solid $grey-light;

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

        @mixin icon-container($offColor) {
          margin-left: 10px;
          height: 100%;
          justify-self: end;

          .edit-icon {
            color: $green;
            height: 100%;
          }

          .activate-icon-off {
            color: $offColor;
            height: 100%;
          }

          .activate-icon-on {
            color: $green;
            height: 100%;
          }
        }

        .account-icon-container {
          @include icon-container($grey);
        }
        .ledger-icon-container {
          @include icon-container($red);
        }
      }
    }
  }
}
</style>
