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

</template>

<script lang="ts">
import Vue from 'vue'
import Modal from '@app/components/shared/Modal.vue'
import { connectHardwareWallet } from '../../modules/application-state'
import {
  subscribeConnection,
  ConnectionEvent,
} from '../../modules/hardware-wallet-connection'
import { subscribeAppConnection, subscribeDeviceConnection } from '@radixdlt/hardware-wallet'
import { Subscription, Observer } from 'rxjs'
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
    }
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
    connectHardwareWallet()
  },
  beforeDestroy() {
    this.subscription.unsubscribe()
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