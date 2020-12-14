<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.panel
            div.header Transactions
            div.body
                div.tabs
                    router-link.tab.link(
                        v-for="section in sections", 
                        :key="section.name" 
                        :to="section.path",
                        active-class="is-active" 
                        tag="span") {{section.name}}
                div.content
                    keep-alive
                        router-view.fill
            


</template>

<script lang="ts">
import Vue from 'vue'
import { RadixIdentity } from 'radixdlt'

export default Vue.extend({
  data() {
    return {
      sections: [
        { path: '/main/transactions/send', name: 'Send' },
        { path: '/main/transactions/receive', name: 'Receive' },
      ],
    }
  },
  computed: {
    identity(): RadixIdentity {
      return this.$store.state.activeAccount.identity
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  padding: 0 20px 30px;

  .panel {
    max-width: 680px;
    margin: 0 auto;

    .body {
      padding: 30px;

      .content {
        margin-top: 20px;
      }
    }
  }
}
</style>
