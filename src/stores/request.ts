import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HttpRequest, HttpResponse, Collection, Environment, KeyValuePair } from '../types'
import { httpService } from '../services/http'

export const useRequestStore = defineStore('request', () => {
  // State
  const currentRequest = ref<HttpRequest | null>(null)
  const currentResponse = ref<HttpResponse | null>(null)
  const history = ref<HttpRequest[]>([])
  const collections = ref<Collection[]>([])
  const environments = ref<Environment[]>([])
  const activeEnvironment = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentEnvironment = computed(() => 
    environments.value.find(env => env.id === activeEnvironment.value)
  )

  // Actions
  const createNewRequest = (): HttpRequest => {
    const now = Date.now()
    return {
      id: `req_${now}`,
      method: 'GET',
      url: '',
      headers: [],
      body: '',
      bodyType: 'none',
      params: [],
      auth: { type: 'none' },
      createdAt: now,
      updatedAt: now
    }
  }

  const newRequest = () => {
    currentRequest.value = createNewRequest()
    currentResponse.value = null
    error.value = null
  }

  const setCurrentRequest = (request: HttpRequest) => {
    currentRequest.value = { ...request }
    error.value = null
  }

  const updateRequest = (updates: Partial<HttpRequest>) => {
    if (currentRequest.value) {
      currentRequest.value = {
        ...currentRequest.value,
        ...updates,
        updatedAt: Date.now()
      }
    }
  }

  const addHeader = () => {
    if (currentRequest.value) {
      currentRequest.value.headers.push({
        key: '',
        value: '',
        enabled: true
      })
    }
  }

  const removeHeader = (index: number) => {
    if (currentRequest.value) {
      currentRequest.value.headers.splice(index, 1)
    }
  }

  const addParam = () => {
    if (currentRequest.value) {
      currentRequest.value.params.push({
        key: '',
        value: '',
        enabled: true
      })
    }
  }

  const removeParam = (index: number) => {
    if (currentRequest.value) {
      currentRequest.value.params.splice(index, 1)
    }
  }

  const sendRequest = async () => {
    if (!currentRequest.value) return

    loading.value = true
    error.value = null

    try {
      const response = await httpService.sendRequest(currentRequest.value)
      currentResponse.value = response
      
      // Add to history
      const historyRequest = { ...currentRequest.value }
      const existingIndex = history.value.findIndex(req => req.id === historyRequest.id)
      if (existingIndex >= 0) {
        history.value.splice(existingIndex, 1)
      }
      history.value.unshift(historyRequest)
      
      // Keep only last 50 requests in history
      if (history.value.length > 50) {
        history.value = history.value.slice(0, 50)
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Request failed'
      currentResponse.value = null
    } finally {
      loading.value = false
    }
  }

  const createCollection = (name: string) => {
    const collection: Collection = {
      id: `col_${Date.now()}`,
      name,
      requests: [],
      createdAt: Date.now()
    }
    collections.value.push(collection)
    return collection
  }

  const addToCollection = (collectionId: string, request: HttpRequest) => {
    const collection = collections.value.find(col => col.id === collectionId)
    if (collection) {
      collection.requests.push({ ...request })
    }
  }

  const createEnvironment = (name: string) => {
    const environment: Environment = {
      id: `env_${Date.now()}`,
      name,
      variables: [],
      active: false
    }
    environments.value.push(environment)
    return environment
  }

  const setActiveEnvironment = (environmentId: string | null) => {
    environments.value.forEach(env => {
      env.active = env.id === environmentId
    })
    activeEnvironment.value = environmentId
  }

  const replaceVariables = (text: string): string => {
    if (!currentEnvironment.value) return text
    
    let result = text
    currentEnvironment.value.variables.forEach(variable => {
      if (variable.enabled && variable.key && variable.value) {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g')
        result = result.replace(regex, variable.value)
      }
    })
    return result
  }

  // Initialize with a default request
  if (!currentRequest.value) {
    newRequest()
  }

  return {
    // State
    currentRequest,
    currentResponse,
    history,
    collections,
    environments,
    activeEnvironment,
    loading,
    error,
    
    // Computed
    currentEnvironment,
    
    // Actions
    newRequest,
    setCurrentRequest,
    updateRequest,
    addHeader,
    removeHeader,
    addParam,
    removeParam,
    sendRequest,
    createCollection,
    addToCollection,
    createEnvironment,
    setActiveEnvironment,
    replaceVariables
  }
})