import axios, { AxiosResponse, AxiosError } from 'axios'
import type { HttpRequest, HttpResponse } from '../types'

class HttpService {
  async sendRequest(request: HttpRequest): Promise<HttpResponse> {
    const startTime = Date.now()
    
    try {
      // Prepare URL with query parameters
      const url = this.buildUrl(request.url, request.params)
      
      // Prepare headers
      const headers = this.buildHeaders(request.headers)
      
      // Add authentication headers
      if (request.auth.type !== 'none') {
        this.addAuthHeaders(headers, request.auth)
      }
      
      // Prepare request body
      const { data, contentType } = this.buildRequestBody(request)
      if (contentType) {
        headers['Content-Type'] = contentType
      }
      
      // Make the request
      const response: AxiosResponse = await axios({
        method: request.method.toLowerCase() as any,
        url,
        headers,
        data,
        timeout: 30000,
        validateStatus: () => true // Don't throw on HTTP error codes
      })
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Calculate response size
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data)
      const size = new Blob([responseText]).size
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        responseTime,
        size
      }
      
    } catch (error) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (error instanceof AxiosError) {
        if (error.response) {
          // Server responded with error status
          return {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data,
            responseTime,
            size: 0
          }
        } else if (error.request) {
          // Network error
          throw new Error(`Network Error: ${error.message}`)
        }
      }
      
      throw new Error(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }
  
  private buildUrl(baseUrl: string, params: Array<{key: string, value: string, enabled: boolean}>): string {
    if (!baseUrl) return ''
    
    const enabledParams = params.filter(param => param.enabled && param.key && param.value)
    if (enabledParams.length === 0) return baseUrl
    
    const url = new URL(baseUrl)
    enabledParams.forEach(param => {
      url.searchParams.set(param.key, param.value)
    })
    
    return url.toString()
  }
  
  private buildHeaders(headers: Array<{key: string, value: string, enabled: boolean}>): Record<string, string> {
    const result: Record<string, string> = {}
    
    headers
      .filter(header => header.enabled && header.key && header.value)
      .forEach(header => {
        result[header.key] = header.value
      })
    
    return result
  }
  
  private addAuthHeaders(headers: Record<string, string>, auth: HttpRequest['auth']) {
    switch (auth.type) {
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`)
          headers['Authorization'] = `Basic ${credentials}`
        }
        break
      case 'bearer':
        if (auth.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }
        break
      case 'api-key':
        if (auth.apiKey && auth.apiValue) {
          headers[auth.apiKey] = auth.apiValue
        }
        break
    }
  }
  
  private buildRequestBody(request: HttpRequest): { data: any, contentType?: string } {
    if (request.method === 'GET' || request.method === 'HEAD' || !request.body) {
      return { data: undefined }
    }
    
    switch (request.bodyType) {
      case 'json':
        try {
          return {
            data: JSON.parse(request.body),
            contentType: 'application/json'
          }
        } catch {
          throw new Error('Invalid JSON in request body')
        }
      
      case 'x-www-form-urlencoded':
        return {
          data: request.body,
          contentType: 'application/x-www-form-urlencoded'
        }
      
      case 'raw':
        return {
          data: request.body,
          contentType: 'text/plain'
        }
      
      default:
        return { data: request.body }
    }
  }
}

export const httpService = new HttpService()