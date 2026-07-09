<template>
  <div class="header">
    <div id="top">
      <div id="topBackground">

      </div>
    </div>
    <div id="log">
      <a href="" id="login-dir">
        <div id="log-block">
          <img src="/src/static/diamond.png" id="diamond" >
          <div id="logging">注册会员|登入后尊享更多专属权限</div>
        </div>
      </a>
    </div>
  </div>

  <div class="body">
    <div id="main">
    <div id="in-canteen" class="tubiao">
      <div class="block">
        <a href="" class="tiao">
          <div class="littleBlock">
            <img src="/src/static/niuasan.jpg" class="pict">
            <div class="largeTitle">堂食/自提</div>
            <div class="littleTitle">手机点餐免排队</div>
          </div>
        </a>
      </div>
    </div>
      <div id="member-center" class="tubiao">
        <div class="block">
          <a href="" class="tiao">
            <div class="littleBlock">
              <img src="/src/static/niuamei.jpg" class="pict">
              <div class="largeTitle">会员中心</div>
              <div class="littleTitle">储值优惠</div>
            </div>
          </a>
      </div>
    </div>
  </div>

    <div></div>
  </div>

</template>

<script setup lang="ts">
</script>

<style>
#topBackground{
  background-color: pink;
  height: 250px;
  width: 100%;
}
#log{
  border: 1px solid grey;
  width: 94%;
  height: 50px;
  margin: -10px 3% 0 3%;
  border-radius: 10px 7px;
  background-color: white;

}
#log-block{
  margin: 10px 0 0 10px;
}
#diamond{
  height: 15px;
  width: 15px;
  float: left;
  margin-top: 3px;
}
#logging{
  float: left;
  position: relative;
  margin-left: 5px;
}
.body{
  width: 94%;
  height: 600px;
  margin: 10px 0 0 3%;
}
#main{
  height: 150px;
  width: auto;
  border: 1px solid grey;
  border-radius: 10px 7px;
}
.tubiao{
  width: 50%;
  height: 100%;
  float: left;
}
.block{
  margin-top: -15.3px;
  width: 100%;
  height: 100%;
}
.tiao{
  width: 100%;
  height: 100%;
}
.littleBlock{
  margin: 15px 0 0 25%;
  width: 90px;
  text-align: center;
}
.pict{
  width: 90px;
  height: 90px;
  margin-top: 10px;
}
.largeTitle{
  font-size: 20px;
  font-weight: bold;
}
.littleTitle{
  font-size: 10px;
  font-weight: lighter;
}
</style>
