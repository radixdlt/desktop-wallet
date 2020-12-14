<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.header Change Password
        div.form
            div.field
                label.label.is-small Old Password
                div.control.has-icons-left
                    vue-password.password(
                        classes="input"
                        v-model="oldPassword",
                        disableStrength,
                        autofocus,
                        @keyup.native.enter="changePassword",
                        @input="clearErrors")
                    span.icon.is-small.is-left
                        img.lock(src="@assets/svg/icons/lock.svg")
                p.help.is-danger.validation-error {{oldPasswordError}}

            div.field
                label.label.is-small New Password
                div.control.has-icons-left
                    vue-password.password(
                        classes="input"
                        v-model="newPassword1",
                        disableStrength,
                        autofocus,
                        @keyup.native.enter="changePassword",
                        @input="clearErrors")
                    span.icon.is-small.is-left
                        img.lock(src="@assets/svg/icons/lock.svg")
                p.help.is-danger.validation-error {{newPasswordError}}


            div.field
                label.label.is-small Repeat New Password
                div.control.has-icons-left
                    vue-password.password(
                        classes="input"
                        v-model="newPassword2",
                        disableStrength,
                        autofocus,
                        @keyup.native.enter="changePassword",
                        @input="validationError=''")
                    span.icon.is-small.is-left
                        img.lock(src="@assets/svg/icons/lock.svg")


            div.control
                button.button.is-primary.is-fullwidth(@click="changePassword()")
                    | Change Password
                p.help.is-success {{successMessage}}
                
</template>

<script lang="ts">
import Vue from 'vue'
import { accountManager } from '../../modules/account/AccountManager'

export default Vue.extend({
  data() {
    return {
      oldPassword: '',
      newPassword1: '',
      newPassword2: '',

      oldPasswordError: '',
      newPasswordError: '',
      successMessage: '',
    }
  },
  methods: {
    async changePassword() {
      // Check rules
      if (this.newPassword1.length < 6) {
        this.newPasswordError = 'Password must be at least 6 characters long'
        return
      }

      // Check match
      if (this.newPassword1 !== this.newPassword2) {
        this.newPasswordError = `The passwords don't match`
        return
      }

      // Check existing
      if (!(await accountManager.checkPassword(this.oldPassword))) {
        this.oldPasswordError = 'Password incorrect'
        return
      }

      // Overwrite data store
      accountManager.store(this.newPassword1)
      accountManager.setKeystorePassword(this.newPassword1)

      this.oldPassword = ''
      this.newPassword1 = ''
      this.newPassword2 = ''
      this.successMessage = 'Password changed'
    },
    clearErrors() {
      this.oldPasswordError = ''
      this.newPasswordError = ''
      this.successMessage = ''
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
</style>
