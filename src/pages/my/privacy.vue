<script setup lang="ts">
import { ref } from 'vue';

// 定义协议列表数据
const agreementList = ref([
  { title: '《2025年会员制度》', url: '' },
  { title: '《储值协议》', url: '' },
  { title: '《券包活动》', url: '' },
  { title: '《三品王预付卡购卡协议》', url: '' },
  { title: '《三品王隐私政策》', url: '' },
  { title: '《单用途商业电子预付卡购卡章程》', url: '' },
  { title: '《商家隐私政策》', url: '' },
  { title: '《未成年人隐私政策》', url: '' },
  { title: '《用户服务协议》', url: '' },
  { title: '《第三方SDK共享清单》', url: '' },
  { title: '《个人信息收集清单》', url: '' }
]);

// 点击列表项跳转
const handleItemClick = (item: any) => {
  // 这里可以跳转到具体的 H5 链接或详情页
  // 例如：uni.navigateTo({ url: `/pages/common/webview?url=${encodeURIComponent(item.url)}` })
  if (item.url) {
    console.log('跳转到:', item.url);
  } else {
    uni.showToast({ title: '暂无内容', icon: 'none' });
  }
};
</script>

<template>
  <view class="container">
    <!-- 协议列表卡片 -->
    <view class="card-group">
      <view
          v-for="(item, index) in agreementList"
          :key="index"
          class="list-item"
          @click="handleItemClick(item)"
      >
        <text class="item-title">{{ item.title }}</text>
        <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
      </view>
    </view>

    <!-- 悬浮按钮 (可选，参考截图右下角) -->
    <view class="float-btn" @click="uni.showToast({title: '投诉建议功能开发中', icon: 'none'})">
      <uni-icons type="chatbubble-filled" size="20" color="#333"></uni-icons>
      <text class="btn-text">投诉建议</text>
    </view>
  </view>
</template>

<style scoped>
/* 页面背景 */
.container {
  min-height: 100vh;
  background-color: #f7f8fa; /* 浅灰背景 */
  padding-top: 20rpx;
}

/* 卡片容器 */
.card-group {
  background-color: #ffffff;
  margin-bottom: 20rpx;
}

/* 列表项样式 */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

/* 去除最后一项的底边框 */
.list-item:last-child {
  border-bottom: none;
}

/* 标题文字 */
.item-title {
  font-size: 30rpx;
  color: #333333;
  flex: 1;
}

/* 悬浮按钮样式 */
.float-btn {
  position: fixed;
  bottom: 100rpx;
  right: 30rpx;
  background-color: #ffffff;
  padding: 15rpx 25rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 99;
}

.btn-text {
  font-size: 26rpx;
  color: #333;
  margin-left: 8rpx;
}
</style>