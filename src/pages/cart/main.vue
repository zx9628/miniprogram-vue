<template>
  <view class="main-container">
    <scroll-view class="product-list" scroll-y>
      <view class="product-card" v-for="(product, index) in filteredProducts" :key="index">
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
      <view class="bottom-placeholder"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  categoryIndex: number
}>()

const productList = ref([
  { category: 0, name: '全家福牛肉粉', desc: '79人推荐', price: '25', tag: '' },
  { category: 0, name: '原汤牛肉片粉', desc: '79人推荐', price: '13.5', tag: '' },
  { category: 0, name: '牛肉干', desc: '', price: '13.5', tag: '' },
  { category: 1, name: '原汤套餐A', desc: '含小菜', price: '35', tag: '推荐' },
  { category: 1, name: '原汤套餐B', desc: '含饮品', price: '38', tag: '' },
  { category: 2, name: '酸辣汤粉', desc: '5人推荐', price: '16', tag: '' },
  { category: 3, name: '干拌牛肉粉', desc: '12人推荐', price: '22', tag: '新品' },
  { category: 4, name: '干拌套餐', desc: '含汤+小菜', price: '30', tag: '' }
])

const filteredProducts = computed(() => {
  return productList.value.filter(p => p.category === props.categoryIndex)
})

const selectProduct = (product: any) => {
  uni.showToast({
    title: `选择了 ${product.name}`,
    icon: 'none'
  })
}
</script>

<style scoped>
.main-container {
  flex: 1;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
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
</style>