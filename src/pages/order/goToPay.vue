<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import {getCoupon} from "@/util/coupon";

//新增变量记录选中的优惠券 ID
const selectedCouponId = ref<number | null>(null)

// 初始化为 null，避免模板访问空属性
const order = ref<any>(null)
const userInfo = ref<any>({userId:1})
const couponList = ref<any>([])

onLoad(async () => {
  const data = uni.getStorageSync('pendingOrder')
  const coupon = await getCoupon({userId:userInfo.value.userId})

  couponList.value = coupon.data

  console.log('订单数据：', data)
  console.log('优惠卷：',couponList.value)

  if (data) {
    order.value = data
    // 取用后可以清除
    uni.removeStorageSync('pendingOrder')
  } else {
    // 无数据时提示并返回
    uni.showToast({ title: '订单数据丢失', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})

// 定义状态转换函数
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已完成',
    3: '已取消'
  }
  return map[status] || '未知'
}

const ifuse = (id: number, numValue: number | null, discount: number | null) => {
  if (!order.value) {
    uni.showToast({ title: '订单数据异常', icon: 'none' })
    return
  }

  // 1. 将所有优惠券状态置为 0（未使用）
  couponList.value.forEach(item => {
    item.status = 0
  })

  // 2. 将当前点击的优惠券状态置为 1（已使用）
  const selectedItem = couponList.value.find(item => item.id === id)
  if (selectedItem) {
    selectedItem.status = 1
  }
  selectedCouponId.value = id

  // 3. 计算券后金额（原逻辑不变）
  const totalAmount = order.value.totalAmount
  let payAmount = totalAmount
  let discountAmount = 0

  if (numValue !== null && numValue !== undefined) {
    discountAmount = numValue
    payAmount = totalAmount - discountAmount
  } else if (discount !== null && discount !== undefined) {
    payAmount = totalAmount * discount
    discountAmount = totalAmount - payAmount
  } else {
    uni.showToast({ title: '优惠券无效', icon: 'none' })
    // 无效则还原：清除选中状态
    if (selectedItem) selectedItem.status = 0
    selectedCouponId.value = null
    return
  }

  if (payAmount < 0) payAmount = 0

  order.value.payAmount = payAmount
  order.value.discountAmount = discountAmount

  uni.showToast({ title: '已使用优惠券', icon: 'success' })
  console.log('修改后的 order:', order.value)
  console.log('使用的优惠券id:',selectedCouponId.value)
}

// 确认使用优惠券
const confirmUse = (item: any) => {
  // 如果点击的券已经是选中状态（status === 1），则取消使用
  if (item.status === 1) {
    // 重置所有券状态为 0
    couponList.value.forEach(c => c.status = 0)
    selectedCouponId.value = null
    // 恢复订单支付金额为总金额，优惠金额为 0
    if (order.value) {
      order.value.payAmount = order.value.totalAmount
      order.value.discountAmount = 0
    }
    uni.showToast({ title: '已取消使用优惠券', icon: 'none' })
    return
  }

  // 否则弹出确认框
  uni.showModal({
    title: '提示',
    content: `是否使用“${item.name}”？`,
    success: (res) => {
      if (res.confirm) {
        ifuse(item.id, item.numValue, item.discount)
      }
    }
  })
}

// 支付按钮（暂时提示）
const payOrder = async (order: any) => {
  console.log(order);
  uni.showLoading({ title: '正在支付...' });



  try {
    // 构造请求参数
    const requestData: any = {
      orderNo: order.orderNo,
      payAmount: order.payAmount,
      discountAmount: order.discountAmount
    };
    // 如果有选中的优惠券则传递 ID，否则不传或传 null
    if (selectedCouponId.value !== null) {
      requestData.couponId = selectedCouponId.value;
    }
    const res1 = await uni.request({
      //url: 'http://localhost:8081/api/order/updatePay',
      url: 'https://zx.juntaitec.cn/wechat/order/updatePay',
      method: 'POST',
      data: requestData
    });
    console.log(res1);

    const res = await uni.request({
      //url: 'http://localhost:8081/api/order/pay',
      url: 'https://zx.juntaitec.cn/wechat/order/pay',
      method: 'POST',
      data: requestData
    });
    console.log(res);
    uni.hideLoading();

    if (res.data.code === 200) {
      const payParams = res.data.data;
      // 调起微信支付（代码不变）
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
</script>

<template>
  <view class="container">
    <!-- 必须用 v-if 确保 order 有数据后才渲染 -->
    <view v-if="order" class="order-info">
      <view class="info-item">订单号：{{ order.orderNo }}</view>
      <view class="info-item">总金额：¥{{ order.totalAmount }}</view>
      <view class="info-item">券后金额：¥{{ order.payAmount }}</view>
      <view class="info-item">取餐码：{{ order.pickCode }}</view>
      <view class="info-item">状态：{{ getStatusText(order.orderStatus) }}</view>
      <view class="info-item">备注：{{ order.remark || '无' }}</view>
      <view class="info-item">创建时间：{{ order.createTime }}</view>
    </view>

    <!-- 商品列表也需要判断 order 存在 -->
    <view v-if="order" class="items">
      <view class="item-title">商品明细</view>
      <view class="item" v-for="item in order.orderItems" :key="item.id">
        <text>{{ item.dishName }}</text>
        <text>× {{ item.quantity }}</text>
        <text>¥{{ item.price }}</text>
      </view>
    </view>

    <!-- 展示用户有的优惠券 -->
    <view class="coupon-list">
      <view
          @click="confirmUse(item)"
          class="coupon-item"
          v-for="item in couponList"
          :key="item.id"
          :class="{'used': item.status === 1}"
      >
        <text class="coupon-name">{{ item.name }}</text>
        <text class="coupon-status" :class="item.status == 1 ? 'used' : ''">
          {{ item.status === 0 ? '未使用' : '已使用' }}
        </text>
      </view>
      <text v-if="couponList.length === 0" class="empty">暂无优惠券</text>
    </view>

    <!-- 支付按钮 -->
    <button v-if="order" type="primary" @click="payOrder(order)">确认支付</button>
  </view>
</template>

<style scoped>
.container { padding: 20rpx; }
.order-info { background: #fff; border-radius: 10rpx; padding: 20rpx; margin-bottom: 20rpx; }
.info-item { padding: 10rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.items { background: #fff; border-radius: 10rpx; padding: 20rpx; }
.item-title { font-weight: bold; margin-bottom: 10rpx; }
.item { display: flex; justify-content: space-between; padding: 8rpx 0; }
button { margin-top: 30rpx; }

.coupon-list {
  padding: 20rpx;
}
.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff5e6;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}
.coupon-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.coupon-status {
  font-size: 24rpx;
  padding: 6rpx 24rpx;
  border-radius: 30rpx;
  background: #4cd964;
  color: #ffffff;
  flex-shrink: 0;
}
/* 已使用状态 */
.coupon-status.used {
  background: #e5e5e5;
  color: #999999;
}
.empty {
  text-align: center;
  color: #999999;
  font-size: 28rpx;
  padding: 60rpx 0;
}
</style>