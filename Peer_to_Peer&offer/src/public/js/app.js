const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;



async function getCameras() {  //navigator.mediaDevices.enumerateDevices 호출
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === "videoinput");
      //어떤 카메라가 선택되었는지 알 수 있음
      const cuurrentCamera = myStream.getAudioTracks()[0];
      cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      //카메라 option이 현재 선택된 카메라와 같은 label인지 알 수 있음
      if(cuurrentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
      });
    } catch (e) {
      console.log(e);
    }

}


async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if(!deviceId) {
      await getCameras();
    }
    
  } catch (e) {
    console.log(e);
  }
}



function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}


function handleCameraClick() {
  //camera off
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia(camerasSelect.value);
  makeConnection();
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// choose a room


const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();

}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


//socket code


//This is Peer A & cerate offer
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer)
  //offer to peer B
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", (offer) => {
  console.log(offer);
});


//RTC Code

function makeConnection() { //영상, 오디오 데이터를 peer connection에 input
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach(track => myPeerConnection.addTrack(track, myStream));
}