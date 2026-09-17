export const GAME = Object.freeze({
  TICK_HZ:20,SNAPSHOT_HZ:15,ROUND_SECONDS:300,START_BALANCE:1000,START_QUOTA:1200,
  PLAYER_MAX_SPEED:8.5,PLAYER_RADIUS:.34,PLAYER_HEIGHT:1.7,INTERACT_RANGE:2.35,DEFAULT_FOV:80,
});

export const MACHINE_CATALOG = Object.freeze({
  roulette:{label:'Roleta Royale',family:'wheel',pos:[-15,-11],minBet:10,maxBet:1000,cooldownMs:3600,choices:['red','black']},
  blackjack:{label:'Blackjack Privé',family:'cards',pos:[-5,-11],minBet:10,maxBet:1000,cooldownMs:250},
  plinko:{label:'Plinko Vault',family:'board',pos:[5,-11],minBet:10,maxBet:1000,cooldownMs:3800},
  slots:{label:'Golden Slots',family:'arcade',pos:[15,-11],minBet:10,maxBet:1000,cooldownMs:2500},
  craps:{label:'Street Craps',family:'table',pos:[-16,-3],minBet:10,maxBet:1000,cooldownMs:3300,choices:['pass','dont']},
  fortune_wheel:{label:'Fortune Wheel',family:'wheel',pos:[-8,-3],minBet:10,maxBet:1000,cooldownMs:3200},
  duck_race:{label:'Duck Derby',family:'race',pos:[0,-3],minBet:10,maxBet:1000,cooldownMs:5000,choices:['1','2','3','4']},
  pachinko:{label:'Pachinko Crown',family:'board',pos:[8,-3],minBet:10,maxBet:1000,cooldownMs:3600},
  money_wheel:{label:'Money Wheel',family:'wheel',pos:[16,-3],minBet:10,maxBet:1000,cooldownMs:3200},
  penguin_cross:{label:'Penguin Cross',family:'board',pos:[-16,6],minBet:10,maxBet:1000,cooldownMs:3000,choices:['2','3','4','5']},
  keno:{label:'Keno Grid',family:'board',pos:[-8,6],minBet:10,maxBet:1000,cooldownMs:2600,choices:['low','medium','high']},
  crash:{label:'Crash Terminal',family:'arcade',pos:[0,6],minBet:10,maxBet:1000,cooldownMs:250},
  hilo:{label:'HiLo',family:'cards',pos:[8,6],minBet:10,maxBet:1000,cooldownMs:250},
  dragon_tower:{label:'Dragon Tower',family:'tower',pos:[16,6],minBet:10,maxBet:1000,cooldownMs:250},
  minesweeper:{label:'Mine Sweeper',family:'board',pos:[-12,14],minBet:10,maxBet:1000,cooldownMs:250},
  poker:{label:'1P Poker',family:'cards',pos:[-4,14],minBet:10,maxBet:1000,cooldownMs:2800},
  baccarat:{label:'Baccarat',family:'cards',pos:[4,14],minBet:10,maxBet:1000,cooldownMs:3000,choices:['player','banker','tie']},
});
export const MACHINE_POSITIONS = Object.freeze(Object.fromEntries(Object.entries(MACHINE_CATALOG).map(([id,m])=>[id,m.pos])));
export const MACHINES = Object.freeze(Object.fromEntries(Object.entries(MACHINE_CATALOG).map(([id,m])=>[id,{minBet:m.minBet,maxBet:m.maxBet,cooldownMs:m.cooldownMs}])));
export function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
export function money(v){return Math.max(0,Math.floor(Number(v)||0));}
export function validateBet(balance,machine,raw){const cfg=MACHINES[machine];if(!cfg)return{ok:false,reason:'UNKNOWN_MACHINE'};const bet=money(raw);if(bet<cfg.minBet)return{ok:false,reason:'BET_TOO_LOW'};if(bet>cfg.maxBet)return{ok:false,reason:'BET_TOO_HIGH'};if(bet>balance)return{ok:false,reason:'INSUFFICIENT_FUNDS'};return{ok:true,bet};}
export function cardValue(cards){let total=0,aces=0;for(const c of cards){if(c.rank==='A'){total+=11;aces++;}else if(['K','Q','J'].includes(c.rank))total+=10;else total+=Number(c.rank);}while(total>21&&aces>0){total-=10;aces--;}return total;}
