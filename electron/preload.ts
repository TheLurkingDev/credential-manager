import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        createUser: (username: string, password: string): Promise<boolean> => 
            ipcRenderer.invoke('create-user', username, password),
        
        verifyUser: (username: string, password: string): Promise<boolean> => 
            ipcRenderer.invoke('verify-user', username, password)
    }
);
