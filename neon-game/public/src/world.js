import { V3 } from './math.js';

const C={floor:[.12,.15,.18],wall:[.18,.22,.26],trim:[.32,.36,.39],gold:[.7,.55,.18],cyan:[.08,.55,.68],pink:[.7,.12,.42],lime:[.52,.72,.15],red:[.58,.08,.12],black:[.035,.04,.05],wood:[.28,.16,.08],plant:[.08,.3,.12],white:[.72,.75,.78]};
function box(pos,scale,color=C.wall,emissive=0,yaw=0,collide=false){return{shape:'cube',pos,scale,color,emissive,yaw,collide}}
function cyl(pos,scale,color=C.trim,emissive=0,yaw=0,collide=false){return{shape:'cylinder',pos,scale,color,emissive,yaw,collide}}

export class World{
 constructor(){this.static=[];this.colliders=[];this.interactables=[];this.props=[];this.particles=[];this.fx=[];this._build()}
 add(o){this.static.push(o);if(o.collide)this.colliders.push({min:[o.pos[0]-o.scale[0],o.pos[2]-o.scale[2]],max:[o.pos[0]+o.scale[0],o.pos[2]+o.scale[2]]});return o}
 _build(){
   this.add(box([0,-.12,0],[22,.12,18],C.floor));this.add(box([0,4.8,0],[22,.12,18],[.08,.1,.12]));
   // perimeter with generous sight lines
   this.add(box([0,2.4,-18],[22,2.4,.25],C.wall,0,0,true));this.add(box([0,2.4,18],[22,2.4,.25],C.wall,0,0,true));this.add(box([-22,2.4,0],[.25,2.4,18],C.wall,0,0,true));this.add(box([22,2.4,0],[.25,2.4,18],C.wall,0,0,true));
   // entrance tunnel / frame
   this.add(box([-4,2.1,15],[.35,2.1,3],C.trim,0,0,true));this.add(box([4,2.1,15],[.35,2.1,3],C.trim,0,0,true));this.add(box([0,4.1,15],[4,.35,3],C.trim));
   for(let x=-18;x<=18;x+=6){this.add(box([x,4.55,0],[1.9,.05,17],[.22,.25,.28]));this.add(box([x,4.42,0],[.06,.03,16.5],x%12===0?C.cyan:C.pink,4));}
   // center carpet / social spine
   this.add(box([0,.015,0],[3.5,.015,15],[.24,.045,.08]));this.add(box([0,.025,0],[.08,.02,15],C.gold,1));
   // columns + planters
   for(const x of [-15,-9,9,15])for(const z of [-10,9]){this.add(cyl([x,2.2,z],[.42,2.2,.42],[.3,.32,.35],0,0,true));this.add(cyl([x,.35,z+1.1],[.6,.35,.6],C.wood));this.add(cyl([x,.9,z+1.1],[.38,.55,.38],C.plant));}
   // lounge left
   this.add(box([-14,.5,2],[4,.5,1.2],C.wood,0,0,true));this.add(box([-14,1.15,2.8],[4,.65,.2],[.18,.09,.07],0,0,true));
   for(let i=0;i<5;i++){this.add(cyl([-18+i*2,.45,5],[.35,.45,.35],[.24,.13,.12]));this.add(cyl([-18+i*2,.95,5],[.18,.5,.18],C.trim));}
   this.add(box([-14,1.2,6.8],[4,.08,.08],C.pink,5));
   // right service bar
   this.add(box([14,.65,3.5],[5,.65,1.1],[.16,.18,.2],0,0,true));this.add(box([14,1.38,2.7],[5,.08,.12],C.cyan,5));
   for(let i=0;i<6;i++)this.add(cyl([9+i*2,.55,1.2],[.35,.55,.35],[.15,.17,.19]));
   // environmental signage
   this.add(box([0,3.1,-17.65],[6,.6,.08],C.lime,3));this.add(box([-14,2.8,-17.6],[3,.28,.08],C.cyan,3));this.add(box([14,2.8,-17.6],[3,.28,.08],C.pink,3));
   // machines
   this._roulette([-11,0,-7]);this._blackjack([0,0,-8]);this._plinko([11,0,-7]);
   // side divider / arches to create readable zones
   for(const x of [-6,6]){this.add(box([x,1.6,-4],[.2,1.6,5],[.22,.25,.28],0,0,true));this.add(box([x,3.35,-4],[1.4,.16,5],C.gold,0));}
   // decorative props / clutter
   for(let i=0;i<18;i++){const x=-19+(i%9)*4.6,z=11+Math.floor(i/9)*2.2;this.add(box([x,.12,z],[.5,.12,.5],i%2?C.trim:C.wood,0,i*.4));}
   this.interactables.push({id:'roulette',type:'machine',pos:[-11,1.15,-5.1],radius:1.2,label:'Roleta Prismática'});
   this.interactables.push({id:'blackjack',type:'machine',pos:[0,1.15,-5.5],radius:1.2,label:'Blackjack 21'});
   this.interactables.push({id:'plinko',type:'machine',pos:[11,1.25,-5.2],radius:1.2,label:'Plinko Reactor'});
 }
 _roulette([x,y,z]){this.add(cyl([x,.72,z],[2.1,.18,2.1],[.12,.14,.16],0,0,true));this.add(cyl([x,.92,z],[1.35,.08,1.35],C.red,.4));this.add(cyl([x,1.02,z],[.18,.12,.18],C.gold,1.8));for(let i=0;i<12;i++){const a=i/12*Math.PI*2;this.add(box([x+Math.cos(a)*1.7,.72,z+Math.sin(a)*1.7],[.08,.15,.5],i%2?C.black:C.red,.1,a));}}
 _blackjack([x,y,z]){this.add(box([x,.78,z],[2.7,.12,1.8],[.045,.24,.12],0,0,true));this.add(box([x,.9,z-.35],[2.1,.03,.5],C.gold,.8));this.add(box([x,1.5,z-1.55],[2.5,.7,.12],[.08,.1,.12],0,0,true));this.add(box([x,1.55,z-1.40],[1.65,.42,.04],C.cyan,2.5));}
 _plinko([x,y,z]){this.add(box([x,1.45,z],[2.3,1.45,.35],[.08,.11,.15],0,0,true));this.add(box([x,1.5,z+.38],[1.95,1.15,.05],[.18,.22,.28]));for(let r=0;r<6;r++)for(let c=0;c<6+r%2;c++){const px=x-1.5+c*.6+(r%2*.3),py=2.25-r*.32;this.add(cyl([px,py,z+.48],[.06,.06,.06],C.lime,2));}for(let i=0;i<7;i++)this.add(box([x-1.65+i*.55,.45,z+.45],[.03,.35,.2],i%2?C.pink:C.cyan,1.2));this.add(box([x,3.15,z],[2.1,.12,.3],C.pink,2));}

 startMachineFx(type,duration=3200,seed=1){this.fx=this.fx.filter(f=>f.type!==type);this.fx.push({type,t:0,duration:duration/1000,seed:Number(seed)||1,done:false});}
 finishMachineFx(type,result){const f=this.fx.find(x=>x.type===type);if(f){f.result=result;f.done=true;f.t=Math.min(f.t,f.duration-.18)}}
 setProps(list){this.props=list.map(p=>({...p,shape:'cube',scale:[.24,.24,.24],color:C.gold,emissive:.4}));}
 upsertProp(p){let o=this.props.find(x=>x.id===p.id);if(o)Object.assign(o,p);else this.props.push({...p,shape:'cube',scale:[.24,.24,.24],color:C.gold,emissive:.4})}
 emit(pos,color=[.7,.8,.2],count=18){for(let i=0;i<count;i++)this.particles.push({pos:[...pos],vel:[(Math.random()-.5)*4,1+Math.random()*4,(Math.random()-.5)*4],life:.7+Math.random()*.6,color,scale:.035+Math.random()*.045})}
 update(dt){for(const f of this.fx)f.t+=dt;this.fx=this.fx.filter(f=>f.t<f.duration+.45);for(const p of this.props){if(p.holderId)continue;if(p.y>.24||Math.abs(p.vy||0)>.01){p.vy=(p.vy||0)-9.8*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.z+=(p.vz||0)*dt;p.vx=(p.vx||0)*.985;p.vz=(p.vz||0)*.985;if(p.y<.24){p.y=.24;p.vy=Math.abs(p.vy)*.25;if(Math.abs(p.vy)<.2)p.vy=0}}}
   for(const p of this.particles){p.life-=dt;p.vel[1]-=5*dt;p.pos[0]+=p.vel[0]*dt;p.pos[1]+=p.vel[1]*dt;p.pos[2]+=p.vel[2]*dt}this.particles=this.particles.filter(p=>p.life>0)}
 draw(r){for(const o of this.static)r.draw(o);for(const p of this.props)r.draw({shape:'cube',pos:[p.x,p.y,p.z],scale:p.scale||[.24,.24,.24],color:p.color||C.gold,emissive:.5});for(const p of this.particles)r.draw({shape:'cube',pos:p.pos,scale:[p.scale,p.scale,p.scale],color:p.color,emissive:2});for(const f of this.fx){const q=Math.min(1,f.t/f.duration);if(f.type==='roulette'){const a=f.t*10+(f.seed%31);const rad=1.05*(1-q*.7);r.draw({shape:'cylinder',pos:[-11+Math.cos(a)*rad,1.18,-7+Math.sin(a)*rad],scale:[.11,.11,.11],color:[.95,.82,.22],emissive:2.5})}else if(f.type==='plinko'){let x=11+Math.sin(f.t*18+f.seed)*.16+Math.sin(f.t*7+f.seed*.01)*.20;if(f.done&&f.result?.lane!=null){const tx=11-1.65+f.result.lane*.41;x+=(tx-x)*Math.min(1,(q-.82)/.18)}const y=2.8-q*2.05;r.draw({shape:'cylinder',pos:[x,y,-6.48],scale:[.12,.12,.12],color:[.9,.92,.3],emissive:2.2})}}}
 resolvePlayer(pos,radius=.34){let x=pos[0],z=pos[2];for(const c of this.colliders){const qx=Math.max(c.min[0],Math.min(x,c.max[0])),qz=Math.max(c.min[1],Math.min(z,c.max[1]));let dx=x-qx,dz=z-qz,ds=dx*dx+dz*dz;if(ds<radius*radius){if(ds<1e-8){const dl=Math.abs(x-c.min[0]),dr=Math.abs(c.max[0]-x),dt=Math.abs(z-c.min[1]),db=Math.abs(c.max[1]-z),m=Math.min(dl,dr,dt,db);if(m===dl)x=c.min[0]-radius;else if(m===dr)x=c.max[0]+radius;else if(m===dt)z=c.min[1]-radius;else z=c.max[1]+radius}else{const d=Math.sqrt(ds),push=radius-d;x+=dx/d*push;z+=dz/d*push}}}return[x,pos[1],z]}
 findFocus(origin,dir,maxDist=2.35,playerId=null){let best=null,bestT=maxDist;const all=[...this.interactables,...this.props.filter(p=>!p.holderId).map(p=>({id:p.id,type:'prop',pos:[p.x,p.y,p.z],radius:.45,label:'Ficha metálica'}))];for(const o of all){const oc=V3.sub(o.pos,origin),t=V3.dot(oc,dir);if(t<0||t>bestT)continue;const closest=V3.add(origin,V3.scale(dir,t)),d=V3.len(V3.sub(o.pos,closest));if(d<o.radius){best=o;bestT=t}}return best}
}
