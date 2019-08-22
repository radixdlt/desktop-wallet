<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.title
            // h4 Receive
        p My address:
        span.selectable.address  {{ identity.account.getAddress() }}
        // img(v-bind:src="'data:image/png;base64,'+qrCode")
        div.qr-container
            svg.qr-code(:view-box.camel="`0 0 ${qrCode.size} ${qrCode.size}`") 
                path(:d="qrCode.path")
</template>

<script lang="ts">
    import Vue from 'vue'
    import qr from 'qr-image'
    
    import { radixApplication }  from '../../modules/RadixApplication'

    export default Vue.extend({
        props: [
            'identity'
        ],
        data() {
            return {
                qrCode: {
                    path: '',
                    size: 100,
                }
            }
        },
        created() {
        },
        mounted() {
            this.generateQR()
        },        
        methods: {
            generateQR() {
                this.qrCode = qr.svgObject(this.identity.account.getAddress(), {})
            }
        }
    })
</script>

<style lang="scss" scoped>

    .container {
        height: 100%;
        width: 100%;

        .address {
            color: #5A666E;
            font-size: 15px;
            font-weight: 300;
            line-height: 13px;
        }

        .qr-container {
            margin-top: 20%;
            margin-left: auto;
            margin-right: auto;
            width: 50%;

            .qr-code {
                width: 100%;
            }
        }
    }

</style>
