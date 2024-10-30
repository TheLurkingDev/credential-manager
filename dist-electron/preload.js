"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electron', {
    createUser: (username, password) => electron_1.ipcRenderer.invoke('create-user', username, password),
    verifyUser: (username, password) => electron_1.ipcRenderer.invoke('verify-user', username, password)
});
