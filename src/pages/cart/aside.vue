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
        <!-- 可选：显示数量 -->
        <text class="category-count" v-if="item.count">{{ item.count }}</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-text">加载中...</view>

      <!-- 空状态 -->
      <view v-if="!loading && categoryList.length === 0" class="empty-text">
        暂无分类
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getAllDishes } from "@/http/dish"

// 分类项接口
interface CategoryItem {
  name: string
  count?: number  // 可选：该分类下的菜品数量
}

// 当前选中的分类索引
const currentCategory = ref(0)
// 分类列表
const categoryList = ref<CategoryItem[]>([])
// 加载状态
const loading = ref(false)
// 所有菜品数据（用于计算每个分类的数量）
const allProducts = ref<any[]>([])

// 事件
const emit = defineEmits(['categoryChange'])

//  核心函数：从菜品数据中提取分类
const extractCategories = (products: any[]) => {
  if (!Array.isArray(products) || products.length === 0) {
    return []
  }

  // 使用 Map 统计每个分类及其数量
  const categoryMap = new Map<string, number>()

  products.forEach(product => {
    const category = product.category
    if (category) {
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    }
  })

  // 转换为数组格式
  const result: CategoryItem[] = []
  categoryMap.forEach((count, name) => {
    result.push({ name, count })
  })

  console.log('提取的分类:', result)
  return result
}

// 获取数据并更新分类
const fetchCategories = async () => {
  try {
    loading.value = true

    const response = await getAllDishes()
    console.log('获取到的原始数据:', response)

    // 提取数据
    let products: any[] = []
    if (response && response.code === 200) {
      if (Array.isArray(response.data)) {
        products = response.data
        console.log(`✅ 从 response.data 提取数据，共 ${products.length} 条`)
      } else {
        console.warn('response.data 不是数组:', response.data)
        products = []
      }
    } else if (Array.isArray(response)) {
      products = response
      console.log(`✅ 直接返回数组，共 ${products.length} 条`)
    } else {
      console.warn('未知的数据格式:', response)
      products = []
    }

    // 保存所有数据
    allProducts.value = products

    // 提取分类
    const categories = extractCategories(products)
    categoryList.value = categories

    console.log(`✅ 成功提取 ${categories.length} 个分类`)

    // 如果有分类，默认选中第一个，并通知父组件
    if (categories.length > 0) {
      currentCategory.value = 0
      emit('categoryChange', 0)
    }

  } catch (err) {
    console.error('获取数据失败:', err)
    categoryList.value = []
    uni.showToast({
      title: '加载分类失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 切换分类
const switchCategory = (index: number) => {
  if (currentCategory.value === index) return // 如果点击的是同一个，不做处理

  currentCategory.value = index
  emit('categoryChange', index)
}

// 监听父组件传递的分类索引变化（如果需要从外部控制）
// 如果父组件需要控制选中的分类，可以取消注释
// watch(() => props.activeIndex, (newIndex) => {
//   if (newIndex !== undefined && newIndex >= 0 && newIndex < categoryList.value.length) {
//     currentCategory.value = newIndex
//   }
// })

// 组件挂载时加载数据
onMounted(() => {
  fetchCategories()
})

// 暴露方法给父组件（如果需要）
defineExpose({
  refresh: fetchCategories,  // 刷新分类列表
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