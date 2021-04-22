openButton.addEventListener("click", openButtonFunc);
createButton.addEventListener("click", createButtonFunc);
joinButton.addEventListener("click", joinButtonFunc);
hangupButton.addEventListener("click", hangupButtonFunc);

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
