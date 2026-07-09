<template>
  <view class="admin-container">
    <!-- 左侧菜单（保持不变） -->
    <scroll-view class="left-menu" scroll-y>
      <view
          v-for="(item, index) in menuList"
          :key="index"
          class="menu-item"
          :class="{ active: activeMenu === item.key }"
          @click="switchMenu(item.key)"
      >
        <uni-icons v-if="item.icon" :type="item.icon" size="18" color="#666"></uni-icons>
        <text class="menu-text">{{ item.name }}</text>
      </view>
    </scroll-view>

    <!-- 右侧内容区：改为 v-if 条件渲染 -->
    <view class="right-content">
      <Dashboard v-if="activeMenu === 'dashboard'" />
      <ProdManage v-else-if="activeMenu === 'prodManage'" />
      <OrderManage v-else-if="activeMenu === 'orderManage'" />
      <UserManage v-else-if="activeMenu === 'userManage'" />
      <Settings v-else-if="activeMenu === 'settings'" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
// 引入各个管理页面组件
import ProdManage from './admin/prodManage.vue'
import OrderManage from './admin/orderManage.vue'
import UserManage from './admin/userManage.vue'
import Settings from './admin/settings.vue'
import Dashboard from './admin/dashboard.vue'

// 菜单配置
const menuList = ref([
  { key: 'dashboard', name: '首页仪表盘', icon: 'home', component: 'Dashboard' },
  { key: 'prodManage', name: '商品管理', icon: 'shop', component: 'ProdManage' },
  { key: 'orderManage', name: '订单管理', icon: 'list', component: 'OrderManage' },
  { key: 'userManage', name: '用户管理', icon: 'person', component: 'UserManage' },
  { key: 'settings', name: '店铺设置', icon: 'gear', component: 'Settings' },
])

// 组件映射表（方便动态渲染）
const componentMap = {
  Dashboard,
  ProdManage,
  OrderManage,
  UserManage,
  Settings,
}

// 当前选中菜单
const activeMenu = ref('dashboard')
// 当前显示的组件
const currentComponent = computed(() => componentMap[activeMenu.value] || Dashboard)

// 切换菜单
const switchMenu = (key: string) => {
  activeMenu.value = key
}
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  background: #f5f6f7;
}
.left-menu {
  width: 150rpx;
  background: #2b2f3a;
  color: #fff;
  padding-top: 20rpx;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  font-size: 26rpx;
  color: #b0b3bd;
  transition: all 0.2s;
}
.menu-item.active {
  background: #409eff;
  color: #fff;
}
.menu-text {
  margin-left: 12rpx;
  flex: 1;
}
.right-content {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx;
}
</style>
