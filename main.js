/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
const servers = {
  'iceServers': [
      {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'turn:numb.viagenie.ca','credential': 'Arobibi1','username': 'theotek1@gmail.com'},
    ],
  iceCandidatePoolSize: 10,
};
// Global State
//let signaler = new SignalingChannel();
let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;
let newStream;
// Here |pc| represent peer connection
// with remote audio and video streams attached.
//let pc = new RTCPeerConnection();
// ... setup connection with remote audio and video.
//const [audioReceiver, videoReceiver] = pc.getReceivers();
// Add additional 500 milliseconds of buffering.
//audioReceiver.playoutDelayHint = 0.5;
//videoReceiver.playoutDelayHint = 0.5;
 // HTML elements
 const webcamButton = document.getElementById('webcamButton');
 const switchCameraButton = document.getElementById('switchCameraButton');
 const webcamVideo = document.getElementById('webcamVideo');
 const callButton = document.getElementById('callButton');
 const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');
let callerId = "Teo";
let callId = "Teo";
//callerId = prompt('Please enter your ID','');
hangupButton.onclick = hangup;
let startTime;
remoteVideo.addEventListener('loadedmetadata', function() {
  console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});
remoteVideo.onresize = () => {
  console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
  console.warn('RESIZE', remoteVideo.videoWidth, remoteVideo.videoHeight);
  // We'll use the first onsize callback as an indication that video has started
  // playing out.
  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    console.log(`Setup time: ${elapsedTime.toFixed(3)}ms`);
    startTime = null;
  }
};
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
// 1. Setup media sources
webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //localStream.muted = true;
  remoteStream = new MediaStream();
  //pc = new RTCPeerConnection(servers);
  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });
  
  const [audioReceiver, videoReceiver] = pc.getReceivers();
  audioReceiver.playoutDelayHint = 0.5;
  videoReceiver.playoutDelayHint = 0.5;
  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
  
  
  webcamVideo.srcObject = localStream;
  webcamVideo.muted = true;
  remoteVideo.srcObject = remoteStream;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = false;
};
// 2. Create an offer
callButton.onclick = async () => {
  // Reference Firestore collections for signaling
  if(callerId == 0){
    callerId = prompt('Please enter caller ID','');
  };
  const callDoc = firestore.collection('calls').doc(callerId);
  const offerCandidates = callDoc.collection('offerCandidates');
  const answerCandidates = callDoc.collection('answerCandidates');
  callInput.value = callDoc.id;
  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
   };
   // Create offer
   const offerDescription = await pc.createOffer();
   
   await pc.setLocalDescription(offerDescription);
   const offer = {
     sdp: offerDescription.sdp,
    type: offerDescription.type,
  };
  await callDoc.set({ offer });
  // Listen for remote answer
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });
       
  //callId = callerId;
  // When answered, add candidate to peer connection
  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
  hangupButton.disabled = false;
};
// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  //const callId = callInput.value;
  if(callId == 0){
        callId = prompt('Please enter call ID','');
        };
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');
  //pc.onicecandidate = ({candidate}) => signaler.send({candidate});
        
  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };
  const callData = (await callDoc.get()).data();
  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
   const answerDescription = await pc.createAnswer();
   await pc.setLocalDescription(answerDescription);
   const description = callData.offer;


   const answer = {
     type: answerDescription.type,
     sdp: answerDescription.sdp,
  };
  await callDoc.update({ answer });
    
    //callerId = callId;
  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type === 'added') {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};
  
function hangup() {
   };
  
var cam = 0;
let newVideo = null;
let videoTrack = null;
let sender = null;
  
 
   // example to change video camera, suppose selected value saved into window.selectedCamera

 switchCameraButton.onclick = async () => {
   if(cam == 0){
 navigator.mediaDevices
   .getUserMedia({
     video: {
      facingMode: 'environment'
    }
  })
  .then(function(stream) {
  webcamVideo.srcObject = null;
  webcamVideo.srcObject = stream;
  webcamVideo.play();
    let videoTrack = stream.getVideoTracks()[0];
 //   PCs.forEach(function(pc) {
      var sender = pc.getSenders().find(function(s) {
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
   navigator.mediaDevices
   .getUserMedia({
     video: {
       facingMode: 'user'
     }
   })
   .then(function(stream) {
   webcamVideo.srcObject = null;
   webcamVideo.srcObject = stream;
   webcamVideo.play();
     let videoTrack = stream.getVideoTracks()[0];
  //   PCs.forEach(function(pc) {
       var sender = pc.getSenders().find(function(s) {
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
}
var audio_button = document.getElementById("muteButton");
//video_button.appendChild(document.createTextNode("Toggle hold"));
/*
audio_button.onclick = function(){
  if(audio_button.innerText == "Mute"){
    audio_button.innerText = "Unmute"
  }else{
  audio_button.innerText = "Mute"
  };
  localStream.getAudioTracks()[0].enabled = !(localStream.getAudioTracks()[0].enabled);
}
  */
  audio_button.onclick = function(evt) {
  const newState = !localStream.getAudioTracks()[0].enabled;
  audio_button.innerHTML = newState ? "&#x25B6;&#xFE0F;" : "&#x23F8;&#xFE0F;";
  localStream.getAudioTracks()[0].enabled = newState;
}