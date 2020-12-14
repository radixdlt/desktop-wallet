<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
    div.container
        div.field
            label.label.is-small My address
            span.selectable.address  {{ identity.account.getAddress() }}
        div.qr-container
            svg.qr-code(:view-box.camel="`0 0 ${qrCode.size} ${qrCode.size}`") 
                path(:d="qrCode.path")
</template>

<script lang="ts">
import Vue from 'vue'
import qr from 'qr-image'
import { RadixIdentity } from 'radixdlt'

export default Vue.extend({
    data() {
        return {
            qrCode: {
                path: '',
                size: 100,
            }
        }
    },
    computed: {
        identity(): RadixIdentity {
            return this.$store.state.activeAccount.identity
        },
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
            color: $grey;
            font-size: 17px;
            font-weight: 300;
            line-height: 13px;
        }

        .qr-container {
            margin: 30px auto;
            width: 200px;

            .qr-code {
                width: 100%;
            }
        }
    }

</style>
