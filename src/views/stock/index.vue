
<template>
  <div class="stock-analysis">
    <n-grid :cols="24" :x-gap="12" :y-gap="8">
      <!-- 股票搜索 -->
      <n-grid-item :span="24">
        <n-card class="shadow-sm">
          <n-space vertical>
            <n-input-group>
              <n-input v-model:value="searchCode" placeholder="请输入股票代码" />
              <n-button type="primary" @click="searchStock">
                搜索
              </n-button>
            </n-input-group>
          </n-space>
        </n-card>
      </n-grid-item>

      <!-- 股票信息 -->
      <n-grid-item :span="8">
        <n-card title="股票信息" class="shadow-sm">
          <n-descriptions bordered>
            <n-descriptions-item label="股票名称">
              {{ stockInfo.name }}
            </n-descriptions-item>
            <n-descriptions-item label="最新价">
              {{ stockInfo.price }}
            </n-descriptions-item>
            <n-descriptions-item label="涨跌幅">
              <n-text :type="stockInfo.change >= 0 ? 'success' : 'error'">
                {{ stockInfo.change }}%
              </n-text>
            </n-descriptions-item>
            <n-descriptions-item label="成交量">
              {{ stockInfo.volume }}
            </n-descriptions-item>
            <n-descriptions-item label="市值">
              {{ stockInfo.marketValue }}
            </n-descriptions-item>
            <n-descriptions-item label="市盈率">
              {{ stockInfo.pe }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>
      </n-grid-item>

      <!-- K线图 -->
      <n-grid-item :span="16">
        <n-card title="K线走势" class="shadow-sm">
          <div ref="klineChart" style="height: 400px"></div>
        </n-card>
      </n-grid-item>

      <!-- 技术指标 -->
      <n-grid-item :span="24">
        <n-card title="技术指标" class="shadow-sm">
          <n-tabs type="line">
            <n-tab-pane name="MACD" tab="MACD">
              <div ref="macdChart" style="height: 300px"></div>
            </n-tab-pane>
            <n-tab-pane name="KDJ" tab="KDJ">
              <div ref="kdjChart" style="height: 300px"></div>
            </n-tab-pane>
            <n-tab-pane name="RSI" tab="RSI">
              <div ref="rsiChart" style="height: 300px"></div>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-grid-item>

      <!-- 量化分析 -->
      <n-grid-item :span="24">
        <n-card title="量化分析" class="shadow-sm">
          <n-space vertical>
            <n-alert v-if="analysis.signal" :type="analysis.signal.type" :title="analysis.signal.title">
              {{ analysis.signal.message }}
            </n-alert>
            <n-descriptions bordered>
              <n-descriptions-item label="MACD信号">
                {{ analysis.macd }}
              </n-descriptions-item>
              <n-descriptions-item label="KDJ信号">
                {{ analysis.kdj }}
              </n-descriptions-item>
              <n-descriptions-item label="RSI信号">
                {{ analysis.rsi }}
              </n-descriptions-item>
              <n-descriptions-item label="趋势研判">
                {{ analysis.trend }}
              </n-descriptions-item>
              <n-descriptions-item label="建议操作">
                <n-text :type="analysis.suggestion.type">
                  {{ analysis.suggestion.text }}
                </n-text>
              </n-descriptions-item>
            </n-descriptions>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  NGrid,
  NGridItem,
  NCard,
  NSpace,
  NInput,
  NInputGroup,
  NButton,
  NDescriptions,
  NDescriptionsItem,
  NTabs,
  NTabPane,
  NDataTable,
  NAlert,
  NText
} from 'naive-ui'

// 搜索相关
const searchCode = ref('')

// 股票信息
const stockInfo = ref({
  name: '浦发银行',
  code: '600000',
  price: '10.25',
  change: 2.5,
  volume: '2345.67万手',
  marketValue: '2345.67亿',
  pe: '12.34'
})

// 图表相关
const klineChart = ref<HTMLElement | null>(null)
const macdChart = ref<HTMLElement | null>(null)
const kdjChart = ref<HTMLElement | null>(null)
const rsiChart = ref<HTMLElement | null>(null)
let charts: echarts.ECharts[] = []

// 量化分析结果
const analysis = ref({
  signal: {
    type: 'success' as 'success' | 'error' | 'warning' | 'default' | 'info',
    title: '买入信号',
    message: 'MACD金叉，KDJ超卖，建议买入'
  },
  macd: 'MACD金叉，买入信号',
  kdj: 'KDJ超卖区间，有望反弹',
  rsi: 'RSI处于低位，超卖状态',
  trend: '短期上升趋势形成',
  suggestion: {
    type: 'success' as 'success' | 'error' | 'warning' | 'default' | 'info',
    text: '建议买入'
  }
})

// 搜索股票
const searchStock = async () => {
  if (!searchCode.value) return
  // TODO: 调用后端API获取股票数据
  // 这里模拟API调用
  console.log('搜索股票:', searchCode.value)
}

// 初始化K线图
const initKlineChart = () => {
  if (klineChart.value) {
    const chart = echarts.init(klineChart.value)
    charts.push(chart)
    
    // 模拟K线数据
    const data = generateKlineData()
    
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['日K']
      },
      grid: {
        left: '10%',
        right: '10%'
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: '日K',
        type: 'candlestick',
        data: data.map(item => [item.open, item.close, item.low, item.high])
      }]
    })
  }
}

// 生成模拟K线数据
const generateKlineData = () => {
  const basePrice = 10
  const data = []
  for (let i = 0; i < 20; i++) {
    const open = basePrice + Math.random() * 2 - 1
    const close = open + Math.random() * 2 - 1
    const low = Math.min(open, close) - Math.random()
    const high = Math.max(open, close) + Math.random()
    data.push({
      date: `2025-03-${String(i + 1).padStart(2, '0')}`,
      open,
      close,
      low,
      high
    })
  }
  return data
}

// 初始化技术指标图表
const initIndicatorCharts = () => {
  // 初始化MACD图表
  if (macdChart.value) {
    const chart = echarts.init(macdChart.value)
    charts.push(chart)
    // TODO: 设置MACD图表配置
  }

  // 初始化KDJ图表
  if (kdjChart.value) {
    const chart = echarts.init(kdjChart.value)
    charts.push(chart)
    // TODO: 设置KDJ图表配置
  }

  // 初始化RSI图表
  if (rsiChart.value) {
    const chart = echarts.init(rsiChart.value)
    charts.push(chart)
    // TODO: 设置RSI图表配置
  }
}

// 组件挂载时初始化图表
onMounted(() => {
  initKlineChart()
  initIndicatorCharts()

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
.stock-analysis {
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

.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.n-descriptions-item-label) {
  width: 100px;
}

:deep(.n-tabs-tab) {
  padding: 12px 24px;
}
</style>