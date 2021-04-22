const joinButtonFunc = async () => {
    roomId = prompt("Enter a Room Id");

    peerConnection = new RTCPeerConnection(configuration);

    const roomRef = firestore.collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();

    if(roomSnapshot.exists){
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
        })

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = roomRef.collection("calleCandidates");
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
