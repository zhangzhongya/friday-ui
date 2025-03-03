
<template>
  <div class="signals">
    <n-grid :cols="24" :x-gap="12" :y-gap="8" responsive="screen">
      <!-- 信号过滤器 -->
      <n-grid-item :span="24">
        <n-card class="shadow-sm">
          <n-grid :cols="24" :x-gap="24" :y-gap="16" responsive="screen">
            <n-grid-item :span="xs" :sm="12" :md="8" :lg="6">
              <n-select
                v-model:value="filter.signalType"
                :options="signalTypeOptions"
                placeholder="信号类型"
                style="width: 100%"
              />
            </n-grid-item>
            <n-grid-item :span="xs" :sm="12" :md="8" :lg="6">
              <n-select
                v-model:value="filter.strength"
                :options="strengthOptions"
                placeholder="信号强度"
                style="width: 100%"
              />
            </n-grid-item>
            <n-grid-item :span="xs" :sm="12" :md="8" :lg="8">
              <n-date-picker
                v-model:value="filter.dateRange"
                type="daterange"
                placeholder="选择日期范围"
                style="width: 100%"
              />
            </n-grid-item>
            <n-grid-item :span="xs" :sm="12" :md="8" :lg="4">
              <n-space justify="end" style="width: 100%">
                <n-button type="primary" @click="applyFilter">
                  应用过滤
                </n-button>
                <n-button @click="resetFilter">
                  重置
                </n-button>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>

      <!-- 信号统计 -->
      <n-grid-item :span="24">
        <n-card title="信号统计" class="shadow-sm">
          <n-grid :cols="24" :x-gap="12" responsive="screen">
            <n-grid-item v-for="(stat, index) in signalStats" :key="index" :span="xs" :sm="12" :md="6">
              <n-statistic :label="stat.label" :value="stat.value">
                <template #prefix>
                  <n-icon :color="stat.color">
                    <ArrowUpOutline v-if="stat.trend === 'up'" />
                    <ArrowDownOutline v-else />
                  </n-icon>
                </template>
              </n-statistic>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>

      <!-- 信号列表 -->
      <n-grid-item :span="24">
        <n-card title="信号列表" class="shadow-sm">
          <div class="table-container">
            <n-data-table
              :columns="columns"
              :data="signals"
              :pagination="pagination"
              :bordered="false"
              @update:page="handlePageChange"
            />
          </div>
        </n-card>
      </n-grid-item>

      <!-- 信号分布图 -->
      <n-grid-item :span="12" :xs="24" :sm="24" :md="12">
        <n-card title="信号类型分布" class="shadow-sm">
          <div ref="signalTypeChart" style="height: 300px; width: 100%"></div>
        </n-card>
      </n-grid-item>

      <!-- 信号趋势图 -->
      <n-grid-item :span="12" :xs="24" :sm="24" :md="12">
        <n-card title="信号趋势" class="shadow-sm">
          <div ref="signalTrendChart" style="height: 300px; width: 100%"></div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { h, ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ArrowUpOutline, ArrowDownOutline } from '@vicons/ionicons5'
import {
  NGrid,
  NGridItem,
  NCard,
  NSpace,
  NSelect,
  NDatePicker,
  NButton,
  NStatistic,
  NIcon,
  NDataTable
} from 'naive-ui'
import type { SelectOption } from 'naive-ui'

// 定义信号数据类型
interface SignalData {
  code: string
  name: string
  signalType: string
  price: string
  strength: string
  time: string
}

// 过滤器状态
interface FilterState {
  signalType: string | null
  strength: string | null
  dateRange: [number, number] | null
}

const filter = ref<FilterState>({
  signalType: null,
  strength: null,
  dateRange: null
})

// 下拉选项
const signalTypeOptions: SelectOption[] = [
  { label: '金叉信号', value: 'golden_cross' },
  { label: '死叉信号', value: 'death_cross' },
  { label: '突破信号', value: 'breakout' },
  { label: '背离信号', value: 'divergence' }
]

const strengthOptions: SelectOption[] = [
  { label: '强', value: 'strong' },
  { label: '中', value: 'medium' },
  { label: '弱', value: 'weak' }
]

// 定义响应式断点
const xs = 24
const sm = 12
const md = 8
const lg = 6

// 信号统计数据
interface StatData {
  label: string
  value: string | number
  trend: 'up' | 'down'
  color: string
}

const signalStats = ref<StatData[]>([
  { label: '今日信号', value: 156, trend: 'up', color: '#18a058' },
  { label: '买入信号', value: 89, trend: 'up', color: '#18a058' },
  { label: '卖出信号', value: 67, trend: 'down', color: '#d03050' },
  { label: '成功率', value: '76.5%', trend: 'up', color: '#18a058' }
])

// 表格列定义
const columns = [
  { title: '股票代码', key: 'code' },
  { title: '股票名称', key: 'name' },
  { title: '信号类型', key: 'signalType' },
  { title: '触发价格', key: 'price' },
  { title: '信号强度', key: 'strength' },
  { title: '触发时间', key: 'time' },
  {
    title: '操作',
    key: 'actions',
    render(row: SignalData) {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => viewDetail(row)
              },
              { default: () => '详情' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: () => addToWatchlist(row)
              },
              { default: () => '关注' }
            )
          ]
        }
      )
    }
  }
]

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

// 信号数据
const signals = ref<SignalData[]>([
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
const signalTypeChart = ref<HTMLElement | null>(null)
const signalTrendChart = ref<HTMLElement | null>(null)
let charts: echarts.ECharts[] = []

// 应用过滤器
const applyFilter = () => {
  // TODO: 根据过滤条件获取数据
  console.log('应用过滤:', filter.value)
}

// 重置过滤器
const resetFilter = () => {
  filter.value = {
    signalType: null,
    strength: null,
    dateRange: null
  }
}

// 查看详情
const viewDetail = (row: SignalData) => {
  console.log('查看详情:', row)
}

// 添加到关注列表
const addToWatchlist = (row: SignalData) => {
  console.log('添加到关注列表:', row)
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page
  // TODO: 获取对应页的数据
}

// 初始化信号类型分布图表
const initSignalTypeChart = () => {
  if (signalTypeChart.value) {
    const chart = echarts.init(signalTypeChart.value)
    charts.push(chart)
    
    chart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '信号类型分布',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 89, name: '金叉信号' },
            { value: 67, name: '死叉信号' },
            { value: 45, name: '突破信号' },
            { value: 23, name: '背离信号' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
}

// 初始化信号趋势图表
const initSignalTrendChart = () => {
  if (signalTrendChart.value) {
    const chart = echarts.init(signalTrendChart.value)
    charts.push(chart)
    
    chart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['买入信号', '卖出信号']
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '买入信号',
          type: 'line',
          data: [23, 35, 28, 42, 89]
        },
        {
          name: '卖出信号',
          type: 'line',
          data: [18, 25, 32, 45, 67]
        }
      ]
    })
  }
}

// 组件挂载时初始化图表
onMounted(() => {
  initSignalTypeChart()
  initSignalTrendChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  charts.forEach(chart => chart?.resize())
}

// 组件卸载时清理
onUnmounted(() => {
  charts.forEach(chart => chart?.dispose())
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.signals {
  width: 100%;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

:deep(.n-card) {
  transition: all 0.3s ease-in-out;
}

:deep(.n-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.n-space) {
  width: 100%;
}

.table-container {
  padding: 16px 24px;
  overflow-x: auto;
}

.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>