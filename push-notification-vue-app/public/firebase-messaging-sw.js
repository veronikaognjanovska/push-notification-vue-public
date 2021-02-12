importScripts("https://www.gstatic.com/firebasejs/8.2.4/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.4/firebase-messaging.js");


try{
  // Initialize the Firebase app in the service worker by passing in the
  // messagingSenderId.
  firebase.initializeApp( {
    apiKey: "<API_KEY>",
    projectId: "<PROJECT_ID>",
    appId: "<APP_ID>",
    messagingSenderId: "<SENDER_ID>"
  });
  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = firebase.messaging();
  messaging.setBackgroundMessageHandler(function (payload){
    // Customize notification here
    const title = payload.data.title;
    const options = {
      body:payload.data.message,
      icon:payload.data.icon
    };
    // Show notification
    return self.registration.showNotification(title,options);
  });

}catch (err){
  console.log(err);
}
