const joinButtonFunc = async () => {
    await openButtonFunc();
    roomId = prompt("Enter a Room Id");

    peerConnection = new RTCPeerConnection(configuration);

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
	 
    const roomRef = firestore.collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();

    if(roomSnapshot.exists){
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
        })

		peerConnection.ondatachannel = dataChannelCallback;

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
        peerConnection.addEventListener("icecandidate", event => {
          if(!event.candidate){
            // console.log('Got final candidate!');
            return;
          }
          // console.log('Got candidate: ', event.candidate);
          calleeCandidatesCollection.add(event.candidate.toJSON());
        })
        // Code for collecting ICE candidates above

        peerConnection.addEventListener("track", event => {
            // console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
              // console.log('Add a track to the remoteStream:', track);
              remoteStream.addTrack(track);
            })
        })

        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer;
        // console.log('Got offer:', offer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        //   console.log('Created answer:', answer);
        await peerConnection.setLocalDescription(answer);
	    
	answer.sdp = await setMediaBitrates(answer.sdp);

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        };
        await roomRef.update(roomWithAnswer);
        // Code for creating SDP answer above

        // Listening for remote ICE candidates below
        let unsubscribe = roomRef.collection('callerCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
            let data = change.doc.data();
            // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
        });
        });
        // Listening for remote ICE candidates 

        return () => unsubscribe()
    }
}
