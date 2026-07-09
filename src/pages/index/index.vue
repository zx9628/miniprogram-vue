<template>
  <view class="container">
    <view class="header">首页</view>
    <view class="content">
      <text>欢迎来到三品王7！</text>
      <text class="result">{{ resultText }}</text>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const resultText = ref('');

    onMounted(() => {
      console.log('页面加载');
      uni.request({
        url: 'https://zfy.juntaitec.cn/wechat/test',
        //url: 'https://1.14.132.150/wechat/test',
        data: {
          text: 'uni.request'
        },
        header: {
          'custom-header': 'hello'
        },
        success: (res) => {
          console.log("请求成功", res.data);
          resultText.value = '✅ 成功: ' + res.data;
        },
        fail: (err) => {
          console.error("请求失败", err);
          resultText.value = '❌ 失败: ' + err.errMsg;
        }
      });
    });

    return {
      resultText
    };
  }
};
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
.result {
  display: block;
  margin-top: 20px;
  color: #007aff;
}
</style>