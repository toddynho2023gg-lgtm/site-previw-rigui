import {Renderer} from './renderer.js';import {World} from './world.js';
const r=new Renderer(document.querySelector('#game'));const w=new World();w.setProps(Array.from({length:8},(_,i)=>({id:'p'+i,x:-7+i*2,y:.24,z:5+(i%2)*1.4,holderId:null})));
const cam={pos:[0,2.2,14],yaw:0,pitch:-.05,fov:80};r.begin(cam);w.draw(r);r.end();document.querySelector('#tag').textContent=`WebGL2 OK • ${r.drawCalls} draw calls`;
