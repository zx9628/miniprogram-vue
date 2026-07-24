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
        <image class="avatar" :src="userInfo?.avatar || '/static/cow.png'" mode="aspectFill" />
        <view class="user-info">
          <text class="username">{{ userInfo?.nickname || '微信用户' }}</text>
          <text class="sub-text">{{ userInfo ? '注册会员尊享更多专属特权' : '注册/登录' }}</text>
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

// 用户信息接口
interface UserInfo {
  userId: number;
  openId: string;
  nickname: string;
  avatar: string;
  phoneMasked: string;
  gender: number;
  points: number;
  balance: string;
  birthday: string;
  couponCount?: number; // 前端本地维护的字段
}

const userInfo = ref<UserInfo | null>(null);
const showPhoneAuth = ref(false);
const loadingPhone = ref(false);
const showLoginMask = ref(false);

const menuList = [
  { name: '我的订单', icon: '📄', path: '/pages/order/orderList' },
  { name: '隐私设置', icon: '🔒', path: '/pages/my/privacy' },
  { name: '会员信息', icon: '💳', path: '/pages/my/information' },
  { name: '账号绑定管理', icon: '🔗', path: '' },
  { name: '切换账号', icon: '↩️', path: '' }
];

// ========== 核心：从后端获取用户信息 ==========
const fetchUserInfo = (userId: number) => {
  if (!userId) {
    console.warn('用户ID为空，无法获取用户信息');
    return;
  }

  uni.request({
    url: `http://localhost:8081/api/user/get/${userId}`,
    method: 'GET',
    success: (res: any) => {
      console.log('获取用户信息响应:', JSON.stringify(res.data));

      if (res.data.code === 200 && res.data.data) {
        const data = res.data.data;

        // 保留原有的 couponCount（如果存在）
        const existingCouponCount = userInfo.value?.couponCount || 0;

        // 更新用户信息，只更新后端返回的字段，保留前端维护的字段
        const updatedInfo = {
          userId: data.userId || userInfo.value?.userId || 0,
          openId: data.openId || userInfo.value?.openId || '',
          nickname: data.nickname || '微信用户',
          avatar: data.avatar || '/static/cow.png',
          phoneMasked: data.phoneMasked || '',
          gender: data.gender !== undefined ? data.gender : 0,
          points: data.points !== undefined ? data.points : 0,
          balance: data.balance || '0.00',
          birthday: data.birthday || '',
          couponCount: existingCouponCount // 保留原有的优惠券数量
        };

        userInfo.value = updatedInfo;
        // 更新缓存
        uni.setStorageSync('userInfo', updatedInfo);
        console.log('用户信息已更新:', updatedInfo);
      } else {
        console.warn('获取用户信息失败:', res.data.msg);
      }
    },
    fail: (err) => {
      console.error('获取用户信息请求失败:', err);
    }
  });
};

// ========== 页面显示时加载用户信息 ==========
onShow(() => {
  const stored = uni.getStorageSync('userInfo');
  console.log('缓存中的用户信息:', stored);

  if (stored && typeof stored === 'object') {
    // 兼容多种字段名
    const userId = stored.userId || stored.id;

    if (!userId) {
      console.warn('缓存的用户信息缺少 userId，清除缓存');
      uni.removeStorageSync('userInfo');
      userInfo.value = null;
      return;
    }

    // 确保数据结构完整
    const userData = {
      userId: Number(userId),
      openId: stored.openId || stored.openid || '',
      nickname: stored.nickname || '微信用户',
      avatar: stored.avatar || '/static/cow.png',
      phoneMasked: stored.phoneMasked || '',
      gender: stored.gender !== undefined ? Number(stored.gender) : 0,
      points: Number(stored.points) || 0,
      balance: stored.balance || '0.00',
      birthday: stored.birthday || '',
      couponCount: Number(stored.couponCount) || 0
    };

    userInfo.value = userData;

    // 如果有 userId，从后端获取最新数据
    if (userId) {
      fetchUserInfo(Number(userId));
    }
  } else {
    userInfo.value = null;
  }
});

// 点击用户卡片
const handleUserClick = () => {
  if (!userInfo.value) {
    showLoginMask.value = true;
  }
};

// 微信一键登录
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
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { code: loginRes.code },
        success: (res: any) => {
          uni.hideLoading();
          console.log('登录响应:', res.data);

          if (res.data.code === 200) {
            const userData = res.data.data;

            // 确保数据结构完整
            const formattedData = {
              userId: Number(userData.userId || userData.id || 0),
              openId: userData.openId || userData.openid || '',
              nickname: userData.nickname || '微信用户',
              avatar: userData.avatar || '/static/cow.png',
              phoneMasked: userData.phoneMasked || '',
              gender: userData.gender !== undefined ? Number(userData.gender) : 0,
              points: Number(userData.points) || 0,
              balance: userData.balance || '0.00',
              birthday: userData.birthday || '',
              couponCount: Number(userData.couponCount) || 0
            };

            // 保存用户信息到缓存
            uni.setStorageSync('userInfo', formattedData);
            if (formattedData.openId) {
              uni.setStorageSync('openid', formattedData.openId);
            }

            // 更新页面
            userInfo.value = formattedData;

            // 判断是否有手机号
            if (!formattedData.phoneMasked) {
              showPhoneAuth.value = true;
            } else {
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

// 手机号授权
const onGetPhoneNumber = (e: any) => {
  console.log('手机号授权事件:', e);
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '授权已取消', icon: 'none' });
    return;
  }

  const phoneCode = e.detail.code;
  const openid = uni.getStorageSync('openid');

  if (!openid) {
    uni.showToast({ title: '登录信息缺失，请重新登录', icon: 'none' });
    showLoginMask.value = false;
    return;
  }

  loadingPhone.value = true;
  uni.request({
    url: 'http://localhost:8081/api/login/bindPhone',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data: {
      openid: openid,
      code: phoneCode
    },
    success: (res: any) => {
      loadingPhone.value = false;
      if (res.data.code === 200) {
        // 绑定成功，重新获取用户信息
        const updatedUser = res.data.data;
        const formattedData = {
          userId: Number(updatedUser.userId || updatedUser.id || 0),
          openId: updatedUser.openId || updatedUser.openid || '',
          nickname: updatedUser.nickname || '微信用户',
          avatar: updatedUser.avatar || '/static/cow.png',
          phoneMasked: updatedUser.phoneMasked || '',
          gender: updatedUser.gender !== undefined ? Number(updatedUser.gender) : 0,
          points: Number(updatedUser.points) || 0,
          balance: updatedUser.balance || '0.00',
          birthday: updatedUser.birthday || '',
          couponCount: userInfo.value?.couponCount || 0
        };
        uni.setStorageSync('userInfo', formattedData);
        userInfo.value = formattedData;
        showLoginMask.value = false;
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

// 关闭遮罩
const closeMask = () => {
  if (showPhoneAuth.value) {
    showPhoneAuth.value = false;
  }
  showLoginMask.value = false;
};

// 管理员登录跳转
const goAdminLogin = () => {
  showLoginMask.value = false;
  uni.navigateTo({ url: '/pages/my/login' });
};

// 跳转页面
const goToPage = (path: string) => {
  if (!userInfo.value) {
    showLoginMask.value = true;
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
            uni.removeStorageSync('openid');
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
/* ... 样式保持不变 ... */
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

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

.main-content {
  margin-top: -60rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

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

.phone-login-area {
  padding: 20rpx 0;
}

.phone-login-text {
  font-size: 28rpx;
  color: #a84c38;
  text-decoration: underline;
}
</style>