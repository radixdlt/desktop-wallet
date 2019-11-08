<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div.fill
    div.wrapper.auth
        div.field.logo
            img(src="@assets/svg/logo-dark.svg")
        h1.title.
            Verify your backup
        h1.subtitle.
            Please enter your seed again to make sure it's backep up correctly

        div.mnemonic.columns.is-multiline.is-gapless
            div.column.is-4.field(v-for="(field, index) in mnemonicFields")
                div.mnemonic-word
                    label.label.is-small {{`Word #${index + 1}`}}
                    div.control
                        input.input(
                            type='text', 
                            :placeholder="'#' + (index + 1)", 
                            v-model="field.value",
                            @blur="validateWord(index)",
                            @focus="clearError(index)",
                            v-bind:class="{'is-danger': field.state === 'invalid', 'is-success': field.state === 'correct'}",
                        )
      
        
        div.control
            button.button.is-primary.is-fullwidth(@click="next()")
                | Next


        div.error(v-if="error")
            icon.inline-icon(name="exclamation-circle")
            span.message {{error}}
</template>

<script lang="ts">
    import Vue from 'vue'
    import { radixApplication} from  '@/app/modules/RadixApplication'
    import * as bip39 from 'bip39'
    
    export default Vue.extend({
        data() {
            return {
                mnemonicSize: 12,

                mnemonicFields: [] as {
                    value: string,
                    state: 'neutral' | 'correct' | 'invalid',
                }[],


                error: '',
                wordlist: bip39.wordlists.english

            }
        },
        methods: {
            next() {
                const mnemonic = this.mnemonicFields
                    .map(field => field.value.trim().toLocaleLowerCase())
                    .join(' ')
                
                try {
                    radixApplication.mnemonicVerified(mnemonic)
                } catch {
                    this.error = 'Mnemonic is not correct'
                }
            },
            validateWord(index: number) {
                const field = this.mnemonicFields[index]

                const word = field.value.trim()
                if (word.length < 1) {
                    field.state = 'neutral'
                } else if (this.wordlist.indexOf(word) >= 0) {
                    field.state = 'correct'
                } else {
                    field.state = 'invalid'
                }
            },
            clearError(index: number) {
                this.mnemonicFields[index].state = 'neutral'
            },
        },
        created() {
            const mnemonicFields = []
            for (let i=0; i<this.mnemonicSize; i++) {
                this.mnemonicFields.push({
                    value: '',
                    state: 'neutral',
                })
            }
        }
    })
</script>

<style lang="scss" scoped>

    .wrapper {
        height: 100%;
        width: 100%;
        position: relative;

        padding: 40px 60px;

        .logo {
            img {
                height: 36px;
            }
        }

        .mnemonic-word {
            border-radius: 3px;
            margin: 0 3px 16px 3px;

            .input {
                height: 34px;
                font-size: 12px;
            }
        }

        .error {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 60px;
            width: 100%;

            display: flex;
            justify-content: center;
            align-items: center;

            background-color: $red;
            color: $white;

            .inline-icon {
                margin-right: 10px;
                height: 24px;
            }

            
        }
    }

</style>
