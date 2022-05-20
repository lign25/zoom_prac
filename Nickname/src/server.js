import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));


app.get("/", (req, res) => res.render("home"));
const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


function onSocketClose() {
    console.log("Disconnected from the Browser");
}

const sockets = [];

wss.on("connection", (socket) => {  //새로운 브라우저가 서버에 들어오면 실행
    sockets.push(socket); //socket array에 저장
    socket["nickname"] = "Anon"; //socket에 nickname 부여
    console.log("Connected to Browser");
    //서버에서 socket의 close 이벤트 발생, 페이지 종료 시 터미널에 메세지 출력
    socket.on("close", onSocketClose);
    socket.on("message", (msg) => { //socket이 메세지를 보낼 때까지 대기
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket)=>
                aSocket.send(`${socket.nickname}: ${message.payload}`));
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});
        
server.listen(3000, handleListen);

