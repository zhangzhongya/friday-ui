<template>
    <div class="dashboard">
      <n-grid :cols="24" :x-gap="12" :y-gap="8">
        <!-- 市场概览卡片 -->
        <n-grid-item :span="24">
          <n-card title="市场概览" class="shadow-sm">
            <n-grid :cols="4" :x-gap="12">
              <n-grid-item v-for="(stat, index) in marketStats" :key="index">
                <n-statistic :label="stat.label" :value="stat.value">
                  <template #prefix>
                    <n-icon :color="stat.trend === 'up' ? '#18a058' : '#d03050'">
                      <ArrowUpOutline v-if="stat.trend === 'up'" />
                      <ArrowDownOutline v-else />
                    </n-icon>
                  </template>
                </n-statistic>
              </n-grid-item>
            </n-grid>
          </n-card>
        </n-grid-item>
  
        <!-- 大盘走势图 -->
        <n-grid-item :span="16">
          <n-card title="大盘走势" class="shadow-sm">
            <div ref="marketTrendChart" style="height: 400px"></div>
          </n-card>
        </n-grid-item>
  
        <!-- 热点板块 -->
        <n-grid-item :span="8">
          <n-card title="热点板块" class="shadow-sm">
            <n-list>
              <n-list-item v-for="(sector, index) in hotSectors" :key="index">
                <n-space align="center" :size="12">
                  <span>{{ sector.name }}</span>
                  <n-progress
                    type="line"
                    :percentage="sector.changePercentage"
                    :color="sector.changePercentage >= 0 ? '#18a058' : '#d03050'"
                    :show-indicator="false"
                  />
                  <span :style="{ color: sector.changePercentage >= 0 ? '#18a058' : '#d03050' }">
                    {{ sector.changePercentage }}%
                  </span>
                </n-space>
              </n-list-item>
            </n-list>
          </n-card>
        </n-grid-item>
  
        <!-- 量化信号列表 -->
        <n-grid-item :span="24">
          <n-card title="最新量化信号" class="shadow-sm">
            <n-data-table :columns="signalColumns" :data="signalData" :bordered="false" />
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useMessage } from 'naive-ui'
  import * as echarts from 'echarts'
  import { ArrowUpOutline, ArrowDownOutline } from '@vicons/ionicons5'
  import {
    NGrid,
    NGridItem,
    NCard,
    NSpace,
    NStatistic,
    NIcon,
    NDataTable,
    NButton,
    NList,
    NListItem,
    NProgress
  } from 'naive-ui'
  
  // 市场统计数据
  const marketStats = ref([
    { label: '上证指数', value: '3,123.25', trend: 'up' },
    { label: '深证成指', value: '9,877.65', trend: 'down' },
    { label: '创业板指', value: '2,543.12', trend: 'up' },
    { label: '北证指数', value: '1,234.56', trend: 'down' }
  ])
  
  // 热点板块数据
  const hotSectors = ref([
    { name: '新能源', changePercentage: 3.25 },
    { name: '半导体', changePercentage: 2.87 },
    { name: '医药生物', changePercentage: -1.23 },
    { name: '人工智能', changePercentage: 4.56 },
    { name: '金融科技', changePercentage: -0.89 }
  ])
  
  // 量化信号表格列定义
  const signalColumns = [
    { title: '股票代码', key: 'code' },
    { title: '股票名称', key: 'name' },
    { title: '信号类型', key: 'signalType' },
    { title: '触发价格', key: 'price' },
    { title: '信号强度', key: 'strength' },
    { title: '触发时间', key: 'time' }
  ]
  
  // 量化信号数据
  const signalData = ref([
    {
      code: '600000',
      name: '浦发银行',
      signalType: '金叉信号',
      price: '10.25',
      strength: '强',
      time: '2025-03-03 09:30:00'
    },
    // 更多数据...
  ])
  
  // 图表相关
  const marketTrendChart = ref<HTMLElement | null>(null)
  let chart: echarts.ECharts | null = null
  
  // 初始化图表
  const initChart = () => {
    if (marketTrendChart.value) {
      chart = echarts.init(marketTrendChart.value)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['上证指数', '成交量']
        },
        xAxis: {
          type: 'category',
          data: ['9:30', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00', '14:30', '15:00']
        },
        yAxis: [
          {
            type: 'value',
            name: '指数'
          },
          {
            type: 'value',
            name: '成交量',
            axisLabel: {
              formatter: '{value} 万手'
            }
          }
        ],
        series: [
          {
            name: '上证指数',
            type: 'line',
            data: [3100, 3120, 3115, 3118, 3125, 3122, 3128, 3130, 3123]
          },
          {
            name: '成交量',
            type: 'bar',
            yAxisIndex: 1,
            data: [2341, 2345, 2314, 2367, 2378, 2321, 2312, 2345, 2356]
          }
        ]
      }
      chart.setOption(option)
    }
  }
  
  // 组件挂载时初始化图表
  onMounted(() => {
    initChart()
    // 监听窗口大小变化，调整图表大小
    window.addEventListener('resize', () => {
      chart?.resize()
    })
  })
  
  // 清理函数
  onUnmounted(() => {
    chart?.dispose()
    window.removeEventListener('resize', () => {
      chart?.resize()
    })
  })
  </script>
  
  <style scoped>
  .dashboard {
    padding: 16px;
  }
  .shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  </style>