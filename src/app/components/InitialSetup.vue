<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.form
            p.main Welcome to Radix
            p.extra 
                a(@click="importWallet") Import an existing wallet
                br
                br
                | Or create a new one below. Enter a password to protect your private key
            div.validation-error {{validationError}}
            vue-password.password(placeholder="Password", 
                v-model="password", 
                disableStrength, 
                autofocus
                @keyup.native.enter="setPassword")
            button(v-on:click="setPassword") Save
</template>

<script lang="ts">
    import Vue from 'vue'
    import { remote } from 'electron'
    
    import { radixApplication } from  '../modules/RadixApplication'
    
    import fs from 'fs-extra'

    export default Vue.extend({
        data() {
            return {
                password: '',
            }
        },
        computed: {
            validationError() {
                if (this.password.length > 0 && this.password.length < 6) {
                    return 'Password must be at least 6 characters long'
                } 
            }
        },        
        methods: {
            setPassword() {
                radixApplication.setFirstTimePassword(this.password)

                // @ts-ignore
                this.$store
                    .dispatch('login')
                    .then(() => {
                        // @ts-ignore
                        this.$router.push('wallet')
                    })
            },
            importWallet() {
                remote.dialog.showOpenDialog({
                    title: 'Import wallet',
                    defaultPath: 'keystore.json'
                }, function (filePaths) {
                    if (filePaths === undefined) {
                        return
                    }

                    const filePath = filePaths[0]
                    fs.copyFile(filePath, radixApplication.keystoreFileName, (error) => {
                        if(error) throw error

                        radixApplication.loadKeystore()
                        radixApplication.deleteAtomsDB()
                    })
                })
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
        grid-template-rows: auto;

        align-items: center;

        .form {
            grid-column: 2;

            p.main {
                font-size: 22px;
                color: #14E1DB;
            }

            p.extra {
                font-size: 17px;
                color: #FFF;

                a {
                    text-decoration: underline;
                    color: #693CF5;
                    &:hover {
                        color: #5433BE;
                    }
                }
            }

            .validation-error {
                height: 20px;
                padding-bottom: 5px;
                font-weight: 300;
                font-size: 12px;
                color: #FF4E59;
            }    
        }
    }

</style>
