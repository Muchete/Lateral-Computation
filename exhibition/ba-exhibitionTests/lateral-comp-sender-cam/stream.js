var video = document.querySelector("#streamVideoElement");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function(stream) {
      video.srcObject = stream;
    })
    .catch(function(err0r) {
      console.log("Something went wrong with da webcam");
    });
}
