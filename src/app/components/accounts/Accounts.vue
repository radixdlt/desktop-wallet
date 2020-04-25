<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
    div.container
        div.account-list
            AccountList()
        div.account-list
            HardwareWallets()            
</template>

<script lang="ts">
    import Vue from "vue";
    import AccountList from "./AccountList.vue"
    import HardwareWallets from "./HardwareWallets.vue"

    export default Vue.extend({
        components: {
            AccountList,
            HardwareWallets
        }
    })
</script>

<style lang="scss" scoped>
    .container {
        display: grid;
        grid-template-columns: auto auto;
    }
</style>
