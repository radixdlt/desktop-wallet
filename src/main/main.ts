import {app, BrowserWindow, Menu, ipcMain, shell} from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import windowStateKeeper from 'electron-window-state'

import Config from '../app/shared/Config'

import WebSocket from 'ws'

import semver from 'semver'
 
require('electron-context-menu')({
    prepend: (params, browserWindow) => [{
        label: 'Rainbow',
        // Only show it when right-clicking images
        visible: params.mediaType === 'image'
    }]
})

// Sentry
import * as Sentry from '@sentry/electron'
import { assertExistentialTypeParam } from 'babel-types'
import Axios from 'axios'

Sentry.init({
  dsn: 'https://928631067058499eb64b254461a3ad43@sentry.io/1211444',
  // more options...
})

// App GUI stuff

const isDevMode = process.execPath.match(/[\\/]electron/)

let window: Electron.BrowserWindow | null

const createWindow = async () => {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1170,
        defaultHeight: 800
    })

    window = new BrowserWindow({
        darkTheme: true,
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 1024, // Not ideal, not everything scales properly
        minHeight: 500,
        backgroundColor: '#fff',
    })
    mainWindowState.manage(window)

    window.loadURL(`file://${app.getAppPath()}/build/index.html`)
    if (isDevMode) {
        await installExtension(VUEJS_DEVTOOLS)
        window.webContents.openDevTools({mode: 'bottom'})
    }

    window.on('closed', () => {
        window = null
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    checkForUpdates()
}


app.on('ready', createWindow)

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (window === null) {
        createWindow()
    }
})

app.on('quit', () => {
    // Do nothing
})

// Allow self-signed certificate
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault()
    callback(true) // TODO: actually verify somehow? 
    // if (url === 'https://github.com') {
    //   // Verification logic.
    //   event.preventDefault()
    //   callback(true)
    // } else {
    //   callback(false)
    // }
  })

// Win10 Notification fix - doesn't work
app.setAppUserModelId(process.execPath)

// Update checking
let updateNotificationWindow: Electron.BrowserWindow | null

const checkForUpdates = async () => {
    try {
        let response  = await Axios.get('https://api.github.com/repos/radixdlt/desktop-wallet/releases/latest')
        
        const currentVersion = Config.version
        const publishedVersion = response.data.tag_name

        if (semver.gt(publishedVersion, currentVersion)) {
            // Show update window
            updateNotificationWindow =new BrowserWindow({
                darkTheme: true,
                width: 450,
                height: 200,
                parent: window, 
                // modal: true, 
                show: false
            })
        
            updateNotificationWindow.loadURL(`file://${app.getAppPath()}/build/update.html`)

            updateNotificationWindow.webContents.on('new-window', function(event, url){
                event.preventDefault()
                shell.openExternal(url)
            })

            updateNotificationWindow.once('ready-to-show', () => {
                updateNotificationWindow.show()
            })
        }
    }
    catch (err) {
        console.error(err)
    }    
}

// System menu
const mainMenuTemplate: Electron.MenuItemConstructorOptions[] = []

mainMenuTemplate.push({
    label: 'File',
    submenu: [
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click() { app.quit() }
        },
        {
            label: 'Open devtools',
            click() {
                window.webContents.openDevTools({mode: 'bottom'})
            }
        }
    ]
})

mainMenuTemplate.push({
    label: "Edit",
    submenu: [
        // { role: 'undo' },
        // { role: 'redo' },
        // { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
    ],
})

mainMenuTemplate.push({
    label: 'Help',
    submenu: [
        {
            label: 'Report issue / Suggest feature',
            click() {
                let child = new BrowserWindow({ parent: null, modal: true, show: false })
                child.loadURL('https://radixdlt.typeform.com/to/kPFmVy')
                child.once('ready-to-show', () => {
                    child.show()
                })
            }
        }
    ]
})

// OS X First menu item
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({
        label: 'Radix Wallet',
        submenu: []
    })
}

// Localhost server
const wss = new WebSocket.Server({ 
    host: 'localhost',
    port: 54345,
})

let channel = 0
let sockets = {}
wss.on('connection', (ws) => {
    console.log('new connection')
    let socketChannel = channel
    channel++

    sockets[socketChannel] = ws

    window.webContents.send('wssEventIn', {
        channel: socketChannel,
        event: 'connection',
        data: null
    })

    ws.on('message', (message) => {
        console.log('received: %s', message)

        window.webContents.send('wsEventIn', {
            channel: socketChannel,
            event: 'message',
            data: message
        })
    })

    ws.on('close', (...args) => {
        window.webContents.send('wsEventIn', {
            channel: socketChannel,
            event: 'close',
            data: args
        })
    })
})

ipcMain.on('wsEventOut', (event, data) => {
    console.log('wsEventOut', data)

    let ws = sockets[data.channel]

    if (ws && ws.readyState == 1) {
        if (data.event === 'send') {
            ws.send(data.data)
        } 
        else if (data.event === 'close') {
            ws.close(...data.data)
        } 
    }
})
