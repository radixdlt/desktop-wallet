<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
    div.title
        h1 MESSAGES
    div.menu
        router-link.menu-item(v-for="section in sections", :key="section.name" :to="section.path", tag="span") {{section.name}} 
</template>

<script>
    export default {
        data() {
            return {
                sections: [
                    { path: '/messaging/chatlist', name: 'CHATS' },
                    { path: '/messaging/contacts', name: 'CONTACTS' }
                ]
            }
        }
    }
</script>

<style lang="scss" scoped>

    .menu {
        padding-bottom: 5px;
        border-bottom: 1px solid  lightgray;
        .menu-item {
            font-size: 12px;
            padding-bottom: 8px;
            margin-right: 15px;
            color: #00101c;
            opacity: 0.5;
            &.router-link-active {
                color: #693cf5;
                border-bottom: 1px solid #693cf5;
                opacity: 1;
            }
        }
    }

</style>
