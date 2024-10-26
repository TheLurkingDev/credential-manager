import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { DatabaseService } from './database';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false
        }
    });

    // Always load from dev server during development
    mainWindow.loadURL('http://localhost:7173');
    
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
});

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
