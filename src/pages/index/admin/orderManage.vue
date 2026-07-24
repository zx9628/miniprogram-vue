<template>
  <view class="admin-order-page">
    <!-- 1. 顶部状态筛选 Tab（管理端视角） -->
    <view class="tab-bar">
      <scroll-view scroll-x class="tab-scroll">
        <view
            v-for="tab in adminTabs"
            :key="tab.value"
            class="tab-item"
            :class="{ active: currentStatus === tab.value }"
            @click="switchTab(tab.value)"
        >
          {{ tab.label }}
          <text v-if="tab.count > 0" class="badge">{{ tab.count > 99 ? '99+' : tab.count }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 2. 搜索栏 -->
    <view class="search-bar">
      <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索订单号/手机号"
          confirm-type="search"
          @confirm="onSearch"
      />
      <button size="mini" type="primary" @click="onSearch">搜索</button>
    </view>

    <!-- 3. 订单列表 -->
    <scroll-view
        scroll-y
        class="order-list"
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="loadMore"
    >
      <view
          v-for="item in filteredOrders"
          :key="item.id"
          class="admin-card"
          @click="showDetail(item)"
      >
        <!-- 卡片头部 -->
        <view class="card-header">
          <view class="header-left">
            <text class="order-no">{{ item.orderNo }}</text>
            <text class="create-time">{{ formatTime(item.createTime) }}</text>
          </view>
          <text class="status-tag" :class="'tag-' + item.orderStatus">
            {{ getStatusText(item.orderStatus) }}
          </text>
        </view>

        <!-- 商品信息（紧凑展示） -->
        <view class="card-body">
          <view class="goods-summary">
            <image
                v-if="item.orderItems?.[0]?.image"
                class="goods-thumb"
                :src="item.orderItems[0].image"
                mode="aspectFill"
            />
            <view class="goods-text">
              <text class="dish-name">
                {{ item.orderItems?.[0]?.dishName || '-' }}
                <text v-if="item.orderItems?.length > 1" class="more-goods">
                  等{{ getTotalCount(item.orderItems) }}件商品
                </text>
              </text>
              <text class="spec-info">{{ item.orderItems?.[0]?.specName || '标准份' }}</text>
            </view>
          </view>
          <view class="amount-row">
            <text class="pay-amount">¥{{ formatPrice(item.payAmount) }}</text>
            <text class="pay-status" :class="item.payStatus === 1 ? 'paid' : 'unpaid'">
              {{ item.payStatus === 1 ? '已支付' : '未支付' }}
            </text>
          </view>
        </view>

        <!-- ⭐ 管理端操作按钮区 -->
        <view class="card-footer" @click.stop>
          <text class="store-label">{{ item.storeName || '默认门店' }}</text>
          <view class="action-group">
            <!-- 待制作 → 开始制作 -->
            <button
                v-if="item.orderStatus === 1 && item.payStatus === 1"
                size="mini"
                type="warn"
                @click.stop="updateStatus(item, 2)"
            >开始制作</button>

            <!-- 制作中 → 制作完成 -->
            <button
                v-if="item.orderStatus === 2"
                size="mini"
                type="primary"
                @click.stop="updateStatus(item, 3)"
            >制作完成</button>

            <!-- 待取餐 → 确认取餐 -->
            <button
                v-if="item.orderStatus === 3"
                size="mini"
                type="primary"
                plain
                @click.stop="updateStatus(item, 4)"
            >确认取餐</button>

            <!-- 待支付且超时 → 管理员取消 -->
            <button
                v-if="item.orderStatus === 0"
                size="mini"
                type="default"
                @click.stop="adminCancel(item)"
            >取消</button>
          </view>
        </view>
      </view>

      <!-- 空状态 & 加载状态 -->
      <view v-if="!loading && filteredOrders.length === 0" class="empty-state">
        <text class="empty-text">暂无相关订单</text>
      </view>
      <view class="load-status">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore && filteredOrders.length > 0">没有更多了</text>
      </view>
    </scroll-view>

    <!-- 4. 订单详情弹窗 -->
    <view v-if="detailVisible" class="detail-mask" @click="detailVisible = false">
      <view class="detail-popup" @click.stop>
        <view class="popup-header">
          <text class="popup-title">订单详情</text>
          <text class="popup-close" @click="detailVisible = false">✕</text>
        </view>
        <scroll-view scroll-y class="popup-body" v-if="currentOrder">
          <view class="detail-row"><text class="label">订单号</text><text>{{ currentOrder.orderNo }}</text></view>
          <view class="detail-row"><text class="label">下单时间</text><text>{{ currentOrder.createTime }}</text></view>
          <view class="detail-row"><text class="label">支付时间</text><text>{{ currentOrder.payTime || '-' }}</text></view>
          <view class="detail-row"><text class="label">取餐码</text><text class="pick-code">{{ currentOrder.pickCode || '-' }}</text></view>
          <view class="detail-row"><text class="label">备注</text><text>{{ currentOrder.remark || '无' }}</text></view>
          <view class="detail-divider"></view>
          <view class="detail-section-title">商品明细</view>
          <view v-for="g in currentOrder.orderItems" :key="g.id" class="detail-goods">
            <text class="dg-name">{{ g.dishName }} x{{ g.quantity }}</text>
            <text class="dg-spec">{{ g.specName }}</text>
            <text class="dg-price">¥{{ formatPrice(g.amount) }}</text>
          </view>
          <view class="detail-divider"></view>
          <view class="detail-row"><text class="label">原价</text><text>¥{{ formatPrice(currentOrder.totalAmount) }}</text></view>
          <view class="detail-row"><text class="label">优惠</text><text class="discount">-¥{{ formatPrice(currentOrder.discountAmount) }}</text></view>
          <view class="detail-row highlight"><text class="label">实付</text><text class="final-price">¥{{ formatPrice(currentOrder.payAmount) }}</text></view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// ==================== 类型定义 ====================
interface OrderItemVO {
  id: number;
  orderId: number;
  dishName: string;
  specName: string;
  image: string | null;
  price: number;
  quantity: number;
  amount: number;
}

interface OrderVO {
  id: number;
  orderNo: string;
  storeId: number;
  storeName?: string;
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  payStatus: number;
  orderStatus: number; // 0待支付 1待制作 2制作中 3待取餐 4完成 5取消
  pickCode: string;
  remark: string | null;
  payTime: string | null;
  finishTime: string | null;
  createTime: string;
  orderItems: OrderItemVO[];
}

// ==================== 管理端 Tab 配置 ====================
const adminTabs = ref([
  { label: '全部', value: -1, count: 0 },
  { label: '待支付', value: 0, count: 0 },
  { label: '待制作', value: 1, count: 0 },
  { label: '制作中', value: 2, count: 0 },
  { label: '待取餐', value: 3, count: 0 },
  { label: '已完成', value: 4, count: 0 },
  { label: '已取消', value: 5, count: 0 },
]);

const currentStatus = ref(-1);
const searchKeyword = ref('');
const orderList = ref<OrderVO[]>([]);
const loading = ref(false);
const isRefreshing = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 20; // 管理端每页条数可更大

// 详情弹窗
const detailVisible = ref(false);
const currentOrder = ref<OrderVO | null>(null);

// ==================== 过滤逻辑 ====================
const filteredOrders = computed(() => {
  let list = orderList.value;
  if (currentStatus.value !== -1) {
    list = list.filter(o => o.orderStatus === currentStatus.value);
  }
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase();
    list = list.filter(o =>
            o.orderNo.toLowerCase().includes(kw)
        // 如有手机号字段可追加: || o.phone?.includes(kw)
    );
  }
  return list;
});

// ==================== 生命周期 ====================
onMounted(() => {
  fetchOrders();
});

// ==================== 核心方法 ====================
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
    const res = await uni.request({
      url: 'https://zx.juntaitec.cn/wechat/order/getAllorders',
      //url: 'http://localhost:8081/api/order/getAllorders',
      method: 'GET',
      data: { page: page.value, pageSize }
    });

    console.log(res)
    const list: OrderVO[] = (res.data as any)?.data || [];

    if (isRefresh) {
      orderList.value = list;
    } else {
      orderList.value = [...orderList.value, ...list];
    }

    if (list.length < pageSize) noMore.value = true;

    // ⭐ 更新各 Tab 的计数 badge
    updateTabCounts();
  } catch (e) {
    console.error('获取订单失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

/** 更新 Tab 角标计数 */
const updateTabCounts = () => {
  const counts: Record<number, number> = {};
  orderList.value.forEach(o => {
    counts[o.orderStatus] = (counts[o.orderStatus] || 0) + 1;
  });
  adminTabs.value.forEach(tab => {
    if (tab.value === -1) {
      tab.count = orderList.value.length;
    } else {
      tab.count = counts[tab.value] || 0;
    }
  });
};

/** ⭐ 管理员更新订单状态 */
const updateStatus = (item: OrderVO, newStatus: number) => {
  const actionMap: Record<number, string> = {
    2: '开始制作',
    3: '标记制作完成',
    4: '确认顾客已取餐'
  };

  uni.showModal({
    title: '操作确认',
    content: `确定要「${actionMap[newStatus]}」该订单吗？`,
    success: async (res) => {
      if (!res.confirm) return;
      try {
        uni.showLoading({ title: '操作中...' });
        await uni.request({
          url: 'https://zx.juntaitec.cn/wechat/order/updateStatus',
          // url: 'http://localhost:8081/api/order/updateStatus',
          method: 'PUT',
          data: { orderId: item.id, status: newStatus }
        });
        uni.hideLoading();
        item.orderStatus = newStatus;
        if (newStatus === 4) item.finishTime = new Date().toISOString();
        updateTabCounts();
        uni.showToast({ title: '操作成功', icon: 'success' });
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '操作失败', icon: 'none' });
      }
    }
  });
};

/** 管理员取消订单 */
const adminCancel = (item: OrderVO) => {
  uni.showModal({
    title: '⚠️ 管理员取消',
    content: '确定要强制取消该订单吗？如已支付将触发退款流程。',
    confirmColor: '#e64340',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        uni.showLoading({ title: '取消中...' });
        await uni.request({
          //url: 'http://localhost:8081/api/order/cancel',
          url: 'https://zx.juntaitec.cn/wechat/order/cancel',
          method: 'PUT',
          data: { orderId: item.id, reason: '管理员手动取消' }
        });
        uni.hideLoading();
        item.orderStatus = 5;
        updateTabCounts();
        uni.showToast({ title: '已取消', icon: 'success' });
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '取消失败', icon: 'none' });
      }
    }
  });
};

// ==================== 工具方法 ====================
const switchTab = (status: number) => {
  if (currentStatus.value === status) return;
  currentStatus.value = status;
};

const onSearch = () => {
  // 前端搜索无需重新请求；若需服务端搜索则在此调用 fetchOrders(true)
};

const onRefresh = () => fetchOrders(true);
const loadMore = () => {
  if (noMore.value || loading.value) return;
  page.value++;
  fetchOrders();
};

const showDetail = (item: OrderVO) => {
  currentOrder.value = item;
  detailVisible.value = true;
};

const getTotalCount = (items: OrderItemVO[]): number =>
    items.reduce((sum, i) => sum + i.quantity, 0);

const formatPrice = (price: number): string => Number(price).toFixed(2);

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '-';
  const d = new Date(timeStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getStatusText = (status: number): string => {
  const map: Record<number, string> = {
    0: '待支付', 1: '待制作', 2: '制作中', 3: '待取餐', 4: '已完成', 5: '已取消'
  };
  return map[status] || '未知';
};
</script>

<style scoped>
/* ========== 页面布局 ========== */
.admin-order-page { display: flex; flex-direction: column; height: 100vh; background: #f0f2f5; }

/* ========== Tab 栏 ========== */
.tab-bar { background: #fff; flex-shrink: 0; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); z-index: 10; }
.tab-scroll { white-space: nowrap; padding: 0 10rpx; }
.tab-item {
  display: inline-flex; align-items: center; gap: 6rpx;
  padding: 24rpx 28rpx; font-size: 28rpx; color: #666; position: relative;
}
.tab-item.active { color: #1890ff; font-weight: 600; }
.tab-item.active::after {
  content: ''; position: absolute; bottom: 4rpx; left: 50%; transform: translateX(-50%);
  width: 40rpx; height: 6rpx; border-radius: 3rpx; background: #1890ff;
}
.badge {
  font-size: 20rpx; background: #ff4d4f; color: #fff;
  padding: 2rpx 10rpx; border-radius: 20rpx; min-width: 32rpx; text-align: center;
}

/* ========== 搜索栏 ========== */
.search-bar { display: flex; gap: 16rpx; padding: 16rpx 20rpx; background: #fff; flex-shrink: 0; border-bottom: 1rpx solid #f0f0f0; }
.search-input {
  flex: 1; height: 64rpx; background: #f5f5f5; border-radius: 32rpx;
  padding: 0 24rpx; font-size: 26rpx;
}

/* ========== 订单列表 ========== */
.order-list { flex: 1; padding: 16rpx; }
.admin-card {
  background: #fff; border-radius: 12rpx; padding: 20rpx;
  margin-bottom: 16rpx; box-shadow: 0 1rpx 6rpx rgba(0,0,0,0.04);
}

/* 卡片头部 */
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.header-left { display: flex; flex-direction: column; gap: 6rpx; }
.order-no { font-size: 26rpx; color: #333; font-family: monospace; }
.create-time { font-size: 22rpx; color: #bbb; }
.status-tag {
  font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 6rpx; font-weight: 500;
}
.tag-0 { background: #fff7e6; color: #fa8c16; }
.tag-1 { background: #fff1f0; color: #cf1322; }
.tag-2 { background: #e6f7ff; color: #1890ff; }
.tag-3 { background: #f6ffed; color: #52c41a; }
.tag-4 { background: #f5f5f5; color: #999; }
.tag-5 { background: #f5f5f5; color: #ccc; }

/* 卡片内容 */
.goods-summary { display: flex; gap: 16rpx; margin-bottom: 12rpx; }
.goods-thumb { width: 80rpx; height: 80rpx; border-radius: 8rpx; background: #f8f8f8; flex-shrink: 0; }
.goods-text { display: flex; flex-direction: column; justify-content: center; gap: 4rpx; overflow: hidden; }
.dish-name { font-size: 28rpx; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.more-goods { font-size: 24rpx; color: #999; margin-left: 8rpx; }
.spec-info { font-size: 22rpx; color: #aaa; }
.amount-row { display: flex; justify-content: flex-end; align-items: baseline; gap: 12rpx; }
.pay-amount { font-size: 32rpx; color: #333; font-weight: 700; }
.pay-status { font-size: 22rpx; }
.pay-status.paid { color: #52c41a; }
.pay-status.unpaid { color: #fa8c16; }

/* 卡片底部操作区 */
.card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 16rpx; border-top: 1rpx solid #f5f5f5; margin-top: 12rpx;
}
.store-label { font-size: 22rpx; color: #bbb; }
.action-group { display: flex; gap: 12rpx; }
.action-group button { font-size: 24rpx; border-radius: 8rpx; padding: 0 24rpx; height: 56rpx; line-height: 56rpx; }

/* ========== 详情弹窗 ========== */
.detail-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
  display: flex; align-items: flex-end;
}
.detail-popup {
  width: 100%; max-height: 80vh; background: #fff;
  border-radius: 24rpx 24rpx 0 0; padding: 32rpx;
  display: flex; flex-direction: column;
}
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.popup-title { font-size: 32rpx; font-weight: 700; color: #333; }
.popup-close { font-size: 36rpx; color: #999; padding: 10rpx; }
.popup-body { flex: 1; }
.detail-row { display: flex; justify-content: space-between; padding: 12rpx 0; font-size: 28rpx; color: #333; }
.detail-row .label { color: #999; }
.detail-row.highlight .final-price { font-size: 34rpx; color: #cf1322; font-weight: 700; }
.discount { color: #52c41a; }
.pick-code { font-size: 36rpx; font-weight: 700; color: #1890ff; letter-spacing: 4rpx; }
.detail-divider { height: 1rpx; background: #f0f0f0; margin: 16rpx 0; }
.detail-section-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 12rpx; }
.detail-goods {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10rpx 0; font-size: 26rpx;
}
.dg-name { color: #333; flex: 1; }
.dg-spec { color: #aaa; font-size: 22rpx; margin: 0 16rpx; }
.dg-price { color: #666; white-space: nowrap; }

/* ========== 通用 ========== */
.empty-state { text-align: center; padding: 200rpx 0; }
.empty-text { font-size: 28rpx; color: #ccc; }
.load-status { text-align: center; padding: 30rpx 0; font-size: 24rpx; color: #ccc; }
</style>