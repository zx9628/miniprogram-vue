<template>
  <view class="login-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <text class="main-title">管理员登录</text>
      <text class="sub-title">使用用户名和密码登录</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="input-item">
        <input
            class="uni-input"
            type="text"
            v-model="formData.username"
            placeholder="请输入用户名"
            placeholder-class="placeholder-style"
            maxlength="20"
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

const formData = reactive({
  username: 'boss',
  password: '12345678wlb'
});

// 点击登录
const handleLogin = () => {
  if (!formData.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' });
    return;
  }
  if (!formData.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '登录中...' });
  uni.request({
    //url: 'http://localhost:8081/api/login/admin',
    url: 'https://zx.juntaitec.cn/wechat/login/admin',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      username: formData.username,
      password: formData.password
    },
    success: (res) => {
      uni.hideLoading();
      console.log('后端返回完整数据:', JSON.stringify(res.data));
      if (res.data.code === 200) {
        const adminData = res.data.data;
        console.log('登录成功，准备存储的用户信息:', adminData);
        uni.setStorageSync('adminInfo', adminData);
        uni.showToast({ title: '登录成功' });
        setTimeout(() => {
          // 【修改】若非tabBar页面请使用reLaunch或redirectTo
          // reLaunch会关闭所有页面并打开新页面，适合登录成功场景
          uni.reLaunch({ url: '/pages/index/admin' });
        }, 1500);
      } else {
        uni.showToast({ title: res.data.message || '登录失败', icon: 'none' });
        formData.username = '';
        formData.password = '';
      }
    },
    fail: (err) => {
      uni.hideLoading();
      console.error('登录请求失败:', err);
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      formData.username = '';
      formData.password = '';
    }
  });
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