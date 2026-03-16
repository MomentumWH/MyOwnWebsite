import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/', // 路由路径
    name: 'home',
    component: Home, // 匹配的组件
    meta: { title: '首页' },
  },
  {
    path: '/about', // 路由路径
    name: 'about',
    component: About, // 匹配的组件
    props: true, // 将路由参数传递给组件
    meta: { requiresAuth: true, title: '关于' },
  },
  // {
  // name: 'user', // 路由名称（用于编程式导航）
  // alias: '/profile', // 路由别名
  // redirect: '/login', // 重定向
  // meta: { requiresAuth: true }, // 元数据（用于路由守卫）
  // props: true, // 将路由参数作为组件 props 传递
  // caseSensitive: false, // 路径是否区分大小写
  // pathMatch: 'full' // 路径匹配策略
  // }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
