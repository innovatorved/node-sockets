import { createServer } from "http";
import crypto from "crypto";

const PORT = process.env.PORT || 1337;
const WEB_SOCKET_MAGIC_KEY = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const server = createServer((req, res) => {
    res.writeHead(200);
    res.end("Hey Working!");
}).listen(PORT, () => console.log("Server is Running to : ", PORT));


server.on("upgrade", onSocketUpgrade);



function onSocketUpgrade(req, socket, head) {
    const { 'sec-websocket-key': webClientSocketKey } = req.headers;
    const headers = prepareHandShakeHeaders(webClientSocketKey);
    socket.write(headers);
    // console.log(`${webClientSocketKey} connected !`)
}

function prepareHandShakeHeaders(clientId) {
    const acceptKey = createSocketAcceptHeader(clientId);
    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        ''
    ].map(line => line.concat('\r\n')).join('');
    // const head = `HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: ${acceptKey}\n\n`
    return headers;
}

function createSocketAcceptHeader(clientId) {
    const shaum = crypto.createHash('sha1');
    shaum.update(clientId + WEB_SOCKET_MAGIC_KEY);
    return shaum.digest('base64')
}

// Error Handling to Keep s=Server Always On
;
[ "uncaughtException", "unhandledRejection" ].forEach((event) => {
    process.on(event, (err) => {
        console.error(`Error Occurs: ${event} , msg: ${err.stack || err}`);
    });
});


