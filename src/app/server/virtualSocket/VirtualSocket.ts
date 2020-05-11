import * as events from 'events'
import { WssEventData } from './VirtualSocketServer'

export declare interface VirtualSocket {
    on(event: 'open', listener: () => void): this
    on(event: 'close', listener: () => void): this
    on(event: 'message', listener: () => void): this
    on(event: 'error', listener: () => void): this
    on(event: string, listener: Function): this
}

export class VirtualSocket extends events.EventEmitter {
 
    constructor(readonly channel: number, readonly ipcPipe) {
        super()
    }

    onWsEventIn(event, arg: WssEventData) {
        this.emit(arg.event, arg.data)
    }

    send(data: any) {
        let ipcMessage: WssEventData = {
            channel: this.channel,
            event: 'send',
            data: data,
        }

        this.ipcPipe.send('wsEventOut', ipcMessage)
    }

    close(...args) {
        let ipcMessage: WssEventData = {
            channel: this.channel,
            event: 'send',
            data: args,
        }
        this.ipcPipe.send('wsEventOut', ipcMessage)
    }
}

export default VirtualSocket
