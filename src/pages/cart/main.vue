<template>
  <view class="main-container">
    <scroll-view class="product-list" scroll-y>
      <!-- 数据列表 -->
      <view class="product-card" v-for="product in filteredProducts" :key="product.id">
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-desc" v-if="product.desc">{{ product.desc }}</text>
          <view class="product-price">
            <text class="price-symbol">￥</text>
            <text class="price-number">{{ product.price }}</text>
            <text class="price-unit">/份起</text>
          </view>
        </view>
        <view class="product-action">
          <view class="tag" v-if="product.tag">{{ product.tag }}</view>
          <view class="select-btn" @click="openSpecModal(product)">选规格</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && filteredProducts.length === 0" class="empty-state">
        <text>该分类暂无菜品</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 使用独立的弹窗组件 -->
    <window-one
        :visible="showModal"
        :product="selectedProduct"
        :spec-options="specOptions"
        :extra-options="extraOptions"
        :side-options="sideOptions"
        :packaging-options="packagingOptions"
        @close="closeModal"
        @confirm="handleAddToCart"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getDishInfo } from "@/http/dish"
import windowOne from './specificationWindow/windowOne.vue'

// ==================== Props ====================
const props = defineProps({
  categoryIndex: {
    type: Number,
    default: 0
  },
  storeId: {
    type: Number,
    default: 0
  }
})

// ==================== 数据 ====================
const productList = ref([])
const categoryList = ref([])
const loading = ref(false)

// ==================== 弹窗相关 ====================
const showModal = ref(false)
const selectedProduct = ref(null)

// 规格选项
const specOptions = ref([
  { name: '2两圆粉' },
  { name: '2两切粉' },
  { name: '3两圆粉' },
  { name: '3两切粉' }
])

// 加量选项
const extraOptions = ref([
  { name: '加一两圆粉' },
  { name: '加一两切粉' }
])

// 配菜选项
const sideOptions = ref([
  { name: '配菜卤蛋', price: 2.5, soldOut: false },
  { name: '配菜豆干', price: 2.5, soldOut: false },
  { name: '配菜煎蛋', price: 2.5, soldOut: false },
  { name: '配菜青菜', price: 2.5, soldOut: true }
])

// 打包选项
const packagingOptions = ref([
  { name: '打包盒', price: 2 },
  { name: '袋子', price: 0 }
])

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

// ==================== 计算属性 ====================
const currentCategoryName = computed(() => {
  if (categoryList.value.length > 0 && props.categoryIndex >= 0 && props.categoryIndex < categoryList.value.length) {
    return categoryList.value[props.categoryIndex].name
  }
  return ''
})

const filteredProducts = computed(() => {
  if (!Array.isArray(productList.value) || productList.value.length === 0) {
    return []
  }
  const categoryName = currentCategoryName.value
  if (!categoryName) {
    return []
  }
  return productList.value.filter(item => item.category === categoryName)
})

// ==================== 方法 ====================
const openSpecModal = (product) => {
  selectedProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const handleAddToCart = (order) => {
  console.log('加入购物车:', order)

  uni.showToast({
    title: `已添加 ${order.product?.name}`,
    icon: 'success'
  })

  closeModal()
}

// ==================== 获取数据 ====================
const fetchData = async (shopId) => {
  if (!shopId || shopId === 0) {
    console.warn('⚠️ 未传入门店ID，跳过数据加载')
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log(`🔄 加载门店 ${shopId} 的菜品数据...`)

    const response = await getDishInfo(shopId)

    let data = []
    if (response && response.code === 200) {
      if (Array.isArray(response.data)) {
        data = response.data
      }
    } else if (Array.isArray(response)) {
      data = response
    }

    // 处理图片数据
    data = data.map(product => {
      return {
        ...product,
        image: getValidImage(product.image)
      }
    })

    productList.value = data

    if (data.length > 0) {
      const categoryMap = new Map()
      data.forEach(product => {
        const category = product.category
        if (category) {
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
        }
      })
      const categories = []
      categoryMap.forEach((count, name) => {
        categories.push({ name, count })
      })
      categoryList.value = categories
    }

  } catch (err) {
    console.error('获取数据失败:', err)
    productList.value = []
  } finally {
    loading.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  fetchData(props.storeId)
})

watch(() => props.storeId, (newVal) => {
  if (newVal && newVal > 0) {
    console.log(`🔄 门店ID变化为 ${newVal}，重新加载数据`)
    fetchData(newVal)
  }
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  position: relative;
}

.product-list {
  height: 100%;
  padding: 16rpx 24rpx 0;
  box-sizing: border-box;
}

.product-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.product-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.product-desc {
  font-size: 22rpx;
  color: #999;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
  margin-top: 4rpx;
}

.price-symbol {
  font-size: 22rpx;
  color: #ff4d4f;
}

.price-number {
  font-size: 34rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.price-unit {
  font-size: 20rpx;
  color: #999;
  margin-left: 4rpx;
}

.product-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.tag {
  font-size: 18rpx;
  color: #ff6a00;
  background: #fff7e6;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
}

.select-btn {
  font-size: 24rpx;
  color: #07c160;
  background: #f0faf5;
  padding: 6rpx 24rpx;
  border-radius: 30rpx;
  border: 1rpx solid #07c160;
  font-weight: 500;
}

.bottom-placeholder {
  height: 120rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>