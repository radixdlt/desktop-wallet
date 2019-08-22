import * as events from 'events'
import VirtualSocket from './VirtualSocket'

export interface WssEventData {
    channel: number,
    event: string,
    data: any,
}

export declare interface VirtualSocketServer {
    on(event: 'connection', listener: () => void): this
    on(event: string, listener: Function): this
}

/**
 * Emulates WebSocketServer through IPC
 */
export class VirtualSocketServer extends events.EventEmitter {

    clients: { [id: number]: VirtualSocket } = {}

    constructor(readonly ipcPipe) {
        super()

        ipcPipe.on('wssEventIn', this.onWssEventIn)
        ipcPipe.on('wsEventIn', this.onWsEventIn)
    }

    onWssEventIn = (event, arg: WssEventData) => {
        if (arg.event === 'connection') {
            let vs = new VirtualSocket(arg.channel, this.ipcPipe)

            this.clients[arg.channel] = vs

            this.emit('connection', vs)
        }
    }

    onWsEventIn = (event, arg: WssEventData) => {
        let vs = this.clients[arg.channel]

        if (vs) {
            vs.onWsEventIn(event, arg)
        }
    }

}

export default VirtualSocketServer
