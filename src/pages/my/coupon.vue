<template>
  <view class="coupon-list">
    <view
        class="coupon-item"
        v-for="item in list"
        :key="item.id"
        :class="{'used': item.status === 1}"
    >
      <text class="coupon-name">{{ item.name }}</text>
      <text class="coupon-status">
        {{ item.status === 0 ? '未使用' : '已使用' }}
      </text>
    </view>
    <text v-if="list.length === 0" class="empty">暂无优惠券</text>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import {ref} from "vue";
import {getCoupon} from "@/util/coupon";

const list = ref([]);

onLoad(async () => {
  const userInfo = uni.getStorageSync('userInfo');
  const res = await getCoupon({userId : userInfo.userId})
  console.log(res);
  list.value = res.data;
});
</script>

<style>
.coupon-list {
  padding: 20rpx;
}

.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 40rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  border-left: 8rpx solid #ff6a6a; /* 未使用用红色左边框 */
  transition: all 0.3s;
}

/* 已使用样式淡化 */
.coupon-item.used {
  border-left-color: #ccc;
  opacity: 0.6;
}

.coupon-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.coupon-status {
  font-size: 28rpx;
  color: #ff6a6a;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  background: rgba(255, 106, 106, 0.1);
}

/* 已使用状态变灰 */
.coupon-item.used .coupon-status {
  color: #999;
  background: rgba(0, 0, 0, 0.05);
}

.empty {
  display: block;
  text-align: center;
  color: #999;
  font-size: 30rpx;
  padding-top: 100rpx;
}
</style>