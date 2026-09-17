import { perspective, lookAt, modelMatrix } from './math.js';

function compile(gl,type,src){
  const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
    const log=gl.getShaderInfoLog(s)||'Shader compile failed';gl.deleteShader(s);throw new Error(log);
  }
  return s;
}
function program(gl,vs,fs){
  const v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs),p=gl.createProgram();
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const log=gl.getProgramInfoLog(p)||'Program link failed';gl.deleteProgram(p);throw new Error(log)}
  return p;
}

const VS=`#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
uniform mat4 uModel,uView,uProj;
uniform vec3 uScale;
out vec3 vN;out vec3 vW;out vec3 vL;
void main(){
  vec4 w=uModel*vec4(aPos,1.0);vW=w.xyz;
  vec3 ax=normalize(uModel[0].xyz),ay=normalize(uModel[1].xyz),az=normalize(uModel[2].xyz);
  mat3 rot=mat3(ax,ay,az);
  vN=normalize(rot*normalize(aNormal/max(uScale,vec3(.0001))));
  vL=aPos;
  gl_Position=uProj*uView*w;
}`;

const FS=`#version 300 es
precision highp float;
precision highp int;
in vec3 vN,vW,vL;
uniform vec3 uColor,uCam;
uniform float uEmissive,uFog,uTime,uMaterial;
out vec4 outColor;
void main(){
 vec3 n=normalize(vN),v=normalize(uCam-vW);
 vec3 key=normalize(vec3(-.42,.86,.28)),fill=normalize(vec3(.64,.45,-.58));
 float a=max(dot(n,key),0.0),b=max(dot(n,fill),0.0);
 float band=a>.72?1.0:(a>.32?.72:.43);
 float fillBand=b>.45?.16:.07;
 vec3 c=uColor*(.47+band*.72+fillBand);
 float rim=pow(1.0-max(dot(n,v),0.0),2.0);
 c*=1.0-rim*.12;
 if(uMaterial>2.5&&uMaterial<3.5)c+=vec3(.12,.10,.04)*band;
 if(uMaterial>6.5)c+=vec3(.05,.08,.11)*rim;
 c+=uColor*uEmissive*1.20;
 float dist=distance(vW,uCam),fog=1.0-exp(-uFog*uFog*dist*dist);
 c=mix(c,vec3(.055,.075,.11),clamp(fog,0.0,.62));
 float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.16);
 c=c/(c+vec3(.72));c=pow(clamp(c,0.0,1.0),vec3(.88));
 outColor=vec4(c,1.0);
}`;

const FS_SAFE=`#version 300 es
precision mediump float;
precision mediump int;
in vec3 vN,vW,vL;
uniform vec3 uColor,uCam;
uniform float uEmissive,uFog,uTime,uMaterial;
out vec4 outColor;
void main(){
 vec3 n=normalize(vN);vec3 key=normalize(vec3(-.4,.88,.25));
 float a=max(dot(n,key),0.0);float band=a>.68?1.0:(a>.28?.68:.42);
 vec3 c=uColor*(.48+band*.78)+uColor*uEmissive*1.1;
 float d=distance(vW,uCam);float fog=clamp(d/92.0,0.0,.55);c=mix(c,vec3(.055,.075,.11),fog);
 c=c/(c+vec3(.72));c=pow(c,vec3(.9));outColor=vec4(c,1.0);
}`;

function makeMesh(gl,p,n,idx){
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(n),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);gl.bindVertexArray(null);return{vao,count:idx.length};
}
function cubeMesh(gl){
  const faces=[
    [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[0,0,1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[0,0,-1],
    [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],[0,-1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[0,1,0],
    [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[-1,0,0]
  ];
  const p=[],n=[],idx=[];let v=0;for(let f=0;f<faces.length;f+=2){for(const q of faces[f])p.push(...q);for(let i=0;i<4;i++)n.push(...faces[f+1]);idx.push(v,v+1,v+2,v,v+2,v+3);v+=4}return makeMesh(gl,p,n,idx);
}
function cylinderMesh(gl,seg=20){
  const p=[],n=[],idx=[];for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,x=Math.cos(a),z=Math.sin(a);p.push(x,-1,z,x,1,z);n.push(x,0,z,x,0,z)}for(let i=0;i<seg;i++){const o=i*2;idx.push(o,o+1,o+3,o,o+3,o+2)}
  const bc=p.length/3;p.push(0,-1,0);n.push(0,-1,0);const tc=p.length/3;p.push(0,1,0);n.push(0,1,0);const bs=p.length/3;for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;p.push(Math.cos(a),-1,Math.sin(a));n.push(0,-1,0)}const ts=p.length/3;for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;p.push(Math.cos(a),1,Math.sin(a));n.push(0,1,0)}for(let i=0;i<seg;i++){idx.push(bc,bs+i+1,bs+i);idx.push(tc,ts+i,ts+i+1)}return makeMesh(gl,p,n,idx);
}
function sphereMesh(gl,lat=10,lon=14){
  const p=[],n=[],idx=[];for(let y=0;y<=lat;y++){const phi=y/lat*Math.PI;for(let x=0;x<=lon;x++){const th=x/lon*Math.PI*2,sx=Math.sin(phi)*Math.cos(th),sy=Math.cos(phi),sz=Math.sin(phi)*Math.sin(th);p.push(sx,sy,sz);n.push(sx,sy,sz)}}for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){const a=y*(lon+1)+x,b=a+lon+1;idx.push(a,a+1,b,b,a+1,b+1)}return makeMesh(gl,p,n,idx);
}
const MAT={default:0,stone:1,carpet:2,metal:3,wall:4,velvet:5,skin:6,glass:7};
function mobileDevice(){return matchMedia?.('(pointer:coarse)')?.matches||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent||'');}

export class Renderer{
  constructor(canvas){
    this.canvas=canvas;this.mobile=!!mobileDevice();this.contextLost=false;this.safeForced=sessionStorage.getItem('neonSafeGraphics')==='1';
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;sessionStorage.setItem('neonSafeGraphics','1');window.dispatchEvent(new CustomEvent('neon:webgl-lost'));setTimeout(()=>{if(this.contextLost)location.reload()},1100)},{passive:false});
    canvas.addEventListener('webglcontextrestored',()=>{window.dispatchEvent(new CustomEvent('neon:webgl-restored'));setTimeout(()=>location.reload(),120)});
    this.gl=canvas.getContext('webgl2',{antialias:!this.mobile,alpha:false,powerPreference:'high-performance',depth:true,stencil:false,preserveDrawingBuffer:false});
    if(!this.gl)throw new Error('WebGL2 indisponível');const gl=this.gl;
    this.shaderMode=this.safeForced?'MOBILE_SAFE':'ADVANCED';
    if(this.safeForced)this.p=program(gl,VS,FS_SAFE);else try{this.p=program(gl,VS,FS)}catch(e){console.warn('[Renderer] Advanced shader failed; using MOBILE_SAFE fallback.',e);this.shaderMode='MOBILE_SAFE';this.p=program(gl,VS,FS_SAFE)}
    this.cube=cubeMesh(gl);this.cyl=cylinderMesh(gl);this.sphere=sphereMesh(gl);this.quality=this.mobile?'LOW':'MEDIUM';this.drawCalls=0;this.skipped=0;this.staticDrawCalls=0;this.start=performance.now();this.performanceScale=1;
    this.cameraPos=[0,0,0];this.forward2=[0,-1];
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);gl.disable(gl.BLEND);
    this.u={model:gl.getUniformLocation(this.p,'uModel'),view:gl.getUniformLocation(this.p,'uView'),proj:gl.getUniformLocation(this.p,'uProj'),color:gl.getUniformLocation(this.p,'uColor'),em:gl.getUniformLocation(this.p,'uEmissive'),cam:gl.getUniformLocation(this.p,'uCam'),fog:gl.getUniformLocation(this.p,'uFog'),scale:gl.getUniformLocation(this.p,'uScale'),mat:gl.getUniformLocation(this.p,'uMaterial'),time:gl.getUniformLocation(this.p,'uTime')};this.resize();
  }
  setQuality(q){this.quality=String(q||'MEDIUM').toUpperCase();this.performanceScale=1;this.resize()}
  setPerformanceScale(v){this.performanceScale=Math.max(.58,Math.min(1,Number(v)||1))}
  resize(){
    const desktop={LOW:.72,MEDIUM:1,HIGH:1.25,ULTRA:1.5},mobile={LOW:.58,MEDIUM:.76,HIGH:.94,ULTRA:1.05};const caps=this.mobile?mobile:desktop;
    const dpr=Math.min(devicePixelRatio||1,caps[this.quality]||1)*Math.max(.72,this.performanceScale),w=Math.max(1,Math.floor(innerWidth*dpr)),h=Math.max(1,Math.floor(innerHeight*dpr));
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h)}
  }
  begin(camera){
    if(this.contextLost||this.gl.isContextLost?.())return false;const gl=this.gl;this.resize();gl.clearColor(.045,.065,.105,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.p);
    const dir=[Math.sin(camera.yaw)*Math.cos(camera.pitch),Math.sin(camera.pitch),-Math.cos(camera.yaw)*Math.cos(camera.pitch)],target=[camera.pos[0]+dir[0],camera.pos[1]+dir[1],camera.pos[2]+dir[2]];
    this.cameraPos[0]=camera.pos[0];this.cameraPos[1]=camera.pos[1];this.cameraPos[2]=camera.pos[2];this.forward2[0]=Math.sin(camera.yaw);this.forward2[1]=-Math.cos(camera.yaw);
    gl.uniformMatrix4fv(this.u.view,false,lookAt(camera.pos,target));gl.uniformMatrix4fv(this.u.proj,false,perspective(camera.fov,this.canvas.width/this.canvas.height,.055,130));if(this.u.cam)gl.uniform3fv(this.u.cam,camera.pos);if(this.u.fog)gl.uniform1f(this.u.fog,this.mobile?.014:.0125);if(this.u.time)gl.uniform1f(this.u.time,(performance.now()-this.start)/1000);this.drawCalls=0;this.staticDrawCalls=0;this.skipped=0;return true;
  }
  visible(o){
    if(!this.mobile||o.forceVisible)return true;const s=o.scale||[1,1,1],dx=(o.pos?.[0]||0)-this.cameraPos[0],dz=(o.pos?.[2]||0)-this.cameraPos[2],d2=dx*dx+dz*dz;
    const structural=s[0]>3.1||s[2]>3.1||s[1]>2.05;if(structural)return true;
    const base={LOW:12.5,MEDIUM:18,HIGH:26,ULTRA:40}[this.quality]||18,limit=base*this.performanceScale;if(d2>limit*limit)return false;
    if(d2>20){const d=Math.sqrt(d2),dot=(dx*this.forward2[0]+dz*this.forward2[1])/d;if(dot<-.18)return false;}
    const budget={LOW:105,MEDIUM:145,HIGH:190,ULTRA:245}[this.quality]||145;if(o._static&&this.staticDrawCalls>=Math.floor(budget*this.performanceScale))return false;
    return true;
  }
  draw(o){
    if(this.contextLost||!this.visible(o)){this.skipped++;return false}const gl=this.gl,m=o.shape==='cylinder'?this.cyl:o.shape==='sphere'?this.sphere:this.cube,s=o.scale||[1,1,1];gl.bindVertexArray(m.vao);
    let mm=o._static?o._modelCache:null;if(!mm){mm=modelMatrix(o.pos,s,o.yaw||0);if(o._static)o._modelCache=mm}gl.uniformMatrix4fv(this.u.model,false,mm);
    if(this.u.scale)gl.uniform3fv(this.u.scale,s);gl.uniform3fv(this.u.color,o.color||[.5,.5,.5]);if(this.u.em)gl.uniform1f(this.u.em,o.emissive||0);if(this.u.mat)gl.uniform1f(this.u.mat,MAT[o.material]??0);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);this.drawCalls++;if(o._static)this.staticDrawCalls++;return true;
  }
  end(){if(!this.contextLost)this.gl.bindVertexArray(null)}
}
