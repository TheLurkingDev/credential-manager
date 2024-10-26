import { app, BrowserWindow, dialog } from 'electron'
import * as path from 'path'
import { DatabaseService } from './database'

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false
  });

  if (!app.isPackaged) {
    // Development mode - load from Vite dev server
    console.log('Loading development server URL...');
    try {
      // Wait for a moment before loading URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        mainWindow?.webContents.openDevTools();
      });

      mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
      });

      await mainWindow.loadURL('http://127.0.0.1:7173');
      console.log('Window loaded successfully');
    } catch (error) {
      console.error('Failed to load dev server:', error);
      dialog.showErrorBox(
        'Development Server Error',
        'Failed to connect to development server. Please ensure Vite is running.'
      );
      app.quit();
    }
  } else {
    // Production mode - load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.show();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// Initialize database when app is ready
app.whenReady().then(async () => {
  try {
    // Initialize database
    console.log('Initializing database...');
    const dbService = DatabaseService.getInstance();
    
    // Test database connection
    if (!dbService.testConnection()) {
      throw new Error('Database connection test failed');
    }
    
    console.log('Database initialized and tested successfully');
    
    await createWindow();

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to initialize the application: ${error instanceof Error ? error.message : String(error)}`
    );
    app.quit();
  }
});

// Cleanup database connection before quit
app.on('before-quit', () => {
  try {
    DatabaseService.getInstance().close();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
