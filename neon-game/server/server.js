import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { acceptWebSocket } from './ws.js';
import { GameRoom } from './room.js';
import { GAME } from '../shared/rules.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url)); const root=path.resolve(__dirname,'..'); const pub=path.join(root,'public'); const shared=path.join(root,'shared');
const rooms=new Map();
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
function serve(req,res){
  let u=new URL(req.url,'http://x').pathname; let base=pub;
  if(u.startsWith('/shared/')){base=shared;u=u.slice('/shared'.length);}
  if(u==='/'||u==='')u='/index.html'; const target=path.normalize(path.join(base,u));
  if(!target.startsWith(base)){res.writeHead(403);return res.end('forbidden');}
  fs.stat(target,(err,st)=>{if(err||!st.isFile()){res.writeHead(404);return res.end('not found');}res.writeHead(200,{'content-type':MIME[path.extname(target)]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(target).pipe(res);});
}
const server=http.createServer(serve);
server.on('upgrade',(req,socket,head)=>{
  if(new URL(req.url,'http://x').pathname!=='/ws')return socket.destroy();
  acceptWebSocket(req,socket,head,(peer)=>{
    let room=null;
    peer.onmessage=(msg)=>{
      if(!room){if(msg.type!=='join')return peer.close(); const code=String(msg.room||'CASINO').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)||'CASINO'; room=rooms.get(code)||new GameRoom(code);rooms.set(code,room);room.join(peer,msg);return;}
      room.handle(peer,msg);
    };
    peer.onclose=()=>room?.leave(peer);
  });
});
setInterval(()=>{for(const [code,r] of rooms){r.tick();r.sendState();if(r.clients.size===0&&r.finished)rooms.delete(code);}},1000/GAME.SNAPSHOT_HZ);
const port=Number(process.env.PORT||8080); server.listen(port,'0.0.0.0',()=>console.log(`Neon Debt running on http://localhost:${port}`));
