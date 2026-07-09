<script setup lang="ts">

</script>

<template>
  <div class="aside">
    <view>
      <view class="uni-padding-wrap uni-common-mt">

        <view>
          <scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" @scrolltoupper="upper"
                       @scrolltolower="lower" @scroll="scroll">
            <view id="demo1" class="scroll-view-item">原汤单点</view>
            <view id="demo2" class="scroll-view-item">原汤套餐</view>
            <view id="demo3" class="scroll-view-item">干拌单点</view>
            <view id="demo1" class="scroll-view-item">干拌套餐</view>
            <view id="demo2" class="scroll-view-item">精选小吃</view>
            <view id="demo3" class="scroll-view-item">爆款饮品</view>
            <view id="demo1" class="scroll-view-item">牛肉干</view>
            <view id="demo1" class="scroll-view-item">外卖</view>
            <view id="demo1" class="scroll-view-item">联系电话</view>
            <view id="demo1" class="scroll-view-item">制作人</view>
          </scroll-view>
        </view>
      </view>
    </view>
  </div>
</template>

<style scoped>
.aside{
  width: 100px;
  height: 300px;
}
.scroll-Y {
  height: 400px;
  width: 100px;
  border-right: 1px solid grey;
}
.scroll-view_H {
  white-space: nowrap;
  width: 100%;
}
.scroll-view-item {
  height: 100rpx;
  text-align: center;
  font-size: 36rpx;
}
.scroll-view-item_H {
  display: inline-block;
  width: 100%;
  height: 300rpx;
  line-height: 300rpx;
  text-align: center;
  font-size: 36rpx;
}

</style>