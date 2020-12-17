<template lang="pug">
// Always have an empty outer div, due to this issue https://github.com/vuejs/vue-loader/issues/957
div 
  div.container.panel
    div.header Recent transactions
    div.transaction-list.body
      div(v-if="transactions.length < 1") 
          p You don't have any transaction history yet
      template(v-else)
        //div.column-title Timestamp
        div.column-title
        div.column-title Action
        div.column-title Atom ID
        div.column-title Balance
        // div.column-title Fee

        template(v-for="transaction in transactions") 
          //div.timestamp {{ transaction.time }}
          div.icon
            icon.direction-icon.sent(name="regular/arrow-alt-circle-up", v-if="transaction.balance < 0")
            icon.direction-icon.received(name="regular/arrow-alt-circle-down", v-else)       
          div.action
            template(v-if="transaction.displayName")
              div.explanation.
                {{transaction.balance < 0 ? 'Sent to' : 'Received from' }} {{ transaction.token.label }}
              div.selectable.address {{ transaction.displayName }}
              div.message Note: {{ transaction.message }}
            template(v-else)
              div.explanation.
                Token created
          div.atom-id.
            {{ transaction.aid }}
          div.balance
            span.value {{ transaction.balance }} {{ transaction.token.name }}
          //div.balance
          //  span.value {{ transaction.fee }}
            
</template>

<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'
import {
  radixTokenManager,
  RRI,
  RadixIdentity,
  RadixTransaction,
} from 'radixdlt'
import moment from 'moment'
import { accountManager } from '../../modules/account/AccountManager'

export default Vue.extend({
  data() {
    return {
      transactions: [],
    }
  },
  created() {
    accountManager.subscribeToTransferEvents(this.updateTransactionList)
  },
  activated() {
    this.updateTransactionList()
  },
  methods: {
    updateTransactionList() {
      const rawTransactions = this.identity.account.transferSystem.transactions.values()

      this.transactions = _.orderBy(
        rawTransactions,
        ['timestamp'],
        ['desc']
      ).map((transaction: RadixTransaction) => {
        const token_id = Object.keys(transaction.balance)[0] // Assume single token transactions
        const token = this.tokens[token_id]
        const timeString = moment(transaction.timestamp).format(
          'DD/MM/Y \n HH:mm'
        )
        const address = Object.keys(transaction.participants)[0] // Assume single participant transactions
        const message = transaction.message

        let displayName = address
        if (address in this.contacts) {
          displayName = this.contacts[address].alias
        }

        return {
          token: token,
          balance: transaction.tokenUnitsBalance[token_id].toString(),
          address: address,
          displayName: displayName,
          time: timeString,
          aid: transaction.aid,
          message,
          fee: transaction.fee
        }
      })

      this.$forceUpdate()
    },
  },
  computed: {
    tokens(): { [key: string]: RRI } {
      return Object.keys(
        this.identity.account.transferSystem.tokenUnitsBalance
      ).reduce((output, tokenUri) => {
        output[tokenUri] = RRI.fromString(tokenUri)
        return output
      }, {})
    },
    contacts(): any {
      return this.$store.state.contacts
    },
    identity(): RadixIdentity {
      return this.$store.state.activeAccount.identity
    },
  },
  watch: {
    contacts() {
      this.updateTransactionList()
    },
    identity() {
      this.updateTransactionList()
    },
  },
})
</script>

<style lang="scss" scoped>
.container {
  display: grid;
  height: 100%;
}

.transaction-list {
  display: grid;
  grid: auto-flow / repeat(4, 1fr);
  padding: 18px;
  overflow: auto;
  > * {
    display: flex;
    align-items: center;
    border-bottom: 1px solid $grey-light;
    padding: 5px 10px;
  }
}

.column-title {
  font-size: 12px;
  color: $grey;
  font-weight: 500;
  padding-bottom: 15px;
}

.direction-icon {
  width: 31px;
  height: 31px;

  &.sent {
    color: $red;
  }

  &.received {
    color: $green;
  }
}

.action {
  font-size: 10px;
  font-weight: 300;
  color: $grey;
  flex-direction: column;
  align-items: baseline;
  justify-content: space-between;

  .explanation {
    font-size: 13px;
    font-weight: 500;
  }
  .message {
    margin-top: 4px;
  }
}

.balance {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.atom-id {
  font-size: 10px;
  font-weight: 300;
  color: $grey;
}

.timestamp {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 14px;
}

.actions {
  span {
    margin-left: 20px;

    .action {
      color: $grey;

      &:hover {
        color: $grey-dark;
      }
    }
  }
}
</style>
