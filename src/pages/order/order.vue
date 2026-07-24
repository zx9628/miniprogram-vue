<template>
  <view class="cart-page">
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">购物车</text>
      <text class="nav-edit" @click="toggleEditMode">{{ editMode ? '完成' : '编辑' }}</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-cart" v-if="cartItems.length === 0">
      <text class="empty-text">🛒 购物车空空如也</text>
      <text class="empty-hint">快去点餐吧，美食在等你</text>
      <button class="go-shop-btn" @click="goHome">去点餐</button>
    </view>

    <!-- 购物车列表 -->
    <view class="cart-list" v-else>
      <view class="select-all-bar">
        <view class="select-all-left" @click="handleToggleAll">
          <view class="checkbox" :class="{ checked: allSelected }">
            <text v-if="allSelected">✓</text>
          </view>
          <text class="select-all-text">全选</text>
        </view>
        <text v-if="editMode" class="clear-all" @click="handleClearCart">清空购物车</text>
      </view>

      <view
          class="cart-item"
          v-for="(item, index) in cartItems"
          :key="`${item.dishId}-${item.specName}`"
      >
        <view class="checkbox-wrap" @click="handleToggleSelected(item.dishId, item.specName)">
          <view class="checkbox" :class="{ checked: item.selected }">
            <text v-if="item.selected">✓</text>
          </view>
        </view>

        <view class="item-info">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-spec">{{ item.specName || '默认' }}</text>
          <view class="item-price-row">
            <text class="item-price">￥{{ item.price.toFixed(2) }}</text>
            <text class="item-stock" v-if="item.quantity >= item.stock * 0.8">库存紧张</text>
          </view>
        </view>

        <view class="item-action">
          <view v-if="!editMode" class="quantity-control">
            <button
                class="qty-btn"
                :class="{ disabled: item.quantity <= 1 }"
                @click="handleUpdateQuantity(item.dishId, item.specName, -1)"
                :disabled="item.quantity <= 1"
            >−</button>
            <text class="qty-num">{{ item.quantity }}</text>
            <button
                class="qty-btn"
                :class="{ disabled: item.quantity >= item.stock }"
                @click="handleUpdateQuantity(item.dishId, item.specName, 1)"
                :disabled="item.quantity >= item.stock"
            >+</button>
          </view>
          <button v-else class="delete-btn" @click="handleDeleteItem(item.dishId, item.specName)">✕</button>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="cart-footer" v-if="cartItems.length > 0">
      <view class="footer-left">
        <view class="total-price-wrap">
          <text class="total-label">合计</text>
          <text class="total-price">￥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <text class="total-count">已选 {{ selectedCount }} 件商品</text>
      </view>
      <button
          class="checkout-btn"
          :class="{ disabled: selectedCount === 0 }"
          @click="handleCreateOrder"
      >生成订单</button>
    </view>
  </view>
</template>

<!-- pages/cart/cart.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import * as CartUtils from '@/store/cart'

const cartItems = ref<CartUtils.CartItem[]>([])
const editMode = ref(false)

// ============ 计算属性 ============
const allSelected = computed(() => CartUtils.isAllSelected(cartItems.value))
const totalPrice = computed(() => CartUtils.getTotalPrice(cartItems.value))
const selectedCount = computed(() => CartUtils.getSelectedCount(cartItems.value))

// ============ 加载数据 ============
function loadCart() {
  cartItems.value = CartUtils.getCart()
}

// ============ 操作方法 ============
function handleToggleSelected(dishId: number, specName: string) {
  CartUtils.toggleSelected(Number(dishId), String(specName))
  loadCart()
}

function handleToggleAll() {
  CartUtils.toggleAll(!allSelected.value)
  loadCart()
}

function handleUpdateQuantity(dishId: number, specName: string, delta: number) {
  CartUtils.updateCartQuantity(Number(dishId), String(specName), Number(delta))
  loadCart()
}

function handleDeleteItem(dishId: number, specName: string) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) {
        CartUtils.removeFromCart(Number(dishId), String(specName))
        loadCart()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function handleClearCart() {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: (res) => {
      if (res.confirm) {
        CartUtils.clearCart()
        loadCart()
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

// ✅ 创建订单 - 确保参数是数字
function handleCreateOrder() {
  if (selectedCount.value === 0) {
    uni.showToast({ title: '请选择要下单的商品', icon: 'none' })
    return
  }

  // ✅ 从本地存储获取用户和店铺信息，并确保是数字
  let userInfo = uni.getStorageSync('userInfo')
  let storeInfo = uni.getStorageSync('storeInfo')

  // 打印原始数据查看
  console.log('原始 userInfo:', userInfo)
  console.log('原始 storeInfo:', storeInfo)

  // ✅ 安全获取 userId 和 storeId
  let userId = 1
  let storeId = 1
  let storeName = '默认店铺'

  if (userInfo && typeof userInfo === 'object') {
    // 如果是对象，取 id 字段
    userId = Number(userInfo.id) || Number(userInfo.userId) || 1
  } else if (typeof userInfo === 'number') {
    userId = userInfo
  } else if (typeof userInfo === 'string') {
    userId = Number(userInfo) || 1
  }

  if (storeInfo && typeof storeInfo === 'object') {
    storeId = Number(storeInfo.id) || Number(storeInfo.storeId) || 1
    storeName = storeInfo.name || storeInfo.storeName || '默认店铺'
  } else if (typeof storeInfo === 'number') {
    storeId = storeInfo
  } else if (typeof storeInfo === 'string') {
    storeId = Number(storeInfo) || 1
  }

  console.log('最终 userId:', userId, '类型:', typeof userId)
  console.log('最终 storeId:', storeId, '类型:', typeof storeId)
  console.log('storeName:', storeName)

  // ✅ 调用 createOrder，传入数字
  CartUtils.createOrder(storeId, userId, '', storeName)
}

function toggleEditMode() {
  editMode.value = !editMode.value
}

function goBack() {
  uni.switchTab({ url: '/pages/orderFood/orderFood' })
}

function goHome() {
  uni.switchTab({ url: '/pages/orderFood/orderFood' })
}

// ============ 生命周期 ============
onShow(() => {
  loadCart()
  editMode.value = false
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 140rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-left {
  width: 60rpx;
}

.back-icon {
  font-size: 48rpx;
  color: #333333;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
  text-align: center;
}

.nav-edit {
  font-size: 28rpx;
  color: #FF6B35;
  width: 60rpx;
  text-align: right;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;
}

.empty-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
  margin-top: 30rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999999;
  margin-top: 12rpx;
}

.go-shop-btn {
  margin-top: 40rpx;
  background: #FF6B35;
  color: #FFFFFF;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 30rpx;
}

.go-shop-btn:active {
  opacity: 0.8;
}

.select-all-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  margin-bottom: 10rpx;
}

.select-all-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.select-all-text {
  font-size: 28rpx;
  color: #333333;
}

.clear-all {
  font-size: 26rpx;
  color: #FF3B30;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #FFFFFF;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox.checked {
  background: #FF6B35;
  border-color: #FF6B35;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  margin-bottom: 10rpx;
  transition: all 0.3s;
}

.checkbox-wrap {
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  padding: 0 20rpx;
  min-width: 0;
}

.item-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 4rpx;
}

.item-spec {
  font-size: 24rpx;
  color: #999999;
  display: block;
  margin-bottom: 8rpx;
}

.item-price-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-price {
  font-size: 32rpx;
  color: #FF6B35;
  font-weight: bold;
}

.item-stock {
  font-size: 20rpx;
  color: #FF3B30;
  background: #FFF0EA;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
}

.item-action {
  flex-shrink: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #FF6B35;
  color: #FFFFFF;
  border: none;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.qty-btn:active:not(.disabled) {
  opacity: 0.7;
}

.qty-btn.disabled {
  background: #E5E5E5;
  color: #999999;
}

.qty-num {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  min-width: 40rpx;
  text-align: center;
}

.delete-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #FF3B30;
  color: #FFFFFF;
  border: none;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:active {
  opacity: 0.7;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-radius: 20rpx 20rpx 0 0;
}

.footer-left {
  flex: 1;
}

.total-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.total-label {
  font-size: 26rpx;
  color: #999999;
}

.total-price {
  font-size: 40rpx;
  color: #FF6B35;
  font-weight: bold;
}

.total-count {
  font-size: 22rpx;
  color: #999999;
}

.checkout-btn {
  background: #FF6B35;
  color: #FFFFFF;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  white-space: nowrap;
}

.checkout-btn:active:not(.disabled) {
  opacity: 0.8;
}

.checkout-btn.disabled {
  background: #CCCCCC;
  color: #FFFFFF;
}
</style>