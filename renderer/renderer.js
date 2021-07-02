console.log('renderer process 1');

const BrowserWindow = require('electron').remote.BrowserWindow;
require('electron').remote.BrowserWindow
const path = require('path')
const url = require('url')

const newWindowBtn = document.getElementById('ConnectPageBtn');
newWindowBtn.addEventListener('click', function (event) {
let winmqtt = new BrowserWindow({ 
  width: 600, 
  height: 400, 
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true
  }});
  winmqtt.loadURL(url.format({
    pathname: path.join(__dirname, '../html/connect.html'),
    protocol: 'file:',
    slashes: true
  }));
winmqtt.webContents.openDevTools();
});