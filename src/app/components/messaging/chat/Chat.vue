<template lang="pug">
// Always have an empty outer div, due to this issue https:// github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.title
            h3.name {{chat.title}} 
                span.icon-container(@click="sendXRD(chat.address)")
                        icon.exchange-icon(name="exchange-alt")
            span.address.selectable {{chat.address}}
        div.messages-container
            div.messages(ref="messages")
                div.message(
                    v-for="message in orderedMessages",
                    v-bind:class="{ mine: message.is_mine }"
                )
                    span 
                        div.selectable {{message.content}}
                        div.selectable.timestamp {{moment(message.timestamp).format('HH:mm')}}
                div.loader(v-if="pow")
                    icon(name="spinner", pulse)
                    span &nbsp;&nbsp;Calculating POW...
            div.input(id="input")
                span.message-size-limit {{message.length}} / {{messageSizeLimit}}
                textarea(
                    v-model="message",
                    @keydown.enter.exact.prevent
                    @keyup.enter.exact="sendMessage(message)"
                    @keydown.enter.shift.exact=""
                    ref="textarea",
                    :maxlength="messageSizeLimit"
                )
                button.send-message(@click="sendMessage(message)") 
                    icon(name="paper-plane")
                    span &nbsp;&nbsp;Send
</template>

<script lang="ts">
    import Vue from 'vue'
    import moment from 'moment'
    import _ from 'lodash'
    
    import {
        RadixAccount,
        RadixTransactionBuilder,
    } from 'radixdlt'

    import { radixApplication } from '../../../modules/RadixApplication'

    export default Vue.extend({
        props: [
            'chat'
        ],
        data() {
            return {
                message: '',
                pow: false,
                moment: moment,
                messageSizeLimit: 256,
            }
        },
        mounted() {
            // @ts-ignore
            this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
        },
        updated() {
            // @ts-ignore
            this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
        },
        methods: {
            async sendMessage(message: string) {
                // message = message.trim()
                if (message && !this.pow) {
                    // this.pow = true

                    let messageCopy = this.message

                    this.message = ''

                    const recipient = RadixAccount.fromAddress(this.chat.address, true)
                    const transactionStatusSubject = RadixTransactionBuilder
                        .createRadixMessageAtom(this.identity.account, recipient, messageCopy)
                        .signAndSubmit(this.identity)

                    transactionStatusSubject.subscribe({
                        next: (status) => {console.log(status)},
                        complete: () => {this.pow = false},
                        error: (error) => {console.error(error)},
                    })
                }
            },
            resizeTextArea() {
                Vue.nextTick().then(() => {
                    // @ts-ignore
                    if (this.$refs.textarea.scrollHeight > 50 && this.$refs.textarea.scrollHeight < 100) {
                        document.getElementById("input").style['grid-template-rows'] = "100px"
                    } else {
                        document.getElementById("input").style['grid-template-rows'] = "50px"
                    }
                })
            },
            sendXRD(address) {
                // @ts-ignore
                this.$router.push({ name: 'Wallet', params: { sidebar: 'send', address: address }})
            },
        },
        computed: {
            identity () {
                return radixApplication.activeIdentity
            },
            orderedMessages () {
                // @ts-ignore
                return _.orderBy(this.chat.messages.values(), 'timestamp')
            }
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        width: 100%;
        height: 100%;
        background-color: #ecf2f5;
    }
    .title {
        padding: 0 0 3px 20px;
        border-bottom: 1px solid  lightgray;

        .name {
            margin: 18px 0 5px 0;


            white-space: nowrap; 
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .address {
            color: #5A666E;
            font-size: 10px;
            font-weight: 300;



            white-space: nowrap; 
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .exchange-icon {
            height: 100%;
            color: #35b0e5;
        }
    }
    .messages-container {
        font-family: GothamLight;
        height: calc(100% - 69px);

        display: grid;
        grid-template-rows: auto auto;
    }
    .messages {
        display: flex;
        flex-direction: column;

        padding: 10px;
        overflow: auto;

        .message {
            width: 100%;
            margin-bottom: 5px;
            white-space: pre-wrap; 
            > span {
                display: inline-block;
                max-width: 70%;
                border-radius: 10px;
                padding: 10px;
                background-color: #d8ebf3;
            }
            &.mine {
                text-align: right;
                > span {
                    display: inline-block;
                    max-width: 70%;
                    border-radius: 10px;
                    background-color: #e5edf1;
                    text-align: left;
                }
            }
            .timestamp {
                font-family: Gotham-Light, sans-serif;
                padding-top: 5px;
                font-size: 0.8rem;
                color: #c3c3c3;
            }
            .selectable {
                word-break: break-word !important;
            }
        }
    }
    .input {
        display: grid;
        grid-template-rows: max-content 50px;
        grid-template-columns: auto 90px;

        align-self: flex-end;
        margin: 5px 10px 10px 10px;
        border-bottom: 1px solid  lightgray;

        .message-size-limit {
            font-size: 10px;
            color: #B1BABF;
        }

        textarea {
            grid-row: 2;
            font-size: 16px;
            // background-color: lighten(#ecf2f5, 2%);
            background-color: #F5FBFE;
            margin: 5px 0 5px 0;

            box-sizing: border-box;
        }
        button {
            grid-row: 2;
            display: inline-flex;
            align-items: center;
            justify-content: center;

            width: 85px;
            height: 40px;
            margin: 5px 0 5px 5px;
        }
    }

    .loader {
        color: lightgray;
        > span {
            align-self: center;
        }
    }


</style>
