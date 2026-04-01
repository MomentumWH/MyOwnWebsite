# API调用Demo说明

## 概述
本项目已经配置好axios和拦截器，并在Ecommerce.vue页面中创建了API调用演示。

## 配置文件

### 1. axios配置 (`src/services/api.ts`)
- 基础URL配置
- 请求拦截器：自动添加token
- 响应拦截器：统一错误处理

### 2. API调用函数 (`src/services/apiCalls.ts`)
包含以下API调用函数：
- `fetchProducts()` - 获取商品列表
- `fetchProductById(id)` - 根据ID获取商品
- `createProduct(data)` - 创建商品
- `updateProduct(id, data)` - 更新商品
- `deleteProduct(id)` - 删除商品
- `login(username, password)` - 用户登录
- `register(userData)` - 用户注册
- `logout()` - 用户登出

### 3. 环境变量 (`.env`)
```
VITE_API_BASE_URL=http://localhost:3000
```

## 使用示例

### 在组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchProducts, login } from '@/services/apiCalls'

const products = ref([])

// 获取商品列表
const loadProducts = async () => {
  try {
    const result = await fetchProducts()
    products.value = result
  } catch (error) {
    console.error('获取商品失败:', error)
  }
}

// 用户登录
const handleLogin = async () => {
  try {
    const result = await login('username', 'password')
    if (result.token) {
      localStorage.setItem('token', result.token)
    }
  } catch (error) {
    console.error('登录失败:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>
```

## Demo页面功能

在Ecommerce.vue页面中，你可以看到两个API调用演示：

### 1. 用户登录Demo
- 输入用户名和密码
- 点击登录按钮
- 成功后token会自动保存到localStorage
- 后续请求会自动携带token

### 2. 获取商品列表Demo
- 点击"获取商品列表"按钮
- 显示加载状态
- 成功后显示商品数据
- 失败时显示错误信息

## 拦截器功能

### 请求拦截器
- 自动从localStorage获取token
- 添加到请求头的Authorization字段

### 响应拦截器
- 401错误：清除token并跳转到登录页
- 403错误：显示无权限访问提示
- 404错误：显示资源不存在提示
- 500错误：显示服务器内部错误提示
- 网络错误：显示网络连接错误提示

## 注意事项

1. 确保后端API服务器正在运行
2. 根据实际API地址修改`.env`文件中的`VITE_API_BASE_URL`
3. 登录成功后，token会自动保存，后续请求会自动携带
4. 所有API调用都会经过拦截器处理，统一错误处理
