<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
    router-view(:key="$route.fullPath").component
</template>

<style lang="scss" scoped>

    .component {
        height: 100%;
    }

</style>
