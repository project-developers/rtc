const openButtonFunc = async () => {
    try {
        if(videos.innerHTML == ''){
        //videos.appendChild(localVideo);
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        localVideo.muted = true;
        var video1 = document.createElement('video');
        video1.srcObject = localStream;
        video1.autoplay = true;
        videos.appendChild(video1);
        }
        
        //videos.appendChild(remoteVideo);
        remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;
        //videos.appendChild(remoteVideo);

        openButton.disabled = true;
        createButton.disabled = false;
        joinButton.disabled = false;
        hangupButton.disabled = false;
    } catch (error) {
        console.log(error)
    }
}
