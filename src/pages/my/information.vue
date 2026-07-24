<script setup lang="ts">
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// --- 类型定义 ---
interface UserInfo {
  userId: number;
  openId: string;
  nickname: string;
  avatar: string;
  phoneMasked: string;
  gender: number;        // 0: 未知, 1: 男, 2: 女
  points: number;
  balance: string;
  birthday: string;      // 后端返回的是字符串 "yyyy-MM-dd"
}

// --- 状态定义 ---
const userInfo = reactive<UserInfo>({
  userId: 0,
  openId: '',
  nickname: '',
  avatar: '/static/cow.png',
  phoneMasked: '',
  gender: 0,
  points: 0,
  balance: '0.00',
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
      uni.showToast({ title: '请点击保存上传头像', icon: 'none' });
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
  const monthStr = month > 9 ? month : '0' + month;
  const dayStr = day > 9 ? day : '0' + day;
  return `${year}-${monthStr}-${dayStr}`;
};

const onBirthdayChange = (e: any) => {
  userInfo.birthday = e.detail.value;
};

// 保存用户信息
const saveInfo = () => {
  if (!userInfo.nickname?.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' });
    return;
  }

  // 从缓存获取最新的 userId（兼容多种字段名）
  const cached = uni.getStorageSync('userInfo');
  const userId = userInfo.userId || cached?.userId || cached?.id;

  if (!userId) {
    uni.showToast({ title: '用户ID丢失，请重新登录', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '保存中...' });

  // 构造请求数据
  const requestData: any = {
    userId: Number(userId)
  };

  if (userInfo.nickname) requestData.nickname = userInfo.nickname;
  if (userInfo.gender !== undefined && userInfo.gender !== null) {
    requestData.gender = Number(userInfo.gender);
  }
  if (userInfo.birthday) requestData.birthday = userInfo.birthday;
  if (userInfo.avatar && userInfo.avatar.startsWith('http')) {
    requestData.avatar = userInfo.avatar;
  }

  console.log('发送数据:', JSON.stringify(requestData));

  uni.request({
    url: 'http://localhost:8081/api/user/update',
    method: 'PUT',
    header: {
      'Content-Type': 'application/json'
    },
    data: requestData,
    success: (res: any) => {
      uni.hideLoading();
      console.log('后端响应:', JSON.stringify(res.data));

      if (res.data.code === 200 && res.data.data) {
        const data = res.data.data;
        // 更新页面数据（兼容字段名）
        Object.assign(userInfo, {
          userId: data.userId || data.id || userInfo.userId,
          openId: data.openId || data.openid || userInfo.openId,
          nickname: data.nickname || userInfo.nickname,
          avatar: data.avatar || userInfo.avatar,
          phoneMasked: data.phoneMasked || userInfo.phoneMasked,
          gender: data.gender !== undefined ? Number(data.gender) : userInfo.gender,
          points: Number(data.points) || userInfo.points,
          balance: data.balance || userInfo.balance,
          birthday: data.birthday || userInfo.birthday
        });

        // 同步到缓存（统一字段名）
        const cacheData = {
          userId: userInfo.userId,
          openId: userInfo.openId,
          nickname: userInfo.nickname,
          avatar: userInfo.avatar,
          phoneMasked: userInfo.phoneMasked,
          gender: userInfo.gender,
          points: userInfo.points,
          balance: userInfo.balance,
          birthday: userInfo.birthday
        };
        uni.setStorageSync('userInfo', cacheData);
        console.log('更新缓存:', JSON.stringify(cacheData));

        uni.showToast({ title: '保存成功' });
        setTimeout(() => uni.navigateBack(), 1000);
      } else {
        uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
      }
    },
    fail: (err) => {
      uni.hideLoading();
      console.error('请求失败:', err);
      uni.showToast({ title: '网络错误，请重试', icon: 'none' });
    }
  });
};

const navigateTo = (url: string) => {
  uni.navigateTo({ url });
};

// 加载用户信息
const loadUserInfo = () => {
  const storedUser = uni.getStorageSync('userInfo');
  console.log('缓存中的userInfo:', JSON.stringify(storedUser));

  if (storedUser && typeof storedUser === 'object') {
    // 兼容多种字段名
    const userId = storedUser.userId || storedUser.id;

    if (!userId) {
      console.error('缓存中无有效 userId');
      uni.showModal({
        title: '提示',
        content: '登录信息已过期，请重新登录',
        showCancel: false,
        success: () => {
          uni.reLaunch({ url: '/pages/login/login' });
        }
      });
      return;
    }

    // 合并缓存数据
    Object.assign(userInfo, {
      userId: Number(userId),
      openId: storedUser.openId || storedUser.openid || '',
      nickname: storedUser.nickname || storedUser.username || '微信用户',
      avatar: storedUser.avatar || '/static/cow.png',
      phoneMasked: storedUser.phoneMasked || storedUser.phone || '',
      gender: storedUser.gender !== undefined ? Number(storedUser.gender) : 0,
      points: Number(storedUser.points) || 0,
      balance: storedUser.balance || '0.00',
      birthday: storedUser.birthday || ''
    });
  } else {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        uni.reLaunch({ url: '/pages/login/login' });
      }
    });
    return;
  }

  // 从后端获取最新用户信息
  const userId = userInfo.userId;
  if (!userId) {
    uni.showToast({ title: '用户ID无效', icon: 'none' });
    return;
  }

  console.log('请求用户信息, userId:', userId);

  uni.request({
    url: `http://localhost:8081/api/user/get/${userId}`,
    method: 'GET',
    success: (res: any) => {
      console.log('获取用户信息响应:', JSON.stringify(res.data));

      if (res.data.code === 200 && res.data.data) {
        const data = res.data.data;
        // 更新数据（兼容字段名）
        Object.assign(userInfo, {
          userId: data.userId || data.id || userInfo.userId,
          openId: data.openId || data.openid || '',
          nickname: data.nickname || '微信用户',
          avatar: data.avatar || '/static/cow.png',
          phoneMasked: data.phoneMasked || '',
          gender: data.gender !== undefined ? Number(data.gender) : 0,
          points: Number(data.points) || 0,
          balance: data.balance || '0.00',
          birthday: data.birthday || ''
        });

        // 同步到缓存（统一字段名）
        const cacheData = {
          userId: userInfo.userId,
          openId: userInfo.openId,
          nickname: userInfo.nickname,
          avatar: userInfo.avatar,
          phoneMasked: userInfo.phoneMasked,
          gender: userInfo.gender,
          points: userInfo.points,
          balance: userInfo.balance,
          birthday: userInfo.birthday
        };
        uni.setStorageSync('userInfo', cacheData);
        console.log('更新缓存:', JSON.stringify(cacheData));
      } else {
        console.warn('获取用户信息失败:', res.data.msg);
        // 即使获取失败，也保留缓存中的数据
      }
    },
    fail: (err) => {
      console.error('获取用户信息请求失败:', err);
      // 网络错误时不提示，使用缓存数据
    }
  });
};

onLoad(() => {
  loadUserInfo();
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
      <view class="divider"></view>

      <!-- 2. 姓名 -->
      <view class="list-item">
        <text class="label">姓名</text>
        <input
            class="input-field"
            v-model="userInfo.nickname"
            placeholder="微信用户"
            placeholder-class="placeholder-style"
            maxlength="20"
        />
      </view>

      <!-- 分割线 -->
      <view class="divider"></view>

      <!-- 3. 手机 (只读) -->
      <view class="list-item">
        <text class="label">手机</text>
        <view class="right-content link-row">
          <text>{{ userInfo.phoneMasked || '未绑定' }}</text>
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

      <view class="divider"></view>

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

    <!-- 第三组：积分和余额 -->
    <view class="card-group">
      <view class="list-item">
        <text class="label">积分</text>
        <view class="right-content link-row">
          <text class="value-text">{{ userInfo.points || 0 }}</text>
        </view>
      </view>

      <view class="divider"></view>

      <view class="list-item">
        <text class="label">余额</text>
        <view class="right-content link-row">
          <text class="value-text">¥{{ userInfo.balance || '0.00' }}</text>
        </view>
      </view>
    </view>

    <!-- 第四组：其他功能 -->
    <view class="card-group">
      <view class="list-item" @click="navigateTo('/pages/my/security')">
        <text class="label">账户与安全</text>
        <view class="right-content link-row">
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>

      <view class="divider"></view>

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
  background-color: #f7f8fa;
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
  height: 110rpx;
}

/* 左侧 Label 样式 */
.label {
  font-size: 30rpx;
  color: #999999;
  width: 180rpx;
  flex-shrink: 0;
}

/* 右侧内容容器 */
.right-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 分割线 */
.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin-left: 0;
}

/* 头像 */
.avatar-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #eee;
  border: 2rpx solid #f0f0f0;
}

/* 输入框 */
.input-field {
  text-align: right;
  font-size: 30rpx;
  color: #333;
  flex: 1;
  height: 100rpx;
}

.placeholder-style {
  color: #cccccc;
  font-size: 30rpx;
}

/* 带箭头的行 */
.link-row {
  font-size: 30rpx;
  color: #333;
}

/* 性别单选组 */
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

/* 数值显示 */
.value-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

/* 底部按钮 */
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
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.save-btn {
  background-color: #ffc107;
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