/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';


const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc; // = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');
let callerId = 0;
let callId = 0;

hangupButton.onclick = hangup;

let startTime;
const localVideo = document.getElementById('localVideo');

localVideo.addEventListener('loadedmetadata', function() {
  console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

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
  offerToReceiveVideo: 0
};
// 1. Setup media sources


webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
  //localStream.muted = true;
  remoteStream = new MediaStream();
  pc = new RTCPeerConnection(servers);

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamVideo.srcObject = localStream;
  webcamVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  remoteVideo.srcObject = remoteStream;

  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
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
       
  callId = callerId;

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

  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await callDoc.update({ answer });
    
    callerId = callId;

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

/*

const startButton = document.getElementById('startButton');
//const callButton = document.getElementById('callButton');
const upgradeButton = document.getElementById('upgradeButton');
//const hangupButton = document.getElementById('hangupButton');
//callButton.disabled = true;
//hangupButton.disabled = true;
//upgradeButton.disabled = true;
startButton.onclick = start;
//callButton.onclick = call;
upgradeButton.onclick = upgrade;
hangupButton.onclick = hangup;

let startTime;
const localVideo = document.getElementById('localVideo');
//const remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
  console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

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
*/
//let localStream;
let pc1;
let pc2;/*
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 0
};
*/
function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}
/*
function gotStream(stream) {
  console.log('Received local stream');
  localVideo.srcObject = stream;
  localStream = stream;
  callButton.disabled = false;
}

function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false
      })
      .then(gotStream)
      .catch(e => alert(`getUserMedia() error: ${e.name}`));
}
*/
function call() {
  callButton.disabled = true;
  upgradeButton.disabled = false;
  hangupButton.disabled = false;
  console.log('Starting call');
  startTime = window.performance.now();
  const audioTracks = localStream.getAudioTracks();
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`);
  }
  //const servers = null;
  pc1 = new RTCPeerConnection(servers);
  console.log('Created local peer connection object pc1');
  pc1.onicecandidate = e => onIceCandidate(pc1, e);
  pc2 = new RTCPeerConnection(servers);
  console.log('Created remote peer connection object pc2');
  pc2.onicecandidate = e => onIceCandidate(pc2, e);
  pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
  pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
  pc2.ontrack = gotRemoteStream;

  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
  console.log('Added local stream to pc1');

  console.log('pc1 createOffer start');
  pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

function onCreateOfferSuccess(desc) {
  console.log(`Offer from pc1\n${desc.sdp}`);
  console.log('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc).then(() => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
  console.log('pc2 setRemoteDescription start');
  pc2.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc2 createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
  console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
  console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
  console.log('gotRemoteStream', e.track, e.streams[0]);

  // reset srcObject to work around minor bugs in Chrome and Edge.
  remoteVideo.srcObject = null;
  remoteVideo.srcObject = e.streams[0];
}

function onCreateAnswerSuccess(desc) {
  console.log(`Answer from pc2:
${desc.sdp}`);
  console.log('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc).then(() => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc1), onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
  getOtherPc(pc)
      .addIceCandidate(event.candidate)
      .then(() => onAddIceCandidateSuccess(pc), err => onAddIceCandidateError(pc, err));
  console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
  console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
  console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
  }
}

function upgrade() {
  upgradeButton.disabled = true;
  navigator.mediaDevices
      .getUserMedia({video: true})
      .then(stream => {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          console.log(`Using video device: ${videoTracks[0].label}`);
        }
        localStream.addTrack(videoTracks[0]);
        localVideo.srcObject = null;
        localVideo.srcObject = localStream;
        pc1.addTrack(videoTracks[0], localStream);
        return pc1.createOffer();
      })
      .then(offer => pc1.setLocalDescription(offer))
      .then(() => pc2.setRemoteDescription(pc1.localDescription))
      .then(() => pc2.createAnswer())
      .then(answer => pc2.setLocalDescription(answer))
      .then(() => pc1.setRemoteDescription(pc2.localDescription));
}

function hangup() {
  console.log('Ending call');
  pc.close();
  //pc2.close();
  //pc = null;
  //pc2 = null;
  callInput.value = '';
        
  const videoTracks = localStream.getVideoTracks();
  videoTracks.forEach(videoTrack => {
    videoTrack.stop();
    localStream.removeTrack(videoTrack);
  });
  localVideo.srcObject = null;
  localVideo.srcObject = localStream;

  hangupButton.disabled = true;
  callButton.disabled = false;
}

