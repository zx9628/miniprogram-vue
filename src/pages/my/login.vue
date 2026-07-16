<template>
  <view class="login-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <text class="main-title">欢迎登录</text>
      <text class="sub-title">使用手机号和密码登录</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="input-item">
        <input
            class="uni-input"
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号"
            placeholder-class="placeholder-style"
            maxlength="11"
        />
      </view>

      <view class="input-item">
        <input
            class="uni-input"
            type="password"
            v-model="formData.password"
            placeholder="请输入密码"
            placeholder-class="placeholder-style"
            maxlength="20"
        />
      </view>
    </view>

    <!-- 登录按钮 -->
    <view class="btn-area">
      <button class="submit-btn" @click="handleLogin">登录</button>
    </view>

    <!-- 注册按钮 -->
    <view class="register-area">
      <button class="register-btn" @click="goRegister">注册</button>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';
// 引入封装好的请求工具
import request from '@/util/request'

const formData = reactive({
  phone: '',
  password: ''
});

// 点击登录
const handleLogin = async () => {
  // 表单校验
  if (!formData.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' });
    return;
  }
  if (!formData.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '登录中...' });
  try {
    // 请求本地SpringBoot后端接口
    const res = await request("/api/login/login", "POST", {
      phone: formData.phone,
      password: formData.password
    })
    uni.hideLoading()
    if (res.code === 200) {
      // 核心：存储JWT token，首页接口自动携带
      uni.setStorageSync('token', res.data.token)
      // 可选：存储用户基础信息
      uni.setStorageSync('userInfo', res.data.userInfo)

      uni.showToast({ title: '登录成功' });
      setTimeout(() => {
        // 跳普通用户首页 pages/index/index，admin不用
        uni.switchTab({ url: '/pages/index/index' });
      }, 1200);
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' });
      formData.phone = ''
      formData.password = ''
    }
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '连接后端失败，请检查IDEA服务是否启动', icon: 'none' })
  }
};

// 跳转注册页
const goRegister = () => {
  uni.navigateTo({ url: '/pages/my/register' });
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 0 60rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-top: 80rpx;
  margin-bottom: 60rpx;

  .main-title {
    font-size: 56rpx;
    font-weight: bold;
    color: #333333;
    display: block;
    margin-bottom: 20rpx;
  }

  .sub-title {
    font-size: 28rpx;
    color: #999999;
  }
}

.form-section {
  margin-bottom: 40rpx;

  .input-item {
    border-bottom: 1rpx solid #eeeeee;
    padding: 30rpx 0;
    margin-bottom: 20rpx;

    .uni-input {
      font-size: 32rpx;
      color: #333333;
      height: 60rpx;
      line-height: 60rpx;
    }

    .placeholder-style {
      color: #cccccc;
      font-size: 32rpx;
    }
  }
}

.btn-area {
  margin-top: 40rpx;

  .submit-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    background-color: #a84c38;
    color: #ffffff;
    font-size: 34rpx;
    border: none;

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.9;
    }
  }
}

.register-area {
  margin-top: 30rpx;

  .register-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    background-color: #ffffff;
    color: #a84c38;
    font-size: 34rpx;
    border: 2rpx solid #a84c38;

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.9;
    }
  }
}
</style>