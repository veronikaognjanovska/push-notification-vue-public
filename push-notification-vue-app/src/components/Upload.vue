<template>
  <div class="container" style="max-width: 700px;margin: auto">

    <div class="row" >
      <div class="col-sm-9 mb-2">
        <input type="file" class="custom-file-input" id="inputGroupFile01"
               accept="*/*" @change="preview">
        <label class="custom-file-label m-l-15" for="inputGroupFile01">Choose file</label>
      </div>
      <div class="col-sm-3" >
        <button :disabled="!(fileData!=null && urlFileName==null)"
                @click="onUpload" class="btn btn-success" > Upload </button>
        <button @click="onList" class="btn btn-info" >List</button>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12 mt-2" >
        <div class="progress"
             v-bind:class="{ invisible: (uploadValue===0), visible: (uploadValue>0) }">
          <div class="progress-bar bg-success progress-bar-striped"
               role="progressbar"
               :style="{'width': `${uploadValue}%`}"
               :aria-valuenow="uploadValue"
               aria-valuemin="0"
               aria-valuemax="100">
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12 mt-2 d-flex justify-content-start" v-if="fileData">
        <p><b>To be uploaded: </b>{{fileData.name}}</p>
      </div>
      <div class="col-sm-12 mt-2 d-flex justify-content-start" v-if="urlFileName">
        <p><b>Uploaded: </b> {{urlFileName}}</p>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-sm-12">
        <table class="table table-striped" v-if="allFilesNames.length>0">
          <thead>
          <th>Filename</th>
          <th></th>
          <th></th>
          </thead>
          <tbody>
          <tr v-for="fileName in allFilesNames" :key="fileName">
            <td >{{ fileName }}</td>
            <td>
              <button @click="onDeleteFile(fileName)"
                      class="btn btn-danger"
              >Delete</button>
            </td>
            <td>
              <button @click="onDownloadFile(fileName)"
                      class="btn btn-warning"
              >Download</button>
            </td>
          </tr>
          </tbody>
        </table>
        <div>
          <p id="noFilesPar"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import firebase from 'firebase';
import axios from "axios";

export default {
  name: 'Upload',

  data(){
    return {
      token:null,
      fileData:null,
      urlFileName:null,
      uploadValue:0,
      allFilesNames:[]
    }
  },

  created() {
    this.subscribe();
  },

  methods:{
    preview(event){
      this.uploadValue=0;
      this.urlFileName=null;
      this.fileData=event.target.files[0];
    },

    subscribe(){
      // Getting Notification Permission And Subscribing To A Topic
      try{
        let self=this;
        firebase.messaging().requestPermission().then(()=>{
          console.log("Notification permission granted.");
          return firebase.messaging().getToken()
              // Accessing Token Successfully
              .then((token)=>{
                self.token=token;
                // Subscribing To A Topic
                axios.post("https://iid.googleapis.com/iid/v1/"+token+"/rel/topics/all",
                    null,
                    {
                      headers:{
                        'Authorization': "key=<SERVER_KEY>"
                      }
                    }).then(response => {
                  if (response.status < 200 || response.status >= 400) {
                    throw 'Error subscribing to topic: '+response.status + ' - ' + response.text();
                  }
                  console.log('Subscribed to topic: all');
                }).catch(error => {
                  // An error occurred
                  console.error(error);
                });

              }).catch((err)=>{
                // An error occurred
                console.log("Unable to get token.",err);
              });
        });
      }catch (e){
        // An error occurred
        console.log(e);
      }
    },

    sendAxiosPostToNotify(title="error",file=null,status="error"){
      const data = {
        "to": "/topics/all",
        "data" : {
          "title": title,
          "message": "File name: "+file,
          "icon": "icon.png",
          "type":status
        }
      };
      // Sending Request To Notify Subscribers Of Specific Topic
      axios.post("https://fcm.googleapis.com/fcm/send",data,{
        headers:{
          'Content-Type': "application/json",
          'Authorization': "key=<SERVER_KEY>"
        }
      });
    },

    onUpload(){
      this.urlFileName=null;
      const storageRef = firebase.storage()
          .ref(`${this.fileData.name}`)
          .put(this.fileData);
      storageRef.on(`state_changed`,
        snapshot => {
          this.uploadValue=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
        },
        () => {
          // An error occurred
          this.sendAxiosPostToNotify("File Upload Cancelled!",this.urlFileName,"error");
        },
        () => {
          // File uploaded successfully
          this.uploadValue=100;
          storageRef.snapshot.ref.getDownloadURL().then(url => {
            this.urlFileName=url.split('?')[0].split('/').slice(-1)[0];
            this.fileData=null;
            this.sendAxiosPostToNotify("File Upload Successful!",this.urlFileName,"success");
            this.onList();
          });
        }
      );
      document.getElementById("inputGroupFile01").value = "";
    },

    onDeleteFile(fileName){
      firebase.storage().ref(fileName).delete()
          .then(()=>{
            // File deleted successfully
            this.sendAxiosPostToNotify("File Deleted Successfully!",fileName,"warn");
            this.onList();
            this.clear();
          }).catch(() => {
            // An error occurred!
            this.sendAxiosPostToNotify("Can Not Delete File!",fileName,"error");
            this.onList();
      });
    },

    onList(){
      this.allFilesNames=[];
      let p=firebase.storage().ref(``).listAll();
      p.then((res) => {
        // Files fetched successfully
        res.items.forEach((itemRef) => {
          this.allFilesNames.push(itemRef.name);
        });
        if(this.allFilesNames.length===0){
          document.getElementById("noFilesPar").innerHTML="No Files To Show";
        }else{
          document.getElementById("noFilesPar").innerHTML="";
        }
      }).catch((error) => {
        // An error occurred!
        console.log(error.message);
      });
    },

    clear(){
      this.uploadValue=0;
      this.fileData=null;
      this.urlFileName=null;
    },

    onDownloadFile(fileName){
      firebase.storage().ref(fileName).getDownloadURL()
        .then((url)=>{
          // File downloaded successfully
          // This can be downloaded directly:
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = () => {
            let blob = xhr.response;
            this.downloadBlob(blob, 'myfile');
            this.sendAxiosPostToNotify("File Downloaded Successfully!",fileName,"success");
          };
          xhr.open('GET', url);
          xhr.send();
        }).catch((error) => {
          // An error occurred!
          console.log(error.message);
          this.sendAxiosPostToNotify("Can Not Download File!",fileName,"error");
      });

    },
    downloadBlob(blob, name = 'file.txt') {
      // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
      const blobUrl = URL.createObjectURL(blob);
      // Create a link element
      const link = document.createElement("a");
      // Set link's href to point to the Blob URL
      link.href = blobUrl;
      link.download = name;
      // Append link to the body
      document.body.appendChild(link);
      // Dispatch click event on the link
      // This is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
      );
      // Remove link from body
      document.body.removeChild(link);
    }


  } // end methods

}
</script>

<style scoped>
  button{
    margin: 0 4px;
  }
  .m-l-15{
    margin-left: 15px;
  }

</style>
