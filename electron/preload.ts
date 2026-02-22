import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data: any) => ipcRenderer.invoke('save-file', data),
  loadFile: () => ipcRenderer.invoke('load-file'),
  
  // Menu event listeners
  onNewRequest: (callback: () => void) => {
    ipcRenderer.on('new-request', callback)
    return () => ipcRenderer.removeListener('new-request', callback)
  },
  onSaveRequest: (callback: () => void) => {
    ipcRenderer.on('save-request', callback)
    return () => ipcRenderer.removeListener('save-request', callback)
  }
})

// Type definitions for the exposed API
export interface ElectronAPI {
  saveFile: (data: any) => Promise<{ success: boolean; path?: string; error?: string }>
  loadFile: () => Promise<{ success: boolean; data?: any; path?: string; error?: string }>
  onNewRequest: (callback: () => void) => () => void
  onSaveRequest: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}