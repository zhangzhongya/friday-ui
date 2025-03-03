import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '仪表盘'
    }
  },
  {
    path: '/signals',
    name: 'signals',
    component: () => import('@/views/signals/index.vue'),
    meta: {
      title: '信号监控'
    }
  },
  {
    path: '/stock',
    component: () => import('@/views/stock/layout.vue'),
    children: [
      {
        path: '',
        name: 'stock',
        component: () => import('@/views/stock/index.vue'),
        meta: {
          title: '股票概览'
        }
      },
      {
        path: 'analysis',
        name: 'stock-analysis',
        component: () => import('@/views/stock/analysis.vue'),
        meta: {
          title: '股票分析'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 量化投资监测系统`
  next()
})

export default router
