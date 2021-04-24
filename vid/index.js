let localStream;
let remoteStream; // = [];
//let k = remoteStream.length;
let roomId = '';
let callerId = '';
let roomIdData = [];
let peerConnection; // = [];
//let j = peerConnection.length;
let participantId;

let configuration = {
    'iceServers': [
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
    ]
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
