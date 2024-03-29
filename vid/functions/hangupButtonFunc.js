const hangupButtonFunc = async () => {
    const tracks = localVideo.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    
    const otherTracks = localStream.getTracks();
    otherTracks.forEach(track => track.stop());
    
    const lastTracks = newStream.getTracks();
    lastTracks.forEach(track => track.stop());

    if(remoteStream){
        remoteStream.getTracks().forEach(track => track.stop())
    }
    
    videos.innerHTML = '';
    roomId = '';
    callerId = '';
    i = 0;
    //j = 0;
    //k = 0;

    if(peerConnection){
        peerConnection.close();
    }

    //Delete a room on hangup below
    if(roomId){
        const roomRef = firestore.collection("rooms").doc(roomId);
        const calleeCandidates = await roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        const callerCandidates = await roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        await roomRef.delete();
    }
    //Delete a room on hangup above
/*
    openButton.disabled = false;
    createButton.disabled = true;
    joinButton.disabled = true;
    hangupButton.disabled = true;

    //document.location.reload(true);
    */
}
