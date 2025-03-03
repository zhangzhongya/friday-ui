import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MarketStat {
  label: string
  value: string
  trend: 'up' | 'down'
}

export interface HotSector {
  name: string
  changePercentage: number
}

export interface Signal {
  code: string
  name: string
  signalType: string
  price: string
  strength: string
  time: string
}

export const useMarketStore = defineStore('market', () => {
  // 市场统计数据
  const marketStats = ref<MarketStat[]>([
    { label: '上证指数', value: '3,123.25', trend: 'up' },
    { label: '深证成指', value: '9,877.65', trend: 'down' },
    { label: '创业板指', value: '2,543.12', trend: 'up' },
    { label: '北证指数', value: '1,234.56', trend: 'down' }
  ])

  // 热点板块数据
  const hotSectors = ref<HotSector[]>([
    { name: '新能源', changePercentage: 3.25 },
    { name: '半导体', changePercentage: 2.87 },
    { name: '医药生物', changePercentage: -1.23 },
    { name: '人工智能', changePercentage: 4.56 },
    { name: '金融科技', changePercentage: -0.89 }
  ])

  // 量化信号数据
  const signals = ref<Signal[]>([
    {
      code: '600000',
      name: '浦发银行',
      signalType: '金叉信号',
      price: '10.25',
      strength: '强',
      time: '2025-03-03 09:30:00'
    }
  ])

  // 更新市场数据
  const updateMarketStats = (stats: MarketStat[]) => {
    marketStats.value = stats
  }

  // 更新热点板块
  const updateHotSectors = (sectors: HotSector[]) => {
    hotSectors.value = sectors
  }

  // 添加新信号
  const addSignal = (signal: Signal) => {
    signals.value.unshift(signal)
    // 保持最多显示 10 条信号
    if (signals.value.length > 10) {
      signals.value.pop()
    }
  }

  return {
    marketStats,
    hotSectors,
    signals,
    updateMarketStats,
    updateHotSectors,
    addSignal
  }
})