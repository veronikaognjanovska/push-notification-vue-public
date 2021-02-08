<template>
  <div class="notifications-list">
    <div  v-if="notifications.length>0">
      <li v-for="notification in notifications" :key="notification.id">
        <notification-box
            :id="notification.id"
            :title="notification.title"
            :message="notification.message"
            :icon="notification.icon"
            :type="notification.type"
            @delete="toDelete(notification.id)"
        />
      </li>
    </div>
  </div>
</template>

<script>
import NotificationBox from "./NotificationBox";
import firebase from "firebase";
import uniqueId from 'lodash.uniqueid';

export default {
  data(){
    return {
      notifications:[]
    }
  },

  created() {
    this.receiveMessage();
  },

  components: {
    NotificationBox
  },

  methods: {
    toDelete(idi){
       const index = this.notifications.findIndex(i=>i.id===idi);
      this.notifications.splice(index,1);
    },

    receiveMessage() {
      // Listen For Notifications
      try{
        let self = this;
        const messaging = firebase.messaging();
        messaging.onMessage(function(payload) {
          // With Custom Notification
          let item = {
            id:uniqueId('item-'),
            title:payload.data.title,
            message:payload.data.message,
            icon:payload.data.icon,
            type:payload.data.type
          };
          self.notifications.push(item);

          // Using Vue-notifications
          self.$notify({
            group: 'notify',
            title:payload.data.title,
            text:payload.data.message,
            type:payload.data.type
          });

        });
      }catch (e) {
        console.log(e);
      }
    }
  } // end methods

};
</script>

<style>
.notifications-list {
  position: fixed;
  bottom: 0;
  right: 0;
  margin-right: 15px;
  width: 320px;
}
li {
  list-style-type: none;
}
</style>