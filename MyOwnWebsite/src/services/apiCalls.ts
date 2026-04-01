import api from './api'

// 示例API调用
export const fetchProducts = () => {
  return api.get('/products')
}

export const fetchProductById = (id: string) => {
  return api.get(`/products/${id}`)
}

export const createProduct = (data: any) => {
  return api.post('/products', data)
}

export const updateProduct = (id: string, data: any) => {
  return api.put(`/products/${id}`, data)
}

export const deleteProduct = (id: string) => {
  return api.delete(`/products/${id}`)
}

// 认证相关API
export const login = (username: string, password: string) => {
  return api.post('/auth/login', { username, password })
}

export const register = (userData: any) => {
  return api.post('/auth/register', userData)
}

export const logout = () => {
  return api.post('/auth/logout')
}
