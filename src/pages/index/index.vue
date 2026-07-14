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
              <text @click="handleJump('balance')">余额 0</text>
              <text @click="handleJump('points')">积分 0</text>
              <text @click="handleJump('coupons')">优惠券 0</text>
            </view>
          </view>
        </view>

        <!-- ✅ 修复：这里 @click 前面补上了一个空格 -->
        <view class="qr-code" @click="goToMemberCode">
          <image src="/static/images/qrcode-icon.png" mode="widthFix" style="width: 40rpx;"></image>
          <text>会员码</text>
        </view>
      </view>

      <!-- 核心功能区 (堂食/会员) -->
      <view class="core-actions">
        <view class="action-item large" @click="handleJump('dineIn')">
          <image src="/static/images/icon-eat.png" class="action-icon" mode="widthFix"></image>
          <text class="action-title">堂食/自提</text>
          <text class="action-desc">手机点餐免排队</text>
        </view>

        <view class="action-item large" @click="goToMemberCenter">
          <image src="/static/images/icon-member.png" class="action-icon" mode="widthFix"></image>
          <text class="action-title">会员中心</text>
          <text class="action-desc">储值优惠</text>
        </view>
      </view>

      <!-- 金刚区 (四个小图标) -->
      <view class="grid-menu">
        <view class="grid-item" v-for="(item, index) in gridList" :key="index" @click="handleGridClick(item)">
          <image :src="item.icon" class="grid-icon" mode="widthFix"></image>
          <text>{{ item.name }}</text>
        </view>
      </view>

      <!-- 营销活动 Banner (暖心行动) -->
      <view class="promo-section">
        <image src="/static/images/banner-promo.png" mode="widthFix" class="promo-img" @click="goToActivity"></image>
      </view>

      <!-- 底部广告 (诚邀加盟) -->
      <view class="bottom-ad">
        <image src="/static/images/ad-join.png" mode="widthFix" class="ad-img" @click="goToJoin"></image>
      </view>

      <!-- 占位符 -->
      <view style="height: 100rpx;"></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// ✅ 注意：如果会员储值也移到了分包，记得把这里的 url 也改成 /subPackages/member/recharge
const gridList = ref([
  { name: '会员储值', icon: '/static/images/grid-1.png', url: '/subPackages/member/recharge' },
  { name: '团餐', icon: '/static/images/grid-2.png', url: '/pages/index/grid/groupMeal' },
  { name: '积分商城', icon: '/static/images/grid-3.png', url: '/pages/index/grid/pointsMall' },
  { name: '积分大转盘', icon: '/static/images/grid-4.png', url: '/pages/index/grid/wheel' }
]);

const handleJump = (type) => {
  console.log('触发跳转类型:', type);

  switch (type) {
    case 'balance': // 余额 -> 充值界面
      uni.navigateTo({
        url: '/subPackages/member/recharge' // ✅ 更新分包路径
      });
      break;

    case 'dineIn': // 堂食 -> 底部点餐界面 (假设是TabBar页)
      uni.switchTab({
        url: '/pages/index/order'
      });
      break;

    case 'points': // 积分
      uni.navigateTo({
        url: '/subPackages/member/points' // ✅ 更新分包路径
      });
      break;

    case 'coupons': // 优惠券
      uni.navigateTo({
        url: '/subPackages/member/coupons' // ✅ 更新分包路径
      });
      break;

    default:
      break;
  }
};

// 通用跳转方法 (金刚区)
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

// ✅ 更新分包路径
const goToMemberCode = () => {
  uni.navigateTo({
    url: '/subPackages/member/qrcode'
  });
};

// ✅ 更新分包路径
const goToMemberCenter = () => {
  uni.navigateTo({
    url: '/subPackages/member/memberCenter'
  });
};

const goToActivity = () => {
  uni.navigateTo({
    url: '/pages/index/activity/activity'
  });
};

const goToJoin = () => {
  uni.navigateTo({
    url: '/pages/index/join/join'
  });
};
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
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
      width: 80rpx; height: 80rpx; border-radius: 50%; background-color: #eee; margin-right: 20rpx;
    }
    .info-text { display: flex; flex-direction: column; }
    .greeting {
      font-size: 28rpx; color: $text-dark; margin-bottom: 10rpx;
      .vip-tag {
        background: #ffd700; color: #5a3e00; font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 6rpx; margin-left: 10rpx;
      }
    }
    .stats {
      font-size: 24rpx; color: $text-gray;
      text {
        margin-right: 20rpx;
        &:active { color: $theme-red; }
      }
    }
  }

  .qr-code {
    text-align: center; font-size: 22rpx; color: $text-dark;
    image { display: block; margin: 0 auto 6rpx; }
    &:active { opacity: 0.7; }
  }
}

.core-actions {
  display: flex; justify-content: space-between; margin-bottom: 24rpx;
  .action-item {
    width: 48%; background: #fff; border-radius: 20rpx; padding: 30rpx 0; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
    &:active { background-color: #fafafa; transform: scale(0.98); transition: all 0.2s; }

    .action-icon { width: 120rpx; height: 120rpx; margin-bottom: 16rpx; }
    .action-title { font-size: 32rpx; font-weight: bold; color: $text-dark; margin-bottom: 8rpx; }
    .action-desc { font-size: 22rpx; color: $text-gray; }
  }
}

.grid-menu {
  background: #fff; border-radius: 20rpx; padding: 30rpx 0; display: flex; justify-content: space-around; margin-bottom: 24rpx;
  .grid-item {
    display: flex; flex-direction: column; align-items: center; font-size: 24rpx; color: $text-dark;
    .grid-icon { width: 60rpx; height: 60rpx; margin-bottom: 12rpx; }
    transition: opacity 0.2s;
    &:active { opacity: 0.6; }
  }
}

.promo-section { margin-bottom: 24rpx; .promo-img { width: 100%; display: block; border-radius: 20rpx; } }
.bottom-ad { border-radius: 20rpx; overflow: hidden; margin-bottom: 20rpx; .ad-img { width: 100%; display: block; } }
</style>