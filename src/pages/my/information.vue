<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// --- 状态定义 ---
const userInfo = reactive({
  id: 0,
  avatar: '/static/cow.png', // 默认头像
  nickname: '',
  phone: '',
  gender: 0,                 // 0: 未知, 1: 男, 2: 女
  birthday: ''
});

// --- 方法逻辑 ---
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      userInfo.avatar = res.tempFilePaths[0];
    }
  });
};

const onGenderChange = (e: any) => {
  userInfo.gender = parseInt(e.detail.value);
};

const getDate = (type: string) => {
  const date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (type === 'end') year = year + 2;
  month = month > 9 ? month : '0' + month;
  day = day > 9 ? day : '0' + day;
  return `${year}-${month}-${day}`;
};

const onBirthdayChange = (e: any) => {
  userInfo.birthday = e.detail.value;
};

const saveInfo = () => {
  if (!userInfo.nickname) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '保存中...' });

  uni.request({
    url: 'http://localhost:8083/api/user/update',
    method: 'PUT',
    data: {
      id: userInfo.id,
      username: userInfo.nickname,
      gender: userInfo.gender,
      birthday: userInfo.birthday,
      avatar: userInfo.avatar
    },
    success: (res) => {
      uni.hideLoading();
      if (res.data.code === 200) {
        // 获取后端返回的最新用户信息
        const serverData = res.data.data;
        Object.assign(userInfo, serverData);
        if (serverData.username) {
          userInfo.nickname = serverData.username;
        }

        //更新本地缓存，保证下次进来也是对的
        uni.setStorageSync('userInfo', userInfo);

        uni.showToast({ title: '保存成功' });

        console.log('后端返回的数据:', res.data);
        setTimeout(() => uni.navigateBack(), 1000);
      } else {
        uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '网络错误', icon: 'none' });
    }
  });
};

const navigateTo = (url: string) => {
  uni.navigateTo({ url });
};

onLoad(() => {
  const storedUser = uni.getStorageSync('userInfo');
  if (storedUser) {
    Object.assign(userInfo, storedUser);
    userInfo.nickname = storedUser.username || '';
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' });
  }
});
</script>

<template>
  <view class="container">

    <!-- 第一组：核心资料 -->
    <view class="card-group">
      <!-- 1. 头像行 -->
      <uni-list-item :showArrow="false" clickable @click="chooseAvatar">
        <template v-slot:body>
          <view class="list-row">
            <text class="label">头像</text>
            <view class="right-content avatar-wrapper">
              <image class="avatar-img" :src="userInfo.avatar" mode="aspectFill"></image>
            </view>
          </view>
        </template>
      </uni-list-item>

      <!-- 分割线 -->
      <view class="divider" v-if="true"></view>

      <!-- 2. 姓名 -->
      <view class="list-item">
        <text class="label">姓名</text>
        <input
            class="input-field"
            v-model="userInfo.nickname"
            placeholder="请输入姓名"
            placeholder-class="placeholder-style"
        />
      </view>

      <!-- 分割线 -->
      <view class="divider" v-if="true"></view>

      <!-- 3. 手机 (只读) -->
      <view class="list-item">
        <text class="label">手机</text>
        <view class="right-content link-row">
          <text>{{ userInfo.phone || '未绑定' }}</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 第二组：详细信息 -->
    <view class="card-group">
      <!-- 4. 性别 -->
      <view class="list-item">
        <text class="label">性别</text>
        <radio-group @change="onGenderChange" class="radio-group">
          <label class="radio-label">
            <radio value="1" color="#FFC107" :checked="userInfo.gender === 1" style="transform:scale(0.7)" />
            <text>男</text>
          </label>
          <label class="radio-label">
            <radio value="2" color="#FFC107" :checked="userInfo.gender === 2" style="transform:scale(0.7)" />
            <text>女</text>
          </label>
        </radio-group>
      </view>

      <view class="divider" v-if="true"></view>

      <!-- 5. 生日 -->
      <view class="list-item">
        <text class="label">生日</text>
        <picker mode="date" :value="userInfo.birthday" @change="onBirthdayChange" start="1900-01-01" :end="getDate('end')">
          <view class="right-content link-row">
            <text :class="{ 'placeholder-style': !userInfo.birthday }">
              {{ userInfo.birthday || '请选择' }}
            </text>
            <uni-icons type="right" size="14" color="#ccc"></uni-icons>
          </view>
        </picker>
      </view>
    </view>

    <!-- 第三组：其他功能 -->
    <view class="card-group">
      <!-- 6. 账户与安全 -->
      <view class="list-item" @click="navigateTo('/pages/my/security')">
        <text class="label">账户与安全</text>
        <view class="right-content link-row">
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>

      <view class="divider" v-if="true"></view>

      <!-- 7. 下载会员信息 -->
      <view class="list-item" @click="navigateTo('/pages/my/download')">
        <text class="label">下载会员信息</text>
        <view class="right-content link-row">
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="footer-btn-area">
      <button class="save-btn" @click="saveInfo">保存</button>
    </view>
  </view>
</template>

<style scoped>
/* 页面背景 */
.container {
  min-height: 100vh;
  background-color: #f7f8fa; /* 浅灰背景，突出白色卡片 */
  padding-bottom: 140rpx;
}

/* 卡片容器 */
.card-group {
  background-color: #ffffff;
  margin-top: 20rpx;
  padding: 0 30rpx;
}

/* 每一行 Item */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 110rpx; /* 增加高度，更大气 */
}

/* 左侧 Label 样式 (灰色) */
.label {
  font-size: 30rpx;
  color: #999999; /* 关键：左侧文字变灰 */
  width: 180rpx; /* 固定宽度，保证右侧对齐整齐 */
  flex-shrink: 0;
}

/* 右侧内容容器 (通用) */
.right-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 内容靠右 */
}

/* 分割线 */
.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin-left: 0; /* 如果想让分割线顶格，设为0；如果想缩进，设 margin-left */
}

/* 头像特定样式 */
.avatar-box {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  justify-content: flex-start; /* 头像不需要靠最右，稍微留白 */
}

.avatar-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #eee;
}

.avatar-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 32rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-bottom-left-radius: 50rpx;
  border-bottom-right-radius: 50rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mask-text {
  color: #fff;
  font-size: 20rpx;
  transform: scale(0.9);
}

/* 输入框样式 */
.input-field {
  text-align: right;
  font-size: 30rpx;
  color: #333; /* 输入内容黑色 */
  flex: 1;
}

.placeholder-style {
  color: #cccccc;
  font-size: 30rpx;
}

/* 带箭头的行 (手机、生日、菜单) */
.link-row {
  font-size: 30rpx;
  color: #333;
}

/* 性别单选组优化 */
.radio-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.radio-label {
  display: flex;
  align-items: center;
  margin-left: 30rpx;
  font-size: 30rpx;
  color: #333;
}

/* 底部按钮区域 */
.footer-btn-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background-color: #fff;
  z-index: 10;
}

.save-btn {
  background-color: #ffc107; /* 黄色按钮 */
  color: #fff;
  border-radius: 50rpx;
  font-size: 32rpx;
  height: 90rpx;
  line-height: 90rpx;
  border: none;
  font-weight: bold;
}

.save-btn::after {
  border: none;
}
</style>