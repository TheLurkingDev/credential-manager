import { contextBridge } from 'electron';

// Expose any APIs to the renderer process here
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any API methods here
});
