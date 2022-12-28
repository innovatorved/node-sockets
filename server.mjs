import { createServer } from "http";
import crypto from "crypto";

import { unmask_returnBuffer } from "./helpers/UnmaskReadableStream.js";

import {
  PORT,
  WEB_SOCKET_MAGIC_KEY,
  SEVEN_BIT_INTEGER_MARKER,
  SIXTEEN_BIT_INTEGER_MARKER,
  SIXTY_FOUR_BIT_INTEGER_MARKER,
  FIRST_BIT,
  MASK_KEY_BYTE_LENGTH,
} from "./helpers/constants.js";

const server = createServer((req, res) => {
  res.writeHead(200);
  res.end("Hey Working!");
}).listen(PORT, () => console.log("Server is Running to : ", PORT));

server.on("upgrade", onSocketUpgrade);

function onSocketUpgrade(req, socket, head) {
  const { "sec-websocket-key": webClientSocketKey } = req.headers;
  const headers = prepareHandShakeHeaders(webClientSocketKey);
  socket.write(headers);
  console.log(`${webClientSocketKey} connected !`);

  socket.on("readable", () => onSocketReadable(socket));
}

function onSocketReadable(socket) {
  // Consume First Byte - OPTCODE

  // Read First Byte means 8bits
  // 1Byte = 8bits
  socket.read(1); // 8BITS

  /**
   *  Read Secound Byte and Extract Mask and Payload Information
   *  For client to server it always mask so mask bit is always 1
   *  Web subtract mask bit from byte for finding payload length
   *  subtract one bit (128 or 0b10000000)
   *
   */

  const [markerAndPayloadLength] = socket.read(1);
  const PayloadLengthIndicatorBits = markerAndPayloadLength - FIRST_BIT;

  let MessageLength = 0;
  if (PayloadLengthIndicatorBits <= SEVEN_BIT_INTEGER_MARKER) {
    MessageLength = PayloadLengthIndicatorBits;
  } else {
    throw new Error("Message is to big! we don't handle 64bit data");
  }

  const maskKey = socket.read(MASK_KEY_BYTE_LENGTH);
  const encodedBuffer = socket.read(MessageLength);
  const decodedBuffer = unmask_returnBuffer(maskKey, encodedBuffer);

  const string_data = decodedBuffer.toString("utf-8").trim();
  let data;
  try {
    data = JSON.parse(string_data);
  } catch (error) {
    console.log(error.message);
    data = string_data;
  }

  console.log(data);
}

function prepareHandShakeHeaders(clientId) {
  const acceptKey = createSocketAcceptHeader(clientId);
  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "",
  ]
    .map((line) => line.concat("\r\n"))
    .join("");
  // const head = `HTTP/1.1 101 Switching Protocols\nUpgrade: websocket\nConnection: Upgrade\nSec-WebSocket-Accept: ${acceptKey}\n\n`
  return headers;
}

function createSocketAcceptHeader(clientId) {
  const shaum = crypto.createHash("sha1");
  shaum.update(clientId + WEB_SOCKET_MAGIC_KEY);
  return shaum.digest("base64");
}

// Error Handling to Keep s=Server Always On
["uncaughtException", "unhandledRejection"].forEach((event) => {
  process.on(event, (err) => {
    console.error(`Error Occurs: ${event} , msg: ${err.stack || err}`);
  });
});
