<template>
  <view class="order-page">
    <!-- 顶部店铺信息 -->
    <view class="shop_information">
      <view class="store-name">{{ ShopName }}</view>
      <view class="store-address">{{ ShopAddress }}</view>
    </view>

    <!-- 内容区域：左侧菜单 + 右侧内容 -->
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
        <!-- 分类标题 -->
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
              <button class="btn-select" @click="selectFood(food)">选规格</button>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// ============ 数据定义 ============
const ShopName = ref<string>('');
const ShopAddress = ref<string>('');
const CategoryList = ref<any[]>([]);

// 当前选中的菜单索引
const currentIndex = ref(0);

// 默认菜单（当后端数据未加载时显示）
const defaultMenuList = [
];

// 默认菜品数据（当后端数据未加载时显示）
const defaultFoodData: Record<string, any[]> = {
  '原汤单点': [
    {
      id: 1,
      name: '原汤牛肉片粉',
      price: 13.5,
      spicy: false,
      type: '汤粉',
      recommend: 79
    },
    {
      id: 2,
      name: '原汤牛腩粉',
      price: 16.0,
      spicy: false,
      type: '汤粉',
      recommend: 65
    }
  ],
  '原汤套餐': [
    {
      id: 3,
      name: '原汤牛肉粉套餐',
      price: 25.0,
      spicy: false,
      type: '套餐',
      recommend: 88
    }
  ],
  '干拌单点': [
    {
      id: 4,
      name: '干拌牛肉粉',
      price: 14.0,
      spicy: true,
      type: '干拌',
      recommend: 72
    }
  ],
  '干拌套餐': [
    {
      id: 5,
      name: '干拌牛肉粉套餐',
      price: 26.0,
      spicy: true,
      type: '套餐',
      recommend: 56
    }
  ]
};

// ============ 计算属性 ============
// 左侧菜单列表（优先使用后端数据）
const menuList = computed(() => {
  if (CategoryList.value && CategoryList.value.length > 0) {
    return CategoryList.value.map(item => ({
      label: item.name || item.categoryName || '未知分类',
      id: item.id
    }));
  }
  return defaultMenuList;
});

const currentMenu = computed(() => {
  return menuList.value[currentIndex.value] || menuList.value[0];
});

const currentFoodList = computed(() => {
  // 如果有后端数据，尝试从分类中获取菜品
  if (CategoryList.value && CategoryList.value.length > 0) {
    const currentCategory = CategoryList.value[currentIndex.value];
    return currentCategory?.foodList || currentCategory?.dishes || currentCategory?.foods || [];
  }

  const menuLabel = currentMenu.value.label;
  return defaultFoodData[menuLabel] || [];
});

const switchMenu = (index: number) => {
  if (currentIndex.value !== index) {
    currentIndex.value = index;
    console.log('切换到:', menuList.value[index].label);
  }
};

const selectFood = (food: any) => {
  uni.showToast({
    title: `已选 ${food.name}`,
    icon: 'success'
  });
  console.log('选择菜品:', food);
};

onMounted(() => {
  // 请求店铺信息
  uni.request({
    url: 'http://localhost:8081/api/store/getStoreName',
    data: {
      text: 'uni.request'
    },
    success: (res: any) => {
      if (res.statusCode == 200) {
        console.log("请求成功！！！这个就是从后端拿到的店铺信息：", res.data.data[0]);
        ShopName.value = res.data.data[0].name;
        ShopAddress.value = res.data.data[0].address || '';
      } else {
        console.log("请求失败", res.statusCode);
      }
    },
    fail: (err) => {
      console.log("返回错误：", err);
    }
  });

  // 请求菜品分类
  uni.request({
    url: 'http://localhost:8081/api/category/getAllCategories',
    success: (res: any) => {
      console.log("获取分类数据响应：", res);
      if (res.statusCode == 200) {
        console.log("获取到的数据：", res.data.data);
        CategoryList.value = res.data.data;
        // 重置选中索引
        currentIndex.value = 0;
      } else {
        console.log("获取菜品类型失败");
      }
    },
    fail: (err) => {
      console.log("获取数据失败" + err);
    }
  });
});
</script>

<style scoped>
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
  height: 200px;
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
  cursor: pointer;
}

.menu-item.active {
  border-left-color: #FF6B35;
  background: #FFF5F0;
}

.menu-label {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
}

.menu-item.active .menu-label {
  color: #FF6B35;
  font-weight: bold;
}

/* ===== 右侧内容 ===== */
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

/* ===== 菜品列表 ===== */
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

.btn-select {
  background: #FF6B35;
  color: #FFFFFF;
  border: none;
  border-radius: 40rpx;
  padding: 14rpx 36rpx;
  font-size: 26rpx;
  white-space: nowrap;
  line-height: 1.4;
}

.btn-select::after {
  border: none;
}
</style>