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
  
  await start();

  //localStream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: "user"}, audio: true });
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
  /*
  pc.onnegotiationneeded = async options => {
  await pc.setLocalDescription(await pc.createOffer(options));
  signaler.send({ description: pc.localDescription });
};
pc.oniceconnectionstatechange = () => {
  if (pc.iceConnectionState === "failed") {
    pc.restartIce();
  }
};
  */
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
/*  
  let ignoreOffer = false;

signaler.onmessage = async ({ data: { description, candidate } }) => {
  try {
    if (description) {
      const offerCollision = (description.type == "offer") &&
                             (makingOffer || pc.signalingState != "stable");

      ignoreOffer = !polite && offerCollision;
      if (ignoreOffer) {
        return;
      }

      await pc.setRemoteDescription(description);
      if (description.type == "offer") {
        await pc.setLocalDescription();
        signaler.send({ description: pc.localDescription })
      }
    } else if (candidate) {
      try {
        await pc.addIceCandidate(candidate);
      } catch(err) {
        if (!ignoreOffer) {
          throw err;
        }
      }
    }
  } catch(err) {
    console.error(err);
  }
}
      */  
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

switchCameraButton.onclick = async () => {
  const vid = localStream.getTracks();
  vid[1].applyConstraints({facingMode: "environment"});
  }

const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

function changeAudioDestination() {
  const audioDestination = audioOutputSelect.value;
  attachSinkId(videoElement, audioDestination);
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

async function start() {
 /* if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }*/
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  localStream = navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

audioInputSelect.onchange = start;
audioOutputSelect.onchange = changeAudioDestination;

videoSelect.onchange = start;

//start();

