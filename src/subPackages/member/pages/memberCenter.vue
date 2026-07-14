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
  { title: '充值', iconPath: '/static/images/member/recharge.png' },
  { title: '购买会员权益', iconPath: '/static/images/member/buy-rights.png' },
  { title: '付费权益卡', iconPath: '/static/images/member/paid-card.png' }
];

// 会员特权列表配置
const privileges = [
  { title: '会员优享价', iconPath: '/static/images/member/priv-price.png' },
  { title: '消费赠积分', iconPath: '/static/images/member/gift-points.png' },
  { title: '积分抵现', iconPath: '/static/images/member/points-cash.png' },
  { title: '生日有礼', iconPath: 'subPackages\\member\\static\\birthday-gift.png' }
];

// 底部菜单列表配置
const menuList = [
  { title: '会员信息', iconPath: '/static/images/member/info.png' },
  { title: '密码设置', iconPath: '/static/images/member/password.png' },
  { title: '交易记录', iconPath: '/static/images/member/records.png' },
  { title: '适用门店', iconPath: '/static/images/member/stores.png' },
  { title: '会员卡说明', iconPath: 'subPackages\\member\\static\\desc.png' }
];

// 简单的跳转逻辑占位
const handleJump = (title: string) => {
  console.log('点击了：', title);

};
</script>

<template>
  <!-- ✅ 修复 1：补上最外层的根节点 container -->
  <view class="container">
    <!-- ✅ 修复 2：补上顶部背景包裹层 vip-card-bg -->
    <view class="vip-card-bg">
      <view class="vip-card">
        <view class="card-top">
          <view class="user-info">
            <text class="level-name">{{ userInfo.levelName }}</text>
            <text class="card-no">{{ userInfo.cardNo }}</text>
          </view>
          <image
              class="qr-icon"
              src="/static/images/member/qr-code.png"
              mode="aspectFit"
          />
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
          <view class="asset-item" @click="handleJump('礼品卡')">
            <text class="num">{{ userInfo.giftCards }}</text>
            <text class="label">礼品卡</text>
          </view>
        </view>
      </view> <!-- ✅ 修复 3：这里正确闭合 vip-card -->
    </view> <!-- ✅ 修复 4：这里正确闭合 vip-card-bg -->

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
          <image class="grid-icon" :src="item.iconPath" mode="aspectFit" />
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
          <image class="grid-icon" :src="item.iconPath" mode="aspectFit" />
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
            <image class="list-icon" :src="item.iconPath" mode="aspectFit" />
            <text class="list-text">{{ item.title }}</text>
          </view>
          <image class="arrow-icon" src="C:\Users\25927\IdeaProjects\miniprogram-vue\src\subPackages\member\static\images\arrow-right.png" mode="aspectFit" />
        </view>
      </view>
    </view>
  </view> <!-- ✅ 修复 5：正确闭合最外层 container -->
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

.qr-icon {
  width: 48rpx;
  height: 48rpx;
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
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
  background-color: #f0f0f0;
  border-radius: 50%;
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
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
  background-color: #f0f0f0;
}

.list-text {
  font-size: 28rpx;
  color: #333;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.5;
}
</style>