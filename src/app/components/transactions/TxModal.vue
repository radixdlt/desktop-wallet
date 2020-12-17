<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
  Modal(@close="close()", v-bind:visible="visible")
    .panel
      .form.body.modal-panel
        .title Confirm transaction
        p.
          Transaction fee: {{fee}} XRD
        p.
          Total cost: {{amount}} {{token.split('/')[2]}} + {{fee}} XRD
        button.button.is-primary.is-fullwidth.send(@click="onSubmit()") Send
</template>

<script lang="ts">
import Vue from "vue";
import { RadixIdentity } from "radixdlt";
import Modal from "../shared/Modal.vue";

export default Vue.extend({
  components: {
    Modal,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    onSubmit: {
      type: Function,
      required: true,
    },
    close: {
      type: Function,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
</style>
