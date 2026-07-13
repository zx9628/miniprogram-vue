<template>
  <view class="aside-container">
    <view class="aside-title">
      <text>分类</text>
    </view>

    <scroll-view class="category-list" scroll-y :show-scrollbar="false">
      <view
          v-for="(item, index) in categoryList"
          :key="item.name"
          class="category-item"
          :class="{ active: currentCategory === index }"
          @click="switchCategory(index)"
      >
        <text class="category-name">{{ item.name }}</text>
        <text class="category-count" v-if="item.count">{{ item.count }}</text>
      </view>

      <view v-if="loading" class="loading-text">加载中...</view>
      <view v-if="!loading && categoryList.length === 0" class="empty-text">
        暂无分类
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getDishInfo } from "@/http/dish"

// ==================== Props ====================
const props = defineProps({
  storeId: {
    type: Number,
    default: 0
  }
})

// ==================== 数据 ====================
interface CategoryItem {
  name: string
  count?: number
}

const currentCategory = ref(0)
const categoryList = ref<CategoryItem[]>([])
const loading = ref(false)

// ==================== 事件 ====================
const emit = defineEmits(['categoryChange'])

// ==================== 核心函数 ====================
const extractCategories = (products: any[]) => {
  if (!Array.isArray(products) || products.length === 0) {
    return []
  }

  const categoryMap = new Map<string, number>()
  products.forEach(product => {
    const category = product.category
    if (category) {
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    }
  })

  const result: CategoryItem[] = []
  categoryMap.forEach((count, name) => {
    result.push({ name, count })
  })

  console.log('📊 提取的分类:', result)
  return result
}

// ==================== 获取数据 ====================
const fetchCategories = async (shopId: number) => {
  if (!shopId || shopId === 0) {
    console.warn('⚠️ Aside: 未传入门店ID，跳过加载')
    categoryList.value = []
    return
  }

  try {
    loading.value = true
    console.log(`🔄 Aside: 加载门店 ${shopId} 的分类数据...`)

    const response = await getDishInfo(shopId)
    console.log(response);

    let products: any[] = []
    if (response && response.code === 200) {
      if (Array.isArray(response.data)) {
        products = response.data
      }
    } else if (Array.isArray(response)) {
      products = response
    }

    const categories = extractCategories(products)
    categoryList.value = categories

    if (categories.length > 0) {
      currentCategory.value = 0
      emit('categoryChange', 0)
    }

  } catch (err) {
    console.error('Aside: 获取分类失败:', err)
    categoryList.value = []
  } finally {
    loading.value = false
  }
}

// ==================== 切换分类 ====================
const switchCategory = (index: number) => {
  if (currentCategory.value === index) return
  currentCategory.value = index
  emit('categoryChange', index)
}

// ==================== 监听 storeId ====================
watch(() => props.storeId, (newVal) => {
  if (newVal && newVal > 0) {
    fetchCategories(newVal)
  }
}, { immediate: true })

// ==================== 暴露方法 ====================
defineExpose({
  refresh: fetchCategories,
  categoryList,
  currentCategory
})
</script>

<style scoped>
.aside-container {
  width: 180rpx;
  height: 100%;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  border-right: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.aside-title {
  padding: 24rpx 0 16rpx 24rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  background: #f8f8f8;
  flex-shrink: 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-list {
  flex: 1;
  padding: 12rpx 0;
}

.category-item {
  padding: 20rpx 0 20rpx 24rpx;
  margin: 4rpx 0;
  border-left: 6rpx solid transparent;
  transition: all 0.3s;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 16rpx;
}

.category-item.active {
  background: #ffffff;
  border-left-color: #07c160;
}

.category-item.active .category-name {
  color: #07c160;
  font-weight: bold;
}

.category-name {
  font-size: 26rpx;
  color: #666;
  transition: color 0.3s;
  flex: 1;
}

.category-count {
  font-size: 20rpx;
  color: #999;
  background: #f0f0f0;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.category-item.active .category-count {
  background: #e8f5e9;
  color: #07c160;
}

.loading-text,
.empty-text {
  text-align: center;
  padding: 60rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>