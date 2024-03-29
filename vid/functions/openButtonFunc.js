const openButtonFunc = async () => {
    try {
        if(videos.innerHTML == ''){
        //videos.appendChild(localVideo);
            /*
        const videoConstraint = {
            audio: true,
            video: {
                width: 160,
                height: 120,
                framerate: 15
            }
        }*/
        
        const offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        };

        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); //{width: auto, height: 480}});
        //localVideo.srcObject = localStream;
        //localVideo.muted = true;
        //var video1 = document.createElement('video');
        localVideo.srcObject = localStream;
        /*video1.autoplay = true;
        video1.muted = true;
        video1.setAttribute("playsinline",null);*/
        videos.appendChild(localVideo);
        }
        
        //videos.appendChild(remoteVideo);
        remoteStream = new MediaStream();
        remoteVideo[i] = document.createElement('video');
        remoteVideo[i].srcObject = remoteStream;
        remoteVideo[i].autoplay = true;
        remoteVideo[i].setAttribute("playsinline",null);
        //remoteVideo.srcObject = remoteStream;
        //var video2 = document.createElement('video');
        //remoteVideo[i].srcObject = remoteStream;
        /*video2.autoplay = true;
        video2.muted = true;
        video2.setAttribute("playsinline",null);*/
        videos.appendChild(remoteVideo[i]);
        //videos.appendChild(remoteVideo);

        openButton.disabled = true;
        createButton.disabled = false;
        joinButton.disabled = false;
        hangupButton.disabled = false;
    } catch (error) {
        console.log(error)
    }
}
