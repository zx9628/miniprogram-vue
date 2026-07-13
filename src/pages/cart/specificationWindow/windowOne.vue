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
        <!-- 规格 -->
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

        <!-- 加量 -->
        <view class="spec-group" v-if="extraOptions.length > 0">
          <text class="spec-title">加量（最多选1份）</text>
          <view class="spec-options">
            <view
                v-for="(item, index) in extraOptions"
                :key="index"
                class="spec-option"
                :class="{ active: localSelectedExtra === index }"
                @click="localSelectedExtra = index"
            >
              {{ item.name }}
              <text class="option-price" v-if="item.price">￥{{ item.price }}</text>
            </view>
          </view>
        </view>

        <!-- 配菜 -->
        <view class="spec-group" v-if="sideOptions.length > 0">
          <text class="spec-title">配菜</text>
          <view class="spec-options side-options">
            <view
                v-for="(item, index) in sideOptions"
                :key="index"
                class="spec-option side-option"
                :class="{
                active: localSelectedSides.includes(index),
                disabled: item.soldOut
              }"
                @click="toggleSide(index)"
            >
              <view class="side-info">
                <text>{{ item.name }}</text>
                <text class="side-price">￥{{ item.price }}</text>
              </view>
              <view v-if="item.soldOut" class="sold-out-tag">今日售罄</view>
              <view v-else-if="localSelectedSides.includes(index)" class="check-mark">✓</view>
            </view>
          </view>
        </view>

        <!-- 打包 -->
        <view class="spec-group" v-if="packagingOptions.length > 0">
          <text class="spec-title">打包（最多选1份）</text>
          <view class="spec-options">
            <view
                v-for="(item, index) in packagingOptions"
                :key="index"
                class="spec-option"
                :class="{ active: localSelectedPackaging === index }"
                @click="localSelectedPackaging = index"
            >
              {{ item.name }}
              <text class="option-price">￥{{ item.price }}</text>
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
  },
  extraOptions: {
    type: Array,
    default: () => []
  },
  sideOptions: {
    type: Array,
    default: () => []
  },
  packagingOptions: {
    type: Array,
    default: () => []
  }
})

// ==================== Emits ====================
const emit = defineEmits(['close', 'confirm'])

// ==================== 本地状态 ====================
const localSelectedSpec = ref(0)
const localSelectedExtra = ref(-1)
const localSelectedSides = ref([])
const localSelectedPackaging = ref(-1)

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
    localSelectedExtra.value = -1
    localSelectedSides.value = []
    localSelectedPackaging.value = -1
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

  let total = props.product.price || 0

  if (localSelectedExtra.value >= 0 && props.extraOptions[localSelectedExtra.value]) {
    total += props.extraOptions[localSelectedExtra.value].price || 0
  }

  localSelectedSides.value.forEach(index => {
    if (props.sideOptions[index] && !props.sideOptions[index].soldOut) {
      total += props.sideOptions[index].price || 0
    }
  })

  if (localSelectedPackaging.value >= 0 && props.packagingOptions[localSelectedPackaging.value]) {
    total += props.packagingOptions[localSelectedPackaging.value].price || 0
  }

  return total.toFixed(2)
})

// ==================== 方法 ====================
const toggleSide = (index) => {
  if (props.sideOptions[index].soldOut) return

  const idx = localSelectedSides.value.indexOf(index)
  if (idx > -1) {
    localSelectedSides.value.splice(idx, 1)
  } else {
    localSelectedSides.value.push(index)
  }
}

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
    extra: localSelectedExtra.value >= 0 ? props.extraOptions[localSelectedExtra.value]?.name : null,
    extraPrice: localSelectedExtra.value >= 0 ? props.extraOptions[localSelectedExtra.value]?.price : 0,
    sides: localSelectedSides.value.map(i => props.sideOptions[i]?.name).filter(Boolean),
    sidesPrice: localSelectedSides.value.reduce((sum, i) => sum + (props.sideOptions[i]?.price || 0), 0),
    packaging: localSelectedPackaging.value >= 0 ? props.packagingOptions[localSelectedPackaging.value]?.name : null,
    packagingPrice: localSelectedPackaging.value >= 0 ? props.packagingOptions[localSelectedPackaging.value]?.price : 0,
    totalPrice: computedTotalPrice.value,
    quantity: 1,
    selectedSpecIndex: localSelectedSpec.value,
    selectedExtraIndex: localSelectedExtra.value,
    selectedSidesIndexes: [...localSelectedSides.value],
    selectedPackagingIndex: localSelectedPackaging.value
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

.spec-option .option-price {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}

.side-options {
  flex-direction: column;
  gap: 12rpx;
}

.side-option {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e5e5e5;
  background: #fafafa;
}

.side-option.active {
  border-color: #07c160;
  background: #f0faf5;
}

.side-option.disabled {
  opacity: 0.5;
  border-color: #e5e5e5;
  background: #f5f5f5;
}

.side-info {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.side-price {
  font-size: 24rpx;
  color: #999;
}

.sold-out-tag {
  font-size: 22rpx;
  color: #999;
  background: #f0f0f0;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.check-mark {
  color: #07c160;
  font-size: 32rpx;
  font-weight: bold;
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