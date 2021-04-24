const openButtonFunc = async () => {
    try {
        if(videos.innerHTML == ''){
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        localVideo.muted = true;
        videos.appendChild(localVideo);
        }
        
        remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;
        videos.appendChild(remoteVideo);

        openButton.disabled = true;
        createButton.disabled = false;
        joinButton.disabled = false;
        hangupButton.disabled = false;
    } catch (error) {
        console.log(error)
    }
}
