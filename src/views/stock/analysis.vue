<template>
  <div class="stock-analysis">
    <n-grid :cols="24" :x-gap="12" :y-gap="8" responsive="screen">
      <!-- 过滤器 -->
      <n-grid-item :span="24">
        <n-card class="shadow-sm">
          <n-grid :cols="24" :x-gap="24" :y-gap="16" responsive="screen">
            <n-grid-item :span="xs" :sm="8" :md="6" :lg="6">
              <n-input
                v-model:value="filter.tsCode"
                placeholder="请输入股票代码"
                clearable
              />
            </n-grid-item>
            <n-grid-item :span="xs" :sm="12" :md="8" :lg="8">
              <n-date-picker
                v-model:value="filter.dateRange"
                type="daterange"
                clearable
                :shortcuts="dateShortcuts"
                :is-date-disabled="disableFutureDate"
                format="yyyy-MM-dd"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :locale="dateLocale"
                style="width: 100%"
              />
            </n-grid-item>
            <n-grid-item :span="xs" :sm="4" :md="4" :lg="4">
              <n-space justify="end" style="width: 100%">
                <n-button type="primary" @click="fetchStockData">
                  查询
                </n-button>
                <n-button @click="resetFilter">
                  重置
                </n-button>
              </n-space>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>

      <!-- K线图 -->
      <n-grid-item :span="24">
        <n-card title="K线图" class="shadow-sm">
          <div ref="klineChart" style="height: 400px; width: 100%"></div>
        </n-card>
      </n-grid-item>

      <!-- MACD指标 -->
      <n-grid-item :span="24">
        <n-card title="MACD指标" class="shadow-sm">
          <div ref="macdChart" style="height: 300px; width: 100%"></div>
        </n-card>
      </n-grid-item>

      <!-- KDJ指标 -->
      <n-grid-item :span="12" :xs="24" :sm="24" :md="12">
        <n-card title="KDJ指标" class="shadow-sm">
          <div ref="kdjChart" style="height: 300px; width: 100%"></div>
        </n-card>
      </n-grid-item>

      <!-- DMI指标 -->
      <n-grid-item :span="12" :xs="24" :sm="24" :md="12">
        <n-card title="DMI指标" class="shadow-sm">
          <div ref="dmiChart" style="height: 300px; width: 100%"></div>
        </n-card>
      </n-grid-item>

      <!-- OBV指标 -->
      <n-grid-item :span="12" :xs="24" :sm="24" :md="12">
        <n-card title="OBV指标" class="shadow-sm">
          <div ref="obvChart" style="height: 300px; width: 100%"></div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  NGrid,
  NGridItem,
  NCard,
  NInput,
  NDatePicker,
  NButton,
  NSpace,
  useMessage
} from 'naive-ui'

// 定义响应式断点
const xs = 24
const sm = 12
const md = 8
const lg = 6

// 创建message实例
const message = useMessage()

// 过滤条件
const filter = ref({
  tsCode: '',
  dateRange: null
})

// 图表引用
const klineChart = ref<HTMLElement | null>(null)
const macdChart = ref<HTMLElement | null>(null)
const kdjChart = ref<HTMLElement | null>(null)
const dmiChart = ref<HTMLElement | null>(null)
const obvChart = ref<HTMLElement | null>(null)

// 图表实例
let klineInstance: echarts.ECharts | null = null
let macdInstance: echarts.ECharts | null = null
let kdjInstance: echarts.ECharts | null = null
let dmiInstance: echarts.ECharts | null = null
let obvInstance: echarts.ECharts | null = null

// 日期选择器配置
const dateShortcuts = {
  '1周': () => {
    const end = dayjs()
    const start = dayjs().subtract(1, 'week')
    return [start.valueOf(), end.valueOf()]
  },
  '1个月': () => {
    const end = dayjs()
    const start = dayjs().subtract(1, 'month')
    return [start.valueOf(), end.valueOf()]
  },
  '3个月': () => {
    const end = dayjs()
    const start = dayjs().subtract(3, 'month')
    return [start.valueOf(), end.valueOf()]
  },
  '6个月': () => {
    const end = dayjs()
    const start = dayjs().subtract(6, 'month')
    return [start.valueOf(), end.valueOf()]
  },
  '1年': () => {
    const end = dayjs()
    const start = dayjs().subtract(1, 'year')
    return [start.valueOf(), end.valueOf()]
  },
  '今年': () => {
    const end = dayjs()
    const start = dayjs().startOf('year')
    return [start.valueOf(), end.valueOf()]
  },
  '去年': () => {
    const start = dayjs().subtract(1, 'year').startOf('year')
    const end = dayjs().subtract(1, 'year').endOf('year')
    return [start.valueOf(), end.valueOf()]
  }
}

// 日期选择器禁用未来日期
const disableFutureDate = (ts: number) => {
  return ts > dayjs().endOf('day').valueOf()
}

// 日期选择器中文显示
const dateLocale = {
  yearFormat: 'YYYY',
  monthFormat: 'MM',
  dayFormat: 'DD',
  firstDayOfWeek: 0,
  today: '今天',
  now: '此刻',
  ok: '确定',
  clear: '清除',
  month: '月',
  year: '年',
  week: '周',
  day: '日',
  hour: '时',
  minute: '分',
  second: '秒',
  shortYearFormat: 'YY',
  shortMonthFormat: 'M',
  shortDayFormat: 'D',
  shortHourFormat: 'H',
  shortMinuteFormat: 'm',
  shortSecondFormat: 's',
  pluralDay: '天'
}

// 初始化图表
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  disposeCharts()
  window.removeEventListener('resize', handleResize)
})

// 初始化所有图表
const initCharts = () => {
  if (klineChart.value) {
    klineInstance = echarts.init(klineChart.value)
  }
  if (macdChart.value) {
    macdInstance = echarts.init(macdChart.value)
  }
  if (kdjChart.value) {
    kdjInstance = echarts.init(kdjChart.value)
  }
  if (dmiChart.value) {
    dmiInstance = echarts.init(dmiChart.value)
  }
  if (obvChart.value) {
    obvInstance = echarts.init(obvChart.value)
  }
}

// 销毁所有图表
const disposeCharts = () => {
  klineInstance?.dispose()
  macdInstance?.dispose()
  kdjInstance?.dispose()
  dmiInstance?.dispose()
  obvInstance?.dispose()
}

// 处理窗口大小变化
const handleResize = () => {
  klineInstance?.resize()
  macdInstance?.resize()
  kdjInstance?.resize()
  dmiInstance?.resize()
  obvInstance?.resize()
}

// 重置过滤条件
const resetFilter = () => {
  filter.value = {
    tsCode: '',
    dateRange: null
  }
}

// 获取股票数据
const fetchStockData = async () => {
  if (!filter.value.tsCode || !filter.value.dateRange) {
    message.warning('请输入股票代码和日期范围')
    return
  }

  try {
    const response = await axios.post('http://127.0.0.1:8088/api/v1/stock/indicator/query', {
      tsCode: filter.value.tsCode,
      startDate: dayjs(filter.value.dateRange[0]).format('YYYY-MM-DD'),
      endDate: dayjs(filter.value.dateRange[1]).format('YYYY-MM-DD')
    })

    const data = response.data
    updateCharts(data.indicators)
  } catch (error) {
    console.error('获取股票数据失败:', error)
    message.error('获取股票数据失败')
  }
}

// 更新图表数据
const updateCharts = (indicators: any[]) => {
  // K线图数据
  const klineData = indicators.map(item => ([
    item.openPrice,
    item.closePrice,
    item.lowestPrice,
    item.highestPrice
  ]))

  // MACD数据
  const macdData = indicators.map(item => ({
    date: item.tradeDate,
    diff: item.macd?.diff || 0,
    dea: item.macd?.dea || 0,
    bar: item.macd?.bar || 0,
    signalType: item.macd?.signalType || 'NO_SIGNAL'
  }))

  // 生成金叉死叉标记点数据
  const markPoints = macdData.reduce((acc: any[], item, index) => {
    if (item.signalType === 'GOLDEN_CROSS') {
      acc.push({
        name: '金叉',
        coord: [item.date, Math.max(item.diff, item.dea)],
        symbol: 'arrow',
        symbolSize: 10,
        itemStyle: {
          color: '#FFD700'  // 金色
        },
        label: {
          formatter: '金叉',
          position: 'top'
        }
      })
    } else if (item.signalType === 'DEATH_CROSS') {
      acc.push({
        name: '死叉',
        coord: [item.date, Math.min(item.diff, item.dea)],
        symbol: 'arrow',
        symbolSize: 10,
        symbolRotate: 180,
        itemStyle: {
          color: '#FF4444'  // 红色
        },
        label: {
          formatter: '死叉',
          position: 'bottom'
        }
      })
    }
    return acc
  }, [])

  // KDJ数据
  const kdjData = indicators.map(item => ({
    date: item.tradeDate,
    k: item.kdj?.k || 0,
    d: item.kdj?.d || 0,
    j: item.kdj?.j || 0
  }))

  // DMI数据
  const dmiData = indicators.map(item => ({
    date: item.tradeDate,
    plusDI: item.dmi?.plusDI || 0,
    minusDI: item.dmi?.minusDI || 0,
    adx: item.dmi?.adx || 0
  }))

  // OBV数据
  const obvData = indicators.map(item => ({
    date: item.tradeDate,
    obv: item.obv || 0
  }))

  // 更新K线图
  klineInstance?.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '10%',
      right: '10%'
    },
    xAxis: {
      type: 'category',
      data: indicators.map(item => item.tradeDate),
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      splitNumber: 20
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed' }
      }
    },
    series: [{
      name: 'K线',
      type: 'candlestick',
      data: klineData,
      itemStyle: {
        color: '#ef5350',
        color0: '#26a69a',
        borderColor: '#ef5350',
        borderColor0: '#26a69a'
      }
    }],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        bottom: 10,
        start: 0,
        end: 100
      }
    ]
  })

  // 更新MACD图
  macdInstance?.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['DIFF', 'DEA', 'MACD']
    },
    grid: {
      left: '10%',
      right: '10%'
    },
    xAxis: {
      type: 'category',
      data: macdData.map(item => item.date),
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed' }
      }
    },
    series: [
      {
        name: 'DIFF',
        type: 'line',
        data: macdData.map(item => item.diff),
        markPoint: {
          data: markPoints
        }
      },
      {
        name: 'DEA',
        type: 'line',
        data: macdData.map(item => item.dea)
      },
      {
        name: 'MACD',
        type: 'bar',
        data: macdData.map(item => item.bar),
        itemStyle: {
          color: function(params: any) {
            return params.data >= 0 ? '#ef5350' : '#26a69a';
          }
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        bottom: 10,
        start: 0,
        end: 100
      }
    ]
  })

  // 更新KDJ图
  kdjInstance?.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: kdjData.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'K',
        type: 'line',
        data: kdjData.map(item => item.k)
      },
      {
        name: 'D',
        type: 'line',
        data: kdjData.map(item => item.d)
      },
      {
        name: 'J',
        type: 'line',
        data: kdjData.map(item => item.j)
      }
    ]
  })

  // 更新DMI图
  dmiInstance?.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dmiData.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '+DI',
        type: 'line',
        data: dmiData.map(item => item.plusDI)
      },
      {
        name: '-DI',
        type: 'line',
        data: dmiData.map(item => item.minusDI)
      },
      {
        name: 'ADX',
        type: 'line',
        data: dmiData.map(item => item.adx)
      }
    ]
  })

  // 更新OBV图
  obvInstance?.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: obvData.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'OBV',
        type: 'line',
        data: obvData.map(item => item.obv)
      }
    ]
  })
}
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
</style>
