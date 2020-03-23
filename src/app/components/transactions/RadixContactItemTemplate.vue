<template>
  <div>
    <span>{{ item.alias }}</span>
    <abbr v-if="item.alias !== item.address"> {{item.address}}</abbr>
  </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        props: {
            item: { required: true },
            searchText: { required: true }
        }
    })
</script>

<style lang="scss" scoped>

</style>
