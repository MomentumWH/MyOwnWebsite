import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Home from '../views/Home.vue'
import Blog from '../views/Blog.vue'
import Ecommerce from '../views/Ecommerce.vue'
import DataVisualization from '../views/DataVisualization.vue'
import dragBox from '../views/dragBox.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/login', // 路由路径
    name: 'login',
    component: Login, // 匹配的组件
    meta: { title: '登录' },
  },
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
  {
    path: '/blog', // 路由路径
    name: 'blog',
    component: Blog, // 匹配的组件
    meta: { title: '个人博客' },
  },
  {
    path: '/ecommerce', // 路由路径
    name: 'ecommerce',
    component: Ecommerce, // 匹配的组件
    meta: { title: '电商平台' },
  },
  {
    path: '/data-visualization', // 路由路径
    name: 'data-visualization',
    component: DataVisualization, // 匹配的组件
    meta: { title: '数据可视化' },
  },
  {
    path: '/drag-box', // 路由路径
    name: 'drag-box',
    component: dragBox, // 匹配的组件
    meta: { title: '拖动盒子' },
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
