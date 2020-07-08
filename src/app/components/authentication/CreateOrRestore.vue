<template lang="pug">
    // Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
    div
        div.wrapper.auth
            div.field.logo
                img(src="@assets/svg/logo-dark.svg")
            h1.title.
                Welcome to Radix Wallet
            h1.subtitle.
                In order to continue, you have to create a
                wallet by receiving tokens or restore an existing one.

            div.large-button(@click="createWallet()")
                div.icon
                    //- img(src="@assets/svg/icons/plus.svg")
                    icon(name="plus")
                div.text Create a new wallet
            div.large-button(@click="restoreWallet()")
                div.icon
                    //- img(src="@assets/svg/icons/refresh.svg")
                    icon(name="undo")
                div.text Restore an existing wallet
            div.large-button(@click="hardwareWallet()")
                div.icon
                    //- img(src="@assets/svg/icons/refresh.svg")
                    icon(name="undo")
                div.text Hardware Wallet
        HardwareWalletModal(v-if="hardwareWalletSelected === true" v-bind:onClose="onHardwareWalletClose")
</template>

<script lang="ts">
import Vue from 'vue'
import { accountManager } from '../../modules/account/AccountManager'
import {
  createWallet,
  restoreWallet,
} from '../../modules/application-state'
import HardwareWalletModal from './HardwareWalletModal.vue'

export default Vue.extend({
  components: {
    HardwareWalletModal,
  },
  data() {
    return {
      hardwareWalletSelected: false,
    }
  },
  methods: {
    createWallet() {
      createWallet()
    },
    restoreWallet() {
      restoreWallet()
    },
    hardwareWallet() {
      this.hardwareWalletSelected = true
    },
    onHardwareWalletClose() {
      this.hardwareWalletSelected = false
    },
  },
})
</script>

<style lang="scss" scoped>
.large-button {
  margin-top: 16px;
  cursor: pointer;

  height: 100px;
  border-radius: 3px;
  font-size: 14px;

  background-color: $grey-light;

  padding: 32px 20px;

  &:hover {
    background-color: $grey-light;
    box-shadow: 0 2px 4px 0 rgba(163, 173, 183, 0.04),
      0 12px 30px 0 rgba(82, 95, 127, 0.12);
  }

  .icon {
    float: left;
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: 9px;
    background-color: rgba(#dbdde0, 0.3);
    color: $green;
  }

  .text {
    display: inline-block;
    margin-left: 10px;
    line-height: 36px;
  }
}
</style>
