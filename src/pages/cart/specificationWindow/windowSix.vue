<template>
  <!-- 遮罩层 -->
  <view class="modal-overlay" v-if="visible" @click="handleOverlayClick">
    <view class="modal-content" @click.stop>
      <!-- 关闭按钮 -->
      <view class="modal-close" @click="handleClose">×</view>

      <!-- 商品信息 -->
      <view class="product-info-section">
        <image
            class="product-image"
            :src="getValidImage(product?.image)"
            mode="aspectFill"
        ></image>
        <view class="product-detail">
          <text class="product-name-large">{{ product?.name }}</text>
          <text class="product-price-large">￥{{ product?.price }}</text>
          <text class="product-desc-small" v-if="product?.desc">{{ product?.desc }}</text>
        </view>
      </view>

      <!-- 规格选择 -->
      <view class="spec-section">
        <!-- 规格（小/大） -->
        <view class="spec-group">
          <text class="spec-title">规格</text>
          <view class="spec-options">
            <view
                v-for="(spec, index) in specOptions"
                :key="index"
                class="spec-option"
                :class="{ active: localSelectedSpec === index }"
                @click="localSelectedSpec = index"
            >
              {{ spec.name }}
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="modal-footer">
        <view class="total-price">
          <text class="total-label">合计</text>
          <text class="total-number">￥{{ computedTotalPrice }}</text>
          <text class="total-unit">/份</text>
        </view>
        <view class="add-cart-btn" @click="handleAddToCart">
          {{ selectedSpecName }}
          <text v-if="selectedSpecName">·</text>
          加入购物车
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// ==================== Props ====================
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  specOptions: {
    type: Array,
    default: () => []
  }
})

// ==================== Emits ====================
const emit = defineEmits(['close', 'confirm'])

// ==================== 本地状态 ====================
const localSelectedSpec = ref(0)

// ==================== 图片处理函数 ====================
const getValidImage = (image) => {
  if (!image || image === 'null' || image === 'undefined' || image.includes(',')) {
    return 'https://via.placeholder.com/160x160/f5f5f5/999?text=暂无图片'
  }
  if (!image.startsWith('http://') && !image.startsWith('https://')) {
    return image
  }
  return image
}

// ==================== 监听 visible 重置状态 ====================
watch(() => props.visible, (newVal) => {
  if (newVal) {
    localSelectedSpec.value = 0
  }
})

// ==================== 计算属性 ====================
const selectedSpecName = computed(() => {
  if (localSelectedSpec.value >= 0 && localSelectedSpec.value < props.specOptions.length) {
    return props.specOptions[localSelectedSpec.value].name
  }
  return ''
})

const computedTotalPrice = computed(() => {
  if (!props.product) return '0.00'
  return props.product.price.toFixed(2)
})

// ==================== 方法 ====================
const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const handleAddToCart = () => {
  const order = {
    product: props.product,
    spec: selectedSpecName.value,
    totalPrice: computedTotalPrice.value,
    quantity: 1,
    selectedSpecIndex: localSelectedSpec.value
  }

  emit('confirm', order)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  width: 100%;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 30rpx 30rpx env(safe-area-inset-bottom);
  animation: slideUp 0.3s ease;
  overflow-y: auto;
  position: relative;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-close {
  position: absolute;
  top: 20rpx;
  right: 30rpx;
  font-size: 48rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.product-info-section {
  display: flex;
  gap: 24rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
}

.product-name-large {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.product-price-large {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.product-desc-small {
  font-size: 24rpx;
  color: #999;
}

.spec-section {
  padding: 30rpx 0;
}

.spec-group {
  margin-bottom: 30rpx;
}

.spec-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.spec-option {
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  border: 2rpx solid #e5e5e5;
  font-size: 26rpx;
  color: #333;
  background: #f8f8f8;
  transition: all 0.2s;
}

.spec-option.active {
  border-color: #07c160;
  background: #f0faf5;
  color: #07c160;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 30rpx;
  border-top: 1rpx solid #f5f5f5;
  gap: 20rpx;
}

.total-price {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.total-label {
  font-size: 26rpx;
  color: #666;
}

.total-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.total-unit {
  font-size: 22rpx;
  color: #999;
}

.add-cart-btn {
  flex: 1;
  background: #07c160;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  padding: 24rpx 32rpx;
  border-radius: 60rpx;
  text-align: center;
  max-width: 400rpx;
}
</style>