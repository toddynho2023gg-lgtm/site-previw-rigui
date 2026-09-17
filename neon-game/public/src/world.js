import { MACHINE_CATALOG, MACHINE_POSITIONS } from '../../shared/rules.js';
const C={floor:[.10,.13,.20],floor2:[.18,.22,.32],wall:[.31,.35,.47],wallDark:[.055,.075,.13],gold:[.96,.62,.09],goldSoft:[.72,.38,.07],burgundy:[.62,.06,.15],red:[.88,.11,.16],teal:[.03,.68,.66],cyan:[.03,.72,.82],green:[.05,.45,.20],wood:[.34,.17,.055],ivory:[.93,.84,.65],black:[.025,.035,.06],blue:[.10,.30,.72],purple:[.48,.16,.76],orange:[.96,.34,.04],lime:[.56,.82,.10]};
const ACC={roulette:C.red,blackjack:C.green,plinko:C.cyan,slots:C.gold,craps:C.ivory,fortune_wheel:C.orange,duck_race:[.8,.57,.06],pachinko:C.purple,money_wheel:C.teal,penguin_cross:C.cyan,keno:C.blue,crash:C.red,hilo:C.goldSoft,dragon_tower:[.55,.08,.03],minesweeper:C.lime,poker:C.burgundy,baccarat:C.purple};
function box(pos,scale,color=C.wall,emissive=0,yaw=0,collide=false,material='default',extra={}){return{shape:'cube',pos,scale,color,emissive,yaw,collide,material,...extra};}
function cyl(pos,scale,color=C.goldSoft,emissive=0,yaw=0,collide=false,material='default',extra={}){return{shape:'cylinder',pos,scale,color,emissive,yaw,collide,material,...extra};}
function sph(pos,scale,color=C.ivory,emissive=0,material='default',extra={}){return{shape:'sphere',pos,scale,color,emissive,material,...extra};}
export class World{
 constructor(){this.static=[];this.colliders=[];this.interactables=[];this.props=[];this.particles=[];this.fx=[];this._build();}
 add(o){o._static=true;this.static.push(o);if(o.collide)this.colliders.push({min:[o.pos[0]-o.scale[0],o.pos[2]-o.scale[2]],max:[o.pos[0]+o.scale[0],o.pos[2]+o.scale[2]]});return o;}
 _build(){this._architecture();this._machines();this._decor();for(const [id,m] of Object.entries(MACHINE_CATALOG))this.interactables.push({id,type:'machine',pos:[m.pos[0],1.15,m.pos[1]+1.55],radius:1.15,label:m.label});}
 _architecture(){this.add(box([0,-.10,0],[22,.10,18],C.floor,0,0,false,'stone',{forceVisible:true}));this.add(box([0,.016,1.6],[2.7,.018,15.7],C.burgundy,0,0,false,'carpet',{forceVisible:true}));this.add(box([0,.035,1.6],[.05,.02,15.6],C.gold,.14,0,false,'metal',{forceVisible:true}));for(const x of [-20,-10,0,10,20])this.add(box([x,.012,0],[.025,.014,17.5],C.goldSoft,.06,0,false,'metal',{forceVisible:true}));this.add(box([0,2.5,-18],[22,2.5,.28],C.wallDark,0,0,true,'wall',{forceVisible:true}));this.add(box([0,2.5,18],[22,2.5,.28],C.wallDark,0,0,true,'wall',{forceVisible:true}));this.add(box([-22,2.5,0],[.28,2.5,18],C.wallDark,0,0,true,'wall',{forceVisible:true}));this.add(box([22,2.5,0],[.28,2.5,18],C.wallDark,0,0,true,'wall',{forceVisible:true}));for(const z of [-17.66,17.66]){this.add(box([0,.65,z],[21.7,.65,.07],C.wall,0,0,false,'wall',{forceVisible:true}));this.add(box([0,1.34,z],[21.7,.035,.09],C.gold,.14,0,false,'metal',{forceVisible:true}));}for(const x of [-21.66,21.66]){this.add(box([x,.65,0],[.07,.65,17.7],C.wall,0,0,false,'wall',{forceVisible:true}));this.add(box([x,1.34,0],[.09,.035,17.7],C.gold,.14,0,false,'metal',{forceVisible:true}));}for(const x of [-18,18])for(const z of [-12,4,15]){this.add(cyl([x,2.15,z],[.28,2.15,.28],[.18,.17,.16],0,0,true,'stone'));this.add(cyl([x,.16,z],[.42,.16,.42],C.goldSoft,.08,0,false,'metal'));}this.add(box([0,4.84,0],[22,.08,18],[.055,.058,.065],0,0,false,'wall',{forceVisible:true}));for(const x of [-15,-5,5,15])for(const z of [-12,-4,4,12])this.add(box([x,4.62,z],[1.15,.025,.085],[.9,.62,.30],1.8,0,false,'default'));for(const z of [-8,5]){this.add(cyl([0,4.2,z],[1.05,.05,1.05],C.gold,.25,0,false,'metal'));for(let i=0;i<8;i++){const a=i/8*Math.PI*2;this.add(sph([Math.cos(a)*.72,3.78,z+Math.sin(a)*.72],[.075,.075,.075],[1,.68,.3],2.0));}}this.add(box([0,3.15,17.54],[5.2,.65,.04],[.16,.11,.07],0,0,false,'wall',{forceVisible:true}));this.add(box([0,3.15,17.45],[4.5,.16,.025],C.gold,1.1,0,false,'metal',{forceVisible:true}));}
 _machines(){for(const [id,m] of Object.entries(MACHINE_CATALOG))this._station(id,m);}
 _station(id,m){
  const [x,z]=m.pos,a=ACC[id]||C.goldSoft,f=m.family;
  this.add(cyl([x,.07,z],[2.0,.07,2.0],[.12,.15,.23],0,0,false,'stone'));
  this.add(cyl([x,.15,z],[1.72,.035,1.72],a,.18,0,false,'metal'));
  if(f==='cards'||f==='table'){
    const felt=id==='baccarat'?C.burgundy:C.green;
    this.add(box([x,.58,z],[1.62,.42,1.03],[.12,.15,.22],0,0,true,'wall'));
    this.add(box([x,1.02,z],[1.55,.06,.97],felt,.08,0,false,'velvet'));
    this.add(box([x,1.15,z-.96],[1.22,.32,.12],a,.28,0,false,'metal'));
    this.add(box([x,1.16,z-.81],[.78,.055,.04],C.ivory,.55,0,false,'default'));
    for(const ox of [-.42,0,.42])this.add(cyl([x+ox,1.10,z+.18],[.11,.025,.11],ox===0?C.gold:a,.18,0,false,'metal'));
  }else if(f==='wheel'){
    this.add(cyl([x,.48,z],[1.48,.32,1.48],[.13,.16,.24],0,0,true,'wall'));
    this.add(cyl([x,.84,z],[1.22,.07,1.22],a,.20,0,false,'velvet'));
    this.add(cyl([x,.94,z],[.22,.12,.22],C.gold,.65,0,false,'metal'));
    for(let i=0;i<8;i++){const q=i/8*Math.PI*2;this.add(sph([x+Math.cos(q)*.82,1.00,z+Math.sin(q)*.82],[.085,.085,.085],i%2?C.ivory:C.black,.12));}
    this.add(box([x,1.58,z-.95],[1.15,.28,.12],a,.34,0,false,'metal'));
  }else if(f==='race'){
    this.add(box([x,.42,z],[1.9,.30,1.35],[.12,.19,.24],0,0,true,'wall'));
    for(let lane=0;lane<4;lane++){const lx=x-1.18+lane*.78;this.add(box([lx,.76,z],[.03,.025,1.12],C.ivory,.10,0,false,'default'));this.add(sph([lx,.92,z+.58],[.16,.12,.20],lane%2?a:C.gold,.20,'velvet'));}
    this.add(box([x,1.55,z-1.10],[1.36,.26,.11],a,.34,0,false,'metal'));
  }else if(f==='tower'){
    this.add(box([x,.48,z],[1.25,.38,1.05],[.11,.14,.22],0,0,true,'wall'));
    for(let i=0;i<5;i++){const w=1.05-i*.12;this.add(box([x,.95+i*.34,z],[w,.13,.76],i%2?a:C.goldSoft,.18,0,false,'metal'));}
    this.add(sph([x,2.65,z],[.28,.28,.28],C.gold,.75,'glass'));
  }else{
    this.add(box([x,.72,z],[1.24,.62,.90],[.11,.14,.22],0,0,true,'wall'));
    this.add(box([x,1.43,z+.86],[1.04,.47,.10],a,.26,0,false,'metal'));
    this.add(box([x,1.43,z+.98],[.78,.30,.035],[.06,.10,.16],.18,0,false,'glass'));
    this.add(box([x,2.02,z+.72],[.92,.16,.12],C.gold,.52,0,false,'metal'));
    this.add(cyl([x,1.03,z+.96],[.14,.055,.14],C.gold,.80,0,false,'metal'));
    if(f==='board'){for(let row=0;row<2;row++)for(let col=0;col<3;col++)this.add(sph([x+(col-1)*.28,1.34+row*.25,z+1.03],[.045,.045,.045],col%2?a:C.ivory,.35));}
    if(id==='slots'){for(const ox of [-.43,0,.43])this.add(box([x+ox,1.45,z+1.03],[.16,.23,.03],ox===0?C.red:C.gold,.48,0,false,'glass'));}
    if(id==='plinko'||id==='pachinko'){for(let row=0;row<2;row++)for(let col=0;col<3;col++)this.add(sph([x+(col-1)*.28+(row*.13),1.28+row*.30,z+1.04],[.035,.035,.035],C.ivory,.60));}
    if(id==='crash'){this.add(box([x-.28,1.34,z+1.04],[.05,.07,.025],C.red,.95,.2,false,'default'));this.add(box([x,1.47,z+1.04],[.05,.07,.025],C.red,.95,.45,false,'default'));this.add(box([x+.29,1.62,z+1.04],[.05,.07,.025],C.red,.95,.7,false,'default'));}
  }
 }
 _decor(){for(const x of [-19,-10,10,19]){this.add(cyl([x,.30,11],[.62,.07,.62],C.goldSoft,.08,0,false,'metal'));this.add(cyl([x,.20,11],[.06,.20,.06],C.goldSoft,0,0,false,'metal'));}for(const x of [-20,20])for(const z of [-10,0,10]){this.add(cyl([x,.58,z],[.48,.58,.48],C.wood,0,0,false,'wall'));this.add(sph([x,1.35,z],[.65,.55,.65],[.03,.20,.07],.05,'velvet'));}this.add(box([-18,.48,16],[2.7,.48,.78],C.burgundy,0,0,true,'velvet'));this.add(box([-18,1.05,16.65],[2.7,.55,.16],[.24,.05,.06],0,0,true,'velvet'));this.add(box([18,.65,16],[2.6,.65,.82],C.wood,0,0,true,'wall'));this.add(box([18,1.35,15.25],[2.65,.07,.86],C.goldSoft,.10,0,false,'metal'));}
 setProps(list){this.props=(list||[]).map(p=>({...p}));}
 upsertProp(p){let o=this.props.find(x=>x.id===p.id);if(o)Object.assign(o,p);else this.props.push({...p});}
 findFocus(origin,dir,range,selfId){let best=null,bestT=Infinity;const candidates=[...this.interactables,...this.props.filter(p=>p.holderId!==selfId).map(p=>({id:p.id,type:'prop',pos:[p.x,p.y,p.z],radius:.45,label:'ficha'}))];for(const c of candidates){const vx=c.pos[0]-origin[0],vy=c.pos[1]-origin[1],vz=c.pos[2]-origin[2],t=vx*dir[0]+vy*dir[1]+vz*dir[2];if(t<0||t>range)continue;const px=origin[0]+dir[0]*t,py=origin[1]+dir[1]*t,pz=origin[2]+dir[2]*t,side=Math.hypot(c.pos[0]-px,c.pos[1]-py,c.pos[2]-pz);if(side<(c.radius||.6)&&t<bestT){bestT=t;best=c;}}return best;}
 startMachineFx(machine,duration,seed){if(this.fx.length>6)this.fx.shift();this.fx.push({machine,start:performance.now(),until:performance.now()+Math.max(900,duration||2200),seed});}
 finishMachineFx(machine,result){const p=MACHINE_POSITIONS[machine];if(p)this.emit([p[0],1.7,p[1]],result?.win?[.95,.68,.18]:[.70,.08,.10],result?.win?18:7);}
 emit(pos,color,count=12){const room=Math.max(0,40-this.particles.length),n=Math.min(count,room);for(let i=0;i<n;i++)this.particles.push({pos:[...pos],vel:[(Math.random()-.5)*3,1+Math.random()*3,(Math.random()-.5)*3],life:.6+Math.random()*.8,color});}
 update(dt){let w=0;for(let i=0;i<this.particles.length;i++){const p=this.particles[i];p.vel[1]-=5.5*dt;p.pos[0]+=p.vel[0]*dt;p.pos[1]+=p.vel[1]*dt;p.pos[2]+=p.vel[2]*dt;p.life-=dt;if(p.life>0)this.particles[w++]=p;}this.particles.length=w;const now=performance.now();let fw=0;for(let i=0;i<this.fx.length;i++){const f=this.fx[i];if(f.until>now)this.fx[fw++]=f;}this.fx.length=fw;}
 draw(renderer){const now=performance.now();for(const o of this.static){if(o.flicker){const old=o.emissive;o.emissive=(old||0)*(.9+.1*Math.sin(now*.008+o.pos[0]));renderer.draw(o);o.emissive=old;}else renderer.draw(o);}for(const p of this.props)renderer.draw({shape:'cylinder',pos:[p.x,p.y,p.z],scale:[.18,.055,.18],color:C.gold,emissive:.18,material:'metal'});for(const p of this.particles)renderer.draw({shape:'sphere',pos:p.pos,scale:[.035,.035,.035],color:p.color,emissive:1.4,material:'default'});for(const f of this.fx){const mp=MACHINE_POSITIONS[f.machine];if(!mp)continue;const t=(now-f.start)/1000,a=ACC[f.machine]||C.gold;renderer.draw({shape:'cylinder',pos:[mp[0],2.45+Math.sin(t*7)*.05,mp[1]],scale:[.22,.025,.22],color:a,emissive:1.8,material:'metal'});}}
}
