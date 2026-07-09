<template>
  <view class="container">
    <!-- 1. 顶部粉色背景区域 -->
    <view class="header-bg">
      <view class="slogan-small">100%牛肉原汤更健康</view>
      <view class="slogan-large">牛肉粉就吃六品王</view>
    </view>

    <!-- 2. 主体内容区域 -->
    <view class="main-content">
      <!-- 用户信息卡片 -->
      <view class="card user-card" @click="handleUserClick">
        <image class="avatar" src="/static/cow.png" mode="aspectFill" />
        <view class="user-info">
          <!-- 已登录：显示手机号 -->
          <text v-if="userInfo" class="username">{{ userInfo.phone }}</text>
          <!-- 未登录：显示注册/登录 -->
          <text v-else class="username">注册/登录</text>
          <text class="sub-text">注册会员尊享更多专属特权</text>
        </view>
      </view>

      <!-- 优惠券 / 余额 / 积分 -->
      <view v-if="userInfo" class="card stats-card">
        <view class="stat-item" @click="goToPage('/pages/my/coupon')">
          <text class="stat-value">{{ userInfo.couponCount || 0 }}</text>
          <text class="stat-label">优惠券</text>
        </view>
        <view class="stat-item" @click="goToPage('/pages/my/balance')">
          <text class="stat-value">{{ userInfo.balance || '0.00' }}</text>
          <text class="stat-label">余额(元)</text>
        </view>
        <view class="stat-item" @click="goToPage('/pages/my/points')">
          <text class="stat-value">{{ userInfo.points || 0 }}</text>
          <text class="stat-label">积分</text>
        </view>
      </view>

      <!-- 菜单列表卡片 -->
      <view class="card menu-card">
        <view
            v-for="(item, index) in menuList"
            :key="index"
            class="menu-item"
            @click="handleMenuClick(item)"
        >
          <!-- 左侧图标区域 -->
          <view class="icon-box">
            <text class="menu-icon">{{ item.icon }}</text>
          </view>
          <text class="menu-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 底部电话栏 -->
      <view class="footer-banner">
        <image class="mascot" src="/static/waiter.png" mode="aspectFit" />
        <view class="banner-text">
          <text class="banner-title">投诉及建议 7*24小时电话</text>
          <text class="banner-phone">4001616833-3</text>
        </view>
      </view>

      <!-- 底部占位，防止内容被TabBar遮挡 -->
      <view style="height: 50rpx;"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {onShow} from "@dcloudio/uni-app";

// 用户信息
const userInfo = ref<any>(null);

// 为了还原图片，我添加了Emoji作为图标占位，你可以后续替换为 image 标签
const menuList = [
  { name: '我的订单', icon: '📄', path: '/pages/order/order' },
  { name: '隐私设置', icon: '🔒', path: '' },
  { name: '会员信息', icon: '💳', path: '' },
  { name: '账号绑定管理', icon: '🔗', path: '' },
  { name: '切换账号', icon: '↩️', path: '/pages/my/login' }
];

// 页面显示时检查登录状态
onShow(() => {
  const stored = uni.getStorageSync('userInfo');
  userInfo.value = stored || null;
});

// 点击用户卡片
const handleUserClick = () => {
  if (!userInfo.value) {
    // 未登录，跳转登录页
    uni.navigateTo({ url: '/pages/my/login' });
  }
};

// 跳转页面
const goToPage = (path: string) => {
  if (!userInfo.value) {
    uni.navigateTo({ url: '/pages/my/login' });
    return;
  }
  uni.navigateTo({ url: path });
};

// 菜单点击处理
const handleMenuClick = (item: any) => {
  console.log('点击了菜单:', item.name);

  if (item.path === '/pages/my/login') {
    // 切换账号：清除登录状态，跳转登录页
    uni.removeStorageSync('userInfo');
    userInfo.value = null;
    uni.navigateTo({ url: '/pages/my/login' });
    return;
  }

  // 会员信息需要登录才能访问
  if (item.name === '会员信息' && !userInfo.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  if (!item.path) {
    uni.navigateTo({ url: '/pages/my/information' });
    return;
  }

  const tabBarPages = ['/pages/index/index', '/pages/cart/cart', '/pages/order/order', '/pages/my/my'];

  if (tabBarPages.includes(item.path)) {
    uni.switchTab({
      url: item.path,
      fail: (err) => {
        console.error('跳转失败:', err);
        uni.showToast({ title: '页面不存在', icon: 'none' });
      }
    });
  } else {
    uni.navigateTo({
      url: item.path,
      fail: (err) => {
        console.error('跳转失败:', err);
        uni.showToast({ title: '页面不存在', icon: 'none' });
      }
    });
  }
};
</script>

<style scoped>
/* 页面整体背景 */
.container {
  min-height: 100vh;
  background-color: #f7f8fa; /* 极淡的灰色背景 */
}

/* 顶部背景区域 */
.header-bg {
  height: 250rpx;
  background: linear-gradient(180deg, #ffeaec 0%, #ffc6ce 100%);

  /* --- 核心修改 --- */
  display: flex;
  flex-direction: column; /* 保持垂直排列 */
  align-items: center;    /* 【横向居中】关键属性 */
  justify-content: flex-start; /* 【贴住上部】从顶部开始排列 */
  padding-top: 40rpx;     /* 给顶部留一点呼吸空间，避免文字顶死边框 */
}

.slogan-small {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.slogan-large {
  font-size: 54rpx;
  font-weight: 900;
  color: #000;
}

/* 2. 主体内容区域 */
.main-content {
  margin-top: -60rpx; /* 向上偏移，产生重叠效果 */
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
}

/* 通用卡片样式 */
.card {
  background: #fff;
  border-radius: 24rpx; /* 圆角更大一点 */
  margin-bottom: 24rpx;
  /* 阴影非常淡 */
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* 用户卡片特定样式 */
.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx;
}

.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  margin-right: 30rpx;
  background-color: #fce4ec; /* 头像占位色 */
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.username {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.sub-text {
  font-size: 24rpx;
  color: #999;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 36rpx 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 900;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

/* 菜单列表特定样式 */
.menu-card {
  padding: 0 10rpx; /* 左右留一点内边距给分割线 */
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 35rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5; /* 极淡的分割线 */
}

.menu-item:last-child {
  border-bottom: none;
}

.icon-box {
  width: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
}

.menu-icon {
  font-size: 32rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}

/* 3. 底部电话栏 (重点修改) */
.footer-banner {
  background: #ffeef0; /* 浅粉色背景 */
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 50rpx;
  /* 去掉阴影，或者保留很淡的 */
  box-shadow: none;
}

.mascot {
  width: 90rpx;
  height: 90rpx;
  margin-right: 24rpx;
}

.banner-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-title {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.banner-phone {
  font-size: 40rpx; /* 电话号码很大 */
  font-weight: 900; /* 很粗 */
  color: #333;
  letter-spacing: 1rpx;
}
</style>