const { Menu } = require('electron')
const electron = require('electron')
    // Module to control application life.
const app = electron.app
    // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    mainWindow.maximize()

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
    mainWindow.show()
}

// This is required to be set to false beginning in Electron v9 otherwise
// the SerialPort module can not be loaded in Renderer processes like we are doing
// in this example. The linked Github issues says this will be deprecated starting in v10,
// however it appears to still be changed and working in v11.2.0
// Relevant discussion: https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse=false

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
    createWindow()
    const template = [
        {
            label: '设备连接',
            click: function(){
                mainWindow.webContents.send("send-message-to-renderer","设备连接");
            }
        },
        {
            label: '设备模式配置',
            click: function(){
                mainWindow.webContents.send("send-message-to-renderer","设备模式配置");
            }
        },
        {
            label: 'Modbus配置',
            click: function(){
                mainWindow.webContents.send("send-message-to-renderer","Modbus配置");
            }
        },
        {
            label: '通讯配置',
            submenu: [
                {
                    label: '串口配置',
                    click: function(){
                        mainWindow.webContents.send("send-message-to-renderer","串口配置");
                    }
                },
                {
                    label: 'MQTT配置',
                    click: function(){
                        mainWindow.webContents.send("send-message-to-renderer","MQTT配置");
                    }
                },
                {
                    label: 'TCP/UDP配置',
                    click: function(){
                        mainWindow.webContents.send("send-message-to-renderer","TCP配置");
                    }
                },
                {
                    label: 'HTTP配置',
                    click: function(){
                        mainWindow.webContents.send("send-message-to-renderer","HTTP配置");
                    }
                },
                {
                    label: 'Ali配置',
                    click: function(){
                        mainWindow.webContents.send("send-message-to-renderer","Ali配置");
                    }
                }
            ]
        },
        {
            label: 'HELP',
            submenu: [
                {
                    label: 'ABOUT',
                    click: function(){
                        const child = new BrowserWindow({ parent: mainWindow })
                        child.show()
                    }
                },
                {
                    label: 'OPENDEV',
                    click: function(){                    
                        // Open the DevTools.
                        mainWindow.webContents.openDevTools()
                    }
                },
            ]
        },
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})


// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.