<template lang="pug">
    div.wrapper
        div.content
            router-view.fill

        modal(v-if="currentAccessRequest", @close="dismissAccessRequest(currentAccessRequest)")
            div.panel
                div.access-request.body.form
                    p.title An application is requesting access
                    p.name {{currentAccessRequest.appInfo.name}}
                    p.description {{currentAccessRequest.appInfo.description}}
                    p.permissions Permissions: 
                        span.permission(v-for="(permission, index) in currentAccessRequest.appInfo.permissions") 
                            | {{index === currentAccessRequest.appInfo.permissions.length - 1 ? permission : permission + ', ' }}
                    div.field
                        button.button.is-primary.is-fullwidth.approve(@click="dismissAccessRequest(currentAccessRequest, true)") Approve
                    div.field
                        button.button.is-fullwidth.reject(@click="dismissAccessRequest(currentAccessRequest, false)") Reject
</template>

<script lang="ts">
import Vue from 'vue'
import { remote } from 'electron'
import {
  RadixAddress,
  RadixMessageUpdate,
  RadixTransactionUpdate,
  RRI,
} from 'radixdlt'
import {
  radixApplication,
  RadixApplicationStates,
  connectLocalhost,
} from '@app/modules/RadixApplication'
import { radixServer } from '@app/server/RadixServer'
import Modal from '@app/components/shared/Modal.vue'
import Config from '@app/shared/Config'
import fs from 'fs-extra'
import { filter } from 'rxjs/operators'

export default Vue.extend({
  components: {
    Modal,
  },
  subscriptions: {
    walletManagerState: radixApplication.stateSubject,
  },
  data() {
    return {
      connectionStatus: 'STARTING',
      version: Config.version,
      accessRequestQueue: [],
      currentAccessRequest: null,
    }
  },
  created() {
    radixApplication.initialize()
    radixServer.start()

    // @ts-ignore
    this.$store.state.contactsFileName = `${radixApplication.dataDir}/contacts.json`

    this.$observables.walletManagerState
      .pipe(
        filter(
          (state: RadixApplicationStates) =>
            state == RadixApplicationStates.READY
        )
      )
      .subscribe(state => {
        try {
          this.addContact(Config.faucetAddress, 'Faucet')
          this.loadContacts()
        } catch (e) {
          console.error(e)
        }

        // @ts-ignore
        this.$router.push('main')
      })

    // Notifications
    radixApplication.on(
      'atom-received:message',
      (messageUpdate: RadixMessageUpdate) => {
        const message = messageUpdate.message
        const address = message.from

        // Don't notify about old messages
        const timeDifference = Date.now() - message.timestamp
        if (timeDifference > 10000) {
          return
        }

        if (message.is_mine) {
          return
        } // Only incoming messages

        let displayName = address.toString()
        if (address.toString() in this.contacts) {
          displayName = this.contacts[address.toString()].alias
        }

        let messageNotification = new Notification(displayName, {
          body: message.content,
        })

        messageNotification.onclick = () => {
          // @ts-ignore
          this.$router.push({
            path: '/messaging/chatlist/' + message.from.getAddress(),
          })
        }
      }
    )

    radixApplication.on(
      'atom-received:transaction',
      (transactionUpdate: RadixTransactionUpdate) => {
        const transaction = transactionUpdate.transaction
        const address = Object.keys(transaction.participants)[0]

        // Don't notify about old messages
        const timeDifference = Date.now() - transaction.timestamp
        if (timeDifference > 10000) {
          return
        }

        const tokenId = Object.keys(transaction.balance)[0] // Assume single token transactions
        const tokenReference = RRI.fromString(tokenId)
        const timeString = new Date(transaction.timestamp).toLocaleTimeString()
        const balance = transaction.tokenUnitsBalance[tokenId]

        let displayName = address
        if (address in this.contacts) {
          displayName = this.contacts[address].alias
        }

        if (balance.gt(0)) {
          // Only incoming transactions
          let transactionNotification = new Notification(
            `Received ${balance} ${tokenReference.name}`,
            { body: `From ${displayName}` }
          )
          transactionNotification.onclick = () => {
            // @ts-ignore
            this.$router.push({ name: 'main.dashboard' })
          }
        }
      }
    )
  },
  methods: {
    exportWallet() {
      remote.dialog.showSaveDialog(
        {
          title: 'Export wallet',
          defaultPath: 'keystore.json',
        },
        function(filePath) {
          if (filePath === undefined) {
            return
          }
          fs.copyFile(radixApplication.keystoreFileName, filePath, error => {
            if (error) {
              throw error
            }
          })
        }
      )
    },
    addContact(address: string, alias = null) {
      this.$store.commit('addOrUpdateContact', { address, alias })
    },
    async loadContacts() {
      this.$store.dispatch('loadContacts')
    },
    requestApplicationAccess(appInfo) {
      console.log(`${appInfo.name} Requesting access`)

      const accessRequest = {
        appInfo: appInfo,
        promise: null,
        resolve: null,
        reject: null,
      }

      accessRequest.promise = new Promise((resolve, reject) => {
        accessRequest.resolve = resolve
        accessRequest.reject = reject
      })

      if (this.currentAccessRequest) {
        this.accessRequestQueue.push(accessRequest)
      } else {
        this.showAccessRequest(accessRequest)
      }

      return accessRequest.promise
    },
    showAccessRequest(accessRequest) {
      this.currentAccessRequest = accessRequest

      // Bring window to front
      remote.getCurrentWindow().focus()
    },
    dismissAccessRequest(accessRequest, approve: boolean) {
      if (this.accessRequestQueue.length > 0) {
        this.showAccessRequest(this.accessRequestQueue.shift())
      } else {
        this.currentAccessRequest = null
      }

      if (approve) {
        accessRequest.resolve()
      } else {
        accessRequest.reject('Access denied')
      }
    },
  },
  computed: {
    identity: function() {
      this.$store.state.activeAccount
    },
    contacts: function() {
      return this.$store.state.contacts
    },
  },
})
</script>

<style lang="scss" scoped>
// @import "./assets/sass/main.scss";
.wrapper {
  height: 100vh;
  min-height: 500px;
  width: 100vw;

  .content {
    background-color: $grey-light;
    width: 100%;
    height: 100%;
  }
}

.access-request {
  grid-column: 2;
  grid-row: 2;
  background-color: white;

  padding: 30px;

  .title {
  }

  .name {
    font-size: 20px;
  }

  .permissions {
    .permission {
      font-size: 12px;
    }
  }
}
</style>
