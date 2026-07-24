<script setup lang="ts">
import { deleteDish } from "@/http/dish";
import {computed, ref} from "vue";

const dishid = ref('');

const deleteDishInfo = computed(() => ({
  id: dishid.value,
}))

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <h1>删除菜品页面</h1>
  <!-- ✅ 去掉 type="number" -->
  <input v-model="dishid" placeholder="请输入菜品id"/>
  <button @click="goBack">取消</button>
  <button @click="deleteDish(deleteDishInfo)">确定</button>
</template>