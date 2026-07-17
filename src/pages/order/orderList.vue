<template>
  <view class="order-page">
    <!-- 1. 顶部状态筛选 Tab -->
    <view class="tab-bar">
      <view
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentStatus === tab.value }"
          @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 2. 订单列表区域 -->
    <scroll-view
        scroll-y
        class="order-list"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="loadMore"
    >
      <!-- 订单卡片 -->
      <view v-if="orderList.length > 0" class="card" v-for="item in orderList" :key="item.id">
        <!-- 卡片头部：店铺名 + 订单状态 -->
        <view class="card-header">
          <text class="store-name">{{ item.storeName || '默认门店' }}</text>
          <text class="status-text" :class="'status-' + item.orderStatus">
            {{ getStatusText(item.orderStatus) }}
          </text>
        </view>

        <!-- 卡片内容：商品信息（示例占位）+ 金额 -->
        <view class="card-body">
          <view class="goods-info">
            <image class="goods-img" src="/static/default-goods.png" mode="aspectFill" />
            <view class="goods-detail">
              <text class="goods-name">拿铁咖啡 x1</text>
              <text class="goods-spec">大杯 / 少冰 / 去糖</text>
            </view>
          </view>
          <view class="amount-info">
            <text class="total-label">共{{ item.totalCount || 1 }}件 合计</text>
            <text class="total-price">¥{{ item.payAmount }}</text>
          </view>
        </view>

        <!-- 卡片底部：订单号 + 操作按钮 -->
        <view class="card-footer">
          <text class="order-no">订单号：{{ item.orderNo }}</text>
          <view class="btn-group">
            <button
                v-if="item.orderStatus === 0 && item.payStatus === 0"
                size="mini"
                type="default"
                @click="cancelOrder(item)"
            >取消订单</button>

            <button
                v-if="item.orderStatus === 0 && item.payStatus === 0"
                size="mini"
                type="primary"
                @click="payOrder(item)"
            >去支付</button>

            <button
                v-if="item.orderStatus === 4"
                size="mini"
                type="primary"
                plain
                @click="rebuy(item)"
            >再来一单</button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state">
        <image src="/static/empty-order.png" mode="aspectFit" class="empty-img" />
        <text class="empty-text">暂无相关订单</text>
      </view>

      <!-- 加载状态 -->
      <view class="load-status">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore && orderList.length > 0">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// ==================== 类型定义 ====================
interface OrderItem {
  id: number;
  orderNo: string;
  storeName?: string;
  payAmount: string;
  payStatus: number;   // 0待支付 1已支付 2退款
  orderStatus: number; // 0待支付 1待制作 2制作中 3待取餐 4完成 5取消
  totalCount?: number;
}

// ==================== 响应式数据 ====================
const tabs = [
  { label: '全部', value: -1 },
  { label: '待支付', value: 0 },
  { label: '制作中', value: 2 },
  { label: '待取餐', value: 3 },
  { label: '已完成', value: 4 },
];

const currentStatus = ref(-1);
const orderList = ref<OrderItem[]>([]);
const loading = ref(false);
const isRefreshing = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 10;

// ==================== 生命周期 ====================
onMounted(() => {
  fetchOrders();
});

// ==================== 核心方法 ====================

/** 获取订单列表（TODO: 替换为真实API） */
const fetchOrders = async (isRefresh = false) => {
  if (loading.value) return;

  if (isRefresh) {
    page.value = 1;
    noMore.value = false;
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    // ⭐ TODO: 替换为真实的后端请求
    // const res = await uni.request({
    //   url: '/api/orders',
    //   data: { page: page.value, pageSize, orderStatus: currentStatus.value }
    // });

    // 模拟数据用于UI预览
    await new Promise(resolve => setTimeout(resolve, 600));
    const mockData: OrderItem[] = Array.from({ length: 5 }).map((_, i) => ({
      id: page.value * 10 + i,
      orderNo: `20260716${String(page.value * 10 + i).padStart(8, '0')}`,
      storeName: '桂电校区店',
      payAmount: (28 + i * 2).toFixed(2),
      payStatus: currentStatus.value === 0 ? 0 : 1,
      orderStatus: currentStatus.value === -1 ? [0, 2, 3, 4][i % 4] : currentStatus.value,
      totalCount: 1 + (i % 3),
    }));

    if (isRefresh) {
      orderList.value = mockData;
    } else {
      orderList.value = [...orderList.value, ...mockData];
    }

    if (mockData.length < pageSize) noMore.value = true;
  } catch (e) {
    console.error('获取订单失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

/** 切换Tab */
const switchTab = (status: number) => {
  if (currentStatus.value === status) return;
  currentStatus.value = status;
  orderList.value = [];
  fetchOrders(true);
};

/** 下拉刷新 & 上拉加载更多 */
const onRefresh = () => fetchOrders(true);
const loadMore = () => {
  if (noMore.value || loading.value) return;
  page.value++;
  fetchOrders();
};

/** 状态文案映射 */
const getStatusText = (status: number): string => {
  const map: Record<number, string> = {
    0: '待支付', 1: '待制作', 2: '制作中', 3: '待取餐', 4: '已完成', 5: '已取消'
  };
  return map[status] || '未知';
};

/** 操作按钮事件（TODO: 对接真实API） */
const cancelOrder = (item: OrderItem) => {
  uni.showModal({
    title: '提示', content: '确定要取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 调用取消订单API
        item.orderStatus = 5;
        uni.showToast({ title: '订单已取消' });
      }
    }
  });
};

const payOrder = (item: OrderItem) => {
  // TODO: 调用微信支付流程
  uni.showToast({ title: '跳转支付...', icon: 'none' });
};

const rebuy = (item: OrderItem) => {
  // TODO: 将商品加入购物车并跳转
  uni.showToast({ title: '已加入购物车', icon: 'success' });
};
</script>

<style scoped>
.order-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

/* ===== Tab 栏 ===== */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 10rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  z-index: 10;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;
}
.tab-item.active {
  color: #07c160;
  font-weight: 600;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: #07c160;
}

/* ===== 订单列表 ===== */
.order-list {
  flex: 1;
  padding: 20rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.store-name { font-size: 30rpx; font-weight: 600; color: #333; }
.status-text { font-size: 26rpx; font-weight: 500; }
.status-0 { color: #fa9d3b; }
.status-2, .status-3 { color: #07c160; }
.status-4 { color: #999; }
.status-5 { color: #ccc; }

/* 卡片内容 */
.card-body { padding: 20rpx 0; }
.goods-info { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.goods-img { width: 120rpx; height: 120rpx; border-radius: 12rpx; background: #f8f8f8; }
.goods-detail { display: flex; flex-direction: column; justify-content: center; gap: 8rpx; }
.goods-name { font-size: 28rpx; color: #333; font-weight: 500; }
.goods-spec { font-size: 24rpx; color: #999; }
.amount-info { display: flex; justify-content: flex-end; align-items: baseline; gap: 8rpx; }
.total-label { font-size: 24rpx; color: #999; }
.total-price { font-size: 34rpx; color: #333; font-weight: 700; }

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}
.order-no { font-size: 22rpx; color: #bbb; }
.btn-group { display: flex; gap: 16rpx; }
.btn-group button { font-size: 24rpx; border-radius: 30rpx; }

/* ===== 空状态 & 加载 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}
.empty-img { width: 300rpx; height: 300rpx; opacity: 0.6; }
.empty-text { margin-top: 20rpx; font-size: 28rpx; color: #ccc; }
.load-status {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #ccc;
}
</style>