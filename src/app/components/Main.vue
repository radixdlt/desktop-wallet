<template lang="pug">
    div.wrapper
        div.main
            div.left-menu
                div.logo
                    img(src="@assets/png/logo-white.png")
                div.left-menu-list
                    router-link.link(v-for="section in sections", :key="section.name" :to="section.path", tag="span") {{section.name}}
                
                div.left-menu-list.extras
                    router-link.link(v-for="section in extraSections", :key="section.name" :to="section.path", tag="span") {{section.name}}
                
            div.header
                top-menu
            div.content(v-if="identity")
                keep-alive
                    router-view.fill
</template>

<script lang="ts">
import Vue from 'vue'
import TopMenu from './TopMenu.vue'

export default Vue.extend({
    components: {
        TopMenu,
    },
    data() {
        return {
            sections: [
                { path: '/main/dashboard', name: 'Dashboard' },
                { path: '/main/contacts', name: 'Contacts' }
            ],
            extraSections: [
                { path: '/main/settings', name: 'Settings' },
            ],
        }
    },
    computed: {
        identity: function () {
            return this.$store.state.activeAccount.identity
        },
        contacts: function () {
            // @ts-ignore
            return this.$store.state.contacts[this.identity.account.getAddress()]
        }
    },
})
</script>

<style lang="scss" scoped>
    .wrapper {
        height: 100vh;
        width: 100vw;
    }

    .main {
        display: grid;
        grid-template-columns: 220px auto;
        grid-template-rows: max-content minmax(0, 1fr);
        grid-gap: 30px 0;
        height: 100%;
        width: 100%;

        .header {
            grid-column: 2;
            grid-row: 1;
            background-color: $grey-light;
        }

        .content {
            grid-column: 2;
            grid-row: 2;
            background-color: $grey-light;
            overflow: hidden;

            .section {
                width: 100%;
                height: 100%;
            }
        }

        .left-menu {
            grid-column: 1;
            grid-row: 1 / 3;
            background-image: linear-gradient($blue, $blue-dark);
            position: relative;

            .left-menu-list {
                margin: 0;
                padding: 0;

                &.extras {
                    position: absolute;
                    bottom: 0;
                    margin-bottom: 18px;
                    width: 100%;
                }
            }

            .link {
                display: block;
                padding-left: 40px;
                line-height: 44px;
                color: $grey-light;
                font-size: 14px;
                letter-spacing: 1px;
                user-select: none; 
                cursor: pointer;

                &.router-link-active {
                    color: $grey-lighter !important;
                    background-color: $blue-dark;
                    border-right: 4px solid;
                    border-color: $green;
                    text-shadow: 0 10px 30px 0 rgba(109, 66, 252, 0.2);
                }

                &:hover {
                    $color: $grey-lighter;
                }
            }

            .logo {
                margin: 30px 80px 30px 40px;
            }

            
        }
    }



    
</style>
