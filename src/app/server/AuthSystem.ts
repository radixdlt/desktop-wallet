import Datastore from 'nedb-promises'
import * as crypto from 'crypto'
import { vue } from '../renderer'
import { authDBFileName } from '../modules/atom-store'

interface AppEntry {
    token: string,
    name: string,
    description: string,
    permissions: string[],
    created_at: Date,
    expires: Date,
}


export class AuthSystem {

    private db: Datastore

    initialize() {
        this.db = new Datastore({ filename: authDBFileName, autoload: true })
    }

    async register(appInfo: { name: string; description: string; permissions: string[]; }) {
        // Show popup
        // @ts-ignore
        await vue.$children[0].requestApplicationAccess(appInfo)

        const token = crypto.randomBytes(128).toString('hex')

        const appEntry = {
            _id: token,
            token: token,
            name: appInfo.name,
            description: appInfo.description,
            permissions: appInfo.permissions,

            created_at: new Date(),
            expires: new Date(Date.now() + 30 * 60 * 1000), // 30min
        }

        await this.db.insert(appEntry)

        // console.log('registered new app', appEntry)

        return token
    }

    async authenticate(token: string, perms: Array<string>) {
        // Find in db
        const appInfo = await this.db.findOne<AppEntry>({_id: token})

        if (!appInfo) {
            throw new Error('Invalid token')
        }

        // Check expiration dates
        const timeDiff = Date.now() - appInfo.expires.valueOf()
        if (timeDiff > 0) {
            throw new Error('Token expired')
        }

        // Check if all permissions are allowed
        for (let perm of perms) {
            if (appInfo.permissions.indexOf(perm) < 0) {
                throw new Error(`Permission '${perm}' not granted`)
            }
        }

        // Refresh expiraton
        appInfo.expires = new Date(Date.now() + 30 * 60 * 1000) // 30min
        await this.db.update(appInfo, appInfo)

        return true
    }
}



export let authSystem = new AuthSystem()
