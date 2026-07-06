<template>
  <view class="container">
    <view class="header">首页</view>
    <view class="content">
      <text>欢迎来到移动商城首页4！</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// 逻辑层代码
import {onMounted} from "@vue/runtime-core";

onMounted(() => {
  uni.request({
    url: 'https://www.example.com/request', //仅为示例，并非真实接口地址。
    data: {
      text: 'uni.request'
    },
    header: {
      'custom-header': 'hello' //自定义请求头信息
    },
    success: (res) => {
      console.log(res.data);
      this.text = 'request success';
    }
  });
})
</script>

<style scoped>
.container { padding: 20px; }
.header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }
.content { color: #666; font-size: 16px; }
</style>