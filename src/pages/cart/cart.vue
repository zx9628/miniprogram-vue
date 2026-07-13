<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">点餐</text>
      <text class="store-id-tag" v-if="storeId">门店 #{{ storeId }}</text>
    </view>

    <!-- 店铺信息 -->
    <view class="store-header">
      <view class="store-info">
        <text class="store-name">三品王</text>
        <text class="store-distance">322桂林解放东路店距离您11.3km</text>
      </view>
      <view class="promotion-banner">
        <text class="promotion-text">[换购]购买指定菜品最低加2元即可换购</text>
        <text class="promotion-link">详情></text>
      </view>
    </view>

    <!-- 登录提示 -->
    <view class="login-tip">
      <text class="tip-text">有团购券吗？登录美团即可使用</text>
      <text class="login-btn">去登录</text>
    </view>

    <!-- 主体区域：左右分布 -->
    <view class="main-content">
      <view class="aside-wrapper">
        <Aside :storeId="storeId" @categoryChange="onCategoryChange" />
      </view>

      <view class="main-wrapper">
        <Main :categoryIndex="currentCategory" :storeId="storeId" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Aside from './aside.vue'
import Main from './main.vue'

const currentCategory = ref(0)
const storeId = ref(0)

onLoad((options) => {
  storeId.value = parseInt(options?.count) || 1
  console.log('📦 页面加载，接收到的门店ID:', storeId.value)
})

const onCategoryChange = (index: number) => {
  console.log('切换到分类索引:', index)
  currentCategory.value = index
}
</script>

<style scoped>
.container {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-bar {
  background: #ffffff;
  padding: 20rpx 0 16rpx;
  text-align: center;
  flex-shrink: 0;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.store-id-tag {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.store-header {
  background: #ffffff;
  padding: 20rpx 30rpx 16rpx;
  flex-shrink: 0;
}

.store-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.store-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.store-distance {
  font-size: 24rpx;
  color: #999;
}

.promotion-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff7e6;
  padding: 10rpx 16rpx;
  border-radius: 8rpx;
  margin-top: 10rpx;
}

.promotion-text {
  font-size: 22rpx;
  color: #ff6a00;
}

.promotion-link {
  font-size: 22rpx;
  color: #ff6a00;
  flex-shrink: 0;
}

.login-tip {
  background: #ffffff;
  padding: 12rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
}

.login-btn {
  font-size: 24rpx;
  color: #07c160;
  font-weight: bold;
  background: #f0faf5;
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  min-height: 0;
}

.aside-wrapper {
  flex-shrink: 0;
  width: 180rpx;
  background: #f8f8f8;
  overflow-y: auto;
  height: 100%;
}

.main-wrapper {
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
  height: 100%;
}
</style>