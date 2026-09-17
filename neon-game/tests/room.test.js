import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/room.js';
import { MACHINE_POSITIONS } from '../shared/rules.js';

function peer(){return{messages:[],send(v){this.messages.push(typeof v==='string'?JSON.parse(v):v);},close(){}};}
function joinedRoom(){const r=new GameRoom('QA');const q=peer();const p=r.join(q,{name:'QA',session:'qa-session'});r.phase='running';r.startedAt=Date.now();r.endsAt=Date.now()+300000;return{r,q,p};}
function lastError(q){return[...q.messages].reverse().find(x=>x?.type==='error')?.message;}

test('server rejects remote betting outside machine radius',()=>{
 const {r,q,p}=joinedRoom();p.x=20;p.z=17;
 r.bet(q,p,{machine:'roulette',amount:50,choice:'red'});
 assert.equal(lastError(q),'TOO_FAR_FROM_MACHINE');
 assert.equal(r.balance,1000);
});

test('server blocks bets that cannot resolve before round closes',()=>{
 const {r,q,p}=joinedRoom();const pos=MACHINE_POSITIONS.duck_race;p.x=pos[0];p.z=pos[1];r.endsAt=Date.now()+2000;
 r.bet(q,p,{machine:'duck_race',amount:50,choice:'1'});
 assert.equal(lastError(q),'ROUND_CLOSING');
 assert.equal(r.balance,1000);
});

test('machine session is authoritative and debits exactly once',()=>{
 const {r,q,p}=joinedRoom();const pos=MACHINE_POSITIONS.hilo;p.x=pos[0];p.z=pos[1];
 r.bet(q,p,{machine:'hilo',amount:50});
 assert.equal(r.balance,950);
 assert.ok(r.sessions.has(p.id));
 r.bet(q,p,{machine:'hilo',amount:50});
 assert.equal(r.balance,950);
 assert.equal(lastError(q),'MACHINE_SESSION_ACTIVE');
});

test('round end clears progressive state and machine locks',()=>{
 const {r,q,p}=joinedRoom();const pos=MACHINE_POSITIONS.minesweeper;p.x=pos[0];p.z=pos[1];
 r.bet(q,p,{machine:'minesweeper',amount:50});
 assert.ok(r.sessions.size>0);r.endsAt=Date.now()-1;r.tick();
 assert.equal(r.finished,true);assert.equal(r.phase,'ended');assert.equal(r.sessions.size,0);assert.equal(r.machineLocks.size,0);
});


test('outfit changes are synchronized only while not ready',()=>{
 const r=new GameRoom('LOOK');const q=peer();const p=r.join(q,{name:'QA',session:'look-session'});
 r.handle(q,{type:'outfit',outfit:'neon_runner'});
 assert.equal(p.outfit,'neon_runner');
 assert.equal(r.publicPlayer(p).outfit,'neon_runner');
 p.ready=true;r.handle(q,{type:'outfit',outfit:'midnight_fit'});
 assert.equal(p.outfit,'neon_runner');
 assert.equal(lastError(q),'OUTFIT_LOCKED_READY');
 p.ready=false;r.handle(q,{type:'outfit',outfit:'midnight_fit'});
 assert.equal(p.outfit,'midnight_fit');
});

test('server rejects unknown outfits',()=>{
 const r=new GameRoom('LOOK2');const q=peer();const p=r.join(q,{name:'QA',session:'look2-session'});
 const before=p.outfit;r.handle(q,{type:'outfit',outfit:'hacked_skin'});
 assert.equal(p.outfit,before);
 assert.equal(lastError(q),'INVALID_OUTFIT');
});
