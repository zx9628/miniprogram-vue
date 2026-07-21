<template>
  <view class="container">
    <view class="header">首页</view>
    <view class="content">
      <text>欢迎来到移动商城首页！</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {onLoad} from "@dcloudio/uni-app";
import {getCoupon} from "@/http/coupon";
const title = ref('')

onMounted(async ()=>{
    const res = await getCoupon({ id: 3 });

    //存入本地缓存
    uni.setStorageSync('couponList',res.data);
    console.log('用户有的优惠卷：', res.data);
})


onLoad(()=>{


})
</script>

<style scoped>
.container { padding: 20px; }
.header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }
.content { color: #666; font-size: 16px; }
</style>