<script setup lang="ts">
import {onMounted, ref} from "vue";
import {deleteCoupon, getAllCoupon, searchCoupon} from "@/util/coupon";
import UpdateCoupon from "@/pages/index/admin/couponManageView/updateCoupon.vue";

const emit = defineEmits(['cancel'])
const handleCancel =()=>{
  emit('cancel')
}
const list = ref([])
const showForm = ref(false)
const currentView = ref('')
const parentItem = ref<any>(null);

const userHave = ref()

const fetchAll = async () => {
  const res = await getAllCoupon()
  list.value = res.data.data
}
// 获取列表
onMounted(fetchAll)

// 删除优惠券，接收 id 参数
const deleteCoupons = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该优惠券吗？',
    success: async (modalRes) => {
      if (modalRes.confirm) {
        const res = await deleteCoupon({ id })
        if (res.code === 200) {
          //调用数组的 filter 方法，遍历 list.value 中的每一项，只保留 id 不等于传入参数 id 的元素，被删除的优惠券（其 id 匹配）则被过滤掉。
          // filter 返回一个新数组，不修改原数组
          list.value = list.value.filter(item => item.id !== id)
          uni.showToast({ title: '删除成功', icon: 'success' })
        } else {
          uni.showToast({ title: res.msg || '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const openView=(view:any,item:any)=>{
  currentView.value = view;
  parentItem.value = item;
  showForm.value = true;
}

const handleUpdated = async () => {
  const res = await getAllCoupon()
  list.value = res.data.data
}

//查询按钮
const search=async ()=>{
  const res = await searchCoupon({
    userHave:userHave.value
  })
  if (res.code === 200) {
    uni.showToast({ title: '查询成功', icon: 'success' })
    list.value = res.data
  } else {
    uni.showToast({ title: res.msg || '查询失败kkk', icon: 'none' })
  }
}

// 重置
const reset = async () => {
  userHave.value = ''
  await fetchAll()
}
</script>

<template>
  <view class="change-container">
    <view v-if="!showForm">
      <!-- 顶部返回栏 -->
      <view class="form-header">
        <text class="back-btn" @click="handleCancel">← 返回</text>
        <text class="form-title">修改优惠券</text>
      </view>

      <!-- 查询部分 -->
        <view class="field">
          <text class="label">用户ID</text>
          <input class="input" type="text" v-model="userHave" placeholder="请输入用户ID" />
        </view>


        <view class="search-actions">
          <button class="search-btn" @click="search">查询</button>
          <button class="reset-btn" @click="reset">重置</button>
        </view>


      <!--展示已有优惠卷-->
      <view class="coupon-list">
        <view
            class="coupon-item"
            v-for="item in list"
            :key="item.id"
            :class="{'used': item.status === 1}"
        >
          <text class="coupon-name">{{ item.name }}</text>
          <text class="coupon-status">
            {{ item.status === 0 ? '未使用' : '已使用' }}
          </text>
          <text class="coupon-userHave">用户id：{{item.userHave}}</text>
          <!-- 点击时传递 item.id -->
          <button @click="openView('update',item)" class="update-btn">更新</button>
          <button @click="deleteCoupons(item.id)" class="delete-btn">删除</button>
        </view>
        <text v-if="list.length === 0" class="empty">暂无优惠券</text>
      </view>
    </view>

    <view v-else>
      <update-coupon v-if="currentView === 'update'"
                     :parentItem="parentItem"
                     @cancel="showForm = false"
                     @updated="handleUpdated"
      />
    </view>
  </view>
</template>

<style scoped>
.change-container {
  padding: 20rpx;
}
.back-btn {
  background: #3498db;
  color: #fff;
  border: none;
  padding: 8rpx 24rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}
.coupon-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.coupon-userHave{
  font-size: 24rpx;
  color: #7f8c8d;
}

.coupon-name {
  font-size: 28rpx;
  font-weight: 500;
}
.coupon-status {
  font-size: 24rpx;
  color: #7f8c8d;
}
.update-btn {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.delete-btn{
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 4rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.used {
  opacity: 0.6;
}

.empty {
  text-align: center;
  color: #95a5a6;
  padding: 40rpx 0;
}

.form-header {
  display: flex;
  align-items: center;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f2f5;
  margin-bottom: 24rpx;
}

.back-btn:active {
  background: #fde8d8;
}

.form-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-right: 60rpx; /* 平衡返回按钮偏移 */
}
</style>