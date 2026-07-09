<template>
  <view class="container">
    <view class="header">首页</view>
    <view class="content">
      <text>欢迎来到移动商城首页！{{ title }}</text>
    </view>
  </view>
</template>
<script setup>
import {onMounted, ref} from "vue";

const title = ref("")
import request from "@/util/request";
onMounted(()=>{
  let data = {
    text: 'uni.request'
  };
  request.get("/tcm-api/test",data)
      .then((res) =>{
          console.log(res.data);
          title.value = res;
          }
      )
})

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




