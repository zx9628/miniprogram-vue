<script setup lang="ts">
import { onMounted, ref } from 'vue';
import request from "@/util/request"; // 如果暂时没用到可以先注释掉，避免报错

const title = ref("");

// ✅ 注意：如果会员储值也移到了分包，记得把这里的 url 也改成 /subPackages/member/recharge
const gridList = ref([
  { name: '会员储值', icon: '/static/images/grid-1.png', url: '/subPackages/member/recharge' },
  { name: '团餐', icon: '/static/images/grid-2.png', url: '/pages/index/grid/groupMeal' },
  { name: '积分商城', icon: '/static/images/grid-3.png', url: '/pages/index/grid/pointsMall' },
  { name: '积分大转盘', icon: '/static/images/grid-4.png', url: '/pages/index/grid/wheel' }
]);

onMounted(() => {
  // 这里可以放初始化逻辑
});

const handleJump = (type: string) => {
  console.log('触发跳转类型:', type);

  switch (type) {
    case 'balance': // 余额 -> 充值界面
      uni.navigateTo({
        url: '/subPackages/member/recharge'
      });
      break;

    case 'dineIn': // 堂食 -> 底部点餐界面 (假设是TabBar页)
      uni.switchTab({
        url: '/pages/index/order'
      });
      break;

    case 'points': // 积分
      uni.navigateTo({
        url: '/subPackages/member/points'
      });
      break;

    case 'coupons': // 优惠券
      uni.navigateTo({
        url: '/subPackages/member/coupons'
      });
      break;

    default:
      break;
  }
};

// 通用跳转方法 (金刚区)
const handleGridClick = (item: any) => {
  if (item.url) {
    uni.navigateTo({
      url: item.url,
      fail: (err) => {
        console.error('跳转失败，请检查路径:', item.url, err);
        uni.showToast({ title: '页面正在开发中', icon: 'none' });
      }
    });
  }
};

// ✅ 更新分包路径
const goToMemberCode = () => {
  uni.navigateTo({
    url: '/subPackages/member/qrcode'
  });
};

// ✅ 更新分包路径
const goToMemberCenter = () => {
  uni.navigateTo({
    url: '/subPackages/member/memberCenter'
  });
};

const goToActivity = () => {
  uni.navigateTo({
    url: '/pages/index/activity/activity'
  });
};

const goToJoin = () => {
  uni.navigateTo({
    url: '/pages/index/join/join'
  });
};
</script>