<template>
  <div class="http-client">
    <!-- Request Section -->
    <div class="request-section">
      <!-- URL Bar -->
      <div class="url-bar">
        <select 
          v-model="requestStore.currentRequest!.method" 
          class="method-select"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
        <input
          v-model="requestStore.currentRequest!.url"
          type="text"
          placeholder="Enter request URL..."
          class="url-input"
          @keyup.enter="sendRequest"
        />
        <button 
          @click="sendRequest" 
          :disabled="requestStore.loading || !requestStore.currentRequest?.url"
          class="send-btn"
        >
          {{ requestStore.loading ? 'Sending...' : 'Send' }}
        </button>
      </div>

      <!-- Request Tabs -->
      <div class="tabs">
        <button 
          v-for="tab in requestTabs" 
          :key="tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Params Tab -->
        <div v-if="activeTab === 'params'">
          <h4>Query Parameters</h4>
          <div class="key-value-section">
            <div 
              v-for="(param, index) in requestStore.currentRequest!.params" 
              :key="index"
              class="key-value-pair"
            >
              <input 
                v-model="param.key" 
                placeholder="Key" 
                class="form-control"
              />
              <input 
                v-model="param.value" 
                placeholder="Value" 
                class="form-control"
              />
              <label class="checkbox-label">
                <input v-model="param.enabled" type="checkbox" />
                Enabled
              </label>
              <button @click="requestStore.removeParam(index)" class="remove-btn">Remove</button>
            </div>
            <button @click="requestStore.addParam()" class="add-pair">Add Parameter</button>
          </div>
        </div>

        <!-- Headers Tab -->
        <div v-if="activeTab === 'headers'">
          <h4>Headers</h4>
          <div class="key-value-section">
            <div 
              v-for="(header, index) in requestStore.currentRequest!.headers" 
              :key="index"
              class="key-value-pair"
            >
              <input 
                v-model="header.key" 
                placeholder="Header Name" 
                class="form-control"
              />
              <input 
                v-model="header.value" 
                placeholder="Header Value" 
                class="form-control"
              />
              <label class="checkbox-label">
                <input v-model="header.enabled" type="checkbox" />
                Enabled
              </label>
              <button @click="requestStore.removeHeader(index)" class="remove-btn">Remove</button>
            </div>
            <button @click="requestStore.addHeader()" class="add-pair">Add Header</button>
          </div>
        </div>

        <!-- Body Tab -->
        <div v-if="activeTab === 'body'">
          <h4>Request Body</h4>
          <div class="body-type-selector">
            <label>
              <input 
                v-model="requestStore.currentRequest!.bodyType" 
                value="none" 
                type="radio"
              /> None
            </label>
            <label>
              <input 
                v-model="requestStore.currentRequest!.bodyType" 
                value="json" 
                type="radio"
              /> JSON
            </label>
            <label>
              <input 
                v-model="requestStore.currentRequest!.bodyType" 
                value="x-www-form-urlencoded" 
                type="radio"
              /> Form URL Encoded
            </label>
            <label>
              <input 
                v-model="requestStore.currentRequest!.bodyType" 
                value="raw" 
                type="radio"
              /> Raw Text
            </label>
          </div>
          <div v-if="requestStore.currentRequest!.bodyType !== 'none'" class="body-editor">
            <textarea
              v-model="requestStore.currentRequest!.body"
              :placeholder="getBodyPlaceholder()"
              class="form-control body-textarea"
              rows="10"
            ></textarea>
          </div>
        </div>

        <!-- Auth Tab -->
        <div v-if="activeTab === 'auth'">
          <h4>Authorization</h4>
          <div class="auth-section">
            <div class="form-group">
              <label>Type</label>
              <select v-model="requestStore.currentRequest!.auth.type" class="form-control">
                <option value="none">No Auth</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="api-key">API Key</option>
              </select>
            </div>
            
            <!-- Basic Auth -->
            <div v-if="requestStore.currentRequest!.auth.type === 'basic'">
              <div class="form-group">
                <label>Username</label>
                <input v-model="requestStore.currentRequest!.auth.username" class="form-control" />
              </div>
              <div class="form-group">
                <label>Password</label>
                <input v-model="requestStore.currentRequest!.auth.password" type="password" class="form-control" />
              </div>
            </div>
            
            <!-- Bearer Token -->
            <div v-if="requestStore.currentRequest!.auth.type === 'bearer'">
              <div class="form-group">
                <label>Token</label>
                <input v-model="requestStore.currentRequest!.auth.token" class="form-control" />
              </div>
            </div>
            
            <!-- API Key -->
            <div v-if="requestStore.currentRequest!.auth.type === 'api-key'">
              <div class="form-group">
                <label>Key</label>
                <input v-model="requestStore.currentRequest!.auth.apiKey" placeholder="e.g. X-API-Key" class="form-control" />
              </div>
              <div class="form-group">
                <label>Value</label>
                <input v-model="requestStore.currentRequest!.auth.apiValue" class="form-control" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Response Section -->
    <div class="response-section">
      <div class="response-header">
        <h3>Response</h3>
        <div v-if="requestStore.currentResponse" class="response-meta">
          <span :class="['response-status', `status-${Math.floor(requestStore.currentResponse.status / 100)}xx`]">
            {{ requestStore.currentResponse.status }} {{ requestStore.currentResponse.statusText }}
          </span>
          <span class="response-time">{{ requestStore.currentResponse.responseTime }}ms</span>
          <span class="response-size">{{ formatSize(requestStore.currentResponse.size) }}</span>
        </div>
      </div>
      
      <div class="response-body">
        <div v-if="requestStore.loading" class="loading">
          <div class="loading-spinner"></div>
          Sending request...
        </div>
        
        <div v-else-if="requestStore.error" class="error">
          <h4>Error</h4>
          <p>{{ requestStore.error }}</p>
        </div>
        
        <div v-else-if="requestStore.currentResponse">
          <div class="response-tabs">
            <button 
              v-for="tab in responseTabs" 
              :key="tab.id"
              :class="['tab', { active: activeResponseTab === tab.id }]"
              @click="activeResponseTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <div class="response-content">
            <!-- Response Body -->
            <div v-if="activeResponseTab === 'body'" class="response-body-content">
              <pre class="code-editor">{{ formatResponseBody(requestStore.currentResponse.data) }}</pre>
            </div>
            
            <!-- Response Headers -->
            <div v-if="activeResponseTab === 'headers'" class="response-headers">
              <div 
                v-for="[key, value] in Object.entries(requestStore.currentResponse.headers)" 
                :key="key"
                class="header-item"
              >
                <strong>{{ key }}:</strong> {{ value }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-response">
          <p>No response yet. Send a request to see the response here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRequestStore } from '../stores/request'

const requestStore = useRequestStore()

const activeTab = ref('params')
const activeResponseTab = ref('body')

const requestTabs = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'auth', label: 'Auth' }
]

const responseTabs = [
  { id: 'body', label: 'Body' },
  { id: 'headers', label: 'Headers' }
]

const sendRequest = async () => {
  await requestStore.sendRequest()
}

const getBodyPlaceholder = () => {
  switch (requestStore.currentRequest?.bodyType) {
    case 'json':
      return '{\n  "key": "value"\n}'
    case 'x-www-form-urlencoded':
      return 'key1=value1&key2=value2'
    case 'raw':
      return 'Raw text content...'
    default:
      return ''
  }
}

const formatResponseBody = (data: any): string => {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.http-client {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.request-section {
  flex: 1;
  overflow-y: auto;
  border-bottom: 1px solid #e1e1e1;
}

.url-bar {
  display: flex;
  padding: 20px;
  gap: 10px;
  background: #fff;
  border-bottom: 1px solid #e1e1e1;
}

.method-select {
  min-width: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.url-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.send-btn {
  padding: 10px 20px;
  background: #ff6c37;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  min-width: 80px;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.key-value-section {
  margin-top: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  min-width: 80px;
}

.remove-btn {
  padding: 8px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.body-type-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
}

.body-type-selector label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.body-textarea {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.auth-section {
  max-width: 400px;
}

.response-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.response-header {
  padding: 15px 20px;
  background: #f8f8f8;
  border-bottom: 1px solid #e1e1e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.response-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
}

.response-status {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 3px;
}

.status-2xx { background: #4caf50; color: white; }
.status-3xx { background: #ff9800; color: white; }
.status-4xx, .status-5xx { background: #f44336; color: white; }

.response-time, .response-size {
  color: #666;
}

.response-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.response-tabs {
  display: flex;
  border-bottom: 1px solid #e1e1e1;
  background: #f8f8f8;
}

.response-content {
  flex: 1;
  overflow-y: auto;
}

.response-body-content {
  padding: 0;
}

.response-headers {
  padding: 20px;
}

.header-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-family: monospace;
  font-size: 13px;
}

.code-editor {
  margin: 0;
  padding: 20px;
  background: #f9f9f9;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6c37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 20px;
  color: #f44336;
}

.no-response {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}
</style>