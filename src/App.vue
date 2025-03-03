<template>
  <n-config-provider>
    <n-message-provider>
      <n-layout has-sider class="app-container">
        <!-- 侧边栏 -->
        <n-layout-sider
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :collapsed="collapsed"
          show-trigger
          @collapse="collapsed = true"
          @expand="collapsed = false"
        >
          <n-menu
            :collapsed="collapsed"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
            :value="activeKey"
            @update:value="handleMenuUpdate"
          />
        </n-layout-sider>

        <!-- 主内容区 -->
        <n-layout>
          <n-layout-header bordered>
            <div class="header-content">
              <div class="header-title">
                量化投资数据监测系统
              </div>
              <div class="header-actions">
                <n-space>
                  <n-button text style="font-size: 24px">
                    <n-icon>
                      <notification-outline />
                    </n-icon>
                  </n-button>
                  <n-button text style="font-size: 24px">
                    <n-icon>
                      <settings-outline />
                    </n-icon>
                  </n-button>
                </n-space>
              </div>
            </div>
          </n-layout-header>

          <n-layout-content class="main-content">
            <div class="content-container">
              <router-view></router-view>
            </div>
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  GridOutline,
  BarChartOutline,
  PulseOutline,
  NotificationsOutline as NotificationOutline,
  SettingsOutline,
  HomeOutline,
  StatsChartOutline,
  AnalyticsOutline
} from '@vicons/ionicons5'
import {
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NSpace,
  NButton,
  NIcon
} from 'naive-ui'
import type { Component } from 'vue'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const collapsed = ref(false)
const activeKey = ref<string | null>('dashboard')

// 渲染图标
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 菜单配置
const menuOptions: MenuOption[] = [
  {
    label: '仪表盘',
    key: 'dashboard',
    icon: renderIcon(HomeOutline)
  },
  {
    label: '股票',
    key: 'stock',
    icon: renderIcon(StatsChartOutline),
    children: [
      {
        label: '股票概览',
        key: 'stock'
      },
      {
        label: '股票分析',
        key: 'stock-analysis'
      }
    ]
  },
  {
    label: '信号监控',
    key: 'signals',
    icon: renderIcon(AnalyticsOutline)
  }
]

// 处理菜单选择
const handleMenuUpdate = (key: string | null) => {
  activeKey.value = key
  if (key) {
    router.push({ name: key })
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
}

.header-content {
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.n-layout-header {
  height: 64px;
  padding: 0;
}

.main-content {
  padding: 24px;
  background-color: #f5f6fa;
  min-height: calc(100vh - 64px);
  width: 100%;
  overflow-x: hidden;
}

.content-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
}
</style>
