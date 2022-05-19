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

function handleConnection(socket) { 
    console.log(socket);
}

wss.on("connection", (socket) => {
    socket.send("hello!!!");
    console.log("Conneted to Browser");
});



server.listen(3000, handleListen);
