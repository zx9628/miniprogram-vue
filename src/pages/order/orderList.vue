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
      <view v-if="filteredOrders.length > 0" class="card" v-for="item in filteredOrders" :key="item.id">
        <!-- 卡片头部：店铺名 + 订单状态 -->
        <view class="card-header">
          <text class="store-name">{{ item.storeName || '默认门店' }}</text>
          <text class="status-text" :class="'status-' + item.orderStatus">
            {{ getStatusText(item.orderStatus) }}
          </text>
        </view>

        <!-- ⭐ 卡片内容：遍历后端返回的 orderItems -->
        <view class="card-body">
          <view
              class="goods-info"
              v-for="goods in item.orderItems"
              :key="goods.id"
          >
            <image
                class="goods-img"
                :src="goods.image || '/static/default-goods.png'"
                mode="aspectFill"
            />
            <view class="goods-detail">
              <text class="goods-name">{{ goods.dishName }} x{{ goods.quantity }}</text>
              <text class="goods-spec">{{ goods.specName || '标准份' }}</text>
            </view>
          </view>

          <view class="amount-info">
            <!-- ⭐ 动态计算总件数 -->
            <text class="total-label">共{{ getTotalCount(item.orderItems) }}件 合计</text>
            <text class="total-price">¥{{ formatPrice(item.payAmount) }}</text>
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
        <image src="" mode="aspectFit" class="empty-img" />
        <text class="empty-text">暂无相关订单</text>
      </view>

      <!-- 加载状态 -->
      <view class="load-status">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore && filteredOrders.length > 0">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// ==================== ⭐ 类型定义（严格匹配后端 OrderVO + OrderItemVO） ====================
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
  storeName?: string; // 后端暂未返回，前端预留
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  payStatus: number;   // 0待支付 1已支付 2退款
  orderStatus: number; // 0待支付 1待制作 2制作中 3待取餐 4完成 5取消
  pickCode: string;
  remark: string | null;
  payTime: string | null;
  finishTime: string | null;
  createTime: string;
  orderItems: OrderItemVO[];
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
const orderList = ref<OrderVO[]>([]);
const loading = ref(false);
const isRefreshing = ref(false);
const noMore = ref(false);
const page = ref(1);
const pageSize = 10;

// ⭐ 前端过滤：因为后端目前是一次性返回全部，Tab切换在前端做过滤
// 后续如果后端支持分页+状态筛选，这里应改为重新请求API
const filteredOrders = computed(() => {
  if (currentStatus.value === -1) return orderList.value;
  return orderList.value.filter(o => o.orderStatus === currentStatus.value);
});

// ==================== 生命周期 ====================
onMounted(() => {
  fetchOrders();
});

// ==================== 核心方法 ====================

/** ⭐ 获取订单列表（已对接真实API） */
const fetchOrders = async (isRefresh = false) => {
  if (loading.value) return;

  if (isRefresh) {
    page.value = 1;
    noMore.value = false;
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }
  let userData = uni.getStorageSync("userInfo")
  let userid = userData.userId
  try {
    const res = await uni.request({
      url: 'http://localhost:8081/api/order/getorders',
      method: 'GET',
      data: { userId: userid }
    });

    // 适配你的后端统一响应格式 { code, message, data }
    const list: OrderVO[] = (res.data as any)?.data || [];

    if (isRefresh) {
      orderList.value = list;
    } else {
      orderList.value = [...orderList.value, ...list];
    }

    // 简单分页判断（后端若支持分页应使用后端返回的 total/pageInfo）
    if (list.length < pageSize) noMore.value = true;
  } catch (e) {
    console.error('获取订单失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

/** ⭐ 计算订单总件数 */
const getTotalCount = (items: OrderItemVO[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

/** ⭐ 格式化价格（防止浮点精度问题） */
const formatPrice = (price: number): string => {
  return Number(price).toFixed(2);
};

/** 切换Tab */
const switchTab = (status: number) => {
  if (currentStatus.value === status) return;
  currentStatus.value = status;
  // 由于当前是全量加载，切换Tab不需要重新请求
  // 如果后续改为服务端分页，此处应调用 fetchOrders(true)
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

/** 操作按钮事件 */
const cancelOrder = (item: OrderVO) => {
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

// 1. 定义后端返回的支付参数类型（根据你后端的实际字段）
interface WxPayParams {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: 'RSA' | 'MD5' | 'HMAC-SHA256';
  paySign: string;
}



const payOrder = async (item: OrderVO) => {
  console.log(item);
  uni.showLoading({ title: '正在创建订单...' });



  try {
    // 3. 请求时显式指定泛型类型
    const res = await uni.request({
      url: 'http://localhost:8081/api/order/pay',
      method: 'POST',
      data: { orderNo: item.orderNo}
    });
    console.log(res)
    uni.hideLoading();




    if (res.data.code === 200) {
      const payParams = res.data.data;

      // 4. 构造支付参数并显式断言类型，解决 No overload matches 报错
      const paymentOptions: UniApp.RequestPaymentOptions = {
        provider: 'wxpay',
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign,
        success(payRes) {
          console.log('支付成功', payRes);
          uni.showToast({ title: '支付成功', icon: 'success' });
        },
        fail(err) {
          console.error('支付失败或取消', err);
          if (err.errMsg?.includes('cancel')) {
            uni.showToast({ title: '已取消支付', icon: 'none' });
          } else {
            uni.showToast({ title: '支付失败', icon: 'none' });
          }
        }
      };

      uni.requestPayment(paymentOptions);
    } else {
      uni.showToast({ title: res.data.message || '创建支付失败', icon: 'none' });
    }
  } catch (e) {
    uni.hideLoading();
    console.error('请求支付接口异常:', e);
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
};

const rebuy = (item: OrderVO) => {
  // ⭐ 可以将 item.orderItems 加入购物车
  uni.showToast({ title: '已加入购物车', icon: 'success' });
};
</script>

<style scoped>
/* 样式保持不变，与原代码完全一致 */
.order-page { display: flex; flex-direction: column; height: 100vh; background-color: #f5f5f5; }
.tab-bar { display: flex; background: #fff; padding: 0 10rpx; flex-shrink: 0; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); z-index: 10; }
.tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; position: relative; transition: all 0.3s; }
.tab-item.active { color: #07c160; font-weight: 600; }
.tab-item.active::after { content: ''; position: absolute; bottom: 4rpx; left: 50%; transform: translateX(-50%); width: 40rpx; height: 6rpx; border-radius: 3rpx; background: #07c160; }
.order-list { flex: 1; padding: 20rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.card-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20rpx; border-bottom: 1rpx solid #f0f0f0; }
.store-name { font-size: 30rpx; font-weight: 600; color: #333; }
.status-text { font-size: 26rpx; font-weight: 500; }
.status-0 { color: #fa9d3b; }
.status-2, .status-3 { color: #07c160; }
.status-4 { color: #999; }
.status-5 { color: #ccc; }
.card-body { padding: 20rpx 0; }
.goods-info { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.goods-img { width: 120rpx; height: 120rpx; border-radius: 12rpx; background: #f8f8f8; }
.goods-detail { display: flex; flex-direction: column; justify-content: center; gap: 8rpx; }
.goods-name { font-size: 28rpx; color: #333; font-weight: 500; }
.goods-spec { font-size: 24rpx; color: #999; }
.amount-info { display: flex; justify-content: flex-end; align-items: baseline; gap: 8rpx; }
.total-label { font-size: 24rpx; color: #999; }
.total-price { font-size: 34rpx; color: #333; font-weight: 700; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 20rpx; border-top: 1rpx solid #f0f0f0; }
.order-no { font-size: 22rpx; color: #bbb; }
.btn-group { display: flex; gap: 16rpx; }
.btn-group button { font-size: 24rpx; border-radius: 30rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding-top: 200rpx; }
.empty-img { width: 300rpx; height: 300rpx; opacity: 0.6; }
.empty-text { margin-top: 20rpx; font-size: 28rpx; color: #ccc; }
.load-status { text-align: center; padding: 30rpx 0; font-size: 24rpx; color: #ccc; }
</style>