<template>
  <view class="aside-container">
    <view class="aside-title">
      <text>分类</text>
    </view>

    <scroll-view class="category-list" scroll-y :show-scrollbar="false">
      <view
          v-for="(item, index) in categoryList"
          :key="index"
          class="category-item"
          :class="{ active: currentCategory === index }"
          @click="switchCategory(index)"
      >
        <text class="category-name">{{ item.name }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const categoryList = ref([
  { name: '原汤单点' },
  { name: '原汤套餐' },
  { name: '不辣汤粉' },
  { name: '干拌单点' },
  { name: '干拌套餐' },
  { name: '镇店之宝' },
  { name: '精选小吃' },
  { name: '爆款饮品' }
])

const currentCategory = ref(0)
const emit = defineEmits(['categoryChange'])

const switchCategory = (index: number) => {
  currentCategory.value = index
  emit('categoryChange', index)
}
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
}
</style>