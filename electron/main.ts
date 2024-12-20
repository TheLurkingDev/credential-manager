import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { DatabaseService } from './database';

let mainWindow: BrowserWindow | null = null;

// Disable GPU acceleration
app.disableHardwareAcceleration();

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
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

app.whenReady().then(() => {
    // Initialize database
    DatabaseService.getInstance();
    
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}).catch(console.error);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle user creation
ipcMain.handle('create-user', async (_, username: string, password: string) => {
    console.log('Creating user:', username);
    const db = DatabaseService.getInstance();
    return db.createUser(username, password);
});

// Handle user verification
ipcMain.handle('verify-user', async (_, username: string, password: string) => {
    console.log('Verifying user:', username);
    const db = DatabaseService.getInstance();
    return db.verifyUser(username, password);
});
