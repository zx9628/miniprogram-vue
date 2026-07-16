<script setup lang="ts">
import { ref } from "vue"
import request from "@/util/request"

const phone = ref("")
const password = ref("")
const showPassword = ref(false)

const handleLogin = async () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: "请输入11位手机号", icon: "none" })
    return
  }
  if (!password.value) {
    uni.showToast({ title: "请输入密码", icon: "none" })
    return
  }

  try {
    const res = await request("/api/login/login", "POST", {
      phone: phone.value,
      password: password.value
    })

    if (res.code === 200) {
      uni.setStorageSync("token", res.data.token)
      uni.showToast({ title: "登录成功" })
      uni.switchTab({ url: "/pages/index/admin" })
    } else {
      uni.showToast({ title: res.message, icon: "none" })
    }
  } catch (err) {
    uni.showToast({ title: "网络请求失败", icon: "none" })
  }
}

const handleWechatLogin = () => {
  uni.showToast({ title: "微信登录待开发", icon: "none" })
}
</script>

<template>
  <view class="login-container">
    <!-- 标题 -->
    <view class="login-title">账号密码登录</view>

    <!-- 输入框区域 -->
    <view class="input-group">
      <!-- 手机号 -->
      <view class="input-item">
        <input
            type="number"
            v-model="phone"
            placeholder="请输入手机号"
            maxlength="11"
            class="input-field"
        />
      </view>

      <!-- 密码 -->
      <view class="input-item">
        <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="请输入密码"
            maxlength="20"
            class="input-field"
        />
        <!-- 密码显示/隐藏切换 -->
        <view
            class="toggle-pwd"
            @click="showPassword = !showPassword"
        >
          {{ showPassword ? '隐藏' : '显示' }}
        </view>
      </view>
    </view>

    <!-- 登录按钮 -->
    <view class="login-btn" @click="handleLogin">
      <view>
        确定
      </view>
      <!-- 其他方式登录 -->
      <view class="other-login">
        <view class="divider">
          <view class="line"></view>
          <view class="text">其他方式登录</view>
          <view class="line"></view>
        </view>

        <view class="wechat-login" @click="handleWechatLogin">
          微信登录
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.login-container {
  padding: 60rpx 80rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.login-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 80rpx;
  text-align: center;
}

.input-group {
  margin-bottom: 60rpx;
}

.input-item {
  position: relative;
  margin-bottom: 40rpx;
  border-bottom: 1rpx solid #eee;
}

.input-field {
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  color: #333;
  width: 100%;
}

/* 密码切换按钮样式 */
.toggle-pwd {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: #666;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.login-btn {
  background-color: #007AFF;
  color: #fff;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  text-align: center;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.3);
}

.other-login {
  text-align: center;
  margin-top: 40rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  color: #999;
  font-size: 26rpx;
}

.line {
  flex: 1;
  height: 1rpx;
  background-color: #ddd;
}

.text {
  padding: 0 20rpx;
}

.wechat-login {
  color: #00aa00;
  font-size: 28rpx;
  display: inline-block;
  padding: 10rpx 30rpx;
  border: 1rpx solid #00aa00;
  border-radius: 8rpx;
}
</style>