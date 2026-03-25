// E2: Animated number component — smoothly counts between values
function NumberAnim({value,decimals=2,duration=400,style={},prefix="",suffix=""}){
  const ref=useRef(null);
  const prevVal=useRef(value);
  const animRef=useRef(null);
  useEffect(()=>{
    const from=prevVal.current;const to=value;prevVal.current=value;
    if(from===to||!ref.current)return;
    const start=performance.now();
    const animate=(now)=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3); // ease-out cubic
      const cur=from+(to-from)*eased;
      if(ref.current)ref.current.textContent=prefix+(typeof decimals==='number'?cur.toFixed(decimals):Math.round(cur))+suffix;
      if(t<1)animRef.current=requestAnimationFrame(animate);
    };
    if(animRef.current)cancelAnimationFrame(animRef.current);
    animRef.current=requestAnimationFrame(animate);
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[value,decimals,duration,prefix,suffix]);
  return React.createElement("span",{ref,style},prefix+(typeof decimals==='number'?value.toFixed(decimals):Math.round(value))+suffix);
}

// Sound
function useSound() {
  const ctx = useRef(null);
  const enabled = useRef(true);
  const getCtx = useCallback(()=>{
    if(!ctx.current)try{ctx.current=new(window.AudioContext||window.webkitAudioContext)()}catch{return null}
    if(ctx.current?.state==='suspended')ctx.current.resume();return ctx.current;
  },[]);
  const play = useCallback((t)=>{
    if(!enabled.current)return; const c=getCtx();if(!c)return;const n=c.currentTime;
    try{
      if(t==='tap'){const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(800,n);o.frequency.exponentialRampToValueAtTime(1200,n+.07);g.gain.setValueAtTime(.08,n);g.gain.exponentialRampToValueAtTime(.001,n+.08);o.start(n);o.stop(n+.08)}
      else if(t==='correct'){[523,659,784].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,n+i*.1);g.gain.setValueAtTime(.1,n+i*.1);g.gain.exponentialRampToValueAtTime(.001,n+i*.1+.18);o.start(n+i*.1);o.stop(n+i*.1+.18)})}
      else if(t==='wrong'){const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sawtooth';o.frequency.setValueAtTime(250,n);o.frequency.exponentialRampToValueAtTime(150,n+.2);g.gain.setValueAtTime(.06,n);g.gain.exponentialRampToValueAtTime(.001,n+.25);o.start(n);o.stop(n+.25)}
      else if(t==='ach'){[523,659,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,n+i*.09);g.gain.setValueAtTime(.09,n+i*.09);g.gain.exponentialRampToValueAtTime(.001,n+i*.09+.25);o.start(n+i*.09);o.stop(n+i*.09+.25)})}
      else if(t==='lvl'){[392,523,659,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,n+i*.12);g.gain.setValueAtTime(.1,n+i*.12);g.gain.exponentialRampToValueAtTime(.001,n+i*.12+.35);o.start(n+i*.12);o.stop(n+i*.12+.35)})}
      else if(t==='streak'){[523,659,784,1047,1319].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,n+i*.08);g.gain.setValueAtTime(.12,n+i*.08);g.gain.exponentialRampToValueAtTime(.001,n+i*.08+.3);o.start(n+i*.08);o.stop(n+i*.08+.3)})}
      else if(t==='daily'){[659,784,1047,784,1047,1319].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,n+i*.1);g.gain.setValueAtTime(.1,n+i*.1);g.gain.exponentialRampToValueAtTime(.001,n+i*.1+.25);o.start(n+i*.1);o.stop(n+i*.1+.25)})}
      else if(t==='tick'){const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='square';o.frequency.setValueAtTime(1200,n);g.gain.setValueAtTime(.04,n);g.gain.exponentialRampToValueAtTime(.001,n+.04);o.start(n);o.stop(n+.04)}
      else if(t==='elimination'){[400,300,200,150].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sawtooth';o.frequency.setValueAtTime(f,n+i*.15);g.gain.setValueAtTime(.07,n+i*.15);g.gain.exponentialRampToValueAtTime(.001,n+i*.15+.2);o.start(n+i*.15);o.stop(n+i*.15+.2)})}
      else if(t==='near'){[600,500,600].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,n+i*.06);g.gain.setValueAtTime(.07,n+i*.06);g.gain.exponentialRampToValueAtTime(.001,n+i*.06+.12);o.start(n+i*.06);o.stop(n+i*.06+.12)})}
      else if(t==='whoosh'){const o=c.createOscillator(),g=c.createGain(),f2=c.createBiquadFilter();o.connect(f2);f2.connect(g);g.connect(c.destination);o.type='sawtooth';f2.type='bandpass';f2.frequency.setValueAtTime(800,n);f2.frequency.exponentialRampToValueAtTime(2400,n+.15);f2.Q.setValueAtTime(2,n);o.frequency.setValueAtTime(200,n);o.frequency.exponentialRampToValueAtTime(600,n+.12);g.gain.setValueAtTime(.06,n);g.gain.exponentialRampToValueAtTime(.001,n+.2);o.start(n);o.stop(n+.2)}
      else if(t==='cheer'){[523,659,784,1047,784,1047,1319,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='triangle';o.frequency.setValueAtTime(f,n+i*.06);g.gain.setValueAtTime(.06,n+i*.06);g.gain.exponentialRampToValueAtTime(.001,n+i*.06+.12);o.start(n+i*.06);o.stop(n+i*.06+.12)})}
      else if(t==='jackpot'){[784,988,1175,1319,1175,1319,1568,1319,1568].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,n+i*.07);g.gain.setValueAtTime(.1,n+i*.07);g.gain.exponentialRampToValueAtTime(.001,n+i*.07+.15);o.start(n+i*.07);o.stop(n+i*.07+.15)})}
      // QW5: Baseball-specific replay sounds
      else if(t==='batCrack'){const buf=c.createBuffer(1,c.sampleRate*.08,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.015));const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=buf;s.connect(f);f.connect(g);g.connect(c.destination);f.type='bandpass';f.frequency.setValueAtTime(1000,n);f.Q.setValueAtTime(1.5,n);g.gain.setValueAtTime(.15,n);g.gain.exponentialRampToValueAtTime(.001,n+.1);s.start(n);s.stop(n+.1)}
      else if(t==='glovePop'){const buf=c.createBuffer(1,c.sampleRate*.06,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.01));const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=buf;s.connect(f);f.connect(g);g.connect(c.destination);f.type='bandpass';f.frequency.setValueAtTime(500,n);f.Q.setValueAtTime(2,n);g.gain.setValueAtTime(.12,n);g.gain.exponentialRampToValueAtTime(.001,n+.08);s.start(n);s.stop(n+.08)}
      else if(t==='umpSafe'){[400,500].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,n+i*.12);g.gain.setValueAtTime(.08,n+i*.12);g.gain.exponentialRampToValueAtTime(.001,n+i*.12+.2);o.start(n+i*.12);o.stop(n+i*.12+.2)})}
      else if(t==='umpOut'){[600,400].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(f,n+i*.12);g.gain.setValueAtTime(.08,n+i*.12);g.gain.exponentialRampToValueAtTime(.001,n+i*.12+.2);o.start(n+i*.12);o.stop(n+i*.12+.2)})}
      else if(t==='slideDust'){const buf=c.createBuffer(1,c.sampleRate*.1,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.03));const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=buf;s.connect(f);f.connect(g);g.connect(c.destination);f.type='lowpass';f.frequency.setValueAtTime(2000,n);f.frequency.exponentialRampToValueAtTime(500,n+.08);g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.1);s.start(n);s.stop(n+.1)}
    }catch{}
  },[getCtx]);
  return{play,setEnabled:(v)=>{enabled.current=v}};
}


// === PARTICLE EFFECTS (replaces Confetti) ===
// Extends to support dust, trails, celebration burst — Sprint 4 will add more types
function ParticleFX({active,type="confetti"}){
  if(!active)return null;
  const colors=type==="confetti"
    ?["#22c55e","#f59e0b","#3b82f6","#ef4444","#a855f7","#ec4899","#14b8a6"]
    :type==="celebration"?["#22c55e","#34d399","#4ade80","#86efac","#f59e0b","#fbbf24"]
    :["#c8a060","#b09060","#a07848","#d0b078","#e0c088"]; // dust colors
  const count=type==="confetti"?28:type==="celebration"?20:12;
  const particles=Array.from({length:count},(_,i)=>({
    x:200+Math.cos(i*0.45)*10,y:type==="confetti"?150:280,
    dx:(Math.random()-.5)*(type==="confetti"?8:3),
    dy:type==="confetti"?-(Math.random()*4+2):(Math.random()*1.5+.5),
    c:colors[i%colors.length],
    s:Math.random()*(type==="confetti"?4:3)+(type==="confetti"?2:1.5),
    d:Math.random()*0.6+0.4
  }));
  return(<svg viewBox="0 0 400 310" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:50}}>
    {particles.map((p,i)=>(
      <rect key={i} width={p.s} height={p.s} rx={type==="confetti"?1:p.s/2} fill={p.c} opacity={0.9}>
        <animate attributeName="x" from={p.x} to={p.x+p.dx*40} dur={`${p.d+0.5}s`} fill="freeze"/>
        <animate attributeName="y" from={p.y} to={p.y+p.dy*20+(type==="confetti"?120:30)} dur={`${p.d+0.5}s`} fill="freeze"/>
        <animate attributeName="opacity" from="0.9" to="0" dur={`${p.d+0.5}s`} fill="freeze"/>
        {type==="confetti"&&<animateTransform attributeName="transform" type="rotate" from="0" to={`${Math.random()>0.5?360:-360}`} dur={`${p.d+0.3}s`} fill="freeze"/>}
      </rect>
    ))}
  </svg>);
}

// === FIELD SVG — Full graphics overhaul ===
const Field=React.memo(function Field({runners=[],outcome=null,ak=0,anim=null,animVariant=null,theme=null,avatar=null,pos=null,slow=false}){
  const t=theme||FIELD_THEMES[0];
  const on=n=>runners.includes(n);
  const svgRef=React.useRef(null);
  // AF4: Contextual camera zoom — zoom viewBox to action area in slow/replay mode
  React.useLayoutEffect(()=>{
    if(!slow||!svgRef.current||!anim)return;
    const zoomMap={steal:"140 100 160 160",score:"60 150 200 170",hit:"100 50 250 260",
      doubleplay:"130 100 200 200",groundout:"150 170 180 140",flyout:"100 50 250 200",
      relay:"100 50 250 250",pickoff:"160 150 120 120",bunt:"140 200 150 120"};
    const target=zoomMap[anim];
    if(!target)return;
    const svg=svgRef.current;
    svg.setAttribute('viewBox',target);
    // Animate back to full view after 2s
    setTimeout(()=>{svg.style.transition='all 1.5s ease-in-out';svg.setAttribute('viewBox','0 0 400 310');
      setTimeout(()=>{svg.style.transition=''},1600);
    },2500);
  },[slow,anim,ak]);

  // Game Film slow mode: per-phase pacing (fast-slow-fast) + 1s pre-delay
  // Setup phases (begin<0.15s) = 2x, key moments (0.15-0.5s) = 3.5x, resolution (>0.5s) = 2.5x
  React.useLayoutEffect(()=>{
    if(!slow||!svgRef.current)return;
    const preDelay=1.0;
    svgRef.current.querySelectorAll('animate,animateMotion,animateTransform').forEach(el=>{
      if(el.getAttribute('data-spotlight'))return; // Don't slow the highlight ring
      const rawBegin=parseFloat(el.getAttribute('begin'))||0;
      const rawDur=parseFloat(el.getAttribute('dur'));
      if(isNaN(rawDur))return;
      // Phase-aware speed: setup=fast, key moment=slow, resolution=medium
      const phaseFactor=rawBegin<0.15?2.0:rawBegin<0.5?3.5:2.5;
      const durFactor=rawDur<0.15?1.8:rawDur<0.4?3.0:2.5; // short pulses stay snappy
      const begin=el.getAttribute('begin');
      const dur=el.getAttribute('dur');
      if(begin&&!begin.includes('indefinite')){
        const num=parseFloat(begin);
        if(!isNaN(num))el.setAttribute('begin',(num*phaseFactor+preDelay).toFixed(2)+'s');
      }
      if(dur&&!dur.includes('indefinite')){
        const num=parseFloat(dur);
        if(!isNaN(num))el.setAttribute('dur',(num*durFactor).toFixed(2)+'s');
      }
    });
  },[slow,ak]);

  // Coords: Home(200,290) 1B(290,210) 2B(200,135) 3B(110,210) Mound(200,218)

  // === CROWD GENERATION (deterministic from theme, not random per render) ===
  const crowdDots=React.useMemo(()=>{
    const dots=[];
    const colors=t.crowd||[];
    if(!colors.length)return dots;
    // Seed-based pseudo-random for consistency across renders
    let seed=t.id.charCodeAt(0)*137;
    const rand=()=>{seed=(seed*16807+1)%2147483647;return(seed%1000)/1000;};
    for(let i=0;i<48;i++){
      const progress=i/48;
      // Distribute along the curved wall top
      const x=12+progress*376;
      const baseY=30-Math.sin(progress*Math.PI)*26; // follow wall curve
      const y=baseY-rand()*10-4;
      dots.push({x,y,c:colors[i%colors.length],r:rand()*1.5+1.2,delay:rand()*3});
    }
    return dots;
  },[t.id,t.crowd]);

  // === BANNER PENNANTS (triangular, along wall top) ===
  const bannerPennants=React.useMemo(()=>{
    const banners=t.banner||[];
    if(!banners.length)return[];
    return banners.map((color,i)=>{
      const x=100+i*100; // spread across field
      const baseY=30-Math.sin((x/400)*Math.PI)*26;
      return{x,y:baseY-2,color,i};
    });
  },[t.id,t.banner]);

  return(
    <svg ref={svgRef} viewBox="0 0 400 310" style={{width:"100%",maxWidth:420,display:"block",margin:"0 auto"}}>
      <defs>
        <linearGradient id="drt" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0%" stopColor={t.dirt[0]}/>
          <stop offset="100%" stopColor={t.dirt[1]}/>
        </linearGradient>
        <linearGradient id="wal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.wall[0]}/>
          <stop offset="100%" stopColor={t.wall[1]}/>
        </linearGradient>
        {/* Sky gradient — renders skyTop/skyBot (previously unused!) */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.skyTop||t.sky}/>
          <stop offset="100%" stopColor={t.skyBot||t.sky}/>
        </linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="fc"><path d="M200,295 L5,25 Q5,0 200,0 Q395,0 395,25 Z"/></clipPath>
        <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity=".15"/>
          <stop offset="40%" stopColor="#000" stopOpacity=".03"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </linearGradient>
        <pattern id="grassTex" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="rgba(0,0,0,0)"/>
          <line x1="1" y1="0" x2="1" y2="3" stroke="rgba(0,0,0,.04)" strokeWidth=".5"/>
          <line x1="5" y1="4" x2="5" y2="7" stroke="rgba(255,255,255,.04)" strokeWidth=".5"/>
        </pattern>
        <radialGradient id="mndGrad" cx="45%" cy="40%">
          <stop offset="0%" stopColor={t.mound[0]} stopOpacity="1"/>
          <stop offset="100%" stopColor={t.dirt[1]} stopOpacity="1"/>
        </radialGradient>
      </defs>

      {/* === SKY GRADIENT (behind everything, above wall) === */}
      <rect width="400" height="35" fill="url(#skyGrad)"/>

      {/* === FULL-CANVAS GRASS === */}
      <rect y="30" width="400" height="280" fill={t.grass[0]}/>

      {/* === BOLD MOWING STRIPES (clipped to fan) === */}
      <g clipPath="url(#fc)">
        {[...Array(8)].map((_,i)=><rect key={`m${i}`} x="0" y={35+i*32} width="400" height="32"
          fill={i%2===0?t.grass[2]:"rgba(255,255,255,.07)"} opacity={i%2===0?".14":".08"}/>)}
      </g>

      {/* === GRASS TEXTURE OVERLAY === */}
      <rect width="400" height="310" fill="url(#grassTex)" clipPath="url(#fc)"/>

      {/* === DEPTH DARKENING (outfield fades darker) === */}
      <rect width="400" height="310" fill="url(#depthGrad)" clipPath="url(#fc)"/>

      {/* === CROWD (colored dots — sway normally, cheer on success, still on failure) === */}
      <g opacity={outcome==="success"?".85":outcome?".5":".75"}>
        {crowdDots.map((d,i)=>(
          <circle key={`cr${i}`} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity={outcome&&outcome!=="success"?".4":".7"}
            style={{animation:outcome==="success"?`crowdCheer ${0.8+d.delay*.2}s ease-in-out ${d.delay*.3}s infinite alternate`:outcome?`none`:`crowdSway ${2.5+d.delay*.5}s ease-in-out ${d.delay}s infinite alternate`}}/>
        ))}
      </g>

      {/* === CROWD BACKGROUND (dim band behind crowd) === */}
      <path d="M0,0 L400,0 L400,25 Q200,-2 0,25 Z" fill={t.crowdBg||"rgba(0,0,0,.3)"} opacity=".5"/>

      {/* === OUTFIELD WALL (padded) === */}
      <path d="M0,18 L400,18 L400,32 Q200,4 0,32 Z" fill="url(#wal)"/>
      {/* Wall padding seam lines */}
      {[22,26,30].map(y=><path key={`ws${y}`} d={`M10,${y} Q200,${y-6} 390,${y}`}
        fill="none" stroke="rgba(255,255,255,.06)" strokeWidth=".5"/>)}
      {/* Batter's eye (dark center field section) */}
      <path d="M160,18 L240,18 L240,32 Q200,4 160,32 Z" fill="rgba(0,0,0,.25)"/>

      {/* === BANNER PENNANTS (triangular, team-colored) === */}
      {bannerPennants.map(b=>(
        <g key={`bn${b.i}`} style={{animation:`bannerWave 3s ease-in-out ${b.i*0.7}s infinite alternate`}}>
          <polygon points={`${b.x},${b.y} ${b.x+5},${b.y-10} ${b.x+10},${b.y}`} fill={b.color} opacity=".65"/>
          <line x1={b.x+5} y1={b.y} x2={b.x+5} y2={b.y-12} stroke="rgba(255,255,255,.3)" strokeWidth=".5"/>
        </g>
      ))}

      {/* === WEATHER EFFECTS (per theme) === */}
      {t.id==="sunny"&&<>
        {/* Sun glare gradient in upper-right corner */}
        <circle cx="360" cy="8" r="35" fill="rgba(255,240,120,.12)"/><circle cx="360" cy="8" r="18" fill="rgba(255,250,180,.15)"/>
        <line x1="360" y1="8" x2="340" y2="28" stroke="rgba(255,240,120,.08)" strokeWidth="3"/><line x1="360" y1="8" x2="380" y2="30" stroke="rgba(255,240,120,.06)" strokeWidth="2"/>
      </>}
      {t.id==="spring"&&<>
        {/* Cherry blossom petals falling */}
        {[{x:80,d:4.5},{x:190,d:5.2},{x:300,d:3.8},{x:350,d:6}].map((p,i)=>
          <g key={`bl${i}`} opacity=".6"><ellipse rx="3" ry="2" fill="#f8a0c0">
            <animateMotion dur={`${p.d}s`} begin={`${i*1.3}s`} repeatCount="indefinite" path={`M${p.x},-5 Q${p.x+15},15 ${p.x-10},40`}/>
            <animateTransform attributeName="transform" type="rotate" values="0;180;360" dur={`${p.d*0.7}s`} repeatCount="indefinite"/>
          </ellipse></g>
        )}
      </>}
      {t.id==="winter"&&<>
        {/* Snowflakes falling */}
        {[{x:50,d:5},{x:120,d:4},{x:200,d:6},{x:270,d:4.5},{x:340,d:5.5},{x:80,d:7},{x:310,d:3.8}].map((s,i)=>
          <circle key={`sn${i}`} r={i%2===0?1.5:1} fill="white" opacity=".5">
            <animateMotion dur={`${s.d}s`} begin={`${i*0.8}s`} repeatCount="indefinite" path={`M${s.x},-3 Q${s.x+8},15 ${s.x-5},38`}/>
          </circle>
        )}
      </>}
      {t.id==="worldseries"&&<>
        {/* Subtle confetti/streamers in air */}
        {[{x:60,c:"#f0c010"},{x:150,c:"#e84040"},{x:250,c:"#3888d8"},{x:340,c:"#f0c010"},{x:100,c:"#e84040"}].map((c,i)=>
          <rect key={`wc${i}`} width="2" height="4" rx="1" fill={c.c} opacity=".35">
            <animateMotion dur={`${3+i*0.6}s`} begin={`${i*0.7}s`} repeatCount="indefinite" path={`M${c.x},-4 Q${c.x+12},10 ${c.x-8},35`}/>
            <animateTransform attributeName="transform" type="rotate" values="0;180;360" dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
          </rect>
        )}
      </>}
      {t.id==="allstar"&&<>
        {/* Star sparkles in sky */}
        {[{x:40,y:8},{x:130,y:5},{x:220,y:10},{x:310,y:6},{x:370,y:12}].map((s,i)=>
          <g key={`st${i}`} transform={`translate(${s.x},${s.y})`}>
            <path d="M0,-3 L1,-1 L3,0 L1,1 L0,3 L-1,1 L-3,0 L-1,-1 Z" fill="#f8d020" opacity="0">
              <animate attributeName="opacity" values="0;.6;0" dur={`${1.5+i*0.4}s`} begin={`${i*0.5}s`} repeatCount="indefinite"/>
            </path>
          </g>
        )}
      </>}
      {t.id==="night"&&<>
        {/* Stadium light cones from upper corners */}
        <polygon points="20,0 60,0 200,50 160,50" fill="rgba(255,250,200,.03)"/>
        <polygon points="340,0 380,0 240,50 200,50" fill="rgba(255,250,200,.03)"/>
        {/* Light halos at mound and bases */}
        <circle cx="200" cy="218" r="18" fill="rgba(255,250,200,.04)"/><circle cx="290" cy="210" r="12" fill="rgba(255,250,200,.03)"/>
        <circle cx="110" cy="210" r="12" fill="rgba(255,250,200,.03)"/><circle cx="200" cy="135" r="12" fill="rgba(255,250,200,.03)"/>
      </>}
      {t.id==="sandlot"&&<>
        {/* Dustier dirt texture — extra dust haze over infield */}
        <ellipse cx="200" cy="220" rx="90" ry="50" fill="rgba(192,144,80,.06)"/>
        <ellipse cx="200" cy="250" rx="60" ry="30" fill="rgba(192,144,80,.05)"/>
      </>}
      {t.id==="dome"&&<>
        {/* Ceiling reflection highlights */}
        <rect x="0" y="0" width="400" height="8" fill="rgba(128,128,255,.04)"/>
        <ellipse cx="200" cy="3" rx="120" ry="4" fill="rgba(160,160,240,.06)"/>
        {/* Overhead light bars */}
        {[80,160,240,320].map(x=><rect key={`dl${x}`} x={x-8} y="0" width="16" height="2" rx="1" fill="rgba(200,200,255,.12)"/>)}
      </>}

      {/* === FENCE CAP === */}
      <path d="M0,32 Q200,4 400,32" fill="none" stroke={t.fence} strokeWidth="3"/>

      {/* === WALL SHADOW (cast onto field) === */}
      <path d="M0,34 Q200,6 400,34 L400,40 Q200,12 0,40 Z" fill="rgba(0,0,0,.12)"/>

      {/* === FOUL POLES === */}
      <line x1="12" y1="8" x2="12" y2="34" stroke={t.foulPole} strokeWidth="2" opacity=".8"/>
      <circle cx="12" cy="8" r="2.5" fill={t.foulPole} opacity=".8"/>
      <line x1="388" y1="8" x2="388" y2="34" stroke={t.foulPole} strokeWidth="2" opacity=".8"/>
      <circle cx="388" cy="8" r="2.5" fill={t.foulPole} opacity=".8"/>

      {/* === MINI SCOREBOARD (enhanced with inning indicator) === */}
      <g>
        <rect x="176" y="5" width="48" height="20" rx="2.5" fill={t.scoreBd} stroke={t.fence} strokeWidth=".6"/>
        <text x="200" y="13" textAnchor="middle" fontSize="4" fill={t.scoreTxt} fontWeight="700" fontFamily="monospace" letterSpacing=".5">HOME  AWAY</text>
        {/* Inning dots — fill 4th as "current" */}
        {[0,1,2,3,4,5,6,7,8].map(i=><circle key={`sd${i}`} cx={181+i*4.5} cy={20} r={i===3?1.2:.8} fill={t.scoreTxt} opacity={i<3?".7":i===3?"1":".3"}/>)}
        {/* Score values */}
        <text x="188" y="17" textAnchor="middle" fontSize="5" fill={t.scoreTxt} fontWeight="800" fontFamily="monospace">2</text>
        <text x="212" y="17" textAnchor="middle" fontSize="5" fill={t.scoreTxt} fontWeight="800" fontFamily="monospace">1</text>
      </g>

      {/* === WARNING TRACK === */}
      <path d="M2,36 Q200,8 398,36 L394,44 Q200,16 6,44 Z" fill={t.warn} opacity=".5"/>

      {/* === FOUL LINES === */}
      <line x1="200" y1="290" x2="12" y2="30" stroke="white" strokeWidth="1.8" opacity=".7"/>
      <line x1="200" y1="290" x2="388" y2="30" stroke="white" strokeWidth="1.8" opacity=".7"/>

      {/* === INFIELD DIRT === */}
      <polygon points="200,290 290,210 200,135 110,210" fill="url(#drt)" stroke="#a07030" strokeWidth=".8"/>

      {/* === INFIELD GRASS (brighter than outfield) === */}
      <polygon points="200,268 260,218 200,172 140,218" fill={t.inGrass}/>

      {/* === BASEPATH CHALK === */}
      {[[200,290,290,210],[290,210,200,135],[200,135,110,210],[110,210,200,290]].map(([x1,y1,x2,y2],i)=>
        <line key={`bp${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.18)" strokeWidth="2.8"/>
      )}

      {/* === DIRT CUTOUTS === */}
      <ellipse cx="200" cy="294" rx="18" ry="10" fill="url(#drt)"/>
      <circle cx="290" cy="210" r="12" fill="url(#drt)"/>
      <circle cx="200" cy="135" r="10" fill="url(#drt)"/>
      <circle cx="110" cy="210" r="12" fill="url(#drt)"/>

      {/* === MOUND (shadow + radial highlight) === */}
      <ellipse cx="202" cy="222" rx="16" ry="8" fill="rgba(0,0,0,.1)"/>
      <ellipse cx="200" cy="218" rx="15" ry="7.5" fill="url(#mndGrad)" stroke="#a07030" strokeWidth=".6"/>
      <rect x="196.5" y="216" width="7" height="3" rx="1" fill="white" opacity=".9"/>

      {/* === HOME PLATE & BOXES === */}
      <polygon points="196,286 204,286 204,290 200,294 196,290" fill="white" stroke="#bbb" strokeWidth=".6"/>
      <rect x="182" y="282" width="11" height="16" rx="1.5" fill="none" stroke="white" strokeWidth=".6" opacity=".35"/>
      <rect x="207" y="282" width="11" height="16" rx="1.5" fill="none" stroke="white" strokeWidth=".6" opacity=".35"/>

      {/* === ON-DECK CIRCLES === */}
      <circle cx="160" cy="300" r="5" fill="none" stroke="white" strokeWidth=".5" opacity=".25"/>
      <circle cx="240" cy="300" r="5" fill="none" stroke="white" strokeWidth=".5" opacity=".25"/>

      {/* === BASE SHADOWS === */}
      {[[290,210],[200,135],[110,210]].map(([x,y],i)=>
        <ellipse key={`bs${i}`} cx={x+1} cy={y+3} rx="7" ry="2.5" fill="rgba(0,0,0,.1)"/>
      )}

      {/* === BASES (radial glow when occupied) === */}
      {[[290,210,1],[200,135,2],[110,210,3]].map(([x,y,n])=>(
        <g key={`b${n}`}>
          {on(n)&&<circle cx={x} cy={y} r="0" fill="rgba(59,130,246,.12)">
            <animate attributeName="r" values="14;18;14" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".5;.15;.5" dur="1.8s" repeatCount="indefinite"/>
          </circle>}
          <g transform={`translate(${x},${y}) rotate(45)`}>
            <rect x="-6" y="-6" width="12" height="12" rx="1.2" fill={on(n)?"#3b82f6":"white"} stroke={on(n)?"#60a5fa":"#ccc"} strokeWidth="1.5"/>
          </g>
        </g>
      ))}

      {/* === OUTFIELDERS (home team blue) === */}
      {[["leftField",100,80,7],["centerField",200,58,8],["rightField",300,80,9]].map(([p,x,y,n])=>(
        <Guy key={p} x={x} y={y} o={pos===p?1:.50} ring={pos===p} pose="outfielder" number={pos===p?n:null}/>
      ))}

      {/* === INFIELDERS (home team blue) === */}
      {[["shortstop",152,185,6],["secondBase",248,185,4],["firstBase",278,205,3],["thirdBase",122,205,5]].map(([p,x,y,n])=>(
        <Guy key={p} x={x} y={y} o={pos===p?1:.50} ring={pos===p} pose="infielder" number={pos===p?n:null}/>
      ))}

      {/* === PITCHER (home team — always blue) === */}
      {!outcome&&<Guy x={200} y={212} jersey="#1e40af" cap="#1e3a8a" ring={pos==="pitcher"} pose="pitcher" number={pos==="pitcher"?1:null}/>}

      {/* === UMPIRE (behind home plate, dark uniform) === */}
      <g transform="translate(200,308) scale(0.5)">
        <ellipse cy={12} rx={8} ry="2.5" fill="rgba(0,0,0,.15)"/>
        <path d="M0,4 Q-3,7 -3,10" fill="none" stroke="#222" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M0,4 Q3,7 3,10" fill="none" stroke="#222" strokeWidth="3.5" strokeLinecap="round"/>
        <path d={`M-4,-4 Q-5.5,-0.5 -5,2 L5,2 Q5.5,-0.5 4,-4 Z`} fill="#1a1a2e"/>
        <path d="M-4,-4 Q-6,-8 -4,-12" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M4,-4 Q6,-8 4,-12" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cy={-12} r="5.5" fill="#d4a574"/>
        <ellipse cy={-16} rx="7" ry="3" fill="#111"/>
        <rect x="-7" y={-18} width="14" height="3.5" rx="2" fill="#111"/>
        {/* Umpire gestures on outcome */}
        {outcome==="success"&&(anim==="strike"||anim==="strikeout")&&<path d="M4,-4 Q12,-10 14,-16" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" begin=".4s" fill="freeze"/></path>}
      </g>

      {/* === CATCHER (home team — always blue) === */}
      {!outcome&&<Guy x={200} y={300} jersey="#1e3a5f" cap="#1a3050" ring={pos==="catcher"} pose="catcher" mask={true} number={pos==="catcher"?2:null}/>}

      {/* === BATTER (away team — always red) === */}
      {!outcome&&<Guy x={215} y={285} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" batColor={avatar?AVATAR_OPTS.bat[avatar.b||0]:"#c8a060"} ring={pos==="batter"} pose="batter" number={pos==="batter"?24:null}/>}

      {/* === RUNNERS (away team — always red, golden ring) === */}
      {on(1)&&<Guy x={298} y={200} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" ring={true} pose="runner"/>}
      {on(2)&&<Guy x={200} y={125} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" ring={true} pose="runner"/>}
      {on(3)&&<Guy x={102} y={200} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" ring={true} pose="runner"/>}

      {/* === QW4: Trajectory dashed lines for ball flight (replay mode) === */}
      {slow&&anim&&(()=>{
        const paths={hit:"M200,290 Q252,178 306,75",flyout:"M200,290 Q242,118 282,108",
          groundout:"M200,290 Q220,268 240,250 Q248,242 260,230",relay:"M300,80 Q265,155 248,185",
          doubleplay:"M240,258 Q240,200 200,135",bunt:"M200,290 Q198,272 192,258"};
        const p=paths[anim];
        if(!p)return null;
        return <path d={p} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" strokeDasharray="4,4" opacity="0">
          <animate data-spotlight="true" attributeName="opacity" values="0;.25;.25;0" dur="2s" fill="freeze"/>
        </path>;
      })()}

      {/* === QW3: Pre-animation highlight ring on decision-maker (replay mode) === */}
      {slow&&anim&&(()=>{
        // Map animation type → key player coordinates to highlight
        const hlMap={steal:[298,200],score:[102,200],advance:[298,200],hit:[215,285],bunt:[215,285],
          groundout:[248,185],flyout:[200,58],doubleplay:[152,185],strike:[200,212],strikeout:[200,212],
          throwHome:[200,135],catch:[200,58],relay:[300,80],pickoff:[200,212],squeeze:[102,200],
          wildPitch:[200,300],popup:[200,300],walk:[215,285],hitByPitch:[215,285],tag:[248,185]};
        const hl=hlMap[anim];
        if(!hl)return null;
        return <g data-spotlight="true">
          <circle cx={hl[0]} cy={hl[1]} r="20" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0">
            <animate data-spotlight="true" attributeName="opacity" values="0;.8;.8;0" dur="1.5s" fill="freeze"/>
            <animate data-spotlight="true" attributeName="r" values="16;22;16;22;16" dur="1.5s" fill="freeze"/>
          </circle>
          <circle cx={hl[0]} cy={hl[1]} r="14" fill="rgba(245,158,11,.08)" opacity="0">
            <animate data-spotlight="true" attributeName="opacity" values="0;.4;.4;0" dur="1.5s" fill="freeze"/>
          </circle>
        </g>;
      })()}

      {/* ============ ANIMATIONS — data-driven (AF1) with inline SMIL fallback ============ */}
      {/* AF1: Check ANIM_DATA first. If found, use AnimPhases renderer. Otherwise fall through to inline SMIL. */}
      {(()=>{
        if(!anim||!outcome)return null;
        // AF3+AF5: Check for animation variant (pitch type, position-specific path)
        const pitchVariant=animVariant?anim.replace("out","")+"_"+animVariant:null;
        const dataKey=anim+"_"+outcome;
        const altKey=anim+"_success"; // strikeout uses strike data
        const phases=ANIM_DATA[pitchVariant]||ANIM_DATA[dataKey]||ANIM_DATA[altKey];
        if(phases)return <AnimPhases phases={phases} ak={ak}/>;
        return null; // Fall through to inline SMIL below
      })()}

      {/* Easing: ball-launch 0.12,0.8,0.3,1 | throw 0.15,0.6,0.35,1 | runner 0.4,0,0.2,1 | ground 0.3,0,0.65,1 | fly 0.2,0.7,0.4,1 | gravity 0.6,0,0.8,0.2 | pulse 0.25,0.1,0.25,1 */}
      {outcome&&<circle key={ak} cx="200" cy="215" r="0" fill={outcome==="success"?"rgba(34,197,94,.18)":outcome==="warning"?"rgba(245,158,11,.12)":"rgba(239,68,68,.12)"}><animate attributeName="r" from="0" to="180" dur=".55s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.25 0.1 0.25 1"/><animate attributeName="opacity" from=".5" to="0" dur=".55s" fill="freeze"/></circle>}

      {anim==="steal"&&outcome==="success"&&!ANIM_DATA["steal_success"]&&<g key={`a${ak}`}>
        {/* Dust burst at takeoff (1B) */}
        <circle cx="290" cy="212" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="6" dur=".3s" fill="freeze"/><animate attributeName="opacity" values="0;.5;0" dur=".35s" fill="freeze"/></circle>
        <circle cx="293" cy="210" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="4" dur=".25s" begin=".05s" fill="freeze"/><animate attributeName="opacity" values="0;.35;0" dur=".3s" begin=".05s" fill="freeze"/></circle>
        <circle cx="287" cy="213" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="5" dur=".28s" begin=".03s" fill="freeze"/><animate attributeName="opacity" values="0;.4;0" dur=".32s" begin=".03s" fill="freeze"/></circle>
        {/* Runner sprinting 1B to 2B */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".08s" fill="freeze"/><animateMotion dur=".55s" begin=".08s" fill="freeze" path="M290,210 Q248,170 200,135" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* Catcher throw arrives late */}
        <circle r="2" fill="white" opacity="0"><animate attributeName="opacity" values="0;.8;.8;0" dur=".6s" begin=".2s" fill="freeze"/><animateMotion dur=".4s" begin=".25s" fill="freeze" path="M200,288 Q210,210 200,138" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Dust burst at slide (2B) */}
        <circle cx="200" cy="137" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="7" dur=".3s" begin=".55s" fill="freeze"/><animate attributeName="opacity" values="0;.5;0" dur=".35s" begin=".55s" fill="freeze"/></circle>
        <circle cx="203" cy="135" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="5" dur=".25s" begin=".58s" fill="freeze"/><animate attributeName="opacity" values="0;.4;0" dur=".3s" begin=".58s" fill="freeze"/></circle>
        {/* SAFE! text */}
        <text x="200" y="120" textAnchor="middle" fontSize="12" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>SAFE!</text>
      </g>}
      {anim==="score"&&outcome==="success"&&!ANIM_DATA["score_success"]&&<g key={`s${ak}`}>
        {/* Dust at takeoff from 3B */}
        <circle cx="112" cy="212" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="5" dur=".3s" fill="freeze"/><animate attributeName="opacity" values="0;.45;0" dur=".35s" fill="freeze"/></circle>
        {/* Runner sprints 3B to home */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".05s" fill="freeze"/><animateMotion dur=".5s" begin=".05s" fill="freeze" path="M110,210 Q160,252 200,290" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* Dust at slide into home */}
        <circle cx="200" cy="292" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="7" dur=".3s" begin=".5s" fill="freeze"/><animate attributeName="opacity" values="0;.5;0" dur=".35s" begin=".5s" fill="freeze"/></circle>
        {/* SAFE! text */}
        <text x="200" y="265" textAnchor="middle" fontSize="14" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>SAFE!</text>
      </g>}
      {anim==="hit"&&outcome==="success"&&!ANIM_DATA["hit_success"]&&<g key={`h${ak}`}>
        {/* Contact flash at home plate */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.9)"><animate attributeName="r" from="0" to="8" dur=".1s" fill="freeze"/><animate attributeName="opacity" from=".9" to="0" dur=".18s" fill="freeze"/></circle>
        {/* Ball trail (ghost follows ball) */}
        <circle r="2" fill="#f59e0b" opacity=".3"><animateMotion dur=".45s" begin=".04s" fill="freeze" path="M200,290 Q252,178 306,75" calcMode="spline" keyTimes="0;1" keySplines="0.12 0.8 0.3 1"/><animate attributeName="opacity" from=".3" to="0" dur=".3s" begin=".08s" fill="freeze"/></circle>
        {/* Ball arcs to outfield */}
        <circle r="3" fill="#f59e0b" filter="url(#gl)"><animateMotion dur=".45s" fill="freeze" path="M200,290 Q252,178 306,75" calcMode="spline" keyTimes="0;1" keySplines="0.12 0.8 0.3 1"/></circle>
        {/* Dust at takeoff */}
        <circle cx="202" cy="292" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="5" dur=".3s" begin=".1s" fill="freeze"/><animate attributeName="opacity" values="0;.4;0" dur=".35s" begin=".1s" fill="freeze"/></circle>
        <circle cx="198" cy="291" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="3.5" dur=".25s" begin=".13s" fill="freeze"/><animate attributeName="opacity" values="0;.3;0" dur=".3s" begin=".13s" fill="freeze"/></circle>
        {/* Runner sprints home to 1B */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".12s" fill="freeze"/><animateMotion dur=".6s" begin=".15s" fill="freeze" path="M200,290 Q248,252 290,210" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* BASE HIT text */}
        <text x="265" y="112" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>BASE HIT</text>
      </g>}
      {anim==="throwHome"&&<g key={`t${ak}`}>
        {/* Throw trail (dashed line fades) */}
        <line x1="200" y1="135" x2="200" y2="290" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" opacity="0"><animate attributeName="opacity" from=".65" to="0" dur=".9s" fill="freeze"/></line>
        {/* Ball from 2B to home */}
        <circle r="2.5" fill="#ef4444"><animateMotion dur=".35s" fill="freeze" path="M200,135 L200,290" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Catch flash at home */}
        <circle cx="200" cy="290" r="0" fill="rgba(239,68,68,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".34s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".34s" fill="freeze"/></circle>
      </g>}
      {anim==="doubleplay"&&outcome==="success"&&!ANIM_DATA["doubleplay_success"]&&<g key={`dp${ak}`}>
        {/* Contact flash at batter */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.6)"><animate attributeName="r" from="0" to="5" dur=".08s" fill="freeze"/><animate attributeName="opacity" from=".6" to="0" dur=".12s" fill="freeze"/></circle>
        {/* Ball to 2B (first out) */}
        <circle r="3" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".25s" fill="freeze" path="M240,258 Q240,200 200,135" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Catch flash at 2B */}
        <circle cx="200" cy="135" r="0" fill="rgba(34,197,94,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".24s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".24s" fill="freeze"/></circle>
        {/* Relay throw to 1B (second out) */}
        <circle r="3" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".25s" begin=".28s" fill="freeze" path="M200,135 Q248,170 290,210" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Catch flash at 1B */}
        <circle cx="290" cy="210" r="0" fill="rgba(34,197,94,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".52s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".52s" fill="freeze"/></circle>
        {/* DOUBLE PLAY! text */}
        <text x="200" y="175" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.1s" fill="freeze"/>DOUBLE PLAY!</text>
      </g>}
      {(anim==="strike"||anim==="strikeout")&&outcome==="success"&&!ANIM_DATA["strike_success"]&&<g key={`st${ak}`}>
        {/* Pitcher release flash at mound */}
        <circle cx="200" cy="216" r="0" fill="rgba(255,255,255,.5)"><animate attributeName="r" from="0" to="5" dur=".1s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".15s" fill="freeze"/></circle>
        {/* Ball spin trail (ghost) */}
        <circle r="1.5" fill="white" opacity=".3"><animateMotion dur=".4s" begin=".02s" fill="freeze" path="M200,218 L200,288" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/><animate attributeName="opacity" from=".3" to="0" dur=".25s" begin=".06s" fill="freeze"/></circle>
        {/* Ball to catcher */}
        <circle r="2.5" fill="white" opacity=".9"><animateMotion dur=".4s" fill="freeze" path="M200,218 L200,288" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Glove pop flash at catcher */}
        <circle cx="200" cy="290" r="0" fill="rgba(255,200,50,.7)"><animate attributeName="r" from="0" to="6" dur=".08s" begin=".38s" fill="freeze"/><animate attributeName="opacity" from=".7" to="0" dur=".15s" begin=".38s" fill="freeze"/></circle>
        {/* POP! text */}
        <text x="212" y="282" fontSize="7" fill="rgba(255,200,50,.8)" fontWeight="700" opacity="0"><animate attributeName="opacity" values="0;.8;0" dur=".4s" begin=".38s" fill="freeze"/>POP!</text>
        {/* STRIKE! / STRUCK OUT! text */}
        <text x="200" y="263" textAnchor="middle" fontSize={anim==="strikeout"?13:10} fill={anim==="strikeout"?"#ef4444":"#f59e0b"} fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.6s" fill="freeze"/>{anim==="strikeout"?"STRUCK OUT!":"STRIKE!"}</text>
      </g>}
      {anim==="groundout"&&outcome==="success"&&!ANIM_DATA["groundout_success"]&&<g key={`go${ak}`}>
        {/* Contact flash at home */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.7)"><animate attributeName="r" from="0" to="6" dur=".1s" fill="freeze"/><animate attributeName="opacity" from=".7" to="0" dur=".15s" fill="freeze"/></circle>
        {/* Ball rolls/bounces to fielder */}
        <circle r="2.5" fill="white" filter="url(#gl)"><animateMotion dur=".45s" fill="freeze" path="M200,290 Q220,268 240,250 Q248,242 260,230" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.65 1"/></circle>
        {/* Dust at bounce point */}
        <circle cx="235" cy="255" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="4" dur=".2s" begin=".18s" fill="freeze"/><animate attributeName="opacity" values="0;.35;0" dur=".25s" begin=".18s" fill="freeze"/></circle>
        {/* Fielder scoop flash */}
        <circle cx="260" cy="230" r="0" fill="rgba(255,255,255,.5)"><animate attributeName="r" from="0" to="5" dur=".1s" begin=".44s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".15s" begin=".44s" fill="freeze"/></circle>
        {/* Throw to 1B */}
        <circle r="2.5" fill="#22c55e"><animateMotion dur=".3s" begin=".5s" fill="freeze" path="M260,230 L290,210" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Catch flash at 1B */}
        <circle cx="290" cy="210" r="0" fill="rgba(34,197,94,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".79s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".79s" fill="freeze"/></circle>
        {/* OUT! text */}
        <text x="276" y="198" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.4s" fill="freeze"/>OUT!</text>
      </g>}
      {anim==="flyout"&&outcome==="success"&&!ANIM_DATA["flyout_success"]&&<g key={`fl${ak}`}>
        {/* Contact flash at home */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.7)"><animate attributeName="r" from="0" to="7" dur=".1s" fill="freeze"/><animate attributeName="opacity" from=".7" to="0" dur=".15s" fill="freeze"/></circle>
        {/* Ball trail (ghost follows ball) */}
        <circle r="2" fill="white" opacity=".25"><animateMotion dur=".55s" begin=".04s" fill="freeze" path="M200,290 Q242,118 282,108" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.7 0.4 1"/><animate attributeName="opacity" from=".25" to="0" dur=".35s" begin=".1s" fill="freeze"/></circle>
        {/* Ball arcs high to OF */}
        <circle r="3" fill="white" filter="url(#gl)"><animateMotion dur=".55s" fill="freeze" path="M200,290 Q242,118 282,108" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.7 0.4 1"/></circle>
        {/* Catch flash at outfielder */}
        <circle cx="282" cy="108" r="0" fill="rgba(34,197,94,.5)"><animate attributeName="r" from="0" to="10" dur=".12s" begin=".54s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".2s" begin=".54s" fill="freeze"/></circle>
        {/* CAUGHT! text */}
        <text x="282" y="95" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.2s" fill="freeze"/>CAUGHT!</text>
      </g>}
      {anim==="catch"&&outcome==="success"&&<g key={`ca${ak}`}>
        {/* Ball trail */}
        <circle r="1.5" fill="white" opacity=".3"><animateMotion dur=".35s" begin=".03s" fill="freeze" path="M238,92 Q216,140 192,172" calcMode="spline" keyTimes="0;1" keySplines="0.6 0 0.8 0.2"/><animate attributeName="opacity" from=".3" to="0" dur=".2s" begin=".08s" fill="freeze"/></circle>
        {/* Ball drops to fielder */}
        <circle r="2.5" fill="white"><animateMotion dur=".35s" fill="freeze" path="M238,92 Q216,140 192,172" calcMode="spline" keyTimes="0;1" keySplines="0.6 0 0.8 0.2"/></circle>
        {/* Glove catch flash */}
        <circle cx="192" cy="172" r="0" fill="rgba(34,197,94,.35)"><animate attributeName="r" from="0" to="12" dur=".15s" begin=".34s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.25 0.1 0.25 1"/><animate attributeName="opacity" from=".5" to="0" dur=".2s" begin=".34s" fill="freeze"/></circle>
        {/* GOT IT! text */}
        <text x="192" y="162" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>GOT IT!</text>
      </g>}
      {anim==="advance"&&outcome==="success"&&!ANIM_DATA["advance_success"]&&<g key={`ad${ak}`}>
        {/* Dust at takeoff */}
        <circle cx="290" cy="212" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="5" dur=".3s" fill="freeze"/><animate attributeName="opacity" values="0;.4;0" dur=".35s" fill="freeze"/></circle>
        {/* Runner sprints 1B to 2B */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".05s" fill="freeze"/><animateMotion dur=".5s" begin=".05s" fill="freeze" path="M290,210 Q248,170 200,135" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* ADVANCING! text */}
        <text x="248" y="163" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>ADVANCING!</text>
      </g>}
      {anim==="walk"&&outcome==="success"&&!ANIM_DATA["walk_success"]&&<g key={`wk${ak}`}>
        {/* Runner trots to 1B */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".1s" begin=".1s" fill="freeze"/><animateMotion dur=".7s" begin=".1s" fill="freeze" path="M200,290 Q248,252 290,210" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* BALL FOUR text */}
        <text x="200" y="263" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>BALL FOUR</text>
      </g>}
      {anim==="bunt"&&outcome==="success"&&!ANIM_DATA["bunt_success"]&&<g key={`bn${ak}`}>
        {/* Soft contact flash */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.5)"><animate attributeName="r" from="0" to="4" dur=".08s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".12s" fill="freeze"/></circle>
        {/* Ball dribbles forward */}
        <circle r="2" fill="white"><animateMotion dur=".5s" fill="freeze" path="M200,290 Q198,272 192,258" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.65 1"/></circle>
        {/* Runner breaks for 1B */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".1s" fill="freeze"/><animateMotion dur=".6s" begin=".12s" fill="freeze" path="M200,290 Q248,252 290,210" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* BUNT! text */}
        <text x="180" y="250" textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1s" fill="freeze"/>BUNT!</text>
      </g>}
      {anim==="safe"&&outcome==="success"&&<g key={`sf${ak}`}>
        {/* Slide dust */}
        <circle cx="202" cy="212" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="6" dur=".3s" fill="freeze"/><animate attributeName="opacity" values="0;.4;0" dur=".35s" fill="freeze"/></circle>
        <circle cx="198" cy="214" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="4" dur=".25s" begin=".04s" fill="freeze"/><animate attributeName="opacity" values="0;.3;0" dur=".3s" begin=".04s" fill="freeze"/></circle>
        {/* Expanding safe ring */}
        <circle cx="200" cy="210" r="0" fill="none" stroke="#22c55e" strokeWidth="2.5"><animate attributeName="r" from="0" to="32" dur=".45s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.25 0.1 0.25 1"/><animate attributeName="opacity" from=".8" to="0" dur=".45s" fill="freeze"/></circle>
        {/* Second ring (staggered) */}
        <circle cx="200" cy="210" r="0" fill="none" stroke="#22c55e" strokeWidth="1.5"><animate attributeName="r" from="0" to="24" dur=".35s" begin=".1s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".35s" begin=".1s" fill="freeze"/></circle>
        {/* SAFE! text */}
        <text x="200" y="196" textAnchor="middle" fontSize="13" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>SAFE!</text>
      </g>}
      {anim==="freeze"&&outcome==="success"&&<g key={`fr${ak}`}>
        {/* CI4: Freeze redesign — show what would happen if the runner went */}
        {/* Phase 1: Runner starts to go (ghost, transparent) */}
        <g opacity="0"><animate attributeName="opacity" values="0;.3;.3;.15;0" dur="1.2s" begin=".1s" fill="freeze"/>
          <animateMotion dur=".8s" begin=".15s" fill="freeze" path="M290,210 Q265,190 248,178" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>
          <Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={0.4}/>
        </g>
        {/* Phase 2: Throw arrives FIRST — ball beats the ghost runner */}
        <circle r="2.5" fill="#ef4444"><animateMotion dur=".3s" begin=".2s" fill="freeze" path="M200,218 Q220,190 200,140" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Phase 3: Tag flash where runner would be */}
        <circle cx="248" cy="178" r="0" fill="rgba(239,68,68,.5)" opacity="0"><animate attributeName="r" from="0" to="12" dur=".15s" begin=".48s" fill="freeze"/><animate attributeName="opacity" values="0;.6;0" dur=".3s" begin=".48s" fill="freeze"/></circle>
        {/* Phase 4: X mark — tagged out */}
        <text x="248" y="168" textAnchor="middle" fontSize="14" fill="#ef4444" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;0;1;.6;0" dur="1.5s" fill="freeze"/>✗ OUT</text>
        {/* Phase 5: Correct decision text */}
        <text x="200" y="195" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;0;1;1;0" dur="2s" fill="freeze"/>SMART — DON'T RUN INTO AN OUT!</text>
      </g>}

      {/* ============ FAILURE ANIMATIONS (show what went wrong) ============ */}
      {outcome&&outcome!=="success"&&(anim==="strike"||anim==="strikeout")&&<g key={`ws${ak}`}>
        <circle r="2.5" fill="white" opacity=".8"><animateMotion dur=".35s" fill="freeze" path="M200,218 L200,288" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <text x="200" y="266" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>BALL</text>
      </g>}
      {outcome&&outcome!=="success"&&anim==="steal"&&<g key={`wo${ak}`}>
        {/* Runner sprints but ball arrives first — tag OUT */}
        <g opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur=".7s" fill="freeze"/><animateMotion dur=".5s" fill="freeze" path="M290,210 Q260,185 238,165" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* Ball beats runner */}
        <circle r="2.5" fill="#ef4444"><animateMotion dur=".3s" begin=".1s" fill="freeze" path="M200,288 Q215,200 200,138" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <circle cx="200" cy="138" r="0" fill="rgba(239,68,68,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".39s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".39s" fill="freeze"/></circle>
        <text x="220" y="155" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>OUT!</text>
      </g>}
      {outcome&&outcome!=="success"&&anim==="hit"&&<g key={`wh${ak}`}>
        {/* Ball goes to fielder for routine out */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.5)"><animate attributeName="r" from="0" to="5" dur=".08s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".12s" fill="freeze"/></circle>
        <circle r="2.5" fill="white"><animateMotion dur=".4s" fill="freeze" path="M200,290 Q230,240 248,195" calcMode="spline" keyTimes="0;1" keySplines="0.12 0.8 0.3 1"/></circle>
        <circle cx="248" cy="195" r="0" fill="rgba(239,68,68,.3)"><animate attributeName="r" from="0" to="6" dur=".1s" begin=".39s" fill="freeze"/><animate attributeName="opacity" from=".3" to="0" dur=".15s" begin=".39s" fill="freeze"/></circle>
        <circle r="2" fill="#ef4444"><animateMotion dur=".25s" begin=".45s" fill="freeze" path="M248,195 L290,210" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <text x="200" y="256" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>OUT</text>
      </g>}
      {outcome&&outcome!=="success"&&anim==="groundout"&&<g key={`wgo${ak}`}>
        <circle r="2.5" fill="white"><animateMotion dur=".4s" fill="freeze" path="M200,290 Q225,265 250,238" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.65 1"/></circle>
        <circle r="2" fill="#ef4444"><animateMotion dur=".25s" begin=".42s" fill="freeze" path="M250,238 L290,210" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <text x="200" y="256" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>OUT</text>
      </g>}
      {outcome&&outcome!=="success"&&anim==="flyout"&&<g key={`wfl${ak}`}>
        <circle r="2.5" fill="white"><animateMotion dur=".5s" fill="freeze" path="M200,290 Q230,150 260,120" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.7 0.4 1"/></circle>
        <circle cx="260" cy="120" r="0" fill="rgba(239,68,68,.3)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".49s" fill="freeze"/><animate attributeName="opacity" from=".3" to="0" dur=".15s" begin=".49s" fill="freeze"/></circle>
        <text x="200" y="256" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>FLY OUT</text>
      </g>}
      {outcome&&outcome!=="success"&&anim==="bunt"&&<g key={`wbn${ak}`}>
        {/* Bunt pops up — easy catch */}
        <circle r="2" fill="white"><animateMotion dur=".4s" fill="freeze" path="M200,290 Q200,260 205,250" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.7 0.4 1"/></circle>
        <circle cx="205" cy="250" r="0" fill="rgba(239,68,68,.3)"><animate attributeName="r" from="0" to="6" dur=".1s" begin=".39s" fill="freeze"/><animate attributeName="opacity" from=".3" to="0" dur=".15s" begin=".39s" fill="freeze"/></circle>
        <text x="200" y="238" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>POP UP!</text>
      </g>}
      {outcome&&outcome!=="success"&&anim==="score"&&<g key={`wsc${ak}`}>
        {/* Throw beats runner to plate */}
        <circle r="2.5" fill="#ef4444"><animateMotion dur=".3s" fill="freeze" path="M200,135 L200,290" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <circle cx="200" cy="290" r="0" fill="rgba(239,68,68,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".29s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".29s" fill="freeze"/></circle>
        <text x="200" y="265" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>OUT AT HOME!</text>
      </g>}

      {/* ============ NEW ANIMATION TYPES (Sprint 5) ============ */}
      {anim==="pickoff"&&<g key={`po${ak}`}>
        {/* Pitcher throws to base, runner dives back */}
        <circle r="2.5" fill="white"><animateMotion dur=".25s" fill="freeze" path="M200,218 L290,210" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <circle cx="290" cy="210" r="0" fill="rgba(239,68,68,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".24s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".24s" fill="freeze"/></circle>
        {/* Dust at dive-back */}
        <circle cx="292" cy="212" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="5" dur=".25s" begin=".2s" fill="freeze"/><animate attributeName="opacity" values="0;.4;0" dur=".3s" begin=".2s" fill="freeze"/></circle>
        <text x="290" y="196" textAnchor="middle" fontSize="9" fill={outcome==="success"?"#22c55e":"#ef4444"} fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.1s" fill="freeze"/>{outcome==="success"?"PICKED OFF!":"SAFE!"}</text>
      </g>}
      {anim==="tag"&&<g key={`tg${ak}`}>
        {/* Fielder applies tag, runner slides */}
        <circle cx="245" cy="172" r="1" fill="#c4a882" opacity="0"><animate attributeName="r" from="1" to="6" dur=".3s" fill="freeze"/><animate attributeName="opacity" values="0;.45;0" dur=".35s" fill="freeze"/></circle>
        {/* Tag flash */}
        <circle cx="245" cy="170" r="0" fill={outcome==="success"?"rgba(34,197,94,.4)":"rgba(239,68,68,.4)"}><animate attributeName="r" from="0" to="10" dur=".15s" begin=".2s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".2s" begin=".2s" fill="freeze"/></circle>
        <text x="245" y="158" textAnchor="middle" fontSize="10" fill={outcome==="success"?"#22c55e":"#ef4444"} fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>{outcome==="success"?"OUT!":"SAFE!"}</text>
      </g>}
      {anim==="relay"&&<g key={`rl${ak}`}>
        {/* Multi-throw: OF → cutoff → home */}
        <circle r="2.5" fill="white" filter="url(#gl)"><animateMotion dur=".3s" fill="freeze" path="M300,80 Q265,155 248,185" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <circle cx="248" cy="185" r="0" fill="rgba(255,255,255,.4)"><animate attributeName="r" from="0" to="5" dur=".08s" begin=".29s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".12s" begin=".29s" fill="freeze"/></circle>
        <circle r="2.5" fill="#ef4444"><animateMotion dur=".3s" begin=".35s" fill="freeze" path="M248,185 L200,290" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        <circle cx="200" cy="290" r="0" fill="rgba(239,68,68,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".64s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".64s" fill="freeze"/></circle>
        <text x="224" y="240" textAnchor="middle" fontSize="9" fill={outcome==="success"?"#22c55e":"#ef4444"} fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.2s" fill="freeze"/>{outcome==="success"?"GOT HIM!":"SAFE!"}</text>
      </g>}
      {anim==="popup"&&<g key={`pu${ak}`}>
        {/* Infield fly — ball pops high, fielders converge */}
        <circle cx="200" cy="288" r="0" fill="rgba(255,255,255,.5)"><animate attributeName="r" from="0" to="5" dur=".08s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".12s" fill="freeze"/></circle>
        <circle r="2.5" fill="white"><animateMotion dur=".6s" fill="freeze" path="M200,290 Q200,120 210,200" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.7 0.4 1"/></circle>
        <circle cx="210" cy="200" r="0" fill="rgba(34,197,94,.4)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".59s" fill="freeze"/><animate attributeName="opacity" from=".4" to="0" dur=".15s" begin=".59s" fill="freeze"/></circle>
        <text x="210" y="188" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.2s" fill="freeze"/>INFIELD FLY!</text>
      </g>}
      {anim==="wildPitch"&&<g key={`wp${ak}`}>
        {/* Ball past catcher, runner advances */}
        <circle r="2.5" fill="white"><animateMotion dur=".35s" fill="freeze" path="M200,218 Q200,280 200,305" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Runner takes off */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".3s" fill="freeze"/><animateMotion dur=".5s" begin=".3s" fill="freeze" path="M290,210 Q248,170 200,135" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        <text x="200" y="265" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.1s" fill="freeze"/>WILD PITCH!</text>
      </g>}
      {anim==="squeeze"&&<g key={`sq${ak}`}>
        {/* Runner from 3rd on bunt attempt */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".05s" begin=".05s" fill="freeze"/><animateMotion dur=".5s" begin=".05s" fill="freeze" path="M110,210 Q160,252 200,290" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        {/* Bunt dribble */}
        <circle r="2" fill="white"><animateMotion dur=".4s" fill="freeze" path="M200,290 Q198,275 195,264" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.65 1"/></circle>
        <text x="200" y="255" textAnchor="middle" fontSize="10" fill={outcome==="success"?"#22c55e":"#ef4444"} fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.1s" fill="freeze"/>{outcome==="success"?"SQUEEZE!":"OUT!"}</text>
      </g>}
      {anim==="hitByPitch"&&<g key={`hbp${ak}`}>
        {/* Ball hits batter */}
        <circle r="2.5" fill="white"><animateMotion dur=".3s" fill="freeze" path="M200,218 L212,284" calcMode="spline" keyTimes="0;1" keySplines="0.15 0.6 0.35 1"/></circle>
        {/* Impact flash on batter */}
        <circle cx="212" cy="284" r="0" fill="rgba(239,68,68,.5)"><animate attributeName="r" from="0" to="8" dur=".1s" begin=".29s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".2s" begin=".29s" fill="freeze"/></circle>
        {/* Runner walks to 1B */}
        <g opacity="0"><animate attributeName="opacity" values="0;1" dur=".1s" begin=".5s" fill="freeze"/><animateMotion dur=".7s" begin=".5s" fill="freeze" path="M215,285 Q250,255 290,210" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/><Guy x={0} y={0} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" pose="runner" o={1}/></g>
        <text x="200" y="265" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.1s" fill="freeze"/>HIT BY PITCH!</text>
      </g>}
      {/* Idle ball toss on mound when no outcome */}
      {!outcome&&<circle r="2" fill="white" opacity=".7"><animateMotion dur="1.8s" repeatCount="indefinite" path="M200,214 Q200,204 200,208 Q200,212 200,214" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/><animate attributeName="opacity" values=".7;.3;.7" dur="1.8s" repeatCount="indefinite"/></circle>}
    </svg>
  );
});
// Promo code input — shown in upgrade panel
function PromoCodeInput({setStats,setToast,snd,setPanel,email}){
  const[show,setShow]=React.useState(false);
  const[val,setVal]=React.useState("");
  const[loading,setLoading]=React.useState(false);
  const[err,setErr]=React.useState(null);
  function redeem(){
    const code=val.trim();if(!code||loading)return;
    setLoading(true);setErr(null);
    // Sprint 4.1: pass email for server-side subscription tracking
    fetch(WORKER_BASE+"/validate-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,email:email||""})})
      .then(r=>r.json()).then(d=>{
        setLoading(false);
        if(d.valid){
          const expiry=d.type==="30day"?Date.now()+30*86400000:null;
          setStats(p=>({...p,isPro:true,proPlan:"promo-"+d.type,proExpiry:expiry,promoCode:code,promoActivatedDate:Date.now(),funnel:[...(p.funnel||[]).slice(-99),{event:"promo_redeemed",ts:Date.now()}]}));
          setErr("!"+(d.type==="lifetime"?"Lifetime All-Star Pass activated!":"30-day All-Star Pass activated!"));
          snd.play('ach');
          setTimeout(()=>{setToast({e:"🎟️",n:"Promo Code Activated!",d:d.type==="lifetime"?"Lifetime All-Star Pass unlocked!":"30-day All-Star Pass unlocked!"});setTimeout(()=>setToast(null),4000)},300);
          setTimeout(()=>setPanel(null),2000);
        } else {
          setErr(d.reason==="already_used"?"This code has already been used.":"Invalid promo code.");
          setStats(p=>({...p,funnel:[...(p.funnel||[]).slice(-99),{event:"promo_invalid",ts:Date.now()}]}));
        }
      }).catch(()=>{setLoading(false);setErr("Network error. Try again.")});
  }
  if(!show)return(<div style={{marginTop:6,textAlign:"center"}}>
    <button onClick={()=>setShow(true)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:11,cursor:"pointer",textDecoration:"underline",padding:4}}>Have a promo code?</button>
  </div>);
  return(<div style={{marginTop:8,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 12px"}}>
    <div style={{fontSize:11,color:"#9ca3af",marginBottom:6,fontWeight:600}}>Enter Promo Code</div>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <input type="text" placeholder="CODE" value={val} onChange={e=>setVal(e.target.value.toUpperCase())} maxLength={20}
        style={{flex:1,background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:8,padding:"8px 10px",color:"white",fontSize:13,fontFamily:"monospace",letterSpacing:1,outline:"none",textTransform:"uppercase"}}
        onKeyDown={e=>{if(e.key==="Enter"&&val.trim()&&!loading)redeem()}}/>
      <button disabled={!val.trim()||loading} onClick={redeem}
        style={{background:loading?"#374151":"linear-gradient(135deg,#d97706,#f59e0b)",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:loading?"wait":"pointer",opacity:!val.trim()?.4:1,whiteSpace:"nowrap"}}>{loading?"...":"Redeem"}</button>
    </div>
    {err&&<div style={{fontSize:10,color:err.startsWith("!")?"#22c55e":"#ef4444",marginTop:6}}>{err.startsWith("!")?err.slice(1):err}</div>}
  </div>);
}
// Sprint 4.5: React.memo for scoreboard
const Board=React.memo(function Board({sit}){
  if(!sit)return null;const{inning,outs,count,score}=sit;
  return(<div style={{background:"linear-gradient(135deg,#0d1117,#161b22)",borderRadius:10,padding:"6px 10px",display:"flex",justifyContent:"space-around",alignItems:"center",fontFamily:"'Courier New',monospace",border:"1px solid #21262d"}}>
    {[{l:"INN",v:inning,c:"#f59e0b"},{l:"SCORE",v:<><span style={{color:"#58a6ff"}}>{score?.[0]||0}</span><span style={{color:"#484f58",margin:"0 2px"}}>-</span><span style={{color:"#f85149"}}>{score?.[1]||0}</span></>,c:"white"},{l:"COUNT",v:count&&count!=="-"?count:"--",c:"#3fb950"}].map((it,i)=>(<div key={i} style={{textAlign:"center",minWidth:40}}><div style={{fontSize:7,color:"#6e7681",textTransform:"uppercase",letterSpacing:1.5,marginBottom:1,fontWeight:700}}>{it.l}</div><div style={{fontSize:16,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}</div></div>))}
    <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#6e7681",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2,fontWeight:700}}>OUTS</div><div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<(outs||0)?"#f85149":"rgba(255,255,255,.05)",border:`1.5px solid ${i<(outs||0)?"#da3633":"#21262d"}`}}/>)}</div></div>
  </div>);
});

// Coach Mascot — friendly baseball character with expressions
const COACH_LINES={
  success:[
    "That's instinct you can't teach — wait, we just did!","You're seeing the whole field!",
    "That's heads-up ball right there!","You're reading the game like a pro!","That's exactly what I'd do!",
    "Sharp thinking out there!","You've got baseball IQ for days!","That's a veteran move!",
    "Way to stay cool under pressure!","You could teach this one!","That's the right read every time!",
    "Clutch play, no doubt!","You just made the highlight reel!","That's what champions do!","Textbook play!",
    "You saw the whole situation in a split second — that's baseball IQ!",
    "That's the call coaches drill all season — and you just made it cold!",
    "One right decision at the right moment wins games. That was it.",
    "Nailed it! Every scenario you get right is a rep you'll remember in a real game.",
    "Smart players make their teammates better — that's exactly what you just did.",
    "Knowing WHY it's right is more valuable than guessing right. You knew.",
    "That's the kind of decision that separates players who play long careers from those who don't.",
    "The game rewards smart over fast, every time. You just proved it.",
    "Baseball IQ compounds — every right answer makes the next one come faster.",
    "First-time right on a tough one? That's real learning."
  ],
  warning:[
    "Not bad! Close one.","Good instinct, almost there!","Decent call — let's learn why.",
    "You're on the right track!","Hey, that's a reasonable play!",
    "Close — just one adjustment away!","Good thinking, wrong moment for it though.",
    "I've seen pros make that same call!","That works sometimes — but there's a better option.",
    "You're thinking about it the right way!","Almost had it — read the explanation!",
    "Smart idea, just slightly off target.","Not a bad play — but not the best play.",
    "You've got the right instincts — let's sharpen them!","That'll work in some situations!",
    "Close call! The difference is in the details.",
    "You picked up on the right cue — just applied it one beat off.",
    "The right concept, slightly wrong situation. That gap closes fast.",
    "A+ instinct, B+ timing. Read the explanation and flip that.",
    "Pro players miss this one too — until they've seen it enough times. You're one rep closer."
  ],
  danger:[
    "Every pro struck out first.","Let's break this down.","No worries, you'll get it!",
    "Even the greats make mistakes!","That's a tough one — let's learn from it.",
    "Shake it off and come back stronger!",
    "Babe Ruth struck out 1,330 times. You're in good company!","The best players study their mistakes.",
    "Don't sweat it — this is how you get better!","Read the breakdown — it'll click next time.",
    "That's a learning rep — those count the most!","This one's tricky. Let's figure it out together.",
    "Oops! But now you know for next time.","Every wrong answer is a future right answer!",
    "Dust yourself off — next one's yours!",
    "The best players in the world had coaches who made them get this wrong first. Now you have.",
    "Wrong answer, right process — you read the situation and committed. Read the explanation for the tweak.",
    "Nobody gets this one right on instinct alone. That's why we train.",
    "Write this one down mentally. In a real game, muscle memory takes over — now yours has the right play.",
    "One wrong rep means ten right ones are loading. That's how this works."
  ],
  posSuccess:{
    pitcher:["That's an ace-level pitch call!","First-pitch strikes cut BA from .340 to .167 on 0-2 — you got ahead!","Pitching smart beats pitching hard every time!","That's Cy Young thinking!","Pitch sequencing is how good arms become great ones — you just used it.","Location over velocity, every time. You just proved it.","The best pitchers know what pitch they're SETTING UP two throws from now. That's you."],
    catcher:["You're the quarterback of this defense!","Elite catchers think two pitches ahead — just like you!","Elite pop time is 1.85 seconds — your pitch-calling just gave the pitcher every advantage.","Field general material!","Framing a borderline pitch is worth more than a strikeout. You got the call.","You called the right pitch in the right count — that's a game manager talking.","The catcher controls the pace of the whole game. You just felt that."],
    firstBase:["Stretch and scoop — that's Gold Glove material!","Knowing when to hold vs charge is what separates pros!","That's why 1B is the cutoff on CF/RF throws home!","Smooth first base work!","When 1B crashes a bunt, 2B covers first — you knew who was coming behind you.","Force is removed when the runner ahead is out — you recognized the tag play instantly.","Stretching toward the throw not only saves the out — it saves the inning."],
    secondBase:["Quick hands, smart feet — that's what turns two and wins games.","Quick pivot, strong relay — textbook!","Knowing when to cover 1B vs 2B is advanced stuff!","DP artist in the making!","Right side extra-base hit? 2B leads the relay — you were already moving.","The DP pivot: receive, touch, get off the bag before the runner arrives. Textbook.","Cover 1B when 1B charges, cover 2B when you're the relay — you tracked both."],
    shortstop:["Captain of the infield — nailed it!","Communication is king at short — you've got it!","That's a Gold Glove relay!","You own the left side!","Left side extra-base hit means SS leads the relay. You were in the right spot.","Cutoff on all throws to third — SS owns that lane. You know the game.","Firm, chest-high feeds to second — that's how you turn two without thinking."],
    thirdBase:["Hot corner hero! Lightning reflexes!","Charging bunts takes courage — you've got it!","Line guard in the 9th — that's veteran savvy!","Hot corner MVP!","SS covers 3B when you go out as cutoff — you knew your partner was there.","Bare-hand, charge, throw in one motion — that's a play you can't script.","Guarding the line in the 9th isn't giving up range — it's smart defense."],
    leftField:["Coming in on a ball is always easier than going back — you knew that and trusted it.","Backing up 3B is an OF's hidden superpower — you know it!","That throw hit the cutoff perfectly!","Reading the ball like a scout!","3B is your cutoff on every throw home from left — you hit the right man.","Charging into a ball instead of circling it is how you save runs, not just outs.","That's the gap read coaches can't teach until they've seen it done right once. That was it."],
    centerField:["That's why CF is the captain of the outfield!","You called it loud and early — that's leadership!","Gap to gap coverage — elite range!","The OF captain speaks!","Angle routes save steps. You didn't run straight back — you ran where the ball was going.","Center fielder has priority over everyone. You used it — and it worked.","1B is your cutoff on throws home from center. Hit the target, let them decide."],
    rightField:["Cannon arm! That throw was perfect!","Backing up 1B on every grounder — that's elite hustle!","Strong arm, smart throw — deadly combo!","Right field rocket arm!","2B leads the relay on right-side extra-base hits — you hit the right man.","Backing up first on every single grounder is the most overlooked play in baseball — not for you.","Hit the cutoff and let the defense work. You trust the system."],
    batter:["You've got the eye of a cleanup hitter!","Knowing hitter's counts from pitcher's counts is an edge!","That's situational hitting — moving runners is how you win!","Patient and powerful — the perfect combo!","On 3-1, hitters bat .370 — you recognized the premium count and attacked.","Two-strike approach: widen the zone, battle, don't give in. You didn't give in.","Hitting behind the runner isn't a sacrifice — it's winning baseball."],
    baserunner:["Speed AND smarts — that's rare!","72% break-even for steals — you know the math!","Reading the pitcher's first move is an art!","That's heads-up base running!","Freeze on line drives, run on fly balls — you read it right in a fraction of a second.","Never make the first or third out at third. You know the axiom — and you lived it.","Secondary lead isn't standing still — it's a calculated creep toward the next base. Perfect."],
    manager:["Skipper, that's a World Series move!","RE24 says that was the right call — and so do I!","Managing the pitching staff is the hardest job — nailed it!","That's a championship decision!","Third time through the order: batters hit 30 points better. You made the change at the right time.","Platoon advantage is worth 18 BA points. You put the right matchup on the field.","Win Probability, not just run expectancy — late-game decisions need a different lens. You used it."],
    famous:["History lesson: aced!","The greats made decisions in milliseconds — and so did you.","Same situation, same century apart — same right answer.","Knowing what legends did is the first step to doing it yourself."],
    rules:["You know the rulebook inside out!","The rulebook protects smart players — you knew exactly how.","Force vs tag, obstruction vs interference — you got the details right.","Rules aren't just for umpires. Smart players use them to their advantage."],
    counts:["Count IQ is off the charts!","Hitters bat .400 on 2-0, .167 on 0-2 — you know which count this was.","Count leverage is the single biggest edge in amateur baseball — you have it.","The count tells the story. You read it right."]
  },
  posDanger:{
    pitcher:["Pitching is all about outsmarting the hitter — you'll get there!","Remember: location beats velocity in high leverage!","Getting ahead 0-1 changes everything — work on first-pitch strikes!","The best pitchers think two pitches ahead.","Set up your breaking ball with a fastball up — change eye level before changing speed.","Third time through the lineup, batters hit 30 points better. Know when to give way.","Holding runners isn't just pickoffs — it's varying your hold time to disrupt their rhythm."],
    catcher:["Calling a game is the toughest job on the field — keep studying!","Remember: direct the cutoff man with your voice!","Pop time starts with a quick transfer — keep working on it!","The catcher sees the whole field — use that view!","Borderline pitch in a 2-2 count? Stillness sells it. Movement kills it.","On a dropped third strike: 1B empty? Chase it. 1B occupied, less than 2 outs? Batter's out.","Quick transfer beats a strong arm every time on steal attempts."],
    firstBase:["First base is all about footwork and focus — keep at it!","Scoops save games — short-hop practice pays off!","Remember: you're the cutoff on CF and RF throws home!","Knowing when 2B covers for you is key.","When you're the cutoff, 2B covers 1B. Trust the rotation — it's automatic.","Force is removed the moment the runner ahead is out. Switch to a tag.","Stretching without coming off the bag early is a skill — practice the timing."],
    secondBase:["Turning two is an art — you'll get smoother with reps!","Cover 1B when 1B charges bunts — it's your job!","The DP pivot takes a thousand reps — keep at it!","Left side relay is SS, right side is you — know your assignments!","On RF/CF gap balls, you're the lead relay — get in line between the OF and home.","Outfielder coming in always has priority over you going back on fly balls. Peel off early.","Get off the 2B bag the instant you release the DP throw — the runner is aiming at you."],
    shortstop:["Shortstop is the hardest infield position — keep grinding!","Firm, chest-high feeds make the DP work!","You cut throws to 3B — know your assignments!","Communication is your superpower — use it!","On LF/deep CF balls, you lead the relay. Get there fast and give the OF a target.","Never call off an outfielder on a shallow fly — they're coming in, you're going back. That's harder.","The hole play: plant hard on the backhand, strong throw across. No arm-strength shortcuts."],
    thirdBase:["The hot corner is all about reactions — they'll get faster!","Bare-hand bunts take practice — keep charging!","Guard the line late and close — don't give up extra bases!","SS covers 3B when you're the cutoff — trust your teammates!","Your cutoff lane is LF to home — get in line fast, listen for the catcher's call.","Guarding the line means giving up some singles to prevent doubles. In the 9th, that's the right trade.","Slow roller: charge, bare-hand, throw in one motion — hesitation means safe."],
    leftField:["Reading the ball off the bat takes practice — you're learning!","3B is your cutoff man on throws home — hit him!","Back up 3B on ALL infield plays — that's your hidden job!","Coming in on a ball is always easier than going back.","Round the wall ball so your momentum carries toward the infield — never catch and spin.","Back up third on every infield grounder — you're the last line if the throw gets away.","Your relay on doubles is the SS — get the ball there and let him decide the play."],
    centerField:["Covering all that ground takes experience — keep running them down!","You have priority on EVERY fly ball you can reach!","Angle routes beat straight-back routes — save steps!","Back up 2B on steal attempts — hustle pays off!","Call it loud and early — every collision in the OF starts with a player who waited too long.","On throws home from center, 1B is your cutoff — hit him, not the plate.","The banana route: start wide, let the ball come to you. Straight back = ball over your head."],
    rightField:["That arm will get stronger — keep making those throws!","Back up 1B on EVERY grounder — most important routine OF job!","1B is your cutoff on throws home — hit the target!","Coming in is always easier than going back.","Wall caroms in right are unpredictable — learn your park's corner, that's a pro habit.","A throw to first isn't giving up — it's turning a double into a single. Smart.","RF-CF gap ball? 2B leads the relay — know your assignment."],
    batter:["Even the best hitters fail 7 out of 10 times. Keep swinging!","On 0-2, expand your zone slightly and fight off tough pitches.","2-0 is the best hitter's count — .400 BA! Be ready for your pitch.","Situational hitting wins games — think about moving runners!","Down 0-2, hitters bat .167. Expand the zone, shorten up, battle — don't swing for the fences.","Runner on 3rd, less than 2 outs — a fly ball scores the run. You don't need a hit.","The hit-and-run: batter MUST swing to protect the runner. No take. No exceptions."],
    baserunner:["Base running is the hardest thing to teach — you're learning!","Below 72% success rate, a steal attempt hurts your team.","Never make the first or third out at third base!","Tag up: watch the fielder's feet, leave on the catch.","Line drives: FREEZE and read. Getting doubled off is unforgivable — the ball's in front of you.","Secondary lead isn't passive — key on every pitch, creep toward the next base on every delivery.","With 2 outs, the steal break-even drops to 67% — the caught stealing ends the inning anyway."],
    manager:["Managing is all about the next decision. Reset and go!","Batters hit 30 points better the 3rd time through — use that info!","Sacrifice bunts usually cost runs — check the RE24!","Late and close: every decision is magnified.","Intentional walks: only with first base open AND a clear skill gap to the next hitter. Both conditions.","Batters see the pitcher for the first time in 3 years every night — by the 3rd AB they're adjusting.","Defensive positioning: guard lines late, play for DP early. The game situation changes the entire field."],
    famous:["These famous plays tripped up real pros too!","Even the 1955 World Series had players who guessed wrong first.","History's best plays look obvious in hindsight — in the moment, they're hard.","Wrong on this one? You're in good company — the defense thought so too."],
    rules:["Even umpires argue about rules sometimes!","The infield fly rule, the balk, the force removal — these take reps to lock in.","Rules scenarios trip up players who haven't studied them. Now you have.","Wrong call here, but knowing WHY it's wrong is already half the battle."],
    counts:["Counts are tricky — even big leaguers get fooled!","On hitter's counts, attack your pitch. On pitcher's counts, protect the zone. Review which is which.","The count shifts the entire strategy for both sides. Study these — they compound fast.","Wrong count read = wrong approach. Right count read = .200 BA difference. It matters enormously."]
  },
  streakLines:[
    null,null,null,
    "Three in a row! You're heating up!","Four straight! Stay locked in!",
    "Five in a row! You're on fire!","Six straight! Can't stop, won't stop!",
    "Seven! That's a whole week of perfection!","Eight straight! You're locked in!",
    "Nine straight! One away from double digits — keep going!","This streak is legendary!",
    "ELEVEN! You're not just playing — you're mastering this.","TWELVE straight. This is what elite preparation looks like.",
    null,null,
    "FIFTEEN straight! You're writing history!",
    null,null,null,null,
    "TWENTY! Hall of Fame material right here!",
    null,null,null,null,
    "TWENTY-FIVE! Is there anything you don't know?!"
  ],
  facts:[
    "Did you know? A MLB game has about 300 strategic decisions!",
    "Fun fact: The pitcher's mound is exactly 60 feet, 6 inches from home plate!",
    "Did you know? A 90 mph fastball reaches home plate in 0.4 seconds!",
    "Fun fact: The average MLB game has about 146 pitches per team!",
    "Did you know? Only 6% of stolen base attempts use a delayed steal!",
    "Brain stat: Left-handed pitchers can face first base in their natural delivery — that's why LHP steal success rates are 5-8% lower against them than RHP.",
    "Did you know? Batters hit .100 points higher on 3-1 counts vs 0-2 counts!",
    "Fun fact: The infield fly rule was created in 1895 to stop sneaky double plays!",
    "Did you know? Catchers squat and stand up over 200 times per game!",
    "Fun fact: A curveball can break up to 17 inches from its starting path!",
    "Did you know? The hit-and-run play has been used since the 1890s!",
    "Fun fact: Relief pitchers didn't become common until the 1950s!",
    "Brain stat: With bases loaded and 0 outs, teams score an average of 2.29 runs!",
    "Brain stat: A sacrifice bunt with a runner on 1st costs 0.23 expected runs!",
    "Brain stat: On 2-0 counts, hitters bat .400 — the best count in baseball!",
    "Brain stat: Batters hit .167 on 0-2 counts — get ahead early!",
    "Brain stat: Platoon advantage is worth about 18 points of batting average!",
    "Brain stat: Elite catchers have a 1.85-second pop time — lightning fast!",
    "Brain stat: The steal break-even rate is 72% — below that, you're hurting your team!",
    "Brain stat: Runners on 2nd and 3rd with 0 outs? Teams average 2.05 runs!",
    "Did you know? The force play is removed when the runner ahead is put out!",
    "Fun fact: Center fielders have priority over ALL other fielders on fly balls!",
    "Did you know? On a full count, the walk rate jumps but BA drops to .230!",
    "Fun fact: The double play is called the pitcher's best friend!",
    "Brain stat: With no one on and 2 outs, teams only average 0.11 runs. Every base counts!",
    "Brain stat: Runners on 3rd with less than 2 outs score 67-85% of the time!",
    "Brain stat: A runner on 2nd scores only 23% of the time with 2 outs — need a base HIT!",
    "Brain stat: MLB runners score from 2nd on a single 62% of the time. Run on contact!",
    "Brain stat: First-pitch strikes save pitchers about 0.05 runs per batter faced!",
    "Brain stat: Elite pitchers throw first-pitch strikes 68% of the time. Average is 59%!",
    "Brain stat: On 0-2, the pitcher has a 27% strikeout rate on the very next pitch!",
    "Brain stat: 3-0 count — 48% of the time the pitcher throws ball 4. Take the pitch!",
    "Brain stat: The 2023 pitch clock shortened the steal window by 0.2 seconds — steals are harder!",
    "Brain stat: After 90 pitches, a starter's ERA equivalent rises by over 1 run per game!",
    "Fun fact: A runner needs about 3.3 seconds to steal 2nd. Elite catchers give them only 3.2!",
    "Brain stat: Bunting with runners on 1st AND 2nd only costs 0.08 expected runs — the one time a bunt is closest to breaking even!",
    "Brain stat: With just a runner on first and 0 outs, teams average 0.94 runs. A single can flip an entire game.",
    "Brain stat: First and third with 0 outs? Teams average 1.83 runs that inning — that's why pitchers hate that situation!",
    "Brain stat: On 3-1 counts, hitters bat .370 with a .500+ OBP — premium hitter's count. Sit on YOUR pitch.",
    "Brain stat: Down 1-2, hitters only bat .180. That's survival mode — expand the zone and make contact.",
    "Brain stat: With 2 outs, the steal break-even drops to 67% — a caught stealing ends the inning anyway, so the risk math changes!",
    "Brain stat: The second time through the order, batters already hit 15 points better. By the third time? 30 points. Starters don't get easier.",
    "Brain stat: When a pitcher delivers in under 1.2 seconds, stealing becomes nearly impossible — that's why quick pitchers are so valuable.",
    "Brain stat: Getting ahead 0-1 drops batter BA to .300 — a huge advantage. That's why first-pitch strikes are non-negotiable."
  ]
};
function Coach({mood="neutral",msg=null}){
  const face=mood==="success"?"😄":mood==="warning"?"🤔":"😮";
  const bg=mood==="success"?"rgba(34,197,94,.06)":mood==="warning"?"rgba(245,158,11,.06)":"rgba(239,68,68,.06)";
  const bc=mood==="success"?"rgba(34,197,94,.15)":mood==="warning"?"rgba(245,158,11,.15)":"rgba(239,68,68,.15)";
  const tc=mood==="success"?"#22c55e":mood==="warning"?"#f59e0b":"#ef4444";
  if(!msg)return null;
  return(<div style={{display:"flex",alignItems:"flex-start",gap:10,background:bg,border:`1px solid ${bc}`,borderRadius:12,padding:"10px 12px",marginBottom:8,animation:"sd .35s ease-out"}}>
    <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#1a1a2e,#16213e)",border:"2px solid rgba(245,158,11,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{face}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:9,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Coach says...</div>
      <div style={{fontSize:13,fontWeight:600,color:tc,lineHeight:1.4}}>{msg}</div>
    </div>
  </div>);
}
const _recentCoachLines=[]
function getCoachLine(cat,pos,streak,isPro=false){
  const _notRecent=line=>!_recentCoachLines.includes(line)
  const _pick=arr=>{const fresh=arr.filter(_notRecent);const pool=fresh.length>0?fresh:arr;return pool[Math.floor(Math.random()*pool.length)]}
  const _record=line=>{_recentCoachLines.push(line);if(_recentCoachLines.length>5)_recentCoachLines.shift();return line}
  if(isPro){
    // Priority 1 (70%): Position-specific lines
    if(pos&&Math.random()<0.7){
      const posLines=cat==="success"?COACH_LINES.posSuccess:cat==="danger"?COACH_LINES.posDanger:null;
      if(posLines?.[pos]){const v=posLines[pos];const line=_pick(Array.isArray(v)?v:[v]);if(line)return _record(line)}
    }
    // Priority 2 (20%): Facts
    if(cat==="success"&&Math.random()<0.2){const line=_pick(COACH_LINES.facts);if(line)return _record(line)}
    // Priority 3: Streak lines (only at 5+, not 3)
    if(cat==="success"&&streak>=5){const maxSt=COACH_LINES.streakLines.length-1;const sl=COACH_LINES.streakLines[Math.min(streak,maxSt)];if(sl&&_notRecent(sl))return _record(sl)}
  }
  // Generic success/warning/danger lines
  const lines=COACH_LINES[cat]||COACH_LINES.danger;return _record(_pick(lines));
}

const DIFF_TAG = [{l:"Rookie",c:"#22c55e"},{l:"Intermediate",c:"#f59e0b"},{l:"Advanced",c:"#ef4444"}];

function LoginScreen({onLogin,onSignup,onSkip,authError,authLoading,btn,ghost}){
  const[email,setEmail]=useState("");const[pw,setPw]=useState("");
  return(<div style={{textAlign:"center",padding:"40px 20px"}}>
    <div style={{fontSize:48,marginBottom:8}}>⚾</div>
    <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#f59e0b",marginBottom:4}}>WELCOME BACK</h2>
    <p style={{color:"#9ca3af",fontSize:13,marginBottom:20}}>Log in to load your progress</p>
    {authError&&<div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:10,padding:"8px 12px",maxWidth:300,margin:"0 auto 12px"}}><span style={{fontSize:12,color:"#ef4444"}}>{authError}</span></div>}
    <div style={{maxWidth:300,margin:"0 auto",display:"flex",flexDirection:"column",gap:10}}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" autoComplete="email" style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:10,padding:"12px",color:"white",fontSize:14,outline:"none"}}/>
      <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" type="password" autoComplete="current-password" style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:10,padding:"12px",color:"white",fontSize:14,outline:"none"}}
        onKeyDown={e=>{if(e.key==="Enter"&&email&&pw)onLogin(email,pw)}}/>
      <button onClick={()=>onLogin(email,pw)} disabled={authLoading||!email||!pw} style={{...btn("linear-gradient(135deg,#2563eb,#3b82f6)"),opacity:authLoading||!email||!pw?.5:1}}>
        {authLoading?"Logging in...":"Log In"}
      </button>
    </div>
    <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
      <button onClick={onSignup} style={{...ghost,color:"#3b82f6",fontSize:12}}>Don't have an account? Sign Up</button>
      <button onClick={onSkip} style={{...ghost,fontSize:11}}>Play without account</button>
    </div>
  </div>);
}

function SignupScreen({onSignup,onLogin,onSkip,authError,authLoading,stats,btn,ghost}){
  const[fn,setFn]=useState("");const[ln,setLn]=useState("");const[email,setEmail]=useState("");const[pw,setPw]=useState("");
  const[fieldErrors,setFieldErrors]=useState({});
  const isUnder13=stats.ageGroup==="6-8"||stats.ageGroup==="9-10";
  const canSubmit=fn&&ln&&email&&pw.length>=8&&!authLoading;
  const validateAndSubmit=()=>{
    const errs={};
    if(!fn.trim())errs.fn="First name is required";
    if(!ln.trim())errs.ln="Last name is required";
    if(!email.trim()||!/\S+@\S+\.\S+/.test(email))errs.email="Please enter a valid email";
    if(pw.length<8)errs.pw="Password must be at least 8 characters";
    setFieldErrors(errs);
    if(Object.keys(errs).length>0)return;
    onSignup({email,password:pw,firstName:fn,lastName:ln,displayName:stats.displayName||fn,ageGroup:stats.ageGroup,existingStats:stats.gp>0?stats:undefined});
  };
  const errStyle={fontSize:11,color:"#ef4444",textAlign:"left",marginTop:2};
  return(<div style={{textAlign:"center",padding:"30px 20px"}}>
    <div style={{fontSize:48,marginBottom:8}}>⚾</div>
    <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#f59e0b",marginBottom:4}}>CREATE ACCOUNT</h2>
    <p style={{color:"#9ca3af",fontSize:13,marginBottom:16}}>Save your progress across devices</p>
    {isUnder13?<div style={{maxWidth:320,margin:"0 auto"}}>
      <div style={{background:"rgba(245,158,11,.06)",border:"1px solid rgba(245,158,11,.15)",borderRadius:12,padding:"16px",marginBottom:16}}>
        <div style={{fontSize:32,marginBottom:8}}>👋</div>
        <div style={{fontSize:14,fontWeight:700,color:"#f59e0b",marginBottom:6}}>Coming Soon for Younger Players!</div>
        <p style={{fontSize:12,color:"#9ca3af",lineHeight:1.5}}>Account creation for players under 13 is coming soon! A parent will be able to create an account for you. For now, keep playing — your progress is saved on this device.</p>
      </div>
      <button onClick={onSkip} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{maxWidth:280}}}>Keep Playing</button>
    </div>:<div>
      {authError&&<div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:10,padding:"8px 12px",maxWidth:300,margin:"0 auto 12px"}}><span style={{fontSize:12,color:"#ef4444"}}>{authError}</span></div>}
      <div style={{maxWidth:300,margin:"0 auto",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}>
            <input value={fn} onChange={e=>{setFn(e.target.value);setFieldErrors(fe=>({...fe,fn:undefined}))}} placeholder="First Name" autoComplete="given-name" style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1.5px solid ${fieldErrors.fn?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"12px",color:"white",fontSize:14,outline:"none"}}/>
            {fieldErrors.fn&&<div style={errStyle}>{fieldErrors.fn}</div>}
          </div>
          <div style={{flex:1}}>
            <input value={ln} onChange={e=>{setLn(e.target.value);setFieldErrors(fe=>({...fe,ln:undefined}))}} placeholder="Last Name" autoComplete="family-name" style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1.5px solid ${fieldErrors.ln?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"12px",color:"white",fontSize:14,outline:"none"}}/>
            {fieldErrors.ln&&<div style={errStyle}>{fieldErrors.ln}</div>}
          </div>
        </div>
        <div>
          <input value={email} onChange={e=>{setEmail(e.target.value);setFieldErrors(fe=>({...fe,email:undefined}))}} placeholder="Email" type="email" autoComplete="email" style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1.5px solid ${fieldErrors.email?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"12px",color:"white",fontSize:14,outline:"none"}}/>
          {fieldErrors.email&&<div style={errStyle}>{fieldErrors.email}</div>}
        </div>
        <div>
          <input value={pw} onChange={e=>{setPw(e.target.value);setFieldErrors(fe=>({...fe,pw:undefined}))}} placeholder="Password (8+ characters)" type="password" autoComplete="new-password" style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1.5px solid ${fieldErrors.pw?"rgba(239,68,68,.5)":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"12px",color:"white",fontSize:14,outline:"none"}}
            onKeyDown={e=>{if(e.key==="Enter")validateAndSubmit()}}/>
          {fieldErrors.pw&&<div style={errStyle}>{fieldErrors.pw}</div>}
        </div>
        <button onClick={validateAndSubmit} disabled={authLoading} style={{...btn("linear-gradient(135deg,#059669,#22c55e)"),opacity:authLoading?.5:1}}>
          {authLoading?"Creating Account...":"Create Account"}
        </button>
        {stats.gp>0&&<div style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.12)",borderRadius:8,padding:"6px 10px"}}>
          <span style={{fontSize:10,color:"#93c5fd"}}>Your existing progress ({stats.gp} games, {(stats.cl||[]).length} concepts) will be saved to your account</span>
        </div>}
      </div>
      <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
        <button onClick={onLogin} style={{...ghost,color:"#3b82f6",fontSize:12}}>Already have an account? Log In</button>
        <button onClick={onSkip} style={{...ghost,fontSize:11}}>Play without account</button>
      </div>
    </div>}
  </div>);
}
