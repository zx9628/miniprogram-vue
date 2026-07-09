<template>
  <view class="page">
    <!-- 顶部用户信息头部 -->
    <view class="user-header" @click="goLogin">
      <view class="avatar">
        <text v-if="!isLogin">未登录</text>
        <image v-else class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
      </view>
      <view class="user-info">
        <text class="username" v-if="isLogin">{{ userInfo.nickname }}</text>
        <text class="username tip" v-else>点击登录/注册</text>
        <text class="desc" v-if="isLogin">系统管理员账号</text>
      </view>
      <uni-icons type="right" size="18" color="#c8c9cc"></uni-icons>
    </view>

    <!-- 会员信息卡片 -->
    <view class="card">
      <view class="card-title">会员中心</view>
      <view class="item-row" @click="navTo('member')">
        <text>会员等级与权益</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
    </view>

    <!-- 订单模块 -->
    <view class="card">
      <view class="card-title">我的订单</view>
      <view class="item-row" @click="navTo('orderList')">
        <text>全部订单</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
      <view class="item-row" @click="navTo('payOrder')">
        <text>待付款订单</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
      <view class="item-row" @click="navTo('receiveOrder')">
        <text>待收货订单</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
    </view>

    <!-- 账号管理模块 -->
    <view class="card">
      <view class="card-title">账号管理</view>
      <view class="item-row" @click="navTo('bindAccount')">
        <text>账号绑定管理</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
      <view class="item-row" @click="navTo('privacySet')">
        <text>隐私设置</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
      <view class="item-row" @click="switchAccount">
        <text>切换账号</text>
        <uni-icons type="right" size="16" color="#c8c9cc"></uni-icons>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <button
        v-if="isLogin"
        class="logout-btn"
        type="default"
        @click="logout"
    >
      退出登录
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 登录状态
const isLogin = ref<boolean>(false)

// 用户信息
const userInfo = ref({
  nickname: '',
  avatar: '',
  userId: ''
})

// 页面路径映射表（与 pages.json 中注册的路径保持一致）
const pageMap: Record<string, string> = {
  orderList: '/pages/orderList/orderList',                // 全部订单
  bindAccount: '/pages/my/accountManage/bindAccount',     // 账号绑定管理
  privacySet: '/pages/my/accountManage/privacySet'        // 隐私设置
}

// 页面跳转统一方法
const navTo = (page: string) => {
  const url = pageMap[page]
  if (url) {
    uni.navigateTo({ url })
  } else {
    // 尚未开发的页面给出提示
    uni.showToast({ title: '功能开发中，敬请期待', icon: 'none' })
  }
}

// 去登录注册页
const goLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login-account'
  })
}

// 切换账号
const switchAccount = () => {
  uni.showModal({
    title: '提示',
    content: '确定要切换账号吗？当前账号信息将会清除',
    success: (res) => {
      if (res.confirm) {
        logout()
        goLogin()
      }
    }
  })
}

// 退出登录
const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '是否退出当前登录账号',
    success: (res) => {
      if (res.confirm) {
        // 清空本地存储登录信息
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        isLogin.value = false
        userInfo.value = {
          nickname: '',
          avatar: '',
          userId: ''
        }
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

// 如果需要读取本地登录态，可取消下面注释
// import { onMounted } from 'vue'
// onMounted(() => {
//   const token = uni.getStorageSync('token')
//   const storageUser = uni.getStorageSync('userInfo')
//   if (token && storageUser) {
//     isLogin.value = true
//     userInfo.value = storageUser
//   }
// })
</script>

<style scoped>
/* 样式保持不变 */
.page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 40rpx;
}
.user-header {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  gap: 24rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999;
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.username {
  font-size: 32rpx;
  color: #333;
}
.username.tip {
  color: #666;
}
.desc {
  font-size: 24rpx;
  color: #999;
}
.card {
  margin: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.card-title {
  padding: 30rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  border-bottom: 1rpx solid #f2f2f2;
}
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 30rpx;
  font-size: 28rpx;
  color: #444;
  border-bottom: 1rpx solid #f5f5f5;
}
.item-row:last-child {
  border-bottom: none;
}
.logout-btn {
  margin: 60rpx 30rpx;
  background: #fff;
  color: #f56c6c;
  border: 1rpx solid #f56c6c;
}
</style>