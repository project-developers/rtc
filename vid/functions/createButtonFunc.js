const createButtonFunc = async () => {
    await openButtonFunc();
    peerConnection = new RTCPeerConnection(configuration);
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

peerConnection.onconnectionstatechange = ev => {
  switch(peerConnection.connectionState) {
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
    const participants = roomRef.collection("participants");
    
    const data = {
        participantId: participants.id,
        status: 'connected'
    };
    
    await roomRef.collection('participants').doc().set(data);
    
    participantId = participants.id;
        
    peerConnection.addEventListener("icecandidate", event => {
      if(!event.candidate){
       //  console.log("Got Final Candidate!");
        return;
      }
     //  console.log('Got candidate: ', event.candidate);
     callerCandidatesCollection.add(event.candidate.toJSON());
    })
    // Code for collecting ICE candidates above


     // Code for creating a room below
     const offer = await peerConnection.createOffer();
     await peerConnection.setLocalDescription(offer);
    
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

     peerConnection.addEventListener("track", event => {
        // console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
          // console.log('Add a track to the remoteStream:', track);
          remoteStream.addTrack(track);
        })
       })

       // Listening for remote session description below
      let unsubscribe = roomRef.onSnapshot(async snapshot => {
        const data = snapshot.data();
        if(peerConnection.iceConnectionState !== "closed"){

          if(!peerConnection.currentRemoteDescription && data && data.answer){
            // console.log('Got remote description: ', data.answer);
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await peerConnection.setRemoteDescription(rtcSessionDescription);
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
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      // Listen for remote ICE candidates above
    
    i++;
    //j++;
    //k++;

      return () => {
          unsubscribe();
          unsubscribe2();
          //participants.add("joined".tojson());
          //document.getElementById("videos").appendChild(remoteVideo);
      }
}
