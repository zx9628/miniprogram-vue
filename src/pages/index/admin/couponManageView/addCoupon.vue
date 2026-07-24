<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { addCoupon } from '@/util/coupon'

const emit = defineEmits(['cancel'])  // 声明事件

const id = ref('')
const name = ref('')
const type = ref<'NUMVALUE' | 'DISCOUNT'>('NUMVALUE')
const numValue = ref()
const discount = ref()
const userHave = ref()
const status = ref(0)

// 返回列表
const handleCancel = () => {
  emit('cancel')
}

// 保存
const save = async () => {
  const res = await addCoupon({
    name: name.value,
    type: type.value,
    numValue: numValue.value,
    discount: discount.value,
    status: status.value,
    userHave: userHave.value
  })
  if (res.code === 200) {
    uni.showToast({ title: '新增成功', icon: 'success' })  // 新增提示
    console.log(res.msg)
    console.log("保存成功")
    handleCancel()  // 返回列表（Toast 会自动显示并持续一段时间）
  } else {
    uni.showToast({ title: res.msg || '保存失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="coupon-form">
    <!-- 顶部返回栏 -->
    <view class="form-header">
      <text class="back-btn" @click="handleCancel">← 返回</text>
      <text class="form-title">新增优惠券</text>
    </view>

    <!-- 原有表单字段 -->
    <view class="field">
      <text class="label">ID</text>
      <input class="input" type="text" v-model="id" placeholder="自动生成" disabled />
    </view>

    <view class="field">
      <text class="label">名称</text>
      <input class="input" type="text" v-model="name" placeholder="请输入优惠券名称" />
    </view>

    <view class="field">
      <text class="label">类型</text>
      <radio-group class="radio-group" @change="e => type = e.detail.value">
        <label class="radio-label">
          <radio value="NUMVALUE" :checked="type === 'NUMVALUE'" color="#e67e22" />
          <text>满减</text>
        </label>
        <label class="radio-label">
          <radio value="DISCOUNT" :checked="type === 'DISCOUNT'" color="#e67e22" />
          <text>折扣</text>
        </label>
      </radio-group>
    </view>

    <view class="field">
      <text class="label">面额</text>
      <input class="input" type="text" v-model="numValue" placeholder="满减金额" />
    </view>

    <view class="field">
      <text class="label">折扣</text>
      <input class="input" type="text" v-model="discount" placeholder="折扣系数，如0.8" />
    </view>

    <view class="field">
      <text class="label">状态</text>
      <input class="input" type="text" v-model="status" placeholder="0-未使用 1-已使用" />
    </view>

    <view class="field">
      <text class="label">所属用户</text>
      <input class="input" type="text" v-model="userHave" placeholder="用户ID" />
    </view>

    <button class="save-btn" @click="save">保存优惠券</button>
  </view>
</template>

<style scoped>
/* 原有样式保持不变，新增顶部栏样式 */
.coupon-form {
  padding: 30rpx 24rpx;
  background: #ffffff;
}

.form-header {
  display: flex;
  align-items: center;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f2f5;
  margin-bottom: 24rpx;
}

.back-btn {
  font-size: 28rpx;
  color: #e67e22;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: #fef5ed;
}

.back-btn:active {
  background: #fde8d8;
}

.form-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-right: 60rpx; /* 平衡返回按钮偏移 */
}

.field {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #2c3e50;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 72rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  border: 1rpx solid #e8ecf1;
  box-sizing: border-box;
}

.input:focus {
  border-color: #e67e22;
}

.radio-group {
  display: flex;
  gap: 32rpx;
  padding-top: 6rpx;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #2c3e50;
}

.save-btn {
  width: 100%;
  height: 80rpx;
  background: #e67e22;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(230, 126, 34, 0.3);
}

.save-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>