let localStream;
let remoteStream; // = [];
//let k = remoteStream.length;
let roomId = '';
let callerId = '';
let roomIdData = [];
let peerConnection; // = [];
//let j = peerConnection.length;
let participantId;

const configuration = {
  'iceServers': [
      {'urls': 'stun:eu-turn2.xirsys.com'},
    {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'turn:numb.viagenie.ca','credential': 'Arobibi1','username': 'theotek1@gmail.com'},

      {'username': '9X3xYrrw-3gXt-09h7VgGXFRM3QG1ge4LbGpXRnTEOjkewaI51I42aT_R1YhPn87AAAAAGCMntN0aGVvdGVrMQ==', 'credential': '0c634bfe-aa13-11eb-8a2b-0242ac140004', 'urls': ['turn:eu-turn2.xirsys.com:80?transport=udp', 'turn:eu-turn2.xirsys.com:3478?transport=udp', 'turn:eu-turn2.xirsys.com:80?transport=tcp', 'turn:eu-turn2.xirsys.com:3478?transport=tcp', 'turns:eu-turn2.xirsys.com:443?transport=tcp', 'turns:eu-turn2.xirsys.com:5349?transport=tcp']},
    ],
  iceCandidatePoolSize: 10,
};
    
  /*  
    'iceServers': [
          {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'turn:numb.viagenie.ca','credential': 'Arobibi1','username': 'theotek1@gmail.com'},
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun1.l.google.com:19302'},
        {'urls': 'turn:numb.viagenie.ca','credential': 'Arobibi1','username': 'theotek1@gmail.com'},
       /* {'urls': 'stun:stun1.l.google.com:19302'},
        {'urls': 'stun:stun2.l.google.com:19302'},
        {'urls': 'stun:stun3.l.google.com:19302'},
        {'urls': 'stun:stun4.l.google.com:19302'},
        {'urls': 'stun:stun01.sipphone.com'},
        {'urls': 'stun:stun.ekiga.net'},
        {'urls': 'stun:stun.fwdnet.net'},
        {'urls': 'stun:stun.ideasip.com'},
        {'urls': 'stun:stun.iptel.org'},
        {'urls': 'stun:stun.rixtelecom.se'},
        {'urls': 'stun:stun.schlund.de'}*/
/*    ]
  }

/*
{url:'stun:stun01.sipphone.com'},
{url:'stun:stun.ekiga.net'},
{url:'stun:stun.fwdnet.net'},
{url:'stun:stun.ideasip.com'},
{url:'stun:stun.iptel.org'},
{url:'stun:stun.rixtelecom.se'},
{url:'stun:stun.schlund.de'},
{url:'stun:stun.l.google.com:19302'},
{url:'stun:stun1.l.google.com:19302'},
{url:'stun:stun2.l.google.com:19302'},
{url:'stun:stun3.l.google.com:19302'},
{url:'stun:stun4.l.google.com:19302'},
{url:'stun:stunserver.org'},
{url:'stun:stun.softjoys.com'},
{url:'stun:stun.voiparound.com'},
{url:'stun:stun.voipbuster.com'},
{url:'stun:stun.voipstunt.com'},
{url:'stun:stun.voxgratia.org'},
{url:'stun:stun.xten.com'},
{
    url: 'turn:numb.viagenie.ca',
    credential: 'Arobibi1',
    username: 'theotek1@gmail.com'
},
{
    url: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
},
{
    url: 'turn:192.158.29.39:3478?transport=tcp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}
    ]
  }
  */

//Reference to the Buttons
let openButton = document.getElementById("open");
let createButton = document.getElementById("create");
let joinButton = document.getElementById("join");
let hangupButton = document.getElementById("hangup");
/*
createButton.disabled = true;
joinButton.disabled = true;
hangupButton.disabled = true;*/

// Reference to the Video Tags

let localVideo = document.createElement('video'); //getElementById("localVideo");
let remoteVideo = []; //document.createElement('video'); //getElementById("remoteVideo");
let i = remoteVideo.length;

//remoteVideo[i] = document.createElement('video');

//remoteVideo.push(remoteVideo[i]);

let videos = document.getElementById("videos");
//var video1 = document.createElement('video');
localVideo.autoplay = true;
localVideo.muted = true;
localVideo.setAttribute("playsinline",null);/*
//var video2 = document.createElement('video');
remoteVideo[i].autoplay = true;
remoteVideo[i].muted = true;
remoteVideo[i].setAttribute("playsinline",null);*/

var newStream = null;
var cam = 0;


switchCameraButton.onclick = async () => {
   // example to change video camera, suppose selected value saved into window.selectedCamera
 /* var audioMute = 0;
  
  if(localStream.getAudioTracks()[0].enabled == 'false'){
    localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
    audioMute = 1;
  };
  */
if(cam == 0){
 if(newStream){
   const tracks = newStream.getTracks();
tracks.forEach(track => track.stop());
 }
   newStream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: 'environment'}, audio: true }); // Or 'environment'user
   var newVideo = newStream.getVideoTracks()[0];
  var newAudio = newStream.getAudioTracks()[0];
   //var videoTrack = localStream.getVideoTracks()[0];
   var sender = peerConnection.getSenders()[1]; /*.find(function(s) {
        return s.track.kind == newVideo.kind;
      });*/
      console.log('found sender:', sender);
      sender.replaceTrack(newVideo);
  var senderA = peerConnection.getSenders()[0]; /*.find(function(s) {
        return s.track.kind == newAudio.kind;
      });*/
      console.log('found sender:', senderA);
      senderA.replaceTrack(newAudio);
   localVideo.srcObject = null;
  localStream = null;
  localStream = newStream;
  localVideo.srcObject = localStream;
 localVideo.muted = true;
  localVideo.play();
  cam = 1
}else{
  if(newStream){
   const tracks = newStream.getTracks();
tracks.forEach(track => track.stop());
 }
newStream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: 'user'}, audio: true }); // Or 'environment'user
  var newVideo = newStream.getVideoTracks()[0];
  var newAudio = newStream.getAudioTracks()[0];
   //var videoTrack = localStream.getVideoTracks()[0];
   var sender = peerConnection.getSenders()[1]; /*.find(function(s) {
        return s.track.kind == newVideo.kind;
      });*/
      console.log('found sender:', sender);
      sender.replaceTrack(newVideo);
  var senderA = peerConnection.getSenders()[0]; /*.find(function(s) {
        return s.track.kind == newAudio.kind;
      });*/
      console.log('found sender:', senderA);
      senderA.replaceTrack(newAudio);
   localVideo.srcObject = null;
  localStream = null;
  localStream = newStream;
  localVideo.srcObject = localStream;
 localVideo.muted = true;
  localVideo.play();
  cam = 0
}
  /*
  if(audioMute == 1){
    localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
    audioMute = 0;
  };
  */
 }
 
/*
const supports = navigator.mediaDevices.getSupportedConstraints();
  if (!supports['facingMode']) {
    alert('Browser Not supported!');
    //return;
  }

  let stream;

  const capture = async facingMode => {
    const options = {
      audio: false,
      video: {
        facingMode,
      },
    };

    try {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      stream = await navigator.mediaDevices.getUserMedia(options);
      var newVideo = stream.getVideoTracks()[0];
      var sender = peerConnection.getSenders().find(function(s) {
        return s.track.kind == newVideo.kind;
      });
      console.log('found sender:', sender);
      sender.replaceTrack(newVideo);
      localStream.getTracks()[1].stop();
      localStream.getTracks()[1] = null;
      localStream.getTracks()[1] = newVideo;
    } catch (e) {
      alert(e);
      return;
    }
    localVideo.srcObject = null;
    localVideo.srcObject = localStream;
    localVideo.play();
  }

switchCameraButton.onclick = async () => {
if(cam == 0){
  
    capture('environment');
  cam = 1
}else{

    capture('user');
  cam = 0
}
}
/*
  // example to change video camera, suppose selected value saved into window.selectedCamera
switchCameraButton.onclick = async () => {
if(cam == 0){
 // localStream = null;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: {
      facingMode: 'environment'
    }
  })
  .then(function(stream) {
  localVideo.srcObject = null;
  localStream = null;
  localStream = stream;
localVideo.srcObject = localStream;
 localVideo.muted = true;
  localVideo.play();
    let videoTrack = stream.getVideoTracks()[0];
 //   PCs.forEach(function(pc) {
      var sender = peerConnection.getSenders().find(function(s) {
        return s.track.kind == videoTrack.kind;
      });
      console.log('found sender:', sender);
      sender.replaceTrack(videoTrack);
   // });
  })
  .catch(function(err) {
    console.error('Error happens:', err);
  });
  cam = 1
}else{
//localStream = null;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: {
      facingMode: 'user'
    }
  })
  .then(function(stream) {
 localVideo.srcObject = null;
  localStream = null;
  localStream = stream;
 localVideo.srcObject = localStream;
 localVideo.muted = true;
  localVideo.play();
    let videoTrack = stream.getVideoTracks()[0];
 //   PCs.forEach(function(pc) {
      var sender = peerConnection.getSenders().find(function(s) {
        return s.track.kind == videoTrack.kind;
      });
      console.log('found sender:', sender);
      sender.replaceTrack(videoTrack);
      
   // });
  })
  .catch(function(err) {
    console.error('Error happens:', err);
  });
cam = 0
}
}
 */
 //create button to toggle video
var video_button = document.getElementById("cameraButton");
//video_button.appendChild(document.createTextNode("Toggle hold"));
video_button.onclick = function(){
  if(video_button.innerText == "Camera Off"){
    video_button.innerText = "Camera On"
  }else{
  video_button.innerText = "Camera Off"
  };
  localStream.getVideoTracks()[0].enabled = !(localStream.getVideoTracks()[0].enabled);
  /*localVideo.srcObject = null;
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  localVideo.play();*/
}

 var audio_button = document.getElementById("muteButton");
 //video_button.appendChild(document.createTextNode("Toggle hold"));

 
 audio_button.onclick = function(){
   if(audio_button.innerText == "Mute"){
     audio_button.innerText = "Unmute"
   }else{
   audio_button.innerText = "Mute"
   };
   localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
  
   /*webcamVideo.srcObject = null;
  webcamVideo.srcObject = localStream;
   webcamVideo.muted = true;
  webcamVideo.play();*/
 }
   /*
   audio_button.onclick = function(evt) {
   const newState = !localStream.getAudioTracks()[0].enabled;
   audio_button.innerHTML = newState ? "&#x25B6;&#xFE0F;" : "&#x23F8;&#xFE0F;";
   localStream.getAudioTracks()[0].enabled = newState;
 }
  */
