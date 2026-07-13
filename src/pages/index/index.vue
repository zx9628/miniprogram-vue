<template>
  <view class="container">
    <!-- 1. 顶部背景区域 -->
    <view class="header-bg">
      <image
          src="/static/images/header-full.png"
          mode="widthFix"
          class="header-img"
      ></image>
    </view>

    <!-- 2. 主要内容区域 -->
    <view class="main-content">
      <!-- 会员信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <!-- 头像点击跳转 -->
          <image
              src="/static/images/avatar.png"
              class="avatar"
              mode="aspectFill"
              @click="goToMemberCenter"
          ></image>
          <view class="info-text">
            <view class="greeting">
              Hi 你好
              <text class="vip-tag" @click="goToMemberCenter">六品王VIP卡·铁牛会员</text>
            </view>
            <view class="stats">
              <text>余额 0</text>
              <text>积分 0</text>
              <text>优惠券 0</text>
            </view>
          </view>
        </view>
        <view class="qr-code">
          <image src="/static/images/qrcode-icon.png" mode="widthFix" style="width: 40rpx;"></image>
          <text>会员码</text>
        </view>
      </view>

      <!-- 核心功能区 (堂食/会员) -->
      <view class="core-actions">
        <view class="action-item large">
          <image src="/static/images/icon-eat.png" class="action-icon" mode="widthFix"></image>
          <text class="action-title">堂食/自提</text>
          <text class="action-desc">手机点餐免排队</text>
        </view>
        <view class="action-item large">
          <image src="/static/images/icon-member.png" class="action-icon" mode="widthFix"></image>
          <text class="action-title"@click="goToMemberCenter">会员中心</text>
          <text class="action-desc">储值优惠</text>
        </view>
      </view>

      <!-- 金刚区 (四个小图标) -->
      <view class="grid-menu">
        <view class="grid-item" v-for="(item, index) in gridList" :key="index">
          <image :src="item.icon" class="grid-icon" mode="widthFix"></image>
          <text>{{ item.name }}</text>
        </view>
      </view>

      <!-- 营销活动 Banner -->
      <view class="promo-section">
        <image
            src="/static/images/banner-promo.png"
            mode="widthFix"
            class="promo-img"
            @click="handleBannerClick"
        ></image>
      </view>

      <!-- 底部广告 -->
      <view class="bottom-ad">
        <image src="/static/images/ad-join.png" mode="widthFix" class="ad-img"></image>
      </view>

      <!-- 占位符，防止内容被TabBar遮挡 -->
      <view style="height: 100rpx;"></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 模拟金刚区数据
const gridList = ref([
  { name: '会员储值', icon: '/static/images/grid-1.png' },
  { name: '团餐', icon: '/static/images/grid-2.png' },
  { name: '积分商城', icon: '/static/images/grid-3.png' },
  { name: '积分大转盘', icon: '/static/images/grid-4.png' }
]);

// 点击头像跳转会员中心
const goToMemberCenter = () => {
  // ⚠️ 注意：请将下面的路径替换为你项目中真实的会员中心页面路径
  uni.navigateTo({
    url: '/pages/member/memberCenter',
  });
};

// 营销Banner点击事件
const handleBannerClick = () => {
  console.log('点击了营销Banner');
  // uni.navigateTo({ url: '/pages/promo/detail' })
};
</script>

<style lang="scss" scoped>
/* 定义主题色 */
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

/* 1. 顶部背景容器 */
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

/* 顶部大图样式 */
.header-img {
  width: 100%;
  display: block;
}

/* 2. 主内容区 */
.main-content {
  padding: 0 24rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

/* 用户卡片 */
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

    .info-text {
      display: flex;
      flex-direction: column;
    }

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
      }
    }
  }

  .qr-code {
    text-align: center;
    font-size: 22rpx;
    color: $text-dark;

    image {
      display: block;
      margin: 0 auto 6rpx;
    }
  }
}

/* 核心操作区 */
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

    .action-icon {
      width: 120rpx;
      height: 120rpx;
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

/* 金刚区 */
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

    .grid-icon {
      width: 60rpx;
      height: 60rpx;
      margin-bottom: 12rpx;
    }
  }
}

/* 营销 Banner */
.promo-section {
  margin-bottom: 24rpx;

  .promo-img {
    width: 100%;
    display: block;
    border-radius: 20rpx;
  }
}

/* 底部广告 */
.bottom-ad {
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;

  .ad-img {
    width: 100%;
    display: block;
  }
}
</style>