

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("Conneted to Server");
});

socket.addEventListener("messge", (messge) => {
    console.log.apply("Just got this: ", message, "from the server")

});

socket.addEventListener("close", () => {
    console.log("Disconneted from Server");
});