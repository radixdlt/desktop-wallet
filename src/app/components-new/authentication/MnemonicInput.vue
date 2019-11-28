<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div
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
                        @input="updateValue()"
                        v-bind:class="{'is-danger': field.state === 'invalid', 'is-success': field.state === 'correct'}",
                    )
</template>

<script lang="ts">
    import Vue from 'vue'
    
    export default Vue.extend({
        name: 'mnemonic-input',
        props: {
            size: { 
                type: Number,
                default: 12, 
            },
            wordlist: {
                type: Array,
                required: true,
            },
            value: String,
        },
        data() {
            return {
                mnemonicFields: [] as {
                    value: string,
                    state: 'neutral' | 'correct' | 'invalid',
                }[],
            }
        },
        methods: {
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
            updateValue() {
                const value = this.mnemonicFields
                    .map(field => field.value.trim().toLocaleLowerCase())
                    .join(' ')
                    .trim()

                // Allows use of v-model
                this.$emit('input', value)
            },
        },
        created() {
            const mnemonicFields = []

            const fieldValues = this.value.split(' ')

            for (let i=0; i<this.size; i++) {
                this.mnemonicFields.push({
                    // TODO: make this update whenever value is changed on the outside
                    value: i < fieldValues.length ? fieldValues[i] : '',
                    state: 'neutral',
                })
            }
        },
    })
</script>

<style lang="scss" scoped>
    .mnemonic-word {
        border-radius: 3px;
        margin: 0 3px 16px 3px;

        .input {
            height: 34px;
            font-size: 12px;
        }
    } 
</style>
