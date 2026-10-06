#!/usr/bin/env node
/**
 * The instructor relay: a dumb fan-out for the observer envelope.
 *
 *     node tools/relay_server.mjs            # ws://0.0.0.0:8787
 *     node tools/relay_server.mjs 9100       # another port
 *
 * WebXR/shared/observer.js carries instructor mode over a BroadcastChannel,
 * which is same-origin and same-device by definition. That covers a hall with a
 * row of laptops. It does not cover an instructor on their own machine, so both
 * the console and each learner app accept `?relay=<ws url>` and put the *same*
 * JSON envelope on a WebSocket as well. This is that socket's other end.
 *
 * It understands nothing about the messages. A frame arriving from one client
 * is written to every other client, unparsed and unmodified; nothing is stored,
 * nothing is logged beyond a connection count, and there is no room concept
 * (one relay is one class — run a second one on another port for a second
 * class). The learner apps already ignore anything that is not a command for
 * them and the console ignores anything that is not a learner event, so a
 * confused client cannot make either side do something.
 *
 * No dependencies: this is the built-in http server's `upgrade` event, the
 * RFC 6455 handshake (a SHA-1 of the client key and the protocol GUID) and a
 * small frame reader/writer for text, ping, pong and close. Binary frames are
 * dropped — the protocol is JSON text.
 *
 * What it is not: authentication, encryption or an audit trail. Anyone who can
 * reach the port can send commands to every learner on it. Run it on the
 * training room's own network, behind a TLS terminator if it leaves the room
 * (then use wss://), and keep the durable record where it already is — the
 * learner's own training record, which carries every instructor command as an
 * instructorAction. See docs/instructor-console.md.
 */
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";

const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "0.0.0.0";
const MAX_FRAME = 1 << 20; // 1 MiB: an observer envelope is a few hundred bytes

const clients = new Set();

/** One text frame, server → client: never masked, one byte of length prefix
 *  per RFC 6455's three cases (7-bit, 16-bit, 64-bit). */
function textFrame(payload) {
  const body = Buffer.from(payload, "utf8");
  const len = body.length;
  let head;
  if (len < 126) {
    head = Buffer.from([0x81, len]);
  } else if (len < 65536) {
    head = Buffer.alloc(4);
    head[0] = 0x81; head[1] = 126;
    head.writeUInt16BE(len, 2);
  } else {
    head = Buffer.alloc(10);
    head[0] = 0x81; head[1] = 127;
    head.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([head, body]);
}

function controlFrame(opcode, payload = Buffer.alloc(0)) {
  const head = Buffer.from([0x80 | opcode, payload.length]);
  return Buffer.concat([head, payload]);
}

/**
 * Pull whole frames out of a socket's buffer. Returns the frames it could read
 * and the bytes left over. Fragmented text (a continuation frame) is
 * reassembled; a frame larger than MAX_FRAME closes the connection, because
 * nothing this protocol sends is that big.
 */
function readFrames(buf, state) {
  const out = [];
  let offset = 0;
  for (;;) {
    if (buf.length - offset < 2) break;
    const b0 = buf[offset];
    const b1 = buf[offset + 1];
    const fin = (b0 & 0x80) !== 0;
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let cursor = offset + 2;
    if (len === 126) {
      if (buf.length - cursor < 2) break;
      len = buf.readUInt16BE(cursor); cursor += 2;
    } else if (len === 127) {
      if (buf.length - cursor < 8) break;
      const big = buf.readBigUInt64BE(cursor); cursor += 8;
      if (big > BigInt(MAX_FRAME)) return { out, rest: buf.subarray(offset), fatal: true };
      len = Number(big);
    }
    if (len > MAX_FRAME) return { out, rest: buf.subarray(offset), fatal: true };
    let mask = null;
    if (masked) {
      if (buf.length - cursor < 4) break;
      mask = buf.subarray(cursor, cursor + 4); cursor += 4;
    }
    if (buf.length - cursor < len) break;
    const body = Buffer.from(buf.subarray(cursor, cursor + len));
    if (mask) for (let i = 0; i < body.length; i++) body[i] ^= mask[i % 4];
    cursor += len;
    offset = cursor;
    if (opcode === 0x8) { out.push({ kind: "close" }); break; }
    if (opcode === 0x9) { out.push({ kind: "ping", body }); continue; }
    if (opcode === 0xa) { continue; } // pong: nothing to do
    if (opcode === 0x2) { state.frag = null; continue; } // binary: not this protocol
    if (opcode === 0x1) state.frag = body;
    else if (opcode === 0x0 && state.frag) state.frag = Buffer.concat([state.frag, body]);
    else continue;
    if (fin && state.frag) {
      out.push({ kind: "text", text: state.frag.toString("utf8") });
      state.frag = null;
    }
  }
  return { out, rest: buf.subarray(offset), fatal: false };
}

const server = createServer((req, res) => {
  // A plain GET is somebody checking the relay is up; say so in one line.
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end(`instructor relay · ${clients.size} client(s) · open the console and each learner app with ?relay=ws://<this host>:${PORT}\n`);
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (String(req.headers.upgrade ?? "").toLowerCase() !== "websocket" || !key) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    return;
  }
  const accept = createHash("sha1").update(key + GUID).digest("base64");
  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "\r\n",
  ].join("\r\n"));
  socket.setNoDelay(true);

  const client = { socket, id: randomBytes(4).toString("hex") };
  clients.add(client);
  console.log(`+ ${client.id} connected · ${clients.size} client(s)`);

  const state = { frag: null };
  let pending = Buffer.alloc(0);
  const drop = () => {
    if (!clients.has(client)) return;
    clients.delete(client);
    console.log(`- ${client.id} gone · ${clients.size} client(s)`);
    try { socket.destroy(); } catch (_) { /* already gone */ }
  };

  socket.on("data", (chunk) => {
    pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
    const { out, rest, fatal } = readFrames(pending, state);
    pending = Buffer.from(rest);
    for (const frame of out) {
      if (frame.kind === "close") { drop(); return; }
      if (frame.kind === "ping") { try { socket.write(controlFrame(0xa, frame.body)); } catch (_) { drop(); } continue; }
      // The fan-out, and the whole of this server's understanding of the
      // protocol: every other client, exactly what arrived.
      const wire = textFrame(frame.text);
      for (const peer of clients) {
        if (peer === client) continue;
        try { peer.socket.write(wire); } catch (_) { /* that peer is going away */ }
      }
    }
    if (fatal) drop();
  });
  socket.on("error", drop);
  socket.on("close", drop);
});

server.listen(PORT, HOST, () => {
  console.log(`instructor relay listening on ws://${HOST}:${PORT}`);
  console.log(`open each learner app and the console with ?relay=ws://<this host>:${PORT}`);
  console.log("nothing is stored and nothing is authenticated: run it on the training room's own network.");
});
