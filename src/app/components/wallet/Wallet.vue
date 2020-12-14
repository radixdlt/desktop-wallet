<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.main
            balance.balance
            history.history
</template>

<script lang="ts">
import Vue from 'vue'
import Balance from './Balance.vue'
import History from './History.vue'

export default Vue.extend({
  components: {
    Balance,
    History,
  },
  computed: {
    identity() {
      this.$store.state.activeAccount
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-template-rows: auto;
  height: 100%;
  width: 100%;

  .main {
    grid-column: 1 / 3;
    grid-row: 1;
    width: auto;

    display: grid;
    grid-template-columns: auto;
    grid-template-rows: max-content 1fr;
    overflow: hidden;
    grid-gap: 30px 20px;

    min-height: 0;

    padding: 0 20px 20px 20px;

    .balance {
      grid-column: 1;
      grid-row: 1;
      width: 100%;
    }

    .history {
      grid-column: 1;
      grid-row: 2;
      width: 100%;
      overflow: hidden;
    }
  }
}
</style>
