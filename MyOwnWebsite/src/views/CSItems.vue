<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NLayout, NLayoutHeader, NLayoutContent, NLayoutSider, NMenu, NTab, NTabs, NSelect, NProgress } from 'naive-ui'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, CandlestickChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent, DataZoomComponent, VisualMapComponent } from 'echarts/components'
import { ECharts } from 'echarts/core'
import {bindLocalIp,
        getCurrentData,
        getSubData,
        getKline,

} from "../services/CSQaQ";
import dayjs from 'dayjs'
use([CanvasRenderer, LineChart, CandlestickChart, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent, VisualMapComponent])

const router = useRouter()

const menuOptions = [
  { label: '首页', key: 'home' },
  { label: '饰品列表', key: 'items' },
  { label: '排行榜', key: 'ranking' },
  { label: '库存监控', key: 'inventory' },
  { label: '挂刀行情', key: 'knife' },
  { label: '热门系列', key: 'series' },
]

const currentTab = ref('index')
const tabs = [
  { key: 'index', label: '饰品指数' },
  { key: 'items', label: '饰品列表' },
  { key: 'ranking', label: '排行榜' },
]

const indexTabs = ref([
  { id: 0, name: '饰品指数', change: 0.65, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20weapon%20skin%20icon&image_size=square' },
  { id: 1, name: '租赁指数', change: -2.44, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rent%20lease%20contract%20icon&image_size=square' },
  { id: 2, name: '百元主战', change: 0.31, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=weapon%20rifle%20gun%20icon&image_size=square' },
  { id: 3, name: '探员指数', change: 3.83, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=agent%20character%20icon&image_size=square' },
  { id: 4, name: '原皮指数', change: 0.02, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=original%20skin%20weapon&image_size=square' },
  { id: 5, name: '红皮指数', change: 0.31, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20weapon%20skin%20icon&image_size=square' },
  { id: 6, name: '千战指数', change: -0.09, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=trophy%20achievement%20icon&image_size=square' },
  { id: 7, name: '武库指数', change: -4.13, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=weapon%20arsenal%20inventory&image_size=square' },
  { id: 8, name: '贴纸指数', change: -38.7, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sticker%20decal%20icon&image_size=square' },
  { id: 9, name: '匕首指数', change: -0.33, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=knife%20dagger%20icon&image_size=square' },
  { id: 10, name: '手套指数', change: 0.21, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=glove%20handwear%20icon&image_size=square' },
  { id: 11, name: '胸针指数', change: 12.25, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pin%20badge%20icon&image_size=square' },
  { id: 12, name: '戒指指数', change: -5.39, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ring%20jewelry%20icon&image_size=square' },
  { id: 13, name: '挂件指数', change: -0.08, up: false, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=charm%20keychain%20icon&image_size=square' },
  { id: 14, name: '多普勒', change: 0.54, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=doppler%20weapon%20skin&image_size=square' },
  { id: 15, name: '伽马多普勒', change: 1.01, up: true, img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gamma%20doppler%20skin&image_size=square' },
])

const activeIndexTab = ref(0)

const tabsScrollWrapper = ref<HTMLElement | null>(null)
const tabsContainer = ref<HTMLElement | null>(null)

const selectIndexTab = (index: number) => {
  activeIndexTab.value = index
}

const scrollTabs = (direction: number) => {
  if (tabsScrollWrapper.value) {
    const scrollAmount = 200
    tabsScrollWrapper.value.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    })
  }
}

const chartTabs = ref([
  { id: 0, name: '饰品指数' },
  { id: 1, name: '1小时' },
  { id: 2, name: '4小时' },
  { id: 3, name: '日线' },
  { id: 4, name: '周线' },
])

const activeChartTab = ref(0)

const selectChartTab = (index: number) => {
  activeChartTab.value = index
}

const itemIndexData = ref({
  current: 2149.73,
  change: 13.98,
  percent: 0.65,
  high: 2149.73,
  low: 2135.58,
})

const marketData = ref({
  online: 673347,
  yesterdayChange: 68267,
  monthChange: 95075,
  steamPrice: 551.8,
})

const hotItems = ref([
  { name: '龙狙', price: 128000, change: 5.2, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20dragon%20lore%20skin%20weapon&image_size=square' },
  { name: '蝴蝶刀', price: 12500, change: -2.3, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20butterfly%20knife%20skin&image_size=square' },
  { name: 'AK-47', price: 8500, change: 3.1, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20AK47%20skin%20weapon&image_size=square' },
  { name: 'AWP', price: 7200, change: 1.8, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20AWP%20sniper%20skin&image_size=square' },
  { name: 'M4A4', price: 5600, change: -0.5, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20M4A4%20weapon%20skin&image_size=square' },
  { name: 'USP-S', price: 4200, change: 2.8, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CSGO%20USP%20pistol%20skin&image_size=square' },
])

let chartInstance: ECharts | null = null
//绑定本机白名单IP
const bindIp = async () => {
  await bindLocalIp();
};
const initChart = () => {
  const chartDom = document.getElementById('price-chart')
  if (!chartDom) return

  import('echarts').then((echarts) => {
    chartInstance = echarts.init(chartDom)

    // const generateData = () => {
    //   const data = []
    //   let value = 2000
    //   for (let i = 0; i < 100; i++) {
    //     const open = value + (Math.random() - 0.5) * 50
    //     const close = open + (Math.random() - 0.5) * 50
    //     const high = Math.max(open, close) + Math.random() * 30
    //     const low = Math.min(open, close) - Math.random() * 30
    //     value = close
    //     data.push([
    //       `2026-01-${String(i + 1).padStart(2, '0')}`,
    //       open.toFixed(2),
    //       close.toFixed(2),
    //       low.toFixed(2),
    //       high.toFixed(2),
    //     ])
    //   }
    //   return data
    // }

    const option = {
      backgroundColor: '#1a1a2e',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#667eea',
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '8%',
      },
      xAxis: {
        type: 'category',
        data: kLineData.value.map(k=>k.t),
        axisLine: { lineStyle: { color: '#667eea' } },
        axisLabel: { color: '#aaa' },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: '#667eea' } },
        axisLabel: { color: '#aaa' },
        splitLine: { lineStyle: { color: '#2a2a4e' } },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          bottom: '0%',
          start: 50,
          end: 100,
          borderColor: '#667eea',
          backgroundColor: '#1a1a2e',
          fillerColor: 'rgba(102, 126, 234, 0.3)',
          handleStyle: { color: '#667eea' },
        },
      ],
      series: [
        {
          name: '价格',
          type: 'candlestick',
          data: kLineData.value.map(k => [
            parseFloat(k.o),
            parseFloat(k.c),
            parseFloat(k.l),
            parseFloat(k.h),
          ]),
          itemStyle: {
            color: '#14b8a6',
            color0: '#ef4444',
            borderColor: '#14b8a6',
            borderColor0: '#ef4444',
          },
        },
      ],
    }

    chartInstance.setOption(option)
  })
}

const initOnlineChart = () => {
  const chartDom = document.getElementById('online-chart')
  if (!chartDom) return

  import('echarts').then((echarts) => {
    const onlineChart = echarts.init(chartDom)

    const generateOnlineData = () => {
      const data = []
      for (let i = 0; i < 200; i++) {
        data.push({
          name: `第${i}天`,
          value: [
            `2026-0${Math.floor(i / 30) + 1}-${String(i % 30 + 1).padStart(2, '0')}`,
            Math.floor(600000 + Math.random() * 200000),
          ],
        })
      }
      return data
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: generateOnlineData().map(d => d.value[0]),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#888', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#888', fontSize: 10 },
        splitLine: { lineStyle: { color: '#333' } },
      },
      series: [
        {
          name: '在线人数',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(102, 126, 234, 0.5)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' },
              ],
            },
          },
          lineStyle: { color: '#667eea', width: 2 },
          data: generateOnlineData().map(d => d.value[1]),
        },
      ],
    }

    onlineChart.setOption(option)
  })
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

const goHome = () => {
  router.push('/')
}
const   kLineData=ref()
onMounted(() => {
  
  initOnlineChart()
    //bindIp();
    getCurrentData('init').then(res=>{
        console.log({"res":res})
        indexTabs.value=res.data.sub_index_data
        
    }).catch(err=>{

    })
    //indexTabs.value=res。
    
    let data={
        //id:1,
        type:'daily',
    }
    let data2={
        id:1,
        type:'1day',
    }
    setTimeout(()=>{
        getSubData(data)
    },3000)
    setTimeout(()=>{
        getKline(data2).then(res=>{
            kLineData.value=res.data
            kLineData.value.map(item=>item.t=dayjs(item.t).format('YYYY-MM-DD'))
            initChart()
        })
    },6000)
    
    
    //getCurrentData()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<template>
  <n-layout class="cs-items-page">
    <n-layout-header bordered class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-text">CS</span>
          <span class="logo-accent">饰品</span>
        </div>
        <n-menu mode="horizontal" :options="menuOptions" class="nav-menu" />
        <div class="header-right">
          <div class="search-box">
            <input type="text" placeholder="搜索饰品名称..." class="search-input" />
          </div>
          <n-button quaternary class="header-btn">登录</n-button>
          <n-button type="primary" class="header-btn">注册</n-button>
          <n-button type="primary" class="header-btn" @click="goHome" style="margin-left: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
            ← 返回首页
          </n-button>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content class="main-content">
      <div class="content-wrapper">
        <div class="top-section fade-in-section" style="animation-delay: 0.2s;">
          <div class="left-panel">
            <div class="index-card fade-in-section" style="animation-delay: 0.4s;">
              <div class="index-header">
                <div class="index-title">
                  <h2>饰品指数</h2>
                  <span class="time-range">⟳ 连续3天</span>
                </div>
                <div class="index-time">
                  <span>2026-04-02 09:21:07</span>
                  <span>当前时间</span>
                </div>
              </div>
              <div class="index-data">
                <div class="index-main">
                  <div class="index-value">{{ itemIndexData.current }}</div>
                  <div class="index-change" :class="itemIndexData.change >= 0 ? 'up' : 'down'">
                    <span class="change-arrow">{{ itemIndexData.change >= 0 ? '↑' : '↓' }}</span>
                    <span>{{ Math.abs(itemIndexData.change) }}</span>
                    <span class="change-percent">+{{ itemIndexData.percent }}%</span>
                  </div>
                </div>
                <div class="index-range">
                  <div class="range-item">
                    <span class="range-label">今日最高</span>
                    <span class="range-value">{{ itemIndexData.high }}</span>
                  </div>
                  <div class="range-item">
                    <span class="range-label">今日最低</span>
                    <span class="range-value">{{ itemIndexData.low }}</span>
                  </div>
                </div>
              </div>
              <div class="index-tabs-container">
                <button class="scroll-btn scroll-left" @click="scrollTabs(-1)">
                  <span>‹</span>
                </button>
                <div class="index-tabs-scroll-wrapper" ref="tabsScrollWrapper">
                  <div class="index-tabs" ref="tabsContainer">
                    <div 
                      v-for="(tab, index) in indexTabs" 
                      :key="tab.id"
                      class="tab-item"
                      :class="{ active: activeIndexTab === index }"
                      @click="selectIndexTab(index)"
                    >
                      <img class="tab-icon" :src="tab.img" :alt="tab.name" />
                      <div class="tab-content">
                        <span class="tab-name">{{ tab.name }}</span>
                        <span class="tab-change" :class="{ up: tab.up, down: !tab.up }">
                          {{ tab.up ? '+' : '' }}{{ tab.change }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button class="scroll-btn scroll-right" @click="scrollTabs(1)">
                  <span>›</span>
                </button>
              </div>
            </div>

            <div class="chart-card fade-in-section" style="animation-delay: 0.6s;">
              <div class="chart-header">
                <div class="chart-tabs-scroll-wrapper">
                  <div class="chart-tabs">
                    <div 
                      v-for="(tab, index) in chartTabs" 
                      :key="tab.id"
                      class="chart-tab"
                      :class="{ active: activeChartTab === index }"
                      @click="selectChartTab(index)"
                    >
                      {{ tab.name }}
                    </div>
                  </div>
                </div>
                <div class="chart-tools">
                  <span class="tool-item">MA</span>
                  <span class="tool-item">指标</span>
                  <span class="tool-item">设置</span>
                  <span class="tool-item">截屏</span>
                  <span class="tool-item">全屏</span>
                </div>
              </div>
              <div id="price-chart" class="price-chart"></div>
            </div>
          </div>

          <div class="right-panel fade-in-section" style="animation-delay: 0.8s;">
            <div class="market-card fade-in-section" style="animation-delay: 1s;">
              <div class="market-header">
                <h3>市场热度监测</h3>
                <span class="market-time">历史数据</span>
              </div>
              <div class="market-desc">
                <span class="desc-label">当前数值</span>
                <span class="desc-value">111.5分（低迷）</span>
              </div>
              <div class="market-desc-small">
                根据市场社区相关数据综合计算得出
              </div>

              <div class="online-section">
                <div class="online-header">
                  <div>
                    <h4>当前在线人数</h4>
                    <span class="online-time">2026-04-02 09:16</span>
                  </div>
                  <div class="online-badge">📈</div>
                </div>
                <div class="online-number">{{ marketData.online.toLocaleString() }}</div>
                <div class="online-stats">
                  <div class="stat-item">
                    <span class="stat-label">昨日同时段</span>
                    <span class="stat-value up">↑ {{ marketData.yesterdayChange.toLocaleString() }}</span>
                    <span class="stat-percent up">+6.4%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">上周同时段</span>
                    <span class="stat-value up">↑ 66,227</span>
                    <span class="stat-percent up">+8.6%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">全月同时段</span>
                    <span class="stat-value up">↑ {{ marketData.monthChange.toLocaleString() }}</span>
                    <span class="stat-percent up">+9.0%</span>
                  </div>
                </div>
                <div id="online-chart" class="online-chart"></div>
                <div class="online-summary">
                  <div class="summary-item">
                    <span class="summary-label">昨日在线峰值</span>
                    <span class="summary-value">1,573,122 人</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">本月在线峰值</span>
                    <span class="summary-value">1,573,122 人</span>
                  </div>
                </div>
              </div>

              <div class="steam-section">
                <div class="steam-header">
                  <h4>Steam卡价</h4>
                  <div class="steam-tabs">
                    <span class="steam-tab active">历史</span>
                    <span class="steam-tab">客户端</span>
                  </div>
                </div>
                <div class="steam-price">
                  <div class="price-label">今日均价</div>
                  <div class="price-value">¥ {{ marketData.steamPrice }} / 100$</div>
                  <div class="price-note">美元区</div>
                </div>
                <div class="steam-hint">受手续费汇率等波动影响，价格仅供参考</div>
              </div>

              <div class="ranking-section">
                <div class="ranking-header">
                  <h4>涨跌分布</h4>
                </div>
                <div class="ranking-tabs">
                  <span class="ranking-tab active">饰品类型</span>
                  <span class="ranking-tab">价格板块</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hot-items-section fade-in-section" style="animation-delay: 1.2s;">
          <div class="section-header fade-in-section" style="animation-delay: 1.4s;">
            <h3>热门饰品</h3>
          </div>
          <div class="items-grid fade-in-section" style="animation-delay: 1.6s;">
            <div v-for="(item, index) in hotItems" :key="index" class="item-card fade-in-section" :style="{ animationDelay: `${1.8 + index * 0.2}s` }">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="item-info">
                <h4 class="item-name">{{ item.name }}</h4>
                <div class="item-price">
                  <span class="price-label">¥</span>
                  <span class="price-value">{{ item.price.toLocaleString() }}</span>
                </div>
                <div class="item-change" :class="item.change >= 0 ? 'up' : 'down'">
                  <span class="change-arrow">{{ item.change >= 0 ? '↑' : '↓' }}</span>
                  <span class="change-value">{{ Math.abs(item.change) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped lang="scss">
.cs-items-page {
  min-height: 100vh;
  width: 100%;
  background: #0d0d1a;
  color: #fff;
}

.header {
  background: #1a1a2e;
  border-bottom: 1px solid #2a2a4e;
  height: 60px;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-section {
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  
  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    color: #f59e0b;
  }
  
  .logo-accent {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }
}

.nav-menu {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
  background: transparent;
  
  :deep(.n-menu-item-content) {
    color: #aaa;
    &:hover {
      color: #fff;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
}

.search-input {
  width: 200px;
  padding: 8px 16px;
  background: #2a2a4e;
  border: 1px solid #3a3a5e;
  border-radius: 20px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    border-color: #667eea;
  }
}

.header-btn {
  border-radius: 8px;
}

.main-content {
  background: #0d0d1a;
  width: 100%;
  min-height: calc(100vh - 60px);
}

.content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  margin-bottom: 32px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.right-panel {
  display: flex;
  flex-direction: column;
}

.index-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #2a2a4e;
  display: flex;
  flex-direction: column;
}

.index-data {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.index-tabs-container {
  flex-shrink: 0;
  margin-top: auto;
}

.index-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.index-title {
  display: flex;
  align-items: center;
  gap: 12px;
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .time-range {
    padding: 4px 12px;
    background: #2a2a4e;
    border-radius: 12px;
    font-size: 0.85rem;
    color: #aaa;
  }
}

.index-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.85rem;
  color: #666;
}

.index-data {
  margin-bottom: 20px;
}

.index-main {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 16px;
}

.index-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
}

.index-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;
  
  &.up {
    color: #14b8a6;
  }
  
  &.down {
    color: #ef4444;
  }
  
  .change-arrow {
    font-size: 1.3rem;
  }
  
  .change-percent {
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

.index-range {
  display: flex;
  gap: 32px;
}

.range-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .range-label {
    font-size: 0.85rem;
    color: #666;
  }
  
  .range-value {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
  }
}

.index-tabs-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #2a2a4e;
  color: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background: #3a3a5e;
  }
  
  span {
    display: block;
    line-height: 1;
  }
}

.index-tabs-scroll-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-width: 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.index-tabs {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  width: max-content;
}

.tab-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2a2a4e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: auto;
  
  &:hover {
    background: #3a3a5e;
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .tab-icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }
  
  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .tab-name {
    font-size: 0.8rem;
    color: #fff;
    text-align: left;
    white-space: nowrap;
  }
  
  .tab-change {
    font-size: 0.7rem;
    
    &.up {
      color: #14b8a6;
    }
    
    &.down {
      color: #ef4444;
    }
  }
}

.chart-card {
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid #2a2a4e;
  overflow: hidden;
  flex: 1;
  min-height: 500px;
  min-width: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #2a2a4e;
}

.chart-tabs-scroll-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.chart-tabs {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  min-width: max-content;
}

.chart-tab {
  font-size: 0.9rem;
  color: #888;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  background: #2a2a4e;
  transition: all 0.3s ease;
  
  &:hover {
    background: #3a3a5e;
    color: #fff;
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-weight: 600;
  }
}

.chart-tools {
  display: flex;
  gap: 16px;
}

.tool-item {
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #fff;
  }
}

.price-chart {
  width: 100%;
  height: calc(100% - 20px);
  margin-bottom: 20px;
  min-width: 0;
  overflow: hidden;

}

.market-card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #2a2a4e;
  height: 100%;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.market-time {
  font-size: 0.85rem;
  color: #667eea;
  cursor: pointer;
}

.market-desc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .desc-label {
    font-size: 0.9rem;
    color: #aaa;
  }
  
  .desc-value {
    font-size: 0.9rem;
    color: #f59e0b;
  }
}

.market-desc-small {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 24px;
}

.online-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a4e;
}

.online-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .online-time {
    font-size: 0.8rem;
    color: #666;
  }
}

.online-badge {
  font-size: 1.5rem;
}

.online-number {
  font-size: 2rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 16px;
}

.online-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  
  .stat-label {
    color: #666;
  }
  
  .stat-value {
    color: #fff;
    
    &.up {
      color: #14b8a6;
    }
    
    &.down {
      color: #ef4444;
    }
  }
  
  .stat-percent {
    padding: 2px 8px;
    background: #2a2a4e;
    border-radius: 4px;
    font-size: 0.75rem;
    
    &.up {
      color: #14b8a6;
    }
    
    &.down {
      color: #ef4444;
    }
  }
}

.online-chart {
  width: 100%;
  height: 150px;
  margin-bottom: 16px;
}

.online-summary {
  display: flex;
  gap: 16px;
}

.summary-item {
  flex: 1;
  padding: 12px;
  background: #2a2a4e;
  border-radius: 8px;
  text-align: center;
  
  .summary-label {
    display: block;
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 4px;
  }
  
  .summary-value {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
  }
}

.steam-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2a2a4e;
}

.steam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
}

.steam-tabs {
  display: flex;
  gap: 12px;
}

.steam-tab {
  padding: 4px 12px;
  background: #2a2a4e;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  
  &.active {
    background: #667eea;
    color: #fff;
  }
}

.steam-price {
  text-align: center;
  margin-bottom: 8px;
  
  .price-label {
    display: block;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 4px;
  }
  
  .price-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f59e0b;
    margin-bottom: 4px;
  }
  
  .price-note {
    display: block;
    font-size: 0.8rem;
    color: #666;
  }
}

.steam-hint {
  font-size: 0.75rem;
  color: #666;
  text-align: center;
}

.ranking-header {
  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.ranking-tabs {
  display: flex;
  gap: 12px;
}

.ranking-tab {
  padding: 8px 24px;
  background: #2a2a4e;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #aaa;
  cursor: pointer;
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
}

.hot-items-section {
  margin-top: 32px;
}

.section-header {
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.item-card {
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2a4e;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  }
}

.item-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #2a2a4e 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item-info {
  padding: 16px;
}

.item-name {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
  
  .price-label {
    font-size: 1rem;
    color: #f59e0b;
  }
  
  .price-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f59e0b;
  }
}

.item-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.95rem;
  
  &.up {
    color: #14b8a6;
  }
  
  &.down {
    color: #ef4444;
  }
  
  .change-arrow {
    font-size: 1.1rem;
  }
  
  .change-value {
    font-weight: 600;
  }
}
</style>
