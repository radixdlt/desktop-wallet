<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.wrapper.auth
        div.field.logo
            img(src="@assets/svg/logo-dark.svg")
        h1.title.
            Welcome back!
        h1.subtitle.
            Please unlock your wallet
            
        div.form
            div.field
                label.label.is-small Password
                div.control.has-icons-left
                    vue-password.password(
                        classes="input"
                        v-model="password", 
                        disableStrength, 
                        autofocus,
                        disableToggle=true,
                        @keyup.native.enter="login",
                        @input="validationError=''")
                    span.icon.is-small.is-left
                        img.lock(src="@assets/svg/icons/lock.svg")
                        //- icon(name="lock")
                p.help.is-danger.validation-error {{validationError}}
            
        
        div.control
            button.button.is-primary.is-fullwidth(@click="login()")
                | Log in

       
        div.debug
            a(@click="deleteWallet") Delete my wallet
            br
            a(@click="deleteDB") Reset atom database
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'
    
    import { radixApplication } from  '@/app/modules/RadixApplication'
    
    export default Vue.extend({
        data() {
            return {
                password: '',
                validationError: '',
            }
        },     
        methods: {
            login() {
                radixApplication.decryptKeystore(this.password)
                    .catch((error) => {
                        console.error(error)
                        this.validationError = 'Password incorrect'
                    })

                // @ts-ignore
                this.$router.push('wallet')
            },
            deleteWallet() {
                radixApplication.deleteKeystore()
                radixApplication.deleteAtomsDB()

                radixApplication.loadKeystore()
            },
            deleteDB() {
                radixApplication.deleteAtomsDB()
            }
        }
    })
</script>

<style lang="scss" scoped>

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

</style>
