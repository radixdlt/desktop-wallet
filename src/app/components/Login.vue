<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.form
            p.main Welcome to Radix
            p.extra Enter your password to unlock your wallet
            div.validation-error {{validationError}}
            vue-password.password(placeholder="Password", 
                v-model="password", 
                disableStrength, 
                autofocus,
                @keyup.native.enter="login",
                @input="validationError=''")
            button(v-on:click="login") Go
        div.debug
            a(@click="deleteWallet") Delete my wallet
            br
            a(@click="deleteDB") Reset atom database
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'
    
    import { radixApplication } from  '../modules/RadixApplication'
    
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
                this.$store
                    .dispatch('login')
                    .then(() => {
                        // @ts-ignore
                        this.$router.push('wallet')
                    })
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

    .container {
        height: 100vh;
        width: 100vw;

        display: grid;
        grid-template-columns: 30% auto 30%;
        grid-template-rows: 1fr 1fr 1fr;
        
        .form {
            grid-column: 2;
            grid-row: 2;
            align-self: center;

            p.main {
                font-size: 22px;
                color: #14E1DB;
            }

            p.extra {
                font-size: 17px;
                color: #FFF;
            }

            .validation-error {
                height: 20px;
                padding-bottom: 5px;
                font-weight: 300;
                font-size: 12px;
                color: #FF4E59;
            } 
        }

        .debug {
            grid-column: 1;
            grid-row: 3;
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
