<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateCoupon } from '@/util/coupon'

const emit = defineEmits(['cancel', 'updated'])

const props = defineProps({
  parentItem: {
    type: Object,
    required: true
  }
})

// 创建本地副本，避免直接修改 prop
const formData = ref({ ...props.parentItem })

// 当父组件传入新的 parentItem 时，更新本地副本（如点击不同项时）
watch(() => props.parentItem, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
  }
}, { immediate: true })

const handleCancel = () => {
  emit('cancel')
}

const update = async () => {
  // 使用 formData 中的值构造请求体
  const payload = {
    id: formData.value.id,
    name: formData.value.name,
    type: formData.value.type,
    numValue: formData.value.numValue,
    discount: formData.value.discount,
    status: formData.value.status,
    userHave: formData.value.userHave
  }

  try {
    const res = await updateCoupon(payload)
    if (res.code === 200) {
      uni.showToast({ title: '修改成功', icon: 'success' })
      emit('updated')        // 通知父组件刷新
      handleCancel()         // 关闭表单
    } else {
      uni.showToast({ title: res.msg || '修改失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}
</script>

<template>
  <view class="update-coupon">
    <view class="form-header">
      <text class="back-btn" @click="handleCancel">← 返回</text>
      <text class="form-title">更改优惠券</text>
    </view>

    <view class="form-body">
      <view class="field">
        <text>ID：</text>
        <text>{{ formData.id }}</text>   <!-- 只读，使用 formData -->
      </view>
      <view class="field">
        <text>名称：</text>
        <input type="text" v-model="formData.name" />
      </view>

      <view class="field">
        <text class="label">类型：</text>
        <radio-group class="radio-group" @change="e => formData.type = e.detail.value">
          <label class="radio-label">
            <radio value="NUMVALUE" :checked="formData.type === 'NUMVALUE'" color="#e67e22" />
            <text>满减</text>
          </label>
          <label class="radio-label">
            <radio value="DISCOUNT" :checked="formData.type === 'DISCOUNT'" color="#e67e22" />
            <text>折扣</text>
          </label>
        </radio-group>
      </view>

      <view class="field">
        <text>面额：</text>
        <input type="text" v-model="formData.numValue" />
      </view>
      <view class="field">
        <text>折扣：</text>
        <input type="text" v-model="formData.discount" />
      </view>
      <view class="field">
        <text>状态：</text>
        <input type="text" v-model="formData.status" />
      </view>
      <view class="field">
        <text>所属用户：</text>
        <input type="text" v-model="formData.userHave" />
      </view>
      <button @click="update" class="submit-btn">确认更改</button>
    </view>
  </view>
</template>

<style scoped>
.update-coupon {
  padding: 30rpx 24rpx;
  background: #ffffff;
  min-height: 100vh;
}

.form-header {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 30rpx;
}

.back-btn {
  font-size: 28rpx;
  color: #3498db;
  background: none;
  border: none;
  padding: 8rpx 0;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.form-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  /* 如果想让标题居中，不偏移，可去掉 margin-right */
}

.form-body {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx 24rpx;
}

.field {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.field text {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.field input {
  flex: 1;
  height: 72rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  background: #fafafa;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background: #e67e22;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 500;
  margin-top: 20rpx;
}

.submit-btn:active {
  background: #d35400;
}

.field .label {
  width: 120rpx;
  flex-shrink: 0;
}
.radio-group {
  display: flex;
  gap: 24rpx;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 28rpx;
  flex-shrink: 0;
}
</style>