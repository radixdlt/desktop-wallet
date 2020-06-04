<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.content
            div.left
                div.header Settings
                div.menu
                    router-link.link(v-for="section in sections", :key="section.name" :to="section.path", tag="span") {{section.name}}
            div.panel
                div.body
                    keep-alive
                        router-view.fill
                
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      sections: [
        { path: '/main/settings/changePassword', name: 'Password' },
        { path: '/main/settings/network', name: 'Network' },
      ],
    }
  },
})
</script>

<style lang="scss" scoped>
.container {
  padding: 0 20px 20px 20px;
  height: 100%;

  .content {
    max-width: 680px;
    margin: 0 auto;

    display: grid;
    grid-template-columns: 200px 1fr;

    .left {
      grid-column: 1;

      .header {
        display: inline-block;
        font-size: 22px;
        font-weight: 300;
        line-height: 1.45;
        color: $text;
        margin-bottom: 10px;
      }

      .menu {
        background-color: rgba(219, 221, 224, 0.34);
        border-top-left-radius: $radius;
        border-bottom-left-radius: $radius;
        min-height: 200px;

        .link {
          display: block;
          margin-left: 20px;
          line-height: 44px;
          color: $grey;
          font-size: 14px;
          letter-spacing: 1px;
          user-select: none;
          cursor: pointer;

          &.router-link-active {
            color: $green !important;
            border-right: 4px solid $green;
            text-shadow: 0 10px 30px 0 rgba(109, 66, 252, 0.2);
          }

          &:hover {
            $color: $grey-dark;
          }
        }
      }
    }

    .panel {
      grid-column: 2;

      .body {
        min-height: 300px;
      }
    }
  }
}
</style>
