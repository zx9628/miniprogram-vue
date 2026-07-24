<template>
  <view class="container">
    <!-- 1. 标题区域 -->
    <view class="header">
      <text class="title">请选择充值金额</text>
      <text class="sub-title">当前余额: ¥{{ currentBalance.toFixed(2) }}</text>
    </view>

    <!-- 2. 金额选择区域 -->
    <view class="amount-grid">
      <view
          v-for="item in amountList"
          :key="item.id"
          class="amount-card"
          :class="{ active: selectedAmount === item.id }"
          @click="selectAmount(item.id)"
      >
        <text class="amount-text">¥{{ item.amount }}</text>
        <text class="desc-text">充值余额</text>
      </view>
    </view>

    <!-- 3. 确认按钮 -->
    <view class="footer">
      <button
          class="pay-btn"
          :class="{ disabled: !selectedAmount || paying }"
          @click="handlePay"
      >
        {{ paying ? '充值中...' : '确认充值' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// --- 数据定义 ---
const amountList = [
  { id: 1, amount: 10 },
  { id: 2, amount: 50 },
  { id: 3, amount: 100 },
  { id: 4, amount: 200 },
];

const selectedAmount = ref(null);
const paying = ref(false);
const currentBalance = ref(0);

// 从缓存获取用户信息
const userInfo = uni.getStorageSync('userInfo') || {};

// --- 生命周期 ---
onLoad(() => {
  // 1. 读取本地缓存的余额
  const savedBalance = uni.getStorageSync('user_balance');
  currentBalance.value = savedBalance ? Number(savedBalance) : 0;

  // 2. 如果用户已登录，从后端获取最新余额
  if (userInfo.userId) {
    fetchBalanceFromServer();
  }
});

// --- 方法 ---

// 选中金额
const selectAmount = (id) => {
  if (paying.value) return;
  selectedAmount.value = id;
};

// 从后端获取最新余额
const fetchBalanceFromServer = () => {
  uni.request({
    //url: 'http://localhost:8081/api/user/recharge' + userInfo.userId,
    url: 'https://zx.juntaitec.cn/wechat/user/recharge' + userInfo.userId,
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.data.code === 200) {
        const balance = res.data.data.balance;
        currentBalance.value = Number(balance);
        uni.setStorageSync('user_balance', balance);
      }
    },
    fail: (err) => {
      console.error('获取余额失败:', err);
    }
  });
};

// 充值逻辑
const handlePay = () => {
  // 1. 校验是否选择金额
  if (!selectedAmount.value) {
    uni.showToast({ title: '请先选择金额', icon: 'none' });
    return;
  }

  // 2. 校验用户是否登录
  if (!userInfo.userId) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/my/my' });
    }, 1000);
    return;
  }

  // 3. 找到选中的金额
  const selectedItem = amountList.find(item => item.id === selectedAmount.value);
  const rechargeAmount = selectedItem.amount;

  // 4. 显示确认弹窗
  uni.showModal({
    title: '确认充值',
    content: `您将充值 ¥${rechargeAmount} 元，确认支付？`,
    success: (modalRes) => {
      if (modalRes.confirm) {
        doRecharge(rechargeAmount);
      }
    }
  });
};

// 执行充值请求
const doRecharge = (amount) => {
  paying.value = true;

  console.log(`开始充值: ${amount} 元, 用户ID: ${userInfo.userId}`);

  uni.request({
    //url: 'http://localhost:8081/api/user/recharge',
    url: 'https://zx.juntaitec.cn/wechat/user/recharge',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      userId: userInfo.userId,
      amount: amount
    },
    success: (res) => {
      console.log('充值响应:', res.data);

      if (res.data.code === 200) {
        // 充值成功
        const newBalance = res.data.data.newBalance;

        // A. 更新页面显示的余额
        currentBalance.value = Number(newBalance);

        // B. 保存到手机缓存
        uni.setStorageSync('user_balance', newBalance);

        // ========== 【关键修改】更新 userInfo 缓存中的余额 ==========
        const cachedUserInfo = uni.getStorageSync('userInfo');
        if (cachedUserInfo) {
          cachedUserInfo.balance = newBalance;
          uni.setStorageSync('userInfo', cachedUserInfo);
        }
        // =========================================================

        // C. 发送事件通知所有页面更新余额
        // 使用 balanceUpdated 事件（首页和"我的"页面都在监听）
        uni.$emit('balanceUpdated', newBalance);
        // 保留旧的兼容事件
        uni.$emit('refreshBalance', newBalance);

        // D. 显示成功提示
        uni.showToast({
          title: `充值成功！新余额: ¥${newBalance}`,
          icon: 'success'
        });

        // E. 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else {
        // 充值失败（后端返回错误）
        uni.showToast({
          title: res.data.msg || '充值失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('充值请求失败:', err);
      uni.showToast({
        title: '网络连接失败，请检查网络',
        icon: 'none'
      });
    },
    complete: () => {
      paying.value = false;
    }
  });
};
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}
.sub-title {
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

/* 网格布局 */
.amount-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.amount-card {
  width: 48%;
  height: 160rpx;
  background-color: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  border: 2rpx solid transparent;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.amount-card.active {
  border-color: #07c160;
  background-color: #e8fce8;
}

.amount-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}
.desc-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.pay-btn {
  background-color: #07c160;
  color: white;
  border-radius: 50rpx;
  font-size: 32rpx;
  height: 90rpx;
  line-height: 90rpx;
  margin-top: 40rpx;
  width: 100%;
}

.pay-btn.disabled {
  background-color: #ccc;
}
</style>