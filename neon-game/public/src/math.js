export const V3={
 add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
 scale:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 len:a=>Math.hypot(a[0],a[1],a[2]), norm:a=>{const l=Math.hypot(...a)||1;return[a[0]/l,a[1]/l,a[2]/l]},
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
};
export function perspective(fovDeg,aspect,near,far){const f=1/Math.tan(fovDeg*Math.PI/360),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
export function lookAt(eye,target,up=[0,1,0]){const z=V3.norm(V3.sub(eye,target)),x=V3.norm(V3.cross(up,z)),y=V3.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V3.dot(x,eye),-V3.dot(y,eye),-V3.dot(z,eye),1]);}
export function modelMatrix(pos=[0,0,0],scale=[1,1,1],yaw=0){const c=Math.cos(yaw),s=Math.sin(yaw);return new Float32Array([c*scale[0],0,-s*scale[0],0,0,scale[1],0,0,s*scale[2],0,c*scale[2],0,pos[0],pos[1],pos[2],1]);}
