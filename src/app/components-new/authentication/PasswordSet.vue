<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.wrapper.auth
        div.field.logo
            img(src="@assets/svg/logo-dark.svg")
        h1.title.
            Set Your Password
        h1.subtitle.
            To store your wallet securely, you need to set a password

        div.field
            div.control.has-icons-left
                vue-password.password(placeholder="Password", 
                    classes="input"
                    v-model="password", 
                    disableStrength, 
                    autofocus,
                    disableToggle=true,
                    @keyup.native.enter="setPassword",
                    @input="validationError=''")
                span.icon.is-small.is-left
                    img.lock(src="@assets/svg/icons/lock.svg")
                    //- icon(name="lock")
            //- p.help.is-danger.validation-error {{validationError}}

        div.field
            div.control.has-icons-left
                vue-password.password(placeholder="Repeat Password", 
                    classes="input"
                    v-model="password2", 
                    disableStrength, 
                    autofocus,
                    disableToggle=true,
                    @keyup.native.enter="setPassword",
                    @input="validationError=''")
                span.icon.is-small.is-left
                    img.lock(src="@assets/svg/icons/lock.svg")

            p.help.is-danger.validation-error {{validationError}}
        
        div.control
            button.button.is-primary.is-fullwidth(@click="setPassword()")
                | Finish

    
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'
    
    import { radixApplication } from  '@/app/modules/RadixApplication'
    
    export default Vue.extend({
        data() {
            return {
                password: '',
                password2: '',
                validationError: '',
            }
        },     
        methods: {
             async setPassword() {
                // Validate any rules
                // TODO: probably want higher requirmenets
                if (this.password.length < 6) {
                    this.validationError = 'Password must be at least 6 characters long'
                    return
                }

                if (this.password !== this.password2) {
                    this.validationError = `Passwords don't match`
                    return
                }

                await radixApplication.setPassword(this.password)

                // @ts-ignore
                this.$router.push('wallet')
            },
        }
    })
</script>

<style lang="scss" scoped>

    .wrapper {
        height: 100%;
        width: 100%;
        
        padding: 40px 60px;

        .logo {
            img {
                height: 36px;
            }
        }

        .lock {
            width: 14px;
            height: 16px;
            object-fit: contain;
            margin: auto;
        }

        .debug {
            padding: 10px;
            align-self: end;

            color: #D7EFFA;
            font-size: 10px;
            
            line-height: 20px;

            a:hover {
                text-decoration: underline;
                cursor: pointer;
            }
        }
    }

</style>
