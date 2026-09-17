export class AudioSystem{
  constructor(){this.ctx=null;this.master=null;this.music=null;this.sfx=null;this.ambience=null;this.reverb=null;this.reverbGain=null;this.stepT=0;this.ambientSources=[];}
  async init(){
    if(this.ctx){await this.ctx.resume();return;}
    const A=window.AudioContext||window.webkitAudioContext;this.ctx=new A();
    this.master=this.ctx.createGain();this.master.gain.value=.72;this.master.connect(this.ctx.destination);
    this.music=this.ctx.createGain();this.music.gain.value=.11;this.music.connect(this.master);
    this.sfx=this.ctx.createGain();this.sfx.gain.value=.62;this.sfx.connect(this.master);
    this.ambience=this.ctx.createGain();this.ambience.gain.value=.16;this.ambience.connect(this.master);
    this.reverb=this.ctx.createConvolver();this.reverb.buffer=this._impulse(1.35,2.4);this.reverbGain=this.ctx.createGain();this.reverbGain.gain.value=.16;this.reverb.connect(this.reverbGain);this.reverbGain.connect(this.master);
    this._ambient();await this.ctx.resume();
  }
  _impulse(seconds,decay){const len=Math.floor(this.ctx.sampleRate*seconds),b=this.ctx.createBuffer(2,len,this.ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}return b;}
  tone(freq=440,dur=.12,type='sine',gain=.15,bus=this.sfx,when=0,wet=.05){
    if(!this.ctx)return;const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(bus||this.master);if(wet&&this.reverb){const s=this.ctx.createGain();s.gain.value=wet;g.connect(s);s.connect(this.reverb);}o.start(t);o.stop(t+dur+.03);
  }
  click(){this.tone(690,.045,'square',.045,this.sfx,0,.03);this.tone(1220,.025,'triangle',.018,this.sfx,.018,.02);}
  win(){[392,523,659,784,1047].forEach((f,i)=>this.tone(f,.24,'triangle',.105,this.sfx,i*.055,.16));}
  loss(){this.tone(148,.24,'sawtooth',.075,this.sfx,0,.12);this.tone(92,.36,'triangle',.11,this.sfx,.10,.16);}
  interact(){this.tone(330,.065,'triangle',.047,this.sfx,0,.05);}
  roomStart(){[196,247,294,392].forEach((f,i)=>this.tone(f,.45,'triangle',.055,this.music,i*.06,.22));}
  step(speed){
    if(!this.ctx)return;const now=this.ctx.currentTime;if(now<this.stepT)return;this.stepT=now+(speed>6?.27:.40);
    const o=this.ctx.createOscillator(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();o.type='triangle';o.frequency.value=62+Math.random()*18;f.type='lowpass';f.frequency.value=230+Math.random()*80;g.gain.setValueAtTime(.043,now);g.gain.exponentialRampToValueAtTime(.0001,now+.085);o.connect(f);f.connect(g);g.connect(this.sfx);o.start(now);o.stop(now+.09);
    const o2=this.ctx.createOscillator(),g2=this.ctx.createGain();o2.type='square';o2.frequency.value=145+Math.random()*35;g2.gain.setValueAtTime(.014,now);g2.gain.exponentialRampToValueAtTime(.0001,now+.028);o2.connect(g2);g2.connect(this.sfx);o2.start(now);o2.stop(now+.035);
  }
  setListener(pos,forward){
    if(!this.ctx)return;const l=this.ctx.listener;
    if(l.positionX){l.positionX.value=pos[0];l.positionY.value=pos[1];l.positionZ.value=pos[2];l.forwardX.value=forward[0];l.forwardY.value=forward[1];l.forwardZ.value=forward[2];l.upX.value=0;l.upY.value=1;l.upZ.value=0;}
    else{l.setPosition(pos[0],pos[1],pos[2]);l.setOrientation(forward[0],forward[1],forward[2],0,1,0);}
  }
  spatialTone(pos,freq=440,dur=.18,gain=.09){
    if(!this.ctx)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain(),p=this.ctx.createPanner();o.type='triangle';o.frequency.value=freq;p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=1.5;p.maxDistance=34;p.rolloffFactor=1.15;
    if(p.positionX){p.positionX.value=pos[0];p.positionY.value=pos[1];p.positionZ.value=pos[2];}else p.setPosition(pos[0],pos[1],pos[2]);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(p);p.connect(this.sfx);if(this.reverb){const s=this.ctx.createGain();s.gain.value=.11;p.connect(s);s.connect(this.reverb);}o.start(t);o.stop(t+dur+.03);
  }
  _noiseBuffer(seconds=2){const b=this.ctx.createBuffer(1,this.ctx.sampleRate*seconds,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);return b;}
  _ambient(){
    const ctx=this.ctx;
    const low=ctx.createBufferSource(),lf=ctx.createBiquadFilter(),lg=ctx.createGain();low.buffer=this._noiseBuffer(3);low.loop=true;lf.type='lowpass';lf.frequency.value=125;lg.gain.value=.025;low.connect(lf);lf.connect(lg);lg.connect(this.ambience);low.start();this.ambientSources.push(low);
    const air=ctx.createBufferSource(),af=ctx.createBiquadFilter(),ag=ctx.createGain();air.buffer=this._noiseBuffer(2);air.loop=true;af.type='bandpass';af.frequency.value=850;af.Q.value=.6;ag.gain.value=.008;air.connect(af);af.connect(ag);ag.connect(this.ambience);air.start();this.ambientSources.push(air);
    this.tone(54,999,'sine',.008,this.ambience,0,.02);this.tone(81,999,'sine',.004,this.ambience,0,.02);
  }
}
