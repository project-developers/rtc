const openButtonFunc = async () => {
    try {
        const offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 0
        };
        localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localVideo.srcObject = localStream;
        localVideo.muted = true;

        remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;

        openButton.disabled = true;
        createButton.disabled = false;
        joinButton.disabled = false;
        hangupButton.disabled = false;
    } catch (error) {
        console.log(error)
    }
}
