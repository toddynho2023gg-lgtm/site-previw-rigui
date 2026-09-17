import { V3 } from './math.js';

const C={
  floor:[.085,.09,.10],floor2:[.15,.145,.135],wall:[.23,.205,.18],wallDark:[.105,.11,.12],trim:[.36,.29,.18],gold:[.62,.44,.16],goldSoft:[.42,.31,.16],
  burgundy:[.34,.035,.055],red:[.54,.055,.075],teal:[.035,.25,.27],cyan:[.035,.42,.50],green:[.035,.18,.09],wood:[.20,.115,.06],plant:[.04,.20,.075],
  ivory:[.58,.54,.47],white:[.74,.72,.68],black:[.025,.028,.032],blue:[.055,.13,.22],skin:[.58,.39,.29],lime:[.48,.66,.12]
};
function box(pos,scale,color=C.wall,emissive=0,yaw=0,collide=false,material='default',extra={}){return{shape:'cube',pos,scale,color,emissive,yaw,collide,material,...extra};}
function cyl(pos,scale,color=C.trim,emissive=0,yaw=0,collide=false,material='default',extra={}){return{shape:'cylinder',pos,scale,color,emissive,yaw,collide,material,...extra};}
function sphere(pos,scale,color=C.white,emissive=0,material='default',extra={}){return{shape:'sphere',pos,scale,color,emissive,material,...extra};}

export class World{
  constructor(){this.static=[];this.colliders=[];this.interactables=[];this.props=[];this.particles=[];this.fx=[];this._build();}
  add(o){
    this.static.push(o);
    if(o.collide){this.colliders.push({min:[o.pos[0]-o.scale[0],o.pos[2]-o.scale[2]],max:[o.pos[0]+o.scale[0],o.pos[2]+o.scale[2]]});}
    return o;
  }
  _build(){
    this._architecture();this._ceiling();this._lounge();this._bar();this._machines();this._decor();
    this.interactables.push({id:'roulette',type:'machine',pos:[-11,1.12,-5.15],radius:1.25,label:'Roleta Royale'});
    this.interactables.push({id:'blackjack',type:'machine',pos:[0,1.12,-5.55],radius:1.25,label:'Blackjack Privé'});
    this.interactables.push({id:'plinko',type:'machine',pos:[11,1.26,-5.18],radius:1.25,label:'Plinko Vault'});
  }
  _architecture(){
    this.add(box([0,-.10,0],[22,.10,18],C.floor,0,0,false,'stone'));
    this.add(box([0,.016,2.2],[3.15,.016,14.8],C.burgundy,0,0,false,'carpet'));
    this.add(box([0,.034,2.2],[.055,.018,14.7],C.goldSoft,.15,0,false,'metal'));
    this.add(box([-11,.014,-7],[5.2,.014,4.7],[.115,.105,.095],0,0,false,'stone'));
    this.add(box([0,.014,-8],[4.65,.014,4.4],[.12,.108,.095],0,0,false,'stone'));
    this.add(box([11,.014,-7],[5.2,.014,4.7],[.115,.105,.095],0,0,false,'stone'));

    this.add(box([0,2.5,-18],[22,2.5,.28],C.wallDark,0,0,true,'wall'));
    this.add(box([0,2.5,18],[22,2.5,.28],C.wallDark,0,0,true,'wall'));
    this.add(box([-22,2.5,0],[.28,2.5,18],C.wallDark,0,0,true,'wall'));
    this.add(box([22,2.5,0],[.28,2.5,18],C.wallDark,0,0,true,'wall'));

    for(const z of [-17.68,17.68]){this.add(box([0,.68,z],[21.7,.68,.08],C.wall,0,0,false,'wall'));this.add(box([0,1.38,z],[21.7,.035,.10],C.gold,.2,0,false,'metal'));}
    for(const x of [-21.68,21.68]){this.add(box([x,.68,0],[.08,.68,17.7],C.wall,0,0,false,'wall'));this.add(box([x,1.38,0],[.10,.035,17.7],C.gold,.2,0,false,'metal'));}

    for(let x=-18;x<=18;x+=6){
      this.add(box([x,2.85,-17.62],[2.35,1.05,.05],[.17,.155,.14],0,0,false,'wall'));
      this.add(box([x,2.85,17.62],[2.35,1.05,.05],[.16,.15,.135],0,0,false,'wall'));
      this.add(box([x,3.92,-17.58],[2.42,.035,.075],C.goldSoft,.08,0,false,'metal'));
      this.add(box([x,1.78,-17.58],[2.42,.035,.075],C.goldSoft,.08,0,false,'metal'));
    }
    for(let z=-14;z<=14;z+=7){
      this.add(box([-21.62,2.8,z],[.05,1.0,2.55],[.17,.155,.14],0,0,false,'wall'));
      this.add(box([21.62,2.8,z],[.05,1.0,2.55],[.17,.155,.14],0,0,false,'wall'));
    }

    this.add(box([-4.5,2.15,15.25],[.42,2.15,2.55],C.wall,0,0,true,'wall'));
    this.add(box([4.5,2.15,15.25],[.42,2.15,2.55],C.wall,0,0,true,'wall'));
    this.add(box([0,4.26,15.25],[4.92,.24,2.55],C.wall,0,0,false,'wall'));
    this.add(box([0,3.82,13.00],[4.1,.08,.10],C.gold,1.2,0,false,'metal'));
    this.add(box([0,3.25,12.94],[2.2,.38,.06],C.ivory,.18,0,false,'wall'));

    for(const x of [-6.3,6.3])for(const z of [10.5,3.5,-4.0,-11.2]){
      this.add(cyl([x,2.25,z],[.43,2.25,.43],[.22,.20,.18],0,0,true,'stone'));
      this.add(cyl([x,.22,z],[.58,.22,.58],C.goldSoft,.08,0,false,'metal'));
      this.add(cyl([x,4.28,z],[.53,.16,.53],C.goldSoft,.10,0,false,'metal'));
    }

    for(const x of [-6.15,6.15]){
      this.add(box([x,1.42,-8.6],[.18,1.42,4.2],[.16,.15,.14],0,0,true,'wall'));
      this.add(box([x,3.10,-8.6],[.26,.18,4.2],C.goldSoft,.13,0,false,'metal'));
    }

    this.add(box([0,3.12,-17.56],[5.4,.72,.06],[.20,.13,.08],0,0,false,'wall'));
    this.add(box([0,3.12,-17.47],[4.75,.49,.035],C.gold,.36,0,false,'metal'));
    this.add(box([0,3.12,-17.40],[4.15,.30,.025],C.black,0,0,false,'default'));
  }
  _ceiling(){
    this.add(box([0,4.92,0],[22,.08,18],[.075,.078,.082],0,0,false,'wall'));
    for(let x=-18;x<=18;x+=6)this.add(box([x,4.74,0],[.10,.10,17.6],C.goldSoft,.06,0,false,'metal'));
    for(let z=-14;z<=14;z+=7)this.add(box([0,4.73,z],[21.6,.09,.10],C.goldSoft,.05,0,false,'metal'));
    for(const x of [-15,-9,-3,3,9,15])for(const z of [-13,-6,1,8,14])this.add(box([x,4.62,z],[1.25,.035,.10],[.92,.66,.32],1.9,0,false,'default'));
    for(const z of [5.2,-8.7]){
      this.add(cyl([0,4.15,z],[1.18,.055,1.18],C.gold,.35,0,false,'metal'));
      this.add(cyl([0,3.86,z],[.74,.035,.74],[.92,.62,.25],2.4,0,false,'metal',{flicker:true}));
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;this.add(sphere([Math.cos(a)*.68,3.74,z+Math.sin(a)*.68],[.075,.075,.075],[1,.72,.36],2.2,'default',{flicker:true}));}
    }
  }
  _lounge(){
    this.add(box([-15.2,.43,5.5],[4.5,.43,1.28],[.16,.055,.065],0,0,true,'velvet'));
    this.add(box([-15.2,1.06,6.55],[4.5,.63,.22],[.22,.07,.075],0,0,true,'velvet'));
    this.add(box([-19.35,.95,5.5],[.25,.62,1.15],[.22,.07,.075],0,0,true,'velvet'));
    this.add(box([-11.05,.95,5.5],[.25,.62,1.15],[.22,.07,.075],0,0,true,'velvet'));
    for(const x of [-18,-15.2,-12.4]){
      this.add(cyl([x,.38,2.9],[.62,.08,.62],C.goldSoft,.08,0,false,'metal'));
      this.add(cyl([x,.23,2.9],[.08,.23,.08],C.goldSoft,0,0,false,'metal'));
      this.add(sphere([x,1.45,7.15],[.13,.13,.13],[.94,.65,.31],2.0,'default',{flicker:true}));
      this.add(cyl([x,1.03,7.15],[.035,.40,.035],C.goldSoft,0,0,false,'metal'));
    }
    this.add(box([-15.2,1.9,7.42],[4.55,.035,.04],C.burgundy,.22,0,false,'default'));
  }
  _bar(){
    this.add(box([15.0,.72,5.15],[5.25,.72,1.15],[.12,.10,.085],0,0,true,'wall'));
    this.add(box([15.0,1.48,4.28],[5.35,.085,1.18],C.goldSoft,.10,0,false,'metal'));
    this.add(box([15.0,.18,4.26],[5.0,.045,.06],C.teal,2.1,0,false,'default'));
    this.add(box([15.0,2.55,7.15],[5.0,1.05,.20],[.10,.095,.09],0,0,false,'wall'));
    for(const y of [1.82,2.45,3.08])this.add(box([15.0,y,6.86],[4.7,.035,.24],C.goldSoft,.08,0,false,'metal'));
    for(let i=0;i<13;i++){
      const x=10.7+(i%7)*1.35,y=1.96+Math.floor(i/7)*.62;
      this.add(cyl([x,y,6.55],[.09,.26,.09],i%3===0?C.red:i%3===1?C.teal:C.gold,.18,0,false,'glass'));
    }
    for(const x of [10.4,12.3,14.2,16.1,18.0]){
      this.add(cyl([x,.48,2.6],[.38,.10,.38],[.10,.095,.09],0,0,false,'velvet'));
      this.add(cyl([x,.25,2.6],[.075,.25,.075],C.goldSoft,0,0,false,'metal'));
    }
  }
  _machines(){this._roulette([-11,0,-7]);this._blackjack([0,0,-8]);this._plinko([11,0,-7]);}
  _roulette([x,y,z]){
    this.add(cyl([x,.12,z],[3.25,.12,3.25],[.105,.095,.085],0,0,false,'stone'));
    this.add(cyl([x,.68,z],[2.45,.46,2.45],C.green,0,0,true,'velvet'));
    this.add(cyl([x,1.14,z],[2.28,.075,2.28],C.goldSoft,.10,0,false,'metal'));
    this.add(cyl([x,1.19,z],[1.28,.085,1.28],C.black,0,0,false,'metal'));
    this.add(cyl([x,1.27,z],[1.12,.065,1.12],C.red,.18,0,false,'velvet'));
    this.add(cyl([x,1.34,z],[.20,.13,.20],C.gold,1.1,0,false,'metal'));
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,rr=1.68;this.add(box([x+Math.cos(a)*rr,1.20,z+Math.sin(a)*rr],[.045,.07,.36],i%2?C.black:C.red,.02,a,false,'default'));}
    for(const px of [-13.2,-11.75,-10.25,-8.8]){this.add(cyl([px,.45,z+2.55],[.34,.10,.34],C.burgundy,0,0,false,'velvet'));this.add(cyl([px,.23,z+2.55],[.06,.23,.06],C.goldSoft,0,0,false,'metal'));}
    this.add(box([x,3.25,z-2.92],[2.55,.38,.07],C.burgundy,.12,0,false,'velvet'));
    this.add(box([x,3.25,z-2.82],[1.85,.12,.035],C.gold,1.2,0,false,'metal'));
  }
  _blackjack([x,y,z]){
    this.add(box([x,.12,z],[3.75,.12,3.15],[.105,.095,.085],0,0,false,'stone'));
    this.add(box([x,.75,z],[3.10,.52,1.95],C.green,0,0,true,'velvet'));
    this.add(box([x,.83,z+1.79],[3.18,.10,.18],C.goldSoft,.12,0,false,'metal'));
    this.add(box([x,.86,z-.36],[2.58,.025,.54],[.035,.12,.07],0,0,false,'velvet'));
    this.add(box([x,1.18,z-1.25],[.58,.30,.40],C.black,0,0,false,'metal'));
    this.add(box([x,1.34,z-1.20],[.38,.035,.25],C.gold,.75,0,false,'metal'));
    for(const px of [-2.15,0,2.15]){this.add(cyl([px,.45,z+2.55],[.42,.12,.42],C.burgundy,0,0,false,'velvet'));this.add(cyl([px,.24,z+2.55],[.07,.24,.07],C.goldSoft,0,0,false,'metal'));this.add(box([px,.92,z+2.82],[.40,.42,.10],C.burgundy,0,0,false,'velvet'));}
    this.add(box([x,3.25,z-2.72],[2.45,.38,.07],C.blue,.10,0,false,'wall'));
    this.add(box([x,3.25,z-2.62],[1.75,.11,.035],C.gold,1.1,0,false,'metal'));
  }
  _plinko([x,y,z]){
    this.add(box([x,.12,z],[3.35,.12,3.15],[.105,.095,.085],0,0,false,'stone'));
    this.add(box([x,1.70,z],[2.45,1.70,.46],[.08,.085,.095],0,0,true,'metal'));
    this.add(box([x,1.73,z+.49],[2.10,1.36,.045],[.10,.12,.13],0,0,false,'wall'));
    this.add(box([x,3.50,z],[2.55,.20,.48],C.teal,.35,0,false,'metal'));
    this.add(box([x,3.50,z+.51],[1.62,.075,.03],C.cyan,1.8,0,false,'default'));
    for(let r=0;r<7;r++)for(let c=0;c<7-(r%2);c++){const px=x-1.55+c*.52+(r%2*.26),py=2.70-r*.34;this.add(sphere([px,py,z+.58],[.055,.055,.055],C.gold,1.0,'metal'));}
    for(let i=0;i<8;i++){const bx=x-1.78+i*.51;this.add(box([bx,.56,z+.56],[.025,.38,.22],C.goldSoft,.06,0,false,'metal'));}
    this.add(box([x,.32,z+1.55],[1.95,.12,.65],[.11,.10,.09],0,0,false,'stone'));
  }
  _decor(){
    for(const [x,z] of [[-19,11.5],[19,11.5],[-19,-12.5],[19,-12.5]]){
      this.add(cyl([x,.30,z],[.72,.30,.72],C.goldSoft,.04,0,false,'metal'));
      this.add(cyl([x,.82,z],[.50,.52,.50],[.08,.10,.06],0,0,false,'stone'));
      this.add(sphere([x,1.48,z],[.62,.82,.62],C.plant,0,'default'));
    }
    for(const side of [-1,1])for(const z of [-13.5,-9.5,-1.0,3.0,11.5]){
      const x=side*19.9;this.add(box([x,1.18,z],[.72,1.18,.92],[.07,.075,.085],0,0,false,'metal'));
      this.add(box([x-side*.74,1.56,z],[.035,.45,.63],side<0?C.teal:C.burgundy,1.05,0,false,'default'));
      this.add(box([x-side*.77,.72,z],[.03,.14,.52],C.gold,.55,0,false,'metal'));
    }
    for(const x of [-4.4,4.4]){this.add(cyl([x,.60,-13.7],[.09,.60,.09],C.goldSoft,.06,0,false,'metal'));this.add(sphere([x,1.18,-13.7],[.13,.13,.13],C.gold,.25,'metal'));}
    this.add(box([0,1.08,-13.7],[4.35,.045,.045],C.burgundy,.08,0,false,'velvet'));
  }

  startMachineFx(type,duration=3200,seed=1){this.fx=this.fx.filter(f=>f.type!==type);this.fx.push({type,t:0,duration:duration/1000,seed:Number(seed)||1,done:false});}
  finishMachineFx(type,result){const f=this.fx.find(x=>x.type===type);if(f){f.result=result;f.done=true;f.t=Math.min(f.t,f.duration-.18);}}
  setProps(list){this.props=list.map((p,i)=>({...p,shape:'cylinder',scale:[.25,.07,.25],color:i%2?C.gold:C.ivory,emissive:.18,material:'metal'}));}
  upsertProp(p){let o=this.props.find(x=>x.id===p.id);if(o)Object.assign(o,p);else this.props.push({...p,shape:'cylinder',scale:[.25,.07,.25],color:C.gold,emissive:.18,material:'metal'});}
  emit(pos,color=[.7,.8,.2],count=18){for(let i=0;i<count;i++)this.particles.push({pos:[...pos],vel:[(Math.random()-.5)*3.4,1+Math.random()*3.6,(Math.random()-.5)*3.4],life:.65+Math.random()*.65,color,scale:.025+Math.random()*.05});}
  update(dt){
    for(const f of this.fx)f.t+=dt;this.fx=this.fx.filter(f=>f.t<f.duration+.45);
    for(const p of this.props){if(p.holderId)continue;if(p.y>.24||Math.abs(p.vy||0)>.01){p.vy=(p.vy||0)-9.8*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;p.z+=(p.vz||0)*dt;p.vx=(p.vx||0)*.985;p.vz=(p.vz||0)*.985;if(p.y<.24){p.y=.24;p.vy=Math.abs(p.vy)*.25;if(Math.abs(p.vy)<.2)p.vy=0;}}}
    for(const p of this.particles){p.life-=dt;p.vel[1]-=5*dt;p.pos[0]+=p.vel[0]*dt;p.pos[1]+=p.vel[1]*dt;p.pos[2]+=p.vel[2]*dt;}this.particles=this.particles.filter(p=>p.life>0);
  }
  draw(r){
    const t=performance.now()*.001;
    for(const o of this.static){if(o.flicker)r.draw({...o,emissive:(o.emissive||1)*(.94+.06*Math.sin(t*5.2+o.pos[0]*.7+o.pos[2]))});else r.draw(o);}
    for(const p of this.props)r.draw({shape:'cylinder',pos:[p.x,p.y,p.z],scale:p.scale||[.25,.07,.25],color:p.color||C.gold,emissive:.22,material:'metal'});
    for(const p of this.particles)r.draw({shape:'sphere',pos:p.pos,scale:[p.scale,p.scale,p.scale],color:p.color,emissive:2.2});
    for(const f of this.fx){
      const q=Math.min(1,f.t/f.duration);
      if(f.type==='roulette'){
        const a=f.t*10+(f.seed%31),rad=1.02*(1-q*.74);r.draw({shape:'sphere',pos:[-11+Math.cos(a)*rad,1.46,-7+Math.sin(a)*rad],scale:[.10,.10,.10],color:[.96,.82,.28],emissive:2.4,material:'metal'});
      }else if(f.type==='plinko'){
        let x=11+Math.sin(f.t*18+f.seed)*.15+Math.sin(f.t*7+f.seed*.01)*.18;if(f.done&&f.result?.lane!=null){const tx=11-1.78+f.result.lane*.51;x+=(tx-x)*Math.min(1,Math.max(0,(q-.80)/.20));}
        const y=2.95-q*2.15;r.draw({shape:'sphere',pos:[x,y,-6.42],scale:[.115,.115,.115],color:[.94,.78,.22],emissive:2.0,material:'metal'});
      }
    }
  }
  resolvePlayer(pos,radius=.34){
    let x=pos[0],z=pos[2];
    for(const c of this.colliders){
      const qx=Math.max(c.min[0],Math.min(x,c.max[0])),qz=Math.max(c.min[1],Math.min(z,c.max[1]));let dx=x-qx,dz=z-qz,ds=dx*dx+dz*dz;
      if(ds<radius*radius){
        if(ds<1e-8){const dl=Math.abs(x-c.min[0]),dr=Math.abs(c.max[0]-x),dt=Math.abs(z-c.min[1]),db=Math.abs(c.max[1]-z),m=Math.min(dl,dr,dt,db);if(m===dl)x=c.min[0]-radius;else if(m===dr)x=c.max[0]+radius;else if(m===dt)z=c.min[1]-radius;else z=c.max[1]+radius;}
        else{const d=Math.sqrt(ds),push=radius-d;x+=dx/d*push;z+=dz/d*push;}
      }
    }
    return[x,pos[1],z];
  }
  findFocus(origin,dir,maxDist=2.35,playerId=null){
    let best=null,bestT=maxDist;const all=[...this.interactables,...this.props.filter(p=>!p.holderId).map(p=>({id:p.id,type:'prop',pos:[p.x,p.y,p.z],radius:.45,label:'Ficha metálica'}))];
    for(const o of all){const oc=V3.sub(o.pos,origin),t=V3.dot(oc,dir);if(t<0||t>bestT)continue;const closest=V3.add(origin,V3.scale(dir,t)),d=V3.len(V3.sub(o.pos,closest));if(d<o.radius){best=o;bestT=t;}}
    return best;
  }
}
