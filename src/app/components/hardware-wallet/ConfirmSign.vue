<template lang="pug">
div 
    Modal(@close="close()")
      div.panel
        div.form.body.modal-panel
            div.title Confirm sign
            div(v-if="ledgerAppOpen")
              p.
                Waiting for confirmation on your hardware wallet device.
              p.atomHash.
                Signing atom hash: {{ atomHash }}
            div(v-else).
              Please open the Radix Ledger App on your device.
              
                  
</template>

<script lang="ts">
import Vue from 'vue'
import Modal from '../shared/Modal.vue'
import { atomHashObservable } from '@radixdlt/hardware-wallet'

export default Vue.extend({
  components: {
    Modal,
  },
  props: {
    close: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      atomHash: '',
    }
  },
  computed: {
    ledgerAppOpen(): boolean {
      return this.$store.state.ledgerAppOpen
    },
  },
  created() {
    atomHashObservable.subscribe(hash => {
      this.atomHash = hash
    })
  },
})
</script>

<style lang="scss" scoped>
.atomHash {
  margin-top: 10px;
}
</style>
