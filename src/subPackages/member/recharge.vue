<template>
  <view class="container">
    <!-- 1. 标题区域 -->
    <view class="header">
      <text class="title">请选择充值金额</text>
      <text class="sub-title">当前余额: ¥{{ currentBalance }}</text>
    </view>

    <!-- 2. 金额选择区域 (解决空白问题的关键) -->
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
  { id: 4, amount: 200 }, // 多加一个测试
];

const selectedAmount = ref(null);
const paying = ref(false);
const pageParams = ref({});

// 【新增】用于记录当前的本地余额
const currentBalance = ref(0);

// --- 生命周期 ---
onLoad((options) => {
  if (options) {
    pageParams.value = options;
  }

  // 1. 读取本地缓存的余额（如果没有就是0）
  const savedBalance = uni.getStorageSync('user_balance');
  currentBalance.value = savedBalance ? Number(savedBalance) : 0;
});

// --- 方法 ---

// 选中金额
const selectAmount = (id) => {
  if (paying.value) return;
  selectedAmount.value = id;
};

// 模拟支付并加钱
const handlePay = () => {
  if (!selectedAmount.value) {
    uni.showToast({ title: '请先选择金额', icon: 'none' });
    return;
  }

  paying.value = true;

  // 找到选中的那个金额对象
  const selectedItem = amountList.find(item => item.id === selectedAmount.value);

  console.log(`准备充值: ${selectedItem.amount} 元`);

  // 模拟网络延迟 (1秒后成功)
  setTimeout(() => {
    // 2. 计算新余额
    const newBalance = currentBalance.value + selectedItem.amount;

    // 3. 更新页面显示的余额
    currentBalance.value = newBalance;

    // 4. 【关键】保存到手机缓存里，这样回首页再进来钱还在
    uni.setStorageSync('user_balance', newBalance);

    // 5. 发送事件通知首页刷新 (如果首页在后台运行)
    uni.$emit('refreshBalance', newBalance);

    paying.value = false;
    uni.showToast({ title: '充值成功！', icon: 'success' });

    // 6. 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);

  }, 1000);
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
  width: 48%; /* 一行两个 */
  height: 160rpx;
  background-color: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  border: 2rpx solid transparent; /* 默认透明边框 */
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

/* 选中状态 */
.amount-card.active {
  border-color: #07c160; /* 微信绿 */
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
}

.pay-btn.disabled {
  background-color: #ccc;
}
</style>