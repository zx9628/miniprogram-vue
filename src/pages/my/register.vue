<template>
  <view class="register-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <text class="main-title">注册新账号</text>
      <text class="sub-title">使用手机号和密码创建新账号</text>
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
            placeholder="请设置密码（6-20位）"
            placeholder-class="placeholder-style"
            maxlength="20"
        />
      </view>

      <view class="input-item">
        <input
            class="uni-input"
            type="password"
            v-model="formData.confirmPassword"
            placeholder="请再次确认密码"
            placeholder-class="placeholder-style"
            maxlength="20"
        />
      </view>
    </view>

    <!-- 注册按钮 -->
    <view class="btn-area">
      <button
          class="submit-btn"
          :class="{ 'active': isAgree }"
          @click="handleRegister"
      >
        注册
      </button>
    </view>

    <!-- 协议区域 -->
    <view class="agreement-area">
      <checkbox-group @change="onAgreementChange">
        <label class="agreement-label">
          <checkbox
              value="agree"
              :checked="isAgree"
              color="#d9534f"
              style="transform:scale(0.7)"
          />
          <text class="agreement-text">
            注册即表示同意
            <text class="link">《2025年会员制度》</text>
            <text class="link">《六品王隐私政策》</text>
            <text class="link">《商家隐私政策》</text>
            <text class="link">《未成年人隐私政策》</text>
          </text>
        </label>
      </checkbox-group>
    </view>

    <!-- 底部跳转登录 -->
    <view class="bottom-area">
      <text class="login-hint">已有账号？</text>
      <text class="login-link" @click="goLogin">立即登录</text>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';

// 表单数据
const formData = reactive({
  phone: '',
  password: '',
  confirmPassword: ''
});

// 协议勾选状态
const isAgree = ref(false);

// 切换协议勾选
const onAgreementChange = (e) => {
  isAgree.value = e.detail.value.length > 0;
};

// 点击注册
const handleRegister = () => {
  if (!formData.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' });
    return;
  }
  if (!formData.password) {
    uni.showToast({ title: '请设置密码', icon: 'none' });
    return;
  }
  if (formData.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' });
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' });
    return;
  }
  if (!isAgree.value) {
    uni.showToast({ title: '请阅读并同意协议', icon: 'none' });
    return;
  }

  // ✅ 调用真实后端注册接口
  uni.showLoading({ title: '注册中...' });

  uni.request({
    url: 'http://localhost:8083/api/login/register',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    },
    success: (res) => {
      uni.hideLoading();
      if (res.data.code === 200) {
        uni.showToast({ title: '注册成功' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else {
        // 后端返回的错误信息（如"该手机号已被注册"）
        uni.showToast({ title: res.data.message || '注册失败', icon: 'none' });
      }
    },
    fail: (err) => {
      uni.hideLoading();
      console.error('注册请求失败:', err);
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
    }
  });
};

// 跳转登录页
const goLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
/* 页面背景 */
.register-container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 0 60rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
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

/* 表单样式 */
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

/* 按钮样式 */
.btn-area {
  margin-top: 40rpx;

  .submit-btn {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    background-color: #fdf4b8;
    color: #ffffff;
    font-size: 34rpx;
    border: none;
    text-shadow: 0 1rpx 2rpx rgba(0,0,0,0.1);

    &::after {
      border: none;
    }

    &:active {
      opacity: 0.9;
    }
  }
}

/* 协议区域 */
.agreement-area {
  margin-top: 40rpx;

  .agreement-label {
    display: flex;
    align-items: flex-start;

    checkbox {
      margin-right: 10rpx;
      margin-top: -5rpx;
    }

    .agreement-text {
      font-size: 24rpx;
      color: #999999;
      line-height: 1.5;

      .link {
        color: #a84c38;
      }
    }
  }
}

/* 底部跳转登录 */
.bottom-area {
  position: absolute;
  bottom: 80rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-hint {
    font-size: 28rpx;
    color: #999999;
  }

  .login-link {
    font-size: 28rpx;
    color: #a84c38;
    margin-left: 8rpx;
  }
}
</style>