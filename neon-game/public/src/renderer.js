import { perspective, lookAt, modelMatrix } from './math.js';
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
const VS=`#version 300 es
precision highp float;layout(location=0)in vec3 aPos;layout(location=1)in vec3 aNormal;uniform mat4 uModel,uView,uProj;out vec3 vN;out vec3 vW;void main(){vec4 w=uModel*vec4(aPos,1.);vW=w.xyz;vN=mat3(uModel)*aNormal;gl_Position=uProj*uView*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vN,vW;uniform vec3 uColor;uniform float uEmissive;uniform vec3 uCam;uniform float uFog;out vec4 outColor;
void main(){
 vec3 n=normalize(vN);vec3 key=normalize(vec3(-.35,.9,.25));float nd=max(dot(n,key),0.);
 vec3 c=uColor*(.58+.24*n.y+nd*.72);
 vec3 lp1=vec3(-11.,3.2,-6.),lp2=vec3(11.,3.2,-6.);vec3 d1=lp1-vW,d2=lp2-vW;float a1=1./(1.+dot(d1,d1)*.045),a2=1./(1.+dot(d2,d2)*.045);
 c+=vec3(.95,.12,.55)*max(dot(n,normalize(d1)),0.)*a1*2.2;c+=vec3(.08,.75,1.)*max(dot(n,normalize(d2)),0.)*a2*2.2;
 c+=uColor*uEmissive*1.45;float d=distance(vW,uCam);float fog=1.-exp(-uFog*uFog*d*d);c=mix(c,vec3(.045,.06,.08),clamp(fog,0.,.68));
 c=c/(c+vec3(.78));c=pow(c,vec3(.82));outColor=vec4(c,1.);
}`;

function cubeMesh(gl){const p=[-1,-1,1, 1,-1,1, 1,1,1, -1,1,1, 1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,-1,1,1,1,1,1,1,-1,1,-1, -1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1, -1,1,1,1,1,1,1,1,-1,-1,1,-1, 1,-1,1,1,-1,-1,1,1,-1,1,1,1, -1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1];const n=[];for(const v of [[0,0,1],[0,0,-1],[0,-1,0],[0,1,0],[1,0,0],[-1,0,0]])for(let i=0;i<4;i++)n.push(...v);const idx=[];for(let f=0;f<6;f++){let o=f*4;idx.push(o,o+1,o+2,o,o+2,o+3)};return makeMesh(gl,p,n,idx)}
function cylinderMesh(gl,seg=20){const p=[],n=[],idx=[];for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,x=Math.cos(a),z=Math.sin(a);p.push(x,-1,z,x,1,z);n.push(x,0,z,x,0,z)}for(let i=0;i<seg;i++){const o=i*2;idx.push(o,o+1,o+3,o,o+3,o+2)}const base=p.length/3;p.push(0,-1,0,0,1,0);n.push(0,-1,0,0,1,0);for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;p.push(Math.cos(a),-1,Math.sin(a),Math.cos(b),-1,Math.sin(b),Math.cos(a),1,Math.sin(a),Math.cos(b),1,Math.sin(b));n.push(0,-1,0,0,-1,0,0,1,0,0,1,0);idx.push(base,base+2+i*4,base+3+i*4,base+1,base+4+i*4,base+5+i*4)}return makeMesh(gl,p,n,idx)}
function makeMesh(gl,p,n,idx){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(n),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);gl.bindVertexArray(null);return{vao,count:idx.length}}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!this.gl)throw new Error('WebGL2 indisponível');const gl=this.gl;this.p=program(gl,VS,FS);this.cube=cubeMesh(gl);this.cyl=cylinderMesh(gl);this.quality='MEDIUM';this.drawCalls=0;gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);this.u={model:gl.getUniformLocation(this.p,'uModel'),view:gl.getUniformLocation(this.p,'uView'),proj:gl.getUniformLocation(this.p,'uProj'),color:gl.getUniformLocation(this.p,'uColor'),em:gl.getUniformLocation(this.p,'uEmissive'),cam:gl.getUniformLocation(this.p,'uCam'),fog:gl.getUniformLocation(this.p,'uFog')};this.resize()}
 setQuality(q){this.quality=q;this.resize()}
 resize(){const dpr=Math.min(devicePixelRatio||1,{LOW:.75,MEDIUM:1,HIGH:1.35,ULTRA:1.7}[this.quality]||1);const w=Math.max(1,Math.floor(innerWidth*dpr)),h=Math.max(1,Math.floor(innerHeight*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}this.gl.viewport(0,0,w,h)}
 begin(camera){const gl=this.gl;this.resize();gl.clearColor(.015,.022,.035,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.p);const dir=[Math.sin(camera.yaw)*Math.cos(camera.pitch),Math.sin(camera.pitch),-Math.cos(camera.yaw)*Math.cos(camera.pitch)];const target=[camera.pos[0]+dir[0],camera.pos[1]+dir[1],camera.pos[2]+dir[2]];gl.uniformMatrix4fv(this.u.view,false,lookAt(camera.pos,target));gl.uniformMatrix4fv(this.u.proj,false,perspective(camera.fov,this.canvas.width/this.canvas.height,.04,150));gl.uniform3fv(this.u.cam,camera.pos);gl.uniform1f(this.u.fog,.018);this.drawCalls=0}
 draw(o){const gl=this.gl,m=o.shape==='cylinder'?this.cyl:this.cube;gl.bindVertexArray(m.vao);gl.uniformMatrix4fv(this.u.model,false,modelMatrix(o.pos,o.scale,o.yaw||0));gl.uniform3fv(this.u.color,o.color||[.5,.5,.5]);gl.uniform1f(this.u.em,o.emissive||0);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);this.drawCalls++}
 end(){}
}
