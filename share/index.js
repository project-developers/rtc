let localStream;
let remoteStream;
let roomId;
let roomIdData = [];
let peerConnection;


const configuration = {
  'iceServers': [
      {'urls': 'stun:eu-turn2.xirsys.com'},
      {'username': '9X3xYrrw-3gXt-09h7VgGXFRM3QG1ge4LbGpXRnTEOjkewaI51I42aT_R1YhPn87AAAAAGCMntN0aGVvdGVrMQ==', 'credential': '0c634bfe-aa13-11eb-8a2b-0242ac140004', 'urls': ['turn:eu-turn2.xirsys.com:80?transport=udp', 'turn:eu-turn2.xirsys.com:3478?transport=udp', 'turn:eu-turn2.xirsys.com:80?transport=tcp', 'turn:eu-turn2.xirsys.com:3478?transport=tcp', 'turns:eu-turn2.xirsys.com:443?transport=tcp', 'turns:eu-turn2.xirsys.com:5349?transport=tcp']},
    ],
  iceCandidatePoolSize: 10,
};
/*
let configuration = {
    'iceServers': [
      {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'turn:numb.viagenie.ca','credential': 'Arobibi1','username': 'theotek1@gmail.com'},

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
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
