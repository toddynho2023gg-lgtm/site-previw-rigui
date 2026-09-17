import crypto from 'node:crypto';
import { GAME, MACHINES, MACHINE_POSITIONS, validateBet, cardValue, clamp } from '../shared/rules.js';
import { hash32, mulberry32, chooseWeighted } from '../shared/rng.js';

const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS=['♠','♥','♦','♣'];

function safeName(v){ return String(v||'Guest').replace(/[^\p{L}\p{N}_ -]/gu,'').slice(0,18)||'Guest'; }
function id(){ return crypto.randomBytes(6).toString('hex'); }

export class GameRoom {
  constructor(code){
    this.code=code; this.clients=new Map(); this.players=new Map();
    this.balance=GAME.START_BALANCE; this.quota=GAME.START_QUOTA; this.tickets=3; this.phase='lobby'; this.ownerId=null;
    this.day=1; this.floor=1; this.runSeed=crypto.randomBytes(12).toString('hex'); this.roundIndex=0;
    this.startedAt=null; this.endsAt=null; this.lastTickAt=Date.now();
    this.machineLocks=new Map(); this.blackjack=new Map(); this.eventId=0; this.finished=false;
    this.props=new Map(Array.from({length:8},(_,i)=>[`prop${i+1}`,{id:`prop${i+1}`,x:-7+i*2,y:.55,z:5+(i%2)*1.4,vx:0,vy:0,vz:0,holderId:null}]));
  }
  remainingMs(){ return this.phase==='running'?Math.max(0,this.endsAt-Date.now()):GAME.ROUND_SECONDS*1000; }
  join(peer,msg){
    const session=String(msg.session||id()).slice(0,64); let player=[...this.players.values()].find(p=>p.session===session);
    if(!player){
      player={id:id(),session,name:safeName(msg.name),x:0,y:0,z:16,yaw:0,vy:0,lastMoveAt:Date.now(),connected:true,ready:false};
      this.players.set(player.id,player); if(!this.ownerId)this.ownerId=player.id;
    } else { player.connected=true; player.name=safeName(msg.name||player.name); }
    this.clients.set(peer,player.id); peer.playerId=player.id; peer.session=session;
    peer.send({type:'welcome',playerId:player.id,session,room:this.code,state:this.publicState()});
    this.broadcast({type:'player_join',player:this.publicPlayer(player)},peer);
    return player;
  }
  leave(peer){ const pid=this.clients.get(peer); this.clients.delete(peer); const p=this.players.get(pid); if(p){p.connected=false;p.disconnectedAt=Date.now();if(pid===this.ownerId){const next=[...this.players.values()].find(x=>x.connected);this.ownerId=next?.id||null;}this.broadcast({type:'player_leave',playerId:pid});this.broadcast({type:'lobby_state',state:this.publicState()});} }
  publicPlayer(p){return {id:p.id,name:p.name,x:p.x,y:p.y,z:p.z,yaw:p.yaw,connected:p.connected,ready:!!p.ready};}
  publicState(){return {room:this.code,phase:this.phase,ownerId:this.ownerId,balance:this.balance,quota:this.quota,tickets:this.tickets,day:this.day,floor:this.floor,remainingMs:this.remainingMs(),players:[...this.players.values()].map(p=>this.publicPlayer(p)),props:[...this.props.values()],finished:this.finished};}
  broadcast(msg,except){ msg.eid=++this.eventId; const s=JSON.stringify(msg); for(const peer of this.clients.keys()) if(peer!==except) peer.send(s); }
  sendState(){ this.broadcast({type:'snapshot',serverTime:Date.now(),state:this.publicState()}); }
  handle(peer,msg){
    const pid=this.clients.get(peer), p=this.players.get(pid); if(!p)return;
    if(msg.type==='ready'){p.ready=!!msg.ready;this.broadcast({type:'lobby_state',state:this.publicState()});return;}
    if(msg.type==='start')return this.startRun(peer,p);
    if(msg.type==='move') return this.move(p,msg);
    if(msg.type==='chat') return this.broadcast({type:'chat',playerId:pid,text:String(msg.text||'').slice(0,120)});
    if(msg.type==='bet') return this.bet(peer,p,msg);
    if(msg.type==='blackjack_action') return this.blackjackAction(peer,p,msg);
    if(msg.type==='prop_pick') return this.propPick(peer,p,msg);
    if(msg.type==='prop_move') return this.propMove(peer,p,msg);
    if(msg.type==='prop_drop') return this.propDrop(peer,p,msg);
    if(msg.type==='ping') return peer.send({type:'pong',t:msg.t,serverTime:Date.now()});
  }
  startRun(peer,p){if(this.phase!=='lobby'||p.id!==this.ownerId)return peer.send({type:'error',message:'NOT_ROOM_OWNER'});const connected=[...this.players.values()].filter(x=>x.connected);if(connected.length>1&&!connected.every(x=>x.ready||x.id===this.ownerId))return peer.send({type:'error',message:'PLAYERS_NOT_READY'});this.phase='running';this.startedAt=Date.now();this.endsAt=this.startedAt+GAME.ROUND_SECONDS*1000;this.lastTickAt=this.startedAt;this.broadcast({type:'room_started',state:this.publicState()});}
  move(p,msg){
    const now=Date.now(), dt=clamp((now-p.lastMoveAt)/1000,0.01,0.25); p.lastMoveAt=now;
    const x=Number(msg.x), y=Number(msg.y), z=Number(msg.z), yaw=Number(msg.yaw);
    if(![x,y,z,yaw].every(Number.isFinite))return;
    const dx=x-p.x,dz=z-p.z,dist=Math.hypot(dx,dz); const max=GAME.PLAYER_MAX_SPEED*dt+0.55;
    if(dist>max){ const k=max/Math.max(dist,0.0001); p.x+=dx*k;p.z+=dz*k; } else {p.x=x;p.z=z;}
    p.y=clamp(y,0,8); p.yaw=yaw;
  }
  rng(machine){return mulberry32(hash32(`${this.runSeed}:${this.day}:${machine}:${this.roundIndex++}`));}
  lockMachine(machine,pid,duration){ const now=Date.now(), l=this.machineLocks.get(machine); if(l&&l.until>now&&l.pid!==pid)return false; this.machineLocks.set(machine,{pid,until:now+duration}); return true; }
  debit(amount,reason,playerId){ if(amount>this.balance)return false; this.balance-=amount; this.broadcast({type:'economy',balance:this.balance,delta:-amount,reason,playerId}); return true; }
  credit(amount,reason,playerId){ amount=Math.max(0,Math.floor(amount)); this.balance+=amount; if(amount>=500)this.tickets++; this.broadcast({type:'economy',balance:this.balance,delta:amount,reason,playerId,tickets:this.tickets}); }
  bet(peer,p,msg){
    if(this.phase!=='running'||this.finished)return peer.send({type:'error',message:'ROUND_NOT_RUNNING'});
    const machine=String(msg.machine); const v=validateBet(this.balance,machine,msg.amount); if(!v.ok)return peer.send({type:'error',message:v.reason});
    const mp=MACHINE_POSITIONS[machine]; if(!mp||Math.hypot(p.x-mp[0],p.z-mp[1])>3.6)return peer.send({type:'error',message:'TOO_FAR_FROM_MACHINE'});
    if(machine==='blackjack'){if(!this.lockMachine(machine,p.id,20000))return peer.send({type:'error',message:'MACHINE_IN_USE'});return this.startBlackjack(peer,p,v.bet);}
    if(!this.lockMachine(machine,p.id,machine==='roulette'?3600:3900)) return peer.send({type:'error',message:'MACHINE_IN_USE'});
    if(!this.debit(v.bet,`${machine}:bet`,p.id))return;
    const rng=this.rng(machine);
    if(machine==='roulette'){
      const pick=msg.choice==='black'?'black':'red'; const n=Math.floor(rng()*37); const red=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]); const color=n===0?'green':red.has(n)?'red':'black';
      this.broadcast({type:'machine_start',machine,playerId:p.id,bet:v.bet,choice:pick,duration:3200});
      setTimeout(()=>{const win=color===pick;if(win)this.credit(v.bet*2,'roulette:win',p.id);this.broadcast({type:'machine_result',machine,playerId:p.id,result:{n,color,win,payout:win?v.bet*2:0}});},3200);
    } else if(machine==='plinko'){
      const mult=chooseWeighted(rng,[{value:0,weight:18},{value:.25,weight:18},{value:.5,weight:22},{value:1,weight:26},{value:2,weight:10},{value:5,weight:5},{value:10,weight:1}]); const lane=Math.floor(rng()*9);
      this.broadcast({type:'machine_start',machine,playerId:p.id,bet:v.bet,duration:3400,visualSeed:Math.floor(rng()*1e9)});
      setTimeout(()=>{const payout=Math.floor(v.bet*mult);if(payout)this.credit(payout,'plinko:payout',p.id);this.broadcast({type:'machine_result',machine,playerId:p.id,result:{mult,lane,payout,win:payout>v.bet}});},3400);
    }
  }
  draw(rng){return {rank:RANKS[Math.floor(rng()*RANKS.length)],suit:SUITS[Math.floor(rng()*SUITS.length)]};}
  startBlackjack(peer,p,bet){
    if(this.blackjack.has(p.id))return peer.send({type:'error',message:'BLACKJACK_ACTIVE'});
    if(!this.debit(bet,'blackjack:bet',p.id))return;
    const rng=this.rng('blackjack'); const hand={bet,rng,player:[this.draw(rng),this.draw(rng)],dealer:[this.draw(rng),this.draw(rng)],state:'playing'}; this.blackjack.set(p.id,hand);
    peer.send({type:'blackjack_state',state:{player:hand.player,dealer:[hand.dealer[0],{rank:'?',suit:'?'}],playerValue:cardValue(hand.player),bet}});
    if(cardValue(hand.player)===21)this.finishBlackjack(peer,p,hand);
  }
  blackjackAction(peer,p,msg){ const h=this.blackjack.get(p.id); if(!h)return; if(msg.action==='hit'){h.player.push(this.draw(h.rng));const val=cardValue(h.player);peer.send({type:'blackjack_state',state:{player:h.player,dealer:[h.dealer[0],{rank:'?',suit:'?'}],playerValue:val,bet:h.bet}});if(val>=21)this.finishBlackjack(peer,p,h);} else if(msg.action==='stand')this.finishBlackjack(peer,p,h); }
  finishBlackjack(peer,p,h){
    while(cardValue(h.dealer)<17)h.dealer.push(this.draw(h.rng)); const pv=cardValue(h.player),dv=cardValue(h.dealer); let result='lose',payout=0;
    if(pv<=21&&(dv>21||pv>dv)){result=pv===21&&h.player.length===2?'blackjack':'win';payout=Math.floor(h.bet*(result==='blackjack'?2.5:2));}
    else if(pv<=21&&pv===dv){result='push';payout=h.bet;}
    if(payout)this.credit(payout,`blackjack:${result}`,p.id); this.blackjack.delete(p.id); this.machineLocks.delete('blackjack');
    peer.send({type:'blackjack_result',result:{player:h.player,dealer:h.dealer,playerValue:pv,dealerValue:dv,result,payout}});
    this.broadcast({type:'machine_result',machine:'blackjack',playerId:p.id,result:{result,payout}});
  }

  propPick(peer,p,msg){const o=this.props.get(String(msg.id));if(!o)return;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d>2.8||o.holderId)return;o.holderId=p.id;this.broadcast({type:'prop_state',prop:o});}
  propMove(peer,p,msg){const o=this.props.get(String(msg.id));if(!o||o.holderId!==p.id)return;const x=Number(msg.x),y=Number(msg.y),z=Number(msg.z);if(![x,y,z].every(Number.isFinite))return;const d=Math.hypot(x-p.x,z-p.z);if(d>3)return;o.x=x;o.y=Math.max(.2,Math.min(4,y));o.z=z;this.broadcast({type:'prop_state',prop:o},peer);}
  propDrop(peer,p,msg){const o=this.props.get(String(msg.id));if(!o||o.holderId!==p.id)return;o.holderId=null;o.vx=Math.max(-9,Math.min(9,Number(msg.vx)||0));o.vy=Math.max(-2,Math.min(9,Number(msg.vy)||0));o.vz=Math.max(-9,Math.min(9,Number(msg.vz)||0));this.broadcast({type:'prop_state',prop:o});}
  tick(){
    const now=Date.now(),dt=Math.min(.1,Math.max(.001,(now-this.lastTickAt)/1000));this.lastTickAt=now;
    for(const o of this.props.values()) if(!o.holderId){
      o.vy=(o.vy||0)-9.8*dt;o.x+=(o.vx||0)*dt;o.y+=(o.vy||0)*dt;o.z+=(o.vz||0)*dt;o.vx=(o.vx||0)*.985;o.vz=(o.vz||0)*.985;
      if(o.y<.24){o.y=.24;o.vy=Math.abs(o.vy)*.22;if(Math.abs(o.vy)<.18)o.vy=0}
      o.x=clamp(o.x,-21.2,21.2);o.z=clamp(o.z,-17.2,17.2);
    }
    if(this.phase==='running'&&!this.finished&&this.remainingMs()<=0){ this.finished=true; this.phase='ended'; const success=this.balance>=this.quota; this.broadcast({type:'round_end',success,balance:this.balance,quota:this.quota}); }
    for(const [id,p] of this.players) if(!p.connected&&now-(p.disconnectedAt||0)>30000)this.players.delete(id);
  }
}
