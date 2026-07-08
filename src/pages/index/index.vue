<template>
  <view class="container">
    <view class="header">首页</view>
    <view class="content">
      <text>欢迎来到移动商城首页！{{ title }}</text>
    </view>
  </view>
</template>
<script setup>
import {ref} from "vue";

const title = ref("")

uni.request({
  url: 'https://zx.juntaitec.cn/tcm-api/test', //仅为示例，并非真实接口地址。
  data: {
    text: 'uni.request'
  },
  header: {
    'custom-header': 'hello' //自定义请求头信息
  },
  success: (res) => {
    console.log(res.data);
    title.value = res.data;
  }
});


</script>


<style scoped>
.container {
  padding: 20px;
}

.header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.content {
  color: #666;
  font-size: 16px;
}
</style>




