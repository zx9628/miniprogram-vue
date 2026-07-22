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
          <text v-if="userInfo" class="username">{{ userInfo.username || '微信用户' }}</text>
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

      <view style="height: 50rpx;"></view>
    </view>

    <!-- 3. 微信一键登录遮罩层 -->
    <view class="login-mask" v-if="showLoginMask" @click="closeMask">
      <view class="mask-content" @click.stop>
        <!-- 关闭按钮 -->
        <view class="mask-close" @click="closeMask">✕</view>

        <!-- 头像及通用说明 -->
        <image class="mask-avatar" src="/static/cow.png" mode="aspectFill" />

        <!-- ===== 步骤1：微信一键登录 ===== -->
        <template v-if="!showPhoneAuth">
          <text class="mask-title">登录后享受更多服务</text>
          <text class="mask-desc">会员专享优惠券、积分、余额等功能</text>
          <button class="wechat-login-btn" @click="wechatLogin">
            微信一键登录
          </button>
          <view class="phone-login-area" @click="goAdminLogin">
            <text class="phone-login-text">管理员登录</text>
          </view>
        </template>

        <!-- ===== 步骤2：手机号授权 ===== -->
        <template v-else>
          <text class="mask-title">授权手机号</text>
          <text class="mask-desc">用于会员信息登记及订单通知</text>
          <button
              class="wechat-login-btn"
              open-type="getPhoneNumber"
              @getphonenumber="onGetPhoneNumber"
              :disabled="loadingPhone"
          >
            {{ loadingPhone ? '绑定中...' : '授权手机号' }}
          </button>
          <view class="phone-login-area" @click="closeMask">
            <text class="phone-login-text">暂不绑定，稍后再说</text>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from "@dcloudio/uni-app";

// 用户信息
const userInfo = ref<any>(null);
// 手机号
const showPhoneAuth = ref(false);   // 是否显示手机号授权界面
const loadingPhone = ref(false);    // 手机号绑定加载状态
// 手机号授权按钮回调
const onGetPhoneNumber = (e: any) => {
  console.log(e)
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '授权已取消', icon: 'none' });
    return;
  }
  const phoneCode = e.detail.code;   // 新版动态 code
  const openid = uni.getStorageSync('openid');
  if (!openid) {
    uni.showToast({ title: '登录信息缺失，请重新登录', icon: 'none' });
    showLoginMask.value = false;
    return;
  }
  loadingPhone.value = true;
  uni.request({
    // url: 'https://zx.juntaitec.cn/wechat/login/bindPhone',   // 后端需提供此接口
    url: 'http://localhost:8081/api/login/bindPhone',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data: {
      openid: openid,
      code: phoneCode
    },
    success: (res) => {
      loadingPhone.value = false;
      if (res.data.code === 200) {
        // 绑定成功，更新用户信息
        const phone = res.data.data;   // 假设接口直接返回手机号字符串
        const newUserInfo = {
          openid,
          username: phone,
          // 其他字段可保留默认值或从后端再次获取
        };
        uni.setStorageSync('userInfo', newUserInfo);
        userInfo.value = newUserInfo;
        showLoginMask.value = false;   // 关闭遮罩
        showPhoneAuth.value = false;
        uni.showToast({ title: '绑定成功' });
      } else {
        uni.showToast({ title: res.data.message || '绑定失败', icon: 'none' });
      }
    },
    fail: () => {
      loadingPhone.value = false;
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
    }
  });
};

// 修改关闭遮罩方法：如果在手机号授权步骤关闭，仅关闭遮罩，不清除登录状态（但用户未绑定手机号）
const closeMask = () => {
  if (showPhoneAuth.value) {
    // 用户跳过手机号绑定，直接关闭，但已拿到 openid，可让用户稍后绑定
    showPhoneAuth.value = false;
  }
  showLoginMask.value = false;
};
// 遮罩层显示状态
const showLoginMask = ref(false);
const menuList = [
  { name: '我的订单', icon: '📄', path: '/pages/order/orderList' },
  { name: '隐私设置', icon: '🔒', path: '' },
  { name: '会员信息', icon: '💳', path: '' },
  { name: '账号绑定管理', icon: '🔗', path: '' },
  { name: '切换账号', icon: '↩️', path: '' }
];
// 页面显示时检查登录状态
onShow(() => {
  const stored = uni.getStorageSync('userInfo');
  userInfo.value = stored || null;
});
// 点击用户卡片
const handleUserClick = () => {
  if (!userInfo.value) {
    showLoginMask.value = true; // 弹出遮罩层
  }
};
// 微信一键登录
// 修改 wechatLogin 方法
const wechatLogin = () => {
  uni.showLoading({ title: '登录中...' });
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      if (!loginRes.code) {
        uni.hideLoading();
        uni.showToast({ title: '获取登录凭证失败', icon: 'none' });
        return;
      }
      uni.request({
        url: 'http://localhost:8081/api/login/wechat',
        // url: 'https://zx.juntaitec.cn/wechat/login/wechat',
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { code: loginRes.code },
        success: (res) => {
          uni.hideLoading();
          console.log(res)
          if (res.data.code === 200) {
            const userData = res.data.data;          // 假设返回 { openid, phone, ... }
            const openid = userData.openId;
            uni.setStorageSync('openid', openid);
            console.log(openid)
            // 核心判断：是否有手机号
            if (!userData.phoneMasked) {
              // 没有手机号 → 切换到手机号授权界面
              showPhoneAuth.value = true;
            } else {
              // 已有手机号 → 直接完成登录
              uni.setStorageSync('userInfo', userData);
              userInfo.value = userData;
              showLoginMask.value = false;
              uni.showToast({ title: '登录成功' });
            }
          } else {
            uni.showToast({ title: res.data.message || '登录失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        }
      });
    },
    fail: (err) => {
      uni.hideLoading();
      console.error('wx.login 失败:', err);
      uni.showToast({ title: '微信登录失败', icon: 'none' });
    }
  });
};


// 跳转手机号登录页
const goAdminLogin = () => {
  showLoginMask.value = false; // 先关闭遮罩层
  uni.navigateTo({ url: '/pages/my/login' });
};

// 跳转页面
const goToPage = (path: string) => {
  if (!userInfo.value) {
    showLoginMask.value = true; // 未登录弹遮罩层
    return;
  }
  uni.navigateTo({ url: path });
};

// 菜单点击处理
const handleMenuClick = (item: any) => {
  if (item.name === '切换账号') {
    if (userInfo.value) {
      uni.showModal({
        title: '提示',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userInfo');
            userInfo.value = null;
            uni.showToast({ title: '已退出登录' });
          }
        }
      });
    } else {
      showLoginMask.value = true;
    }
    return;
  }

  if (item.name === '会员信息' && !userInfo.value) {
    showLoginMask.value = true;
    return;
  }

  if (!item.path) {
    uni.navigateTo({ url: '/pages/my/information' });
    return;
  }

  const tabBarPages = ['/pages/index/index', '/pages/order/orderList', '/pages/order/order', '/pages/my/my'];

  if (tabBarPages.includes(item.path)) {
    uni.switchTab({
      url: item.path,
      fail: () => uni.showToast({ title: '页面不存在', icon: 'none' })
    });
  } else {
    uni.navigateTo({
      url: item.path,
      fail: () => uni.showToast({ title: '页面不存在', icon: 'none' })
    });
  }
};
</script>

<style scoped>
/* 页面整体背景 */
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 顶部背景区域 */
.header-bg {
  height: 250rpx;
  background: linear-gradient(180deg, #ffeaec 0%, #ffc6ce 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40rpx;
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

/* 主体内容区域 */
.main-content {
  margin-top: -60rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
}

/* 通用卡片样式 */
.card {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* 用户卡片 */
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
  background-color: #fce4ec;
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

/* 菜单列表 */
.menu-card {
  padding: 0 10rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 35rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
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

/* 底部电话栏 */
.footer-banner {
  background: #ffeef0;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 50rpx;
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
  font-size: 40rpx;
  font-weight: 900;
  color: #333;
  letter-spacing: 1rpx;
}

/* ===== 微信登录遮罩层样式 ===== */
.login-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.mask-content {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 60rpx 60rpx 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.mask-close {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  font-size: 36rpx;
  color: #999;
  padding: 10rpx 20rpx;
}

.mask-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  margin-bottom: 30rpx;
  background-color: #fce4ec;
}

.mask-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.mask-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 60rpx;
}

/* 微信一键登录按钮 */
.wechat-login-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background-color: #07c160;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  border: none;
  margin-bottom: 30rpx;
}

.wechat-login-btn::after {
  border: none;
}

.wechat-login-btn:active {
  opacity: 0.9;
}

/* 手机号登录 */
.phone-login-area {
  padding: 20rpx 0;
}

.phone-login-text {
  font-size: 28rpx;
  color: #a84c38;
  text-decoration: underline;
}
</style>