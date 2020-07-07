<template lang="pug">
    modal(@close="onClose()")
            div.panel
                div.form.body.modal-panel
                    div.title Connect hardware wallet
                    div.connection
                        p.
                            Device connected
                            
                        icon.checkIcon(v-if="deviceConnected || appConnected" name="check")
                        icon.crossIcon(v-else name="times")
                        
                        p.
                            Radix App opened
                        icon.checkIcon(v-if="appConnected" name="check")
                        icon.crossIcon(v-else name="times")
                    div(v-if="account")
                      p.
                        Using address {{ account.identity.address.toString() }}
                      button.button.is-primary(@click="confirm()").
                        Confirm

</template>

<script lang="ts">
import Vue from 'vue'
import Modal from '@app/components/shared/Modal.vue'
import {
  appReady,
} from '../../modules/application-state'
import {
  subscribeConnection,
  ConnectionEvent,
} from '../../modules/hardware-wallet-connection'
import {
  subscribeAppConnection,
  subscribeDeviceConnection,
} from '@radixdlt/hardware-wallet'
import { Subscription, Observer } from 'rxjs'
import { accountManager } from '../../modules/account/AccountManager'
import { WalletAccount } from '../../modules/account/WalletAccount'

export default Vue.extend({
  components: {
    Modal,
  },
  props: {
    onClose: Function,
  },
  data() {
    return {
      deviceConnected: false,
      appConnected: false,
      subscription: undefined,
      confirmAddress: <() => void> undefined,
    }
  },
  methods: {
    confirm() {
      this.confirmAddress()
      appReady()
    },
  },
  async created() {
    this.subscription = await subscribeConnection(event => {
      switch (event) {
        case ConnectionEvent.DEVICE_CONNECTED:
          this.deviceConnected = true
          break
        case ConnectionEvent.DEVICE_DISCONNECTED:
          this.deviceConnected = false
          break
        case ConnectionEvent.APP_OPEN:
          this.appConnected = true
          break
        case ConnectionEvent.APP_CLOSED:
          this.appConnected = false
          break
      }
    })
    this.confirmAddress = await accountManager.loadHardwareWalletAccount()
  },
  beforeDestroy() {
    this.subscription.unsubscribe()
  },
  computed: {
    account(): WalletAccount {
      return this.$store.state.activeAccount
    },
  },
})
</script>

<style lang="scss" scoped>
.connection {
  display: grid;
  grid: 1fr 1fr / 5fr 1fr;
  width: 30%;
}
.checkIcon {
  color: $green;
}
.crossIcon {
  color: $red;
}
</style>