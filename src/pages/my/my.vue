<template>
  <div class="profile-page">
    <!-- 顶部: 品牌 + 健康标语 -->
    <div class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon">三</div>
          <div class="brand-text">
            三品王
            <small>牛肉粉</small>
          </div>
        </div>
        <div class="header-actions">
          <span class="material-symbols-outlined"></span>
          <span class="material-symbols-outlined"></span>
        </div>
      </div>
      <div class="health-tag">
        <span>🥩</span> 100%牛肉原汤更健康
      </div>
    </div>

    <!-- 注册/登录 会员卡片 -->
    <div class="member-card" @click="handleLogin">
      <div class="member-left">
        <div class="member-greeting">Hi，欢迎光临</div>
        <div class="member-login-btn"><button @click="">注册</button> / <button @click="login">登录</button></div>
      </div>
      <div class="member-right">
        <div class="badge">注册会员</div>
        <div class="sub">尊享更多专属特权</div>
      </div>
    </div>

    <!-- 菜单列表: 我的订单 / 隐私设置 / 会员信息 / 账号绑定管理 / 切换账号 -->
    <div class="menu-section">
      <!-- 我的订单 - 点击跳转到订单页 -->
      <div class="menu-item" @click="goToOrder">
        <span class="icon material-symbols-outlined"></span>
        <div class="info">
          <!-- <img src="../../static/icon/order.png" style="width: 100px; height: 100px;" alt="订单图标"> -->
          <span class="label">我的订单</span>
          <div class="extra">
            <span class="order-badge"></span>
            <span class="arrow material-symbols-outlined"></span>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="menu-item" @click="goToPrivacy">
        <span class="icon material-symbols-outlined"></span>
        <div class="info">
          <span class="label">隐私设置</span>
          <span class="arrow material-symbols-outlined"></span>
        </div>
      </div>

      <!-- 会员信息 -->
      <div class="menu-item" @click="goToMemberInfo">
        <span class="icon material-symbols-outlined"></span>
        <div class="info">
          <span class="label" @click="">会员信息</span>
          <span class="arrow material-symbols-outlined"></span>
        </div>
      </div>

      <!-- 账号绑定管理 -->
      <div class="menu-item" @click="goToBindAccount">
        <span class="icon material-symbols-outlined"></span>
        <div class="info">
          <span class="label">账号绑定管理</span>
          <span class="arrow material-symbols-outlined"></span>
        </div>
      </div>

      <!-- 切换账号 -->
      <div class="menu-item" @click="goToSwitchAccount">
        <span class="icon material-symbols-outlined"></span>
        <div class="info">
          <span class="label">切换账号</span>
          <span class="arrow material-symbols-outlined"></span>
        </div>
      </div>
    </div>

    <!-- 投诉及建议 7*24小时电话 -->
    <div class="complaint-card" @click="goToComplaint">
      <div class="complaint-left">
        <span class="icon material-symbols-outlined"></span>
        <span class="text">
          投诉及建议
          <small>7*24小时电话</small>
        </span>
      </div>
      <div class="complaint-phone">400-1616-833-3</div>
    </div>


  </div>
</template>



<script setup lang="ts">
import {Login} from "@/http/login";

const goToOrder=()=>{
  uni.switchTab({
    url: '/pages/order/order'
  })
}
const login = async () => {
  console.log("login");
  const ifLogin = await Login({
    username: "zfy",
    password: "safsdgf"
  });
  console.log("测试登录是否成功", ifLogin);
}

</script>

<style scoped>
.profile-page {
  max-width: 420px;
  width: 100%;
  background-color: #ffffff;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px;
}

/* ----- 顶部 header ----- */
.header {
  padding: 18px 20px 10px 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-icon {
  background: #c0392b;
  color: white;
  font-weight: 700;
  font-size: 16px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.brand-text small {
  font-weight: 400;
  font-size: 13px;
  color: #888;
  margin-left: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #333;
}

.header-actions span {
  font-size: 22px;
  cursor: default;
}

.health-tag {
  margin-top: 10px;
  background: #fef6f0;
  border-radius: 20px;
  padding: 6px 14px;
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: #b34a2c;
  border: 1px solid #fce4d6;
  letter-spacing: 0.3px;
}

.health-tag span {
  font-weight: 700;
  margin-right: 4px;
}

/* ----- 会员卡片 ----- */
.member-card {
  background: linear-gradient(145deg, #faf2ed, #f5e8e0);
  margin: 16px 20px 20px 20px;
  border-radius: 20px;
  padding: 18px 20px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(180, 80, 40, 0.08);
  cursor: pointer;
}

.member-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-greeting {
  font-size: 16px;
  font-weight: 500;
  color: #2d1b12;
}

.member-login-btn {
  background: #b34a2c;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 20px;
  border-radius: 30px;
  cursor: pointer;
  width: fit-content;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(179, 74, 44, 0.3);
}

.member-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.member-right .badge {
  background: #c0392b;
  color: white;
  font-size: 11px;
  padding: 2px 12px;
  border-radius: 30px;
  font-weight: 500;
}

.member-right .sub {
  font-size: 12px;
  color: #6b4c3a;
  letter-spacing: 0.3px;
}

/* ----- 菜单列表 ----- */
.menu-section {
  margin: 0 20px 20px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.1s;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f8f8f8;
}

.menu-item:active {
  background: #f0f0f0;
}

.menu-item .icon {
  color: #b34a2c;
  font-size: 24px;
  margin-right: 16px;
  width: 28px;
  text-align: center;
}

.menu-item .info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item .label {
  font-size: 16px;
  font-weight: 450;
  color: #1f1f1f;
}

.menu-item .arrow {
  color: #b0b0b0;
  font-size: 20px;
}

.order-badge {
  background: #c0392b;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 0 10px;
  border-radius: 30px;
  line-height: 20px;
  margin-left: 10px;
}

.menu-item .extra {
  display: flex;
  align-items: center;
}

/* ----- 投诉及建议 ----- */
.complaint-card {
  margin: 0 20px 24px 20px;
  background: white;
  border-radius: 20px;
  border: 1px solid #f0f0f0;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.1s;
}

.complaint-card:hover {
  background: #f8f8f8;
}

.complaint-card:active {
  background: #f0f0f0;
}

.complaint-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.complaint-left .icon {
  color: #b34a2c;
  font-size: 24px;
}

.complaint-left .text {
  font-size: 15px;
  font-weight: 450;
  color: #1f1f1f;
}

.complaint-left .text small {
  font-weight: 400;
  color: #999;
  font-size: 13px;
  margin-left: 8px;
}

.complaint-phone {
  background: #f5f0ec;
  padding: 5px 14px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  color: #2d1b12;
  letter-spacing: 0.3px;
}

/* ----- 底部导航 ----- */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 420px;
  margin: 0 auto;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 12px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
  z-index: 10;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  color: #888;
  transition: color 0.1s;
  padding: 4px 12px;
  border-radius: 8px;
}

.nav-item:hover {
  color: #b34a2c;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item.active {
  color: #b34a2c;
}

.nav-item span:first-child {
  font-size: 26px;
}

.nav-item span:last-child {
  font-size: 12px;
  font-weight: 450;
}

.nav-item.active span:last-child {
  font-weight: 600;
}

/* 图标字体设置 */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* 小屏适配 */
@media (max-width: 420px) {
  .member-card {
    margin: 12px 16px 16px 16px;
  }
  .menu-section {
    margin: 0 16px 16px 16px;
  }
  .complaint-card {
    margin: 0 16px 20px 16px;
  }
}
</style>