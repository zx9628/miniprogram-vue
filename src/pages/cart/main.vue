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
          <view class="select-btn" @click="selectProduct(product)">选规格</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && filteredProducts.length === 0" class="empty-state">
        <text>该分类暂无菜品</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllDishes } from "@/http/dish"

const props = defineProps({
  categoryIndex: {
    type: Number,
    default: 0
  }
})

const productList = ref([])
const categoryList = ref([])
const loading = ref(false)

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

  const result = productList.value.filter(item => item.category === categoryName)
  return result
})

const selectProduct = (product) => {
  uni.showToast({
    title: `选择了 ${product.name}`,
    icon: 'none'
  })
}

const fetchData = async () => {
  try {
    loading.value = true

    const response = await getAllDishes()
    console.log('Main 获取到的数据:', response)

    let data = []
    if (response && response.code === 200) {
      if (Array.isArray(response.data)) {
        data = response.data
      } else {
        data = []
      }
    } else if (Array.isArray(response)) {
      data = response
    } else {
      data = []
    }

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
      console.log('Main 提取的分类:', categories)
    }

  } catch (err) {
    console.error('获取数据失败:', err)
    productList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
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