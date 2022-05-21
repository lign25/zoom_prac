import http from "http";
import SocketIO from "socket.io"
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));



const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

//front에서 back으로 연결
wsServer.on("connection", (socket) => {
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
    })
    //socket.emit과 socket.on은 같은 이름을 사용해야 한다.
    socket.on("enter_room", (roomName, done) => {
        //방에 참가하면 done함수 호출
        //done함수는 프론트엔드에 있는 showRoom()을 실행
        //이후 event를 참가한 방 안에 있는 모든 사람에게 emit
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
        
    
    });
});

// const sockets = [];

// wss.on("connection", (socket) => {  //새로운 브라우저가 서버에 들어오면 실행
//     sockets.push(socket); //socket array에 저장
//     socket["nickname"] = "Anon"; //socket에 nickname 부여
//     console.log("Connected to Browser");
//     //서버에서 socket의 close 이벤트 발생, 페이지 종료 시 터미널에 메세지 출력
//     socket.on("close", onSocketClose);
//     socket.on("message", (msg) => { //socket이 메세지를 보낼 때까지 대기
//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket)=>
//                 aSocket.send(`${socket.nickname}: ${message.payload}`));
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }
//     });
// });
        

const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);

