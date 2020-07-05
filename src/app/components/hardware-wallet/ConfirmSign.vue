<template lang="pug">
div 
    Modal(@close="close()")
      div.panel
        div.form.body.modal-panel
            div.title Confirm sign
            div(v-if="ledgerAppOpen").
              Waiting for confirmation on your hardware wallet device.
            div(v-else).
              Please open the Radix Ledger App on your device.
                  
</template>

<script lang="ts">
import Vue from 'vue'
import Modal from '../shared/Modal.vue'
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
  computed: {
    ledgerAppOpen(): boolean {
      return this.$store.state.ledgerAppOpen
    },
  },
})
</script>

<style lang="scss" scoped>
</style>
