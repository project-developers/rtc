/* eslint no-unused-expressions: 0 */
/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
let peerConnection;
//let remoteConnection;
let dataChannel;
let dataChannel2;
//let receiveChannel;
let fileReader;
const bitrateDiv = document.querySelector('div#bitrate');
const averageBitrateDiv = document.querySelector('div#averageBitrate');
const fileInput = document.querySelector('input#fileInput');
const abortButton = document.querySelector('button#abortButton');
//const downloadAnchor = document.querySelector('a#download');
let downloadAnchor;
const sendProgress = document.querySelector('progress#sendProgress');
const receiveProgress = document.querySelector('progress#receiveProgress');
const statusMessage = document.querySelector('span#status');
const sendFileButton = document.querySelector('button#sendFile');
const retryButton = document.querySelector('button#retry');
const errorMessage = document.querySelector('div#errorMsg');
let receiveBuffer = [];
let receivedSize = 0;
let bytesPrev = 0;
let timestampPrev = 0;
let timestampStart;
let statsInterval = null;
let bitrateMax = 0;
let sending = 0;
let pacer = 0;

sendFileButton.addEventListener('click', () => createConnection());
fileInput.addEventListener('change', handleFileInputChange, false);
abortButton.addEventListener('click', () => {
  if (fileReader && fileReader.readyState === 1) {
    console.log('Abort read!');
    fileReader.abort();
  }
});
//retryButton.addEventListener('click', () => retry());
async function handleFileInputChange() {
  const file = fileInput.files[0];
  if (!file) {
    console.log('No file chosen');
  } else {
    sendFileButton.disabled = false;
  }
}

async function createConnection() {
  abortButton.disabled = false;
  sendFileButton.disabled = true;
  
  if (dataChannel.readyState == "open") {
      sendData();
  }else if(dataChannel && peerConnection){
    dataChannel.close();
	dataChannel = null;
	//sendChannel = localConnection.createDataChannel('sendDataChannel');
	dataChannel = peerConnection.createDataChannel('sendDataChannel', {maxPacketLifeTime: 32768}); //, {negotiated: true, id: 0}); //, {maxRetransmits: 1048576});
	dataChannel.binaryType = 'arraybuffer';
  //console.log('Created send data channel');
	dataChannel.onmessage = onReceiveMessageCallback;
	dataChannel.onopen = ondataChannelStateChange;
	dataChannel.onclose = ondataChannelStateChange;
	dataChannel.error = onError;
    sendData();
  }else{
    clickcreateoffer();
    sendData();
  };
}

async function createConnection2() {
  abortButton.disabled = false;
  sendFileButton.disabled = true;
  
  if (dataChannel2.readyState == "open") {
      sendData2();
  }else if(dataChannel2 && peerConnection){
    dataChannel2.close();
	dataChannel2 = null;
	//sendChannel = localConnection.createDataChannel('sendDataChannel');
	dataChannel2 = peerConnection.createDataChannel('sendDataChannel2', {maxPacketLifeTime: 32768}); //, {negotiated: true, id: 1}); //, {maxRetransmits: 1048576});
	dataChannel2.binaryType = 'arraybuffer';
  //console.log('Created send data channel');
	dataChannel2.onmessage = onReceiveMessageCallback;
	dataChannel2.onopen = ondataChannelStateChange2;
	dataChannel2.onclose = ondataChannelStateChange2;
	dataChannel2.error = onError2;
    sendData2();
  }else{
    clickcreateoffer();
    sendData2();
  };
}


function sendData() {
  const file = fileInput.files[0];
  statusMessage.textContent = '';
  //downloadAnchor.textContent = '';
  if (file.size === 0) {
    bitrateDiv.innerHTML = '';
    statusMessage.textContent = 'File is empty, please select a non-empty file';
     return;
  }
	
  pacer = 1;
  sendProgress.max = file.size;
  var details = `${[file.name, file.size, file.type, file.lastModified].join('~')}`;
  
  const chunkSize = 16430;
  fileReader = new FileReader();
  let offset = 0;
  dataChannel.send(details);
  
  fileReader.addEventListener('error', error => console.error('Error reading file:', error));
  fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
  fileReader.addEventListener('load', sendChunk);
                              
    async function sendChunk(event) {
    //console.log('FileRead.onload ', e);   
	   await sleep(1);
    dataChannel.send(event.target.result);
     
	//pacer += 1;
	    
	    await sleep(1);
	/*
    if (pacer == 1024){
		await sleep(50);
		buffer();
		pacer = 0;
	}
	*/
    offset += event.target.result.byteLength;
    sendProgress.value = offset;
    if (offset < file.size) {
      readSlice(offset);
	    //await sleep(5);
    }else{
	    pacer = 0;
	    sendProgress.value = 0;
    }
  };
  
  async function readSlice(offsetValue) {
      //console.log('readSlice ', o);
	  return new Promise(resolve => {
		  const slice = file.slice(offset, (offsetValue + chunkSize));
		  resolve(fileReader.readAsArrayBuffer(slice));
	  });
  };
  readSlice(0);
	
}

function sendData2() {
  const file = fileInput.files[0];
  statusMessage.textContent = '';
  //downloadAnchor.textContent = '';
  if (file.size === 0) {
    bitrateDiv.innerHTML = '';
    statusMessage.textContent = 'File is empty, please select a non-empty file';
     return;
  }
	
  pacer = 1;
  sendProgress.max = file.size;
  var details = `${[file.name, file.size, file.type, file.lastModified].join('~')}`;
  
  const chunkSize = 16430;
  fileReader = new FileReader();
  let offset = 0;
  dataChannel2.send(details);
  
  fileReader.addEventListener('error', error => console.error('Error reading file:', error));
  fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
  fileReader.addEventListener('load', sendChunk);
                              
    async function sendChunk(event) {
    //console.log('FileRead.onload ', e);   
	   await sleep(1);
    dataChannel2.send(event.target.result);
     
	//pacer += 1;
	    
	    await sleep(1);
	/*
    if (pacer == 1024){
		await sleep(50);
		buffer();
		pacer = 0;
	}
	*/
    offset += event.target.result.byteLength;
    sendProgress.value = offset;
    if (offset < file.size) {
      readSlice(offset);
	    //await sleep(5);
    }else{
	    pacer = 0;
  	    sendProgress.value = 0;
    }
  };
  
  async function readSlice(offsetValue) {
      //console.log('readSlice ', o);
	  return new Promise(resolve => {
		  const slice = file.slice(offset, (offsetValue + chunkSize));
		  resolve(fileReader.readAsArrayBuffer(slice));
	  });
  };
  readSlice(0);
	
}

async function buffer(){
	//console.log('buffering');
    return new Promise(resolve => {
	    if (dataChannel) {
		dataChannel.close();
	    dataChannel = null;
	    };
dataChannel = peerConnection.createDataChannel('sendDataChannel', {maxPacketLifeTime: 32768}); //, {negotiated: true, id: 0}); //, {maxRetransmits: 1048576});
	dataChannel.binaryType = 'arraybuffer';
  //console.log('Created send data channel');
	dataChannel.onmessage = onReceiveMessageCallback;
	dataChannel.onopen = ondataChannelStateChange;
	dataChannel.onclose = ondataChannelStateChange;
	dataChannel.error = onError;
	})
  }

async function buffer2(){
	//console.log('buffering');
    return new Promise(resolve => {
	    if (dataChannel2) {
		dataChannel2.close();
	    dataChannel2 = null;
	    };
dataChannel2 = peerConnection.createDataChannel('sendDataChannel', {maxPacketLifeTime: 32768}); //, {negotiated: true, id: 1}); //, {maxRetransmits: 1048576});
	dataChannel2.binaryType = 'arraybuffer';
  //console.log('Created send data channel');
	dataChannel2.onmessage = onReceiveMessageCallback;
	dataChannel2.onopen = ondataChannelStateChange2;
	dataChannel2.onclose = ondataChannelStateChange2;
	dataChannel2.error = onError2;
	})
  }


function retry() {
	
	buffer();
	
	handling();
	
}

function retry2() {
	
	buffer2();
	
	handling2();
	
}


const sleep = (milliseconds) => {
	//console.log('sleeping');
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
async function handling(){
	//console.log('buffering');
    return new Promise(resolve => {
	    
	    if (dataChannel) {
		dataChannel.close();
	    dataChannel = null;
	    };
	dataChannel = event.channel;
	dataChannel.binaryType = 'arraybuffer';
  //console.log('Created send data channel');
	dataChannel.onmessage = onReceiveMessageCallback;
	dataChannel.onopen = ondataChannelStateChange;
	dataChannel.onclose = ondataChannelStateChange;
	dataChannel.error = onError;
	})
  }

async function handling2(){
	//console.log('buffering');
    return new Promise(resolve => {
	    
	    if (dataChannel2) {
		dataChannel2.close();
	    dataChannel2 = null;
	    };
	dataChannel2 = event.channel;
	dataChannel2.binaryType = 'arraybuffer';
  //console.log('Created send data channel');
	dataChannel2.onmessage = onReceiveMessageCallback;
	dataChannel2.onopen = ondataChannelStateChange2;
	dataChannel2.onclose = ondataChannelStateChange2;
	dataChannel2.error = onError2;
	})
  }

function closeDataChannels() {
  console.log('Closing data channels');
  if (dataChannel) {
  dataChannel.close();
  console.log(`Closed data channel with label: ${dataChannel.label}`);
  dataChannel = null;
  peerConnection.close();
  peerConnection = null;
  }
  if (dataChannel2) {
    dataChannel2.close();
    console.log(`Closed data channel with label: ${dataChannel2.label}`);
    dataChannel2 = null;
    peerConnection.close();
    peerConnection = null;
  }
  
  console.log('Closed peer connections');
  // re-enable the file select
  fileInput.disabled = false;
  abortButton.disabled = true;
  document.querySelector('button#sendFile').disabled = false;
}

async function gotLocalDescription(desc) {
  await peerConnection.setLocalDescription(desc);
  console.log(`Offer from localConnection\n ${desc.sdp}`);
  await peerConnection.setRemoteDescription(desc);
  try {
    const answer = await peerConnection.createAnswer();
    await gotRemoteDescription(answer);
  } catch (e) {
    console.log('Failed to create session description: ', e);
  }
}
async function gotRemoteDescription(desc) {
  await peerConnection.setLocalDescription(desc);
  console.log(`Answer from remoteConnection\n ${desc.sdp}`);
  await peerConnection.setRemoteDescription(desc);
}

function dataChannelCallback(event) {
  //console.log('Receive Channel Callback');
  
  dataChannel = event.channel;
  dataChannel.binaryType = 'arraybuffer';
  dataChannel.onmessage = onReceiveMessageCallback;
  dataChannel.onopen = onReceiveChannelStateChange;
  dataChannel.onclose = onReceiveChannelStateChange;
  if(sending == 0){
	  receivedSize = 0;
	  bitrateMax = 0;
	  //downloadAnchor.textContent = '';
	  bitrateDiv.innerHTML = '';
	  /*downloadAnchor.removeAttribute('download');
	  if (downloadAnchor.href) {
		URL.revokeObjectURL(downloadAnchor.href);
		downloadAnchor.removeAttribute('href');
	  }*/
  }
}

function dataChannelCallback2(event) {
  //console.log('Receive Channel Callback');
  
  dataChannel2 = event.channel;
  dataChannel2.binaryType = 'arraybuffer';
  dataChannel2.onmessage = onReceiveMessageCallback;
  dataChannel2.onopen = onReceiveChannelStateChange2;
  dataChannel2.onclose = onReceiveChannelStateChange2;
  if(sending == 0){
	  receivedSize = 0;
	  bitrateMax = 0;
	  //downloadAnchor.textContent = '';
	  bitrateDiv.innerHTML = '';
	  /*downloadAnchor.removeAttribute('download');
	  if (downloadAnchor.href) {
		URL.revokeObjectURL(downloadAnchor.href);
		downloadAnchor.removeAttribute('href');
	  }*/
  }
}

async function onReceiveMessageCallback(event) {
 
  //sending = 1;
  
  if(sending !== 1){
    //downloadAnchor.textContent = '';
    bitrateDiv.innerHTML = '';
    timestampStart = (new Date()).getTime();
    timestampPrev = timestampStart;
    statsInterval = setInterval(displayStats, 500);
    await displayStats();
  };
	
  sending = 1;
	
  //console.log(`Received Message ${event.data.byteLength}`);
  receiveBuffer.push(event.data);
  
  var fileDetails = receiveBuffer[0];
  var parts = fileDetails.split('~');
  var info = {name: parts[0], size: Number(parts[1]), type: parts[2], lastModified: Number(parts[3])};
  
  receiveProgress.max = info.size;
  if (receiveBuffer.length !== 1) {
  receivedSize += Number(`${event.data.byteLength}`);
  receiveProgress.value = receivedSize;
  }
  let file = info;
 
  if (receivedSize === file.size) {
    receiveBuffer.shift();
  
    const received = new Blob(receiveBuffer);
    receiveBuffer = [];
	  
    downloadAnchor = document.createElement('a');
    downloadAnchor.href = URL.createObjectURL(received);
    downloadAnchor.download = file.name;
    downloadAnchor.textContent =
      `Click to download '${file.name}' (${file.size} bytes)`;
    downloadAnchor.style.display = 'block';
	  
    document.getElementById('download').prepend(downloadAnchor);
    const bitrate = Math.round(receivedSize * 8 /
      ((new Date()).getTime() - timestampStart));
    averageBitrateDiv.innerHTML =
      `<strong>Average Bitrate:</strong> ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`;
    if (statsInterval) {
      clearInterval(statsInterval);
      statsInterval = null;
    }
    fileDetails = '';
    bitrateMax = 0;
    receiveBuffer.length = 0;
    receivedSize = 0;
    parts.length = 0;
    info = '';
	  receiveProgress.value = receivedSize;
	sending = 0;
	//URL.revokeObjectURL(downloadAnchor.href);
	//downloadAnchor.removeAttribute('href');
  }
}

async function ondataChannelStateChange() {
	if(sending == 0){
  if (dataChannel) {
    const {readyState} = dataChannel;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      chatlog('Connected');
		  timestampStart = (new Date()).getTime();
		  timestampPrev = timestampStart;
		  statsInterval = setInterval(displayStats, 500);
		  await displayStats();
    }else{
      chatlog('Disconnected');
	    if(pacer == 1){buffer()};
    }
    if(pacer == 1){buffer()};
  }
	if(pacer == 1){buffer()};
}

}

async function ondataChannelStateChange2() {
	if(sending == 0){
  if (dataChannel2) {
    const {readyState} = dataChannel2;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      chatlog('Connected');
		  timestampStart = (new Date()).getTime();
		  timestampPrev = timestampStart;
		  statsInterval = setInterval(displayStats, 500);
		  await displayStats();
    }else{
      chatlog('Disconnected');
	    if(pacer == 1){buffer2()};
    }
    if(pacer == 1){buffer2()};
  }
	if(pacer == 1){buffer2()};
}

}

function onError(error) {
  if (dataChannel) {
    console.error('Error in sendChannel:', error);
    return;
  }
  console.log('Error in sendChannel which is already closed:', error);
	if(pacer == 1){buffer()};
}

function onError2(error) {
  if (dataChannel2) {
    console.error('Error in sendChannel:', error);
    return;
  }
  console.log('Error in sendChannel which is already closed:', error);
	if(pacer == 1){buffer2()};
}

async function onReceiveChannelStateChange() {
	if(sending == 0){
	  if (dataChannel) {
		const readyState = dataChannel.readyState;
		console.log(`Receive channel state is: ${readyState}`);
		if (readyState === 'open') {
			chatlog('Connected');
		  timestampStart = (new Date()).getTime();
		  timestampPrev = timestampStart;
		  statsInterval = setInterval(displayStats, 500);
		  await displayStats();
	
    }else{
      chatlog('Disconnected');
	    if(pacer == 1){buffer()};
    }
    if(pacer == 1){buffer()};
  }
	if(pacer == 1){buffer()};
}
}

async function onReceiveChannelStateChange2() {
	if(sending == 0){
	  if (dataChannel2) {
		const readyState = dataChannel2.readyState;
		console.log(`Receive channel state is: ${readyState}`);
		if (readyState === 'open') {
			chatlog('Connected');
		  timestampStart = (new Date()).getTime();
		  timestampPrev = timestampStart;
		  statsInterval = setInterval(displayStats, 500);
		  await displayStats();
	
    }else{
      chatlog('Disconnected');
	    if(pacer == 1){buffer2()};
    }
    if(pacer == 1){buffer2()};
  }
	if(pacer == 1){buffer2()};
}
}

// display bitrate statistics.
async function displayStats() {
  if (peerConnection && peerConnection.iceConnectionState === 'connected') {
    const stats = await peerConnection.getStats();
    let activeCandidatePair;
    stats.forEach(report => {
      if (report.type === 'transport') {
        activeCandidatePair = stats.get(report.selectedCandidatePairId);
      }
    });
    if (activeCandidatePair) {
      if (timestampPrev === activeCandidatePair.timestamp) {
        return;
      }
      // calculate current bitrate
      const bytesNow = activeCandidatePair.bytesReceived;
      const bitrate = Math.round((bytesNow - bytesPrev) * 8 /
        (activeCandidatePair.timestamp - timestampPrev));
      bitrateDiv.innerHTML = `<strong>Current Bitrate:</strong> ${bitrate} kbits/sec`;
      timestampPrev = activeCandidatePair.timestamp;
      bytesPrev = bytesNow;
      if (bitrate > bitrateMax) {
        bitrateMax = bitrate;
      }
    }
  }
}
