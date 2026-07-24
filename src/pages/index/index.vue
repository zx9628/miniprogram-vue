<script setup>
import { ref } from "vue";
import { onShow, onUnload } from "@dcloudio/uni-app";

// 1. 定义响应式的用户信息
const userInfo = ref(null);
const balance = ref(0);
const points = ref(0);
const couponCount = ref(0);
const isLogin = ref(false);

// 2. 金刚区数据
const gridList = ref([
  { name: '会员储值', icon: '💳', url: '/subPackages/member/recharge' },
  { name: '团餐', icon: '🍱', url: '/pages/index/grid/groupMeal' },
  { name: '积分商城', icon: '🎁', url: '/pages/index/grid/pointsMall' },
  { name: '积分大转盘', icon: '🎡', url: '/pages/index/grid/wheel' }
]);

// 3. 加载用户信息（从缓存读取）
const loadUserInfo = () => {
  // 【修复】使用正确的 key：userInfo（不是 user_info）
  const info = uni.getStorageSync('userInfo');

  if (info) {
    userInfo.value = info;
    balance.value = info.balance || 0;
    points.value = info.points || 0;
    couponCount.value = info.couponCount || 0;
    isLogin.value = true;
  } else {
    userInfo.value = null;
    balance.value = 0;
    points.value = 0;
    couponCount.value = 0;
    isLogin.value = false;
  }
};

// 4. 页面显示时加载
onShow(() => {
  loadUserInfo();
});

// 5. 监听登录成功事件（"我的"页面登录后通知）
uni.$on('userInfoUpdated', (data) => {
  console.log('首页收到登录成功事件:', data);
  userInfo.value = data;
  balance.value = data.balance || 0;
  points.value = data.points || 0;
  couponCount.value = data.couponCount || 0;
  isLogin.value = true;
});

// 6. 监听余额更新事件（充值成功后通知）
uni.$on('balanceUpdated', (newBalance) => {
  console.log('首页收到余额更新事件:', newBalance);
  balance.value = newBalance;
  if (userInfo.value) {
    userInfo.value.balance = newBalance;
    uni.setStorageSync('userInfo', userInfo.value);
    uni.setStorageSync('user_balance', newBalance);
  }
});

// 7. 页面卸载时移除监听
onUnload(() => {
  uni.$off('userInfoUpdated');
  uni.$off('balanceUpdated');
});

// 8. 跳转逻辑
const handleJump = (type) => {
  if (!isLogin.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.switchTab({ url: '/pages/my/my' });
    return;
  }

  switch (type) {
    case 'balance':
      uni.navigateTo({ url: '/subPackages/member/recharge' });
      break;
    case 'dineIn':
      uni.switchTab({ url: '/pages/orderFood/orderFood' });
      break;
    case 'points':
      uni.navigateTo({ url: '/subPackages/member/points' });
      break;
    case 'coupons':
      uni.navigateTo({ url: '/subPackages/member/coupons' });
      break;
  }
};

// 9. 金刚区跳转
const handleGridClick = (item) => {
  if (item.url) {
    uni.navigateTo({
      url: item.url,
      fail: () => uni.showToast({ title: '页面正在开发中', icon: 'none' })
    });
  }
};

// 10. 跳转会员中心
const goToMemberCenter = () => {
  if (!isLogin.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.switchTab({ url: '/pages/my/my' });
    return;
  }
  uni.navigateTo({ url: '/subPackages/member/memberCenter' });
};

// 11. 跳转登录
const goToLogin = () => {
  uni.switchTab({ url: '/pages/my/my' });
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

      <!-- 未登录状态 -->
      <view class="user-card" v-if="!isLogin">
        <view class="user-info">
          <image src="/static/images/avatar.png" class="avatar" mode="aspectFill"></image>
          <view class="info-text">
            <view class="greeting">
              <text>您好，欢迎来到本店</text>
            </view>
            <view class="login-btn" @click="goToLogin">
              <text>点击登录 / 注册</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 已登录状态：显示真实用户信息 -->
      <view class="user-card" v-else>
        <view class="user-info">
          <image
              :src="userInfo?.avatar || '/static/images/avatar.png'"
              class="avatar"
              mode="aspectFill"
              @click="goToMemberCenter"
          ></image>
          <view class="info-text">
            <view class="greeting">
              <!-- 【修复】显示真实昵称，不再是写死的 "Hi 你好" -->
              <text>Hi {{ userInfo?.nickname || '会员' }}</text>
              <text class="vip-tag" @click="goToMemberCenter">
                {{ userInfo?.vipName || '普通会员' }}
              </text>
            </view>
            <!-- 【修复】使用响应式的 balance、points、couponCount -->
            <view class="stats">
              <text @click="handleJump('balance')">余额 ¥{{ balance?.toFixed(2) || '0.00' }}</text>
              <text @click="handleJump('points')">积分 {{ points || 0 }}</text>
              <text @click="handleJump('coupons')">优惠券 {{ couponCount || 0 }}</text>
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

      <!-- 金刚区 -->
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
    &:active { opacity: 0.8; }
  }

  .user-info {
    display: flex;
    align-items: center;
    width: 100%;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: #eee;
      margin-right: 20rpx;
      flex-shrink: 0;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .greeting {
      font-size: 28rpx;
      color: $text-dark;
      margin-bottom: 10rpx;
      display: flex;
      align-items: center;

      .vip-tag {
        background: #ffd700;
        color: #5a3e00;
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 6rpx;
        margin-left: 10rpx;
        &:active { opacity: 0.7; }
      }
    }

    .stats {
      font-size: 24rpx;
      color: $text-gray;
      display: flex;

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