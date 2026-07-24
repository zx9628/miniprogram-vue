<template>
  <view class="coupon-manage">
    <!-- 列表视图 -->
    <view v-if="!showForm">
      <view class="toolbar">
        <button @click="goHome" class="home-btn">← 返回首页</button>
        <button @click="openView('add')">增加优惠券</button>
        <button @click="openView('change')">修改优惠券</button>
      </view>
    </view>

    <!-- 新增/编辑表单视图 -->
    <view v-else>
      <add-coupon v-if="currentView === 'add'" @cancel="showForm = false" />
      <change-coupon v-if="currentView === 'change'" @cancel="showForm = false"/>
    </view>
  </view>
</template>

<script setup>
import {ref, defineEmits } from 'vue'
import AddCoupon from './couponManageView/addCoupon.vue'
import ChangeCoupon from "@/pages/index/admin/couponManageView/changeCoupon.vue";

const emit = defineEmits(['backHome'])   // 声明事件

const showForm = ref(false)
const currentView  = ref('')

const goHome = () => {
  emit('backHome')   // 触发事件，通知父组件返回首页
}

const openView = (view) => {
  currentView.value = view
  showForm.value = true
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 16rpx;
}

.home-btn {
  background: #3498db;
  color: #fff;
  border: none;
  margin-right: auto;  /* 关键：将后续按钮推到右侧 */
  /* 可选：加个小圆角 */
  border-radius: 8rpx;
  padding: 8rpx 20rpx;
}
</style>