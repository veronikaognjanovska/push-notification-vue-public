<template>
  <div id="app">

    <!--    Upload Component-->
    <upload></upload>
    <!-- Vue-notifications Component-->
    <notifications group="notify" style="margin-top: 70px" />
    <!--    NotificationsList component - For Custom Notifications-->
    <notifications-list/>

  </div>

</template>

<script>
import Upload from './components/Upload.vue';
import NotificationsList from './components/NotificationsList.vue';

export default {
  name: 'App',
  components: {
    Upload,
    NotificationsList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

