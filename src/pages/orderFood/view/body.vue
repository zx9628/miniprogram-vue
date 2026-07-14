<template>
  <view class="order-page">
    <!-- 主内容区域：左侧菜单 + 右侧菜品 -->
    <view class="main-content">
      <!-- 左侧菜单 -->
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

      <!-- 右侧内容 -->
      <scroll-view class="content-area" scroll-y>
        <view class="category-title">{{ currentMenu.label }}</view>

        <!-- 菜品列表 -->
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
                <text class="tag type-tag">{{ food.type }}</text>
              </view>
              <text class="food-price">￥{{ food.price }}/份起</text>
              <text class="food-recommend" v-if="food.recommend">🔥 {{ food.recommend }}人推荐</text>
            </view>
            <view class="food-action">
              <!-- 判断是否已在购物车中 -->
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

    <!-- 底部购物车浮层 -->
    <view class="cart-footer" v-if="cartStore.totalCount > 0" @click="goToCart">
      <view class="cart-info">
        <view class="cart-icon-wrap">
          <text class="cart-icon">🛒</text>
          <text class="badge">{{ cartStore.totalCount }}</text>
        </view>
        <view class="cart-price">
          <text class="price">￥{{ cartStore.totalPrice.toFixed(2) }}</text>
          <text class="count">共 {{ cartStore.totalCount }} 件</text>
        </view>
      </view>
      <view class="checkout-btn">
        去结算
      </view>
    </view>

    <!-- 规格选择弹窗 -->
    <uni-popup ref="specPopup" type="bottom" :safe-area="false">
      <view class="spec-dialog" v-if="selectedFood">
        <view class="dialog-header">
          <text class="dialog-title">选择规格</text>
          <text class="dialog-close" @click="closeSpecDialog">✕</text>
        </view>
        <view class="dialog-body">
          <image class="food-preview" :src="selectedFood.image || '/static/images/default-food.png'" mode="aspectFill"></image>
          <text class="food-name-dialog">{{ selectedFood.name }}</text>
          <text class="food-price-dialog">￥{{ selectedFood.price }}</text>

          <view class="spec-section">
            <text class="spec-label">规格</text>
            <view class="spec-options">
              <view
                  class="spec-option"
                  v-for="(spec, idx) in specOptions"
                  :key="idx"
                  :class="{ active: currentSpec === spec }"
                  @click="currentSpec = spec"
              >
                {{ spec }}
              </view>
            </view>
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
          <button class="btn-add-cart" @click="confirmAddToCart">加入购物车</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/store/cart'
import { onShow } from '@dcloudio/uni-app'


export default {
  setup() {
    const cartStore = useCartStore()

    const currentIndex = ref(0)
    const selectedFood = ref(null)
    const currentSpec = ref('默认')
    const dialogQuantity = ref(1)
    const specPopup = ref(null)

    const menuList = ref([
      { label: '原汤单点' },
      { label: '原汤套餐' },
      { label: '干拌单点' },
      { label: '干拌套餐' },
      { label: '精选小吃' },
      { label: '爆款饮品' }
    ])

    const foodData = ref({
      '原汤单点': [
        { id: 1, name: '原汤牛肉片粉', price: 13.5, spicy: false, type: '汤粉', recommend: 79 },
        { id: 2, name: '全家福牛肉粉', price: 25, spicy: false, type: '汤粉', recommend: 0 },
        { id: 3, name: '原汤牛肉丸粉', price: 18, spicy: false, type: '汤粉', recommend: 45 }
      ],
      '原汤套餐': [
        { id: 4, name: '原汤套餐A', price: 35, spicy: false, type: '套餐', recommend: 32 },
        { id: 5, name: '原汤套餐B', price: 45, spicy: false, type: '套餐', recommend: 28 },
        { id: 6, name: '原汤全家福套餐', price: 55, spicy: false, type: '套餐', recommend: 18 }
      ],
      '干拌单点': [
        { id: 7, name: '干拌牛肉粉', price: 16, spicy: true, type: '干拌', recommend: 56 },
        { id: 8, name: '干拌肥肠粉', price: 18, spicy: true, type: '干拌', recommend: 34 },
        { id: 9, name: '干拌三鲜粉', price: 15, spicy: false, type: '干拌', recommend: 21 }
      ],
      '干拌套餐': [
        { id: 10, name: '干拌套餐A', price: 32, spicy: true, type: '套餐', recommend: 27 },
        { id: 11, name: '干拌套餐B', price: 38, spicy: true, type: '套餐', recommend: 19 }
      ],
      '精选小吃': [
        { id: 12, name: '卤蛋', price: 3, spicy: false, type: '小吃', recommend: 98 },
        { id: 13, name: '牛肉串', price: 12, spicy: true, type: '小吃', recommend: 67 },
        { id: 14, name: '炸豆腐', price: 8, spicy: false, type: '小吃', recommend: 45 },
        { id: 15, name: '酸辣鸡爪', price: 15, spicy: true, type: '小吃', recommend: 34 }
      ],
      '爆款饮品': [
        { id: 16, name: '冰镇酸梅汤', price: 8, spicy: false, type: '饮品', recommend: 78 },
        { id: 17, name: '柠檬茶', price: 10, spicy: false, type: '饮品', recommend: 56 },
        { id: 18, name: '鲜榨果汁', price: 12, spicy: false, type: '饮品', recommend: 43 }
      ]
    })

    // 规格选项
    const specOptions = ['默认', '微辣', '中辣', '特辣']

    const currentMenu = computed(() => {
      return menuList.value[currentIndex.value] || menuList.value[0]
    })

    const currentFoodList = computed(() => {
      const menuLabel = currentMenu.value.label
      return foodData.value[menuLabel] || []
    })

    // 获取商品在购物车中的数量
    function getCartQuantity(foodId) {
      const item = cartStore.items.find(i => i.id === foodId)
      return item ? item.quantity : 0
    }

    // 直接在列表中修改数量（快速加/减）
    function updateCartQuantity(food, delta) {
      const existing = cartStore.items.find(i => i.id === food.id)
      if (existing) {
        cartStore.updateQuantity(food.id, existing.spec, delta)
      } else {
        // 如果没有默认规格，用默认规格添加
        cartStore.addItem(food, 1, '默认')
      }
    }

    // 切换菜单
    function switchMenu(index) {
      if (currentIndex.value !== index) {
        currentIndex.value = index
      }
    }

    // 显示规格弹窗
    function showSpecDialog(food) {
      selectedFood.value = food
      currentSpec.value = '默认'
      dialogQuantity.value = 1
      specPopup.value.open()
    }

    // 关闭弹窗
    function closeSpecDialog() {
      specPopup.value.close()
    }

    // 确认加入购物车
    function confirmAddToCart() {
      if (selectedFood.value) {
        cartStore.addItem(selectedFood.value, dialogQuantity.value, currentSpec.value)
        uni.showToast({ title: '已加入购物车', icon: 'success' })
        closeSpecDialog()
      }
    }

    // 跳转购物车
    function goToCart() {
      uni.switchTab({ url: '/pages/order/order' })
    }

    onShow(() => {
      cartStore.initCart()
    })

    onMounted(() => {
      console.log('=== Body 组件已加载出来 ===')

      cartStore.initCart()
      // 从后端获取数据
      uni.request({
        url: 'https://ph.juntaitec.cn/api/dish/getAllDishes',
        success: (res) => {
          console.log('获取菜品数据成功', res)
          // 更新 foodData
        },
        fail: (err) => {
          console.log('获取菜品数据失败', err)
        }
      })
    })

    return {
      cartStore,
      currentIndex,
      menuList,
      foodData,
      currentMenu,
      currentFoodList,
      selectedFood,
      currentSpec,
      dialogQuantity,
      specOptions,
      specPopup,
      getCartQuantity,
      updateCartQuantity,
      switchMenu,
      showSpecDialog,
      closeSpecDialog,
      confirmAddToCart,
      goToCart
    }
  }
}
</script>

<style scoped>
.order-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F5F5;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding-bottom: 120rpx;
}

/* 左侧菜单 */
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

/* 右侧内容 */
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

/* 菜品列表 */
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
  margin-bottom: 4rpx;
}

.food-recommend {
  font-size: 22rpx;
  color: #FF6B35;
}

.food-action {
  flex-shrink: 0;
  margin-left: 20rpx;
}

/* 数量控制（在列表中） */
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

/* 底部购物车浮层 */
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

/* ===== 规格选择弹窗 ===== */
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

.food-preview {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
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

.btn-add-cart:active {
  opacity: 0.8;
}
</style>