<template>
  <view class="container">
    <!-- 1. 顶部背景区域 -->
    <view class="header-bg">
      <image src="/static/images/header-full.png" mode="widthFix" class="header-img"></image>
    </view>

    <!-- 2. 主要内容区域 -->
    <view class="main-content">
      <!-- 会员信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <!-- 头像点击跳转 -->
          <image src="/static/images/avatar.png" class="avatar" mode="aspectFill" @click="goToMemberCenter"></image>
          <view class="info-text">
            <view class="greeting">
              Hi 你好
              <!-- 会员等级点击跳转 -->
              <text class="vip-tag" @click="goToMemberCenter">六品王VIP卡·铁牛会员</text>
            </view>
            <view class="stats">
              <text @click="handleJump('balance')">余额 {{ userInfo.balance }}</text>
              <text @click="handleJump('points')">积分 {{ userInfo.points }}</text>
              <text @click="handleJump('coupons')">优惠券 {{ userInfo.couponNum }}</text>
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

      <!-- 占位符 -->
      <view style="height: 100rpx;"></view>
    </view>
  </view>
</template>
<script setup>
import {onMounted, ref} from "vue";

const title = ref("")
import request from "@/util/request";

// 用户信息（后端赋值，不再写死）
const userInfo = ref({
  username: "",
  vipName: "",
  balance: 0,
  points: 0,
  couponNum: 0
});


const gridList = ref([
  { name: '会员储值', icon: '💳', url: '/subPackages/member/recharge' },
  { name: '团餐', icon: '🍱', url: '/pages/index/grid/groupMeal' },
  { name: '积分商城', icon: '🎁', url: '/pages/index/grid/pointsMall' },
  { name: '积分大转盘', icon: '🎡', url: '/pages/index/grid/wheel' }
]);

// 页面加载
onMounted(async () => {
  // 1. 判断是否登录，无token直接跳登录
  const token = uni.getStorageSync("token");
  if (!token) {
    await uni.redirectTo({url: "/pages/my/login"});
    return;
  }
  // 2. 请求后端获取当前登录用户信息接口
  await getUserData();
});

// 请求后端用户信息接口
const getUserData = async () => {
  try {
    const res = await request("/api/user/getUserInfo", "GET");
    if (res.code === 200) {
      userInfo.value.username = res.data.username;
      userInfo.value.vipName = res.data.vipName;
      userInfo.value.balance = res.data.balance;
      userInfo.value.points = res.data.points;
      userInfo.value.couponNum = res.data.couponNum;
    } else if (res.code === 401) {
      uni.clearStorageSync("token");
      uni.redirectTo({ url: "/pages/my/login" });
    }
  } catch (err) {
    uni.showToast({ title: "获取用户信息失败", icon: "none" });
    console.error("用户接口异常：", err);
  }
};

// 跳转逻辑
const handleJump = (type) => {
  console.log('触发跳转类型:', type);

  switch (type) {
    case 'balance': // 余额 -> 充值界面
      uni.navigateTo({
        url: '/subPackages/member/recharge'
      });
      break;

    case 'dineIn': // 堂食 -> 底部点餐Tab
      uni.switchTab({
        url: '/pages/order/order'
      });
      break;

    case 'points': // 积分
      uni.navigateTo({
        url: '/subPackages/member/points'
      });
      break;

    case 'coupons': // 优惠券
      uni.navigateTo({
        url: '/subPackages/member/coupons'
      });
      break;

    default:
      break;
  }
};

// 金刚区跳转
const handleGridClick = (item) => {
  if (item.url) {
    uni.navigateTo({
      url: item.url,
      fail: (err) => {
        console.error('跳转失败，请检查路径:', item.url, err);
        uni.showToast({ title: '页面正在开发中', icon: 'none' });
      }
    });
  }
};

const goToMemberCenter = () => {
  uni.navigateTo({
    url: '/subPackages/member/memberCenter'
  });
};

</script>

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