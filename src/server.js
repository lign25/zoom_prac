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

function publicRooms(){
    const {
        sockets: {
            adapter: {sids, rooms },
        },
    } = wsServer;

    const publicRooms = [];
    rooms.forEach((_, key)=> {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}



//front에서 back으로 연결
wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
    });
    //socket.emit과 socket.on은 같은 이름을 사용해야 한다.
    //누군가 방에 입장했을 때 메세지 출력
    socket.on("enter_room", (roomName, done) => {
        //방에 참가하면 done함수 호출
        //done함수는 프론트엔드에 있는 showRoom()을 실행ß
        //이후 event를 참가한 방 안에 있는 모든 사람에게 emit
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => 
        socket.to(room).emit("bye", socket.nickname, countRoom(room)-1)
        );

    });
    //사용자가 disconnect하면 socketIO가 방을삭제
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);

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
