<template lang="pug">
    div 
        div.container
          div.header Connect to a node
          div.grid
            template(v-for="node in nodes")
              button.button(v-on:click="connectCustomNode(node.json.nodeAddress, node.json.useSSL, node.json.universeConfig, node.name, node.json.faucetAddress)").
                {{ node.name }}
            button.button(v-on:click="connectLocalhost()").
              Localhost
            
            div
              span.
                Custom node:
              input.input(v-model="customNodeAddress", placeholder="Node address")
              button.button(v-on:click="connectTrustedCustomNode(customNodeAddress)").
                Connect
 
          
                
</template>

<script lang="ts">
import Vue from 'vue'
import testnet from './networks/testnet.json'
import {
  connectLocalhost,
  connectCustomNode,
  connectTrustedCustomNode,
  setFaucet,
} from '../../modules/network-connection'
import Modal from '@app/components/shared/Modal.vue'
import { accountManager } from '../../modules/account/AccountManager'
import { RadixUniverse } from 'radixdlt'

export default Vue.extend({
  data() {
    return {
      nodes: [{
        name: 'Radix Devnet',
        json: testnet,
      }],
      modalVisible: false,
      customNodeAddress: '',
    }
  },

  components: {
    Modal,
  },

  methods: {
    connectLocalhost() {
      connectLocalhost()
      accountManager.setUniverse('Localhost')
    },
    connectCustomNode(
      address: string,
      useSSL: boolean,
      universe: any,
      name: string,
      faucetAddress?: string
    ) {
      connectCustomNode(address, useSSL, universe, name)
      if (faucetAddress) {
        setFaucet(faucetAddress)
      }
      accountManager.setUniverse(name)
    },
    connectTrustedCustomNode(address, name: string) {
      connectTrustedCustomNode(address, true, name)
      accountManager.setUniverse(name)
    },
    openModal() {
      this.modalVisible = true
    },
    closeModal() {
      this.modalVisible = false
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  padding: 30px;
  height: 100%;

  .component {
    min-height: 0;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 2fr auto;
  grid-row-gap: 20px;
}
</style>