<script setup lang="ts">
import {addDish} from "@/http/dish";
import {computed, ref} from "vue";

const dishid = ref(0);
const dishstore_id = ref(0);
const dishcategory_id = ref(0);
const dishprice = ref(0);
const dishname = ref('');

const addDishInfo = computed(() => ({
  id: dishid.value,
  store_id: dishstore_id.value,
  category_id: dishcategory_id.value,
  price: dishprice.value,
  name: dishname.value,
  specification: 0,
  image: null,
  description: null
}))

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <h1>添加菜品页面</h1>
  <input type="number" v-model="dishid" placeholder="请输入菜品id"/>
  <input type="number" v-model="dishstore_id" placeholder="请输入菜品store_id"/>
  <input type="number" v-model="dishcategory_id" placeholder="请输入菜品category_id"/>
  <input type="number" v-model="dishprice" placeholder="请输入菜品price"/>
  <input type="text" v-model="dishname" placeholder="请输入菜品name"/>
  <button @click="goBack">取消</button>
  <button @click="addDish(addDishInfo)">确定</button>
</template>

<style scoped>

</style>