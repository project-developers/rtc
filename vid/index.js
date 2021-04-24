let localStream;
let remoteStream;
let roomId = '';
let callerId = '';
let roomIdData = [];
let peerConnection;

let configuration = {
    'iceServers': [
      {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'turn:numb.viagenie.ca','credential': 'Arobibi1','username': 'theotek1@gmail.com'},

    ]
  }

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

let localVideo = createElement('video'); //getElementById("localVideo");
let remoteVideo = createElement('video'); //getElementById("remoteVideo");
//remoteVideo = createElement('video');
let videos = document.getElementById("videos");
//var video1 = document.createElement('video');
localVideo.autoplay = true;
localVideo.muted = true;
localVideo.setAttribute("playsinline",null);
//var video2 = document.createElement('video');
remoteVideo.autoplay = true;
remoteVideo.muted = true;
remoteVideo.setAttribute("playsinline",null);
