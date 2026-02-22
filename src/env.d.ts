/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Extend Window interface with Electron API
interface ElectronAPI {
  saveFile: (data: any) => Promise<{ success: boolean; path?: string; error?: string }>
  loadFile: () => Promise<{ success: boolean; data?: any; path?: string; error?: string }>
  onNewRequest: (callback: () => void) => () => void
  onSaveRequest: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}