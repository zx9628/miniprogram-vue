<template>
  <div class="map-selector">
    <!-- 头部 -->
    <header class="header">
      <div class="header-left" @click="goBack">
        <span class="icon">‹</span>
        <span class="title">附近</span>
      </div>
      <div class="header-right">
        <span class="icon">♡</span>
        <span class="icon">★</span>
      </div>
    </header>

    <!-- 地图占位区域 -->
    <div class="map-placeholder">
<!--      <img-->
<!--          src="https://via.placeholder.com/600x300/e0e7ff/3b82f6?text=🗺️+地图占位+请替换为实际地图图片"-->
<!--          alt="地图占位图"-->
<!--          class="map-image"-->
<!--      />-->
      <div class="map-marker">
        <span class="marker-icon">📍</span>
        <span class="marker-text">三品王·解放东路店</span>
      </div>
    </div>

    <!-- 门店列表 -->
    <div class="store-list">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <span class="search-text">搜索门店</span>
      </div>

      <div class="filter-tabs">
        <span class="filter-tab active">距离最近</span>
        <span class="filter-tab">好评优先</span>
        <span class="filter-tab">营业中</span>
      </div>

      <div class="store-card" @click="selectStore(322)">
        <div class="store-info">
          <div class="store-name">
            <span class="badge">322</span>
            <span class="name">桂林解放东路店</span>
            <span class="distance">11.3km</span>
          </div>
          <div class="store-address">
            <span class="address-icon">📍</span>
            <span class="address-text">秀峰区东西巷水坝大厦三品王</span>
          </div>
          <div class="store-hours">
            <span class="hours-icon">🕐</span>
            <span class="hours-text">07:00-22:00</span>
          </div>
        </div>
        <div class="store-action">
          <span class="action-icon">›</span>
        </div>
      </div>

      <div class="store-card" @click="selectStore(371)">
        <div class="store-info">
          <div class="store-name">
            <span class="badge">371</span>
            <span class="name">桂林高新万达店</span>
            <span class="distance">11.5km</span>
          </div>
          <div class="store-address">
            <span class="address-icon">📍</span>
            <span class="address-text">七星区漓东街道穿山东路43号桂林高新万达广场13栋1-20号</span>
          </div>
          <div class="store-hours">
            <span class="hours-icon">🕐</span>
            <span class="hours-text">07:00-22:00</span>
          </div>
        </div>
        <div class="store-action">
          <span class="action-icon">›</span>
        </div>
      </div>

      <div class="store-card favorite" @click="selectStore(320)">
        <div class="store-info">
          <div class="store-name">
            <span class="badge">320</span>
            <span class="name">桂林万象城店</span>
            <span class="distance">14.7km</span>
          </div>
          <div class="store-address">
            <span class="address-icon">📍</span>
            <span class="address-text">秀峰区红岭路1号桂林华润中心万象城B129号</span>
          </div>
          <div class="store-hours">
            <span class="hours-icon">🕐</span>
            <span class="hours-text">08:00-22:00</span>
          </div>
          <div class="favorite-tag">
            <span class="star-icon">⭐</span>
            <span class="favorite-text">常去</span>
          </div>
        </div>
        <div class="store-action">
          <span class="action-icon">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 返回上一页
const goBack = () => {
  // 如果是Vue Router项目
  // router.go(-1)
  console.log('返回上一页')
}

// 选择门店
const selectStore = (storeId: number) => {
  console.log('选择了门店:', storeId)
  goToCart();
  // 可以触发事件或跳转
}

const goToCart=()=>{
  wx.navigateTo({
    url: '/pages/cart/cart'
  })
}
</script>

<style scoped>
.map-selector {
  padding: 20px 24px 32px;
  background: #f8fafc;
  min-height: 100vh;
  max-width: 420px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0 24px 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.header-left .icon {
  font-size: 28px;
  color: #1e293b;
  font-weight: 300;
}

.header-left .title {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
}

.header-right {
  display: flex;
  gap: 20px;
}

.header-right .icon {
  font-size: 22px;
  color: #475569;
  cursor: pointer;
}

.map-placeholder {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #e2e8f0;
}

.map-image {
  width: 100%;
  display: block;
  height: auto;
}

.map-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.92);
  padding: 10px 20px 10px 14px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.map-marker .marker-icon {
  font-size: 24px;
}

.map-marker .marker-text {
  font-size: 16px;
  font-weight: 500;
  color: #0f172a;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-bar {
  background: white;
  border-radius: 30px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e9edf2;
}

.search-bar .search-icon {
  font-size: 20px;
  color: #94a3b8;
}

.search-bar .search-text {
  font-size: 16px;
  color: #94a3b8;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 6px 0 4px 0;
}

.filter-tab {
  background: white;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.filter-tab.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.store-card {
  background: white;
  border-radius: 20px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #edf2f7;
  cursor: pointer;
  transition: all 0.2s;
}

.store-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.store-card.favorite {
  border-color: #fde68a;
  background: #fffbeb;
}

.store-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.store-name {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 13px;
  padding: 2px 14px;
  border-radius: 20px;
}

.name {
  font-weight: 600;
  font-size: 18px;
  color: #0f172a;
}

.distance {
  font-size: 14px;
  color: #64748b;
  margin-left: auto;
}

.store-address {
  font-size: 15px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.store-address .address-icon {
  font-size: 14px;
  width: 20px;
  color: #94a3b8;
}

.store-hours {
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.store-hours .hours-icon {
  font-size: 14px;
  width: 20px;
  color: #94a3b8;
}

.favorite-tag {
  margin-top: 6px;
  background: #fbbf24;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  padding: 3px 14px 3px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.favorite-tag .star-icon {
  font-size: 12px;
}

.store-action .action-icon {
  font-size: 24px;
  color: #94a3b8;
  padding-left: 10px;
}
</style>