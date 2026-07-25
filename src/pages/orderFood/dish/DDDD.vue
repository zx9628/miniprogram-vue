<script setup lang="ts">
const ifAddDish=()=>{
  console.log("点击了按钮")
  uni.navigateTo({
    url: '../orderFood/dish/dishAdd'
  });
}

const ifDeleteDish=()=>{
  console.log("点击了按钮")
  uni.navigateTo({
    url: '../orderFood/dish/dishDelete'
  });
}

const ifChangeDish=()=>{
  console.log("点击了按钮")
  uni.navigateTo({
    url: '../orderFood/dish/dishChange'
  });
}
</script>

<template>
  <button @click="ifAddDish">增加菜品</button>
  <button @click="ifDeleteDish">删除菜品</button>
  <button @click="ifChangeDish">修改菜品</button>
</template>

<style scoped>

</style>