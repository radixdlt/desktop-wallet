<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.modal(:class="{'is-active': visible}")
        div.modal-background
        div.modal-content
            slot
        div.modal-close.is-large(@click="$emit('close')")
</template>

<script lang="ts">
    import Vue from 'vue'
    export default Vue.extend({
        props: {
            visible: {
                type: Boolean,
                default: true,
            },
        }
    })
</script>

<style lang="scss" scoped>
</style>
