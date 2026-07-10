<template>
  <view class="order-page">
    <!-- 顶部店铺信息 -->

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

<script>
export default {
  data() {
    return {
      // 当前选中的菜单索引
      currentIndex: 0,

      // 左侧菜单列表
      menuList: [
        { label: '原汤单点' },
        { label: '原汤套餐' },
        { label: '干拌单点' },
        { label: '干拌套餐' },
        { label: '精选小吃' },
        { label: '爆款饮品' }
      ],

      // 菜品数据（按菜单分类）
      foodData: {
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
            name: '全家福牛肉粉',
            price: 25,
            spicy: false,
            type: '汤粉',
            recommend: 0
          },
          {
            id: 3,
            name: '原汤牛肉丸粉',
            price: 18,
            spicy: false,
            type: '汤粉',
            recommend: 45
          }
        ],
        '原汤套餐': [
          {
            id: 4,
            name: '原汤套餐A',
            price: 35,
            spicy: false,
            type: '套餐',
            recommend: 32
          },
          {
            id: 5,
            name: '原汤套餐B',
            price: 45,
            spicy: false,
            type: '套餐',
            recommend: 28
          },
          {
            id: 6,
            name: '原汤全家福套餐',
            price: 55,
            spicy: false,
            type: '套餐',
            recommend: 18
          }
        ],
        '干拌单点': [
          {
            id: 7,
            name: '干拌牛肉粉',
            price: 16,
            spicy: true,
            type: '干拌',
            recommend: 56
          },
          {
            id: 8,
            name: '干拌肥肠粉',
            price: 18,
            spicy: true,
            type: '干拌',
            recommend: 34
          },
          {
            id: 9,
            name: '干拌三鲜粉',
            price: 15,
            spicy: false,
            type: '干拌',
            recommend: 21
          }
        ],
        '干拌套餐': [
          {
            id: 10,
            name: '干拌套餐A',
            price: 32,
            spicy: true,
            type: '套餐',
            recommend: 27
          },
          {
            id: 11,
            name: '干拌套餐B',
            price: 38,
            spicy: true,
            type: '套餐',
            recommend: 19
          }
        ],
        '精选小吃': [
          {
            id: 12,
            name: '卤蛋',
            price: 3,
            spicy: false,
            type: '小吃',
            recommend: 98
          },
          {
            id: 13,
            name: '牛肉串',
            price: 12,
            spicy: true,
            type: '小吃',
            recommend: 67
          },
          {
            id: 14,
            name: '炸豆腐',
            price: 8,
            spicy: false,
            type: '小吃',
            recommend: 4500000
          },
          {
            id: 15,
            name: '酸辣鸡爪',
            price: 15,
            spicy: true,
            type: '小吃',
            recommend: 34
          }
        ],
        '爆款饮品': [
          {
            id: 16,
            name: '冰镇酸梅汤',
            price: 8,
            spicy: false,
            type: '饮品',
            recommend: 78
          },
          {
            id: 17,
            name: '柠檬茶',
            price: 10,
            spicy: false,
            type: '饮品',
            recommend: 56
          },
          {
            id: 18,
            name: '鲜榨果汁',
            price: 12,
            spicy: false,
            type: '饮品',
            recommend: 43
          }
        ]
      }
    }
  },

  computed: {
    // 当前选中的菜单对象
    currentMenu() {
      return this.menuList[this.currentIndex] || this.menuList[0]
    },

    // 当前菜单对应的菜品列表
    currentFoodList() {
      const menuLabel = this.currentMenu.label
      return this.foodData[menuLabel] || []
    }
  },

  methods: {
    // 切换菜单
    switchMenu(index) {
      if (this.currentIndex !== index) {
        this.currentIndex = index
        // 滚动到顶部（可选）
        // 这里可以添加数据埋点
        console.log('切换到:', this.menuList[index].label)
        console.log('切换到：',this.currentIndex)
      }
    },

    // 选择菜品（选规格）
    selectFood(food) {
      uni.showToast({
        title: `已选 ${food.name}`,
        icon: 'success'
      })
      console.log('选择菜品:', food)
      // 这里可以打开规格选择弹窗
      // uni.navigateTo({
      //   url: `/pages/foodDetail/foodDetail?id=${food.id}`
      // })
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

/* ===== 顶部店铺信息 ===== */
.store-header {
  background: #FFFFFF;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  flex-shrink: 0;
}

.store-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 16rpx;
}

.store-address {
  font-size: 26rpx;
  color: #666666;
}

.store-distance {
  font-size: 24rpx;
  color: #999999;
  margin-left: 16rpx;
}

/* ===== 促销栏 ===== */
.promotion-bar {
  background: #FFF8F5;
  padding: 16rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  flex-shrink: 0;
}

.promotion-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  padding: 4rpx 0;
}

.promotion-tag {
  background: #FF6B35;
  color: #FFFFFF;
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.promotion-text {
  color: #666666;
  flex: 1;
}

.promotion-link {
  color: #FF6B35;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.promotion-divider {
  height: 1rpx;
  background: #F0E8E5;
  margin: 6rpx 0;
}

/* ===== 主内容区域 ===== */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ===== 左侧菜单 ===== */
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