const createButtonFunc = async () => {
    await openButtonFunc();
    peerConnection[j] = new RTCPeerConnection(configuration);
    
    localStream.getTracks().forEach(track => {
        peerConnection[j].addTrack(track, localStream)
    })

peerConnection[j].onconnectionstatechange = ev => {
  switch(peerConnection[j].connectionState) {
    case "new":
    case "checking":
      console.log("Connecting...");
      break;
    case "connected":
      console.log("Online");
      break;
    case "disconnected":
      console.log("Disconnecting...");
      break;
    case "closed":
      console.log("Offline");
      break;
    case "failed":
      console.log("Error");
      break;
    default:
      console.log("Unknown");
      break;
  }
}

    // Code for collecting ICE candidates below
    if(callerId == ''){
        callerId = prompt('Please enter room ID','');
    }
    const roomRef = firestore.collection("rooms").doc(callerId);
    const callerCandidatesCollection = roomRef.collection("callerCandidates");

    peerConnection[j].addEventListener("icecandidate", event => {
      if(!event.candidate){
       //  console.log("Got Final Candidate!");
        return;
      }
     //  console.log('Got candidate: ', event.candidate);
     callerCandidatesCollection.add(event.candidate.toJSON());
    })
    // Code for collecting ICE candidates above


     // Code for creating a room below
     const offer = await peerConnection[j].createOffer();
     await peerConnection[j].setLocalDescription(offer);
    
    offer.sdp = await setMediaBitrates(offer.sdp);

     const roomWithOffer = {
       'offer': {
         type: offer.type,
         sdp: offer.sdp,
       },
       roomId: roomRef.id
     };
     await roomRef.set(roomWithOffer);
     roomId = roomRef.id;
     console.log(roomId)
     // Code for creating a room above

     peerConnection[j].addEventListener("track", event => {
        // console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
          // console.log('Add a track to the remoteStream:', track);
          remoteStream.addTrack(track);
        })
       })

       // Listening for remote session description below
      let unsubscribe = roomRef.onSnapshot(async snapshot => {
        const data = snapshot.data();
        if(peerConnection[j].iceConnectionState !== "closed"){

          if(!peerConnection[j].currentRemoteDescription && data && data.answer){
            // console.log('Got remote description: ', data.answer);
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await peerConnection[j].setRemoteDescription(rtcSessionDescription);
          }

        }
      })
       // Listening for remote session description above

       // Listen for remote ICE candidates below
       let unsubscribe2 = roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            let data = change.doc.data();
            // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
            await peerConnection[j].addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      // Listen for remote ICE candidates above

      return () => {
          unsubscribe();
          unsubscribe2();
          //document.getElementById("videos").appendChild(remoteVideo);
      }
}
