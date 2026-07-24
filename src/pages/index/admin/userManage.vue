<template>
  <view class="container">
  <!-- 顶部搜索栏 -->
  <view class="search-bar">
    <view class="search-input-wrap">
      <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索昵称或手机号"
          confirm-type="search"
          @confirm="handleSearch"
      />
      <view class="clear-btn" v-if="keyword" @click="clearKeyword">✕</view>
    </view>
    <view class="search-btn" @click="handleSearch">搜索</view>
  </view>

    <!-- 用户列表 -->
    <view class="user-list">
      <view
          class="user-card"
          v-for="user in userList"
          :key="user.userId"
      >
        <!-- 左侧信息 -->
        <view class="user-info">
          <text class="user-name">{{ user.nickname || '未设置昵称' }}</text>
          <text class="user-phone">手机：{{ user.phoneMasked || '未绑定' }}</text>
          <view class="user-extra">
            <text class="user-gender">
              {{ user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知' }}
            </text>
            <text class="user-points">积分：{{ user.points }}</text>
          </view>
        </view>

        <!-- 右侧操作 -->
        <view class="user-actions">
          <view class="btn-edit" @click="handleEdit(user)">编辑</view>
          <view class="btn-delete" @click="handleDelete(user)">删除</view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="userList.length === 0 && !loading">
        <text>暂无用户数据</text>
      </view>

      <!-- 分页按钮 -->
      <view class="pagination" v-if="userList.length > 0">
        <view
            class="page-btn"
            :class="{ disabled: pageNum <= 1 }"
            @click="prevPage"
        >上一页</view>

        <text class="page-info">{{ pageNum }} / {{ totalPages }}</text>

        <view
            class="page-btn"
            :class="{ disabled: pageNum >= totalPages }"
            @click="nextPage"
        >下一页</view>
      </view>

      <!-- 加载状态 -->
      <view class="load-more" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view class="modal-mask" v-if="showEditModal" @click="closeEdit">
      <view class="modal-content" @click.stop>
        <text class="modal-title">编辑用户</text>

        <view class="form-item">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="editForm.nickname" placeholder="请输入昵称" />
        </view>

        <view class="form-item">
          <text class="form-label">性别</text>
          <picker :range="genderOptions" :value="editForm.gender" @change="onGenderChange">
            <view class="form-picker">
              {{ genderOptions[editForm.gender] }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">积分</text>
          <input class="form-input" v-model="editForm.points" type="number" placeholder="请输入积分" />
        </view>

        <view class="modal-btns">
          <view class="btn-cancel" @click="closeEdit">取消</view>
          <view class="btn-confirm" @click="confirmEdit">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted ,computed} from 'vue'

const BASE_URL = 'https://zx.juntaitec.cn'

const userList = ref([])
const keyword = ref('')

// 分页相关
const pageNum = ref(1)
const pageSize = 3
const total = ref(0)
const loading = ref(false)
const noMore = ref(false)

// 总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize) || 1
})

// 上一页
const prevPage = () => {
  if (pageNum.value <= 1) return
  pageNum.value--
  fetchUsers()
}

// 下一页
const nextPage = () => {
  if (pageNum.value >= totalPages.value) return
  pageNum.value++
  fetchUsers()
}

// 编辑相关
const showEditModal = ref(false)
const editForm = ref({
  userId: null,
  nickname: '',
  gender: 0,
  points: 0
})
const genderOptions = ['未知', '男', '女']

onMounted(() => {
  fetchUsers()
})

// 获取用户列表
const fetchUsers = async (isLoadMore = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const res = await uni.request({
      url: `${BASE_URL}/api/users`,
      method: 'GET',
      data: {
        pageNum: pageNum.value,
        pageSize: pageSize,
        keyword: keyword.value
      }
    })
    if (res.data.code === 200) {
      const pageData = res.data.data
      total.value = pageData.total

      if (isLoadMore) {
        userList.value = [...userList.value, ...(pageData.records || [])]
      } else {
        userList.value = pageData.records || []
      }

      // 判断是否还有更多数据
      noMore.value = userList.value.length >= total.value
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  noMore.value = false
  fetchUsers()
}
// 清除搜索关键词
const clearKeyword = () => {
  keyword.value = ''
  pageNum.value = 1
  fetchUsers()
}

// 编辑用户
const handleEdit = (user) => {
  editForm.value = {
    userId: user.userId,
    nickname: user.nickname || '',
    gender: user.gender || 0,
    points: user.points || 0
  }
  showEditModal.value = true
}

const onGenderChange = (e) => {
  editForm.value.gender = Number(e.detail.value)
}

const closeEdit = () => {
  showEditModal.value = false
}

// 确认编辑
const confirmEdit = async () => {
  try {
    const res = await uni.request({
      url: `${BASE_URL}/api/users/${editForm.value.userId}`,
      method: 'PUT',
      header: { 'Content-Type': 'application/json' },
      data: {
        nickname: editForm.value.nickname,
        gender: editForm.value.gender,
        points: Number(editForm.value.points)
      }
    })
    if (res.data.code === 200) {
      uni.showToast({ title: '修改成功', icon: 'success' })
      closeEdit()
      // 编辑成功后重新加载第一页
      pageNum.value = 1
      fetchUsers()
    } else {
      uni.showToast({ title: res.data.message || '修改失败', icon: 'none' })
    }
  } catch (error) {
    console.error('修改用户失败:', error)
    uni.showToast({ title: '修改失败', icon: 'none' })
  }
}

// 删除用户
const handleDelete = (user) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除用户「${user.nickname || '该用户'}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await uni.request({
            url: `${BASE_URL}/wechat/users/${user.userId}`,
            method: 'DELETE'
          })
          if (result.data.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            pageNum.value = 1
            fetchUsers()
          } else {
            uni.showToast({ title: result.data.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped>
/* 页面容器 */
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* ==================== 搜索栏 ==================== */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 72rpx;
  background-color: #fff;
  border-radius: 36rpx;
  padding: 0 70rpx 0 30rpx;
  font-size: 28rpx;
}

.clear-btn {
  position: absolute;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: #fff;
  background-color: #ccc;
  border-radius: 50%;
}

.search-btn {
  margin-left: 16rpx;
  padding: 0 30rpx;
  height: 72rpx;
  line-height: 72rpx;
  background-color: #07c160;
  color: #fff;
  border-radius: 36rpx;
  font-size: 28rpx;
  text-align: center;
}

/* ==================== 用户列表 ==================== */
.user-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.user-phone {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.user-extra {
  display: flex;
  margin-top: 6rpx;
}

.user-gender,
.user-points {
  font-size: 22rpx;
  color: #666;
  margin-right: 20rpx;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex-shrink: 0;
}

.btn-edit {
  padding: 8rpx 24rpx;
  background-color: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  text-align: center;
}

.btn-delete {
  padding: 8rpx 24rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  text-align: center;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* ==================== 编辑弹窗 ==================== */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 80%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.form-input {
  height: 72rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-picker {
  height: 72rpx;
  line-height: 72rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
}

.modal-btns {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
}

.btn-cancel {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.btn-confirm {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  background-color: #07c160;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

/* ==================== 分页与加载 ==================== */
.load-more {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  gap: 30rpx;
}

.page-btn {
  padding: 12rpx 30rpx;
  background-color: #07c160;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  text-align: center;
}

.page-btn.disabled {
  background-color: #ccc;
  color: #fff;
}

.page-info {
  font-size: 26rpx;
  color: #666;
}
</style>