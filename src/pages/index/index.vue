<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

// 1. 定义响应式的用户信息对象（初始为空）
const userInfo = ref(null);

// 2. 定义金刚区数据（不依赖登录状态，可以一直显示）
const gridList = ref([
  { name: '会员储值', icon: '💳', url: '/subPackages/member/recharge' },
  { name: '团餐', icon: '🍱', url: '/pages/index/grid/groupMeal' },
  { name: '积分商城', icon: '🎁', url: '/pages/index/grid/pointsMall' },
  { name: '积分大转盘', icon: '🎡', url: '/pages/index/grid/wheel' }
]);

// 3. 每次页面显示时，检查登录状态并加载数据
onShow(() => {
  // 从本地缓存读取用户信息
  const savedUser = uni.getStorageSync('user_info');

  if (savedUser) {
    userInfo.value = savedUser;

    // 顺便把缓存里的余额也同步一下
    const savedBalance = uni.getStorageSync('user_balance');
    if (savedBalance) {
      userInfo.value.balance = Number(savedBalance);
    }
  } else {
    userInfo.value = null; // 没登录就置空
  }
});

// 4. 跳转逻辑
const handleJump = (type) => {
  // 如果没登录，点击任何需要登录的功能，都强制跳转到“我的”页面去登录
  if (!userInfo.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.switchTab({ url: '/pages/my/my' }); // 假设你的“我的”页面路径是这个
    return;
  }

  switch (type) {
    case 'balance':
      uni.navigateTo({ url: '/subPackages/member/recharge' });
      break;
    case 'dineIn':
      uni.switchTab({ url: '/pages/order/order' });
      break;
    case 'points':
      uni.navigateTo({ url: '/subPackages/member/points' });
      break;
    case 'coupons':
      uni.navigateTo({ url: '/subPackages/member/coupons' });
      break;
  }
};

// 5. 金刚区跳转
const handleGridClick = (item) => {
  if (item.url) {
    uni.navigateTo({
      url: item.url,
      fail: () => uni.showToast({ title: '页面正在开发中', icon: 'none' })
    });
  }
};

// 6. 跳转会员中心
const goToMemberCenter = () => {
  uni.navigateTo({ url: '/subPackages/member/memberCenter' });
};
</script>

<template>
  <view class="container">
    <!-- 1. 顶部背景区域 -->
    <view class="header-bg">
      <image src="/static/images/header-full.png" mode="widthFix" class="header-img"></image>
    </view>

    <!-- 2. 主要内容区域 -->
    <view class="main-content">

      <!-- 【核心修改】条件渲染：如果没登录，显示未登录卡片 -->
      <view class="user-card" v-if="!userInfo">
        <view class="user-info">
          <image src="/static/images/avatar.png" class="avatar" mode="aspectFill"></image>
          <view class="info-text">
            <view class="greeting">
              <text>您好，欢迎来到本店</text>
            </view>
            <view class="login-btn" @click="handleJump('balance')">
              <text>点击登录 / 注册</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 【核心修改】条件渲染：如果已登录，显示正常的会员信息卡片 -->
      <view class="user-card" v-else>
        <view class="user-info">
          <image
              :src="userInfo.avatar || '/static/images/avatar.png'"
              class="avatar"
              mode="aspectFill"
              @click="goToMemberCenter"
          ></image>
          <view class="info-text">
            <view class="greeting">
              <text>Hi 你好</text>
              <text class="vip-tag" @click="goToMemberCenter">{{ userInfo.vipName || '普通会员' }}</text>
            </view>
            <view class="stats">
              <text @click="handleJump('balance')">余额 {{ userInfo.balance?.toFixed(2) }}</text>
              <text @click="handleJump('points')">积分 {{ userInfo.points }}</text>
              <text @click="handleJump('coupons')">优惠券 {{ userInfo.coupons }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 核心功能区 (堂食/会员) -->
      <view class="core-actions">
        <view class="action-item large" @click="handleJump('dineIn')">
          <text class="action-icon">🍽️</text>
          <text class="action-title">堂食/自提</text>
          <text class="action-desc">手机点餐免排队</text>
        </view>
        <view class="action-item large" @click="goToMemberCenter">
          <text class="action-icon">💳</text>
          <text class="action-title">会员中心</text>
          <text class="action-desc">储值优惠</text>
        </view>
      </view>

      <!-- 金刚区 (四个小图标) -->
      <view class="grid-menu">
        <view class="grid-item" v-for="(item, index) in gridList" :key="index" @click="handleGridClick(item)">
          <text class="grid-icon">{{ item.icon }}</text>
          <text>{{ item.name }}</text>
        </view>
      </view>

      <view style="height: 100rpx;"></view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
$theme-pink: #f8dce4;
$theme-red: #e63a46;
$text-dark: #333;
$text-gray: #999;

.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  box-sizing: border-box;
}

.header-bg {
  height: 450rpx;
  background-color: #fbbecc;
  background-image: linear-gradient(180deg, #fab9c8 50%, #ffeff3 100%);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80rpx;
}

.header-img { width: 100%; display: block; }

.main-content {
  padding: 0 24rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  margin-bottom: 24rpx;
  .login-btn {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #fff;
    background-color: $theme-red;
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    display: inline-block;
    width: fit-content;

    &:active {
      opacity: 0.8;
    }}
  .user-info {
    display: flex;
    align-items: center;
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: #eee;
      margin-right: 20rpx;
    }
    .info-text { display: flex; flex-direction: column; }
    .greeting {
      font-size: 28rpx;
      color: $text-dark;
      margin-bottom: 10rpx;
      .vip-tag {
        background: #ffd700;
        color: #5a3e00;
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 6rpx;
        margin-left: 10rpx;
      }
    }
    .stats {
      font-size: 24rpx;
      color: $text-gray;
      text {
        margin-right: 20rpx;
        &:active { color: $theme-red; }
      }
    }
  }
}

.core-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
  .action-item {
    width: 48%;
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
    &:active {
      background-color: #fafafa;
      transform: scale(0.98);
      transition: all 0.2s;
    }
    .action-icon {
      font-size: 72rpx;
      line-height: 1;
      margin-bottom: 16rpx;
    }
    .action-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-dark;
      margin-bottom: 8rpx;
    }
    .action-desc {
      font-size: 22rpx;
      color: $text-gray;
    }
  }
}

.grid-menu {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 0;
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 24rpx;
    color: $text-dark;
    transition: opacity 0.2s;
    &:active { opacity: 0.6; }
    .grid-icon {
      font-size: 52rpx;
      line-height: 1;
      margin-bottom: 12rpx;
    }
  }
}
</style>