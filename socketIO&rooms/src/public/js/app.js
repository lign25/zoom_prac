
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden =true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);

}

function showRoom(msg){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    //enter room 버튼 클릭시 emit실행
    //첫번째 argument: event이름 
    //두번째 argument: payload
    //세번째 argument: 명시된 내용
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);



socket.on("welcome", () => {
    addMessage("someone joined!");
});