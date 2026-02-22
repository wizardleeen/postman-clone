export interface HttpRequest {
  id: string
  method: HttpMethod
  url: string
  headers: KeyValuePair[]
  body: string
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw'
  params: KeyValuePair[]
  auth: AuthConfig
  createdAt: number
  updatedAt: number
}

export interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  responseTime: number
  size: number
}

export interface KeyValuePair {
  key: string
  value: string
  enabled: boolean
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api-key'
  username?: string
  password?: string
  token?: string
  apiKey?: string
  apiValue?: string
}

export interface Collection {
  id: string
  name: string
  requests: HttpRequest[]
  createdAt: number
}

export interface Environment {
  id: string
  name: string
  variables: KeyValuePair[]
  active: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface AppSettings {
  theme: 'light' | 'dark'
  fontSize: number
  requestTimeout: number
  followRedirects: boolean
  validateSSL: boolean
}