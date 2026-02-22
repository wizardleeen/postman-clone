<template>
  <div id="app" class="app">
    <div class="app-header">
      <div class="logo">
        <h1>HTTP Client (Web Demo)</h1>
      </div>
      <div class="header-actions">
        <button @click="newRequest" class="btn btn-primary">New Request</button>
        <button @click="saveRequest" class="btn btn-secondary">Save</button>
        <div class="web-notice">
          💻 This is a web demo. Download the desktop app for full functionality.
        </div>
      </div>
    </div>
    <div class="app-body">
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>History</h3>
          <div class="history-list">
            <div 
              v-for="request in requestStore.history" 
              :key="request.id"
              class="history-item"
              @click="loadRequest(request)"
            >
              <span class="method" :class="request.method.toLowerCase()">{{ request.method }}</span>
              <span class="url">{{ request.url || 'New Request' }}</span>
            </div>
          </div>
        </div>
        <div class="sidebar-section">
          <h3>Collections</h3>
          <div class="collections-list">
            <div 
              v-for="collection in requestStore.collections" 
              :key="collection.id"
              class="collection-item"
            >
              <span class="collection-name">{{ collection.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRequestStore } from './stores/request'
import type { HttpRequest } from './types'

const requestStore = useRequestStore()

let removeNewRequestListener: (() => void) | null = null
let removeSaveRequestListener: (() => void) | null = null

onMounted(() => {
  // Only setup Electron listeners if running in Electron
  if (window.electronAPI) {
    removeNewRequestListener = window.electronAPI.onNewRequest(newRequest)
    removeSaveRequestListener = window.electronAPI.onSaveRequest(saveRequest)
  }
})

onUnmounted(() => {
  if (removeNewRequestListener) removeNewRequestListener()
  if (removeSaveRequestListener) removeSaveRequestListener()
})

const newRequest = () => {
  requestStore.newRequest()
}

const saveRequest = async () => {
  if (window.electronAPI && requestStore.currentRequest) {
    const result = await window.electronAPI.saveFile({
      request: requestStore.currentRequest,
      collections: requestStore.collections,
      history: requestStore.history
    })
    if (result.success) {
      console.log('Saved to:', result.path)
    } else {
      console.error('Save failed:', result.error)
    }
  } else {
    // Web version - use localStorage
    const data = {
      request: requestStore.currentRequest,
      collections: requestStore.collections,
      history: requestStore.history
    }
    localStorage.setItem('http-client-data', JSON.stringify(data))
    alert('Data saved to browser local storage!')
  }
}

const loadRequest = (request: HttpRequest) => {
  requestStore.setCurrentRequest(request)
}
</script>

<style>
.web-notice {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 3px;
  max-width: 250px;
  text-align: center;
}
</style>