"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
let mainWindow = null;
// Disable GPU acceleration
electron_1.app.disableHardwareAcceleration();
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
            sandbox: false
        },
        show: false,
        backgroundColor: '#ffffff'
    });
    // Always load from dev server during development
    mainWindow.loadURL('http://localhost:7173').catch(console.error);
    // Show window when ready to show
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    // Initialize database
    database_1.DatabaseService.getInstance();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}).catch(console.error);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Handle user creation
electron_1.ipcMain.handle('create-user', async (_, username, password) => {
    console.log('Creating user:', username);
    const db = database_1.DatabaseService.getInstance();
    return db.createUser(username, password);
});
// Handle user verification
electron_1.ipcMain.handle('verify-user', async (_, username, password) => {
    console.log('Verifying user:', username);
    const db = database_1.DatabaseService.getInstance();
    return db.verifyUser(username, password);
});
