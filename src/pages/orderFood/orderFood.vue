<template>
  <view class="order-page">
    <view class="shop_information">
      <view class="store-name">{{ ShopName }}</view>
      <view class="store-address">{{ ShopAddress }}</view>
    </view>

    <view class="main-content">
      <scroll-view class="menu-sidebar" scroll-y>
        <view
            class="menu-item"
            v-for="(item, index) in menuList"
            :key="index"
            :class="{ active: currentIndex === index }"
            @click="switchMenu(index)"
        >
          <text class="menu-label">{{ item.label }}</text>
        </view>
      </scroll-view>

      <scroll-view class="content-area" scroll-y>
        <view class="category-title">{{ currentMenu.label }}</view>

        <view class="food-list">
          <view
              class="food-item"
              v-for="(food, idx) in currentFoodList"
              :key="idx"
          >
            <view class="food-info">
              <text class="food-name">{{ food.name }}</text>
              <view class="food-tags">
                <text class="tag" v-if="food.spicy === false">不辣</text>
                <text class="tag" v-if="food.spicy === true">辣</text>
                <text class="tag type-tag">{{ food.type || currentMenu.label }}</text>
              </view>
              <text class="food-price">￥{{ getMinPrice(food) }}/份起</text>
            </view>
            <view class="food-action">
              <view v-if="getCartQuantity(food.id) > 0" class="quantity-control">
                <button class="qty-btn" @click="updateCartQuantity(food, -1)">−</button>
                <text class="qty-num">{{ getCartQuantity(food.id) }}</text>
                <button class="qty-btn" @click="updateCartQuantity(food, 1)">+</button>
              </view>
              <button v-else class="btn-select" @click="showSpecDialog(food)">选规格</button>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="cart-footer" v-if="totalCount > 0" @click="goToCart">
      <view class="cart-info">
        <view class="cart-icon-wrap">
          <text class="cart-icon">🛒</text>
          <text class="badge">{{ totalCount }}</text>
        </view>
        <view class="cart-price">
          <text class="price">￥{{ totalPrice.toFixed(2) }}</text>
          <text class="count">共 {{ totalCount }} 件</text>
        </view>
      </view>
      <view class="checkout-btn" @click="goToCart">去结算</view>
    </view>

    <uni-popup ref="specPopupRef" type="bottom" :safe-area="false">
      <view class="spec-dialog" v-if="selectedFood">
        <view class="dialog-header">
          <text class="dialog-title">选择规格</text>
          <text class="dialog-close" @click="closeSpecDialog">✕</text>
        </view>
        <view class="dialog-body">
          <text class="food-name-dialog">{{ selectedFood.name }}</text>
          <text class="food-price-dialog">￥{{ selectedSpecPrice.toFixed(2) }}</text>

          <view class="spec-section" v-if="selectedFood.specs && selectedFood.specs.length > 0">
            <text class="spec-label">规格 <text class="required">*</text></text>
            <view class="spec-options">
              <view
                  class="spec-option"
                  v-for="(spec, idx) in selectedFood.specs"
                  :key="idx"
                  :class="{ active: selectedSpecIndex === idx }"
                  @click="selectedSpecIndex = idx"
              >
                <text class="spec-name">{{ spec.name }}</text>
                <text class="spec-price">￥{{ spec.price || selectedFood.price }}</text>
              </view>
            </view>
          </view>

          <view class="spec-section" v-else>
            <text class="spec-label">规格</text>
            <text class="spec-default">默认规格</text>
          </view>

          <view class="quantity-section">
            <text class="spec-label">数量</text>
            <view class="quantity-control-dialog">
              <button class="qty-btn" @click="dialogQuantity > 1 && dialogQuantity--">−</button>
              <text class="qty-num">{{ dialogQuantity }}</text>
              <button class="qty-btn" @click="dialogQuantity++">+</button>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button
              class="btn-add-cart"
              @click="confirmAddToCart"
              :class="{ disabled: !canAddToCart }"
              :disabled="!canAddToCart"
          >
            {{ canAddToCart ? `加入购物车 ¥${(selectedSpecPrice * dialogQuantity).toFixed(2)}` : '请选择规格' }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import * as CartUtils from '@/store/cart'

const ShopName = ref<string>('')
const ShopAddress = ref<string>('')
const CategoryList = ref<any[]>([])
const AllDishes = ref<any[]>([])
const currentIndex = ref(0)

const selectedFood = ref<any>(null)
const selectedSpecIndex = ref<number>(-1)
const dialogQuantity = ref(1)
const specPopupRef = ref<any>(null)

// 购物车数据
const cartItems = ref<CartUtils.CartItem[]>([])

const menuList = computed(() => {
  if (CategoryList.value && CategoryList.value.length > 0) {
    return CategoryList.value.map(item => ({
      label: item.name || item.categoryName || '未知分类',
      id: item.id
    }))
  }
  return [{ label: '全部', id: 0 }]
})

const currentMenu = computed(() => {
  return menuList.value[currentIndex.value] || menuList.value[0]
})

const currentFoodList = computed(() => {
  if (CategoryList.value && CategoryList.value.length > 0) {
    const currentCategory = CategoryList.value[currentIndex.value]
    if (currentCategory?.foodList && currentCategory.foodList.length > 0) {
      return currentCategory.foodList
    }
    if (AllDishes.value.length > 0) {
      const categoryId = currentCategory?.id || (currentIndex.value + 1)
      return AllDishes.value.filter(dish => dish.category_id === categoryId)
    }
    return []
  }
  return AllDishes.value
})

const totalCount = computed(() => CartUtils.getTotalCount(cartItems.value))
const totalPrice = computed(() => CartUtils.getTotalPrice(cartItems.value))

// 获取当前选中规格的价格
const selectedSpecPrice = computed(() => {
  if (!selectedFood.value) return 0

  if (selectedFood.value.specs && selectedFood.value.specs.length > 0 && selectedSpecIndex.value >= 0) {
    const spec = selectedFood.value.specs[selectedSpecIndex.value]
    return spec.price || selectedFood.value.price || 0
  }

  return selectedFood.value.price || 0
})

const canAddToCart = computed(() => {
  if (!selectedFood.value) return false
  if (selectedFood.value.specs && selectedFood.value.specs.length > 0) {
    return selectedSpecIndex.value >= 0
  }
  return true
})

// 获取菜品最低价格（用于列表显示）
function getMinPrice(food: any): number {
  if (!food) return 0
  if (food.specs && food.specs.length > 0) {
    // 找出所有规格中最低的价格
    const prices = food.specs.map((s: any) => s.price || food.price || 0)
    return Math.min(...prices)
  }
  return food.price || 0
}

// ============ 购物车方法 ============
function loadCart() {
  cartItems.value = CartUtils.getCart()
}

function getCartQuantity(foodId: number) {
  return CartUtils.getItemQuantity(foodId)
}

function updateCartQuantity(food: any, delta: number) {
  const existing = cartItems.value.find((i: any) => i.dishId === food.id)

  if (existing) {
    CartUtils.updateCartQuantity(food.id, existing.specName, delta)
  } else {
    const defaultPrice = food.price || 0
    CartUtils.addToCart(food, 1, 0, '默认', defaultPrice)
  }
  loadCart()
}

function switchMenu(index: number) {
  if (currentIndex.value !== index) {
    currentIndex.value = index
  }
}

// ============ 规格弹窗相关 ============
function showSpecDialog(food: any) {
  selectedFood.value = food
  selectedSpecIndex.value = -1
  dialogQuantity.value = 1
  specPopupRef.value?.open()
}

function closeSpecDialog() {
  specPopupRef.value?.close()
}

function confirmAddToCart() {
  if (!canAddToCart.value) {
    uni.showToast({ title: '请选择规格', icon: 'none' })
    return
  }

  const food = selectedFood.value
  let specName = '默认'
  let specId = 0
  let specPrice = food.price || 0  // ✅ 默认使用菜品价格

  if (food.specs && food.specs.length > 0 && selectedSpecIndex.value >= 0) {
    const spec = food.specs[selectedSpecIndex.value]
    specName = spec.name || '默认'
    specId = typeof spec.id === 'number' ? spec.id : Number(spec.id) || (selectedSpecIndex.value + 1)
    specPrice = spec.price || food.price || 0
  }

  console.log('food:', food.name)
  console.log('specId:', specId)
  console.log('specName:', specName)
  console.log('specPrice:', specPrice)

  const success = CartUtils.addToCart(
      food,
      dialogQuantity.value,
      specId,
      specName,
      specPrice
  )

  if (success) {
    loadCart()
    uni.showToast({ title: '已加入购物车', icon: 'success' })
    closeSpecDialog()
  }
}

// ============ 跳转购物车 ============
function goToCart() {
  uni.switchTab({ url: '/pages/order/order' })
}

onShow(() => {
  loadCart()
})

onMounted(() => {
  loadCart()

  // 获取店铺信息
  uni.request({
    url: 'http://localhost:8081/api/store/getStoreName',
    success: (res: any) => {
      if (res.statusCode === 200 && res.data.data) {
        ShopName.value = res.data.data[0]?.name || ''
        ShopAddress.value = res.data.data[0]?.address || ''
      }
    }
  })

  // 获取分类
  uni.request({
    url: 'http://localhost:8081/api/category/getAllCategories',
    success: (res: any) => {
      if (res.statusCode === 200 && res.data.data) {
        CategoryList.value = res.data.data
        currentIndex.value = 0
      }
    }
  })

  // 获取所有菜品
  uni.request({
    url: 'http://localhost:8081/api/dish/getAllDishes',
    success: (res: any) => {
      if (res.statusCode === 200 && res.data.data) {
        AllDishes.value = res.data.data
        console.log('AllDishes:', AllDishes.value)
      }
    }
  })
})
</script>

<style scoped>
.spec-option {
  padding: 12rpx 28rpx;
  border: 2rpx solid #E5E5E5;
  border-radius: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100rpx;
  transition: all 0.3s ease;
}

.spec-option .spec-name {
  font-size: 26rpx;
  color: #666666;
}

.spec-option .spec-price {
  font-size: 22rpx;
  color: #FF6B35;
  margin-top: 4rpx;
}

.spec-option.active {
  border-color: #FF6B35;
  background: #FFF5F0;
}

.spec-option.active .spec-name {
  color: #FF6B35;
  font-weight: bold;
}

.spec-option.active .spec-price {
  color: #FF6B35;
}
</style>

<style scoped>
/* 原有样式保持不变，添加规格默认样式 */
.order-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F5F5;
}

.shop_information {
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  flex-shrink: 0;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.store-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.store-address {
  font-size: 26rpx;
  color: #666666;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding-bottom: 120rpx;
}

.menu-sidebar {
  width: 160rpx;
  background: #FFFFFF;
  flex-shrink: 0;
  height: 100%;
}

.menu-item {
  padding: 32rpx 20rpx;
  text-align: center;
  border-left: 6rpx solid transparent;
  transition: all 0.3s ease;
}

.menu-item.active {
  border-left-color: #FF6B35;
  background: #FFF5F0;
}

.menu-label {
  font-size: 26rpx;
  color: #666666;
}

.menu-item.active .menu-label {
  color: #FF6B35;
  font-weight: bold;
}

.content-area {
  flex: 1;
  padding: 20rpx 24rpx;
  background: #F5F5F5;
  height: 100%;
}

.category-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #FFE8E0;
  margin-bottom: 20rpx;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 40rpx;
}

.food-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.food-info {
  flex: 1;
  min-width: 0;
}

.food-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.food-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.tag {
  font-size: 20rpx;
  color: #999999;
  background: #F5F5F5;
  padding: 2rpx 14rpx;
  border-radius: 20rpx;
}

.tag.type-tag {
  color: #FF6B35;
  background: #FFF0EA;
}

.food-price {
  font-size: 34rpx;
  color: #FF6B35;
  font-weight: bold;
  display: block;
}

.food-action {
  flex-shrink: 0;
  margin-left: 20rpx;
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
}

.qty-btn:active {
  opacity: 0.7;
}

.qty-num {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  min-width: 40rpx;
  text-align: center;
}

.btn-select {
  background: #FF6B35;
  color: #FFFFFF;
  border: none;
  border-radius: 40rpx;
  padding: 14rpx 36rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.btn-select:active {
  opacity: 0.8;
}

.btn-select::after {
  border: none;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-radius: 20rpx 20rpx 0 0;
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.cart-icon-wrap {
  position: relative;
}

.cart-icon {
  font-size: 44rpx;
}

.badge {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  background: #FF3B30;
  color: #FFFFFF;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  text-align: center;
  line-height: 32rpx;
  padding: 0 6rpx;
}

.cart-price {
  display: flex;
  flex-direction: column;
}

.cart-price .price {
  font-size: 34rpx;
  font-weight: bold;
  color: #FF6B35;
}

.cart-price .count {
  font-size: 22rpx;
  color: #999999;
}

.checkout-btn {
  background: #FF6B35;
  color: #FFFFFF;
  border-radius: 40rpx;
  padding: 16rpx 48rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.checkout-btn:active {
  opacity: 0.8;
}

/* 规格弹窗 */
.spec-dialog {
  background: #FFFFFF;
  border-radius: 32rpx 32rpx 0 0;
  padding: 30rpx 32rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 30rpx);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.dialog-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.dialog-close {
  font-size: 36rpx;
  color: #999999;
  padding: 8rpx;
}

.dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.food-name-dialog {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.food-price-dialog {
  font-size: 36rpx;
  color: #FF6B35;
  font-weight: bold;
  margin: 8rpx 0 24rpx;
}

.spec-section {
  width: 100%;
  margin-bottom: 24rpx;
}

.spec-label {
  font-size: 28rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
}

.spec-options {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.spec-option {
  padding: 12rpx 28rpx;
  border: 2rpx solid #E5E5E5;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #666666;
}

.spec-option.active {
  border-color: #FF6B35;
  color: #FF6B35;
  background: #FFF5F0;
}

.spec-default {
  font-size: 28rpx;
  color: #999999;
  padding: 12rpx 0;
}

.required {
  color: #FF3B30;
}

.quantity-section {
  width: 100%;
  margin-top: 8rpx;
}

.quantity-control-dialog {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.dialog-footer {
  margin-top: 32rpx;
  width: 100%;
}

.btn-add-cart {
  width: 100%;
  background: #FF6B35;
  color: #FFFFFF;
  border: none;
  border-radius: 40rpx;
  padding: 24rpx 0;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-add-cart.disabled,
.btn-add-cart:disabled {
  background: #E0E0E0;
  color: #999999;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-add-cart:active {
  opacity: 0.8;
}
</style>