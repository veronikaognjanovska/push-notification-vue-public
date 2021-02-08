import Vue from 'vue'
import App from './App.vue'

import firebase from 'firebase';
import 'firebase/messaging';

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import Notifications from 'vue-notification';


Vue.config.productionTip = false


// // Initialize Firebase
firebase.initializeApp({
    apiKey: "<API_KEY>",
    authDomain: "<PROJECT_ID>.firebaseapp.com",
    projectId: "<PROJECT_ID>",
    storageBucket: "<PROJECT_ID>.appspot.com",
    messagingSenderId: "<SENDER_ID>",
    appId: "<APP_ID>",
});


navigator.serviceWorker.register('firebase-messaging-sw.js',
    {scope: "firebase-cloud-messaging-push-scope"})
    .then((registration) => {
      const messaging = firebase.messaging();
      messaging.useServiceWorker(registration);

    }).catch(err => {
  console.log(err)
})
// firebase configs end


// using Vue.js notifications
Vue.use(Notifications);


new Vue({
  render: h => h(App),
}).$mount('#app');


