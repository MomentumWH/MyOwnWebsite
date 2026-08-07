import api from './api'

export interface ApiProduct {
  id?: number | string
  name?: string
  title?: string
  description?: string
  [key: string]: unknown
}

export interface LoginResponse {
  token?: string
}

export type ProductPayload = Record<string, unknown>

// 示例API调用
export const fetchProducts = () => {
  return api.get<ApiProduct[] | { data?: ApiProduct[] }>('/products')
}

export const fetchProductById = (id: string) => {
  return api.get(`/products/${id}`)
}

export const createProduct = (data: ProductPayload) => {
  return api.post('/products', data)
}

export const updateProduct = (id: string, data: ProductPayload) => {
  return api.put(`/products/${id}`, data)
}

export const deleteProduct = (id: string) => {
  return api.delete(`/products/${id}`)
}

// 认证相关API
export const login = (username: string, password: string) => {
  return api.post<LoginResponse>('/auth/login', { username, password })
}

export const register = (userData: ProductPayload) => {
  return api.post('/auth/register', userData)
}

export const logout = () => {
  return api.post('/auth/logout')
}
