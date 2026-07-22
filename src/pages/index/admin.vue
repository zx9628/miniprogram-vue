<template>
  <view class="admin-container">
    <!-- 顶部栏 -->
    <view class="admin-header">
      <view class="header-left">
        <text class="logo-text">🍽️ 大胃王</text>
      </view>
      <view class="header-right">
        <view class="user-info">
          <uni-icons type="person-filled" size="18" color="#7f8c8d"></uni-icons>
          <text class="user-name">{{ currentUser.name }}</text>
          <text class="role-tag">({{ currentUser.role }})</text>
        </view>
        <view class="logout-btn" @click="handleLogout">
          <text>退出</text>
        </view>
      </view>
    </view>

    <!-- 主体布局 -->
    <view class="admin-layout">
      <!-- 左侧可折叠导航 -->
      <view class="sidebar-wrapper" :class="{ collapsed: sidebarCollapsed }">
        <!-- 折叠按钮 -->
        <view class="collapse-btn-area">
          <view class="collapse-btn" @click="toggleSidebar">
            <uni-icons
                :type="sidebarCollapsed ? 'bars' : 'left'"
                size="20"
                color="#ecf0f1"
            ></uni-icons>
          </view>
        </view>

        <!-- 菜单滚动区 -->
        <scroll-view class="menu-scroll" scroll-y :show-scrollbar="false">
          <view class="menu-list">
            <view
                v-for="menu in menuList"
                :key="menu.code"
                class="menu-item"
                :class="{ open: menu.open, active: isMenuActive(menu) }"
            >
              <!-- 一级菜单 -->
              <view class="menu-item-header" @click="handleMenuClick(menu)">
                <uni-icons
                    :type="menu.icon"
                    size="18"
                    :color="isMenuActive(menu) ? '#fff' : '#bdc3c7'"
                    class="menu-icon"
                ></uni-icons>
                <text v-if="!sidebarCollapsed" class="menu-text">{{ menu.name }}</text>
                <uni-icons
                    v-if="!sidebarCollapsed && menu.children && menu.children.length"
                    type="right"
                    size="12"
                    :color="isMenuActive(menu) ? '#fff' : '#bdc3c7'"
                    class="arrow-icon"
                    :class="{ rotated: menu.open }"
                ></uni-icons>
              </view>

              <!-- 二级菜单 -->
              <view
                  v-if="menu.children && menu.children.length && menu.open && !sidebarCollapsed"
                  class="submenu-list"
              >
                <view
                    v-for="child in menu.children"
                    :key="child.code"
                    class="submenu-item"
                    :class="{ 'router-active': currentRoute === child.route }"
                    @click.stop="navigateTo(child)"
                >
                  <view class="submenu-dot"></view>
                  <text>{{ child.name }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 右侧内容区 -->
      <view class="main-content">
        <scroll-view class="content-view" scroll-y :show-scrollbar="false">
          <!-- 工作台（默认首页） -->
          <view v-if="currentRoute === 'dashboard'" class="dashboard-page">
            <!-- 统计卡片 -->
            <view class="dashboard-cards">
              <view class="stat-card">
                <uni-icons type="list" size="36" color="#e67e22"></uni-icons>
                <view class="stat-info">
                  <text class="stat-label">今日订单</text>
                  <text class="stat-number">{{ stats.todayOrders }}</text>
                </view>
              </view>
              <view class="stat-card">
                <uni-icons type="gift" size="36" color="#e67e22"></uni-icons>
                <view class="stat-info">
                  <text class="stat-label">今日营业额</text>
                  <text class="stat-number">¥{{ stats.todayRevenue }}</text>
                </view>
              </view>
              <view v-if="hasPermission('order:refund_approve')" class="stat-card">
                <uni-icons type="info" size="36" color="#e74c3c"></uni-icons>
                <view class="stat-info">
                  <text class="stat-label">待处理退款</text>
                  <text class="stat-number warn">{{ stats.pendingRefunds }}</text>
                </view>
              </view>
              <view v-if="hasPermission('inventory:view')" class="stat-card">
                <uni-icons type="settings" size="36" color="#f39c12"></uni-icons>
                <view class="stat-info">
                  <text class="stat-label">库存预警</text>
                  <text class="stat-number warn">{{ stats.lowStock }}</text>
                </view>
              </view>
            </view>

            <!-- 快捷入口 -->
            <view class="quick-section">
              <text class="section-title">快捷入口</text>
              <view class="quick-actions">
                <view
                    v-if="hasPermission('table:manage')"
                    class="action-btn"
                    @click="navigateTo({ route: 'table-manage' })"
                >
                  <uni-icons type="map" size="16" color="#e67e22"></uni-icons>
                  <text>开台</text>
                </view>
                <view
                    v-if="hasPermission('menu:edit')"
                    class="action-btn"
                    @click="navigateTo({ route: 'menu-edit' })"
                >
                  <uni-icons type="plus" size="16" color="#e67e22"></uni-icons>
                  <text>新建菜品</text>
                </view>
                <view
                    v-if="hasPermission('order:list')"
                    class="action-btn"
                    @click="navigateTo({ route: 'order-list' })"
                >
                  <uni-icons type="list" size="16" color="#e67e22"></uni-icons>
                  <text>订单列表</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 其他页面占位 -->
          <view v-else class="page-placeholder">
            <order-manage v-if="currentPageTitle === '订单列表'"></order-manage>
            <prod-manage v-if="currentPageTitle === '菜品编辑'"></prod-manage>
<!--            <text class="page-title">{{ currentPageTitle }}</text>-->
<!--            <text class="page-desc">此处为【{{ currentPageTitle }}】功能页面，内容待实现。</text>-->
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import OrderManage from "@/pages/index/admin/orderManage.vue";
import ProdManage from "@/pages/index/admin/prodManage.vue";
import request from "@/util/request"

const currentUser = reactive({
  name:'',
  role:'',
  permissions:[]
})
const menuList = ref([])

const hasPermission = (permCode)=>{
  return currentUser.permissions.includes(permCode)
}

const getIcon=(code)=>{
  const icons={
    order:"list",
    menu:"shop",
    user:"person",
    system:"gear",
    dashboard:"home-filled",
    finance:"bars"
  }
  return icons[code] || "list"
}

const formatMenu=(menus)=>{
  return menus.map(item=>({
    ...item,
    route:item.path || item.code,
    icon:getIcon(item.code),
    open:true,
    children:item.children ? formatMenu(item.children) : []
  }))
}

const sidebarCollapsed = ref(false)

const getStoredCollapsed=()=>{
  try{
    const val=uni.getStorageSync('sidebar_collapsed')
    return val===true || val==='true'
  }catch(e){
    return false
  }
}

sidebarCollapsed.value=getStoredCollapsed()

const toggleSidebar=()=>{
  sidebarCollapsed.value=!sidebarCollapsed.value
  uni.setStorageSync(
      'sidebar_collapsed',
      sidebarCollapsed.value.toString()
  )
}

const currentRoute=ref('dashboard')

const currentPageTitle=computed(()=>{
  const findTitle=(menus,route)=>{
    for(const menu of menus){
      if(menu.route===route){
        return menu.name
      }
      if(menu.children){
        const child=findTitle(menu.children,route)
        if(child){
          return child
        }
      }
    }
    return '未知页面'
  }
  return findTitle(menuList.value,currentRoute.value)
})

const navigateTo=(menuItem)=>{
  if(menuItem.route){
    currentRoute.value=menuItem.route
  }
}

const handleMenuClick=(menu)=>{
  if(menu.children && menu.children.length){
    menu.open=!menu.open
  }else{
    navigateTo(menu)
  }
}

const isMenuActive=(menu)=>{
  if(menu.children && menu.children.length){
    return menu.children.some(
        child=>child.route===currentRoute.value
    )
  }
  return menu.route===currentRoute.value
}

const stats=reactive({
  todayOrders:128,
  todayRevenue:8642.5,
  pendingRefunds:3,
  lowStock:7
})

const handleLogout=()=>{
  uni.showModal({
    title:'提示',
    content:'确定要退出登录吗？',
    success:(res)=>{
      if(res.confirm){
        uni.showToast({
          title:'已退出登录',
          icon:'none'
        })
      }
    }
  })
}

onMounted(()=>{

  request.post(
      "/api/login/admin",
      {
        username:"boss",
        password:"12345678wlb"
      }
  ).then(res=>{

    if(res.code===200){

      const admin=res.data

      console.log("管理员信息",admin)


      currentUser.name=
          admin.username


      currentUser.role=
          admin.rolename


      currentUser.permissions=
          admin.permissionList
              ?.map(item=>item.code)
              .filter(Boolean)
          ||
          []


      menuList.value=
          formatMenu(admin.menuTree || [])


      console.log("动态菜单",menuList.value)

    }

  })

})
</script>

<style scoped>
.admin-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
}

/* ========== 顶部栏 ========== */
.admin-header {
  height: 96rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
}
.logo-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #e67e22;
  letter-spacing: 2rpx;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.user-name {
  font-size: 24rpx;
  color: #2c3e50;
  font-weight: 500;
}
.role-tag {
  font-size: 20rpx;
  color: #95a5a6;
}
.logout-btn {
  padding: 8rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #555;
  background: #fff;
  white-space: nowrap;
}
.logout-btn:active {
  background: #f8f8f8;
  border-color: #ccc;
  color: #e67e22;
}

/* ========== 主体布局 ========== */
.admin-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ========== 侧边栏 ========== */
.sidebar-wrapper {
  background: #2c3e50;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.25s ease;
  width: 200rpx;
}
.sidebar-wrapper.collapsed {
  width: 70rpx;
}

.collapse-btn-area {
  padding: 16rpx;
  display: flex;
  justify-content: flex-end;
}
.collapse-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.collapse-btn:active {
  background: rgba(255, 255, 255, 0.22);
}

/* 菜单滚动区 */
.menu-scroll {
  flex: 1;
  height: 0; /* 配合flex:1使scroll-view正常工作 */
  padding: 0 8rpx 16rpx;
}

/* 菜单列表 */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.menu-item {
  border-radius: 12rpx;
  overflow: hidden;
}

.menu-item-header {
  display: flex;
  align-items: center;
  padding: 16rpx 12rpx;
  color: #bdc3c7;
  border-radius: 12rpx;
  white-space: nowrap;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}
.menu-item-header:active {
  background: rgba(255, 255, 255, 0.1);
}
.menu-item.active > .menu-item-header {
  background: #e67e22;
  color: #ffffff;
}

.menu-icon {
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 24rpx;
}

.arrow-icon {
  flex-shrink: 0;
  transition: transform 0.2s;
}
.arrow-icon.rotated {
  transform: rotate(90deg);
}

/* 二级菜单 */
.submenu-list {
  padding-left: 20rpx;
  padding-top: 4rpx;
  padding-bottom: 4rpx;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  border-radius: 10rpx;
  color: #bdc3c7;
  font-size: 22rpx;
  white-space: nowrap;
  gap: 10rpx;
}
.submenu-item:active {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}
.submenu-item.router-active {
  background: rgba(230, 126, 34, 0.35);
  color: #f39c12;
  font-weight: 500;
}

.submenu-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #7f8c8d;
  flex-shrink: 0;
}
.submenu-item.router-active .submenu-dot {
  background: #f39c12;
}

/* ========== 右侧内容区 ========== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7fa;
}

.content-view {
  flex: 1;
  height: 0;
  padding: 24rpx;
}

/* ========== 工作台 ========== */
.dashboard-page {
  padding-bottom: 40rpx;
}

.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: calc(50% - 8rpx);
  min-width: 280rpx;
  box-sizing: border-box;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #7f8c8d;
}

.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #2c3e50;
}
.stat-number.warn {
  color: #e74c3c;
}

/* 快捷入口 */
.quick-section {
  margin-top: 8rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16rpx;
  display: block;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #ffffff;
  border: 1rpx solid #e8e8e8;
  padding: 14rpx 24rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #333;
}
.action-btn:active {
  border-color: #e67e22;
  color: #e67e22;
  background: #fef9f4;
}

/* ========== 其他页面占位 ========== */
.page-placeholder {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  min-height: 400rpx;
}

.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  display: block;
  margin-bottom: 20rpx;
}

.page-desc {
  font-size: 26rpx;
  color: #7f8c8d;
  line-height: 1.6;
}
</style>