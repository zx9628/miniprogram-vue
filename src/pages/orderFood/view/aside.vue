<script setup lang="ts">
import {ref} from "vue";

const menuCategories = ref([
  {
    name:'原汤单点',
  },
  {
    name:'原汤套餐',
  },
  {
    name:'干拌单点',
  },
  {
    name:'干拌套餐',
  },
  {
    name:'精选小吃',
  },
  {
    name:'爆款饮品',
  },
  {
    name:'牛肉干',
  }
])

const activeIndex = ref<number>(0)

const switchCategories = (index:number) =>{
  activeIndex.value = index;
}
</script>

<template>
  <view class="order-food-container">
    <view>
      <view class="uni-padding-wrap uni-common-mt">

        <view>
          <view
              v-for="(item,idx) in menuCategories"
              class="menu-item"
              v-bind:class="{active : activeIndex === idx}"
              @click="switchCategories(idx)">
            {{item.name}}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
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
.menu-item{
  width: 100px;
  height: 50px;
  border-right: 1px solid grey;
  text-align: center;
}
.active{
  background-color: red;
}
</style>