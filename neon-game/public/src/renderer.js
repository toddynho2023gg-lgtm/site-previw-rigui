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

/* Mobile-safe GLSL ES 3.00: no array constructors or dynamic indexing. */
const FS=`#version 300 es
precision highp float;
precision highp int;
in vec3 vN,vW,vL;
uniform vec3 uColor,uCam;
uniform float uEmissive,uFog,uTime,uMaterial;
out vec4 outColor;
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float gridLine(float x,float freq,float width){float f=abs(fract(x*freq)-.5);return smoothstep(width,0.0,f);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.0,1.0);}
vec3 lightContribution(vec3 worldPos,vec3 normal,vec3 viewDir,vec3 base,float rough,float metallic,vec3 lightPos,vec3 lightColor){
  vec3 d=lightPos-worldPos;float d2=max(dot(d,d),.001);float att=1.0/(1.0+d2*.055);vec3 ld=d*inversesqrt(d2);
  float nd=max(dot(normal,ld),0.0);vec3 diffuse=base*lightColor*nd*att*1.75;
  vec3 h=normalize(ld+viewDir);float shininess=mix(70.0,12.0,rough);float spec=pow(max(dot(normal,h),0.0),shininess);
  return diffuse+lightColor*spec*att*mix(.7,.16,rough)*(1.0+metallic);
}
void main(){
  vec3 n=normalize(vN);vec3 viewDir=normalize(uCam-vW);vec3 base=uColor;
  float mat=uMaterial;float rough=.62;float metallic=.05;
  if(mat>0.5&&mat<1.5){
    float gx=gridLine(vW.x,0.42,.025),gz=gridLine(vW.z,0.42,.025);float grout=max(gx,gz);
    float speck=(hash21(floor(vW.xz*7.0))-.5)*.055;base*=1.0+speck;base=mix(base,base*.55,grout*.5);rough=.78;
  }else if(mat>1.5&&mat<2.5){float p=.5+.5*sin(vW.x*2.4+sin(vW.z*.9));base*=.9+p*.12;rough=.95;}
  else if(mat>2.5&&mat<3.5){rough=.25;metallic=.72;}
  else if(mat>3.5&&mat<4.5){float p=.5+.5*sin(vW.y*10.0+vW.x*.8);base*=.95+p*.035;rough=.72;}
  else if(mat>4.5&&mat<5.5){rough=.9;base*=.94+.05*sin(vW.y*18.0);}
  else if(mat>5.5&&mat<6.5){rough=.5;}
  else if(mat>6.5&&mat<7.5){rough=.15;metallic=.15;}

  vec3 hemi=mix(vec3(.055,.065,.08),vec3(.34,.31,.26),clamp(n.y*.5+.5,0.0,1.0));vec3 c=base*hemi;
  vec3 kd1=normalize(vec3(-.42,.82,.28));float nd1=max(dot(n,kd1),0.0);c+=base*vec3(1.0,.83,.62)*nd1*.72;
  vec3 kd2=normalize(vec3(.55,.48,-.66));float nd2=max(dot(n,kd2),0.0);c+=base*vec3(.26,.43,.52)*nd2*.32;
  c+=lightContribution(vW,n,viewDir,base,rough,metallic,vec3(-11.0,3.1,-6.2),vec3(.72,.19,.13));
  c+=lightContribution(vW,n,viewDir,base,rough,metallic,vec3(11.0,3.2,-6.2),vec3(.06,.48,.58));
  c+=lightContribution(vW,n,viewDir,base,rough,metallic,vec3(0.0,4.2,4.0),vec3(.72,.52,.26));
  vec3 h=normalize(kd1+viewDir);float keySpec=pow(max(dot(n,h),0.0),mix(80.0,10.0,rough));c+=vec3(1.0,.86,.68)*keySpec*mix(.55,.08,rough)*(1.0+metallic*.8);
  c*=clamp(.72+.28*n.y,0.5,1.0);c+=base*uEmissive*1.45;
  float dist=distance(vW,uCam);float fog=1.0-exp(-uFog*uFog*dist*dist);c=mix(c,vec3(.028,.032,.038),clamp(fog,0.0,.72));
  c=aces(c*1.22);c=pow(c,vec3(.92));outColor=vec4(c,1.0);
}`;

/* Last-resort shader deliberately conservative for older/mobile WebGL2 drivers. */
const FS_SAFE=`#version 300 es
precision mediump float;
precision mediump int;
in vec3 vN,vW,vL;
uniform vec3 uColor,uCam;
uniform float uEmissive,uFog,uTime,uMaterial;
out vec4 outColor;
void main(){
  vec3 n=normalize(vN);vec3 lightDir=normalize(vec3(-.35,.85,.28));float nd=max(dot(n,lightDir),0.0);
  vec3 c=uColor*(.36+nd*.78)+uColor*uEmissive*1.2;
  float d=distance(vW,uCam);float fog=clamp(d/95.0,0.0,.58);c=mix(c,vec3(.03,.035,.04),fog);
  c=c/(c+vec3(.8));c=pow(c,vec3(.9));outColor=vec4(c,1.0);
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
function cylinderMesh(gl,seg=28){
  const p=[],n=[],idx=[];for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,x=Math.cos(a),z=Math.sin(a);p.push(x,-1,z,x,1,z);n.push(x,0,z,x,0,z)}for(let i=0;i<seg;i++){const o=i*2;idx.push(o,o+1,o+3,o,o+3,o+2)}
  const bc=p.length/3;p.push(0,-1,0);n.push(0,-1,0);const tc=p.length/3;p.push(0,1,0);n.push(0,1,0);const bs=p.length/3;for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;p.push(Math.cos(a),-1,Math.sin(a));n.push(0,-1,0)}const ts=p.length/3;for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;p.push(Math.cos(a),1,Math.sin(a));n.push(0,1,0)}for(let i=0;i<seg;i++){idx.push(bc,bs+i+1,bs+i);idx.push(tc,ts+i,ts+i+1)}return makeMesh(gl,p,n,idx);
}
function sphereMesh(gl,lat=14,lon=20){
  const p=[],n=[],idx=[];for(let y=0;y<=lat;y++){const phi=y/lat*Math.PI;for(let x=0;x<=lon;x++){const th=x/lon*Math.PI*2,sx=Math.sin(phi)*Math.cos(th),sy=Math.cos(phi),sz=Math.sin(phi)*Math.sin(th);p.push(sx,sy,sz);n.push(sx,sy,sz)}}for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){const a=y*(lon+1)+x,b=a+lon+1;idx.push(a,a+1,b,b,a+1,b+1)}return makeMesh(gl,p,n,idx);
}
const MAT={default:0,stone:1,carpet:2,metal:3,wall:4,velvet:5,skin:6,glass:7};
export class Renderer{
  constructor(canvas){
    this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance',depth:true,stencil:false});if(!this.gl)throw new Error('WebGL2 indisponível');const gl=this.gl;
    this.shaderMode='ADVANCED';
    try{this.p=program(gl,VS,FS)}catch(e){console.warn('[Renderer] Advanced shader failed; using MOBILE_SAFE fallback.',e);this.shaderMode='MOBILE_SAFE';this.p=program(gl,VS,FS_SAFE)}
    this.cube=cubeMesh(gl);this.cyl=cylinderMesh(gl);this.sphere=sphereMesh(gl);this.quality='MEDIUM';this.drawCalls=0;this.start=performance.now();
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);gl.disable(gl.BLEND);
    this.u={model:gl.getUniformLocation(this.p,'uModel'),view:gl.getUniformLocation(this.p,'uView'),proj:gl.getUniformLocation(this.p,'uProj'),color:gl.getUniformLocation(this.p,'uColor'),em:gl.getUniformLocation(this.p,'uEmissive'),cam:gl.getUniformLocation(this.p,'uCam'),fog:gl.getUniformLocation(this.p,'uFog'),scale:gl.getUniformLocation(this.p,'uScale'),mat:gl.getUniformLocation(this.p,'uMaterial'),time:gl.getUniformLocation(this.p,'uTime')};this.resize();
  }
  setQuality(q){this.quality=q;this.resize()}
  resize(){const caps={LOW:.72,MEDIUM:1,HIGH:1.25,ULTRA:1.5};const dpr=Math.min(devicePixelRatio||1,caps[this.quality]||1),w=Math.max(1,Math.floor(innerWidth*dpr)),h=Math.max(1,Math.floor(innerHeight*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}this.gl.viewport(0,0,w,h)}
  begin(camera){const gl=this.gl;this.resize();gl.clearColor(.018,.021,.026,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.p);const dir=[Math.sin(camera.yaw)*Math.cos(camera.pitch),Math.sin(camera.pitch),-Math.cos(camera.yaw)*Math.cos(camera.pitch)],target=[camera.pos[0]+dir[0],camera.pos[1]+dir[1],camera.pos[2]+dir[2]];gl.uniformMatrix4fv(this.u.view,false,lookAt(camera.pos,target));gl.uniformMatrix4fv(this.u.proj,false,perspective(camera.fov,this.canvas.width/this.canvas.height,.055,130));if(this.u.cam)gl.uniform3fv(this.u.cam,camera.pos);if(this.u.fog)gl.uniform1f(this.u.fog,.0125);if(this.u.time)gl.uniform1f(this.u.time,(performance.now()-this.start)/1000);this.drawCalls=0}
  draw(o){const gl=this.gl,m=o.shape==='cylinder'?this.cyl:o.shape==='sphere'?this.sphere:this.cube,s=o.scale||[1,1,1];gl.bindVertexArray(m.vao);gl.uniformMatrix4fv(this.u.model,false,modelMatrix(o.pos,s,o.yaw||0));if(this.u.scale)gl.uniform3fv(this.u.scale,s);gl.uniform3fv(this.u.color,o.color||[.5,.5,.5]);if(this.u.em)gl.uniform1f(this.u.em,o.emissive||0);if(this.u.mat)gl.uniform1f(this.u.mat,MAT[o.material]??0);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);this.drawCalls++}
  end(){this.gl.bindVertexArray(null)}
}
