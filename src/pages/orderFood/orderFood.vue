<script setup lang="ts">

import Aside from "@/pages/orderFood/view/aside.vue";
import Body from "@/pages/orderFood/view/body.vue";
</script>

<template>
  <div class="top">
    <div>三品王</div>
    <div id="favourite"></div>
    <div id="position">

    </div>
  </div>

  <Body></Body>
</template>

<style scoped>
.top{
  width: 100%;
  height: 250px;
  border: 1px solid grey;
}
Aside{
 padding: -10px 0 0 0;
}
</style>