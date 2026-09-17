import crypto from 'node:crypto';

export function acceptWebSocket(req, socket, head, onConnection) {
  const key = req.headers['sec-websocket-key'];
  if (!key) return socket.destroy();
  const accept = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '\r\n'
  ].join('\r\n'));
  const peer = new Peer(socket);
  if (head?.length) peer._consume(head);
  onConnection(peer, req);
}

export class Peer {
  constructor(socket) {
    this.socket = socket; this.buffer = Buffer.alloc(0); this.open = true;
    this.onmessage = null; this.onclose = null;
    socket.on('data', d => this._consume(d));
    socket.on('close', () => { this.open = false; this.onclose?.(); });
    socket.on('error', () => { this.open = false; this.onclose?.(); });
  }
  send(obj) {
    if (!this.open) return;
    const payload = Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj));
    let header;
    if (payload.length < 126) header = Buffer.from([0x81, payload.length]);
    else if (payload.length < 65536) {
      header = Buffer.alloc(4); header[0]=0x81; header[1]=126; header.writeUInt16BE(payload.length,2);
    } else {
      header = Buffer.alloc(10); header[0]=0x81; header[1]=127; header.writeBigUInt64BE(BigInt(payload.length),2);
    }
    this.socket.write(Buffer.concat([header,payload]));
  }
  close() { try { this.socket.end(Buffer.from([0x88,0x00])); } catch {} }
  _consume(data) {
    this.buffer = Buffer.concat([this.buffer,data]);
    while (this.buffer.length >= 2) {
      const b0=this.buffer[0], b1=this.buffer[1];
      const opcode=b0&0x0f, masked=!!(b1&0x80); let len=b1&0x7f, off=2;
      if (len===126) { if(this.buffer.length<4)return; len=this.buffer.readUInt16BE(2); off=4; }
      else if (len===127) { if(this.buffer.length<10)return; const n=this.buffer.readBigUInt64BE(2); if(n>BigInt(1e7)) return this.close(); len=Number(n); off=10; }
      const maskOff=off; if(masked) off+=4;
      if(this.buffer.length<off+len)return;
      let payload=Buffer.from(this.buffer.subarray(off,off+len));
      if(masked){const m=this.buffer.subarray(maskOff,maskOff+4); for(let i=0;i<payload.length;i++) payload[i]^=m[i&3];}
      this.buffer=this.buffer.subarray(off+len);
      if(opcode===0x8){this.close();return;}
      if(opcode===0x9){this._sendPong(payload);continue;}
      if(opcode!==0x1)continue;
      try { this.onmessage?.(JSON.parse(payload.toString('utf8'))); } catch {}
    }
  }
  _sendPong(payload){ if(!this.open)return; const h=Buffer.from([0x8A,payload.length]); this.socket.write(Buffer.concat([h,payload])); }
}
