<template>
  <view class="container">
    <view class="header">点餐</view>

    <view class="main-body">

      <!-- 左侧：分类导航 -->
      <scroll-view scroll-y class="left-menu" :scroll-into-view="leftScrollId">
        <view
            v-for="(item, index) in categories"
            :key="index"
            :id="'left-' + index"
            class="menu-item"
            :class="{ active: currentIndex === index }"
            @click="handleCategoryClick(index)"
        >
          <text class="menu-name">{{ item.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧：商品列表 -->
      <scroll-view
          scroll-y
          class="right-content"
          :scroll-top="rightScrollTop"
          @scroll="handleRightScroll"
          @scrolltoupper="handleScrollToUpper"
      >
        <!-- 按分类分组渲染商品 -->
        <view
            v-for="(cat, catIndex) in categories"
            :key="catIndex"
            :id="'right-' + catIndex"
        >
          <!-- 分类标题（用于获取位置） -->
          <view class="category-title" :id="'cat-title-' + catIndex">
            <text>{{ cat.name }}</text>
          </view>

          <!-- 该分类下的商品列表 -->
          <view
              v-for="(product, pIndex) in cat.products"
              :key="pIndex"
              class="product-item"
          >
            <view class="img-box"></view>
            <view class="info-box">
              <text class="p-name">{{ product.name }}</text>
              <text class="p-desc">{{ product.desc }}</text>
              <view class="price-row">
                <text class="price">¥{{ product.price }}</text>
                <view class="add-btn">+</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部占位，确保最后一个分类能滚到顶部 -->
        <view class="bottom-placeholder"></view>
      </scroll-view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

// --- 数据定义 ---
const currentIndex = ref(0);
const leftScrollId = ref('');
const rightScrollTop = ref(0);

// 记录每个分类标题的 offsetTop
const categoryOffsets = ref<number[]>([]);

// 防止点击左侧时，右侧滚动事件反向干扰
let isClickScrolling = false;

const categories = ref([
  {
    name: '🔥 店长推荐',
    products: [
      { name: '招牌酸菜牛肉粉', desc: '酸爽开胃，牛肉鲜嫩', price: '32.00' },
      { name: '秘制红烧牛肉粉', desc: '浓汤慢炖，入口即化', price: '35.00' },
    ]
  },
  {
    name: '🍜 经典牛肉粉',
    products: [
      { name: '原味牛肉粉', desc: '清汤鲜美，原味呈现', price: '25.00' },
      { name: '麻辣牛肉粉', desc: '麻辣鲜香，过瘾十足', price: '28.00' },
      { name: '番茄牛肉粉', desc: '酸甜可口，营养丰富', price: '26.00' },
      { name: '酸菜牛肉粉', desc: '酸爽开胃，回味无穷', price: '28.00' },
    ]
  },
  {
    name: '🍲 特色火锅粉',
    products: [
      { name: '麻辣火锅粉', desc: '地道川味，麻辣鲜香', price: '38.00' },
      { name: '番茄火锅粉', desc: '酸甜浓郁，老少皆宜', price: '36.00' },
      { name: '菌菇火锅粉', desc: '菌香四溢，鲜美无比', price: '38.00' },
    ]
  },
  {
    name: '🥤 冰爽饮料',
    products: [
      { name: '冰柠檬茶', desc: '清爽解腻，夏日必备', price: '8.00' },
      { name: '酸梅汤', desc: '酸甜可口，古法熬制', price: '6.00' },
      { name: '冰豆浆', desc: '现磨现煮，醇香浓郁', price: '5.00' },
      { name: '可乐', desc: '经典碳酸饮料', price: '5.00' },
    ]
  },
  {
    name: '🥗 爽口凉菜',
    products: [
      { name: '凉拌黄瓜', desc: '清脆爽口，蒜香浓郁', price: '12.00' },
      { name: '口水鸡', desc: '麻辣鲜香，口感嫩滑', price: '22.00' },
      { name: '皮蛋豆腐', desc: '清凉解暑，经典搭配', price: '15.00' },
    ]
  },
  {
    name: '🍚 米饭套餐',
    products: [
      { name: '红烧牛肉饭', desc: '大块牛肉，米饭喷香', price: '30.00' },
      { name: '番茄鸡蛋饭', desc: '家常味道，营养均衡', price: '22.00' },
      { name: '卤肉饭', desc: '肥而不腻，入口即化', price: '25.00' },
    ]
  },
  {
    name: '🍢 卤味小吃',
    products: [
      { name: '卤鸡蛋', desc: '五香卤制，入味Q弹', price: '3.00' },
      { name: '卤豆干', desc: '香辣卤味，越嚼越香', price: '5.00' },
      { name: '卤鸭脖', desc: '麻辣鲜香，啃得过瘾', price: '12.00' },
      { name: '卤鸡翅', desc: '皮脆肉嫩，卤香四溢', price: '8.00' },
    ]
  },
  {
    name: '🧂 加料区',
    products: [
      { name: '加牛肉', desc: '额外加一份牛肉', price: '10.00' },
      { name: '加青菜', desc: '新鲜时蔬', price: '3.00' },
      { name: '加卤蛋', desc: '五香卤蛋一个', price: '3.00' },
    ]
  },
]);

// --- 获取每个分类标题的位置 ---
const getCategoryOffsets = () => {
  const query = uni.createSelectorQuery();
  categories.value.forEach((_, index) => {
    query.select(`#cat-title-${index}`).boundingClientRect();
  });
  query.exec((res: any[]) => {
    categoryOffsets.value = res.map((item: any) => item?.top || 0);
    console.log('分类位置:', categoryOffsets.value);
  });
};

// --- 右侧滚动事件：根据滚动位置更新左侧选中分类 ---
const handleRightScroll = (e: any) => {
  // 如果是点击左侧触发的滚动，不反向更新
  if (isClickScrolling) return;

  const scrollTop = e.detail.scrollTop;
  const offsets = categoryOffsets.value;

  if (offsets.length === 0) return;

  // 从后往前遍历，找到第一个 offsetTop <= scrollTop 的分类
  for (let i = offsets.length - 1; i >= 0; i--) {
    if (scrollTop >= offsets[i] - 5) { // 加 5rpx 容差
      if (currentIndex.value !== i) {
        currentIndex.value = i;
        // 同步左侧滚动位置
        leftScrollId.value = '';
        nextTick(() => {
          leftScrollId.value = 'left-' + i;
        });
      }
      break;
    }
  }
};

// 滚动到顶部时重置为第一个分类
const handleScrollToUpper = () => {
  if (isClickScrolling) return;
  currentIndex.value = 0;
  leftScrollId.value = '';
  nextTick(() => {
    leftScrollId.value = 'left-0';
  });
};

// --- 左侧点击：滚动右侧到对应分类 ---
const handleCategoryClick = (index: number) => {
  currentIndex.value = index;

  // 滚动左侧导航，让选中项可见
  leftScrollId.value = '';
  nextTick(() => {
    leftScrollId.value = 'left-' + index;
  });

  // 滚动右侧到对应分类位置
  isClickScrolling = true;
  rightScrollTop.value = categoryOffsets.value[index] || 0;

  // 等滚动动画结束后，解除锁定
  setTimeout(() => {
    isClickScrolling = false;
  }, 300);
};

// --- 生命周期 ---
onMounted(() => {
  // 延迟获取，确保 DOM 渲染完毕
  setTimeout(() => {
    getCategoryOffsets();
  }, 300);
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

.header {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
}

.main-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* --- 左侧菜单 --- */
.left-menu {
  width: 180rpx;
  height: 100%;
  background-color: #f7f8fa;
}

.menu-item {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
  position: relative;
}

.menu-item.active {
  background-color: #fff;
  color: #d93a3a;
  font-weight: bold;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 30rpx;
  bottom: 30rpx;
  width: 6rpx;
  background-color: #d93a3a;
  border-radius: 0 4rpx 4rpx 0;
}

/* --- 右侧内容 --- */
.right-content {
  flex: 1;
  height: 100%;
  background-color: #fff;
}

.category-title {
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  background-color: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.img-box {
  width: 150rpx;
  height: 150rpx;
  background-color: #f0f0f0;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.p-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.p-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.price {
  color: #d93a3a;
  font-size: 32rpx;
  font-weight: bold;
}

.add-btn {
  width: 44rpx;
  height: 44rpx;
  background-color: #d93a3a;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 44rpx;
  font-size: 32rpx;
}

/* 底部占位，确保最后一个分类能滚到顶部被检测到 */
.bottom-placeholder {
  height: 60vh;
}
</style>