<template>
  <div class="white-text">
    <div id="notification-box" class="notification-box container"
         v-bind:class="{ 'bg-danger': (type==='error'),
              'bg-success': (type==='success'),
              'bg-warning':(type==='warn')}">
      <div class="row float-right" >
        <a href="#" id="notification-close" @click="closed()" title="close">x</a>
      </div>
      <div class="row pl-2">
        <div class="col-xs-4">
          <img v-bind:src="icon" class="rounded">
        </div>
        <div class="col-xs-8 my-space">
           <span id="title">{{title}}</span>
          <br>
          <span id="message" >{{message}}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  name: "NotificationBox",

  props:{
      id:{required:true},
      title: {required:true},
      message:{required:true},
      icon: {required:true},
      type:{required:true}
  },

  created() {
    setTimeout(() => {
      this.closed();
     }, 3000);
  },

  methods: {
    closed() {
      this.$emit('delete');
    }
  }

};


</script>

<style>
.notification-box{
  background-color: #0000ff66;
  border-radius: 5px;
  width: auto;
  height: auto;
  padding: 10px;
  margin: 5px;
}
#notification-close {
  color:black;
  margin-right: 5px;
  margin-top: -10px;
}
img{
  width: 75px;
  height: 75px;
}
#title{
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}
#message{
  font-size: 14px;
}
.my-space{
  padding-left: 10px !important;
  margin-top: 10px;
}
.white-text{
  color:white;
}
</style>