<script setup lang="ts">
import { ref } from 'vue';

// 模拟用户数据
const userInfo = ref({
  levelName: '三品王VIP卡·铁牛会员',
  cardNo: '123080248354',
  points: 0,
  balance: 0,
  coupons: 0,
  giftCards: 0
});

// 常用功能列表配置
const commonFuncs = [
  { title: '充值', icon: '💳' },
  { title: '购买会员权益', icon: '👑' },
  { title: '付费权益卡', icon: '🎫' }
];

// 会员特权列表配置
const privileges = [
  { title: '会员优享价', icon: '🏷️' },
  { title: '消费赠积分', icon: '🎁' },
  { title: '积分抵现', icon: '💰' },
  { title: '生日有礼', icon: '🎂' }
];

// 底部菜单列表配置
const menuList = [
  { title: '会员信息', icon: '👤' },
  { title: '交易记录', icon: '🧾' },
  { title: '适用门店', icon: '📍' },
  { title: '会员卡说明', icon: 'ℹ️' }
];

// 简单的跳转逻辑占位
const handleJump = (title: string) => {
  console.log('点击了：', title);
};
</script>

<template>
  <view class="container">
    <!-- 顶部背景包裹层 -->
    <view class="vip-card-bg">
      <view class="vip-card">
        <view class="card-top">
          <view class="user-info">
            <text class="level-name">{{ userInfo.levelName }}</text>
            <text class="card-no">{{ userInfo.cardNo }}</text>
          </view>
        </view>

        <!-- 卡片中部：资产数据 -->
        <view class="assets-row">
          <view class="asset-item" @click="handleJump('积分')">
            <text class="num">{{ userInfo.points }}</text>
            <text class="label">积分</text>
          </view>
          <view class="asset-item" @click="handleJump('余额')">
            <text class="num">¥ {{ userInfo.balance }}</text>
            <text class="label">余额</text>
          </view>
          <view class="asset-item" @click="handleJump('优惠券')">
            <text class="num">{{ userInfo.coupons }}</text>
            <text class="label">优惠券</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 进度条区域 -->
    <view class="progress-section">
      <text class="progress-text">再消费 0 元可升至铜牛会员</text>
      <button class="btn-outline">查看权益</button>
    </view>

    <!-- 2. 常用功能 (3列布局) -->
    <view class="section-box">
      <view class="section-title">常用功能</view>
      <view class="grid-3">
        <view
            v-for="(item, index) in commonFuncs"
            :key="index"
            class="grid-item"
            @click="handleJump(item.title)"
        >
          <text class="grid-icon">{{ item.icon }}</text>
          <text class="grid-text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <!-- 3. 会员特权 (4列布局) -->
    <view class="section-box">
      <view class="section-title">会员特权</view>
      <view class="grid-4">
        <view
            v-for="(item, index) in privileges"
            :key="index"
            class="grid-item"
            @click="handleJump(item.title)"
        >
          <text class="grid-icon">{{ item.icon }}</text>
          <text class="grid-text">{{ item.title }}</text>
        </view>
      </view>
    </view>

    <!-- 4. 其他菜单 (列表布局) -->
    <view class="section-box">
      <view class="section-title">其他</view>
      <view class="list-group">
        <view
            v-for="(item, index) in menuList"
            :key="index"
            class="list-item"
            @click="handleJump(item.title)"
        >
          <view class="list-left">
            <text class="list-icon">{{ item.icon }}</text>
            <text class="list-text">{{ item.title }}</text>
          </view>
          <text class="arrow-icon">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 页面背景 */
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40rpx;
}

/* 1. 顶部卡片样式 */
.vip-card-bg {
  background: linear-gradient(180deg, #ffefe6 0%, #f7f8fa 100%);
  padding: 30rpx 30rpx 0 30rpx;
}

.vip-card {
  background: linear-gradient(135deg, #fcdcb8 0%, #f5c29d 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  color: #5a3e2b;
  box-shadow: 0 4rpx 12rpx rgba(245, 194, 157, 0.4);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.level-name {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.card-no {
  font-size: 24rpx;
  opacity: 0.8;
}



.assets-row {
  display: flex;
  justify-content: space-between;
  text-align: center;
}

.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.num {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.label {
  font-size: 24rpx;
  opacity: 0.8;
}


.progress-section {
  background-color: #fff;
  margin-top: -20rpx;
  border-radius: 0 0 20rpx 20rpx;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
}

.btn-outline {
  font-size: 24rpx;
  color: #c48b5e;
  border: 1rpx solid #c48b5e;
  border-radius: 30rpx;
  padding: 0 20rpx;
  line-height: 46rpx;
  height: auto;
  background: transparent;
}

/* 通用区块样式 */
.section-box {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  border-left: 6rpx solid #c48b5e;
  padding-left: 16rpx;
  line-height: 1;
}

/* 网格布局 */
.grid-3 {
  display: flex;
  justify-content: space-around;
}

.grid-4 {
  display: flex;
  justify-content: space-between;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.grid-text {
  font-size: 26rpx;
  color: #333;
}

/* 列表布局 */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.list-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.list-left {
  display: flex;
  align-items: center;
}

.list-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}


.list-text {
  font-size: 28rpx;
  color: #333;
}

.arrow-icon {
  font-size: 36rpx;
  color: #ccc;
}
</style>