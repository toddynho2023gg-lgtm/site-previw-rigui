import { Renderer } from './renderer.js';
import { World } from './world.js';
import { PlayerController } from './player.js';
import { NetClient } from './net.js';
import { AudioSystem } from './audio.js';
import { UI } from './ui.js';
import { GAME } from '../../shared/rules.js';

const canvas=document.getElementById('game');
const ui=new UI();
let renderer,world,player,net,audio,state=null,playing=false;
let remote=new Map(),lastMoveSend=0,held=null,lastPropSend=0;
const machinePos={roulette:[-11,1,-7],blackjack:[0,1,-8],plinko:[11,1,-7]};

async function boot(){
  try{
    ui.loadingProgress(.18,'Criando contexto WebGL2…');
    renderer=new Renderer(canvas);
    ui.loadingProgress(.38,'Construindo geometria procedural…');
    world=new World();
    ui.loadingProgress(.58,'Inicializando controller e interação…');
    player=new PlayerController(canvas,world);
    ui.loadingProgress(.74,'Preparando áudio espacial…');
    audio=new AudioSystem(); net=new NetClient();
    bindNet();bindUI();
    ui.loadingProgress(1,'Pronto');
    setTimeout(()=>ui.showMenu(),180);
  }catch(e){console.error(e);document.getElementById('loadText').textContent='Falha: '+e.message}
}
function bindUI(){
  ui.el('rendererInfo').textContent=`Renderer: WebGL2 • fixed simulation 60 Hz • FOV ${GAME.DEFAULT_FOV}°`;
  ui.el('playBtn').onclick=async()=>{const name=ui.el('nameInput').value,room=ui.el('roomInput').value;ui.el('playBtn').disabled=true;ui.el('playBtn').textContent='CONECTANDO…';try{await audio.init();const w=await net.connect({name,room});state=w.state;state.room=w.room;world.setProps(state.props||[]);for(const p of state.players||[])remote.set(p.id,{...p,tx:p.x,ty:p.y,tz:p.z,tyaw:p.yaw});ui.el('roomLabel').textContent=`SALA ${w.room}`;player.enabled=false;if(state.phase==='running')startGameplay();else ui.showLobby(state,net.playerId)}catch(e){ui.toast(e.message,'loss');ui.el('playBtn').disabled=false;ui.el('playBtn').textContent='ENTRAR NO CASSINO'}};
  ui.onBet=(machine,amount,choice)=>{audio.click();net.send('bet',{machine,amount,choice});ui.toast(`Aposta $${amount} enviada`)};
  ui.onBJ=action=>{audio.click();net.send('blackjack_action',{action})};
  ui.el('quality').onchange=e=>renderer.setQuality(e.target.value);
  ui.el('sensitivity').oninput=e=>player.sensitivity=Number(e.target.value)*.01;
  ui.el('fov').oninput=e=>player.fov=Number(e.target.value);
  const close=ui.closeMachine.bind(ui);ui.closeMachine=()=>{close();player.enabled=true;canvas.requestPointerLock?.()};
  ui.el('settingsBtn').addEventListener('click',()=>{player.enabled=false;document.exitPointerLock?.()});ui.el('settingsClose').addEventListener('click',()=>{player.enabled=true;canvas.requestPointerLock?.()});
  ui.el('readyBtn').onclick=()=>{const me=(state?.players||[]).find(p=>p.id===net.playerId);net.send('ready',{ready:!me?.ready})};
  ui.el('startBtn').onclick=()=>net.send('start');
}
function startGameplay(){if(playing)return;playing=true;player.enabled=true;ui.enter();canvas.requestPointerLock?.();last=performance.now();requestAnimationFrame(frame)}
function bindNet(){
  net.on('snapshot',m=>{state=m.state;ui.setState(state);if(state.phase==='lobby')ui.updateLobby(state,net.playerId);if(state.props)for(const p of state.props)world.upsertProp(p);for(const p of state.players||[]){if(p.id===net.playerId)continue;let r=remote.get(p.id);if(!r){r={...p,tx:p.x,ty:p.y,tz:p.z,tyaw:p.yaw};remote.set(p.id,r)}r.tx=p.x;r.ty=p.y;r.tz=p.z;r.tyaw=p.yaw;r.connected=p.connected;r.name=p.name}});
  net.on('lobby_state',m=>{state=m.state;ui.updateLobby(state,net.playerId)});net.on('room_started',m=>{state=m.state;world.setProps(state.props||[]);startGameplay();ui.toast('A run começou. Cinco minutos.','win')});
  net.on('economy',m=>{if(state){state.balance=m.balance;if(m.tickets!=null)state.tickets=m.tickets;ui.setState(state)}const good=m.delta>0;ui.toast(`${good?'+':'-'}$${Math.abs(m.delta).toLocaleString('pt-BR')} • ${humanReason(m.reason)}`,good?'win':'loss');good?audio.win():audio.loss()});
  net.on('machine_start',m=>{world.startMachineFx(m.machine,m.duration,m.visualSeed||Date.now());ui.toast(`${m.machine.toUpperCase()} rodando…`);audio.spatialTone(machinePos[m.machine]||[0,1,0],240,.2,.08)});
  net.on('machine_result',m=>{world.finishMachineFx(m.machine,m.result);const pos=machinePos[m.machine]||[0,1,0];world.emit(pos,m.result.win?[.7,1,.2]:[1,.15,.3],m.result.win?34:14);audio.spatialTone(pos,m.result.win?880:130,.3,.11);if(m.machine==='roulette'){const r=m.result;ui.renderMachine('roulette',{result:`<div class="resultBox">${r.n} • ${String(r.color).toUpperCase()} • ${r.win?'VITÓRIA':'PERDEU'}</div>`})}if(m.machine==='plinko'){const r=m.result;ui.renderMachine('plinko',{result:`<div class="resultBox">${r.mult}× • payout $${r.payout}</div>`})}});
  net.on('blackjack_state',m=>{player.enabled=false;ui.blackjackState(m.state)});net.on('blackjack_result',m=>{ui.blackjackResult(m.result);m.result.payout>m.result.playerValue?audio.win():audio.click()});
  net.on('prop_state',m=>world.upsertProp(m.prop));net.on('error',m=>{ui.toast(errorText(m.message),'loss');audio.loss()});
  net.on('player_join',m=>ui.toast(`${m.player.name} entrou`));net.on('player_leave',m=>{const r=remote.get(m.playerId);if(r)r.connected=false});
  net.on('round_end',m=>ui.end(m.success,m.balance,m.quota));net.on('disconnect',()=>ui.toast('Conexão perdida. Recarregue para reconectar.','loss'));
}
function humanReason(s){return String(s).replace(/[:_]/g,' ')}function errorText(s){return({INSUFFICIENT_FUNDS:'Saldo insuficiente.',MACHINE_IN_USE:'Máquina em uso.',BET_TOO_LOW:'Aposta muito baixa.',BET_TOO_HIGH:'Aposta muito alta.',BLACKJACK_ACTIVE:'Termine a mão atual.',TOO_FAR_FROM_MACHINE:'Chegue mais perto da máquina.',ROUND_NOT_RUNNING:'A run ainda não começou.'}[s]||s)}
function tryInteract(){const cam=player.camera(),focus=world.findFocus(cam.pos,player.forward(),GAME.INTERACT_RANGE,net.playerId);if(held){ui.setPrompt('Q • arremessar objeto');if(player.consumeThrow()){const f=player.forward(),o=world.props.find(p=>p.id===held);if(o){o.holderId=null;o.vx=f[0]*7;o.vy=3+f[1]*2;o.vz=f[2]*7;net.send('prop_drop',{id:o.id,vx:o.vx,vy:o.vy,vz:o.vz})}held=null;audio.interact()}player.consumeInteract();return}
  ui.setPrompt(focus?focus.type==='machine'?`Usar ${focus.label}`:`Pegar ${focus.label}`:'');if(focus&&player.consumeInteract()){audio.interact();if(focus.type==='machine'){player.enabled=false;ui.showMachine(focus.id)}else if(focus.type==='prop'){held=focus.id;const o=world.props.find(p=>p.id===held);if(o)o.holderId=net.playerId;net.send('prop_pick',{id:held})}}else player.consumeInteract()}
function updateHeld(now){if(!held)return;const o=world.props.find(p=>p.id===held);if(!o){held=null;return}const cam=player.camera(),f=player.forward();o.x=cam.pos[0]+f[0]*1.25;o.y=cam.pos[1]+f[1]*1.25-.12;o.z=cam.pos[2]+f[2]*1.25;if(now-lastPropSend>90){lastPropSend=now;net.send('prop_move',{id:o.id,x:o.x,y:o.y,z:o.z})}}
function drawRemote(dt){for(const [id,p] of remote){if(id===net.playerId||!p.connected)continue;p.x+=(p.tx-p.x)*(1-Math.exp(-12*dt));p.y+=(p.ty-p.y)*(1-Math.exp(-12*dt));p.z+=(p.tz-p.z)*(1-Math.exp(-12*dt));let d=((p.tyaw-p.yaw+Math.PI)%(Math.PI*2))-Math.PI;p.yaw+=d*(1-Math.exp(-10*dt));renderer.draw({shape:'cylinder',pos:[p.x,p.y+.78,p.z],scale:[.33,.62,.33],color:[.12,.52,.62],yaw:p.yaw});renderer.draw({shape:'cube',pos:[p.x,p.y+1.55,p.z],scale:[.27,.24,.27],color:[.72,.76,.78],yaw:p.yaw});renderer.draw({shape:'cube',pos:[p.x+Math.sin(p.yaw)*.28,p.y+1.58,p.z-Math.cos(p.yaw)*.28],scale:[.06,.07,.03],color:[.65,1,.25],emissive:2,yaw:p.yaw})}}
let last=performance.now(),acc=0;const STEP=1/60;
function frame(now){if(!playing)return;let dt=Math.min(.05,(now-last)/1000);last=now;acc+=dt;while(acc>=STEP){if(player.enabled)player.update(STEP);world.update(STEP);acc-=STEP}tryInteract();updateHeld(now);const cam=player.camera(),f=player.forward();audio.setListener(cam.pos,f);const speed=Math.hypot(player.vel[0],player.vel[2]);if(player.onGround&&speed>.7)audio.step(speed);if(now-lastMoveSend>50){lastMoveSend=now;net.send('move',{x:player.pos[0],y:player.pos[1],z:player.pos[2],yaw:player.yaw})}renderer.begin(cam);world.draw(renderer);drawRemote(dt);renderer.end();ui.el('net').textContent=`● ${Math.round(net.rtt)} ms • ${renderer.drawCalls} dc`;if(state)ui.setState(state);requestAnimationFrame(frame)}
boot();
