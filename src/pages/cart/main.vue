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

    <!-- windowOne -->
    <window-one
        :visible="showModalOne"
        :product="selectedProduct"
        :spec-options="specOptions"
        :extra-options="extraOptions"
        :side-options="sideOptions"
        :packaging-options="packagingOptions"
        @close="closeModal"
        @confirm="handleAddToCart"
    />

    <!-- windowTwo -->
    <window-two
        :visible="showModalTwo"
        :product="selectedProduct"
        :spec-options="specOptionsTwo"
        :flavor-options="flavorOptionsTwo"
        :extra-options="extraOptions"
        :side-options="sideOptions"
        :packaging-options="packagingOptions"
        @close="closeModal"
        @confirm="handleAddToCart"
    />

    <!-- windowFour -->
    <window-four
        :visible="showModalFour"
        :product="selectedProduct"
        :spec-options="specOptionsFour"
        :flavor-options="flavorOptionsFour"
        :extra-options="extraOptionsFour"
        :side-options="sideOptions"
        :packaging-options="packagingOptions"
        @close="closeModal"
        @confirm="handleAddToCart"
    />

    <!-- windowSix -->
    <window-six
        :visible="showModalSix"
        :product="selectedProduct"
        :spec-options="specOptionsSix"
        @close="closeModal"
        @confirm="handleAddToCart"
    />
  </view>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { getDishInfo } from "@/http/dish"
import windowOne from './specificationWindow/windowOne.vue'
import windowTwo from './specificationWindow/windowTwo.vue'
import windowFour from './specificationWindow/windowFour.vue'
import windowSix from './specificationWindow/windowSix.vue'

export default {
  components: {
    windowOne,
    windowTwo,
    windowFour,
    windowSix,
  },
  props: {
    categoryIndex: {
      type: Number,
      default: 0
    },
    storeId: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    // ==================== 数据 ====================
    const productList = ref([])
    const categoryList = ref([])
    const loading = ref(false)

    // ==================== 弹窗相关 ====================
    const showModalOne = ref(false)
    const showModalTwo = ref(false)
    const showModalFour = ref(false)
    const showModalSix = ref(false)
    const selectedProduct = ref(null)

    // ==================== windowOne 的规格选项 ====================
    const specOptions = ref([
      { name: '2两圆粉' },
      { name: '2两切粉' },
      { name: '3两圆粉' },
      { name: '3两切粉' }
    ])

    // ==================== windowTwo 的规格选项（含面） ====================
    const specOptionsTwo = ref([
      { name: '2两圆粉' },
      { name: '2两切粉' },
      { name: '3两圆粉' },
      { name: '3两切粉' },
      { name: '2两面' },
      { name: '3两面' }
    ])

    // ==================== windowFour 的规格选项（含售罄） ====================
    const specOptionsFour = ref([
      { name: '2两圆粉', soldOut: false },
      { name: '2两切粉', soldOut: false },
      { name: '3两圆粉', soldOut: false },
      { name: '3两切粉', soldOut: false },
      { name: '2两面', soldOut: false },
      { name: '3两面', soldOut: false }
    ])

    // ==================== windowSix 的规格选项（小/大） ====================
    const specOptionsSix = ref([
      { name: '小' ,price: 6},
      { name: '大' ,price: 12}
    ])

    // ==================== 口味定制选项 ====================
    // windowTwo 的口味
    const flavorOptionsTwo = ref([
      { name: '少油' },
      { name: '标准油' },
      { name: '多加油' },
      { name: '粉烫久些' },
      { name: '不要香菜' },
      { name: '不要泡菜' }
    ])

    // windowFour 的口味
    const flavorOptionsFour = ref([
      { name: '粉烫久些' },
      { name: '不要葱花' },
      { name: '不要花生' },
      { name: '不要豆角' }
    ])

    // ==================== 通用选项 ====================
    const extraOptions = ref([
      { name: '加一两圆粉' },
      { name: '加一两切粉' }
    ])

    // windowFour 的加量选项（含售罄）
    const extraOptionsFour = ref([
      { name: '加一两圆粉', soldOut: false },
      { name: '加一两切粉', soldOut: false },
      { name: '加一两面', soldOut: false }
    ])

    const sideOptions = ref([
      { name: '配菜卤蛋', price: 2.5, soldOut: false },
      { name: '配菜豆干', price: 2.5, soldOut: false },
      { name: '配菜煎蛋', price: 2.5, soldOut: false },
      { name: '配菜青菜', price: 2.5, soldOut: false }
    ])

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
      console.log("点击了选规格按钮", product);
      selectedProduct.value = product

      // 根据 specification 决定打开哪个弹窗
      switch (product.specification) {
        case 1:
          showModalOne.value = true;
          break;
        case 2:
          showModalTwo.value = true;
          break;
        case 4:
          showModalFour.value = true;
          break;
        case 5:
          console.log("直接加入购物车就好了");
          break;
        case 6:
          showModalSix.value = true;
          break;
        default:
          console.log("点击了选规格按钮");
          break;
      }
    }

    const closeModal = () => {
      showModalOne.value = false
      showModalTwo.value = false
      showModalFour.value = false
      showModalSix.value = false
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

    return {
      productList,
      categoryList,
      loading,
      showModalOne,
      showModalTwo,
      showModalFour,
      showModalSix,
      selectedProduct,
      specOptions,
      specOptionsTwo,
      specOptionsFour,
      specOptionsSix,
      flavorOptionsTwo,
      flavorOptionsFour,
      extraOptions,
      extraOptionsFour,
      sideOptions,
      packagingOptions,
      filteredProducts,
      openSpecModal,
      closeModal,
      handleAddToCart
    }
  }
}
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