
export default function App(){
  const[screen,setScreen]=useState("loading");
  const[pos,setPos]=useState(null);
  const[sc,setSc]=useState(null);
  const[choice,setChoice]=useState(null);
  const[od,setOd]=useState(null);
  const[ri,setRi]=useState(-1);
  const[fo,setFo]=useState(null);
  const[ak,setAk]=useState(0);
  const[showC,setShowC]=useState(false);
  const[toast,setToast]=useState(null);
  const[panel,setPanel]=useState(null); // 'ach','concepts','stats','settings'
  const[showExp,setShowExp]=useState(true);
  const[stats,setStats]=useState(DEFAULT);
  const hist=stats.hist||{};
  const setHist=useCallback((updater)=>{setStats(p=>({...p,hist:typeof updater==='function'?updater(p.hist||{}):updater}))},[]);
  const[lvlUp,setLvlUp]=useState(null);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiLoadTick,setAiLoadTick]=useState(0);
  useEffect(()=>{if(!aiLoading){setAiLoadTick(0);return}const iv=setInterval(()=>setAiLoadTick(t=>t+1),1000);return()=>clearInterval(iv)},[aiLoading])
  const[coachMsg,setCoachMsg]=useState(null);
  const[parentGate,setParentGate]=useState(false);
  const[parentGateInline,setParentGateInline]=useState(null); // {a,b,answer:""} when showing inline gate
  const[showProBenefits,setShowProBenefits]=useState(false);
  const[showProgression,setShowProgression]=useState(false);
  const[explainMore,setExplainMore]=useState(null); // string result from AI
  const[explainLoading,setExplainLoading]=useState(false);
  const[deepAnalysis,setDeepAnalysis]=useState(null); // 70B deep RE24/situational analysis
  const[deepAnalysisLoading,setDeepAnalysisLoading]=useState(false);
  const[aiMode,setAiMode]=useState(false); // true when playing AI-generated scenario
  const[wrongStreak,setWrongStreak]=useState(0); // consecutive wrong answers (reset on correct or position change)
  const[explDepthLayer,setExplDepthLayer]=useState(0); // 0=simple, 1=why, 2=data (progressive explanation depth)
  const[aiFallback,setAiFallback]=useState(false); // true when AI failed and we're showing handcrafted
  const[aiFallbackBanner,setAiFallbackBanner]=useState(false); // true when forceAI fell back — show encouraging banner
  const[flagOpen,setFlagOpen]=useState(false); // rich flag UI open state
  const[flagComment,setFlagComment]=useState(""); // flag comment text
  const[dailyMode,setDailyMode]=useState(false); // true when playing daily diamond challenge
  const[seasonMode,setSeasonMode]=useState(false);
  const[tutStep,setTutStep]=useState(-1); // Phase 3.5: start at age selection
  const[masteryPos,setMasteryPos]=useState(null);
  const[seasonStageIntro,setSeasonStageIntro]=useState(null); // stage object to show intro for
  const[lastSeasonStage,setLastSeasonStage]=useState(-1); // track which stage we've shown intro for
  // Speed Round state
  const[speedMode,setSpeedMode]=useState(false);
  const[speedFilter,setSpeedFilter]=useState(null); // null = show picker, string[] = filtered positions
  const[speedRound,setSpeedRound]=useState(null); // {round,total,results:[],startTime}
  const speedTimerMax=stats.ageGroup==="6-8"?30:stats.ageGroup==="9-10"?22:stats.ageGroup==="11-12"?17:15;
  const[timer,setTimer]=useState(speedTimerMax);
  const[timerActive,setTimerActive]=useState(false);
  const[timerGo,setTimerGo]=useState(false);
  const timerRef=useRef(null);
  // BUG-08: Queue level-up during Speed Round
  const pendingLvlUpRef=useRef(null);
  // Game Film Mode: replay animation on outcome screen
  // Auto-expand for wrong answers so player sees the correct play
  const[showReplay,setShowReplay]=useState(false);
  const[replayKey,setReplayKey]=useState(0);
  const[replayAutoExpanded,setReplayAutoExpanded]=useState(false);
  const[showFailComparison,setShowFailComparison]=useState(false);
  const[comparisonPhase,setComparisonPhase]=useState(0); // 0=failure, 1=transition, 2=success
  const[replayPaused,setReplayPaused]=useState(false);
  const[showHighlights,setShowHighlights]=useState(false);
  const[highlightIdx,setHighlightIdx]=useState(0);
  // QW2: Auto-expand replay for wrong answers on outcome screen
  // Skip for brand new players (gp<3) and speed/survival modes
  React.useEffect(()=>{
    if(screen==="outcome"&&od&&!od.isOpt&&od.cat==="danger"&&sc?.anim&&!speedMode&&!survivalMode&&stats.gp>=3){
      setShowReplay(true);setReplayAutoExpanded(true);
      // Scroll replay into view on mobile after brief delay
      setTimeout(()=>{const el=document.querySelector('[data-replay-field]');if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'})},400);
    }else if(screen!=="outcome"){
      setReplayAutoExpanded(false);setShowFailComparison(false);
    }
  },[screen,od]);
  // Phase 2.2: Placement test state
  const[placementMode,setPlacementMode]=useState(false);
  const[placementData,setPlacementData]=useState(null); // {pos, scenarios:[], round:0, correct:0}
  // Survival Mode state
  const[survivalMode,setSurvivalMode]=useState(false);
  const[survivalRun,setSurvivalRun]=useState(null); // {count,pts,concepts[]}
  // Real Game mode state (Pillar 7D)
  const[realGameMode,setRealGameMode]=useState(false);
  const[realGame,setRealGame]=useState(null); // {inning,playerScore,opponentScore,results:[],isComplete}
  const realGameNextRef=useRef(null);
  // Situation Room state
  const[sitMode,setSitMode]=useState(false);
  const[sitSet,setSitSet]=useState(null); // current SITUATION_SETS entry
  const[sitQ,setSitQ]=useState(0); // current question index
  const[sitResults,setSitResults]=useState([]); // [{pos,correct,xp,choice,best}]
  const[sitTab,setSitTab]=useState(null); // difficulty tab for picker (1/2/3, null=auto)
  const[sitTransition,setSitTransition]=useState(null); // {qIdx, pos, label, emoji, color, total} or null
  const[filmStep,setFilmStep]=useState(-1); // Film Room: -1=not started, 0..N-1=position steps, N=summary
  const filmTimerRef=useRef(null);
  const[aiSitLoading,setAiSitLoading]=useState(false); // AI situation generation in progress
  const aiSitAbortRef=useRef(null);
  const snd=useSound();
  // Baseball Brain state (hoisted to top level per Rules of Hooks)
  const[brainTab,setBrainTab]=useState("re24");
  const[reRunners,setReRunners]=useState([]);
  const[reOuts,setReOuts]=useState(0);
  const[reLastAction,setReLastAction]=useState(null);
  const[rePrevRE,setRePrevRE]=useState(null);
  const[selCount,setSelCount]=useState(null);
  const[countPerspective,setCountPerspective]=useState("hitter");
  const[selPitch,setSelPitch]=useState(null);
  const[seqPitches,setSeqPitches]=useState([]);
  const[seqMode,setSeqMode]=useState(false);
  const[stealDelivery,setStealDelivery]=useState(1.35);
  const[stealPop,setStealPop]=useState(2.00);
  const[stealRunner,setStealRunner]=useState(3.55);
  const[stealOuts,setStealOuts]=useState(0);
  const[showPitchClock,setShowPitchClock]=useState(true);
  const[selConcept,setSelConcept]=useState(null);
  const[domainFilter,setDomainFilter]=useState(null);
  const[pcCount,setPcCount]=useState(65);
  const[pcTTO,setPcTTO]=useState(2);
  const[wpInning,setWpInning]=useState(7);
  const[wpDiff,setWpDiff]=useState(0);
  const[showDivergence,setShowDivergence]=useState(false);
  const[mPitcher,setMPitcher]=useState("R");
  const[mBatter,setMBatter]=useState("L");
  const[mTTO,setMTTO]=useState(1);
  const[mPC,setMPC]=useState(50);
  const[parkType,setParkType]=useState("neutral");
  const[windDir,setWindDir]=useState("out");
  const[defPreset,setDefPreset]=useState("normal");
  const[defOuts,setDefOuts]=useState(1);
  const[defRunners,setDefRunners]=useState([3]);
  const[selMoment,setSelMoment]=useState(null);
  const[momentChoice,setMomentChoice]=useState(null);

  const[sessionRecap,setSessionRecap]=useState(null); // {plays,correct,concepts:[],newConcepts:[],improvement:bool}
  const sessionRef=useRef({plays:0,correct:0,concepts:[],newConcepts:[]});
  const sessionPlanRef=useRef(null); // Session planner: array of {type, concept} or null
  const sessionPlanPosRef=useRef(null); // Track which position the plan was built for
  const abortRef=useRef(null);
  const skipAiRef=useRef(null); // Skip-to-handcrafted handler set by doAI
  const aiFailRef=useRef({consecutive:0,cooldownUntil:0});
  const outcomeStartRef=useRef(0);
  // Sprint 2.3: AI pre-generation cache
  const aiCacheRef=useRef({scenarios:{},generating:false,lastGenTime:0,fetching:false,fetchingPositions:{}});
  const lastScRef=useRef(null);
  lastScRef.current=sc?.id||null;
  const conceptTargetRef=useRef(null); // Set by "Recommended for You" click to target a specific concept
  const lastAiScenarioRef=useRef(null); // Track last AI scenario for connected arcs (Pillar 3C)
  const speedNextRef=useRef(null);
  const survivalNextRef=useRef(null);
  const seasonNextRef=useRef(null);
  const goHomeRef=useRef(null);

  const[achCelebration,setAchCelebration]=useState(null); // Sprint D2: full-screen achievement celebration
  const[challengeMode,setChallengeMode]=useState(false);
  const[challengeId,setChallengeId]=useState(null);
  const[upgradeGatePass,setUpgradeGatePass]=useState(()=>sessionStorage.getItem('bsm_upgradeGate')==='true');
  const[upgradeGateA]=useState(()=>Math.floor(Math.random()*10)+5);
  const[upgradeGateB]=useState(()=>Math.floor(Math.random()*10)+3);
  // Auth state
  const[authToken,setAuthToken]=useState(()=>localStorage.getItem('bsm_auth_token'));
  const[authUser,setAuthUser]=useState(null);
  const[authProfile,setAuthProfile]=useState(null);
  const[syncStatus,setSyncStatus]=useState('idle'); // 'idle'|'syncing'|'synced'|'error'
  const[authError,setAuthError]=useState(null);
  const[authLoading,setAuthLoading]=useState(false);
  const syncTimerRef=useRef(null);
  const lastSyncRef=useRef(null);
  const localSaveTimerRef=useRef(null);
  const placeholderNameRef=useRef(BASEBALL_NAMES[Math.floor(Math.random()*BASEBALL_NAMES.length)]);
  // Auth helpers
  const authFetch=useCallback(async(path,opts={})=>{
    const headers={...opts.headers};
    let body=opts.body;
    if(body&&typeof body==='object'&&!(body instanceof FormData)){headers["Content-Type"]="application/json";body=JSON.stringify(body);}
    if(authToken)headers["Authorization"]=`Bearer ${authToken}`;
    const res=await fetch(WORKER_BASE+path,{...opts,headers,body});
    return res.json();
  },[authToken]);

  const doLogout=useCallback(()=>{
    if(authToken)authFetch("/auth/logout",{method:"POST"}).catch(()=>{});
    setAuthToken(null);setAuthUser(null);setAuthProfile(null);setSyncStatus('idle');
    localStorage.removeItem('bsm_auth_token');
  },[authToken,authFetch]);

  const syncToServer=useCallback(async(statsToSync)=>{
    if(!authToken)return;
    setSyncStatus('syncing');
    try{
      const d=await authFetch("/auth/sync",{method:"POST",body:{stats:statsToSync}});
      if(d.ok)setSyncStatus('synced');
      else setSyncStatus('error');
    }catch{setSyncStatus('error');}
  },[authToken,authFetch]);

  // Migrate: bootstrap posPlayed from hist if missing (one-time for existing users)
  function migrateStats(s){
    if(!s.posPlayed&&s.hist){const pp={};for(const[pos,ids] of Object.entries(s.hist)){pp[pos]=[...new Set(ids)];}s.posPlayed=pp;}
    return s;
  }

  // Load
  useEffect(()=>{(async()=>{
    // Clear stale circuit breakers from previous session
    clearAllCircuitBreakers()
    // Log local pool inventory
    try{const _pool=getLocalPool();const _inv={};_pool.forEach(e=>{_inv[e.position]=(_inv[e.position]||0)+1});const _empty=Object.keys(SCENARIOS).filter(k=>!_inv[k]);console.log("[BSM DEBUG] Local pool inventory on load: total="+_pool.length+"/"+LOCAL_POOL_MAX+", empty positions: "+(_empty.length>0?_empty.join(","):"none"),_inv)}catch{}
    // Load local state first
    let localStats=null;
    try{const r=await window.storage.get(STORAGE_KEY);if(r?.value)localStats=JSON.parse(r.value);}catch{}

    // If auth token exists, try to validate session and merge server state
    const token=localStorage.getItem('bsm_auth_token');
    if(token){
      try{
        const res=await fetch(WORKER_BASE+"/auth/me",{headers:{"Authorization":`Bearer ${token}`}});
        const d=await res.json();
        if(d.ok){
          setAuthUser(d.user);setAuthProfile(d.profile);
          // Merge: server stats with local — higher gp wins
          const serverStats=d.stats||{};
          const merged=localStats?(serverStats.gp||0)>=(localStats.gp||0)?{...DEFAULT,...serverStats}:{...DEFAULT,...localStats}:{...DEFAULT,...serverStats};
          merged.sessionCount=(merged.sessionCount||0)+1;migrateStats(merged);
          setStats(merged);snd.setEnabled(merged.soundOn!==false);
          if(merged.onboarded)setScreen("home");else setScreen("onboard");
        } else {
          // Token expired/invalid — clear and fall back to local
          localStorage.removeItem('bsm_auth_token');setAuthToken(null);
          if(localStats){const ls=migrateStats({...DEFAULT,...localStats,sessionCount:(localStats.sessionCount||0)+1});setStats(ls);snd.setEnabled(ls.soundOn!==false);setScreen(ls.onboarded?"home":"onboard");}
          else setScreen("onboard");
        }
      }catch{
        // Network error — fall back to local
        if(localStats){const ls=migrateStats({...DEFAULT,...localStats,sessionCount:(localStats.sessionCount||0)+1});setStats(ls);snd.setEnabled(ls.soundOn!==false);setScreen(ls.onboarded?"home":"onboard");}
        else setScreen("onboard");
      }
    } else {
      if(localStats){const ls=migrateStats({...DEFAULT,...localStats,sessionCount:(localStats.sessionCount||0)+1});setStats(ls);snd.setEnabled(ls.soundOn!==false);setScreen(ls.onboarded?"home":"onboard");}
      else setScreen("onboard");
    }
    // Check for challenge in URL
    const hash=window.location.hash;if(hash.startsWith("#challenge=")){const cid=hash.slice(11);setChallengeId(cid);window.location.hash="";}
    // Sprint D3: Check for 5-scenario challenge pack in URL
    const params=new URLSearchParams(window.location.search);
    const cpkId=params.get("cpk");
    if(cpkId){
      window.history.replaceState({},"",window.location.pathname+window.location.hash);
      fetch(WORKER_BASE+"/challenge/get",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({challengeId:cpkId})})
        .then(r=>r.json()).then(d=>{
          if(d.ok){
            const allSc=Object.entries(SCENARIOS).flatMap(([p,arr])=>arr.map(s=>({...s,_pos:p})));
            const matched=d.scenarioIds.map(sid=>allSc.find(s=>s.id===sid)).filter(Boolean);
            if(matched.length===5){
              setChallengePack({id:cpkId,scenarioIds:d.scenarioIds,scenarios:matched,round:0,results:[],creating:false,creatorName:d.creatorName,creatorScore:d.creatorScore});
              const first=matched[0];
              setPos(first._pos);setSc(first);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);setScreen("play");
              first.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
              setToast({e:"⚔️",n:"Challenge Accepted!",d:`Beat ${d.creatorName}'s score of ${d.creatorScore} pts!`});
              setTimeout(()=>setToast(null),3500);
            }
          } else {
            setToast({e:"⚠️",n:"Challenge Not Found",d:"This challenge link may have expired."});
            setTimeout(()=>setToast(null),4000);
          }
        }).catch(()=>{
          setToast({e:"⚠️",n:"Couldn't Load Challenge",d:"Check your connection and try again."});
          setTimeout(()=>setToast(null),4000);
        });
    }
    // Check for Stripe return
    if(params.get("pro")==="success"){
      const plan=params.get("plan")||"monthly";
      const expiry=plan==="yearly"?Date.now()+365*86400000:Date.now()+31*86400000;
      setStats(p=>{
        // Sprint 4.1: Record activation server-side
        const email=(p.email||authUser?.email||"").trim().toLowerCase();
        if(email){
          fetch(WORKER_BASE+"/activate-pro",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,plan,proExpiry:expiry})}).catch(()=>{});
        }
        return {...p,isPro:true,proPlan:plan,proPurchaseDate:Date.now(),proExpiry:expiry,funnel:[...(p.funnel||[]).slice(-99),{event:"pro_activated",ts:Date.now()}]};
      });
      setTimeout(()=>{setToast({e:"⭐",n:"Welcome to All-Star Pass!",d:"Unlimited play, AI coaching, and more!"});try{snd.play('ach')}catch(e){}setTimeout(()=>setToast(null),4000)},800);
      window.history.replaceState({},"",window.location.pathname+window.location.hash);
    }
    // Check for promo code in URL (?code=BSM-XXXXXX)
    const urlCode=params.get("code");
    if(urlCode){
      window.history.replaceState({},"",window.location.pathname+window.location.hash);
      // Sprint 4.1: pass email for server-side promo tracking
      const promoEmail=(authUser?.email||"").trim().toLowerCase();
      fetch(WORKER_BASE+"/validate-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:urlCode,email:promoEmail})})
        .then(r=>r.json()).then(d=>{
          if(d.valid){
            const expiry=d.type==="30day"?Date.now()+30*86400000:null;
            setStats(p=>({...p,isPro:true,proPlan:"promo-"+d.type,proExpiry:expiry,promoCode:urlCode.trim().toUpperCase(),promoActivatedDate:Date.now(),funnel:[...(p.funnel||[]).slice(-99),{event:"promo_redeemed",ts:Date.now()}]}));
            setTimeout(()=>{setToast({e:"🎟️",n:"Promo Code Activated!",d:d.type==="lifetime"?"Lifetime All-Star Pass unlocked!":"30-day All-Star Pass unlocked!"});snd.play('ach');setTimeout(()=>setToast(null),4000)},500);
          } else {
            setTimeout(()=>{setToast({e:"❌",n:"Invalid Code",d:d.reason==="already_used"?"This code has already been used.":"That promo code is not valid."});setTimeout(()=>setToast(null),4000)},500);
          }
        }).catch(()=>{setTimeout(()=>{setToast({e:"⚠️",n:"Error",d:"Could not verify promo code. Try again later."});setTimeout(()=>setToast(null),4000)},500)});
    }
  })()},[]);
  // Sprint D1: Register service worker for push notifications
  useEffect(()=>{
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
  },[]);
  // Pro user app-load prefetch: warm pools for top 5 most-played positions
  const _proWarmDone=useRef(false)
  useEffect(()=>{
    if(!stats.isPro||!stats.ps||_proWarmDone.current)return
    _proWarmDone.current=true
    const top5=Object.entries(stats.ps).filter(([,v])=>v.p>=2).sort((a,b)=>b[1].p-a[1].p).slice(0,5).map(([k])=>k)
    if(top5.length===0)return
    console.log("[BSM DEBUG] Pro warm prefetch: top positions =",top5)
    // First position: immediate cache prefetch for fastest first-play
    if(top5[0]&&!aiCacheRef.current.fetching&&!aiCacheRef.current.scenarios[top5[0]]?.scenario){
      prefetchAIScenario(top5[0],stats,stats.cl||[],stats.recentWrong||[],stats.aiHistory||[],null,null,aiCacheRef)
    }
    // Remaining positions: queued sequentially (max 1 xAI call at a time)
    top5.slice(1).forEach(pos=>fillLocalPool(pos,stats))
  },[stats.isPro,stats.ps])
  // Sprint 4.2+4.5: Track session start with load performance
  useEffect(()=>{
    const perf=typeof performance!=="undefined"?performance.now():null;
    trackAnalyticsEvent("session_start",{level:stats.lv||1,gamesPlayed:stats.gp||0,scenariosCompleted:(stats.cl||[]).length,loadTimeMs:perf?Math.round(perf):null},{ageGroup:stats.ageGroup,isPro:stats.isPro});
  },[]);
  // Save (debounced local + debounced server sync)
  useEffect(()=>{
    // Debounced local save (2s) with quota guard
    if(localSaveTimerRef.current)clearTimeout(localSaveTimerRef.current);
    localSaveTimerRef.current=setTimeout(()=>{
      (async()=>{try{
        const json=JSON.stringify(stats)
        // Quota guard: warn if approaching 4MB (mobile Safari limit ~5MB)
        if(json.length>4*1024*1024){
          console.warn("[BSM] localStorage data exceeds 4MB — trimming aiHistory")
          const trimmed={...stats,aiHistory:(stats.aiHistory||[]).slice(-20),sessionHistory:(stats.sessionHistory||[]).slice(-50)}
          await window.storage.set(STORAGE_KEY,JSON.stringify(trimmed))
        } else {
          await window.storage.set(STORAGE_KEY,json)
        }
      }catch(e){console.warn("[BSM] localStorage save failed:",e.message)}})()
    },2000);
    // Debounced server sync (3s after last change)
    if(authToken){
      if(syncTimerRef.current)clearTimeout(syncTimerRef.current);
      syncTimerRef.current=setTimeout(()=>{
        const json=JSON.stringify(stats);
        if(json!==lastSyncRef.current){lastSyncRef.current=json;syncToServer(stats);}
      },3000);
    }
  },[stats,authToken,syncToServer]);
  // Sprint 4.1: Server-side Pro verification on mount + Pro expiry check
  const proVerifiedRef=useRef(false);
  useEffect(()=>{
    // Client-side expiry check (fast, immediate)
    if(stats.isPro&&stats.proExpiry&&stats.proExpiry<Date.now()){
      setStats(p=>({...p,isPro:false}));
      setTimeout(()=>{setToast({e:"⏰",n:"All-Star Pass Expired",d:"Renew to keep unlimited play and AI coaching."});setTimeout(()=>setToast(null),4000)},500);
      return;
    }
    // Server-side verification (once per session)
    if(proVerifiedRef.current)return;
    proVerifiedRef.current=true;
    const email=(stats.email||authUser?.email||"").trim().toLowerCase();
    fetch(WORKER_BASE+"/verify-pro",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,isPro:stats.isPro,proExpiry:stats.proExpiry,proPlan:stats.proPlan})
    }).then(r=>r.json()).then(d=>{
      if(!d.ok)return;
      if(d.isPro&&!stats.isPro){
        // Server says Pro but client doesn't know — restore Pro
        setStats(p=>({...p,isPro:true,proExpiry:d.proExpiry||p.proExpiry,proPlan:d.proPlan||p.proPlan}));
        setTimeout(()=>{setToast({e:"⭐",n:"All-Star Pass Restored!",d:"Your All-Star Pass is active."});setTimeout(()=>setToast(null),3000)},500);
      } else if(!d.isPro&&stats.isPro&&d.source!=="client_trusted"&&d.source!=="server_error"){
        // Server says NOT Pro but client thinks Pro — revoke (unless graceful degradation)
        setStats(p=>({...p,isPro:false,proExpiry:null}));
        setTimeout(()=>{setToast({e:"⏰",n:"All-Star Pass Expired",d:"Renew to keep unlimited play and AI coaching."});setTimeout(()=>setToast(null),4000)},500);
      }
      // If server confirms Pro, optionally update expiry from server
      if(d.isPro&&d.proExpiry&&stats.isPro){
        setStats(p=>({...p,proExpiry:d.proExpiry}));
      }
    }).catch(()=>{/* Network error — keep local state, graceful degradation */});
  },[stats.isPro,stats.proExpiry]);
  // Leaderboard: update weekly entry
  const[lbData,setLbData]=useState({week:"",entries:[]});
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(LB_KEY);if(r?.value)setLbData(JSON.parse(r.value))}catch{}})()},[]);
  useEffect(()=>{if(!stats.displayName||!stats.gp)return;
    const week=getWeek();
    setLbData(prev=>{
      const entries=(prev.week===week?prev.entries:[]).filter(e=>e.name!==stats.displayName);
      entries.push({name:stats.displayName,pts:stats.pts,acc:stats.gp>0?Math.round((stats.co/stats.gp)*100):0,streak:stats.ds,gp:stats.gp});
      entries.sort((a,b)=>b.pts-a.pts);
      const next={week,entries:entries.slice(0,20)};
      (async()=>{try{await window.storage.set(LB_KEY,JSON.stringify(next))}catch{}})();
      return next;
    });
  },[stats.pts,stats.displayName]);
  // Daily tracking with streak freeze support
  useEffect(()=>{const today=new Date().toDateString();if(stats.todayDate&&stats.todayDate!==today){
    const yesterday=new Date(Date.now()-86400000).toDateString();
    const twoDaysAgo=new Date(Date.now()-2*86400000).toDateString();
    const wasYesterday=stats.lastDay===yesterday;
    // Check if streak would break (missed yesterday but played day before)
    const wouldBreak=!wasYesterday&&stats.ds>0;
    // If missed only 1 day and have a freeze, use it
    const missedOneDay=!wasYesterday&&stats.lastDay===twoDaysAgo&&stats.streakFreezes>0&&stats.ds>0;
    let newDs,newFreezes=stats.streakFreezes;
    if(wasYesterday){newDs=stats.ds+1}
    else if(missedOneDay){newDs=stats.ds;newFreezes=stats.streakFreezes-1;
      // Show "Streak Saved!" toast
      setTimeout(()=>{setToast({e:"🧊",n:"Streak Saved!",d:`Used a streak freeze. ${newFreezes} remaining.`});setTimeout(()=>setToast(null),3500)},500);
    }else{newDs=1}
    // Pro-only: auto-grant 1 streak freeze per week (max 3)
    let newLastFreeze=stats.lastStreakFreezeDate;
    if(stats.isPro){
      const weekMs=7*86400000;
      if(!stats.lastStreakFreezeDate||Date.now()-stats.lastStreakFreezeDate>=weekMs){
        if(newFreezes<3){newFreezes=Math.min(3,newFreezes+1);newLastFreeze=Date.now();}
      }
    }
    // Check for streak milestone celebration
    if(STREAK_MILESTONES.includes(newDs)&&newDs>stats.ds){
      const fl=getFlame(newDs);
      setTimeout(()=>{setLvlUp({e:fl.icon,n:`${newDs}-Day Streak!`,c:fl.color});snd.play('streak')},800);
    }
    setStats(p=>({...p,todayPlayed:0,todayDate:today,ds:newDs,streakFreezes:newFreezes,lastStreakFreezeDate:newLastFreeze,lastDay:p.todayDate,dailyDone:p.dailyDate===today?p.dailyDone:false,dailyDate:today,brainFactIdx:((p.brainFactIdx||0)+1)%20}));
  }},[stats.todayDate]);

  // Handle challenge links
  useEffect(()=>{
    if(!challengeId||screen!=="home")return;
    const allSc=Object.entries(SCENARIOS).flatMap(([p,arr])=>arr.map(s=>({...s,_pos:p})));
    const sc=allSc.find(s=>s.id===challengeId);
    if(sc){setChallengeMode(true);setPos(sc._pos);setSc(sc);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);setScreen("play");sc.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});setChallengeId(null);}
    else setChallengeId(null);
  },[challengeId,screen]);

  const shareChallenge=useCallback(async()=>{
    if(!sc)return;
    const url=`${window.location.origin}${window.location.pathname}#challenge=${sc.id}`;
    const shareData={title:"Baseball Strategy Master Challenge",text:`Can you beat this scenario? "${sc.title}"`,url};
    try{
      if(navigator.share){await navigator.share(shareData);return;}
    }catch(e){if(e.name==='AbortError')return;}
    try{
      await navigator.clipboard.writeText(url);
      setToast({e:"📎",n:"Link Copied!",d:"Send to a friend to challenge them"});
    }catch{
      setToast({e:"⚠️",n:"Couldn't Copy",d:"Try copying this URL manually"});
    }
    setTimeout(()=>setToast(null),3000);
  },[sc]);

  // Age-group difficulty cap (moved above challenge pack which depends on it)
  const maxDiff=(AGE_GROUPS.find(a=>a.id===stats.ageGroup)||AGE_GROUPS[2]).maxDiff;

  // Sprint D3: 5-Scenario Challenge a Friend system
  const[challengePack,setChallengePack]=useState(null); // {id,scenarioIds,round,results,creatorScore,creatorName,challengerName,challengerScore,winner}
  const startChallengePack=useCallback(async()=>{
    const allSc=Object.entries(SCENARIOS).flatMap(([p,arr])=>arr.map(s=>({...s,_pos:p})));
    const pool=allSc.filter(s=>(s.diff||1)<=maxDiff);
    const shuffled=[...pool].sort(()=>Math.random()-.5).slice(0,5);
    setChallengePack({scenarioIds:shuffled.map(s=>s.id),scenarios:shuffled,round:0,results:[],creating:true});
    // Play the first scenario
    const first=shuffled[0];
    setPos(first._pos);setSc(first);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);setScreen("play");
    first.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
  },[maxDiff]);
  const advanceChallengePack=useCallback((isOpt,pts)=>{
    setChallengePack(prev=>{
      if(!prev)return null;
      const newResults=[...prev.results,{isOpt,pts,scenarioId:prev.scenarioIds[prev.round]}];
      const nextRound=prev.round+1;
      if(nextRound>=5){
        // Finished all 5 — submit to server
        const totalPts=newResults.reduce((s,r)=>s+r.pts,0);
        const correct=newResults.filter(r=>r.isOpt).length;
        if(prev.creating){
          // Creator finished — save to server
          fetch(WORKER_BASE+"/challenge/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({creatorName:stats.displayName||"Player",scenarioIds:prev.scenarioIds,creatorScore:totalPts})})
            .then(r=>r.json()).then(d=>{
              if(d.ok)setChallengePack(p=>p?{...p,id:d.challengeId,round:5,results:newResults,done:true,totalPts,correct}:null);
            }).catch(()=>{setChallengePack(p=>p?{...p,round:5,results:newResults,done:true,totalPts,correct,error:true}:null);});
        } else {
          // Challenger finished — submit score
          fetch(WORKER_BASE+"/challenge/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({challengeId:prev.id,challengerName:stats.displayName||"Challenger",challengerScore:totalPts})})
            .then(r=>r.json()).then(d=>{
              if(d.ok)setChallengePack(p=>p?{...p,round:5,results:newResults,done:true,totalPts,correct,winner:d.winner,creatorName:d.creatorName,creatorScore:d.creatorScore}:null);
            }).catch(()=>{setChallengePack(p=>p?{...p,round:5,results:newResults,done:true,totalPts,correct,error:true}:null);});
        }
        return {...prev,round:5,results:newResults};
      }
      // Play next scenario
      const next=prev.scenarios[nextRound];
      setTimeout(()=>{
        setPos(next._pos);setSc(next);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);setScreen("play");
        next.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
      },1500);
      return {...prev,round:nextRound,results:newResults};
    });
  },[stats.displayName]);
  const shareChallengeLink=useCallback(async(packId)=>{
    const url=`${window.location.origin}${window.location.pathname}?cpk=${packId}`;
    const shareData={title:"Baseball Strategy Master — 5-Scenario Challenge",text:`I scored ${challengePack?.totalPts||0} pts on 5 scenarios. Can you beat me?`,url};
    try{if(navigator.share){await navigator.share(shareData);return;}}catch(e){if(e.name==='AbortError')return;}
    try{await navigator.clipboard.writeText(url);setToast({e:"📎",n:"Challenge Link Copied!",d:"Send to a friend!"});}catch{setToast({e:"⚠️",n:"Couldn't Copy",d:"Try again"});}
    setTimeout(()=>setToast(null),3000);
  },[challengePack]);

  const totalSc=Object.values(SCENARIOS).reduce((s,a)=>s+a.length,0);
  const remaining=DAILY_FREE-stats.todayPlayed;
  const atLimit=remaining<=0&&!stats.isPro;
  
  // INFIELD_CATS/OUTFIELD_CATS removed — individual position arrays replace fielder filtering

  // Sprint 3.3: Difficulty auto-calibration — adjusts scenario priority based on player's actual performance
  const getPlayerDifficultyLevel=useCallback(()=>{
    const cal=stats.scenarioCalibration||{}
    const entries=Object.entries(cal).filter(([,v])=>v.attempts>=2)
    if(entries.length<5)return{effDiff:maxDiff,accuracy:null,recommendation:null}
    const totalCorrect=entries.reduce((a,[,v])=>a+v.correct,0)
    const totalAttempts=entries.reduce((a,[,v])=>a+v.attempts,0)
    const accuracy=Math.round(totalCorrect/totalAttempts*100)
    // If accuracy >80% on current difficulty, suggest harder scenarios
    // If accuracy <40%, suggest easier ones
    let recommendation=null
    if(accuracy>=80&&maxDiff<3)recommendation="ready_for_harder"
    else if(accuracy<=40&&maxDiff>1)recommendation="too_hard"
    return{effDiff:maxDiff,accuracy,recommendation}
  },[stats.scenarioCalibration,maxDiff])

  // Sprint 3.1: Concept-weighted scenario scoring — replaces random selection with adaptive learning
  const scoreScenarioForLearning=useCallback((scenario,masteryData,wrongCounts,sessionTags)=>{
    const tag=scenario.conceptTag||findConceptTag(scenario.concept)
    const wc=(wrongCounts||{})[scenario.id]||0
    const cm=(masteryData?.concepts||{})
    const cState=tag&&cm[tag]?cm[tag]:null
    let score=10 // baseline

    // Factor 1: Spaced repetition — due for review gets highest priority
    if(cState&&cState.nextReviewDate){
      const due=new Date(cState.nextReviewDate)
      const now=new Date()
      if(due<=now)score+=30 // overdue for review
      else{
        const daysUntil=(due-now)/(1000*60*60*24)
        if(daysUntil<1)score+=15 // due soon
      }
    }

    // Factor 2: Concept state priority (learning > introduced > degraded > unseen > mastered)
    if(cState){
      const stateScores={degraded:25,learning:20,introduced:15,unseen:10,mastered:0}
      score+=(stateScores[cState.state]||10)
    }else{
      score+=12 // never-seen concept gets moderate priority
    }

    // Factor 3: Wrong answer boost — spaced repetition for specific scenarios
    if(wc>0)score+=Math.min(wc*8,24)

    // Factor 4: Session coherence — boost concepts that build on what was just learned
    // Sprint 3.4: If player got a concept right, boost dependents. If wrong, reinforce.
    if(tag&&sessionTags.length>0){
      const lastRaw=sessionTags[sessionTags.length-1]
      const lastWrong=lastRaw.startsWith("!")
      const lastTag=lastWrong?lastRaw.slice(1):lastRaw
      const concept=BRAIN.concepts[tag]
      if(lastWrong&&tag===lastTag){
        // Player just got this concept wrong — reinforce with a different scenario on same concept
        score+=22
      }else if(!lastWrong&&concept&&concept.prereqs&&concept.prereqs.includes(lastTag)){
        // Player just got prereq right — natural progression to dependent concept
        score+=20
      }
      // Boost if this concept is in the same domain as the last one (thematic coherence)
      const lastConcept=BRAIN.concepts[lastTag]
      if(concept&&lastConcept&&concept.domain===lastConcept.domain&&tag!==lastTag)score+=8
      // Penalize exact same concept if answered correctly (diversity, not reinforcement)
      const cleanTags=sessionTags.map(t=>t.startsWith("!")?t.slice(1):t)
      if(!lastWrong&&cleanTags.includes(tag))score-=15
    }

    // Factor 5: Difficulty calibration — boost scenarios at the player's actual skill edge
    const cal=(stats.scenarioCalibration||{})[scenario.id]
    if(cal&&cal.attempts>=2){
      const acc=cal.correct/cal.attempts
      // Sweet spot: scenarios player gets right 40-70% of the time (zone of proximal development)
      if(acc>=0.4&&acc<=0.7)score+=12
      // Too easy (>85%) — deprioritize
      else if(acc>0.85)score-=8
      // Too hard (<25%) — slight deprioritize unless it's a wrong-count scenario
      else if(acc<0.25&&!wc)score-=5
    }

    // Factor 6: Prerequisite readiness bonus — concepts where prereqs are freshly mastered
    if(tag){
      const concept=BRAIN.concepts[tag]
      if(concept&&concept.prereqs&&concept.prereqs.length>0){
        const prereqsMastered=concept.prereqs.filter(p=>cm[p]&&cm[p].state==="mastered")
        if(prereqsMastered.length===concept.prereqs.length){
          // All prereqs mastered — great time to introduce this concept
          if(!cState||cState.state==="unseen")score+=18
        }
      }
    }

    return Math.max(0,score)
  },[])

  // Weighted random pick: higher scores = higher probability, but not deterministic
  const weightedPick=useCallback((scenarios,masteryData,wrongCounts,sessionTags)=>{
    if(scenarios.length===0)return null
    if(scenarios.length===1)return scenarios[0]
    const scored=scenarios.map(s=>({s,w:scoreScenarioForLearning(s,masteryData,wrongCounts,sessionTags)}))
    const totalW=scored.reduce((a,b)=>a+b.w,0)
    if(totalW===0)return scenarios[Math.floor(Math.random()*scenarios.length)]
    let r=Math.random()*totalW
    for(const{s,w}of scored){r-=w;if(r<=0)return s}
    return scored[scored.length-1].s
  },[scoreScenarioForLearning])

  // Sprint 3.4: Track concepts seen in current session for coherence + diversity
  // Each entry: {tag, correct} to differentiate progression vs reinforcement
  const sessionConceptsRef=useRef([])

  // Smart recycling: when all scenarios seen, prioritize wrong > least-recent > random
  const getSmartRecycle=useCallback((p,src,lastScId)=>{
    const wc=stats.wrongCounts||{};const seen=hist[p]||[];
    // Exclude scenarios already served this session (prevents back-to-back repeats)
    const sessionExclude=id=>id!==lastScId&&!_servedScenarioIds.has(id)
    // Priority 1: scenarios the user got wrong (excluding recently served)
    const wrong=src.filter(s=>wc[s.id]>0&&sessionExclude(s.id));
    if(wrong.length>0)return wrong[Math.floor(Math.random()*wrong.length)];
    // Priority 2: least-recently-seen — avoid the last half of history
    const recentHalf=seen.slice(-Math.floor(src.length/2));
    const stale=src.filter(s=>!recentHalf.includes(s.id)&&sessionExclude(s.id));
    if(stale.length>0)return stale[Math.floor(Math.random()*stale.length)];
    // Priority 3: random from full pool (excluding last played + session served)
    const rest=src.filter(s=>sessionExclude(s.id));
    if(rest.length>0)return rest[Math.floor(Math.random()*rest.length)];
    // Priority 4: if all excluded, just avoid lastScId
    const fallback=src.filter(s=>s.id!==lastScId);
    return fallback.length>0?fallback[Math.floor(Math.random()*fallback.length)]:src[Math.floor(Math.random()*src.length)];
  },[hist,stats.wrongCounts]);

  const getRand=useCallback((p,lastScId)=>{
    let raw=SCENARIOS[p]||[];
    // Difficulty graduation for ages 6-8: unlock diff:2 per-position when ready
    let effMaxDiff=maxDiff;
    if(stats.ageGroup==="6-8"&&(stats.posGrad||{})[p])effMaxDiff=Math.max(effMaxDiff,2);
    const pool=raw.filter(s=>s.diff<=effMaxDiff);const fallback=raw;
    // Adaptive difficulty: use dynamic level from adaptiveDiff (fed by placement + ongoing performance)
    const adaptiveLevel=(stats.adaptiveDiff||{})[p]?.level||(stats.placementDiff||{})[p]||null;
    const adaptivePool=adaptiveLevel>1?pool.filter(s=>s.diff>=Math.max(1,adaptiveLevel-1)&&s.diff<=Math.min(3,adaptiveLevel+1)):null;
    // Prerequisite filter: skip if player has proven adaptive level 2+
    const masteredTags=(stats.cl||[]).map(c=>findConceptTag(c)).filter(Boolean);
    const basePool=adaptivePool&&adaptivePool.length>3?adaptivePool:pool;
    const ready=adaptiveLevel>1?basePool:filterByReadiness(basePool,masteredTags,stats.ageGroup);
    const src=ready.length>0?ready:pool.length>0?pool:fallback;const seen=hist[p]||[];
    const unseen=src.filter(s=>!seen.includes(s.id));
    const eligible=src.filter(s=>s.id!==lastScId);
    const sessionTags=sessionConceptsRef.current
    // Phase 2.1: Guarantee first-play diversity — no repeat concepts in first 5 plays
    const firstPlayDiversity=stats.gp<5;
    const conceptDedup=(pool)=>{
      if(!firstPlayDiversity||sessionTags.length===0)return pool;
      const fresh=pool.filter(s=>{const t=s.conceptTag||findConceptTag(s.concept);return !t||!sessionTags.includes(t)});
      return fresh.length>0?fresh:pool;
    };
    // Sprint 3.1: Concept-weighted selection replaces pure random
    // Spaced repetition: wrong scenarios still get priority, but weighted by concept state
    const wc=stats.wrongCounts||{};
    const wrongInPool=conceptDedup(eligible.filter(s=>wc[s.id]>0));
    if(wrongInPool.length>0){
      const chance=unseen.length>0?0.4:0.6;
      if(Math.random()<chance){
        const pick=weightedPick(wrongInPool,stats.masteryData,wc,sessionTags);
        if(pick){
          const tag=pick.conceptTag||findConceptTag(pick.concept)
          if(tag)sessionConceptsRef.current=[...sessionTags,tag].slice(-10)
          setHist(h=>({...h,[p]:[...(h[p]||[]),pick.id].slice(-src.length)}));return pick;
        }
      }
    }
    const unseenDeduped=conceptDedup(unseen);
    if(unseenDeduped.length>0){
      const s=weightedPick(unseenDeduped,stats.masteryData,wc,sessionTags);
      const tag=s.conceptTag||findConceptTag(s.concept)
      if(tag)sessionConceptsRef.current=[...sessionTags,tag].slice(-10)
      setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));return s;
    }
    // All seen — concept-weighted smart recycling from full eligible pool
    const recyclePool=eligible.length>0?eligible:src;
    const s=weightedPick(recyclePool,stats.masteryData,wc,sessionTags)||getSmartRecycle(p,src,lastScId);
    const tag=s.conceptTag||findConceptTag(s.concept)
    if(tag)sessionConceptsRef.current=[...sessionTags,tag].slice(-10)
    setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));return s;
  },[hist,maxDiff,stats.ageGroup,stats.posGrad,stats.wrongCounts,stats.masteryData,getSmartRecycle,weightedPick]);

  const startDaily=useCallback(()=>{
    if(stats.dailyDone&&stats.dailyDate===new Date().toDateString())return;
    const daily=getDailyScenario();
    snd.play('tap');setPos(daily._pos);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setDailyMode(true);setAiMode(false);setAiLoading(false);
    setSc(daily);setScreen("play");
    daily.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
  },[snd,stats.dailyDone,stats.dailyDate]);

  const startGame=useCallback(async(p,forceAI=false)=>{
    if(aiLoading)return;
    if(atLimit){setPanel('limit');return;}
    // Phase 2.2: Placement test for 11+ on first play of a position
    const isPlacementAge=!["6-8","9-10"].includes(stats.ageGroup);
    const hasPlayed=(stats.ps[p]?.p||0)>0;
    const hasPlacement=(stats.placementDiff||{})[p];
    if(isPlacementAge&&!hasPlayed&&!hasPlacement&&!forceAI&&!placementMode){
      // Use curated PLACEMENT_POOL with randomization for diagnostic quality
      const raw=SCENARIOS[p]||[];
      const pool=PLACEMENT_POOL[p];
      const pickRandom=(ids,n)=>{
        const available=ids.map(id=>raw.find(s=>s.id===id)).filter(Boolean);
        const shuffled=[...available].sort(()=>Math.random()-0.5);
        return shuffled.slice(0,n);
      };
      const d1=pool?pickRandom(pool.diff1,2):raw.filter(s=>s.diff===1).sort(()=>Math.random()-0.5).slice(0,2);
      const d2=pool?pickRandom(pool.diff2,2):raw.filter(s=>s.diff===2).sort(()=>Math.random()-0.5).slice(0,2);
      const d3=pool?pickRandom(pool.diff3,1):raw.filter(s=>s.diff===3).sort(()=>Math.random()-0.5).slice(0,1);
      const placementSc=[...d1,...d2,...d3].slice(0,5);
      if(placementSc.length>=3){
        snd.play('tap');setPos(p);setPlacementMode(true);
        setPlacementData({pos:p,scenarios:placementSc,round:0,correct:0});
        setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);
        setSc(placementSc[0]);setScreen("play");
        placementSc[0].options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
        return;
      }
    }
    cancelPrefetchExcept(p, aiCacheRef) // Cancel stale prefetches for other positions
    snd.play('tap');setPos(p);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);setDailyMode(false);setAiFallback(false);setAiFallbackBanner(false);setWrongStreak(0);setShowReplay(false);

    const raw=SCENARIOS[p]||[];const pool=raw.filter(s=>s.diff<=maxDiff);const seen=hist[p]||[];
    const src=pool.length>0?pool:raw;
    const unseen=src.filter(s=>!seen.includes(s.id));
    const lastScId=lastScRef.current;
    const played=new Set((stats.posPlayed||{})[p]||[]);
    const allExhausted=src.every(s=>played.has(s.id));

    console.log('[BSM] startGame',{pos:p,forceAI,unseen:unseen.length,allExhausted,isPro:stats.isPro});

    const triggerPrefetch = (position) => {
      // Sequential: prefetch cache first, THEN fill pool (no concurrent xAI calls)
      setTimeout(async () => {
        if (!aiCacheRef.current.fetchingPositions?.[position] && !aiCacheRef.current.scenarios[position]?.scenario) {
          const nextConcept = sessionPlanRef.current?.[0]?.concept || null
          await prefetchAIScenario(position, stats, stats.cl || [], stats.recentWrong || [], stats.aiHistory || [], lastAiScenarioRef.current, nextConcept, aiCacheRef)
          // Pool fill only after prefetch completes — keeps xAI calls sequential
          const fillCount = _emptyPoolPositions.has(position) ? 2 : 1
          setTimeout(() => fillLocalPool(position, stats, fillCount), 2000)
        }
      }, 500)
    }

    // Local helper: AI generation with loading, abort, retry, cooldown, fallback
    const doAI=async()=>{
      // Register skip handler so loading UI can bail to handcrafted
      skipAiRef.current=()=>{
        if(abortRef.current)abortRef.current.abort()
        setAiLoading(false);setAiMode(false);setAiFallback(true)
        const _fbSrc=forceAI?src.filter(s=>s.diff>=2):src
        const s=getSmartRecycle(p,_fbSrc.length>0?_fbSrc:src,lastScId)
        _servedScenarioIds.add(s.id)
        if(s.title)_servedScenarioTitles.add(s.title)
        setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}))
        setSc(s);s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)})
        triggerPrefetch(p)
        setTimeout(()=>{setToast({e:"⚾",n:"No worries!",d:"Here's a handcrafted challenge while AI Coach warms up."});setTimeout(()=>setToast(null),4000)},300)
      }
      console.log("[BSM DEBUG] ═══ doAI() START ═══ position:",p,"| forceAI:",forceAI,"| isPro:",stats.isPro,"| servedIds:",_servedScenarioIds.size,"| servedTitles:",_servedScenarioTitles.size,"| cacheKeys:",Object.keys(aiCacheRef.current.scenarios||{}).filter(k=>aiCacheRef.current.scenarios[k]).join(",")||"none")
      // Pillar 6B: Prime calibration cache (non-blocking)
      getCalibrationData().catch(()=>{})
      // Sprint 2.3: Check unified pre-generation cache first
      const cachedEntry=aiCacheRef.current.scenarios?.[p]
      const cachedResult=cachedEntry?.scenario // unwrap {scenario, timestamp} wrapper
      const cacheAge=cachedEntry?.timestamp?(Date.now()-cachedEntry.timestamp):0
      const cacheStale=cacheAge>300000 // 5 minutes
      console.log("[BSM DEBUG] Tier 0 PRE-CACHE check for",p,"| entry exists:",!!cachedEntry,"| scenario exists:",!!cachedResult?.scenario,"| age:",Math.round(cacheAge/1000)+"s","| stale:",cacheStale,"| title already served:",cachedResult?.scenario?_servedScenarioTitles.has(cachedResult.scenario.title):false)
      if(cachedResult?.scenario && !cacheStale && !_servedScenarioTitles.has(cachedResult.scenario.title)){
        aiCacheRef.current.scenarios[p]=null
        const cachedSc=cachedResult.scenario
        console.log("[BSM] Consuming pre-cached scenario for " + p + ": " + cachedSc.title + " (age: " + Math.round(cacheAge/1000) + "s)")
        setAiMode(true);setScreen("play")
        aiFailRef.current.consecutive=0;aiFailRef.current.cooldownUntil=0
        // BUG 7: Track analytics with A/B variants from cached result
        trackAnalyticsEvent("ai_scenario_generated",{pos:p,concept:cachedSc.conceptTag||"",diff:cachedSc.diff,ab:cachedResult.abVariants||{},cached:true},{ageGroup:stats.ageGroup,isPro:stats.isPro})
        // Persist to AI history
        if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
        _servedScenarioIds.add(cachedSc.id)
        _servedScenarioTitles.add(cachedSc.title)
        setStats(prev=>{
          const entry={id:cachedSc.id,title:cachedSc.title,position:p,diff:cachedSc.diff,
            concept:cachedSc.concept,conceptTag:cachedSc.conceptTag||null,
            generatedAt:Date.now(),answered:false,correct:null,chosenIdx:null}
          const hist=[...(prev.aiHistory||[]),entry].slice(-100)
          return{...prev,aiHistory:hist}
        })
        setSc(cachedSc)
        cachedSc.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)})
        triggerPrefetch(p)
        return
      } else if (cachedResult?.scenario || cacheStale) {
        // Pre-cached scenario has already-served title or is stale — discard it
        aiCacheRef.current.scenarios[p]=null
        console.log("[BSM] Discarded pre-cached scenario:", cacheStale ? "stale" : "duplicate title", cachedResult?.scenario?.title || "")
      }
      // Tier 1: Check local scenario pool
      const maxDiffForPos = (AGE_GROUPS.find(a=>a.id===stats.ageGroup)||AGE_GROUPS[2]).maxDiff
      const diffForPool = (stats.ps?.[p]?.p||0) > 0 ? ((stats.ps[p].c/stats.ps[p].p) > 0.75 ? Math.min(3,maxDiffForPos) : (stats.ps[p].c/stats.ps[p].p) > 0.5 ? Math.min(2,maxDiffForPos) : 1) : 1
      const allExcludeIds = [...new Set([...(stats.cl || []), ...(stats.aiHistory || []).map(h => h.id), ..._servedScenarioIds])]
      const poolExcludeIds = allExcludeIds.filter(id => typeof id === "string" && id.startsWith("pool_"))
      const _localPoolSize = getLocalPool().filter(e => e.position === p).length
      console.log("[BSM DEBUG] Tier 1 LOCAL POOL check for",p,"| pool size for position:",_localPoolSize,"| diffForPool:",diffForPool,"| excludeIds count:",allExcludeIds.length)
      const localPoolSc = consumeFromLocalPool(p, diffForPool, allExcludeIds)
      console.log("[BSM DEBUG] Tier 1 LOCAL POOL result:",localPoolSc?"FOUND: "+localPoolSc.title:"null (empty or all excluded)","| title already served:",localPoolSc?_servedScenarioTitles.has(localPoolSc.title):false)
      if (localPoolSc && !_servedScenarioTitles.has(localPoolSc.title)) {
        console.log("[BSM] Using local pool scenario:", localPoolSc.title)
        localPoolSc.isPooled = true
        setAiMode(true); setScreen("play")
        aiFailRef.current.consecutive = 0; aiFailRef.current.cooldownUntil = 0
        trackAnalyticsEvent("ai_scenario_generated", { pos: p, concept: localPoolSc.conceptTag || "", diff: localPoolSc.diff, source: "local_pool" }, { ageGroup: stats.ageGroup, isPro: stats.isPro })
        if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
        _servedScenarioIds.add(localPoolSc.id)
        _servedScenarioTitles.add(localPoolSc.title)
        setStats(prev => {
          const entry = { id: localPoolSc.id, title: localPoolSc.title, position: p, diff: localPoolSc.diff, concept: localPoolSc.concept, conceptTag: localPoolSc.conceptTag || null, generatedAt: Date.now(), answered: false, correct: null, chosenIdx: null }
          const hist = [...(prev.aiHistory || []), entry].slice(-100)
          return { ...prev, aiHistory: hist }
        })
        setSc(localPoolSc)
        localPoolSc.options.forEach((_, i) => { setTimeout(() => setRi(i), 120 + i * 80) })
        triggerPrefetch(p)
        return
      }

      // Tier 2: Check server community pool (skip if no known entries + already checked this session)
      const _knownPoolCount = _serverPoolCounts?.[p] || 0
      if (_knownPoolCount === 0 && _serverPoolCheckedThisSession.has(p)) {
        console.log("[BSM DEBUG] Tier 2 SERVER POOL SKIPPED for",p,"| no entries + already checked this session — saved ~5s latency")
      } else {
        _serverPoolCheckedThisSession.add(p)
        console.log("[BSM DEBUG] Tier 2 SERVER POOL attempting fetch for",p,"| knownPoolCount:",_knownPoolCount,"| diff:",diffForPool,"| poolExcludeIds:",poolExcludeIds.length,"| excludeTitles:",_servedScenarioTitles.size)
        try {
          const serverPoolSc = await fetchFromServerPool(p, diffForPool, null, poolExcludeIds, [..._servedScenarioTitles])
          console.log("[BSM DEBUG] Tier 2 SERVER POOL result:",serverPoolSc?"FOUND: "+serverPoolSc.title:"null (empty or no match)","| id dup:",serverPoolSc?_servedScenarioIds.has(serverPoolSc.id):false,"| title dup:",serverPoolSc?_servedScenarioTitles.has(serverPoolSc.title):false)
          if (serverPoolSc && !_servedScenarioIds.has(serverPoolSc.id) && !_servedScenarioTitles.has(serverPoolSc.title)) {
            console.log("[BSM] Using server pool scenario:", serverPoolSc.title)
            serverPoolSc.isPooled = true
            _serverPoolCounts[p] = (_serverPoolCounts[p] || 1)
            setAiMode(true); setScreen("play")
            aiFailRef.current.consecutive = 0; aiFailRef.current.cooldownUntil = 0
            trackAnalyticsEvent("ai_scenario_generated", { pos: p, concept: serverPoolSc.conceptTag || "", diff: serverPoolSc.diff, source: "server_pool" }, { ageGroup: stats.ageGroup, isPro: stats.isPro })
            if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
            _servedScenarioIds.add(serverPoolSc.id)
            _servedScenarioTitles.add(serverPoolSc.title)
            setStats(prev => {
              const entry = { id: serverPoolSc.id, title: serverPoolSc.title, position: p, diff: serverPoolSc.diff, concept: serverPoolSc.concept, conceptTag: serverPoolSc.conceptTag || null, generatedAt: Date.now(), answered: false, correct: null, chosenIdx: null }
              const hist = [...(prev.aiHistory || []), entry].slice(-100)
              return { ...prev, aiHistory: hist }
            })
            setSc(serverPoolSc)
            serverPoolSc.options.forEach((_, i) => { setTimeout(() => setRi(i), 120 + i * 80) })
            triggerPrefetch(p)
            return
          }
        } catch (e) {
          console.warn("[BSM DEBUG] Tier 2 SERVER POOL ERROR:", e.message)
        }
      }

      // Track positions that had no pool entries at all (local=0 + server=miss)
      if (_localPoolSize === 0) _emptyPoolPositions.add(p)

      // Tier 3: Fresh AI generation (existing code continues below)
      // Circuit breaker check — skip AI if response times too slow or repeated failures
      const _cb=getCircuitBreaker(p)
      console.log("[BSM DEBUG] Tier 3 CIRCUIT BREAKER check for",p,"| open:",Date.now()<_cb.openUntil,"| failures:",_cb.failures,"| openUntil:",_cb.openUntil?new Date(_cb.openUntil).toLocaleTimeString():"none","| avgResponseTime:",_cb.responseTimes.length>0?Math.round(_cb.responseTimes.reduce((a,b)=>a+b,0)/_cb.responseTimes.length/1000)+"s":"no data")
      if(Date.now()<_cb.openUntil){
        const _cbSec=Math.round((_cb.openUntil-Date.now())/1000)
        console.log("[BSM] Circuit breaker OPEN — skipping AI, serving from pool/handcrafted. Reopens in",_cbSec,"s")
        setAiMode(false);setAiFallback(true);
        const _cbSrc=forceAI?src.filter(s=>s.diff>=2):src
        const s=getSmartRecycle(p,_cbSrc.length>0?_cbSrc:src,lastScId);
        _servedScenarioIds.add(s.id)
        if(s.title)_servedScenarioTitles.add(s.title)
        setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));
        setSc(s);setScreen("play");
        s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
        setTimeout(()=>{setToast({e:"⚡",n:"AI Coach Warming Up",d:"Using curated scenarios while AI resets."});setTimeout(()=>setToast(null),3500)},300);
        return;
      }
      // Cooldown check — skip AI if recent repeated failures
      console.log("[BSM DEBUG] Tier 3 COOLDOWN check | active:",Date.now()<aiFailRef.current.cooldownUntil,"| consecutiveFailures:",aiFailRef.current.consecutive,"| cooldownUntil:",aiFailRef.current.cooldownUntil?new Date(aiFailRef.current.cooldownUntil).toLocaleTimeString():"none")
      if(Date.now()<aiFailRef.current.cooldownUntil){
        const mins=Math.ceil((aiFailRef.current.cooldownUntil-Date.now())/60000);
        setAiMode(false);setAiFallback(true);
        const _cdSrc=forceAI?src.filter(s=>s.diff>=2):src
        const s=getSmartRecycle(p,_cdSrc.length>0?_cdSrc:src,lastScId);
        _servedScenarioIds.add(s.id)
        if(s.title)_servedScenarioTitles.add(s.title)
        setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));
        setSc(s);setScreen("play");
        s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
        setTimeout(()=>{setToast({e:"⚠️",n:"AI Resting",d:`AI Coach is resting. Try again in ${mins} min.`});setTimeout(()=>setToast(null),3500)},300);
        return;
      }
      console.log("[BSM DEBUG] Tier 3 LIVE GENERATION starting for",p,"| all caches/pools empty, circuit breaker closed, no cooldown")
      setAiLoading(true);setAiMode(true);setScreen("play")
      // Session planner: build plan on first AI call for this position, consume items
      const _spAB = getActiveABConfigs(stats.sessionHash || "").session_planner || {}
      if(_spAB.useSessionPlan!==false&&(!sessionPlanRef.current||sessionPlanPosRef.current!==p)){
        sessionPlanRef.current=planSession(stats,p)
        sessionPlanPosRef.current=p
        // Store active learning path in state
        const pathItem = sessionPlanRef.current?.find(item => item.path)
        if (pathItem?.path && stats.activePath !== pathItem.path) {
          setStats(prev => ({...prev, activePath: pathItem.path}))
        }
      }
      let concept=null;
      const nextPlanItem=sessionPlanRef.current?.length>0?sessionPlanRef.current.shift():null
      if(nextPlanItem){
        console.log("[BSM Session] Consuming plan item:",nextPlanItem.type,nextPlanItem.concept||nextPlanItem.note||"")
        if(nextPlanItem.concept)concept=nextPlanItem.concept
        // Cold streak auto-drop: swap progression for remediation (Pillar 7B)
        if(wrongStreak>=3&&nextPlanItem.type==="progression"){
          const lastWrong=(stats.recentWrong||[]).slice(-1)[0]
          if(lastWrong){concept=lastWrong;console.log("[BSM Session] Cold streak — dropped to remediation:",lastWrong)}
        }
      }else{
        // Fallback: original random wrong-concept targeting
        const wc=stats.wrongCounts||{};
        const wrongIds=Object.keys(wc).filter(id=>wc[id]>0);
        if(wrongIds.length>0&&Math.random()<0.5){
          const allSc=Object.entries(SCENARIOS).flatMap(([,arr])=>arr);
          const wrongSc=allSc.find(s=>wrongIds.includes(s.id)&&s.concept);
          if(wrongSc)concept=wrongSc.concept;
        }
      }
      const _aiHist=stats.aiHistory||[]
      const _aiStartMs=Date.now()
      const AI_BUDGET=120000
      // Sprint 5: Try pre-cached scenario first for instant load (unified cache)
      let ctrl=null
      let result=consumeCachedAI(p, aiCacheRef)
      console.log("[BSM DEBUG] Tier 3 inner cache check:",result?"HIT":"MISS","| inFlight:",!!aiCacheRef.current?.inFlightPromise?.[p])
      // Check if pre-fetch is already in flight for this position
      if(!result){
        const inFlight=aiCacheRef.current?.inFlightPromise?.[p]
        if(inFlight){
          console.log("[BSM] Pre-fetch in flight for",p,"— awaiting instead of duplicate call")
          try{
            const prefetchResult=await Promise.race([
              inFlight,
              new Promise((_,rej)=>setTimeout(()=>rej(new Error("prefetch-wait-timeout")),30000))
            ])
            if(prefetchResult?.scenario)result=prefetchResult
          }catch(e){
            console.log("[BSM] Pre-fetch await failed:",e.message,"— proceeding with fresh call")
          }
        }
      }
      if(!result){
        console.log("[BSM DEBUG] Tier 3 calling generateAIScenario |",p,"| concept:",concept||"none","| budget:",AI_BUDGET/1000+"s","| aiHistory length:",_aiHist.length)
        ctrl=new AbortController();abortRef.current=ctrl;
        result=await generateAIScenario(p,stats,stats.cl||[],stats.recentWrong||[],ctrl.signal,concept,_aiHist,lastAiScenarioRef.current,AI_BUDGET);
        // Retry up to 2x on quality/parse failures if time remains (Fix 8)
        const RETRYABLE_ERRORS=["parse","role-violation","rate-mismatch","quality-firewall","consistency-violation","api"]
        let retries=0
        while(!result?.scenario&&retries<2){
          const retryable=result?.error&&RETRYABLE_ERRORS.includes(result.error)
          const remaining=AI_BUDGET-(Date.now()-_aiStartMs)
          if(!retryable||remaining<30000)break
          retries++
          ctrl=new AbortController();abortRef.current=ctrl;
          console.log("[BSM] AI retry #" + retries + " (" + result.error + "), " + Math.round(remaining/1000) + "s remaining...");
          // Pass concept on retry so pedagogical targeting isn't lost
          result=await generateAIScenario(p,stats,stats.cl||[],stats.recentWrong||[],ctrl.signal,concept,_aiHist,lastAiScenarioRef.current,remaining);
        }
      }
      console.log("[BSM] AI total flow took " + (Date.now()-_aiStartMs) + "ms")
      abortRef.current=null;
      skipAiRef.current=null;
      setAiLoading(false);
      if(result?.scenario){
        aiFailRef.current.consecutive=0;aiFailRef.current.cooldownUntil=0;
        // Circuit breaker: record success + response time (per-position)
        const _cbS=getCircuitBreaker(p)
        const _elapsed=Date.now()-_aiStartMs
        _cbS.responseTimes=[..._cbS.responseTimes.slice(-4),_elapsed]
        _cbS.failures=0;_cbS.openUntil=0
        const _avgTime=_cbS.responseTimes.reduce((a,b)=>a+b,0)/_cbS.responseTimes.length
        if(_cbS.responseTimes.length>=3&&_avgTime>120000){
          _cbS.openUntil=Date.now()+3*60*1000
          console.warn("[BSM] Circuit breaker OPENED for",p,"— avg response time",Math.round(_avgTime/1000),"s")
        }
        updateCircuitBreaker(_cbS,p)
        lastAiScenarioRef.current=result.scenario; // Track for connected arcs
        console.log("[BSM] AI scenario accepted:", result.scenario.title);
        // Sprint 4.2+4.3: Track AI scenario generation success with A/B variants
        trackAnalyticsEvent("ai_scenario_generated",{pos:p,concept:result.scenario.conceptTag||"",diff:result.scenario.diff,ab:result.abVariants||{}},{ageGroup:stats.ageGroup,isPro:stats.isPro});
        // Pillar 6D: Report A/B variant outcomes
        if(result.abVariants){
          const ab=result.abVariants
          if(ab.pipeline)reportABResult("agent_pipeline_v2",ab.pipeline,"scenario_generated",ab.grade||0)
          if(ab.temp)reportABResult("ai_temperature_v1",ab.temp,"scenario_generated",1)
          if(ab.prompt)reportABResult("ai_system_prompt_v1",ab.prompt,"scenario_generated",1)
          if(ab.persona)reportABResult("coach_persona_v1",ab.persona,"scenario_generated",1)
        }
        // Persist AI scenario to history (Sprint 1.5)
        if (_servedScenarioIds.size > 500) { _servedScenarioIds.clear(); _servedScenarioTitles.clear() }
        _servedScenarioIds.add(result.scenario.id)
        _servedScenarioTitles.add(result.scenario.title)
        setStats(prev=>{
          const entry={id:result.scenario.id,title:result.scenario.title,position:p,diff:result.scenario.diff,
            concept:result.scenario.concept,conceptTag:result.scenario.conceptTag||null,
            generatedAt:Date.now(),answered:false,correct:null,chosenIdx:null}
          const hist=[...(prev.aiHistory||[]),entry].slice(-100)
          return{...prev,aiHistory:hist}
        })
        if(result.abVariants)result.scenario._abVariants=result.abVariants;
        setSc(result.scenario);
        result.scenario.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
        triggerPrefetch(p)
      } else {
        // Don't count user-navigation aborts as failures
        if(result?.error==="aborted"||ctrl?.signal?.aborted){
          console.log("[BSM] Abort detected (navigation) — not counting toward circuit breaker")
          if(ctrl?.signal.aborted)return;
        } else {
          aiFailRef.current.consecutive++;
          // Circuit breaker: record failure (per-position)
          const _cbF=getCircuitBreaker(p)
          _cbF.failures++
          if(_cbF.failures>=4){
            _cbF.openUntil=Date.now()+3*60*1000
            console.warn("[BSM] Circuit breaker OPENED for",p,"—",_cbF.failures,"consecutive failures")
          }
          updateCircuitBreaker(_cbF,p)
          // Sprint 4.2: Track AI scenario failure
          trackAnalyticsEvent("ai_scenario_failed",{pos:p,error:result?.error||"unknown",consecutive:aiFailRef.current.consecutive},{ageGroup:stats.ageGroup,isPro:stats.isPro});
          if(aiFailRef.current.consecutive>=3){
            aiFailRef.current.cooldownUntil=Date.now()+5*60*1000;
            console.warn("[BSM] AI cooldown activated after",aiFailRef.current.consecutive,"consecutive failures");
          }
        }
        console.log("[BSM DEBUG] FALLBACK to handcrafted | position:",p,"| error:",result?.error||"unknown","| consecutiveFailures:",aiFailRef.current.consecutive,"| totalFlowTime:",Date.now()-_aiStartMs+"ms")
        setAiMode(false);setAiFallback(true);
        const _fbSrc=forceAI?src.filter(s=>s.diff>=2):src
        const s=getSmartRecycle(p,_fbSrc.length>0?_fbSrc:src,lastScId);
        _servedScenarioIds.add(s.id)
        if(s.title)_servedScenarioTitles.add(s.title)
        setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));
        setSc(s);
        s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
        // Trigger prefetch so next AI Coach's Challenge has a cached scenario ready
        triggerPrefetch(p)
        if(forceAI){
          setAiFallbackBanner(true)
          setTimeout(()=>{setToast({e:"⚾",n:"Coach's Pick",d:"AI Coach is prepping your custom scenario — here's a curated challenge in the meantime!"});setTimeout(()=>setToast(null),4000)},300);
        } else {
          setTimeout(()=>{setToast({e:"⚠️",n:"AI Warming Up",d:"Here's a curated scenario while AI Coach gets ready!"});setTimeout(()=>setToast(null),3500)},300);
        }
      }
    };

    if(forceAI){
      // GUARANTEED AI path — button already verified isPro
      await doAI();
    } else if(allExhausted&&!stats.isPro){
      // Free user pool exhaustion
      setAiMode(false);
      const shown=stats.masteryShown||[];
      if(!shown.includes(p)){
        setStats(prev=>({...prev,masteryShown:[...(prev.masteryShown||[]),p]}));
        setMasteryPos(p);setScreen("home");return;
      }
      const s=getSmartRecycle(p,src,lastScId);
      _servedScenarioIds.add(s.id)
      if(s.title)_servedScenarioTitles.add(s.title)
      setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));
      setSc(s);setScreen("play");
      s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
      // Just-in-time: while playing recycled, precache an AI scenario for this position
      if(stats.isPro&&!aiCacheRef.current.scenarios[p]&&!aiCacheRef.current.generating){
        aiCacheRef.current.generating=true;aiCacheRef.current.lastGenTime=Date.now();
        console.log("[BSM] Just-in-time AI precache for",p);
        generateAIScenario(p,stats,stats.cl||[],stats.recentWrong||[],null,null,stats.aiHistory||[])
          .then(result=>{if(result?.scenario){const existing=aiCacheRef.current.scenarios[p];if(existing?.scenario?.scenario)saveToLocalPool(existing.scenario.scenario,p);aiCacheRef.current.scenarios[p]=result;console.log("[BSM] Pre-cached AI scenario:",result.scenario.title,"for",p)}})
          .catch(()=>{}).finally(()=>{aiCacheRef.current.generating=false})
      }
      setTimeout(()=>{setToast({e:"🔄",n:"Review Mode",d:"Revisiting scenarios to sharpen your skills!"});setTimeout(()=>setToast(null),3000)},300);
    } else if(allExhausted){
      // Pro user natural pool exhaustion — try AI
      await doAI();
    } else {
      // Unseen scenarios available — use handcrafted
      setAiMode(false);
      // Concept targeting: if recommendation click set a target concept, prefer matching scenario
      const cTarget=conceptTargetRef.current;
      conceptTargetRef.current=null; // consume it
      let s=null;
      if(cTarget){
        const conceptMatch=unseen.filter(sc=>sc.conceptTag===cTarget);
        if(conceptMatch.length>0){
          s=conceptMatch[Math.floor(Math.random()*conceptMatch.length)];
        } else {
          // Try seen scenarios with this concept (recycling)
          const allMatch=src.filter(sc=>sc.conceptTag===cTarget);
          if(allMatch.length>0)s=allMatch[Math.floor(Math.random()*allMatch.length)];
        }
      }
      if(!s)s=getRand(p,lastScId);
      setSc(s);setScreen("play");
      s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
      // Just-in-time: while playing handcrafted, precache an AI scenario for this position
      if(stats.isPro&&!aiCacheRef.current.scenarios[p]&&!aiCacheRef.current.generating){
        aiCacheRef.current.generating=true;aiCacheRef.current.lastGenTime=Date.now();
        console.log("[BSM] Just-in-time AI precache for",p);
        generateAIScenario(p,stats,stats.cl||[],stats.recentWrong||[],null,null,stats.aiHistory||[])
          .then(result=>{if(result?.scenario){const existing=aiCacheRef.current.scenarios[p];if(existing?.scenario?.scenario)saveToLocalPool(existing.scenario.scenario,p);aiCacheRef.current.scenarios[p]=result;console.log("[BSM] Pre-cached AI scenario:",result.scenario.title,"for",p)}})
          .catch(()=>{}).finally(()=>{aiCacheRef.current.generating=false})
      }
    }
  },[getRand,getSmartRecycle,snd,atLimit,hist,stats,maxDiff,aiLoading]);

  const checkAch=useCallback((ns)=>{
    const earned=ns.achs||[];
    for(const a of ACHS){if(!earned.includes(a.id)&&a.ck(ns)){setAchCelebration(a);snd.play('ach');setTimeout(()=>setAchCelebration(null),4500);return[...earned,a.id];}}
    return earned;
  },[snd]);

  const handleChoice=useCallback((idx)=>{
    if(choice!==null||!sc)return;
    // Phase 2.2: Placement test — quick answer, no explanation, auto-advance
    if(placementMode&&placementData){
      setChoice(idx);
      const isOpt=idx===sc.best;
      const newCorrect=placementData.correct+(isOpt?1:0);
      const nextRound=placementData.round+1;
      snd.play(isOpt?'correct':'wrong');
      setAk(k=>k+1);setFo(isOpt?"success":"danger");
      if(nextRound>=placementData.scenarios.length){
        // Placement complete — assign difficulty via adaptive system
        const placedDiff=newCorrect<=1?1:newCorrect<=3?2:3;
        setStats(p=>({...p,
          placementDiff:{...(p.placementDiff||{}),[placementData.pos]:placedDiff},
          adaptiveDiff:{...(p.adaptiveDiff||{}),[placementData.pos]:{level:placedDiff,history:[],lastChange:null,totalPlays:0,totalCorrect:0}}
        }));
        setPlacementMode(false);setPlacementData(null);
        const label=placedDiff===1?"Rookie":placedDiff===2?"Pro":"All-Star";
        setTimeout(()=>{setToast({e:"📊",n:"Placement: "+label+"!",d:newCorrect+"/"+placementData.scenarios.length+" correct — starting at "+label+" difficulty"});setTimeout(()=>setToast(null),5000)},300);
        // Start real game at placed difficulty (delay to let toast be visible)
        setTimeout(()=>{startGame(placementData.pos)},2000);
      }else{
        // Next placement question — brief flash then advance
        setTimeout(()=>{
          const nextSc=placementData.scenarios[nextRound];
          setPlacementData(d=>({...d,round:nextRound,correct:newCorrect}));
          setSc(nextSc);setChoice(null);setOd(null);setRi(-1);setFo(null);
          nextSc.options.forEach((_,i)=>{setTimeout(()=>setRi(i),80+i*60);});
        },600);
      }
      return;
    }
    setChoice(idx);
    const conceptTagForEffectiveness = sc.conceptTag || findConceptTag(sc.concept);
    const isOpt=idx===sc.best;const rate=sc.rates[idx];const cat=isOpt?"success":rate>=55?"warning":"danger";
    // Report pool scenario feedback
    if (sc.isPooled && sc.id) { reportPoolFeedback(sc.id, isOpt, false) }
    // Sprint 4.2: Track scenario answer
    trackAnalyticsEvent("scenario_answer",{pos:pos,correct:isOpt,diff:sc.diff||1,concept:conceptTagForEffectiveness||"",isAI:!!sc.isAI},{ageGroup:stats.ageGroup,isPro:stats.isPro});
    let pts=isOpt?15:rate>=55?8:rate>=35?4:2;
    if(dailyMode)pts*=2; // 2x XP for Daily Diamond Play
    if(stats.isPro)pts*=2; // 2x XP for Pro
    // Prestige season bonus: +10% per season past the first
    if((stats.season||1)>1)pts=Math.round(pts*(1+((stats.season-1)*0.1)));
    // Speed Round bonus: +1 pt per second remaining
    let speedBonus=0;
    if(speedMode&&isOpt&&timer>0){speedBonus=timer;pts+=speedBonus;}
    // Track wrong streak for adaptive coaching
    const newWrongStreak=isOpt?0:wrongStreak+1;
    setWrongStreak(newWrongStreak);
    setFo(cat);setAk(k=>k+1);snd.play(isOpt?'correct':rate>=55?'near':'wrong');setCoachMsg(getSmartCoachLine(cat,sc.situation,pos,isOpt?stats.str+1:0,stats.isPro,stats,newWrongStreak,sc.concept||sc.conceptTag||null));
    // Crowd cheer on perfect answers, jackpot on every 5th streak
    if(isOpt){setTimeout(()=>snd.play('cheer'),300);const newStr=stats.str+1;if(newStr>0&&newStr%5===0)setTimeout(()=>snd.play('jackpot'),500);}
    // Streak break toast when losing 3+ streak
    if(!isOpt&&stats.str>=3){setTimeout(()=>{setToast({e:"💔",n:"Streak Broken!",d:`${stats.str} in a row — you'll get it back!`});setTimeout(()=>setToast(null),3000)},600);}
    // Sprint 3.4: Update session coherence with answer result
    const scTag=sc.conceptTag||findConceptTag(sc.concept)
    if(scTag){
      const scRef=sessionConceptsRef.current
      // Replace last entry with correct/incorrect info, or add new entry
      const lastIdx=scRef.length-1
      if(lastIdx>=0&&scRef[lastIdx]===scTag){
        // Already tracked from getRand — mark whether it was correct
        sessionConceptsRef.current=[...scRef.slice(0,-1),isOpt?scTag:("!"+scTag)]
      }
    }
    // Track session stats for recap
    if(!speedMode&&!survivalMode&&!seasonMode&&!realGameMode&&!dailyMode){
      sessionRef.current.plays++;if(isOpt)sessionRef.current.correct++;
      if(sc.concept&&!sessionRef.current.concepts.includes(sc.concept))sessionRef.current.concepts.push(sc.concept);
    }
    // Use simplified explanations for young players when available
    const useSimple=sc.explSimple&&(stats.ageGroup==="6-8"||stats.ageGroup==="9-10");
    const expArr=useSimple?sc.explSimple:sc.explanations;
    const _edAB=(getActiveABConfigs(stats.sessionHash||"").explanation_depth||{});
    const _ed=_edAB.useExplDepth!==false?(sc.explDepth||null):null; // AI 3-layer explanations (Pillar 1C, A/B gated)
    const o={cat,isOpt,exp:expArr[idx],bestExp:expArr[sc.best],bestOpt:sc.options[sc.best],concept:sc.concept,pts,chosen:sc.options[idx],rate,anim:sc.anim,speedBonus,timeLeft:timer,explDepth:_ed,chosenIdx:idx,bestIdx:sc.best};
    setOd(o);setExplDepthLayer(0);
    outcomeStartRef.current=Date.now();
    // Sprint 5: Pre-fetch next AI scenario while player reads explanation (per-position lock)
    if(aiMode&&!speedMode&&!survivalMode&&!realGameMode&&!aiCacheRef.current.scenarios?.[pos]?.scenario){
      // Cancel any in-flight prefetch for a DIFFERENT position, let same-position continue
      if(!aiCacheRef.current.fetchingPositions?.[pos]){
        cancelPrefetchExcept(pos,aiCacheRef)
        const nextConcept=sessionPlanRef.current?.[0]?.concept||null
        prefetchAIScenario(pos,stats,stats.cl||[],stats.recentWrong||[],stats.aiHistory||[],lastAiScenarioRef.current,nextConcept,aiCacheRef)
      }
    }
    // Track speed round result
    if(speedMode)setSpeedRound(sr=>sr?{...sr,results:[...sr.results,{isOpt,pts,speedBonus,timeLeft:timer,concept:sc.concept,pos}]}:sr);
    // Track survival run result
    if(survivalMode)setSurvivalRun(sr=>sr?{...sr,count:sr.count+1,pts:sr.pts+pts,concepts:[...sr.concepts,sc.concept],history:[...(sr.history||[]),{isOpt,concept:sc.concept,chosen:sc.options[idx],bestOpt:sc.options[sc.best],pos}]}:sr);
    if(sitMode)setSitResults(sr=>[...sr,{pos,correct:isOpt,xp:pts,choice:idx,best:sc.best}]);
    // Real Game score tracking (Pillar 7D)
    if(realGameMode&&realGame){
      const rand=Math.random();
      let pDelta=0,oDelta=0;
      if(isOpt){pDelta=rand<0.4?1:0;}
      else if(cat==="warning"){pDelta=rand<0.1?1:0;oDelta=rand>0.7?1:0;}
      else{oDelta=rand<0.6?1:0;}
      setRealGame(rg=>rg?{...rg,playerScore:rg.playerScore+pDelta,opponentScore:rg.opponentScore+oDelta,results:[...rg.results,{inning:rg.inning,cat,isOpt,pos,concept:sc.concept,chosen:sc.options[idx],bestOpt:sc.options[sc.best],pDelta,oDelta}]}:rg);
    }
    const prevLvl=getLvl(stats.pts);
    setStats(p=>{
      const today=new Date().toDateString();
      // Track wrongCounts for spaced repetition
      const wc={...(p.wrongCounts||{})};
      if(!isOpt&&sc.id){wc[sc.id]=(wc[sc.id]||0)+1}
      else if(isOpt&&sc.id&&wc[sc.id]){delete wc[sc.id]} // Clear on correct answer
      // SessionHistory tracking for error pattern detection
      const conceptTag = sc.conceptTag || findConceptTag(sc.concept);
      if (conceptTag && BRAIN.concepts && !BRAIN.concepts[conceptTag]) {
        console.warn("[BSM] Unknown conceptTag:", conceptTag, "in scenario", sc.id)
      }
      const innNum = parseInt((sc.situation?.inning||'').replace(/\D/g,''))||1;
      const scoreDiff = Math.abs((sc.situation?.score?.[0]||0)-(sc.situation?.score?.[1]||0));
      const shEntry = {
        scenarioId: sc.id||null, conceptTag: conceptTag||null, correct: isOpt,
        choiceText: sc.options?.[idx]||'', chosenIdx: idx,
        errorType: !isOpt ? (classifyAndFeedback(sc, idx, parseInt(p.ageGroup)||14, p.masteryData||{concepts:{}})?.errorType||null) : null,
        countContext: sc.situation?.count ? (BRAIN.stats.countData?.[sc.situation.count]?.edge||null) : null,
        lateClose: innNum >= 7 && scoreDiff <= 2,
        ts: Date.now(),
      };
      const sh = [...(p.masteryData?.sessionHistory||[]), shEntry].slice(-50);
      // Update concept mastery state
      const oldMastery = p.masteryData||{concepts:{},errorPatterns:{},sessionHistory:[]};
      const updMastery = updateConceptMastery(oldMastery, conceptTag, isOpt, sc.id);
      updMastery.sessionHistory = sh;
      // Phase 3.3: Track new concepts (unseen -> introduced/learning)
      if(conceptTag && oldMastery.concepts[conceptTag]?.state==="unseen" && (updMastery.concepts[conceptTag]?.state==="introduced"||updMastery.concepts[conceptTag]?.state==="learning")){
        if(!sessionRef.current.newConcepts.includes(conceptTag)){
          sessionRef.current.newConcepts.push(conceptTag);
        }
      }
      // Improvement Engine: quality signal, explanation effectiveness, gap cache
      const _qsResult = trackScenarioQuality(p, sc.id, isOpt, sc.isAI || false);
      const _srcResult = trackSourceQuality(_qsResult, isOpt, sc.isAI || false);
      const _exResult = trackExplanationEffectiveness(_srcResult, conceptTagForEffectiveness, isOpt);
      // Level 3.6: Cross-player learning contribution
      try {
        const contrib = buildLearningContribution(p, pos, sc.id, conceptTag, isOpt, sc.isAI || false, sc.diff || 1);
        queueLearningContribution(contrib);
      } catch (e) { /* non-critical */ }
      // Pillar 6D: Report A/B answer outcome
      if(sc.isAI&&sc._abVariants){
        const ab=sc._abVariants
        if(ab.pipeline)reportABResult("agent_pipeline_v2",ab.pipeline,isOpt?"correct":"incorrect",1)
        if(ab.persona)reportABResult("coach_persona_v1",ab.persona,isOpt?"correct":"incorrect",1)
      }
      // Phase E: Report session planner + explanation depth A/B on every answer
      const _answerAB=getActiveABConfigs(p.sessionHash||"")
      reportABResult("session_planner_v1",(_answerAB.session_planner||{}).variant||"control",isOpt?"correct":"incorrect",1)
      reportABResult("explanation_depth_v1",(_answerAB.explanation_depth||{}).variant||"control",isOpt?"correct":"incorrect",1)
      const _newLastWrong = !isOpt ? (conceptTagForEffectiveness || null) : null;
      const _newGapCache = ((p.gp + 1) % IMPROVEMENT_ENGINE.gapRules.cacheRefreshInterval === 0) ? null : (p.gapDetectionCache || null);
      // Difficulty graduation for ages 6-8
      const posGrad={...(p.posGrad||{})};
      const updatedPs={...p.ps,[pos]:{p:(p.ps[pos]?.p||0)+1,c:(p.ps[pos]?.c||0)+(isOpt?1:0)}};
      if(p.ageGroup==="6-8"&&!posGrad[pos]){
        const pp=updatedPs[pos];
        if(pp.p>=5&&(pp.c/pp.p)>0.7){posGrad[pos]=true;
          setTimeout(()=>{setToast({e:"🎓",n:`${POS_META[pos]?.label||pos} Leveled Up!`,d:"Pro difficulty unlocked for this position!"});setTimeout(()=>setToast(null),3500)},800);
        }
      }
      const now=Date.now();
      // Track all played scenario IDs per position (append-only, for exhaustion detection)
      const posP={...(p.posPlayed||{})};
      if(sc.id&&!sc.isAI){const posIds=new Set(posP[pos]||[]);posIds.add(sc.id);posP[pos]=[...posIds];}
      // Update AI history with player response + quality score (Sprint 1.5 + 2.2)
      const aiHist=[...(p.aiHistory||[])]
      if(sc.isAI&&sc.id){
        const aiIdx=aiHist.findIndex(h=>h.id===sc.id)
        if(aiIdx>=0){
          const updEntry={...aiHist[aiIdx],answered:true,correct:isOpt,chosenIdx:idx,answeredAt:now}
          updEntry.qualityScore=scoreAIScenario(updEntry,{...p,aiHistory:aiHist})
          aiHist[aiIdx]=updEntry
        }
      }
      // Sprint 3.3: Difficulty auto-calibration — track per-scenario performance
      const scenCal={...(p.scenarioCalibration||{})}
      if(sc.id){
        const prev=scenCal[sc.id]||{attempts:0,correct:0}
        scenCal[sc.id]={attempts:prev.attempts+1,correct:prev.correct+(isOpt?1:0)}
      }
      // === ENRICHFEEDBACK DATA STORAGE ===
      // Compute and store situational context for adaptive pattern detection
      const _sit=sc.situation||{};
      const _pressure=getPressure(_sit);
      const _re24=getRunExpectancy(_sit.runners||[],_sit.outs||0);
      const _countIntel=getCountIntel(_sit.count);
      const _innNum=parseInt((_sit.inning||'').replace(/\D/g,''))||1;
      const _scoreDiff=(_sit.score?.[0]||0)-(_sit.score?.[1]||0);
      const _wpCtx=getWinContext(_sit.inning,_scoreDiff,_sit.runners||[],_sit.outs||0);
      const _playContext={pressure:_pressure,re24:_re24,countEdge:_countIntel?.edge||null,li:_wpCtx?.li||1,isLateClose:!!_wpCtx?.isLateClose,inning:_innNum,outs:_sit.outs||0,runners:(_sit.runners||[]).length,isOpt,pos,concept:scTag||null,diff:sc.diff||1,ts:Date.now()};

      // === ADAPTIVE DIFFICULTY ENGINE ===
      // Track per-position rolling accuracy and adjust difficulty dynamically
      const _ad={...(p.adaptiveDiff||{})};
      if(!dailyMode&&!sitMode){
        const _posAd={...(_ad[pos]||{level:(p.placementDiff||{})[pos]||1,history:[],lastChange:null,totalPlays:0,totalCorrect:0})};
        _posAd.history=[..._posAd.history,isOpt?1:0].slice(-15);
        _posAd.totalPlays=(_posAd.totalPlays||0)+1;
        _posAd.totalCorrect=(_posAd.totalCorrect||0)+(isOpt?1:0);
        // Check for difficulty adjustment (need 8+ plays in history)
        if(_posAd.history.length>=8){
          const recent=_posAd.history.slice(-10);
          const acc=recent.filter(Boolean).length/recent.length;
          const timeSince=_posAd.lastChange?Date.now()-_posAd.lastChange:Infinity;
          const cooldown=90000; // 90s between adjustments
          if(acc>=0.80&&_posAd.level<3&&timeSince>cooldown){
            _posAd.level+=1;_posAd.lastChange=Date.now();
            const lbl=_posAd.level===2?"Varsity":"All-Star";
            if(!speedMode)setTimeout(()=>{setToast({e:"🚀",n:"Difficulty Up!",d:`Moving to ${lbl} — you're crushing it!`});setTimeout(()=>setToast(null),4000)},800);
          }else if(acc<=0.35&&_posAd.level>1&&timeSince>cooldown){
            _posAd.level-=1;_posAd.lastChange=Date.now();
            const lbl=_posAd.level===1?"Rookie":"Varsity";
            if(!speedMode)setTimeout(()=>{setToast({e:"💪",n:"Building Foundations",d:`Practicing at ${lbl} level to sharpen your skills`});setTimeout(()=>setToast(null),4000)},800);
          }
        }
        _ad[pos]=_posAd;
      }

      const ns={...p,pts:p.pts+pts,str:isOpt?p.str+1:0,bs:Math.max(p.bs,isOpt?p.str+1:p.bs),gp:p.gp+1,co:p.co+(isOpt?1:0),
        ps:updatedPs,
        cl:(()=>{let c=p.cl||[];if(isOpt&&sc.concept&&!c.includes(sc.concept))c=[...c,sc.concept];if(sitMode&&sc.id&&!c.includes(sc.id))c=[...c,sc.id];return c})(),
        recentWrong:isOpt?(p.recentWrong||[]):[...(p.recentWrong||[]),sc.concept].slice(-5),
        todayPlayed:dailyMode||sitMode?p.todayPlayed:(p.todayDate===today?p.todayPlayed:0)+1,todayDate:today,
        sp:isOpt?(p.sp||0)+1:0,
        dailyDone:dailyMode?true:p.dailyDone,dailyDate:dailyMode?today:(p.dailyDate||today),
        weeklyDone:(()=>{const wk=getWeeklyScenario();if(sc&&sc.id===wk.id){const d=new Date();return`${d.getFullYear()}-W${Math.ceil(((d-new Date(d.getFullYear(),0,1))/86400000+new Date(d.getFullYear(),0,1).getDay()+1)/7)}`;}return p.weeklyDone})(),
        firstPlayDate:p.firstPlayDate||now,lastPlayDate:now,
        seasonCorrect:seasonMode&&isOpt?(p.seasonCorrect||0)+1:(p.seasonCorrect||0),
        wrongCounts:wc,posGrad,posPlayed:posP,masteryData:updMastery,aiHistory:aiHist,scenarioCalibration:scenCal,
        qualitySignals:_qsResult.qualitySignals,aiMetrics:_srcResult.aiMetrics||p.aiMetrics,hcMetrics:_srcResult.hcMetrics||p.hcMetrics,explanationLog:_exResult.explanationLog,
        lastWrongConceptTag:_newLastWrong,gapDetectionCache:_newGapCache,
        flaggedScenarios:p.flaggedScenarios||{},adaptiveDiff:_ad,
        // AF8: Save correct plays to highlight reel (last 10)
        highlights:isOpt&&sc.anim?[...(p.highlights||[]),{anim:sc.anim,title:sc.title,pos,runners:sc.situation?.runners||[],situation:sc.situation,ts:Date.now(),variant:sc.animVariant||sc.pitchType||null}].slice(-10):(p.highlights||[]),
        // enrichFeedback data: store situational context for adaptive pattern detection (last 50)
        playContextHistory:[...(p.playContextHistory||[]),_playContext].slice(-50)};
      ns.achs=checkAch(ns);
      const newLvl=getLvl(ns.pts);
      if(newLvl.n!==prevLvl.n){if(speedMode){pendingLvlUpRef.current=newLvl}else{setTimeout(()=>{setLvlUp(newLvl);snd.play('lvl')},600)}}
      return ns;
    });
    if(dailyMode)setTimeout(()=>snd.play('daily'),400);
    if(speedMode){
      // Speed mode: brief feedback then auto-advance
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>speedNextRef.current?.(),1200)},200)},1400);
    }else if(survivalMode){
      if(!isOpt){
        // Wrong answer — update best and show game over
        snd.play('elimination');
        setStats(p=>({...p,survivalBest:Math.max(p.survivalBest||0,(survivalRun?.count||0)+1)}));
        setTimeout(()=>setScreen("survivalOver"),500);
      }else{
        // Correct — brief feedback then next
        setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>survivalNextRef.current?.(),1200)},200)},1400);
      }
    }else if(realGameMode){
      // Real Game — show outcome, user clicks Next to advance innings
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>setShowC(true),400);},1800);
    }else if(sitMode){
      // Situation Room — brief feedback then auto-advance to next question or results
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true)},400)},1800);
    }else if(challengePack&&challengePack.round<5){
      // Sprint D3: Challenge pack — brief feedback then auto-advance
      const cpPts=isOpt?15:rate>=55?8:rate>=35?4:2;
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>advanceChallengePack(isOpt,cpPts),1500)},400)},1800);
    }else{
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>setShowC(true),400);},1800);
    }
  },[choice,sc,pos,snd,checkAch,stats.pts,dailyMode,speedMode,timer,survivalMode,survivalRun,seasonMode,realGameMode,realGame,sitMode,challengePack,advanceChallengePack]);

  const goHome=useCallback(()=>{
    // Show session recap for normal play with 3+ plays
    const sr=sessionRef.current;
    if(sr.plays>=3&&!speedMode&&!survivalMode&&!seasonMode&&!realGameMode&&!dailyMode&&!sitMode&&screen!=="home"){
      const thisAccuracy=Math.round((sr.correct/sr.plays)*100);
      const lastAccuracy=stats.lastSessionAccuracy||0;
      const improvement=thisAccuracy>lastAccuracy;
      setSessionRecap({plays:sr.plays,correct:sr.correct,concepts:[...sr.concepts],newConcepts:[...sr.newConcepts],improvement});
      setStats(p=>({...p,lastSessionAccuracy:thisAccuracy}));
      sessionRef.current={plays:0,correct:0,concepts:[],newConcepts:[]};
    }
    sessionConceptsRef.current=[] // Sprint 3.1: reset session concept diversity tracker
    cancelPrefetch() // BUG 5: cancel in-flight prefetches on navigate away
    setScreen("home");setPos(null);setSc(null);setChoice(null);setOd(null);setFo(null);setPanel(null);setLvlUp(null);setCoachMsg(null);setDailyMode(false);setSpeedMode(false);setSpeedRound(null);setSurvivalMode(false);setSurvivalRun(null);setRealGameMode(false);setRealGame(null);setChallengeMode(false);setChallengePack(null);setSeasonMode(false);setSeasonStageIntro(null);setAiMode(false);setAiFallback(false);setExplainMore(null);setExplainLoading(false);setDeepAnalysis(null);setDeepAnalysisLoading(false);setSitMode(false);setSitSet(null);setSitQ(0);setSitResults([]);setSitTransition(null);setFilmStep(-1);if(filmTimerRef.current){clearTimeout(filmTimerRef.current);filmTimerRef.current=null}setAiSitLoading(false);if(aiSitAbortRef.current){aiSitAbortRef.current.abort();aiSitAbortRef.current=null}if(timerRef.current)clearTimeout(timerRef.current)
  },[speedMode,survivalMode,seasonMode,realGameMode,dailyMode,sitMode,screen]);
  goHomeRef.current=goHome;
  const launchSitQuestion=useCallback((set,qIdx)=>{
    const q=set.questions[qIdx];
    const s={...q,_pos:q.pos,situation:set.situation};
    setPos(q.pos);setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setScreen("play");s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
  },[]);
  const next=useCallback(()=>{
    // Track explanation engagement for AI scenarios
    if(sc?.isAI&&sc?.id&&outcomeStartRef.current>0){
      const readTime=Date.now()-outcomeStartRef.current;
      setStats(prev=>{
        const aiHist=[...(prev.aiHistory||[])];
        const idx=aiHist.findIndex(h=>h.id===sc.id);
        if(idx>=0){
          aiHist[idx]={...aiHist[idx],explanationReadTimeMs:readTime,usedExplainMore:!!explainMore};
          // Re-score with engagement data
          aiHist[idx].qualityScore=scoreAIScenario(aiHist[idx],{...prev,aiHistory:aiHist});
        }
        return{...prev,aiHistory:aiHist};
      });
      outcomeStartRef.current=0;
    }
    setLvlUp(null);setExplainMore(null);setExplainLoading(false);setDeepAnalysis(null);setDeepAnalysisLoading(false);setFlagOpen(false);setFlagComment("");if(speedMode){speedNextRef.current?.()}else if(survivalMode){survivalNextRef.current?.()}else if(realGameMode){realGameNextRef.current?.()}else if(seasonMode){seasonNextRef.current?.()}else if(challengePack&&challengePack.done){setScreen("play")/* shows challenge results overlay */}else if(sitMode&&sitSet){const nq=sitQ+1;if(nq<sitSet.questions.length){const nxQ=sitSet.questions[nq];const pm=POS_META[nxQ.pos];setSitTransition({qIdx:nq,pos:nxQ.pos,label:pm?.label||nxQ.pos,emoji:pm?.emoji||"⚾",color:pm?.color||"#3b82f6",total:sitSet.questions.length});setTimeout(()=>{setSitTransition(null);launchSitQuestion(sitSet,nq);setSitQ(nq)},1500)}else{setFilmStep(-1);setScreen("sitResults")}}else if(dailyMode){goHomeRef.current?.()}else if(atLimit){setScreen("home");setTimeout(()=>setPanel('limit'),100)}else{startGame(pos,aiMode)}},[pos,startGame,dailyMode,speedMode,survivalMode,realGameMode,seasonMode,challengePack,sitMode,sitSet,sitQ,atLimit,aiMode,sc,explainMore,launchSitQuestion]);
  const finishOnboard=useCallback((autoStartPos)=>{setStats(p=>({...p,onboarded:true,tutorialDone:true,todayDate:new Date().toDateString(),favoritePosition:autoStartPos||"batter"}));trackAnalyticsEvent("onboard_complete",null,{ageGroup:stats.ageGroup,isPro:stats.isPro});if(autoStartPos){startGame(autoStartPos)}else{setScreen("home")}},[stats.ageGroup,stats.isPro,startGame]);

  // Auth: signup
  const handleSignup=useCallback(async(formData)=>{
    setAuthLoading(true);setAuthError(null);
    try{
      const res=await fetch(WORKER_BASE+"/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(formData)});
      const d=await res.json();
      if(d.ok){
        setAuthToken(d.token);localStorage.setItem('bsm_auth_token',d.token);
        setAuthUser(d.user);setAuthProfile(d.profile);
        if(d.stats&&Object.keys(d.stats).length>0)setStats(p=>({...p,...d.stats}));
        setScreen(stats.onboarded?"home":"onboard");
        setToast({e:"✅",n:"Account Created!",d:"Your progress is now saved to the cloud."});setTimeout(()=>setToast(null),4000);
      } else { setAuthError(d.error||"Signup failed"); }
    }catch{ setAuthError("Network error. Please try again."); }
    setAuthLoading(false);
  },[stats.onboarded,setToast]);

  // Auth: login
  const handleLogin=useCallback(async(email,password)=>{
    setAuthLoading(true);setAuthError(null);
    try{
      const res=await fetch(WORKER_BASE+"/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const d=await res.json();
      if(d.ok){
        setAuthToken(d.token);localStorage.setItem('bsm_auth_token',d.token);
        setAuthUser(d.user);setAuthProfile(d.profile);
        // Load server stats, merging with local (higher gp wins)
        if(d.stats&&Object.keys(d.stats).length>0){
          setStats(p=>(d.stats.gp||0)>=(p.gp||0)?{...DEFAULT,...d.stats}:p);
        }
        setScreen(stats.onboarded||(d.stats&&d.stats.onboarded)?"home":"onboard");
        snd.play('ach');
        setToast({e:"👋",n:`Welcome back!`,d:"Your progress has been loaded."});setTimeout(()=>setToast(null),4000);
      } else { setAuthError(d.error||"Login failed"); }
    }catch{ setAuthError("Network error. Please try again."); }
    setAuthLoading(false);
  },[stats.onboarded,snd,setToast]);
  
  const lvl=getLvl(stats.pts);const nxt=getNxt(stats.pts);
  const prog=nxt?((stats.pts-lvl.min)/(nxt.min-lvl.min))*100:100;
  const acc=stats.gp>0?Math.round((stats.co/stats.gp)*100):0;

  // Whoosh on screen transitions
  const prevScreen=useRef(screen);
  useEffect(()=>{if(screen!==prevScreen.current){if(screen==="play"||screen==="seasonIntro")snd.play('whoosh');prevScreen.current=screen;}},[screen,snd]);

  // Keyboard
  useEffect(()=>{const h=e=>{
    if(screen==="play"&&choice===null&&!aiLoading&&e.key>="1"&&e.key<="4"){e.preventDefault();handleChoice(parseInt(e.key)-1)}
    if(screen==="outcome"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();next()}
    if(e.key==="Escape")goHome();
  };window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[screen,choice,aiLoading,handleChoice,next,goHome]);

  // Speed Round timer — waits for options to reveal before starting
  useEffect(()=>{
    if(speedMode&&screen==="play"&&choice===null&&!timerActive){
      const delay=setTimeout(()=>{setTimerGo(true);setTimeout(()=>{setTimerGo(false);setTimerActive(true)},600)},640);
      return()=>clearTimeout(delay);
    }
  },[speedMode,screen,choice,timerActive]);
  useEffect(()=>{
    if(speedMode&&screen==="play"&&choice===null&&!aiLoading&&timerActive&&timer>0){
      if(timer<=5)snd.play('tick');
      timerRef.current=setTimeout(()=>setTimer(t=>t-1),1000);
      return()=>clearTimeout(timerRef.current);
    }
    if(speedMode&&screen==="play"&&choice===null&&timer<=0&&timerActive&&sc){
      // Time's up — reveal correct answer instead of auto-selecting wrong
      snd.play('wrong');setCoachMsg("Time's up! Read the answer — you'll get it next time!");
      const cat="danger";const pts=2;
      setChoice(-1);setFo(cat);setAk(k=>k+1);
      const o={cat,isOpt:false,exp:`Time ran out! The best answer was "${sc.options[sc.best]}"`,bestExp:sc.explanations[sc.best],bestOpt:sc.options[sc.best],concept:sc.concept,pts,chosen:"(timed out)",rate:0,anim:sc.anim,speedBonus:0,timeLeft:0};
      setOd(o);
      setSpeedRound(sr=>sr?{...sr,results:[...sr.results,{isOpt:false,pts,speedBonus:0,timeLeft:0,concept:sc.concept,pos,timedOut:true}]}:sr);
      setStats(p=>{const today=new Date().toDateString();return{...p,pts:p.pts+pts,str:0,gp:p.gp+1,ps:{...p.ps,[pos]:{p:(p.ps[pos]?.p||0)+1,c:p.ps[pos]?.c||0}},todayPlayed:(p.todayDate===today?p.todayPlayed:0)+1,todayDate:today,sp:0,recentWrong:[...(p.recentWrong||[]),sc.concept].slice(-5)}});
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>speedNextRef.current?.(),3500)},200)},1800);
    }
  },[speedMode,screen,choice,aiLoading,timerActive,timer,sc,snd,pos]);

  // Speed Round flow
  const speedUsedIdsRef=useRef(new Set());
  const speedUsedDescsRef=useRef(new Set());
  const startSpeedRound=useCallback((filterPositions)=>{
    if(atLimit){setPanel('limit');return;}
    snd.play('tap');
    setSpeedMode(true);setDailyMode(false);setAiMode(false);setSpeedFilter(null);
    // Phase 2.4: Age-filter positions — no Manager/Rules/Counts for young players in random mode
    const ageAppropriate=stats.ageGroup==="6-8"?ALL_POS.filter(p=>!["manager","famous","rules","counts"].includes(p)):stats.ageGroup==="9-10"?ALL_POS.filter(p=>!["manager","rules","counts"].includes(p)):ALL_POS;
    const pool=filterPositions&&filterPositions.length>0?filterPositions:[...ageAppropriate];
    // Shuffle and pick 5 positions (dedup via shuffle-slice instead of random-with-replacement)
    const shuffled=[...pool].sort(()=>Math.random()-.5);
    const positions=[];for(let i=0;i<5;i++)positions.push(shuffled[i%shuffled.length]);
    speedUsedIdsRef.current=new Set();
    speedUsedDescsRef.current=new Set();
    setSpeedRound({round:0,total:5,results:[],startTime:Date.now(),positions});
    const p=positions[0];setPos(p);
    let s=getRand(p);
    // Avoid duplicates across speed round (check both ID and description text)
    let tries=0;const descKey=s2=>(s2.description||'').toLowerCase().slice(0,80);
    while((speedUsedIdsRef.current.has(s.id)||speedUsedDescsRef.current.has(descKey(s)))&&tries<20){s=getRand(p);tries++;}
    speedUsedIdsRef.current.add(s.id);speedUsedDescsRef.current.add(descKey(s));
    setSc(s);
    setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setTimer(speedTimerMax);setTimerActive(false);setTimerGo(false);setScreen("play");
    s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),80+i*60);});
  },[snd,atLimit,getRand]);

  const speedNext=useCallback(()=>{
    if(!speedRound)return;
    const nextRound=speedRound.round+1;
    if(nextRound>=speedRound.total){
      // Speed round complete — show results
      setScreen("speedResults");return;
    }
    const p=speedRound.positions[nextRound%speedRound.positions.length];
    setPos(p);
    let s=getRand(p);
    const descKey=s2=>(s2.description||'').toLowerCase().slice(0,80);
    let _tries=0;while((speedUsedIdsRef.current.has(s.id)||speedUsedDescsRef.current.has(descKey(s)))&&_tries<20){s=getRand(p);_tries++;}
    speedUsedIdsRef.current.add(s.id);speedUsedDescsRef.current.add(descKey(s));
    setSc(s);
    setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);
    setSpeedRound(sr=>({...sr,round:nextRound}));
    setTimer(speedTimerMax);setTimerActive(false);setTimerGo(false);setScreen("play");
    s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),80+i*60);});
  },[speedRound,getRand]);
  speedNextRef.current=speedNext;

  // Survival Mode flow
  const startSurvival=useCallback(()=>{
    if(atLimit){setPanel('limit');return;}
    snd.play('tap');
    setSurvivalMode(true);setSpeedMode(false);setDailyMode(false);setAiMode(false);
    setSurvivalRun({count:0,pts:0,concepts:[],history:[]});
    // Pick random position and scenario (start at diff 1)
    const p=ALL_POS[Math.floor(Math.random()*ALL_POS.length)];setPos(p);
    const pool=(SCENARIOS[p]||[]).filter(s=>s.diff<=1);
    const s=pool.length>0?pool[Math.floor(Math.random()*pool.length)]:getRand(p);
    setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setScreen("play");
    s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
  },[snd,atLimit,getRand]);

  const startSituation=useCallback((set)=>{
    snd.play('tap');
    setSitMode(true);setSpeedMode(false);setSurvivalMode(false);setDailyMode(false);setSeasonMode(false);setAiMode(false);
    setSitSet(set);setSitQ(0);setSitResults([]);
    setScreen("sitIntro");
  },[snd]);

  const survivalNext=useCallback(()=>{
    if(!survivalRun)return;
    const count=survivalRun.count+1;
    // Increase difficulty as you progress: 1-3→diff1, 4-6→diff2, 7+→diff3
    // Phase 2.5: Cap at player's age-group maxDiff so young players don't hit impossible scenarios
    const rawDiff=count<3?1:count<6?2:3;
    const targetDiff=Math.min(rawDiff,maxDiff);
    // Phase 2.4: Age-filter positions in Survival too
    const survivalPos=stats.ageGroup==="6-8"?ALL_POS.filter(p=>!["manager","famous","rules","counts"].includes(p)):ALL_POS;
    const p=survivalPos[Math.floor(Math.random()*survivalPos.length)];setPos(p);
    const pool=(SCENARIOS[p]||[]).filter(s=>s.diff<=targetDiff);
    const s=pool.length>0?pool[Math.floor(Math.random()*pool.length)]:getRand(p);
    setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);
    setScreen("play");
    s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
  },[survivalRun,getRand]);
  survivalNextRef.current=survivalNext;

  // Real Game mode (Pillar 7D)
  const startRealGame=useCallback(()=>{
    if(atLimit){setPanel('limit');return;}
    if(!stats.isPro){setPanel('upgrade');return;}
    snd.play('tap');
    setRealGameMode(true);setSpeedMode(false);setSurvivalMode(false);setDailyMode(false);setSeasonMode(false);setSitMode(false);setAiMode(true);setAiFallback(false);setWrongStreak(0);
    sessionPlanRef.current=null;sessionPlanPosRef.current=null;
    setRealGame({inning:1,playerScore:0,opponentScore:0,results:[],isComplete:false});
    // Pick a random position for inning 1
    const p=ALL_POS[Math.floor(Math.random()*ALL_POS.length)];setPos(p);
    setAiLoading(true);setScreen("play");
    const _aiHist=stats.aiHistory||[];
    generateAIScenario(p,stats,stats.cl||[],stats.recentWrong||[],null,null,_aiHist).then(result=>{
      setAiLoading(false);
      if(result?.scenario){
        // Force inning 1 context
        result.scenario.situation={...result.scenario.situation,inning:"Top 1",score:[0,0]};
        setSc(result.scenario);result.scenario.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
      }else{
        setAiMode(false);setAiFallback(true);
        const s=getRand(p);setSc(s);s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
      }
    });
  },[snd,atLimit,stats,getRand]);

  const realGameNext=useCallback(()=>{
    if(!realGame)return;
    const nextInn=realGame.inning+1;
    if(nextInn>9){
      // Game over — award win bonus XP
      const won=realGame.playerScore>realGame.opponentScore;
      if(won){setStats(p=>({...p,pts:(p.pts||0)+50,realGameWins:(p.realGameWins||0)+1}));}
      setStats(p=>({...p,realGamesPlayed:(p.realGamesPlayed||0)+1}));
      setRealGame(rg=>rg?{...rg,isComplete:true}:rg);
      setScreen("realGameOver");return;
    }
    setRealGame(rg=>rg?{...rg,inning:nextInn}:rg);
    const p=ALL_POS[(nextInn-1)%ALL_POS.length];setPos(p);
    setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);
    setAiLoading(true);setScreen("play");
    const _aiHist=stats.aiHistory||[];
    const pScore=realGame.playerScore;const oScore=realGame.opponentScore;
    generateAIScenario(p,stats,stats.cl||[],stats.recentWrong||[],null,null,_aiHist).then(result=>{
      setAiLoading(false);
      if(result?.scenario){
        const half=nextInn<=5?"Top":"Bot";
        result.scenario.situation={...result.scenario.situation,inning:`${half} ${nextInn}`,score:[pScore,oScore]};
        setSc(result.scenario);result.scenario.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
      }else{
        setAiMode(false);setAiFallback(true);
        const s=getRand(p);setSc(s);s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});
      }
    });
  },[realGame,stats,getRand]);
  realGameNextRef.current=realGameNext;

  // Season Mode helpers
  const getSeasonStage=useCallback((gameNum)=>{
    let count=0;
    for(const st of SEASON_STAGES){const stTotal=st.games*3;if(gameNum<count+stTotal)return{...st,progress:gameNum-count,stTotal};count+=stTotal;}
    return{...SEASON_STAGES[SEASON_STAGES.length-1],progress:0,stTotal:3};
  },[]);
  const getSeasonStageIdx=useCallback((gameNum)=>{
    let count=0;
    for(let i=0;i<SEASON_STAGES.length;i++){const stTotal=SEASON_STAGES[i].games*3;if(gameNum<count+stTotal)return i;count+=stTotal;}
    return SEASON_STAGES.length-1;
  },[]);

  const launchSeasonGame=useCallback((gameNum)=>{
    const stage=getSeasonStage(gameNum);
    const p=ALL_POS[gameNum%ALL_POS.length];setPos(p);
    const pool=(SCENARIOS[p]||[]).filter(s=>s.diff<=stage.diff);
    const s=pool.length>0?pool[Math.floor(Math.random()*pool.length)]:getRand(p);
    setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setScreen("play");s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
  },[getSeasonStage,getRand]);

  const startSeason=useCallback(()=>{
    if(atLimit){setPanel('limit');return;}
    snd.play('tap');setSeasonMode(true);setSpeedMode(false);setDailyMode(false);setSurvivalMode(false);setAiMode(false);
    const stageIdx=getSeasonStageIdx(stats.seasonGame);
    // Show stage intro if entering a new stage
    if(stageIdx!==lastSeasonStage){
      setLastSeasonStage(stageIdx);setSeasonStageIntro(SEASON_STAGES[stageIdx]);setScreen("seasonIntro");
    }else{launchSeasonGame(stats.seasonGame);}
  },[atLimit,snd,stats.seasonGame,getSeasonStageIdx,lastSeasonStage,launchSeasonGame]);

  const seasonNext=useCallback(()=>{
    const nextGame=stats.seasonGame+1;
    if(nextGame>=SEASON_TOTAL){setStats(p=>({...p,seasonComplete:true}));goHomeRef.current?.();return;}
    setStats(p=>({...p,seasonGame:nextGame}));
    const prevIdx=getSeasonStageIdx(stats.seasonGame);
    const nextIdx=getSeasonStageIdx(nextGame);
    // Show stage intro when entering a new stage
    if(nextIdx!==prevIdx){
      setLastSeasonStage(nextIdx);setSeasonStageIntro(SEASON_STAGES[nextIdx]);setScreen("seasonIntro");
    }else{launchSeasonGame(nextGame);}
  },[stats.seasonGame,getSeasonStageIdx,launchSeasonGame]);
  seasonNextRef.current=seasonNext;

  // Shared styles
  // Age-based font scaling: 6-8 gets 30% larger, 9-10 gets 10% larger
  const fontScale=stats.ageGroup==="6-8"?1.3:stats.ageGroup==="9-10"?1.1:1;
  const fs=(b)=>Math.round(b*fontScale);

  const card={background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.05)",borderRadius:14,padding:14};
  const btn=(bg,c)=>({background:bg,color:c||"white",border:"none",borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",letterSpacing:.3,minHeight:48});
  const ghost={background:"none",border:"none",color:"#9ca3af",fontSize:13,cursor:"pointer",padding:"8px 12px",minHeight:40};

  if(screen==="loading")return(<div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:8}}>⚾</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#f59e0b",letterSpacing:2}}>LOADING...</div></div></div>);

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0f1a,#111827 50%,#0f172a)",fontFamily:"'DM Sans',-apple-system,sans-serif",color:"white",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      
      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"linear-gradient(135deg,#1a1a2e,#16213e)",border:"2px solid #f59e0b",borderRadius:14,padding:"8px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 30px rgba(245,158,11,.3)",animation:"sd .35s ease-out",maxWidth:"90vw"}}>
        <span style={{fontSize:24}}>{toast.e}</span>
        <div><div style={{fontSize:9,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{toast.id?"Achievement Unlocked!":toast.n}</div><div style={{fontSize:13,fontWeight:700}}>{toast.id?toast.n:toast.d}</div></div>
      </div>}

      {/* Level Up Overlay */}
      {lvlUp&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .3s ease-out"}} onClick={()=>setLvlUp(null)}>
        <ParticleFX active={true} type="confetti"/>
        <div style={{textAlign:"center",animation:"su .4s ease-out",position:"relative",zIndex:1}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:64,marginBottom:8}}>{lvlUp.e}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:2}}>LEVEL UP!</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:lvlUp.c,letterSpacing:2}}>{lvlUp.n.toUpperCase()}</div>
          <button onClick={()=>setLvlUp(null)} style={{...btn("rgba(255,255,255,.1)"),width:"auto",padding:"8px 24px",marginTop:16,fontSize:13}}>Continue</button>
        </div>
      </div>}

      {/* Sprint D2: Achievement Celebration Overlay */}
      {achCelebration&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .3s ease-out"}} onClick={()=>setAchCelebration(null)}>
        <ParticleFX active={true} type="confetti"/>
        <div style={{textAlign:"center",animation:"su .4s ease-out",position:"relative",zIndex:1}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:80,marginBottom:8,animation:"pulse 1s ease-in-out infinite"}}>{achCelebration.e}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:3,marginBottom:4}}>ACHIEVEMENT UNLOCKED!</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"white",letterSpacing:2,marginBottom:8}}>{achCelebration.n.toUpperCase()}</div>
          <div style={{fontSize:14,color:"#9ca3af",maxWidth:280,margin:"0 auto",lineHeight:1.4}}>{achCelebration.d}</div>
          <button onClick={()=>{setAchCelebration(null);}} style={{...btn("linear-gradient(135deg,#f59e0b,#d97706)"),width:"auto",padding:"8px 24px",marginTop:16,fontSize:13,color:"#000",fontWeight:700}}>Awesome!</button>
        </div>
      </div>}

      {/* Header */}
      {screen!=="onboard"&&<div style={{background:"rgba(0,0,0,.6)",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"6px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}} onClick={goHome}>
          <span style={{fontSize:18}}>⚾</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1.5,color:"#f59e0b"}}>STRATEGY MASTER</span>
        </div>
        <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span style={{background:"#f59e0b15",border:"1px solid #f59e0b25",borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#f59e0b"}}>🏆{stats.pts}</span>
          {stats.ds>0&&(()=>{const fl=getFlame(stats.ds);return <span style={{background:`${fl.color}12`,border:`1px solid ${fl.color}22`,borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:fl.color,boxShadow:stats.ds>=7?`0 0 8px ${fl.glow}`:"none"}}>{fl.icon}{stats.ds}d</span>})()}
          {stats.str>0&&<span style={{background:"#f9731615",border:"1px solid #f9731625",borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#f97316"}}>🔥{stats.str}</span>}
          {!stats.isPro&&<span style={{background:remaining<=0?"rgba(239,68,68,.12)":remaining<=3?"rgba(245,158,11,.12)":"rgba(255,255,255,.04)",border:`1px solid ${remaining<=0?"rgba(239,68,68,.25)":remaining<=3?"rgba(245,158,11,.25)":"rgba(255,255,255,.08)"}`,borderRadius:7,padding:"2px 8px",fontSize:10,fontWeight:700,color:remaining<=0?"#ef4444":remaining<=3?"#f59e0b":"#9ca3af"}}>{remaining>0?`⚾ ${remaining}/${DAILY_FREE}`:"✨ Tomorrow"}</span>}
          {stats.isPro&&<span onClick={()=>setShowProBenefits(v=>!v)} style={{background:"linear-gradient(135deg,rgba(245,158,11,.15),rgba(234,179,8,.1))",border:"1px solid rgba(245,158,11,.3)",borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:800,color:"#f59e0b",cursor:"pointer"}}>⭐ ALL-STAR</span>}
          {authUser&&<span onClick={()=>syncStatus==='error'?syncToServer(stats):null} style={{background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:600,color:syncStatus==='synced'?"#22c55e":syncStatus==='syncing'?"#3b82f6":syncStatus==='error'?"#ef4444":"#6b7280",cursor:syncStatus==='error'?"pointer":"default"}} title={syncStatus==='synced'?"Progress saved":syncStatus==='syncing'?"Syncing...":syncStatus==='error'?"Sync failed — tap to retry":"Signed in"}>{syncStatus==='syncing'?"↻":syncStatus==='synced'?"☁✓":syncStatus==='error'?"☁!":"☁"}</span>}
          <span onClick={()=>setShowProgression(v=>!v)} style={{background:`${lvl.c}12`,border:`1px solid ${lvl.c}25`,borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:lvl.c,cursor:"pointer"}}>{lvl.e}{lvl.n}</span>
        </div>
      </div>}

      {showProBenefits&&stats.isPro&&<div style={{maxWidth:640,margin:"0 auto",padding:"6px 16px 0"}}>
        <div style={{background:"linear-gradient(135deg,rgba(245,158,11,.06),rgba(234,179,8,.03))",border:"1px solid rgba(245,158,11,.15)",borderRadius:12,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#f59e0b",letterSpacing:1}}>ALL-STAR PASS</span>
            <button onClick={()=>setShowProBenefits(false)} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {["Unlimited daily plays","🤖 AI Coach challenges","All 10 field themes","Full avatar customization","2x XP on every play","Weekly streak freeze"].map((b,i)=>
              <div key={i} style={{fontSize:10,color:"#d1d5db",display:"flex",alignItems:"center",gap:5}}><span style={{color:"#22c55e",fontSize:11}}>✓</span>{b}</div>
            )}
          </div>
          <div style={{fontSize:9,color:"#9ca3af",marginTop:6}}>Plan: {stats.proPlan==="promo-lifetime"?"Promo (Lifetime)":stats.proPlan==="promo-30day"?"Promo (30-day)":stats.proPlan||"lifetime"}{stats.proExpiry?` · ${(stats.proPlan||"").startsWith("promo-")?"Expires":"Renews"}: ${new Date(stats.proExpiry).toLocaleDateString()}`:""}</div>
        </div>
      </div>}

      {showProgression&&<div style={{maxWidth:640,margin:"0 auto",padding:"6px 16px 0"}}>
        <div style={{background:"linear-gradient(135deg,rgba(168,85,247,.06),rgba(59,130,246,.04))",border:`1px solid ${lvl.c}25`,borderRadius:12,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:lvl.c,letterSpacing:1}}>PROGRESSION</span>
            <button onClick={()=>setShowProgression(false)} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>
            {LEVELS.map((l,i)=>{const earned=stats.pts>=l.min;const current=lvl.n===l.n;const nextLvl=LEVELS[i+1];return(
              <div key={l.n} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 6px",background:current?`${l.c}10`:"transparent",borderRadius:8,border:current?`1px solid ${l.c}30`:"1px solid transparent"}}>
                <span style={{fontSize:16,opacity:earned?1:.3}}>{l.e}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:current?800:600,color:earned?l.c:"#4b5563"}}>{l.n}{current?" (You)":""}</div>
                  <div style={{fontSize:9,color:"#9ca3af"}}>{l.min}+ pts{nextLvl?` → ${nextLvl.min} pts`:""}</div>
                </div>
                {earned&&<span style={{fontSize:10,color:"#22c55e"}}>✓</span>}
              </div>
            )})}
          </div>
          {nxt?<div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#9ca3af",marginBottom:2}}>
              <span style={{color:lvl.c,fontWeight:700}}>{stats.pts} pts</span><span>{nxt.min-stats.pts} to {nxt.n}</span>
            </div>
            <div style={{height:5,background:"rgba(255,255,255,.04)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${prog}%`,background:`linear-gradient(90deg,${lvl.c},${nxt.c})`,borderRadius:3,transition:"width .5s"}}/>
            </div>
          </div>:<div style={{fontSize:10,color:"#a855f7",textAlign:"center",fontWeight:700}}>
            Max level reached! Season {stats.season||1}{(stats.season||1)>1?` · +${((stats.season||1)-1)*10}% XP bonus`:""}
          </div>}
        </div>
      </div>}

      <div style={{maxWidth:640,margin:"0 auto",padding:"10px 16px"}}>

        {/* LOGIN */}
        {screen==="login"&&<LoginScreen onLogin={handleLogin} onSignup={()=>{setAuthError(null);setScreen("signup")}} onSkip={()=>{setAuthError(null);setScreen(stats.onboarded?"home":"onboard")}} authError={authError} authLoading={authLoading} btn={btn} ghost={ghost}/>}

        {/* SIGNUP */}
        {screen==="signup"&&<SignupScreen onSignup={handleSignup} onLogin={()=>{setAuthError(null);setScreen("login")}} onSkip={()=>{setAuthError(null);setScreen(stats.onboarded?"home":"onboard")}} authError={authError} authLoading={authLoading} stats={stats} btn={btn} ghost={ghost}/>}

        {/* ONBOARDING */}
        {screen==="onboard"&&<div style={{textAlign:"center",padding:"60px 20px 40px"}}>
          <div style={{fontSize:64,marginBottom:12}}>⚾</div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,letterSpacing:2,color:"#f59e0b",lineHeight:1,marginBottom:6}}>BASEBALL<br/>STRATEGY MASTER</h1>
          <p style={{color:"#9ca3af",fontSize:14,maxWidth:320,margin:"0 auto 24px",lineHeight:1.6}}>Think like a pro. {totalSc} real baseball challenges across 15 positions.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:300,margin:"0 auto 24px"}}>
            {[{e:"🎯",t:"Choose wisely",d:"Read the situation and pick the best strategy"},{e:"💡",t:"Learn the WHY",d:"Every answer teaches real MLB strategy"},{e:"📈",t:"Level up",d:"Track your progress from Rookie to Hall of Fame"}].map((it,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",textAlign:"left",background:"rgba(255,255,255,.02)",borderRadius:10,padding:"10px 12px"}}>
                <span style={{fontSize:24,flexShrink:0}}>{it.e}</span>
                <div><div style={{fontSize:14,fontWeight:700}}>{it.t}</div><div style={{fontSize:12,color:"#9ca3af",lineHeight:1.4}}>{it.d}</div></div>
              </div>
            ))}
          </div>
          <div style={{maxWidth:300,margin:"0 auto 20px"}}>
            <div style={{fontSize:11,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6,textAlign:"center"}}>Your Player Name</div>
            <input value={stats.displayName} onChange={e=>setStats(p=>({...p,displayName:e.target.value.slice(0,15)}))}
              placeholder={placeholderNameRef.current}
              style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 12px",color:"white",fontSize:14,textAlign:"center",outline:"none",marginBottom:12}}/>
          </div>
          <div style={{maxWidth:300,margin:"0 auto 20px",textAlign:"left"}}>
            <div style={{fontSize:11,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6,textAlign:"center"}}>How old are you?</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {AGE_GROUPS.map(ag=>(
                <button key={ag.id} onClick={()=>setStats(p=>({...p,ageGroup:ag.id}))}
                  style={{background:stats.ageGroup===ag.id?"rgba(245,158,11,.12)":"rgba(255,255,255,.02)",border:`1.5px solid ${stats.ageGroup===ag.id?"#f59e0b":"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",color:stats.ageGroup===ag.id?"#f59e0b":"#9ca3af",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:13,fontWeight:700}}>{ag.label}</div>
                  <div style={{fontSize:10,color:stats.ageGroup===ag.id?"rgba(245,158,11,.7)":"#4b5563",marginTop:2}}>{ag.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{maxWidth:300,margin:"0 auto 20px",textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6}}>What do you want to try first?</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[{label:"Batter",emoji:"🎯",pos:"batter"},{label:"Pitcher",emoji:"⚾",pos:"pitcher"},{label:"Fielder",emoji:"🧤",pos:"shortstop"},{label:"Manager",emoji:"📋",pos:"manager"}].map(cat=>(
                <button key={cat.pos} onClick={()=>setStats(p=>({...p,favoritePosition:cat.pos}))}
                  style={{background:stats.favoritePosition===cat.pos?"rgba(59,130,246,.15)":"rgba(255,255,255,.02)",border:`1.5px solid ${stats.favoritePosition===cat.pos?"#3b82f6":"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",color:stats.favoritePosition===cat.pos?"#93c5fd":"#9ca3af",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:20}}>{cat.emoji}</div>
                  <div style={{fontSize:12,fontWeight:700}}>{cat.label}</div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={()=>finishOnboard(stats.favoritePosition||"batter")} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{boxShadow:"0 4px 15px rgba(245,158,11,.3)",maxWidth:300}}}>Let's Play! →</button>
          <div style={{fontSize:11,color:"#6b7280",marginTop:8,textAlign:"center"}}>Green = great play, Yellow = okay, Red = needs work</div>
          {!authUser&&<button onClick={()=>setScreen("login")} style={{...ghost,fontSize:11,display:"block",margin:"8px auto",color:"#9ca3af"}}>Already have an account? Log In</button>}
        </div>}

        {/* HOME */}
        {screen==="home"&&<div>
          {sessionRecap&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setSessionRecap(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",borderRadius:20,padding:"28px 24px",maxWidth:340,width:"100%",textAlign:"center",border:"2px solid rgba(59,130,246,.3)"}}>
              <div style={{fontSize:44,marginBottom:6}}>📊</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#3b82f6",letterSpacing:1.5,marginBottom:12}}>SESSION RECAP</div>
              <div style={{display:"flex",justifyContent:"space-around",marginBottom:14}}>
                {[{v:sessionRecap.plays,l:"Played",c:"#3b82f6"},{v:sessionRecap.correct,l:"Correct",c:"#22c55e"},{v:sessionRecap.plays>0?Math.round((sessionRecap.correct/sessionRecap.plays)*100)+"%":"—",l:"Accuracy",c:"#f59e0b"}].map((s,i)=>
                  <div key={i}><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{s.l}</div></div>
                )}
              </div>
              {sessionRecap.concepts.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:5}}>Concepts Practiced</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
                  {sessionRecap.concepts.slice(0,6).map((c,i)=><span key={i} style={{background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",borderRadius:6,padding:"2px 7px",fontSize:9,color:"#93c5fd"}}>{kidConceptName(c,stats.ageGroup)}</span>)}
                  {sessionRecap.concepts.length>6&&<span style={{fontSize:9,color:"#9ca3af"}}>+{sessionRecap.concepts.length-6} more</span>}
                </div>
              </div>}
              {sessionRecap.newConcepts&&sessionRecap.newConcepts.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:"#22c55e",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:5}}>What You Learned</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
                  {sessionRecap.newConcepts.slice(0,4).map((c,i)=><span key={i} style={{background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.2)",borderRadius:6,padding:"2px 7px",fontSize:9,color:"#86efac"}}>🆕 {kidConceptName(c,stats.ageGroup)}</span>)}
                </div>
              </div>}
              <div style={{margin:"10px 0",fontSize:11,color:sessionRecap.improvement?"#86efac":"#fbbf24",fontWeight:700}}>
                {sessionRecap.improvement?"✅ Better than last session!":"Keep practicing to beat your last session!"}
              </div>
              <button onClick={()=>{const txt=`I just played ${sessionRecap.plays} scenarios on Baseball Strategy Master with ${Math.round((sessionRecap.correct/sessionRecap.plays)*100)}% accuracy! 🎯⚾`;navigator.clipboard.writeText(txt);setToast({e:"📋",n:"Copied!",d:"Progress shared to clipboard"});setTimeout(()=>setToast(null),2500)}} style={{...ghost,fontSize:10,marginBottom:8,width:"100%"}}>Share your progress →</button>
              <button onClick={()=>setSessionRecap(null)} style={{...btn("linear-gradient(135deg,#2563eb,#3b82f6)"),...{fontSize:13,padding:"10px 28px"}}}>{stats.gp>0?"Continue":"Let's Play!"}→</button>
            </div>
          </div>}
          {/* Tutorial overlay removed — onboard screen now handles age + position interest + auto-starts first game */}
          {stats.gp===0&&!stats.tutorialDone&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#1e293b",borderRadius:20,padding:"32px 24px",maxWidth:340,width:"100%",textAlign:"center",border:"2px solid rgba(245,158,11,.3)"}}>
              <div style={{fontSize:48,marginBottom:8}}>⚾</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f59e0b",letterSpacing:1,marginBottom:8}}>Welcome!</div>
              <p style={{fontSize:13,color:"#d1d5db",lineHeight:1.6,marginBottom:16}}>Green = great play, Yellow = okay, Red = needs work. Every answer teaches you real baseball strategy!</p>
              <button onClick={()=>setStats(p=>({...p,tutorialDone:true}))} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{fontSize:13,padding:"10px 28px"}}}>Got it!</button>
            </div>
          </div>}
          {masteryPos&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.85)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#1e293b",borderRadius:20,padding:"32px 24px",maxWidth:360,width:"100%",textAlign:"center",border:"2px solid rgba(34,197,94,.3)"}}>
              <div style={{fontSize:56,marginBottom:8}}>{POS_META[masteryPos]?.emoji||"🏆"}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#22c55e",letterSpacing:1,marginBottom:4}}>POSITION MASTERED!</div>
              <div style={{fontSize:14,fontWeight:700,color:"#d1d5db",marginBottom:12}}>You completed all {(SCENARIOS[masteryPos]||[]).length} {POS_META[masteryPos]?.label||masteryPos} scenarios!</div>
              {(()=>{const ps=stats.ps[masteryPos]||{p:0,c:0};const pAcc=ps.p>0?Math.round((ps.c/ps.p)*100):0;return(
                <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:16}}>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#22c55e"}}>{pAcc}%</div><div style={{fontSize:9,color:"#9ca3af"}}>Accuracy</div></div>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#3b82f6"}}>{ps.p}</div><div style={{fontSize:9,color:"#9ca3af"}}>Played</div></div>
                  <div><div style={{fontSize:20,fontWeight:800,color:"#f59e0b"}}>{ps.c}</div><div style={{fontSize:9,color:"#9ca3af"}}>Correct</div></div>
                </div>
              )})()}
              {POS_SUGGESTIONS[masteryPos]&&POS_META[POS_SUGGESTIONS[masteryPos]]&&<div style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                <div style={{fontSize:11,color:"#93c5fd"}}>Try <strong>{POS_META[POS_SUGGESTIONS[masteryPos]].label}</strong> next! {POS_META[POS_SUGGESTIONS[masteryPos]].emoji}</div>
              </div>}
              {!stats.isPro&&<div style={{background:"rgba(245,158,11,.06)",border:"1px solid rgba(245,158,11,.15)",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                <div style={{fontSize:11,color:"#fbbf24"}}>Want more {POS_META[masteryPos]?.label||masteryPos} scenarios? AI coaching creates unlimited new ones!</div>
                <button onClick={()=>{setMasteryPos(null);setPanel('upgrade');trackFunnel('mastery_upsell',setStats)}} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{fontSize:11,padding:"6px 16px",marginTop:6}}}>View All-Star Pass</button>
              </div>}
              <button onClick={()=>setMasteryPos(null)} style={{...btn("linear-gradient(135deg,#059669,#22c55e)"),...{fontSize:14,padding:"12px 32px"}}}>{POS_SUGGESTIONS[masteryPos]?"Continue Playing":"Back to Home"}</button>
            </div>
          </div>}
          <div style={{textAlign:"center",padding:"20px 0 14px"}}>
            <div style={{fontSize:48,marginBottom:4}}>⚾</div>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:"#f59e0b",lineHeight:1,marginBottom:4}}>STRATEGY MASTER</h1>
            <p style={{color:"#9ca3af",fontSize:12,maxWidth:340,margin:"0 auto"}}>{totalSc} challenges · {Object.keys(SCENARIOS).length} positions · Real baseball strategy</p>
          </div>

          {/* BUG-09: Session Stats button at top when at play limit */}
          {stats.gp>0&&atLimit&&<button onClick={()=>setPanel('limit')} style={{width:"100%",background:"linear-gradient(135deg,rgba(34,197,94,.08),rgba(22,163,74,.04))",border:"2px solid rgba(34,197,94,.25)",borderRadius:16,padding:"16px 20px",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:14,textAlign:"left",minHeight:56}}>
            <div style={{fontSize:28,flexShrink:0}}>📊</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#22c55e",letterSpacing:1}}>GREAT SESSION!</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:1}}>See your stats · Come back tomorrow for Daily Diamond</div>
            </div>
          </button>}

          {/* Daily Brain Fact + Baseball Brain entry point */}
          {stats.gp>=3&&(()=>{
            const BRAIN_FACTS=[
              {text:"Batters hit .400 on 2-0 counts — the best hitter's count in baseball.",tab:"counts",state:{count:"2-0"}},
              {text:"A sacrifice bunt costs 0.23 expected runs with a runner on first.",tab:"re24"},
              {text:"The pitch clock shortened steal windows by 0.20 seconds.",tab:"steal"},
              {text:"Elite catchers save +15 runs per season just from pitch framing.",tab:"pitchlab"},
              {text:"At 0-2, pitchers strike out the batter 27% of the time on the next pitch.",tab:"counts",state:{count:"0-2"}},
              {text:"The sweeper has the best run value in baseball at -1.6 per 100 pitches.",tab:"pitchlab"},
              {text:"After 90+ pitches, a starter's velocity drops ~2.1 mph.",tab:"pitchcount"},
              {text:"Runners on 3rd with 0 outs score 85% of the time.",tab:"re24",state:{runners:[3],outs:0}},
              {text:"Opposite-hand batters hit 18 BA points higher than same-hand.",tab:"matchup"},
              {text:"At Coors Field, fly balls carry 10% farther due to altitude.",tab:"park"},
              {text:"Infield in costs 0.20 runs/game on average — use only when 1 run matters.",tab:"defense"},
              {text:"Clutch hitting has a year-to-year correlation of just 0.08 — essentially random.",tab:"winprob"},
              {text:"Line drives fall for hits 68.5% of the time. Popups: just 2%.",tab:"history"},
              {text:"A double play drops run expectancy by over 1.0 runs on average.",tab:"re24"},
              {text:"Switch hitters bat .257 regardless of pitcher hand — neutralizing platoon.",tab:"matchup"},
              {text:"The 3rd time through the order, batters hit +30 BA points better.",tab:"matchup"},
              {text:"First-pitch strikes save 0.048 runs per batter faced.",tab:"counts",state:{count:"0-0"}},
              {text:"Steals need a 72% success rate to break even with 0-1 outs.",tab:"steal"},
              {text:"In the 9th inning, decisions matter 1.7x more than in the 1st (leverage).",tab:"winprob"},
              {text:"Turf makes grounders 17.5% faster — infielders play 1.5 feet deeper.",tab:"park"},
            ];
            const factIdx=Math.floor(Date.now()/86400000)%BRAIN_FACTS.length;
            const fact=BRAIN_FACTS[factIdx];
            return <button onClick={()=>{setBrainTab(fact.tab);if(fact.state){if(fact.state.count)setSelCount(fact.state.count);if(fact.state.runners){setReRunners(fact.state.runners);setReOuts(fact.state.outs||0);}}setScreen("brain");}} style={{width:"100%",background:"linear-gradient(135deg,rgba(168,85,247,.06),rgba(59,130,246,.06))",border:"1px solid rgba(168,85,247,.12)",borderRadius:12,padding:"8px 14px",cursor:"pointer",textAlign:"left",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16,flexShrink:0}}>🧠</span>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#a855f7",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Did you know?</div>
                <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.4,marginTop:1}}>{fact.text}</div>
              </div>
              <span style={{fontSize:10,color:"#a855f7",flexShrink:0}}>→</span>
            </button>;
          })()}
          {stats.gp>=1&&<button onClick={()=>setScreen("brain")} style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"2px solid rgba(168,85,247,.3)",borderRadius:16,padding:"14px 20px",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:14,textAlign:"left",boxShadow:"0 4px 20px rgba(168,85,247,.2)",transition:"transform .15s",minHeight:52}}>
            <div style={{fontSize:26,flexShrink:0}}>🧠</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"white",letterSpacing:1}}>BASEBALL BRAIN</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginTop:1}}>Explore the hidden math of baseball</div>
            </div>
            <div style={{fontSize:18,color:"rgba(255,255,255,.5)",flexShrink:0}}>→</div>
          </button>}

          {/* Phase 3.1: PLAY NEXT hero button — single clear primary action */}
          {stats.gp>0&&!atLimit&&(()=>{
            const recs=getPracticeRecommendations(stats);
            const rec=recs[0];
            const nextPos=rec?.position||stats.favoritePosition||"batter";
            const nextMeta=POS_META[nextPos]||POS_META.batter;
            const nextLabel=rec?.reason||"Keep playing!";
            return <button onClick={()=>startGame(nextPos)} style={{width:"100%",background:"linear-gradient(135deg,#1e40af,#3b82f6)",border:"2px solid rgba(59,130,246,.4)",borderRadius:16,padding:"16px 20px",cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",gap:14,textAlign:"left",boxShadow:"0 4px 20px rgba(59,130,246,.25)",transition:"transform .15s",minHeight:56}}>
              <div style={{fontSize:28,flexShrink:0}}>{nextMeta.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"white",letterSpacing:1}}>NEXT CHALLENGE</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:1}}>{nextMeta.label} · {nextLabel}</div>
              </div>
              <div style={{fontSize:20,color:"rgba(255,255,255,.6)",flexShrink:0}}>▶</div>
            </button>;
          })()}

          {/* Stats card */}
          {stats.gp>0&&<div style={{...card,marginBottom:12}}>
            {(stats.isPro||stats.gp>=5)&&(()=>{const iq=computeBaseballIQ(stats);const iqC=getIQColor(iq);const iqLabel=iq>=140?"Elite":iq>=120?"Advanced":iq>=100?"Solid":iq>=80?"Developing":"Rookie";const iqPct=Math.min(100,Math.round(((iq-50)/110)*100));const topPos=Object.entries(stats.ps||{}).filter(([,v])=>v.p>=3).sort((a,b)=>(b[1].c/b[1].p)-(a[1].c/a[1].p))[0];return(
              <div style={{textAlign:"center",marginBottom:10,padding:"14px 16px",background:"linear-gradient(135deg,rgba(0,0,0,.4),rgba(0,0,0,.25))",border:`1.5px solid ${iqC}30`,borderRadius:16,boxShadow:`0 4px 20px ${iqC}15`}}>
                <div style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:4}}>Baseball IQ</div>
                <div style={{fontSize:40,fontWeight:900,color:iqC,letterSpacing:2,textShadow:`0 0 20px ${iqC}40`}}>{iq}</div>
                <div style={{fontSize:10,color:iqC,fontWeight:700,marginBottom:8,letterSpacing:1}}>{iqLabel}</div>
                <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
                  <div style={{height:"100%",width:`${iqPct}%`,background:`linear-gradient(90deg,${iqC}60,${iqC})`,borderRadius:3,transition:"width .5s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:8,fontSize:10,color:"#9ca3af"}}>
                  <span>Level {getLvl(stats.pts).n}</span>
                  <span style={{color:"rgba(255,255,255,.12)"}}>·</span>
                  <span>{topPos?POS_META[topPos[0]]?.label||topPos[0]:"All Positions"}</span>
                  {(stats.season||1)>1&&<><span style={{color:"rgba(255,255,255,.12)"}}>·</span><span>Season {stats.season}</span></>}
                </div>
                <div style={{fontSize:8,color:"#9ca3af",marginTop:6,letterSpacing:1}}>⚾ Baseball Strategy Master</div>
              </div>
            )})()}
            <div style={{display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:8}}>
              {[{v:stats.pts,l:"Points",c:"#f59e0b"},{v:`${acc}%`,l:"Accuracy",c:"#22c55e"},{v:stats.bs,l:"Best Streak",c:"#f97316"},{v:stats.gp,l:"Played",c:"#3b82f6"}].map((s,i)=>(
                <div key={i}><div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>{s.l}</div></div>
              ))}
            </div>
            {nxt&&<div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#9ca3af",marginBottom:2}}>
                <span style={{color:lvl.c,fontWeight:700}}>{lvl.e} {lvl.n}</span><span>{nxt.min-stats.pts} to {nxt.n}</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.03)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${prog}%`,background:`linear-gradient(90deg,${lvl.c},${nxt.c})`,borderRadius:2,transition:"width .5s"}}/>
              </div>
            </div>}
            {stats.ds>0&&(()=>{const fl=getFlame(stats.ds);const nextMile=STREAK_MILESTONES.find(m=>m>stats.ds);return(
              <div style={{marginTop:8,background:`${fl.color}08`,border:`1px solid ${fl.color}15`,borderRadius:10,padding:"8px 10px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <span style={{fontSize:fl.size}}>{fl.icon}</span>
                  <span style={{fontSize:13,fontWeight:800,color:fl.color}}>{stats.ds}-day streak{fl.label?` · ${fl.label}`:""}</span>
                  <span style={{fontSize:fl.size}}>{fl.icon}</span>
                </div>
                {nextMile&&<div style={{marginTop:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#9ca3af",marginBottom:2}}>
                    <span>{stats.ds} days</span><span>{nextMile}-day milestone</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.03)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(stats.ds/nextMile)*100}%`,background:`linear-gradient(90deg,${fl.color},${getFlame(nextMile).color})`,borderRadius:2,transition:"width .5s"}}/>
                  </div>
                </div>}
                {stats.streakFreezes>0?<div style={{textAlign:"center",marginTop:6,padding:"6px 10px",background:"linear-gradient(135deg,rgba(56,189,248,.06),rgba(14,165,233,.04))",border:"1px solid rgba(56,189,248,.15)",borderRadius:10,display:"inline-flex",alignItems:"center",gap:6,justifyContent:"center",width:"100%"}}>
                  <div style={{display:"flex",gap:3}}>{Array.from({length:3}).map((_,i)=><span key={i} style={{fontSize:14,opacity:i<stats.streakFreezes?1:.2,filter:i<stats.streakFreezes?"none":"grayscale(1)"}}>{i<stats.streakFreezes?"🧊":"⬜"}</span>)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#38bdf8"}}>{stats.streakFreezes} Freeze{stats.streakFreezes>1?"s":""}</div>
                  <div style={{fontSize:8,color:"#9ca3af"}}>Miss a day? Auto-saves your streak</div>
                </div>:!stats.isPro&&stats.ds>=3?<div style={{textAlign:"center",marginTop:6,padding:"5px 10px",background:"rgba(245,158,11,.03)",border:"1px solid rgba(245,158,11,.1)",borderRadius:8}}>
                  <span style={{fontSize:10,color:"#92400e"}}>🧊 Streak freezes with All-Star Pass</span>
                </div>:null}
              </div>
            )})()}
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
              <button onClick={()=>setPanel(panel==='ach'?null:'ach')} style={{flex:"1 1 22%",background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.12)",borderRadius:10,padding:"8px 4px",color:"#f59e0b",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🏅 {(stats.achs||[]).length}/{ACHS.length}</button>
              {(stats.highlights||[]).length>0&&<button onClick={()=>setShowHighlights(v=>!v)} style={{flex:"1 1 22%",background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.12)",borderRadius:10,padding:"8px 4px",color:"#60a5fa",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🎬 {(stats.highlights||[]).length} Highlights</button>}
              <button onClick={()=>setPanel(panel==='concepts'?null:'concepts')} style={{flex:"1 1 22%",background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.12)",borderRadius:10,padding:"8px 4px",color:"#3b82f6",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🧠 {(stats.cl?.length||0)}</button>
              <button onClick={()=>setPanel(panel==='stats'?null:'stats')} style={{flex:"1 1 22%",background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.12)",borderRadius:10,padding:"8px 4px",color:"#22c55e",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>📊 Stats</button>
              <button onClick={()=>setPanel(panel==='progress'?null:'progress')} style={{flex:"1 1 22%",background:"rgba(168,85,247,.05)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"8px 4px",color:"#a855f7",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>📈 Map</button>
              <button onClick={()=>setPanel(panel==='cosmetics'?null:'cosmetics')} style={{flex:"1 1 22%",background:"rgba(236,72,153,.05)",border:"1px solid rgba(236,72,153,.12)",borderRadius:10,padding:"8px 4px",color:"#ec4899",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🎨 Theme</button>
              <button onClick={()=>setPanel(panel==='lb'?null:'lb')} style={{flex:"1 1 45%",background:"rgba(234,179,8,.05)",border:"1px solid rgba(234,179,8,.12)",borderRadius:10,padding:"6px 4px",color:"#eab308",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:34}}>🏆 Leaderboard</button>
              <button onClick={()=>setPanel(panel==='team'?null:'team')} style={{flex:"1 1 45%",background:"rgba(6,182,212,.05)",border:"1px solid rgba(6,182,212,.12)",borderRadius:10,padding:"6px 4px",color:"#06b6d4",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:34}}>{stats.teamCode?"👥 My Team":"👥 Join Team"}</button>
            </div>
          </div>}

          {/* Expandable panels */}
          {/* AF8: Highlight Reel — replay saved correct plays */}
          {showHighlights&&(stats.highlights||[]).length>0&&(()=>{
            const hl=stats.highlights||[];
            const h=hl[highlightIdx%hl.length];
            const m=POS_META[h.pos]||POS_META.batter;
            return <div style={{...card,marginBottom:12,textAlign:"center"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#60a5fa",letterSpacing:1}}>MY HIGHLIGHTS</span>
                <button onClick={()=>setShowHighlights(false)} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <div style={{fontSize:11,color:"#d1d5db",fontWeight:700,marginBottom:4}}>{m.emoji} {h.title||"Great Play"}</div>
              <div style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(59,130,246,.15)"}}>
                <Field key={`hl-${highlightIdx}`} runners={h.runners||[]} outcome="success" ak={highlightIdx} anim={h.anim} animVariant={h.variant} theme={FIELD_THEMES.find(th=>th.id===stats.fieldTheme)||FIELD_THEMES[0]} avatar={{j:stats.avatarJersey||0,c:stats.avatarCap||0,b:stats.avatarBat||0}} pos={h.pos} slow={true}/>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:6}}>
                <button onClick={()=>setHighlightIdx(i=>(i-1+hl.length)%hl.length)} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 12px",fontSize:10,color:"#9ca3af",cursor:"pointer"}}>← Prev</button>
                <span style={{fontSize:10,color:"#6b7280",padding:"4px 0"}}>{(highlightIdx%hl.length)+1} / {hl.length}</span>
                <button onClick={()=>setHighlightIdx(i=>(i+1)%hl.length)} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 12px",fontSize:10,color:"#9ca3af",cursor:"pointer"}}>Next →</button>
              </div>
            </div>;
          })()}

          {panel==='ach'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:1,marginBottom:6}}>ACHIEVEMENTS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {ACHS.map(a=>{const earned=(stats.achs||[]).includes(a.id);const[cur,tgt]=achProgress(a.id,stats);const pct=Math.min(100,Math.round((cur/tgt)*100));return(
                <div key={a.id} style={{background:earned?"rgba(245,158,11,.04)":"rgba(255,255,255,.01)",border:`1px solid ${earned?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)"}`,borderRadius:8,padding:"5px 7px",opacity:earned?1:.55}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12}}>{a.e}</span><span style={{fontSize:10,fontWeight:700,color:earned?"#f59e0b":"#6b7280"}}>{a.n}</span></div>
                  <div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>{a.d}</div>
                  {!earned&&<div style={{marginTop:3}}>
                    <div style={{height:3,background:"rgba(255,255,255,.04)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#f59e0b55,#f59e0b)",borderRadius:2,transition:"width .5s"}}/>
                    </div>
                    <div style={{fontSize:7,color:"#9ca3af",marginTop:1,textAlign:"right"}}>{cur}/{tgt}</div>
                  </div>}
                </div>
              )})}
            </div>
          </div>}

          {panel==='concepts'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#3b82f6",letterSpacing:1,marginBottom:6}}>CONCEPTS LEARNED</div>
            {!(stats.cl?.length)?<p style={{color:"#9ca3af",fontSize:11}}>Get the optimal answer to learn concepts!</p>:
              <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:250,overflowY:"auto"}}>
                {stats.cl.map((c,i)=><div key={i} style={{background:"rgba(59,130,246,.03)",border:"1px solid rgba(59,130,246,.08)",borderRadius:7,padding:"5px 8px",fontSize:11,color:"#93c5fd",lineHeight:1.35}}>💡 {c}</div>)}
              </div>}
          </div>}

          {panel==='stats'&&<div style={{...card,marginBottom:12}}>
            {(()=>{const iq=computeBaseballIQ(stats);const iqC=getIQColor(iq);const iqLabel=iq>=140?"Elite":iq>=120?"Advanced":iq>=100?"Solid":iq>=80?"Developing":"Rookie";const iqPct=Math.min(100,Math.round(((iq-50)/110)*100));return(
              <div style={{textAlign:"center",marginBottom:10,padding:"14px 16px",background:"linear-gradient(135deg,rgba(0,0,0,.4),rgba(0,0,0,.25))",border:`1.5px solid ${iqC}30`,borderRadius:16,boxShadow:`0 4px 20px ${iqC}15`}}>
                <div style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:4}}>Baseball IQ</div>
                <div style={{fontSize:40,fontWeight:900,color:iqC,letterSpacing:2,textShadow:`0 0 20px ${iqC}40`}}>{iq}</div>
                <div style={{fontSize:10,color:iqC,fontWeight:700,marginBottom:8,letterSpacing:1}}>{iqLabel}</div>
                <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${iqPct}%`,background:`linear-gradient(90deg,${iqC}60,${iqC})`,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:10,fontSize:10,color:"#9ca3af"}}>
                  <span>Level {getLvl(stats.pts).n}</span>
                  <span style={{color:"rgba(255,255,255,.12)"}}>·</span>
                  <span>{acc}% accuracy</span>
                  {(stats.season||1)>1&&<><span style={{color:"rgba(255,255,255,.12)"}}>·</span><span>Season {stats.season}</span></>}
                </div>
                <div style={{fontSize:8,color:"#9ca3af",marginTop:6,letterSpacing:1}}>⚾ Baseball Strategy Master</div>
              </div>
            )})()}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#22c55e",letterSpacing:1,marginBottom:6}}>POSITION STATS</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {ALL_POS.map(p=>{const s=stats.ps[p];const m=POS_META[p];const a=s&&s.p>0?Math.round((s.c/s.p)*100):null;return(
                <div key={p} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,.02)",borderRadius:8,padding:"6px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{m.emoji}</span><span style={{fontSize:12,fontWeight:600}}>{m.label}</span></div>
                  <div style={{display:"flex",gap:8,fontSize:11,color:"#9ca3af"}}>
                    {s?<><span>{s.p} played</span><span style={{color:a>=70?"#22c55e":a>=50?"#f59e0b":"#ef4444",fontWeight:700}}>{a}%</span></>:<span>Not played</span>}
                  </div>
                </div>
              )})}
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#a855f7",letterSpacing:1,marginTop:10,marginBottom:4}}>BONUS CATEGORIES</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {["famous","rules","counts"].map(p=>{const s=stats.ps[p];const m=POS_META[p];if(!m)return null;const a=s&&s.p>0?Math.round((s.c/s.p)*100):null;return(
                <div key={p} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(168,85,247,.03)",borderRadius:8,padding:"6px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{m.emoji}</span><span style={{fontSize:12,fontWeight:600}}>{m.label}</span></div>
                  <div style={{display:"flex",gap:8,fontSize:11,color:"#9ca3af"}}>
                    {s?<><span>{s.p} played</span><span style={{color:a>=70?"#22c55e":a>=50?"#f59e0b":"#ef4444",fontWeight:700}}>{a}%</span></>:<span>Not played</span>}
                  </div>
                </div>
              )})}
            </div>
            <button onClick={()=>{
              generatePlayerCard(stats,(blob,dataUrl)=>{
                if(navigator.share&&blob){navigator.share({files:[new File([blob],"bsm-card.png",{type:"image/png"})],title:"My Baseball Strategy Master Card"}).then(()=>{setToast({e:"📸",n:"Player Card Shared!",d:"Shared successfully"});setTimeout(()=>setToast(null),3000)}).catch(()=>{})}
                else if(dataUrl){const a=document.createElement("a");a.href=dataUrl;a.download="bsm-card.png";a.click();setToast({e:"📸",n:"Player Card Saved!",d:"Downloaded to your device"});setTimeout(()=>setToast(null),3000)}
              })
            }} style={{...btn("linear-gradient(135deg,#06b6d4,#0891b2)"),...{fontSize:11,padding:"6px 14px",width:"100%",marginTop:8}}}>📸 Share My Player Card</button>
          </div>}

          {panel==='progress'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#a855f7",letterSpacing:1,marginBottom:6}}>MASTERY HEATMAP</div>
            {/* Sprint 3.2: Domain-grouped concept heatmap with real mastery states */}
            {(()=>{
              const cm=(stats.masteryData?.concepts)||{}
              const stateColors={mastered:"#22c55e",learning:"#3b82f6",introduced:"#f59e0b",degraded:"#ef4444",unseen:"rgba(255,255,255,.06)"}
              const stateLabels={mastered:"Mastered",learning:"Learning",introduced:"Seen",degraded:"Needs Review",unseen:"Not Started"}
              const domains={}
              Object.entries(BRAIN.concepts).forEach(([tag,c])=>{
                const d=c.domain||"other"
                if(!domains[d])domains[d]={concepts:[],mastered:0,total:0}
                const state=cm[tag]?.state||"unseen"
                domains[d].concepts.push({tag,name:c.name,state,data:cm[tag]||null,diff:c.diff||1,ageMin:c.ageMin||6})
                domains[d].total++
                const _cd=cm[tag]||{}
                if(state==="mastered"||( state==="learning"&&_cd.totalAttempts>=3&&_cd.totalCorrect/_cd.totalAttempts>=0.8))domains[d].mastered++
              })
              const domainMeta={rules:{label:"Rules",emoji:"\u2696\ufe0f"},defense:{label:"Defense",emoji:"\ud83d\udee1\ufe0f"},baserunning:{label:"Baserunning",emoji:"\ud83c\udfc3"},batting:{label:"Batting",emoji:"\u26be"},pitching:{label:"Pitching",emoji:"\ud83e\udd4e"},management:{label:"Strategy",emoji:"\ud83e\udde0"},other:{label:"Other",emoji:"\ud83d\udcda"}}
              const totalMastered=Object.values(cm).filter(c=>c.state==="mastered").length
              const totalLearning=Object.values(cm).filter(c=>c.state==="learning"||c.state==="introduced"||c.state==="degraded").length
              const totalEngaged=totalMastered+totalLearning
              const totalConcepts=Object.keys(BRAIN.concepts).length
              return <>
                {/* Legend */}
                <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",justifyContent:"center"}}>
                  {Object.entries(stateColors).map(([s,color])=>(
                    <div key={s} style={{display:"flex",alignItems:"center",gap:3}}>
                      <div style={{width:10,height:10,borderRadius:2,background:color,border:`1px solid ${s==="unseen"?"rgba(255,255,255,.1)":color+"80"}`}}/>
                      <span style={{fontSize:8,color:"#9ca3af"}}>{stateLabels[s]}</span>
                    </div>
                  ))}
                </div>
                {/* Overall progress — show both engaged and mastered to encourage players */}
                <div style={{textAlign:"center",marginBottom:10}}>
                  <span style={{fontSize:22,fontWeight:800,color:"#a855f7"}}>{totalEngaged}</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>/{totalConcepts} concepts explored</span>
                  {totalMastered>0&&<span style={{fontSize:10,color:"#22c55e",marginLeft:6,fontWeight:700}}>{totalMastered} mastered!</span>}
                  <div style={{height:8,background:"rgba(255,255,255,.03)",borderRadius:4,overflow:"hidden",marginTop:4}}>
                    <div style={{height:"100%",width:`${Math.round(totalMastered/totalConcepts*100)}%`,background:"linear-gradient(90deg,#a855f788,#a855f7)",borderRadius:4,transition:"width .5s"}}/>
                  </div>
                </div>
                {/* Domain sections */}
                {Object.entries(domains).sort((a,b)=>b[1].total-a[1].total).map(([d,info])=>{
                  const dm=domainMeta[d]||domainMeta.other
                  const pct=info.total>0?Math.round(info.mastered/info.total*100):0
                  return <div key={d} style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,fontWeight:700}}>{dm.emoji} {dm.label}</span>
                      <span style={{fontSize:9,color:pct>=80?"#22c55e":pct>=40?"#f59e0b":"#6b7280",fontWeight:700}}>{info.mastered}/{info.total}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:4}}>
                      {info.concepts.sort((a,b)=>a.diff-b.diff).map(c=>{
                        const color=stateColors[c.state]
                        const acc=c.data?Math.round((c.data.totalCorrect||0)/Math.max(1,c.data.totalAttempts||1)*100):null
                        const streak=c.data?.correctStreak||0
                        return <div key={c.tag} title={`${c.name}\nState: ${stateLabels[c.state]}\n${acc!==null?`Accuracy: ${acc}%`:"Not attempted"}\nDifficulty: ${c.diff}\nAge: ${c.ageMin}+\nTap to practice`} onClick={()=>{
                          // Find the position that has scenarios for this concept
                          const targetPos=Object.entries(SCENARIOS).find(([p,arr])=>arr.some(s=>s.conceptTag===c.tag));
                          if(targetPos){conceptTargetRef.current=c.tag;setPanel(null);startGame(targetPos[0])}
                        }} style={{
                          background:c.state==="unseen"?"rgba(255,255,255,.015)":`${color}10`,
                          border:`1px solid ${c.state==="unseen"?"rgba(255,255,255,.04)":`${color}30`}`,
                          borderRadius:6,padding:"4px 6px",cursor:"pointer",position:"relative",overflow:"hidden",
                          transition:"transform .1s,box-shadow .1s"
                        }} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow=`0 0 8px ${color}30`}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none"}}>
                          <div style={{fontSize:9,fontWeight:700,color:c.state==="unseen"?"#9ca3af":color,lineHeight:1.2,marginBottom:2}}>{c.name}</div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <span style={{fontSize:7,color:"#9ca3af"}}>Diff {c.diff}</span>
                            {acc!==null&&<span style={{fontSize:7,color:acc>=70?"#22c55e":"#f59e0b",fontWeight:700}}>{acc}%</span>}
                            {streak>=3&&<span style={{fontSize:7}}>🔥{streak}</span>}
                          </div>
                          {/* Progress bar at bottom */}
                          {c.data&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:"rgba(255,255,255,.03)"}}>
                            <div style={{height:"100%",width:`${acc||0}%`,background:color,transition:"width .3s"}}/>
                          </div>}
                        </div>
                      })}
                    </div>
                  </div>
                })}
              </>
            })()}
          </div>}

          {panel==='lb'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#eab308",letterSpacing:1,marginBottom:2}}>LEADERBOARD</div>
            <div style={{fontSize:9,color:"#9ca3af",marginBottom:8}}>Week {lbData.week} · Resets weekly · Play on same device to compete</div>
            {!stats.displayName&&<div style={{background:"rgba(234,179,8,.06)",border:"1px solid rgba(234,179,8,.15)",borderRadius:10,padding:"8px 10px",marginBottom:8}}>
              <div style={{fontSize:11,color:"#eab308",marginBottom:4}}>Set a display name to appear on the leaderboard:</div>
              <input value={stats.displayName} onChange={e=>setStats(p=>({...p,displayName:e.target.value.slice(0,15)}))}
                placeholder="Enter your name..." style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"white",fontSize:12,outline:"none"}}/>
            </div>}
            {lbData.entries.length===0&&<div style={{textAlign:"center",padding:"12px 0",color:"#9ca3af",fontSize:11}}>No entries yet this week. Play to get on the board!</div>}
            {lbData.entries.map((e,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:e.name===stats.displayName?"rgba(234,179,8,.06)":"rgba(255,255,255,.01)",borderRadius:8,marginBottom:3,border:e.name===stats.displayName?"1px solid rgba(234,179,8,.15)":"1px solid transparent"}}>
                <span style={{fontSize:14,fontWeight:800,color:i===0?"#eab308":i===1?"#94a3b8":i===2?"#b45309":"#4b5563",width:22,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
                <span style={{flex:1,fontSize:12,fontWeight:e.name===stats.displayName?700:500,color:e.name===stats.displayName?"#eab308":"#d1d5db"}}>{e.name}</span>
                <span style={{fontSize:11,color:"#f59e0b",fontWeight:700}}>{e.pts} pts</span>
                <span style={{fontSize:10,color:"#9ca3af"}}>{e.acc}%</span>
              </div>
            ))}
          </div>}

          {panel==='team'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#06b6d4",letterSpacing:1,marginBottom:6}}>TEAM ZONE</div>
            {stats.teamCode?<div>
              <div style={{background:"rgba(6,182,212,.06)",border:"1px solid rgba(6,182,212,.15)",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontSize:11,color:"#06b6d4",fontWeight:600,marginBottom:2}}>Team: {stats.teamName||"My Team"}</div>
                <div style={{fontSize:10,color:"#9ca3af"}}>Code: <span style={{fontFamily:"monospace",color:"#22d3ee",fontWeight:700,letterSpacing:2}}>{stats.teamCode}</span></div>
                <div style={{fontSize:9,color:"#9ca3af",marginTop:4}}>Share this code with teammates so they can join!</div>
              </div>
              <button onClick={async()=>{
                try{
                  const ph=btoa((stats.displayName||"anon")+":"+stats.firstPlayDate).slice(0,32);
                  await fetch(AI_PROXY_URL+"/team/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:stats.teamCode,playerHash:ph,stats})});
                }catch{}
              }} style={{...btn("linear-gradient(135deg,#06b6d4,#0891b2)"),...{fontSize:11,padding:"6px 14px",width:"100%",marginBottom:6}}}>Sync My Stats to Team</button>
              <button onClick={()=>setStats(p=>({...p,teamCode:"",teamName:""}))} style={{...ghost,fontSize:10,width:"100%",color:"#9ca3af"}}>Leave Team</button>
            </div>:
            <div>
              <div style={{fontSize:11,color:"#9ca3af",marginBottom:8}}>Join your coach's team to track progress together, or create a team if you're a coach.</div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:10,color:"#06b6d4",fontWeight:600,marginBottom:4}}>JOIN A TEAM</div>
                <div style={{display:"flex",gap:6}}>
                  <input id="teamCodeInput" placeholder="Enter 6-letter code" maxLength={6} style={{flex:1,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"white",fontSize:12,outline:"none",textTransform:"uppercase",letterSpacing:2,fontFamily:"monospace"}}/>
                  <button onClick={async()=>{
                    const code=document.getElementById("teamCodeInput").value.trim();
                    if(code.length!==6)return;
                    const ph=btoa((stats.displayName||"anon")+":"+stats.firstPlayDate).slice(0,32);
                    try{
                      const r=await fetch(AI_PROXY_URL+"/team/join",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,playerHash:ph,displayName:stats.displayName})});
                      const d=await r.json();
                      if(d.ok){setStats(p=>({...p,teamCode:code.toUpperCase(),teamName:d.teamName}));snd.play("lvl")}
                    }catch{}
                  }} style={{...btn("linear-gradient(135deg,#06b6d4,#0891b2)"),...{fontSize:11,padding:"6px 14px"}}}>Join</button>
                </div>
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:8,marginTop:4}}>
                <div style={{fontSize:10,color:"#06b6d4",fontWeight:600,marginBottom:4}}>CREATE A TEAM (Coaches)</div>
                <input id="teamNameInput" placeholder="Team name" maxLength={40} style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"white",fontSize:12,outline:"none",marginBottom:4}}/>
                <input id="coachNameInput" placeholder="Your name" maxLength={30} style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"white",fontSize:12,outline:"none",marginBottom:4}}/>
                <input id="coachPinInput" placeholder="4-8 digit PIN (to view reports)" maxLength={8} type="password" style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"white",fontSize:12,outline:"none",marginBottom:6}}/>
                <button onClick={async()=>{
                  const tn=document.getElementById("teamNameInput").value.trim();
                  const cn=document.getElementById("coachNameInput").value.trim();
                  const cp=document.getElementById("coachPinInput").value.trim();
                  if(!tn||!cn||cp.length<4)return;
                  try{
                    const r=await fetch(AI_PROXY_URL+"/team/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({teamName:tn,coachName:cn,coachPin:cp})});
                    const d=await r.json();
                    if(d.ok){setStats(p=>({...p,teamCode:d.code,teamName:tn}));snd.play("lvl")}
                  }catch{}
                }} style={{...btn("linear-gradient(135deg,#06b6d4,#0891b2)"),...{fontSize:11,padding:"6px 14px",width:"100%"}}}>Create Team</button>
              </div>
            </div>}
          </div>}

          {panel==='cosmetics'&&<div style={{...card,marginBottom:12}}>
            {/* Avatar Customization */}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#ec4899",letterSpacing:1,marginBottom:6}}>YOUR PLAYER</div>
            {(()=>{const j=AVATAR_OPTS.jersey[stats.avatarJersey||0],cp=AVATAR_OPTS.cap[stats.avatarCap||0],bt=AVATAR_OPTS.bat[stats.avatarBat||0];return(
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
              <svg viewBox="0 0 60 70" style={{width:60,height:70}}>
                <ellipse cx="30" cy="62" rx="10" ry="3.5" fill="rgba(0,0,0,.2)"/>
                <rect x="22.5" y="57" width="6" height="4" rx="1.5" fill="#222"/>
                <rect x="31.5" y="57" width="6" height="4" rx="1.5" fill="#222"/>
                <rect x="23" y="49" width="6" height="10" rx="2" fill="#eee"/>
                <rect x="31" y="49" width="6" height="10" rx="2" fill="#e4e4e4"/>
                <rect x="21" y="34" width="18" height="17" rx="4" fill={j} stroke="rgba(255,255,255,.2)" strokeWidth=".8"/>
                <rect x="17" y="36" width="5" height="10" rx="2" fill={j}/>
                <rect x="38" y="36" width="5" height="10" rx="2" fill={j}/>
                <circle cx="30" cy="28" r="8" fill="#e8c4a0"/>
                <circle cx="27" cy="27" r="1.2" fill="#333"/>
                <circle cx="33" cy="27" r="1.2" fill="#333"/>
                <path d="M27.5,30.5 Q30,32.5 32.5,30.5" fill="none" stroke="#a0785a" strokeWidth=".8" strokeLinecap="round"/>
                <ellipse cy="23" cx="30" rx="9.5" ry="4" fill={cp}/>
                <line x1="38" y1="36" x2="50" y2="16" stroke={bt} strokeWidth="3" strokeLinecap="round"/>
                <line x1="49.5" y1="16.5" x2="52.5" y2="11" stroke={bt} strokeWidth="4.5" strokeLinecap="round" opacity=".8"/>
              </svg>
            </div>);})()}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>Jersey Color {!stats.isPro&&<span style={{color:"#9ca3af"}}>(2 free)</span>}</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {AVATAR_OPTS.jersey.map((c,i)=>{const locked=!stats.isPro&&i>=FREE_JERSEYS&&i!==(stats.avatarJersey||0);return<button key={i} onClick={()=>{if(locked){setPanel('upgrade');trackFunnel('avatar_gated',setStats)}else{setStats(p=>({...p,avatarJersey:i}));snd.play('tap')}}} style={{width:28,height:28,borderRadius:8,background:c,border:i===(stats.avatarJersey||0)?`3px solid white`:"2px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s",opacity:locked?.35:1,position:"relative"}}>{locked&&<span style={{position:"absolute",top:-4,right:-4,fontSize:8}}>🔒</span>}</button>})}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>Cap Color {!stats.isPro&&<span style={{color:"#9ca3af"}}>(2 free)</span>}</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {AVATAR_OPTS.cap.map((c,i)=>{const locked=!stats.isPro&&i>=FREE_CAPS&&i!==(stats.avatarCap||0);return<button key={i} onClick={()=>{if(locked){setPanel('upgrade');trackFunnel('avatar_gated',setStats)}else{setStats(p=>({...p,avatarCap:i}));snd.play('tap')}}} style={{width:28,height:28,borderRadius:8,background:c,border:i===(stats.avatarCap||0)?`3px solid white`:"2px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s",opacity:locked?.35:1,position:"relative"}}>{locked&&<span style={{position:"absolute",top:-4,right:-4,fontSize:8}}>🔒</span>}</button>})}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>Bat Style {!stats.isPro&&<span style={{color:"#9ca3af"}}>(1 free)</span>}</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {AVATAR_OPTS.bat.map((c,i)=>{const locked=!stats.isPro&&i>=FREE_BATS&&i!==(stats.avatarBat||0);return<button key={i} onClick={()=>{if(locked){setPanel('upgrade');trackFunnel('avatar_gated',setStats)}else{setStats(p=>({...p,avatarBat:i}));snd.play('tap')}}} style={{width:28,height:28,borderRadius:8,background:c,border:i===(stats.avatarBat||0)?`3px solid white`:"2px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s",opacity:locked?.35:1,position:"relative"}}>{locked&&<span style={{position:"absolute",top:-4,right:-4,fontSize:8}}>🔒</span>}</button>})}
              </div>
            </div>

            {/* Stadium Builder */}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:1,marginBottom:6,marginTop:4}}>STADIUM BUILDER</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
              {STADIUM_MILESTONES.map((m,i)=>{const hit=stats.gp>=m.games;return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:hit?"rgba(245,158,11,.06)":"rgba(255,255,255,.02)",border:`1px solid ${hit?"rgba(245,158,11,.15)":"rgba(255,255,255,.04)"}`,borderRadius:8,padding:"8px 10px"}}>
                  <span style={{fontSize:18,opacity:hit?1:.3}}>{m.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:hit?"#f59e0b":"#6b7280"}}>{m.label}</div>
                    <div style={{fontSize:9,color:hit?"#9ca3af":"#4b5563"}}>{hit?m.desc:`Play ${m.games} games (${stats.gp}/${m.games})`}</div>
                  </div>
                  {hit&&<span style={{fontSize:10,color:"#22c55e",fontWeight:700}}>✓</span>}
                </div>
              )})}
            </div>

            {/* Prestige System */}
            {stats.pts>=700&&<div style={{marginBottom:12}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#a855f7",letterSpacing:1,marginBottom:6}}>PRESTIGE</div>
              <div style={{background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.15)",borderRadius:10,padding:10,textAlign:"center"}}>
                <div style={{fontSize:10,color:"#9ca3af",marginBottom:4}}>Season {stats.season||1} · +{((stats.season||1)-1)*10}% XP bonus</div>
                <button onClick={()=>{setStats(p=>({...p,pts:0,str:0,bs:0,sp:0,season:(p.season||1)+1,seasonGame:0,seasonCorrect:0,seasonComplete:false}));snd.play('lvl');setPanel(null)}} style={{...btn("linear-gradient(135deg,#7c3aed,#a855f7)"),...{maxWidth:220,margin:"0 auto",fontSize:12}}}>Start Season {(stats.season||1)+1}</button>
                <div style={{fontSize:9,color:"#9ca3af",marginTop:4}}>Resets XP but keeps achievements, concepts & stats</div>
              </div>
            </div>}

            {/* Field Themes */}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#ec4899",letterSpacing:1,marginBottom:6}}>FIELD THEMES {!stats.isPro&&<span style={{fontSize:9,color:"#9ca3af",fontWeight:400}}>(3 free · unlock all 10 with All-Star Pass!)</span>}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {FIELD_THEMES.map(th=>{const unlocked=themeOk(th,stats);const active=stats.fieldTheme===th.id;return(
                <button key={th.id} onClick={()=>{if(unlocked){setStats(p=>({...p,fieldTheme:th.id}));snd.play('tap')}else{setPanel('upgrade');trackFunnel('theme_gated',setStats)}}}
                  style={{background:active?"rgba(236,72,153,.08)":unlocked?"rgba(255,255,255,.02)":"rgba(255,255,255,.01)",border:`1.5px solid ${active?"#ec4899":unlocked?"rgba(255,255,255,.08)":"rgba(255,255,255,.03)"}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",textAlign:"center",opacity:unlocked?1:.45,transition:"all .2s",position:"relative"}}>
                  <div style={{fontSize:22,marginBottom:2}}>{th.emoji}</div>
                  <div style={{fontSize:11,fontWeight:700,color:active?"#ec4899":"white"}}>{th.name}</div>
                  <div style={{fontSize:9,color:"#9ca3af",marginTop:1}}>{th.desc}</div>
                  {!unlocked&&<div style={{fontSize:8,color:"#f59e0b",marginTop:3,fontWeight:600}}>🔒 All-Star Pass</div>}
                  {active&&<div style={{fontSize:8,color:"#ec4899",marginTop:2,fontWeight:700}}>ACTIVE</div>}
                </button>
              )})}
            </div>
            <div style={{textAlign:"center",marginTop:8,fontSize:9,color:"#9ca3af"}}>{stats.isPro?"All themes unlocked!":"3 free themes. Earn more through milestones or go Pro!"}</div>

            {/* 70B Model Toggle — Pro Lab */}
            {stats.isPro&&<div style={{marginTop:12}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#3b82f6",letterSpacing:1,marginBottom:6}}>ALL-STAR LAB</div>
              <div style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.12)",borderRadius:10,padding:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"white"}}>BSM 70B Model</div>
                    <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>Fine-tuned baseball brain — deeper analysis & better scenarios</div>
                  </div>
                  <button onClick={()=>{setStats(p=>({...p,useLLM70B:!p.useLLM70B}));snd.play('tap')}} style={{width:44,height:24,borderRadius:12,background:stats.useLLM70B?"#3b82f6":"rgba(255,255,255,.1)",border:"none",cursor:"pointer",position:"relative",transition:"background .2s"}}>
                    <div style={{width:18,height:18,borderRadius:9,background:"white",position:"absolute",top:3,left:stats.useLLM70B?23:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
                  </button>
                </div>
                {stats.useLLM70B&&<div style={{fontSize:9,color:"#3b82f6",marginTop:6,fontWeight:600}}>Active — using fine-tuned model for generation + enrichment</div>}
              </div>
            </div>}
          </div>}

          {/* Speed Round Position Picker */}
          {Array.isArray(speedFilter)&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .3s ease-out"}} onClick={()=>setSpeedFilter(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",border:"1px solid rgba(239,68,68,.2)",borderRadius:16,padding:"20px 16px",width:"90%",maxWidth:360,maxHeight:"80vh",overflow:"auto"}}>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:28,marginBottom:4}}>⚡</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#ef4444",letterSpacing:1}}>SPEED ROUND</div>
                <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>Pick positions to practice, or go random!</div>
              </div>
              <button onClick={()=>startSpeedRound(null)} style={{width:"100%",background:"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",borderRadius:10,padding:"10px 16px",color:"white",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:10,letterSpacing:.5}}>🎲 ALL POSITIONS (Random)</button>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                {(stats.ageGroup==="6-8"?ALL_POS.filter(p=>!["manager","famous","rules","counts"].includes(p)):stats.ageGroup==="9-10"?ALL_POS.filter(p=>!["manager","rules","counts"].includes(p)):ALL_POS).map(p=>{const m=POS_META[p];const sel=speedFilter.includes(p);return(
                  <div key={p} onClick={()=>setSpeedFilter(sf=>sel?sf.filter(x=>x!==p):[...sf,p])} style={{background:sel?`${m.color}15`:"rgba(255,255,255,.02)",border:`1px solid ${sel?m.color+"40":"rgba(255,255,255,.06)"}`,borderRadius:8,padding:"8px 4px",textAlign:"center",cursor:"pointer",transition:"all .15s"}}>
                    <div style={{fontSize:18}}>{m.emoji}</div>
                    <div style={{fontSize:8,fontWeight:700,color:sel?m.color:"#9ca3af",marginTop:2}}>{m.label}</div>
                  </div>
                )})}
              </div>
              {speedFilter.length>0&&<button onClick={()=>startSpeedRound(speedFilter)} style={{width:"100%",background:"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",borderRadius:10,padding:"10px 16px",color:"white",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:.5}}>⚡ GO! ({speedFilter.length} position{speedFilter.length>1?"s":""})</button>}
              <button onClick={()=>setSpeedFilter(null)} style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"8px",color:"#9ca3af",fontSize:11,cursor:"pointer",marginTop:6}}>Cancel</button>
            </div>
          </div>}

          {panel==='limit'&&<div style={{...card,marginBottom:12,textAlign:"center",borderColor:"rgba(34,197,94,.2)"}}>
            <div style={{fontSize:36,marginBottom:4}}>&#127881;</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#22c55e",letterSpacing:1}}>GREAT SESSION TODAY!</div>
            <p style={{fontSize:12,color:"#d1d5db",marginTop:6,marginBottom:10}}>
              You played {DAILY_FREE} scenarios and learned {(stats.cl||[]).length} concept{(stats.cl||[]).length!==1?"s":""}!
            </p>
            <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12}}>
              <div style={{background:"rgba(34,197,94,.08)",borderRadius:10,padding:"8px 14px"}}>
                <div style={{fontSize:18,fontWeight:700,color:"#22c55e"}}>{acc}%</div>
                <div style={{fontSize:9,color:"#9ca3af"}}>Accuracy</div>
              </div>
              <div style={{background:"rgba(139,92,246,.08)",borderRadius:10,padding:"8px 14px"}}>
                <div style={{fontSize:18,fontWeight:700,color:"#8b5cf6"}}>{stats.str||0}</div>
                <div style={{fontSize:9,color:"#9ca3af"}}>Streak</div>
              </div>
              <div style={{background:"rgba(245,158,11,.08)",borderRadius:10,padding:"8px 14px"}}>
                <div style={{fontSize:18,fontWeight:700,color:"#f59e0b"}}>{lvl.emoji} {lvl.n}</div>
                <div style={{fontSize:9,color:"#9ca3af"}}>Level</div>
              </div>
            </div>
            <div style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:10,padding:10,marginBottom:12}}>
              <div style={{fontSize:12,color:"#60a5fa",fontWeight:600}}>See you tomorrow!</div>
              <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>Your Daily Diamond Play is always free — come back for a fresh challenge!</div>
            </div>
            <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:10}}>
              <div style={{fontSize:11,color:"#d1d5db",fontWeight:600,marginBottom:6}}>Want unlimited practice?</div>
              <button onClick={()=>{setPanel('upgrade');trackFunnel('limit_to_upgrade',setStats)}} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{maxWidth:280,margin:"0 auto",fontSize:13,boxShadow:"0 4px 15px rgba(245,158,11,.3)",marginBottom:8}}}>Ask a Parent About All-Star Pass</button>
              <button onClick={()=>{
                const msg=`Hi! ${stats.displayName||"Your child"} has been learning baseball strategy and loves it! They've played ${stats.gp} scenarios, learned ${(stats.cl||[]).length} concepts, and have ${acc}% accuracy.\n\nThe free version has ${DAILY_FREE} plays/day. The All-Star Pass ($4.99/mo or $29.99/yr) gives unlimited play, AI coaching, and 2x XP.\n\nCheck it out: ${window.location.href}`;
                if(navigator.clipboard)navigator.clipboard.writeText(msg).then(()=>{setToast({e:"📋",n:"Message Copied!",d:"Share it with a parent to ask about upgrading"});setTimeout(()=>setToast(null),3500)});
                trackFunnel('tell_parent_clicked',setStats);
              }} style={{...btn("rgba(255,255,255,.06)"),...{maxWidth:280,margin:"0 auto",fontSize:12,color:"#9ca3af"}}}>📋 Tell a Parent (copy message)</button>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:6}}>$4.99/mo or $29.99/year — unlimited play, AI coaching, and more</div>
            </div>
          </div>}

          {/* Upgrade Panel — All-Star Pass */}
          {panel==='upgrade'&&<div style={{...card,marginBottom:12,textAlign:"center",borderColor:"rgba(245,158,11,.25)",background:"linear-gradient(135deg,rgba(245,158,11,.04),rgba(234,179,8,.02))"}}>
            {!upgradeGatePass?<div>
              <div style={{fontSize:36,marginBottom:4}}>⭐</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f59e0b",letterSpacing:1,marginBottom:4}}>ALL-STAR PASS</div>
              <p style={{fontSize:12,color:"#9ca3af",marginBottom:12}}>A parent needs to verify. Solve the problem below:</p>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#d1d5db",marginBottom:8}}>What is {upgradeGateA} x {upgradeGateB}?</div>
                <input id="upgrade-gate" type="number" placeholder="Answer" style={{width:120,background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 12px",color:"white",fontSize:16,textAlign:"center",outline:"none",marginBottom:8}}
                  onKeyDown={e=>{if(e.key==="Enter"){if(parseInt(e.target.value)===upgradeGateA*upgradeGateB){setUpgradeGatePass(true);sessionStorage.setItem('bsm_upgradeGate','true');trackFunnel('upgrade_gate_passed',setStats)}else{e.target.value="";e.target.placeholder="Try again"}}}}/>
                <div><button onClick={()=>{const inp=document.getElementById("upgrade-gate");if(inp&&parseInt(inp.value)===upgradeGateA*upgradeGateB){setUpgradeGatePass(true);sessionStorage.setItem('bsm_upgradeGate','true');trackFunnel('upgrade_gate_passed',setStats)}else if(inp){inp.value="";inp.placeholder="Try again"}}} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{maxWidth:200,margin:"0 auto",fontSize:13}}}>Verify</button></div>
              </div>
            </div>:<div>
              <div style={{fontSize:36,marginBottom:4}}>⭐</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f59e0b",letterSpacing:1,marginBottom:4}}>ALL-STAR PASS</div>
              <p style={{fontSize:12,color:"#d1d5db",marginBottom:12}}>Unlock the full experience for {stats.displayName||"your player"}!</p>
              <div style={{display:"flex",gap:8,marginBottom:12,justifyContent:"center",flexWrap:"wrap"}}>
                <div style={{flex:"1 1 140px",maxWidth:180,background:"rgba(255,255,255,.03)",border:"1.5px solid rgba(245,158,11,.2)",borderRadius:14,padding:"16px 12px",cursor:"pointer"}} onClick={()=>{trackFunnel('stripe_link_clicked',setStats);window.open(STRIPE_MONTHLY_URL,"_blank")}}>
                  <div style={{fontSize:24,fontWeight:800,color:"#f59e0b"}}>$4.99</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginBottom:8}}>/month</div>
                  <div style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{fontSize:12,padding:"10px"}}}>Subscribe Monthly</div>
                </div>
                <div style={{flex:"1 1 140px",maxWidth:180,background:"rgba(245,158,11,.04)",border:"2px solid #f59e0b",borderRadius:14,padding:"16px 12px",cursor:"pointer",position:"relative"}} onClick={()=>{trackFunnel('stripe_link_clicked',setStats);window.open(STRIPE_YEARLY_URL,"_blank")}}>
                  <div style={{position:"absolute",top:-8,right:8,background:"#22c55e",color:"white",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:6}}>SAVE 50%</div>
                  <div style={{fontSize:24,fontWeight:800,color:"#f59e0b"}}>$29.99</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginBottom:8}}>/year</div>
                  <div style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{fontSize:12,padding:"10px"}}}>Subscribe Yearly</div>
                </div>
              </div>
              <div style={{textAlign:"left",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                {[["Unlimited plays every day","No daily limit"],["AI Coach personalized challenges","Targets your weak spots"],["All 10 field themes","Classic, Night, Dome, and more"],["Full avatar customization","6 jerseys, 6 caps, 3 bats"],["Streak freezes (1/week)","Never lose your streak"],["2x XP on every play","Level up twice as fast"],["All-Star badge","Show off your commitment"]].map(([t,d],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
                    <span style={{color:"#22c55e",fontSize:12,flexShrink:0}}>✓</span>
                    <span style={{fontSize:12,color:"#d1d5db",fontWeight:600}}>{t}</span>
                    <span style={{fontSize:10,color:"#9ca3af",marginLeft:"auto"}}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{fontSize:9,color:"#9ca3af",marginBottom:8}}>After subscribing, return to this page. Your pass activates automatically.</div>
              <PromoCodeInput setStats={setStats} setToast={setToast} snd={snd} setPanel={setPanel} email={(authUser?.email||"").toLowerCase()} />
            </div>}
            <button onClick={()=>setPanel(null)} style={{...ghost,fontSize:11,marginTop:4}}>← Back</button>
          </div>}

          {/* Account CTA for logged-out users with progress */}
          {!authUser&&stats.gp>=3&&stats.gp%10===3&&<div style={{background:"rgba(59,130,246,.04)",border:"1px solid rgba(59,130,246,.12)",borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18,flexShrink:0}}>☁</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:"#93c5fd"}}>Save your progress</div>
              <div style={{fontSize:10,color:"#9ca3af"}}>Create a free account to keep your {stats.gp} games and {(stats.cl||[]).length} concepts safe across devices.</div>
            </div>
            <button onClick={()=>setScreen("signup")} style={{background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.2)",borderRadius:8,padding:"6px 12px",color:"#3b82f6",fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>Sign Up</button>
          </div>}

          {/* Pro home indicator */}
          {stats.isPro&&<div style={{textAlign:"center",marginBottom:8,padding:"4px 0"}}>
            <span style={{fontSize:10,color:"#f59e0b",fontWeight:600,letterSpacing:.5}}>{(stats.proPlan||"").startsWith("promo-")?"PROMO":"ALL-STAR"} · 2x XP · AI Ready · Unlimited Plays{stats.proPlan==="promo-30day"&&stats.proExpiry?` · ${Math.max(0,Math.ceil((stats.proExpiry-Date.now())/86400000))} days left`:""}</span>
          </div>}

          {/* Daily Diamond Play */}
          {(()=>{const today=new Date().toDateString();const done=stats.dailyDone&&stats.dailyDate===today;const daily=getDailyScenario();const dm=POS_META[daily._pos];return(
            <div style={{marginBottom:12,background:done?"rgba(34,197,94,.04)":"linear-gradient(135deg,rgba(245,158,11,.08),rgba(234,179,8,.04))",border:`1.5px solid ${done?"rgba(34,197,94,.2)":"rgba(245,158,11,.25)"}`,borderRadius:14,padding:14,position:"relative",overflow:"hidden"}}
              onClick={done?undefined:startDaily}>
              <div style={{position:"absolute",top:0,right:0,width:120,height:120,background:"radial-gradient(circle at 80% 20%,rgba(245,158,11,.12),transparent 70%)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
                <div style={{width:48,height:48,borderRadius:12,background:done?"rgba(34,197,94,.1)":"linear-gradient(135deg,#d97706,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                  {done?"✅":"💎"}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1,color:done?"#22c55e":"#f59e0b"}}>DAILY DIAMOND PLAY</span>
                    {!done&&<span style={{background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.25)",borderRadius:6,padding:"1px 6px",fontSize:9,fontWeight:800,color:"#f59e0b"}}>2x XP</span>}
                  </div>
                  <div style={{fontSize:11,color:done?"#9ca3af":"#d1d5db",lineHeight:1.3}}>
                    {done?"Completed! Come back tomorrow for a new challenge."
                      :<>{dm.emoji} {daily.title} · <span style={{color:DIFF_TAG[(daily.diff||1)-1].c}}>{"⭐".repeat(daily.diff||1)}</span></>}
                  </div>
                </div>
                {!done&&<div style={{color:"#f59e0b",fontSize:20,flexShrink:0,cursor:"pointer"}}>▶</div>}
              </div>
            </div>
          );})()}

          {/* Phase 4.1: Daily Mission — rotating objectives */}
          {stats.gp>=2&&(()=>{
            const dayOfYear=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/86400000);
            const missions=[
              {id:"streak3",emoji:"🔥",title:"Win 3 in a Row",desc:"Get 3 correct answers in a row",check:()=>stats.str>=3},
              {id:"newpos",emoji:"🆕",title:"Try a New Position",desc:"Play a position you haven't tried yet",check:()=>{const played=Object.keys(stats.ps||{}).filter(k=>(stats.ps[k]?.p||0)>0);return played.length>(stats._lastPosCount||0)}},
              {id:"concept",emoji:"🧠",title:"Learn Something New",desc:"Discover a concept you haven't seen before",check:()=>(stats.cl||[]).length>(stats._lastConceptCount||0)},
              {id:"five",emoji:"⭐",title:"Play 5 Challenges",desc:"Complete 5 challenges today",check:()=>stats.todayPlayed>=5},
              {id:"perfect3",emoji:"🎯",title:"3 Perfect Answers",desc:"Get 3 optimal answers today",check:()=>{const today=new Date().toDateString();return stats.todayDate===today&&(stats._todayOptimal||0)>=3}},
              {id:"speed",emoji:"⚡",title:"Try Speed Round",desc:"Complete a Speed Round",check:()=>stats._speedToday},
            ];
            const mission=missions[dayOfYear%missions.length];
            const done=mission.check();
            return <div style={{marginBottom:10,background:done?"rgba(34,197,94,.04)":"rgba(255,255,255,.02)",border:`1px solid ${done?"rgba(34,197,94,.15)":"rgba(255,255,255,.06)"}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:22,flexShrink:0}}>{done?"✅":mission.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:done?"#22c55e":"#d1d5db"}}>{done?"Mission Complete!":"Today's Mission"}</div>
                <div style={{fontSize:10,color:done?"#6b7280":"#9ca3af",marginTop:1}}>{done?mission.title:mission.desc}</div>
              </div>
              {done&&<div style={{fontSize:9,color:"#22c55e",fontWeight:700}}>+10 XP</div>}
            </div>;
          })()}

          {/* Sprint D4: Scenario of the Week */}
          {(stats.isPro||stats.gp>=5)&&(()=>{const weekly=getWeeklyScenario();const wm=POS_META[weekly._pos];const now=new Date();const weekKey=`${now.getFullYear()}-W${Math.ceil(((now-new Date(now.getFullYear(),0,1))/86400000+new Date(now.getFullYear(),0,1).getDay()+1)/7)}`;const done=(stats.weeklyDone===weekKey);return(
            <div style={{marginBottom:12,background:done?"rgba(59,130,246,.04)":"linear-gradient(135deg,rgba(59,130,246,.08),rgba(37,99,235,.04))",border:`1.5px solid ${done?"rgba(59,130,246,.15)":"rgba(59,130,246,.25)"}`,borderRadius:14,padding:14,position:"relative",overflow:"hidden"}}
              onClick={done?undefined:()=>{setPos(weekly._pos);setSc(weekly);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);setScreen("play");weekly.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)})}}>
              <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
                <div style={{width:48,height:48,borderRadius:12,background:done?"rgba(59,130,246,.1)":"linear-gradient(135deg,#2563eb,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                  {done?"✅":"🏆"}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1,color:done?"#3b82f6":"#60a5fa"}}>CHALLENGE OF THE WEEK</span>
                  </div>
                  <div style={{fontSize:11,color:done?"#9ca3af":"#d1d5db",lineHeight:1.3}}>
                    {done?"Completed this week! New challenge next Monday."
                      :<>{wm.emoji} {weekly.title} · <span style={{color:DIFF_TAG[(weekly.diff||1)-1].c}}>{"⭐".repeat(weekly.diff||1)}</span></>}
                  </div>
                </div>
                {!done&&<div style={{color:"#60a5fa",fontSize:20,flexShrink:0,cursor:"pointer"}}>▶</div>}
              </div>
            </div>
          );})()}

          {/* Daily Situation */}
          {(()=>{const today=new Date().toDateString();const done=stats.dailySitDone&&stats.dailySitDate===today;const dailySit=getDailySituation();const sitGrade=stats.sitMastery?.[dailySit.id]?.bestGrade;const streak=stats.dailySitStreak||0;return(
            <div style={{marginBottom:12,background:done?"rgba(6,182,212,.04)":"linear-gradient(135deg,rgba(6,182,212,.08),rgba(8,145,178,.04))",border:`1.5px solid ${done?"rgba(6,182,212,.15)":"rgba(6,182,212,.25)"}`,borderRadius:14,padding:14,position:"relative",overflow:"hidden"}}
              onClick={done?undefined:()=>startSituation(dailySit)}>
              <div style={{position:"absolute",top:0,right:0,width:120,height:120,background:"radial-gradient(circle at 80% 20%,rgba(6,182,212,.12),transparent 70%)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
                <div style={{width:48,height:48,borderRadius:12,background:done?"rgba(6,182,212,.1)":"linear-gradient(135deg,#0891b2,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                  {done?"✅":"📅"}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1,color:done?"#06b6d4":"#22d3ee"}}>DAILY SITUATION</span>
                    {streak>=3&&<span style={{background:"rgba(6,182,212,.15)",border:"1px solid rgba(6,182,212,.25)",borderRadius:6,padding:"1px 6px",fontSize:9,fontWeight:800,color:"#22d3ee"}}>🔥 {streak}-day streak!</span>}
                  </div>
                  <div style={{fontSize:11,color:done?"#9ca3af":"#d1d5db",lineHeight:1.3}}>
                    {done?<>Completed!{sitGrade&&` Grade: ${sitGrade}`} Come back tomorrow!</>
                      :<>{dailySit.emoji} {dailySit.title} · ⭐⭐ Varsity</>}
                  </div>
                </div>
                {!done&&<div style={{color:"#06b6d4",fontSize:20,flexShrink:0,cursor:"pointer"}}>▶</div>}
              </div>
            </div>
          );})()}

          {/* Season Mode */}
          {(()=>{const stage=getSeasonStage(stats.seasonGame);const pct=Math.round((stats.seasonGame/SEASON_TOTAL)*100);return(
            <div onClick={stats.seasonComplete?()=>setStats(p=>({...p,seasonGame:0,seasonCorrect:0,seasonComplete:false})):startSeason} style={{background:"linear-gradient(135deg,rgba(245,158,11,.06),rgba(234,179,8,.03))",border:"1px solid rgba(245,158,11,.15)",borderRadius:14,padding:"12px 14px",cursor:"pointer",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:22}}>{stats.seasonComplete?"🏆":stage.emoji}</span>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:1}}>{stats.seasonComplete?"SEASON COMPLETE!":stage.name.toUpperCase()}</div>
                    <div style={{fontSize:10,color:"#9ca3af"}}>{stats.seasonComplete?`${stats.seasonCorrect}/${SEASON_TOTAL} optimal · New season?`:`Challenge ${stats.seasonGame+1} of ${SEASON_TOTAL}`}</div>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:stage.color}}>{pct}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.03)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,#22c55e,${stage.color})`,borderRadius:2,transition:"width .5s"}}/>
              </div>
              <div style={{display:"flex",gap:2,marginTop:6,overflow:"hidden"}}>
                {SEASON_STAGES.map((st,i)=>{let before=0;for(let j=0;j<i;j++)before+=SEASON_STAGES[j].games*3;const active=stats.seasonGame>=before;const current=stats.seasonGame>=before&&(i===SEASON_STAGES.length-1||stats.seasonGame<before+st.games*3);return(
                  <div key={i} style={{flex:st.games,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:"100%",height:4,borderRadius:2,background:active?st.color:"rgba(255,255,255,.04)",transition:"all .3s",boxShadow:current?`0 0 6px ${st.color}60`:"none"}}/>
                    <span style={{fontSize:current?11:9,opacity:active?1:.4,transition:"all .3s",lineHeight:1}} title={st.name}>{st.emoji}</span>
                  </div>
                )})}
              </div>
            </div>
          );})()}

          {/* Game Modes — always visible for All-Star users, gp>=3 for free */}
          {(stats.isPro||stats.gp>=3)&&<div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <div onClick={()=>setSpeedFilter([])} style={{flex:"1 1 45%",background:"linear-gradient(135deg,rgba(239,68,68,.08),rgba(220,38,38,.04))",border:"1px solid rgba(239,68,68,.2)",borderRadius:14,padding:"16px 12px",textAlign:"center",cursor:"pointer",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>⚡</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#ef4444",letterSpacing:1}}>SPEED ROUND</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>5 challenges · {speedTimerMax}s timer</div>
            </div>
            <div onClick={startSurvival} style={{flex:"1 1 45%",background:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(124,58,237,.04))",border:"1px solid rgba(168,85,247,.2)",borderRadius:14,padding:"16px 12px",textAlign:"center",cursor:"pointer",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>💀</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#a855f7",letterSpacing:1}}>SURVIVAL</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>Until you miss{stats.survivalBest>0?` · Best: ${stats.survivalBest}`:""}</div>
              <div style={{fontSize:8,color:"#9ca3af",marginTop:2}}>1-3 Rookie · 4-6 Varsity · 7+ All-Star</div>
            </div>
            <div onClick={startChallengePack} style={{flex:"1 1 100%",background:"linear-gradient(135deg,rgba(59,130,246,.08),rgba(37,99,235,.04))",border:"1px solid rgba(59,130,246,.2)",borderRadius:14,padding:"14px 12px",textAlign:"center",cursor:"pointer",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>⚔️</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#3b82f6",letterSpacing:1}}>CHALLENGE A FRIEND</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>Play 5 challenges · Share link · Compare scores</div>
            </div>
            {(()=>{const rank=getSitRank(stats.sitMastery);return(
            <div onClick={()=>{setScreen("sitPicker")}} style={{flex:"1 1 100%",background:"linear-gradient(135deg,rgba(16,185,129,.08),rgba(5,150,105,.04))",border:"1px solid rgba(16,185,129,.2)",borderRadius:14,padding:"14px 12px",textAlign:"center",cursor:"pointer",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>🏟️</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#10b981",letterSpacing:1}}>SITUATION ROOM</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>{rank.emoji} {rank.title}</div>
            </div>)})()}
            <div onClick={startRealGame} style={{flex:"1 1 100%",background:stats.isPro?"linear-gradient(135deg,rgba(245,158,11,.1),rgba(234,179,8,.04))":"linear-gradient(135deg,rgba(107,114,128,.06),rgba(75,85,99,.03))",border:`1px solid ${stats.isPro?"rgba(245,158,11,.25)":"rgba(107,114,128,.15)"}`,borderRadius:14,padding:"14px 12px",textAlign:"center",cursor:"pointer",minHeight:48,position:"relative"}}>
              <div style={{fontSize:22,marginBottom:3}}>⚾</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:stats.isPro?"#f59e0b":"#6b7280",letterSpacing:1}}>REAL GAME</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>9 innings · Score tracking · AI-powered</div>
              {!stats.isPro&&<div style={{position:"absolute",top:6,right:8,fontSize:8,background:"rgba(245,158,11,.15)",color:"#f59e0b",padding:"1px 6px",borderRadius:8,fontWeight:700}}>ALL-STAR</div>}
            </div>
          </div>}

          {/* Special Modes — Famous Plays, Rule IQ, Count IQ */}
          {(stats.isPro||stats.gp>=5)&&<div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {[{key:"famous",emoji:"🏟️",label:"FAMOUS",color:"#eab308",bg:"linear-gradient(135deg,rgba(234,179,8,.06),rgba(202,138,4,.03))",border:"rgba(234,179,8,.2)",unit:"plays"},
              {key:"rules",emoji:"📖",label:"RULES",color:"#f472b6",bg:"linear-gradient(135deg,rgba(244,114,182,.06),rgba(219,39,119,.03))",border:"rgba(244,114,182,.2)",unit:"rules"},
              {key:"counts",emoji:"🔢",label:"COUNTS",color:"#14b8a6",bg:"linear-gradient(135deg,rgba(20,184,166,.06),rgba(13,148,136,.03))",border:"rgba(20,184,166,.2)",unit:"counts"}
            ].map(sm=>{const ps=stats.ps[sm.key];const a=ps&&ps.p>0?Math.round((ps.c/ps.p)*100):null;return(
              <div key={sm.key} role="button" aria-label={`Play ${sm.label}`} tabIndex={0} onClick={()=>startGame(sm.key)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();startGame(sm.key)}}} style={{flex:"1 1 30%",minWidth:90,background:sm.bg,border:`1px solid ${sm.border}`,borderRadius:14,padding:"14px 10px",cursor:"pointer",textAlign:"center",minHeight:48}}>
                <div style={{fontSize:22,marginBottom:3}}>{sm.emoji}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:sm.color,letterSpacing:1}}>{sm.label}</div>
                <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{SCENARIOS[sm.key]?.length||0} {sm.unit}</div>
                {ps&&ps.p>0&&<div style={{fontSize:8,color:"rgba(255,255,255,.6)",marginTop:1}}>{ps.p>=5?`${a}% · `:""}{ps.p} played</div>}
              </div>)})}
          </div>}

          {/* Sprint 3.5: "What should I practice?" recommendations */}
          {(stats.isPro||stats.gp>=10)&&(()=>{
            const recs=getPracticeRecommendations(stats)
            if(recs.length===0)return null
            const topRec=recs[0]
            return <div style={{background:"linear-gradient(135deg,rgba(59,130,246,.06),rgba(168,85,247,.06))",border:"1px solid rgba(59,130,246,.15)",borderRadius:12,padding:"10px 14px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"#3b82f6",letterSpacing:1}}>RECOMMENDED FOR YOU</span>
                <span style={{fontSize:8,color:"#9ca3af"}}>{recs.length} suggestions</span>
              </div>
              {recs.slice(0,3).map((rec,i)=>{
                const clickable=rec.position||rec.type==="situation_room";
                return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:i===0?"rgba(59,130,246,.06)":"transparent",borderRadius:8,marginBottom:i<2?4:0,cursor:clickable?"pointer":"default"}}
                  onClick={rec.type==="situation_room"?()=>{const set=SITUATION_SETS.find(s=>s.id===rec.sitSetId);if(set)startSituation(set);else setScreen("sitPicker")}:rec.position?()=>{if(rec.tag)conceptTargetRef.current=rec.tag;startGame(rec.position)}:undefined}>
                  <span style={{fontSize:16}}>{rec.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:i===0?"#93c5fd":"#d1d5db"}}>{rec.name}{rec.position&&<span style={{fontSize:9,color:"#9ca3af",fontWeight:400,marginLeft:4}}>{POS_META[rec.position]?.emoji||""}</span>}</div>
                    <div style={{fontSize:9,color:"#9ca3af"}}>{rec.reason}</div>
                  </div>
                  {clickable&&<span style={{fontSize:10,color:"#3b82f6"}}>{rec.type==="situation_room"?"Try →":"Play →"}</span>}
                  {rec.type==="reinforce"&&<span style={{fontSize:8,background:"#ef444420",color:"#ef4444",padding:"1px 5px",borderRadius:4,fontWeight:700}}>Review</span>}
                  {rec.type==="new"&&<span style={{fontSize:8,background:"#22c55e20",color:"#22c55e",padding:"1px 5px",borderRadius:4,fontWeight:700}}>New</span>}
                  {rec.type==="situation_room"&&<span style={{fontSize:8,background:"#10b98120",color:"#10b981",padding:"1px 5px",borderRadius:4,fontWeight:700}}>Situation</span>}
                </div>)
              })}
            </div>
          })()}

          {/* Position grid — grouped by role */}
          {[
            {title:"AT THE PLATE",positions:["batter"]},
            {title:"ON THE BASES",positions:["baserunner"]},
            {title:"IN THE FIELD",positions:["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]},
            {title:"IN THE DUGOUT",positions:["manager"]},
          ].map(group=>(
            <div key={group.title} style={{marginBottom:10}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"#9ca3af",marginBottom:5,letterSpacing:2}}>{group.title}</div>
              <div style={{display:"grid",gridTemplateColumns:group.positions.length>=3?"1fr 1fr 1fr":"1fr 1fr",gap:6}}>
                {group.positions.map(p=>{const m=POS_META[p];const ps=stats.ps[p];const a=ps&&ps.p>0?Math.round((ps.c/ps.p)*100):null;return(
                  <div key={p} role="button" aria-label={`Play ${m.label}`} tabIndex={0} onClick={()=>startGame(p)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();startGame(p)}}} style={{background:m.bg,borderRadius:12,padding:group.positions.length>=3?"10px 6px":"14px 10px",cursor:"pointer",transition:"all .2s",textAlign:"center",border:"2px solid transparent",position:"relative",overflow:"hidden"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.borderColor=`${m.color}50`}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.borderColor="transparent"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 30% 20%,rgba(255,255,255,.07),transparent 60%)"}}/>
                    <div style={{position:"relative"}}>
                      <div style={{fontSize:group.positions.length>=3?22:30,marginBottom:1}}>{m.emoji}</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:group.positions.length>=3?12:17,letterSpacing:1}}>{m.label.toUpperCase()}</div>
                      <div style={{fontSize:group.positions.length>=3?8:10,color:"rgba(255,255,255,.55)",marginTop:1}}>{m.desc}</div>
                      <div style={{fontSize:8,color:"rgba(255,255,255,.35)",marginTop:2}}>{SCENARIOS[p]?.length||0} challenges</div>
                      {(stats.adaptiveDiff||{})[p]&&<div style={{fontSize:7,color:((stats.adaptiveDiff||{})[p]?.level||1)>=3?"#a855f7":((stats.adaptiveDiff||{})[p]?.level||1)>=2?"#3b82f6":"#6b7280",fontWeight:700,marginTop:1}}>{"⭐".repeat((stats.adaptiveDiff||{})[p]?.level||1)} {["Rookie","Varsity","All-Star"][((stats.adaptiveDiff||{})[p]?.level||1)-1]}</div>}
                      {ps&&ps.p>0&&<div style={{fontSize:8,color:"rgba(255,255,255,.6)",marginTop:1}}>{ps.p>=5?`${a}% · `:""}{ps.p} played</div>}
                      {/* Phase 4.2: Concept mastery bar per position */}
                      {ps&&ps.p>=3&&(()=>{const posScenarios=SCENARIOS[p]||[];const posConcepts=[...new Set(posScenarios.map(s=>s.conceptTag||findConceptTag(s.concept)).filter(Boolean))];const md=stats.masteryData?.concepts||{};const seenCount=posConcepts.filter(c=>md[c]).length;const masteredCount=posConcepts.filter(c=>md[c]?.state==="mastered").length;const total=posConcepts.length;if(total===0)return null;const pct=Math.max(Math.round((seenCount/total)*100),masteredCount>0?Math.round((masteredCount/total)*100):0);return <div style={{marginTop:3}}>
                        <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(pct,5)}%`,background:masteredCount>=total?"#22c55e":masteredCount>0?"#3b82f6":"#f59e0b",borderRadius:2,transition:"width .3s"}}/></div>
                        <div style={{fontSize:7,color:"rgba(255,255,255,.4)",marginTop:1}}>{seenCount}/{total} concepts seen{masteredCount>0?` · ${masteredCount} mastered`:""}</div>
                      </div>})()}
                      {(()=>{const seen=(hist[p]||[]);const total=(SCENARIOS[p]||[]).length;if(seen.length>=total&&total>0)return<div style={{fontSize:7,color:"#22c55e",fontWeight:700,marginTop:1}}>All {total} mastered{!stats.isPro?" · Get All-Star for AI":""}</div>;return null})()}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          ))}

          {/* AI Challenge — always visible for All-Star users */}
          {(stats.isPro||stats.gp>=3)&&<div style={{marginTop:12,background:"linear-gradient(135deg,rgba(168,85,247,.06),rgba(59,130,246,.06))",border:"1px solid rgba(168,85,247,.15)",borderRadius:14,padding:14,textAlign:"center",position:"relative"}}>
            {!stats.isPro&&<div style={{position:"absolute",top:8,right:8,background:"linear-gradient(135deg,#d97706,#f59e0b)",borderRadius:6,padding:"2px 8px",fontSize:8,fontWeight:800,color:"white",letterSpacing:.5}}>ALL-STAR PASS</div>}
            <div style={{fontSize:20,marginBottom:3}}>🤖</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#a855f7",letterSpacing:1,marginBottom:2}}>AI COACH'S CHALLENGE</div>
            <p style={{fontSize:11,color:"#9ca3af",marginBottom:8,lineHeight:1.4}}>{stats.isPro?"A personalized scenario targeting your weak spots. Every one is unique to you.":"Upgrade to All-Star Pass for AI-generated scenarios that target your weak spots."}</p>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {ALL_POS.map(p=>{const m=POS_META[p];return(
                <button key={p} onClick={()=>{if(!stats.isPro){setPanel('upgrade');trackFunnel('ai_gated',setStats)}else{startGame(p,true)}}} style={{background:`${m.color}12`,border:`1px solid ${m.color}20`,borderRadius:8,padding:"5px 10px",color:m.color,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3,opacity:stats.isPro?1:.6}}>
                  <span>{m.emoji}</span>{m.label}
                </button>
              )})}
            </div>
          </div>}

          {/* Daily remaining */}
          {!stats.isPro&&<div style={{textAlign:"center",marginTop:10}}>
            <div style={{fontSize:10,color:remaining<=0?"#ef4444":remaining<=3?"#f59e0b":"#6b7280"}}>{remaining>0?`${remaining} free play${remaining!==1?"s":""} remaining today`:"\u2728 Come back tomorrow for your Daily Diamond!"}</div>
            {remaining<=3&&remaining>0&&<button onClick={()=>{setPanel('upgrade');trackFunnel('limit_hit',setStats)}} style={{...ghost,color:"#f59e0b",fontSize:11,fontWeight:600,marginTop:2}}>Want unlimited play?</button>}
            {remaining<=0&&panel!=='limit'&&<button onClick={()=>{setPanel('limit');trackFunnel('limit_hit',setStats)}} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{maxWidth:260,margin:"8px auto 0",fontSize:12,padding:"10px 16px"}}}>See Your Session Stats</button>}
          </div>}

          <div style={{textAlign:"center",color:"#374151",fontSize:9,marginTop:16,display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            <span>1️⃣ Pick position</span><span>2️⃣ Read the play</span><span>3️⃣ Make the call</span><span>4️⃣ Learn why</span>
          </div>

          {/* Account */}
          <div style={{marginTop:12,background:authUser?"rgba(59,130,246,.03)":"rgba(255,255,255,.01)",border:`1px solid ${authUser?"rgba(59,130,246,.1)":"rgba(255,255,255,.04)"}`,borderRadius:12,padding:"10px 12px"}}>
            {authUser?<div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>👤</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#d1d5db"}}>{authUser.firstName} {authUser.lastName}</div>
                    <div style={{fontSize:10,color:"#9ca3af"}}>{authUser.email}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:9,color:syncStatus==='synced'?"#22c55e":syncStatus==='syncing'?"#3b82f6":syncStatus==='error'?"#ef4444":"#6b7280"}}>{syncStatus==='synced'?"Synced":syncStatus==='syncing'?"Syncing...":syncStatus==='error'?"Sync error":"Ready"}</span>
                  <button onClick={doLogout} style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)",borderRadius:6,padding:"4px 8px",color:"#ef4444",fontSize:10,fontWeight:600,cursor:"pointer"}}>Log Out</button>
                </div>
              </div>
            </div>:<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>☁</span>
                <div style={{fontSize:11,color:"#9ca3af"}}>Save your progress across devices</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setScreen("signup")} style={{background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.15)",borderRadius:6,padding:"4px 10px",color:"#22c55e",fontSize:10,fontWeight:600,cursor:"pointer"}}>Sign Up</button>
                <button onClick={()=>setScreen("login")} style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:6,padding:"4px 10px",color:"#3b82f6",fontSize:10,fontWeight:600,cursor:"pointer"}}>Log In</button>
              </div>
            </div>}
          </div>

          {/* Team & Settings */}
          <div style={{marginTop:12,background:"rgba(255,255,255,.01)",border:"1px solid rgba(255,255,255,.04)",borderRadius:12,padding:"10px 12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:14}}>👥</span>
              <span style={{fontSize:11,fontWeight:700,color:"#9ca3af"}}>TEAM</span>
              {stats.teamCode&&<span style={{fontSize:10,color:"#3b82f6",background:"rgba(59,130,246,.08)",padding:"1px 6px",borderRadius:4}}>Code: {stats.teamCode}</span>}
            </div>
            {!stats.teamCode?<div style={{display:"flex",gap:6}}>
              <button onClick={()=>{const code=Math.random().toString(36).slice(2,6).toUpperCase();setStats(p=>({...p,teamCode:code}))}} style={{flex:1,background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:8,padding:"6px",color:"#3b82f6",fontSize:10,fontWeight:600,cursor:"pointer"}}>Create Team</button>
              <button onClick={()=>{const code=prompt("Enter team code:");if(code)setStats(p=>({...p,teamCode:code.toUpperCase().slice(0,4)}))}} style={{flex:1,background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.15)",borderRadius:8,padding:"6px",color:"#22c55e",fontSize:10,fontWeight:600,cursor:"pointer"}}>Join Team</button>
            </div>:<div style={{display:"flex",gap:6}}>
              <button onClick={()=>{if(navigator.clipboard)navigator.clipboard.writeText(stats.teamCode);setToast({e:"📎",n:"Code Copied!",d:`Share "${stats.teamCode}" with teammates`});setTimeout(()=>setToast(null),3000)}} style={{flex:1,background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:8,padding:"6px",color:"#3b82f6",fontSize:10,fontWeight:600,cursor:"pointer"}}>📎 Share Code</button>
              <button onClick={()=>setStats(p=>({...p,teamCode:""}))} style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)",borderRadius:8,padding:"6px 10px",color:"#ef4444",fontSize:10,fontWeight:600,cursor:"pointer"}}>Leave</button>
            </div>}
          </div>
          {/* Sprint 3.3: Difficulty calibration nudge */}
          {(()=>{const cal=getPlayerDifficultyLevel();if(cal.recommendation==="ready_for_harder"){
            const groups=AGE_GROUPS.map(a=>a.id);const cur=groups.indexOf(stats.ageGroup);const nextGroup=cur<groups.length-1?AGE_GROUPS[cur+1]:null;
            if(nextGroup)return <div style={{background:"linear-gradient(135deg,rgba(34,197,94,.08),rgba(59,130,246,.08))",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,padding:"8px 12px",marginTop:8,textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#22c55e"}}>🚀 Ready for a Challenge!</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>You're getting {cal.accuracy}% correct — try harder scenarios!</div>
              <button onClick={()=>setStats(p=>({...p,ageGroup:nextGroup.id}))} style={{marginTop:4,background:"#22c55e",color:"#000",border:"none",borderRadius:6,padding:"4px 12px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{nextGroup.label} →</button>
            </div>}return null})()}
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>{const v=!stats.soundOn;setStats(p=>({...p,soundOn:v}));snd.setEnabled(v)}} style={{...ghost,fontSize:10}}>{stats.soundOn?"🔊 Sound On":"🔇 Sound Off"}</button>
            <span style={{color:"#374151"}}>·</span>
            <button onClick={async()=>{
              if(!("Notification" in window)){setToast({e:"⚠️",n:"Not Supported",d:"Your browser doesn't support notifications"});setTimeout(()=>setToast(null),3000);return;}
              if(Notification.permission==="granted"){setToast({e:"🔔",n:"Already Enabled",d:"You'll get daily reminders!"});setTimeout(()=>setToast(null),3000);return;}
              const perm=await Notification.requestPermission();
              if(perm==="granted"){setToast({e:"🔔",n:"Notifications On!",d:"We'll remind you about Daily Diamond"});snd.play('ach');}
              else{setToast({e:"🔕",n:"Notifications Off",d:"You can enable them later in settings"});}
              setTimeout(()=>setToast(null),3000);
            }} style={{...ghost,fontSize:10}}>{"Notification" in window&&Notification.permission==="granted"?"🔔 Reminders On":"🔕 Reminders"}</button>
            <span style={{color:"#374151"}}>·</span>
            <button onClick={()=>{const groups=AGE_GROUPS.map(a=>a.id);const cur=groups.indexOf(stats.ageGroup);const next=groups[(cur+1)%groups.length];setStats(p=>({...p,ageGroup:next}))}} style={{...ghost,fontSize:10}}>🎂 {stats.ageGroup}</button>
            <span style={{color:"#374151"}}>·</span>
            <button onClick={()=>{
              if(parentGate){setPanel(panel==='parent'?null:'parent');return;}
              if(parentGateInline){setParentGateInline(null);return;}
              const a=Math.floor(Math.random()*10)+5;const b=Math.floor(Math.random()*10)+3;
              setParentGateInline({a,b,answer:""});
            }} style={{...ghost,fontSize:10}}>👪 Parent Report</button>
            <span style={{color:"#374151"}}>·</span>
            <button onClick={()=>{
              if(parentGate){setPanel(panel==='coach'?null:'coach');return;}
              const a=Math.floor(Math.random()*10)+5;const b=Math.floor(Math.random()*10)+3;
              setParentGateInline({a,b,answer:"",forCoach:true});
            }} style={{...ghost,fontSize:10}}>🏆 Coach Mode</button>
          </div>

          {parentGateInline&&!parentGate&&<div style={{...card,marginBottom:12,marginTop:8,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#8b5cf6",fontWeight:700,marginBottom:8}}>{parentGateInline.forCoach?"Coach Verification":"Parent Verification"}</div>
            <div style={{fontSize:14,color:"#d1d5db",marginBottom:8}}>What is {parentGateInline.a} × {parentGateInline.b}?</div>
            <input type="number" inputMode="numeric" autoFocus value={parentGateInline.answer} onChange={e=>{
              const val=e.target.value;setParentGateInline(g=>({...g,answer:val}));
              if(val&&parseInt(val)===parentGateInline.a*parentGateInline.b){setParentGate(true);setParentGateInline(null);setPanel(parentGateInline.forCoach?'coach':'parent')}
            }} style={{width:80,background:"rgba(255,255,255,.06)",border:"1.5px solid rgba(139,92,246,.3)",borderRadius:10,padding:"8px 12px",color:"white",fontSize:18,fontWeight:700,textAlign:"center",outline:"none"}}/>
            <div style={{fontSize:9,color:"#9ca3af",marginTop:6}}>This keeps the {parentGateInline.forCoach?"dashboard":"report"} for coaches only</div>
          </div>}

          {panel==='parent'&&parentGate&&<div style={{...card,marginBottom:12,marginTop:8}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#8b5cf6",letterSpacing:1,marginBottom:8}}>PARENT PROGRESS REPORT</div>
            <div style={{background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.12)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700,color:"#8b5cf6",marginBottom:4}}>
                {stats.displayName||"Your player"} learned {(stats.cl||[]).length} baseball concept{(stats.cl||[]).length!==1?"s":""} so far!
              </div>
              <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.5}}>
                They've played {stats.gp} scenarios with {acc}% accuracy and a best streak of {stats.bs} correct in a row.
                {stats.ds>0?` Currently on a ${stats.ds}-day daily streak!`:" Encourage them to play daily to build a streak!"}
              </div>
            </div>

            {/* Phase 3.1: Weekly Trend */}
            {(()=>{const md=stats.masteryData||{concepts:{}};const now=Date.now();const oneWeekAgo=now-7*24*60*60*1000;const twoWeeksAgo=now-14*24*60*60*1000;const thisWeek=Object.entries(md.concepts).filter(([,v])=>v.masteredAt&&v.masteredAt>=oneWeekAgo).length;const lastWeek=Object.entries(md.concepts).filter(([,v])=>v.masteredAt&&v.masteredAt>=twoWeeksAgo&&v.masteredAt<oneWeekAgo).length;if(thisWeek===0&&lastWeek===0)return null;const trend=thisWeek>lastWeek?"📈":thisWeek<lastWeek?"📉":"➡️";return(
              <div style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.12)",borderRadius:10,padding:"8px 10px",marginBottom:10,fontSize:11,color:"#93c5fd"}}>
                {trend} <strong>{thisWeek} concept{thisWeek!==1?"s":""} this week</strong> {lastWeek>0?`(${lastWeek} last week)`:lastWeek===0&&thisWeek>0?"(0 last week)":" — Encourage daily practice!"}
              </div>
            )})()}

            {/* Phase 3.1: Strongest/Weakest Position */}
            {(()=>{const ps=stats.ps||{};const posStats=Object.entries(ps).filter(([,v])=>v.p>=5).map(([p,v])=>({p,acc:Math.round((v.c/v.p)*100)}));if(posStats.length===0)return null;const best=posStats.reduce((a,b)=>b.acc-a.acc>0?b:a);const worst=posStats.reduce((a,b)=>a.acc-b.acc>0?a:b);return(
              <div style={{background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.12)",borderRadius:10,padding:"8px 10px",marginBottom:10,fontSize:11,color:"#86efac"}}>
                <div>💪 <strong>Strongest:</strong> {POS_META[best.p]?.label||best.p} ({best.acc}%)</div>
                <div style={{marginTop:4}}>⚡ <strong>Needs Work:</strong> {POS_META[worst.p]?.label||worst.p} ({worst.acc}%)</div>
              </div>
            )})()}

            {/* Phase 3.1: Recommended Practice Areas */}
            {(()=>{const recs=getPracticeRecommendations(stats).slice(0,3);if(recs.length===0)return null;return(
              <div style={{background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#d8b4fe",marginBottom:4}}>📚 Suggested Practice Areas</div>
                <div style={{fontSize:10,color:"#c4b5fd"}}>
                  {recs.slice(0,2).map((r,i)=>(
                    <div key={i}>{r.emoji} {r.name}</div>
                  ))}
                </div>
              </div>
            )})()}

            <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",marginBottom:6}}>ACCURACY BY POSITION</div>
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
              {ALL_POS.map(p=>{const s=stats.ps[p];const m=POS_META[p];const pAcc=s&&s.p>0?Math.round((s.c/s.p)*100):null;return(
                <div key={p} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14,width:20}}>{m.emoji}</span>
                  <span style={{fontSize:11,fontWeight:600,width:60}}>{m.label}</span>
                  <div style={{flex:1,height:6,background:"rgba(255,255,255,.03)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pAcc||0}%`,background:pAcc>=70?"#22c55e":pAcc>=50?"#f59e0b":"#ef4444",borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:pAcc!=null?(pAcc>=70?"#22c55e":pAcc>=50?"#f59e0b":"#ef4444"):"#4b5563",width:35,textAlign:"right"}}>{pAcc!=null?`${pAcc}%`:"—"}</span>
                </div>
              )})}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",marginBottom:4}}>CONCEPTS MASTERED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10,maxHeight:120,overflowY:"auto"}}>
              {(stats.cl||[]).length===0?<span style={{fontSize:10,color:"#9ca3af"}}>None yet — keep playing!</span>:
                (stats.cl||[]).map((c,i)=><span key={i} style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.1)",borderRadius:6,padding:"2px 6px",fontSize:9,color:"#93c5fd"}}>{c}</span>)}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",marginBottom:4}}>ACHIEVEMENTS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
              {ACHS.map(a=>{const earned=(stats.achs||[]).includes(a.id);return(
                <span key={a.id} style={{fontSize:16,opacity:earned?1:.2,cursor:"default"}} title={`${a.n}${earned?" (earned)":""}`}>{a.e}</span>
              )})}
            </div>
            {/* Situation Room Progress */}
            {(()=>{const sm=stats.sitMastery||{};const completed=SITUATION_SETS.filter(s=>sm[s.id]?.bestGrade).length;if(completed===0)return null;const rank=getSitRank(sm);const tierCounts={diamond:0,gold:0,silver:0,bronze:0};SITUATION_SETS.forEach(s=>{const t=getSitTier(s.id,sm);if(t)tierCounts[t.id]++});return(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",marginBottom:6}}>SITUATION ROOM</div>
                <div style={{background:"rgba(168,85,247,.04)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <span style={{fontSize:18}}>{rank.emoji}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:rank.color}}>{rank.title}</div>
                      <div style={{fontSize:9,color:"#9ca3af"}}>{completed}/{SITUATION_SETS.length} situations completed</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                    {[{id:"diamond",emoji:"💎",label:"Diamond"},{id:"gold",emoji:"🥇",label:"Gold"},{id:"silver",emoji:"🥈",label:"Silver"},{id:"bronze",emoji:"🥉",label:"Bronze"}].map(t=>(
                      <div key={t.id} style={{textAlign:"center",opacity:tierCounts[t.id]>0?1:.35}}>
                        <div style={{fontSize:16}}>{t.emoji}</div>
                        <div style={{fontSize:12,fontWeight:800,color:"#d1d5db"}}>{tierCounts[t.id]}</div>
                        <div style={{fontSize:8,color:"#9ca3af"}}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )})()}
            <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
              <div style={{fontSize:10,color:"#9ca3af",lineHeight:1.5}}>
                <strong>Summary:</strong> {stats.gp} total games · {(stats.cl||[]).length} concepts · {(stats.achs||[]).length}/{ACHS.length} achievements · Level: {lvl.n}
                {stats.ds>=7?" · Building great daily habits!":stats.ds>=3?" · Daily routine forming!":""}
              </div>
            </div>
            {stats.isPro?<div style={{background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:4}}>All-Star Pass Active</div>
              <div style={{fontSize:10,color:"#9ca3af"}}>Plan: {stats.proPlan==="promo-lifetime"?"Promo (Lifetime)":stats.proPlan==="promo-30day"?"Promo (30-day)":stats.proPlan||"lifetime"}{stats.proExpiry?` · ${(stats.proPlan||"").startsWith("promo-")?"Expires":"Renews"}: ${new Date(stats.proExpiry).toLocaleDateString()}`:""}</div>
            </div>:<div style={{background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:4}}>Unlock More Learning</div>
              <div style={{fontSize:10,color:"#9ca3af",marginBottom:6}}>
                {stats.displayName||"Your player"} has learned {(stats.cl||[]).length} concepts in {stats.gp} games. The All-Star Pass adds unlimited play, AI coaching, and 2x XP.
              </div>
              <button onClick={()=>setPanel('upgrade')} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{maxWidth:220,fontSize:11,padding:"8px"}}}>View All-Star Pass</button>
            </div>}
            <button onClick={()=>{
              const report={exported:new Date().toISOString(),player:stats.displayName||"anonymous",isPro:stats.isPro,proPlan:stats.proPlan,
                gamesPlayed:stats.gp,accuracy:stats.gp>0?Math.round((stats.co/stats.gp)*100):0,bestStreak:stats.bs,dailyStreak:stats.ds,
                level:lvl.n,xp:stats.pts,conceptsLearned:(stats.cl||[]).length,achievements:(stats.achs||[]).length,
                sessions:stats.sessionCount||0,firstPlay:stats.firstPlayDate?new Date(stats.firstPlayDate).toISOString():null,
                lastPlay:stats.lastPlayDate?new Date(stats.lastPlayDate).toISOString():null,
                positionStats:Object.fromEntries(ALL_POS.map(p=>[p,stats.ps[p]||{p:0,c:0}])),
                funnel:stats.funnel||[]};
              const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
              const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;
              a.download=`bsm-analytics-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
            }} style={{...ghost,fontSize:10,marginTop:4,width:"100%"}}>📊 Export Analytics (JSON)</button>
          </div>}

          {/* Phase 3.4: Coach Mode Preview */}
          {panel==='coach'&&parentGate&&<div style={{...card,marginBottom:12,marginTop:8}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#06b6d4",letterSpacing:1,marginBottom:8}}>TEAM DASHBOARD (PREVIEW)</div>
            <div style={{background:"rgba(6,182,212,.04)",border:"1px solid rgba(6,182,212,.12)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:11,color:"#a5f3fc",marginBottom:4}}>
                📊 Aggregate Position Stats
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {ALL_POS.slice(0,6).map(p=>{const s=stats.ps[p];const m=POS_META[p];const pAcc=s&&s.p>0?Math.round((s.c/s.p)*100):null;return(
                  <div key={p} style={{background:"rgba(0,0,0,.3)",borderRadius:8,padding:"6px 8px",textAlign:"center",fontSize:10}}>
                    <div style={{fontSize:14,marginBottom:2}}>{m.emoji}</div>
                    <div style={{fontWeight:600,color:"#d1d5db"}}>{m.label}</div>
                    <div style={{fontSize:9,color:"#9ca3af"}}>{pAcc||"—"}% · {s?.p||0} plays</div>
                  </div>
                )})}
              </div>
            </div>
            {(()=>{const recs=getPracticeRecommendations(stats).slice(0,3);if(recs.length===0)return null;return(
              <div style={{background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:700,color:"#fbbf24",marginBottom:4}}>Top Concepts to Work On</div>
                <div style={{fontSize:9,color:"#fcd34d"}}>
                  {recs.map((r,i)=>(
                    <div key={i}>{r.emoji} {r.name}</div>
                  ))}
                </div>
              </div>
            )})()}
            <div style={{background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
              <div style={{fontSize:10,color:"#d8b4fe",lineHeight:1.5}}>
                Full coach features coming soon! Email <strong>feedback@bsm-app.pages.dev</strong> to request team sync, multi-player tracking, and performance analytics.
              </div>
            </div>
            <button onClick={()=>setPanel(null)} style={{...ghost,fontSize:10,width:"100%"}}>Close</button>
          </div>}

          {/* Footer links */}
          <div style={{textAlign:"center",marginTop:20,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.06)"}}>
            <a href="/privacy.html" target="_blank" rel="noopener" style={{fontSize:10,color:"#9ca3af",textDecoration:"none",marginRight:16}}>Privacy Policy</a>
            <a href="/terms.html" target="_blank" rel="noopener" style={{fontSize:10,color:"#9ca3af",textDecoration:"none"}}>Terms of Service</a>
          </div>
        </div>}

        {/* BASEBALL BRAIN */}
        {screen==="brain"&&(()=>{
          // A2: Fixed BrainIQ calculation — increment by tabs visited
          const trackBrainVisit=(tab)=>{
            setStats(p=>{
              const be={...(p.brainExplored||{})};
              if(!be[tab])be[tab]={visited:true,visitCount:0,interactions:0};
              be[tab].visitCount=(be[tab].visitCount||0)+1;
              const tabsVisited=Object.values(be).filter(v=>v.visited).length;
              const newIQ=Math.min(200, tabsVisited*5 + Object.values(be).reduce((s,v)=>s+Math.min(10,(v.interactions||0)),0));
              return{...p,brainExplored:be,brainIQ:Math.max(p.brainIQ||0,newIQ)};
            });
          };
          const trackInteraction=(tab)=>{
            setStats(p=>{
              const be={...(p.brainExplored||{})};
              if(be[tab])be[tab].interactions=(be[tab].interactions||0)+1;
              const tabsVisited=Object.values(be).filter(v=>v.visited).length;
              const newIQ=Math.min(200, tabsVisited*5 + Object.values(be).reduce((s,v)=>s+Math.min(10,(v.interactions||0)),0));
              return{...p,brainExplored:be,brainIQ:Math.max(p.brainIQ||0,newIQ)};
            });
          };
          // B3: Cross-tab navigation helper
          const navigateBrain=(tab,state)=>{
            setBrainTab(tab);trackBrainVisit(tab);
            if(state){
              if(state.runners!==undefined){setReRunners(state.runners);setReOuts(state.outs||0);}
              if(state.count)setSelCount(state.count);
              if(state.inning!==undefined){setWpInning(state.inning);setWpDiff(state.diff||0);}
              if(state.pitcher)setMPitcher(state.pitcher);
              if(state.batter)setMBatter(state.batter);
              if(state.parkIdx!==undefined)setParkType(state.parkIdx);
              if(state.preset)setDefPreset(state.preset);
            }
          };
          // B4: Find scenario for "Test Yourself" buttons
          const findScenarioForConcept=(conceptTag)=>{
            const allScens=Object.entries(SCENARIOS).flatMap(([pos,arr])=>arr.map(s=>({...s,_pos:pos})));
            const matches=allScens.filter(s=>s.conceptTag===conceptTag||s.concept?.toLowerCase().includes((conceptTag||"").replace(/-/g," ")));
            return matches.length>0?matches[Math.floor(Math.random()*matches.length)]:null;
          };
          const launchQuizFromBrain=(conceptTag)=>{
            const s=findScenarioForConcept(conceptTag);
            if(s){setPos(s._pos);setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);setScreen("play");}
          };
          const ageNum=parseInt((stats.ageGroup||"13-15").split("-")[0])||13;
          const vocabTier=ageNum<=8?1:ageNum<=10?2:ageNum<=12?3:ageNum<=15?4:5;
          const isYoung=vocabTier<=2;
          const brainIQ=stats.brainIQ||0;
          const iqTitle=brainIQ>=150?"Baseball Genius":brainIQ>=120?"Sabermetrics Expert":brainIQ>=90?"Analytics All-Star":brainIQ>=60?"Front Office Prospect":brainIQ>=30?"Dugout Analyst":"Rookie Scout";
          const iqColor=brainIQ>=120?"#22c55e":brainIQ>=60?"#3b82f6":brainIQ>=30?"#f59e0b":"#9ca3af";
          const BRAIN_TABS=[
            {id:"re24",label:"Run Expectancy",icon:"📊",color:"#22c55e",short:"RE24",concept:"scoring-probability"},
            {id:"counts",label:"Count Dashboard",icon:"🔢",color:"#3b82f6",short:"Counts",concept:"count-leverage"},
            {id:"pitchlab",label:"Pitch Lab",icon:"⚾",color:"#ef4444",short:"Pitches",concept:"pitch-sequencing"},
            {id:"concepts",label:"Concept Map",icon:"🗺️",color:"#a855f7",short:"Map"},
            {id:"steal",label:"Steal Calculator",icon:"🏃",color:"#f97316",short:"Steal",concept:"steal-breakeven"},
            {id:"pitchcount",label:"Pitch Count",icon:"💪",color:"#eab308",short:"Fatigue",concept:"pitch-count-mgmt"},
            {id:"winprob",label:"Win Probability",icon:"📈",color:"#06b6d4",short:"Win%",concept:"win-probability"},
            {id:"matchup",label:"Matchup Analyzer",icon:"⚔️",color:"#ec4899",short:"Matchup",minAge:11,concept:"platoon-advantage"},
            {id:"park",label:"Park Factors",icon:"🏟️",color:"#84cc16",short:"Parks"},
            {id:"defense",label:"Defensive Sandbox",icon:"🧤",color:"#f59e0b",short:"Defense",minAge:9,concept:"dp-positioning"},
            {id:"history",label:"Famous Moments",icon:"🏆",color:"#8b5cf6",short:"History"},
          ];
          const visibleTabs=BRAIN_TABS.filter(t=>!t.minAge||ageNum>=t.minAge);
          const activeTab=visibleTabs.find(t=>t.id===brainTab)||visibleTabs[0];
          const isFirstVisit=!stats.brainExplored?._onboarded;
          return <div>
            {/* A1: First-visit onboarding overlay */}
            {isFirstVisit&&<div style={{background:"linear-gradient(135deg,rgba(168,85,247,.12),rgba(59,130,246,.08))",border:"1.5px solid rgba(168,85,247,.25)",borderRadius:14,padding:"14px 16px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#a855f7",marginBottom:4}}>Welcome to Baseball Brain!</div>
              <div style={{fontSize:11,color:"#d1d5db",lineHeight:1.5,marginBottom:8}}>Tap a base to add a runner, then use the buttons to see how the numbers change. Each tab explores a different part of baseball strategy.</div>
              <button onClick={()=>setStats(p=>({...p,brainExplored:{...(p.brainExplored||{}),_onboarded:true}}))} style={{background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",borderRadius:8,padding:"6px 16px",fontSize:11,fontWeight:600,color:"#a855f7",cursor:"pointer"}}>Got it!</button>
            </div>}
            {/* Header with A2: IQ display */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:18,padding:8,minWidth:36,minHeight:36}}>←</button>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#a855f7",letterSpacing:1.5}}>BASEBALL BRAIN</div>
                <div style={{fontSize:10,color:"#9ca3af"}}>Explore the hidden math of baseball</div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:900,color:iqColor}}>{brainIQ}</div>
                <div style={{fontSize:7,color:iqColor,fontWeight:600}}>{iqTitle}</div>
              </div>
            </div>
            {/* Tab strip with A4: scroll indicator fade + larger touch targets */}
            <div style={{position:"relative",marginBottom:12}}>
              <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch",maskImage:"linear-gradient(to right,black 85%,transparent 100%)",WebkitMaskImage:"linear-gradient(to right,black 85%,transparent 100%)"}}>
                {visibleTabs.map(t=>{
                  const explored=stats.brainExplored?.[t.id];
                  const ring=explored?Math.min(100,Math.round(((explored.visitCount||0)*10+(explored.interactions||0)*5)/100*100)):0;
                  return <button key={t.id} onClick={()=>{setBrainTab(t.id);trackBrainVisit(t.id);}} style={{flexShrink:0,background:brainTab===t.id?`${t.color}20`:"rgba(255,255,255,.02)",border:`1.5px solid ${brainTab===t.id?`${t.color}40`:"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s",minHeight:40,position:"relative"}}>
                    <span style={{fontSize:15}}>{t.icon}</span>
                    <span style={{fontSize:10,fontWeight:600,color:brainTab===t.id?t.color:"#9ca3af",whiteSpace:"nowrap"}}>{t.short}</span>
                    {ring>0&&<div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:ring>=80?t.color:"rgba(255,255,255,.3)",border:`1px solid ${t.color}40`}}/>}
                  </button>;
                })}
            </div>

            {/* RE24 EXPLORER TAB */}
            {brainTab==="re24"&&(()=>{
              const rKey=r=>reRunners.includes(r)?reRunners.filter(x=>x!==r):[...reRunners,r];
              const reState=runners=>{const k=(runners.includes(1)?"1":"-")+(runners.includes(2)?"2":"-")+(runners.includes(3)?"3":"-");return k==="---"?"---":k;};
              const re24=BRAIN.stats.RE24[reState(reRunners)]?.[reOuts]||0;
              const doAction=(name,newRunners,newOuts,delta,msg)=>{snd.play('tap');trackInteraction("re24");setRePrevRE(re24);setReRunners(newRunners);setReOuts(Math.min(newOuts,2));setReLastAction({name,delta,msg});if(newOuts>=3){setTimeout(()=>{setReRunners([]);setReOuts(0);setReLastAction({name:"Inning Over",delta:-re24,msg:"3 outs! The inning is over."});},1500);}};
              const canBunt=reRunners.some(r=>r<=2)&&reOuts<2;
              const canSteal=reRunners.some(r=>r<=2);
              const canSacFly=reRunners.includes(3)&&reOuts<2;
              const canDP=reRunners.includes(1)&&reOuts<2;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#22c55e",letterSpacing:1,marginBottom:8}}>{isYoung?"CHANCE TO SCORE":"RUN EXPECTANCY EXPLORER"}</div>
                {/* A8: Empty-state prompt */}
                {reRunners.length===0&&!reLastAction&&<div style={{textAlign:"center",fontSize:11,color:"#86efac",marginBottom:8,padding:"6px 12px",background:"rgba(34,197,94,.06)",borderRadius:8,border:"1px solid rgba(34,197,94,.1)"}}>
                  {isYoung?"Tap a base to put a runner on!":"Tap the bases below to place runners, then use the buttons to see how run expectancy changes."}
                </div>}
                {/* A3: Enlarged diamond with bigger tap targets */}
                <div style={{position:"relative",width:220,height:170,margin:"0 auto 12px"}}>
                  <svg viewBox="0 0 220 170" width="220" height="170">
                    <polygon points="110,12 206,85 110,158 14,85" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5"/>
                    <line x1="110" y1="12" x2="110" y2="158" stroke="rgba(255,255,255,.05)" strokeWidth="0.5"/>
                    <line x1="14" y1="85" x2="206" y2="85" stroke="rgba(255,255,255,.05)" strokeWidth="0.5"/>
                    {/* Home plate */}
                    <polygon points="110,153 105,158 110,163 115,158" fill="rgba(255,255,255,.4)"/>
                    {/* Bases — A3: enlarged tap targets with invisible hit areas */}
                    {[{b:1,x:200,y:79,lx:212,ly:70},{b:2,x:104,y:6,lx:110,ly:-4},{b:3,x:8,y:79,lx:-4,ly:70}].map(({b,x,y,lx,ly})=>{
                      const on=reRunners.includes(b);
                      return <g key={b} onClick={()=>{snd.play('tap');setReRunners(rKey(b));trackInteraction("re24");}} style={{cursor:"pointer"}}>
                        {/* Invisible larger hit area for mobile */}
                        <rect x={x-10} y={y-10} width={36} height={36} fill="transparent"/>
                        <rect x={x} y={y} width={16} height={16} rx={2} transform={`rotate(45 ${x+8} ${y+8})`} fill={on?"#22c55e":"rgba(255,255,255,.12)"} stroke={on?"#22c55e":"rgba(255,255,255,.25)"} strokeWidth={1.5}/>
                        {on&&<circle cx={x+8} cy={y-3} r={6} fill="#22c55e" stroke="#15803d" strokeWidth={1}/>}
                        <text x={lx} y={ly} fill="rgba(255,255,255,.5)" fontSize="9" fontWeight="600" textAnchor="middle">{b===1?"1B":b===2?"2B":"3B"}</text>
                      </g>;
                    })}
                  </svg>
                </div>
                {/* Outs selector */}
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:10,color:"#9ca3af",alignSelf:"center"}}>Outs:</span>
                  {[0,1,2].map(o=><button key={o} onClick={()=>{setRePrevRE(re24);setReOuts(o);setReLastAction(null);}} style={{width:28,height:28,borderRadius:"50%",background:reOuts>=o+1?"rgba(239,68,68,.3)":"rgba(255,255,255,.04)",border:`1.5px solid ${reOuts>=o+1?"#ef4444":"rgba(255,255,255,.12)"}`,color:reOuts>=o+1?"#fca5a5":"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{o<reOuts?"●":"○"}</button>)}
                </div>
                {/* RE24 display */}
                <div style={{textAlign:"center",marginBottom:12}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{isYoung?"Chance to Score":"Expected Runs"}</div>
                  <div style={{fontSize:36,fontWeight:900,color:re24>1.5?"#22c55e":re24>0.5?"#f59e0b":"#ef4444",transition:"color .3s"}}>{isYoung?("⭐".repeat(Math.max(1,Math.round(re24/0.5)))):re24.toFixed(2)}</div>
                  {reLastAction&&<div style={{display:"inline-flex",alignItems:"center",gap:4,background:reLastAction.delta>=0?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",border:`1px solid ${reLastAction.delta>=0?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`,borderRadius:8,padding:"3px 10px",marginTop:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:reLastAction.delta>=0?"#22c55e":"#ef4444"}}>{reLastAction.delta>=0?"+":""}{reLastAction.delta.toFixed(2)}</span>
                    <span style={{fontSize:10,color:"#9ca3af"}}>{reLastAction.name}</span>
                  </div>}
                  {reLastAction?.msg&&<div style={{fontSize:10,color:"#d1d5db",marginTop:4,maxWidth:280,margin:"4px auto 0"}}>{reLastAction.msg}</div>}
                </div>
                {/* Scoring probability overlay */}
                {reRunners.length>0&&<div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                  {[...reRunners].sort().map(b=>{const bk=b===1?"first":b===2?"second":"third";const prob=BRAIN.stats.scoringProb[bk]?.[reOuts];return prob!==undefined&&<div key={b} style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:8,padding:"4px 10px",fontSize:10}}>
                    <span style={{color:"#22c55e",fontWeight:700}}>{b===1?"1st":b===2?"2nd":"3rd"}</span>
                    <span style={{color:"#9ca3af"}}> scores: </span>
                    <span style={{color:prob>0.6?"#22c55e":prob>0.3?"#f59e0b":"#ef4444",fontWeight:700}}>{Math.round(prob*100)}%</span>
                  </div>;})}
                </div>}
                {/* What If buttons */}
                <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",marginBottom:12}}>
                  {[
                    {label:isYoung?"Hit!":"Single",show:true,fn:()=>{
                      let nr=[...reRunners],scored=0;
                      if(nr.includes(3)){scored++;nr=nr.filter(x=>x!==3);}
                      if(nr.includes(2)&&Math.random()<BRAIN.stats.baserunningRates.second_to_home_on_single){scored++;nr=nr.filter(x=>x!==2);}else if(nr.includes(2)){nr=nr.map(x=>x===2?3:x);}
                      if(nr.includes(1)){nr=nr.map(x=>x===1?2:x);}
                      nr.push(1);nr=[...new Set(nr)];
                      const newRE=BRAIN.stats.RE24[reState(nr)]?.[reOuts]||0;
                      doAction("Single",nr,reOuts,newRE-re24+scored,scored?`Runner scored! +${scored} run${scored>1?"s":""}`:isYoung?"Base hit! Runners advance!":"Runners advance on the single.");
                    }},
                    {label:"Walk",show:true,fn:()=>{
                      let nr=[...reRunners];
                      if(nr.includes(1)&&nr.includes(2)&&nr.includes(3)){const newRE=BRAIN.stats.RE24["123"]?.[reOuts]||0;doAction("Walk",nr,reOuts,newRE-re24+1,"Bases loaded walk! Run scores!");}
                      else{if(nr.includes(2)&&nr.includes(1)){nr=nr.map(x=>x===2?3:x);}if(nr.includes(1)){nr=nr.map(x=>x===1?2:x);}nr.push(1);nr=[...new Set(nr)];const newRE=BRAIN.stats.RE24[reState(nr)]?.[reOuts]||0;doAction("Walk",nr,reOuts,newRE-re24,isYoung?"Free base!":"Walk advances forced runners.");}
                    }},
                    {label:isYoung?"Strikeout":"K",show:true,fn:()=>{
                      const no=reOuts+1;const newRE=no>=3?0:(BRAIN.stats.RE24[reState(reRunners)]?.[no]||0);
                      doAction("Strikeout",reRunners,no,newRE-re24,no>=3?"Three outs!":isYoung?"One more out...":"Strikeout. One more out recorded.");
                    }},
                    {label:"Bunt",show:canBunt,fn:()=>{
                      const leadR=Math.max(...reRunners.filter(r=>r<=2));
                      let nr=reRunners.map(r=>r===leadR?r+1:r).filter(r=>r<=3);
                      nr=[...new Set(nr)];const no=reOuts+1;
                      const newRE=no>=3?0:(BRAIN.stats.RE24[reState(nr)]?.[no]||0);
                      const delta=newRE-re24;
                      doAction("Bunt",nr,no,delta,`${isYoung?"Bunt moves the runner but costs an out.":"Sacrifice bunt: runner advances, out recorded."} ${vocabTier>=3?`RE24 change: ${delta>=0?"+":""}${delta.toFixed(2)}.`:""}${vocabTier<=3?" Note: at youth levels, bunting works better than these MLB numbers suggest because fielders make more errors.":""}`);
                    }},
                    {label:"Steal",show:canSteal,fn:()=>{
                      const be=BRAIN.stats.stealBreakEven[reOuts]||0.72;
                      const safe=Math.random()>0.35;
                      if(safe){let nr=reRunners.map(r=>r<=2?r+1:r);nr=[...new Set(nr)];const newRE=BRAIN.stats.RE24[reState(nr)]?.[reOuts]||0;doAction("Steal (Safe!)",nr,reOuts,newRE-re24,`SAFE! ${isYoung?"The runner made it!":` Need ${Math.round(be*100)}% success rate to break even.`}`);}
                      else{const nr=reRunners.filter(r=>r>2||r!==Math.min(...reRunners.filter(x=>x<=2)));const no=reOuts+1;const newRE=no>=3?0:(BRAIN.stats.RE24[reState(nr)]?.[no]||0);doAction("Steal (Out!)",nr,no,newRE-re24,`CAUGHT! ${isYoung?"The runner was out!":` Needed ${Math.round(be*100)}% success rate to break even.`}`);}
                    }},
                    {label:"Sac Fly",show:canSacFly,fn:()=>{
                      let nr=reRunners.filter(r=>r!==3);const no=reOuts+1;
                      const newRE=no>=3?0:(BRAIN.stats.RE24[reState(nr)]?.[no]||0);
                      doAction("Sac Fly",nr,no,newRE-re24+1,isYoung?"Fly ball! Runner tags up and scores!":"Sacrifice fly: runner scores from 3rd, out recorded.");
                    }},
                    {label:"Double Play",show:canDP,fn:()=>{
                      let nr=reRunners.filter(r=>r!==1);const no=reOuts+2;
                      const newRE=no>=3?0:(BRAIN.stats.RE24[reState(nr)]?.[Math.min(no,2)]||0);
                      doAction("Double Play",nr,no,newRE-re24,isYoung?"Two outs at once! That hurts!":"Ground into double play — devastating for run expectancy.");
                    }},
                    {label:isYoung?"Big Hit!":"Double",show:true,fn:()=>{
                      let nr=[...reRunners],scored=0;
                      if(nr.includes(3)){scored++;nr=nr.filter(x=>x!==3);}
                      if(nr.includes(2)){scored++;nr=nr.filter(x=>x!==2);}
                      if(nr.includes(1)){const adv=Math.random()<0.52;if(adv){scored++;nr=nr.filter(x=>x!==1);}else{nr=nr.map(x=>x===1?3:x);}}
                      nr.push(2);nr=[...new Set(nr)];
                      const newRE=BRAIN.stats.RE24[reState(nr)]?.[reOuts]||0;
                      doAction("Double",nr,reOuts,newRE-re24+scored,scored?`Double! ${scored} run${scored>1?"s":""} scored!`:isYoung?"Big hit to the gap!":"Double clears the bases — runner to 2nd.");
                    }},
                  ].filter(a=>a.show).map(a=><button key={a.label} onClick={a.fn} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"8px 14px",fontSize:10,fontWeight:600,color:"#d1d5db",cursor:"pointer",transition:"all .15s",minHeight:36}}>{a.label}</button>)}
                </div>
                {/* B3: Cross-tab links after actions */}
                {reLastAction&&reLastAction.name.includes("Steal")&&<div style={{textAlign:"center",marginBottom:4}}>
                  <button onClick={()=>navigateBrain("steal",{outs:reOuts})} style={{background:"none",border:"none",color:"#f97316",fontSize:9,cursor:"pointer",textDecoration:"underline"}}>See the steal math in Steal Calculator →</button>
                </div>}
                {reLastAction&&reLastAction.name==="Bunt"&&<div style={{textAlign:"center",marginBottom:4}}>
                  <button onClick={()=>navigateBrain("counts")} style={{background:"none",border:"none",color:"#3b82f6",fontSize:9,cursor:"pointer",textDecoration:"underline"}}>Which counts favor bunting? →</button>
                </div>}
                {/* Reset */}
                <div style={{textAlign:"center",display:"flex",justifyContent:"center",gap:8}}>
                  <button onClick={()=>{setReRunners([]);setReOuts(0);setReLastAction(null);setRePrevRE(null);}} style={{background:"none",border:"1px solid rgba(255,255,255,.08)",borderRadius:6,padding:"5px 14px",fontSize:9,color:"#9ca3af",cursor:"pointer",minHeight:32}}>Reset Diamond</button>
                  {activeTab.concept&&<button onClick={()=>launchQuizFromBrain(activeTab.concept)} style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:6,padding:"5px 14px",fontSize:9,color:"#22c55e",fontWeight:600,cursor:"pointer",minHeight:32}}>Test Yourself →</button>}
                </div>
                {/* Full matrix for advanced players */}
                {vocabTier>=4&&<div style={{marginTop:16}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:700}}>Full RE24 Matrix</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",fontSize:9,borderCollapse:"collapse"}}>
                      <thead><tr style={{color:"#9ca3af"}}>
                        <th style={{padding:"3px 4px",textAlign:"left"}}>Runners</th>
                        <th style={{padding:"3px 4px"}}>0 out</th>
                        <th style={{padding:"3px 4px"}}>1 out</th>
                        <th style={{padding:"3px 4px"}}>2 out</th>
                      </tr></thead>
                      <tbody>{Object.entries(BRAIN.stats.RE24).map(([k,v])=>{
                        const label=k==="---"?"Empty":k.replace(/(.)/g,(m,c,i)=>c!=="-"?["","1st","2nd","3rd"][parseInt(c)]+(i<4?"+":""):"").replace(/\+$/,"");
                        return <tr key={k} style={{borderTop:"1px solid rgba(255,255,255,.04)"}}>
                          <td style={{padding:"3px 4px",color:"#d1d5db",fontWeight:600}}>{label}</td>
                          {v.map((val,i)=><td key={i} style={{padding:"3px 4px",textAlign:"center",color:val>1.5?"#22c55e":val>0.5?"#f59e0b":"#ef4444",fontWeight:600,background:`rgba(${val>1.2?"34,197,94":val>0.5?"245,158,11":"239,68,68"},${Math.min(0.2,val/12).toFixed(2)})`}}>{val.toFixed(2)}</td>)}
                        </tr>;
                      })}</tbody>
                    </table>
                  </div>
                </div>}
              </div>;
            })()}

            {/* COUNT DASHBOARD TAB */}
            {brainTab==="counts"&&(()=>{
              const perspective=countPerspective;const setPerspective=setCountPerspective;
              const counts=[["0-0","1-0","2-0","3-0"],["0-1","1-1","2-1","3-1"],["0-2","1-2","2-2","3-2"]];
              const cd=BRAIN.stats.countData;
              const cr=BRAIN.stats.countRates;
              const fpv=BRAIN.stats.firstPitchValue;
              const cwk=BRAIN.stats.leagueTrends?.countWalkRates||{};
              return <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#3b82f6",letterSpacing:1}}>COUNT DASHBOARD</div>
                  {vocabTier>=3&&<div style={{display:"flex",background:"rgba(255,255,255,.03)",borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,.06)"}}>
                    {["hitter","pitcher"].map(p=><button key={p} onClick={()=>setPerspective(p)} style={{padding:"4px 10px",fontSize:9,fontWeight:600,background:perspective===p?"rgba(59,130,246,.15)":"transparent",color:perspective===p?"#3b82f6":"#6b7280",border:"none",cursor:"pointer",textTransform:"capitalize"}}>{p}</button>)}
                  </div>}
                </div>
                {/* Count grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>
                  {counts.flat().map(c=>{
                    const d=cd[c];if(!d)return null;
                    const edgeColor=d.edge==="hitter"?"#22c55e":d.edge==="pitcher"?"#ef4444":"#f59e0b";
                    const sel=selCount===c;
                    return <button key={c} onClick={()=>setSelCount(sel?null:c)} style={{background:sel?`${edgeColor}15`:"rgba(255,255,255,.02)",border:`1.5px solid ${sel?edgeColor:"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"8px 4px",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                      <div style={{fontSize:13,fontWeight:800,color:edgeColor}}>{c}</div>
                      {isYoung?<div style={{fontSize:12,marginTop:2}}>{d.edge==="hitter"?"😊":d.edge==="pitcher"?"😰":"😐"}</div>
                      :<div style={{fontSize:9,color:"#9ca3af",marginTop:1}}>.{Math.round(d.ba*1000)}</div>}
                      <div style={{fontSize:7,color:edgeColor,marginTop:1,fontWeight:600}}>{isYoung?(d.edge==="hitter"?"Hitter wins!":d.edge==="pitcher"?"Pitcher wins!":"Even!"):d.label}</div>
                    </button>;
                  })}
                </div>
                {/* Selected count detail */}
                {selCount&&cd[selCount]&&(()=>{
                  const d=cd[selCount];const r=cr[selCount]||{};const wk=cwk[selCount];
                  const edgeColor=d.edge==="hitter"?"#22c55e":d.edge==="pitcher"?"#ef4444":"#f59e0b";
                  const isFirst=selCount==="0-0";
                  return <div style={{background:"rgba(255,255,255,.02)",border:`1.5px solid ${edgeColor}30`,borderRadius:14,padding:"12px 14px",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:800,color:edgeColor,marginBottom:4}}>{selCount} — {d.label}</div>
                    {/* Stats grid */}
                    {vocabTier>=2&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
                      {[
                        {label:"BA",val:`.${Math.round(d.ba*1000)}`,color:"#d1d5db"},
                        vocabTier>=3&&{label:"OBP",val:`.${Math.round(d.obp*1000)}`,color:"#d1d5db"},
                        vocabTier>=3&&{label:"SLG",val:`.${Math.round(d.slg*1000)}`,color:"#d1d5db"},
                        r.k!==undefined&&{label:"K% next pitch",val:`${Math.round(r.k*100)}%`,color:r.k>0.2?"#ef4444":"#d1d5db"},
                        r.bb!==undefined&&r.bb>0&&{label:"BB% next pitch",val:`${Math.round(r.bb*100)}%`,color:r.bb>0.1?"#22c55e":"#d1d5db"},
                        wk!==undefined&&vocabTier>=3&&{label:"Walk rate from here",val:`${Math.round(wk*100)}%`,color:wk>0.15?"#22c55e":"#d1d5db"},
                      ].filter(Boolean).map((s,i)=><div key={i} style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"6px 4px"}}>
                        <div style={{fontSize:14,fontWeight:800,color:s.color}}>{s.val}</div>
                        <div style={{fontSize:7,color:"#9ca3af",marginTop:1}}>{s.label}</div>
                      </div>)}
                    </div>}
                    {/* Perspective-specific advice */}
                    <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.5,marginBottom:6}}>
                      {perspective==="hitter"?(
                        d.edge==="hitter"?`${isYoung?"You're in charge! Look for a good pitch to hit!":"This is your count. Be aggressive — sit on your pitch and drive it."}`
                        :d.edge==="pitcher"?`${isYoung?"Be careful! Protect the strike zone!":"Pitcher's count. Shorten your swing, protect the zone, fight to survive."}`
                        :`${isYoung?"It could go either way! Stay ready!":"Neutral count. Stay balanced — be ready to attack a mistake or take a tough pitch."}`
                      ):(
                        d.edge==="pitcher"?`${isYoung?"You've got the hitter on the ropes!":"Pitcher's count. Expand the zone — throw your best secondary pitch just off the plate."}`
                        :d.edge==="hitter"?`${isYoung?"Be careful where you throw!":"Hitter's count. Must throw a quality strike — don't give in with a meatball."}`
                        :`${isYoung?"Even battle! Make your best pitch!":"Neutral. Establish the zone with a quality strike, set up the next pitch."}`
                      )}
                    </div>
                    {/* Progression arrows */}
                    {vocabTier>=3&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {(()=>{
                        const [b,s]=selCount.split("-").map(Number);
                        const arrows=[];
                        if(s<2){const nc=`${b}-${s+1}`;const ncd=cd[nc];if(ncd)arrows.push({label:"Strike →",count:nc,ba:ncd.ba,color:"#ef4444",prob:r.k!==undefined?null:null});}
                        if(b<3){const nc=`${b+1}-${s}`;const ncd=cd[nc];if(ncd)arrows.push({label:"Ball →",count:nc,ba:ncd.ba,color:"#22c55e"});}
                        if(b===3&&s<2)arrows.push({label:"Strike →",count:`3-${s+1}`,ba:cd[`3-${s+1}`]?.ba,color:"#ef4444"});
                        if(b<3&&s===2)arrows.push({label:"Ball →",count:`${b+1}-2`,ba:cd[`${b+1}-2`]?.ba,color:"#22c55e"});
                        return arrows.map((a,i)=>a.ba!==undefined&&<div key={i} style={{background:`${a.color}08`,border:`1px solid ${a.color}15`,borderRadius:6,padding:"3px 8px",fontSize:9}}>
                          <span style={{color:a.color,fontWeight:600}}>{a.label}</span>
                          <span style={{color:"#9ca3af"}}> {a.count} (.{Math.round(a.ba*1000)})</span>
                        </div>);
                      })()}
                    </div>}
                    {/* First pitch deep dive */}
                    {isFirst&&vocabTier>=3&&<div style={{marginTop:8,background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.1)",borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#3b82f6",marginBottom:4}}>First Pitch Deep Dive</div>
                      <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5}}>
                        Elite pitchers throw first-pitch strikes <strong style={{color:"#22c55e"}}>{Math.round(fpv.eliteRate*100)}%</strong> of the time.
                        A first-pitch strike saves <strong style={{color:"#22c55e"}}>{Math.abs(fpv.strikeValue)}</strong> runs.
                        A first-pitch ball costs <strong style={{color:"#ef4444"}}>{fpv.ballCost}</strong> runs.
                        {perspective==="hitter"?` Batters who swing first pitch: .${Math.round(fpv.firstPitchSwingBA*1000)} BA. Those who take: .${Math.round(fpv.firstPitchTakeBA*1000)}.`
                        :` After 0-1: K rate jumps to ${Math.round(fpv.afterFirstStrikeK*100)}%, walk rate drops to ${Math.round(fpv.afterFirstStrikeBB*100)}%.`}
                      </div>
                    </div>}
                  </div>;
                })()}
                {/* Quick teach */}
                {!selCount&&<div style={{textAlign:"center",padding:"8px 12px",background:"rgba(59,130,246,.04)",borderRadius:10,border:"1px solid rgba(59,130,246,.08)"}}>
                  <div style={{fontSize:10,color:"#93c5fd"}}>{isYoung?"Tap a count to see who has the advantage!":"Tap any count to see detailed stats, progression arrows, and strategic advice."}</div>
                </div>}
              </div>;
            })()}

            {/* PITCH LAB TAB */}
            {brainTab==="pitchlab"&&(()=>{
              const pt=BRAIN.stats.pitchTypeData;
              const types=pt.types;
              const seq=pt.sequencing;
              const elp=pt.eyeLevelPrinciple;
              const cfv=BRAIN.stats.catcherFramingValue;
              const allPitches=Object.entries(types);
              const visiblePitches=isYoung?allPitches.filter(([k])=>["fourSeam","changeup","curveball"].includes(k)):vocabTier<=2?allPitches.filter(([k])=>["fourSeam","sinker","changeup","slider","curveball"].includes(k)):allPitches;
              const rvColor=rv=>rv<=-1.0?"#22c55e":rv<=-0.5?"#86efac":rv<=0?"#f59e0b":"#ef4444";
              // Sequencing scoring
              const scoreSeq=(pitches)=>{
                if(pitches.length<2)return{total:0,details:[]};
                let total=0;const details=[];
                for(let i=1;i<pitches.length;i++){
                  const prev=types[pitches[i-1]],cur=types[pitches[i]];let pts=0,why=[];
                  const isFB=["fourSeam","sinker","cutter"].includes(pitches[i-1]);
                  const isOS=!["fourSeam","sinker","cutter"].includes(pitches[i-1]);
                  if(isFB&&pitches[i]===seq.afterFastball.best){pts+=3;why.push("+3 best follow-up");}
                  else if(isFB&&pitches[i]===seq.afterFastball.second){pts+=2;why.push("+2 good follow-up");}
                  else if(isFB&&pitches[i]===seq.afterFastball.avoid){pts-=2;why.push("-2 avoid after FB");}
                  if(isOS&&pitches[i]===seq.afterOffspeed.best){pts+=3;why.push("+3 best follow-up");}
                  else if(isOS&&pitches[i]===seq.afterOffspeed.avoid){pts-=2;why.push("-2 avoid after OS");}
                  if(Math.abs(prev.velo-cur.velo)>=5){pts+=1;why.push("+1 speed change");}
                  if(prev.velo>90&&cur.velo<88||prev.velo<88&&cur.velo>90){pts+=2;why.push("+2 eye level change");}
                  if(pitches[i]===pitches[i-1]){pts-=1;why.push("-1 same pitch twice");}
                  total+=pts;details.push({pitch:cur.name,pts,why:why.join(", ")});
                }
                return{total,details};
              };
              return <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#ef4444",letterSpacing:1}}>PITCH LAB</div>
                  {vocabTier>=3&&<button onClick={()=>{setSeqMode(!seqMode);setSeqPitches([]);}} style={{background:seqMode?"rgba(239,68,68,.15)":"rgba(255,255,255,.03)",border:`1px solid ${seqMode?"rgba(239,68,68,.3)":"rgba(255,255,255,.08)"}`,borderRadius:8,padding:"4px 10px",fontSize:9,fontWeight:600,color:seqMode?"#ef4444":"#9ca3af",cursor:"pointer"}}>{seqMode?"Exit Sequencing":"Build a Sequence"}</button>}
                </div>
                {/* Sequencing mode */}
                {seqMode&&<div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#d1d5db",marginBottom:6}}>Tap pitches to build a {vocabTier>=4?5:3}-pitch sequence:</div>
                  <div style={{display:"flex",gap:4,marginBottom:6,minHeight:32,flexWrap:"wrap"}}>
                    {seqPitches.map((p,i)=><div key={i} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#fca5a5"}}>{i+1}. {types[p]?.name?.split(" ")[0]||p}</div>)}
                    {seqPitches.length===0&&<div style={{fontSize:10,color:"#6b7280",fontStyle:"italic"}}>Tap a pitch below to start...</div>}
                  </div>
                  {seqPitches.length>=(vocabTier>=4?5:3)&&(()=>{const sc=scoreSeq(seqPitches);return <div style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.12)",borderRadius:10,padding:"8px 10px",marginBottom:6}}>
                    <div style={{fontSize:12,fontWeight:800,color:sc.total>=10?"#22c55e":sc.total>=5?"#f59e0b":"#ef4444"}}>Score: {sc.total} points</div>
                    {sc.details.map((d,i)=><div key={i} style={{fontSize:9,color:"#9ca3af"}}>{d.pitch}: {d.why||"neutral"} ({d.pts>=0?"+":""}{d.pts})</div>)}
                    <button onClick={()=>setSeqPitches([])} style={{marginTop:6,background:"none",border:"1px solid rgba(255,255,255,.08)",borderRadius:6,padding:"3px 10px",fontSize:9,color:"#9ca3af",cursor:"pointer"}}>Try Again</button>
                  </div>;})()}
                  {seqPitches.length>0&&seqPitches.length<(vocabTier>=4?5:3)&&(()=>{
                    const last=seqPitches[seqPitches.length-1];const isFB=["fourSeam","sinker","cutter"].includes(last);
                    const rec=isFB?seq.afterFastball:seq.afterOffspeed;
                    return <div style={{fontSize:9,color:"#93c5fd",marginBottom:4}}>Tip: After {types[last]?.name?.split(" ")[0]||last}, best follow-up is <strong>{types[rec.best]?.name?.split(" ")[0]||rec.best}</strong>. Avoid {types[rec.avoid]?.name?.split(" ")[0]||rec.avoid}.</div>;
                  })()}
                </div>}
                {/* Pitch cards */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                  {visiblePitches.map(([k,p])=>{
                    const sel=selPitch===k;
                    return <button key={k} onClick={(e)=>{e.stopPropagation();snd.play('tap');if(seqMode&&seqPitches.length<(vocabTier>=4?5:3)){setSeqPitches([...seqPitches,k]);trackInteraction("pitchlab");}else{setSelPitch(sel?null:k);trackInteraction("pitchlab");}}} style={{background:seqMode?"rgba(239,68,68,.04)":sel?"rgba(239,68,68,.08)":"rgba(255,255,255,.02)",border:`1.5px solid ${sel?"rgba(239,68,68,.3)":seqMode?"rgba(239,68,68,.15)":"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"10px",cursor:"pointer",textAlign:"left",transition:"all .2s",minHeight:44}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#d1d5db"}}>{isYoung?p.name.split("/")[0].split("(")[0].trim():p.name.split("/")[0].trim()}</div>
                        <div style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>{Math.round(p.velo)} mph</div>
                      </div>
                      {!isYoung&&<div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <div style={{flex:1,height:3,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${p.usage*100*2}%`,background:rvColor(p.rv100),borderRadius:2}}/>
                        </div>
                        <span style={{fontSize:8,color:rvColor(p.rv100),fontWeight:600}}>{p.rv100>0?"+":""}{p.rv100}</span>
                      </div>}
                      {isYoung&&<div style={{fontSize:9,color:"#9ca3af"}}>{p.velo>=90?"Fast!":p.velo>=85?"Tricky!":"Curvy!"}</div>}
                    </button>;
                  })}
                </div>
                {/* Selected pitch detail */}
                {selPitch&&types[selPitch]&&!seqMode&&(()=>{
                  const p=types[selPitch];
                  return <div style={{background:"rgba(239,68,68,.04)",border:"1.5px solid rgba(239,68,68,.15)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#ef4444",marginBottom:4}}>{p.name}</div>
                    <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.5,marginBottom:8}}>{p.description}</div>
                    {vocabTier>=3&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
                      {[
                        {label:"Velocity",val:`${p.velo} mph`,color:"#f59e0b"},
                        {label:"Run Value/100",val:`${p.rv100>0?"+":""}${p.rv100}`,color:rvColor(p.rv100)},
                        {label:"wOBA against",val:`.${Math.round(p.woba*1000)}`,color:"#d1d5db"},
                        {label:"Usage",val:`${Math.round(p.usage*100)}%`,color:"#d1d5db"},
                      ].map((s,i)=><div key={i} style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"6px 4px"}}>
                        <div style={{fontSize:13,fontWeight:800,color:s.color}}>{s.val}</div>
                        <div style={{fontSize:7,color:"#9ca3af",marginTop:1}}>{s.label}</div>
                      </div>)}
                    </div>}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <div style={{fontSize:9}}><span style={{color:"#22c55e",fontWeight:600}}>Best counts:</span> <span style={{color:"#9ca3af"}}>{p.bestCounts.join(", ")}</span></div>
                      <div style={{fontSize:9}}><span style={{color:"#ef4444",fontWeight:600}}>Worst counts:</span> <span style={{color:"#9ca3af"}}>{p.worstCounts.join(", ")}</span></div>
                    </div>
                    {p.tunnelsWith&&vocabTier>=4&&<div style={{marginTop:6,fontSize:9,color:"#93c5fd"}}>Tunnels with: {types[p.tunnelsWith]?.name||p.tunnelsWith} — identical release point, different movement.</div>}
                  </div>;
                })()}
                {/* Eye Level Principle */}
                {vocabTier>=3&&!seqMode&&<div style={{background:"rgba(168,85,247,.05)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#a855f7",marginBottom:3}}>Eye Level Principle</div>
                  <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5,marginBottom:4}}>{elp.rule}</div>
                  <div style={{fontSize:9,color:"#c4b5fd",fontStyle:"italic"}}>{elp.data}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:2,marginTop:4}}>
                    {elp.examples.map((ex,i)=><div key={i} style={{fontSize:8,color:"#9ca3af"}}>• {ex}</div>)}
                  </div>
                </div>}
                {/* Catcher Framing (Pro/advanced) */}
                {vocabTier>=4&&!seqMode&&<div style={{background:"rgba(6,182,212,.05)",border:"1px solid rgba(6,182,212,.12)",borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#06b6d4",marginBottom:3}}>Catcher Framing</div>
                  <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5}}>{cfv.teachingPoint}</div>
                  <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                    <div style={{fontSize:8,color:"#22c55e"}}>Elite: +{cfv.eliteFramer} runs/season</div>
                    <div style={{fontSize:8,color:"#ef4444"}}>Poor: {cfv.poorFramer} runs/season</div>
                    <div style={{fontSize:8,color:"#9ca3af"}}>Per pitch: {cfv.perPitchValue} runs</div>
                  </div>
                  <div style={{fontSize:8,color:"#67e8f9",marginTop:3}}>Best framing counts: {cfv.highValueCounts.join(", ")}</div>
                </div>}
                {/* Run value leaderboard */}
                {vocabTier>=3&&!seqMode&&<div style={{marginTop:10}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontWeight:700}}>Run Value Leaderboard (best to worst)</div>
                  {[...allPitches].sort((a,b)=>a[1].rv100-b[1].rv100).map(([k,p])=><div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <div style={{width:80,fontSize:9,color:"#d1d5db",fontWeight:600}}>{p.name.split("/")[0].split("(")[0].trim()}</div>
                    <div style={{flex:1,height:6,background:"rgba(255,255,255,.04)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.max(5,50+p.rv100*25)}%`,background:rvColor(p.rv100),borderRadius:3}}/>
                    </div>
                    <div style={{fontSize:9,fontWeight:700,color:rvColor(p.rv100),width:30,textAlign:"right"}}>{p.rv100>0?"+":""}{p.rv100}</div>
                  </div>)}
                </div>}
                {/* A8: Empty-state prompt + B4: Test Yourself + B3: Cross-links */}
                {!selPitch&&!seqMode&&<div style={{textAlign:"center",padding:"8px 12px",background:"rgba(239,68,68,.04)",borderRadius:10,border:"1px solid rgba(239,68,68,.08)",marginTop:8}}>
                  <div style={{fontSize:10,color:"#fca5a5"}}>{isYoung?"Tap a pitch to learn about it!":"Tap a pitch card for details, or try the sequencing builder to call your own game."}</div>
                </div>}
                {vocabTier>=3&&<div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8}}>
                  <button onClick={()=>navigateBrain("counts")} style={{background:"none",border:"none",color:"#3b82f6",fontSize:9,cursor:"pointer",textDecoration:"underline"}}>What pitch on each count? →</button>
                  {activeTab.concept&&<button onClick={()=>launchQuizFromBrain(activeTab.concept)} style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:6,padding:"5px 12px",fontSize:9,color:"#22c55e",fontWeight:600,cursor:"pointer"}}>Test Yourself →</button>}
                </div>}
              </div>;
            })()}

            {/* STEAL CALCULATOR TAB */}
            {brainTab==="steal"&&(()=>{
              const sw=BRAIN.stats.stealWindow;
              const be=BRAIN.stats.stealBreakEven;
              const pk=BRAIN.stats.pickoffSuccess;
              const pcv=BRAIN.stats.pitchClockViolations;
              const deliveryTime=stealDelivery,setDeliveryTime=setStealDelivery;
              const popTime2=stealPop,setPopTime2=setStealPop;
              const runnerTime=stealRunner,setRunnerTime=setStealRunner;
              const effectiveDT=showPitchClock?deliveryTime:deliveryTime-sw.pitchClockEffect;
              const throwTime=effectiveDT+popTime2;
              const margin=throwTime-runnerTime;
              const verdict=margin>0.30?"Easy steal":margin>0.15?"Marginal":"Tough — likely out";
              const verdictColor=margin>0.30?"#22c55e":margin>0.15?"#f59e0b":"#ef4444";
              const beRate=be[stealOuts]||0.72;
              const estSuccess=Math.max(0,Math.min(100,Math.round(50+margin*200)));
              const Slider=({label,value,onChange,min,max,step,labels})=><div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#9ca3af",marginBottom:2}}>
                  <span>{label}</span><span style={{color:"#d1d5db",fontWeight:700}}>{value.toFixed(2)}s</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{width:"100%",accentColor:verdictColor}}/>
                {labels&&<div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#6b7280"}}>
                  {labels.map((l,i)=><span key={i}>{l}</span>)}
                </div>}
              </div>;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#f97316",letterSpacing:1,marginBottom:10}}>STEAL CALCULATOR</div>
                {/* Sliders */}
                <Slider label={isYoung?"How fast does the pitcher throw home?":"Pitcher Delivery Time"} value={deliveryTime} onChange={setDeliveryTime} min={1.15} max={1.60} step={0.05} labels={["Quick (1.20s)","Average (1.35s)","Slow (1.55s)"]}/>
                <Slider label={isYoung?"How fast can the catcher throw?":"Catcher Pop Time"} value={popTime2} onChange={setPopTime2} min={1.80} max={2.20} step={0.05} labels={["Elite (1.85s)","Average (2.00s)","Slow (2.15s)"]}/>
                <Slider label={isYoung?"How fast is the runner?":"Runner Speed to 2B"} value={runnerTime} onChange={setRunnerTime} min={3.20} max={3.85} step={0.05} labels={["Elite (3.30s)","Average (3.55s)","Slow (3.80s)"]}/>
                {/* Race visualization */}
                <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,padding:"10px",border:"1px solid rgba(255,255,255,.06)",marginBottom:10}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:700}}>The Race</div>
                  <svg viewBox="0 0 300 60" width="100%" height="60">
                    {/* Ball track */}
                    <text x="2" y="12" fill="#9ca3af" fontSize="7">Ball</text>
                    <rect x="30" y="6" width="260" height="12" rx="3" fill="rgba(255,255,255,.04)"/>
                    <rect x="30" y="6" width={Math.min(260,260*(throwTime/4.0))} height="12" rx="3" fill="rgba(239,68,68,.3)"/>
                    <text x={Math.min(285,30+260*(throwTime/4.0))} y="15" fill="#fca5a5" fontSize="7" textAnchor="end">{throwTime.toFixed(2)}s</text>
                    {/* Runner track */}
                    <text x="2" y="42" fill="#9ca3af" fontSize="7">Runner</text>
                    <rect x="30" y="36" width="260" height="12" rx="3" fill="rgba(255,255,255,.04)"/>
                    <rect x="30" y="36" width={Math.min(260,260*(runnerTime/4.0))} height="12" rx="3" fill={`${verdictColor}50`}/>
                    <text x={Math.min(285,30+260*(runnerTime/4.0))} y="45" fill={verdictColor} fontSize="7" textAnchor="end">{runnerTime.toFixed(2)}s</text>
                    {/* Finish line */}
                    <line x1="290" y1="2" x2="290" y2="52" stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="2,2"/>
                  </svg>
                  <div style={{textAlign:"center",marginTop:4}}>
                    <div style={{fontSize:18,fontWeight:900,color:verdictColor}}>{isYoung?(margin>0.15?"SAFE!":"OUT!"):verdict}</div>
                    {!isYoung&&<div style={{fontSize:10,color:"#9ca3af"}}>Margin: {margin>=0?"+":""}{margin.toFixed(2)}s · Estimated success: ~{estSuccess}%</div>}
                  </div>
                </div>
                {/* Outs selector for break-even */}
                {vocabTier>=3&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:10,color:"#9ca3af"}}>Outs:</span>
                  {[0,1,2].map(o=><button key={o} onClick={()=>setStealOuts(o)} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:stealOuts===o?"rgba(247,150,22,.15)":"rgba(255,255,255,.03)",border:`1px solid ${stealOuts===o?"rgba(247,150,22,.3)":"rgba(255,255,255,.06)"}`,color:stealOuts===o?"#f97316":"#6b7280",cursor:"pointer"}}>{o}</button>)}
                  <span style={{fontSize:9,color:"#f97316",fontWeight:600}}>Break-even: {Math.round(beRate*100)}%</span>
                  <span style={{fontSize:9,color:estSuccess>=beRate*100?"#22c55e":"#ef4444",fontWeight:600}}>{estSuccess>=beRate*100?"Worth it":"Not worth it"}</span>
                </div>}
                {/* Pitch clock toggle */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                  <button onClick={()=>setShowPitchClock(!showPitchClock)} style={{background:showPitchClock?"rgba(168,85,247,.15)":"rgba(255,255,255,.03)",border:`1px solid ${showPitchClock?"rgba(168,85,247,.3)":"rgba(255,255,255,.08)"}`,borderRadius:8,padding:"4px 10px",fontSize:9,fontWeight:600,color:showPitchClock?"#a855f7":"#6b7280",cursor:"pointer"}}>Pitch Clock: {showPitchClock?"ON (2023+)":"OFF (pre-2023)"}</button>
                  <span style={{fontSize:8,color:"#9ca3af"}}>Clock shaves {Math.abs(sw.pitchClockEffect)}s off delivery</span>
                </div>
                {/* Presets */}
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                  {[
                    {label:"MLB Average",d:sw.deliveryTime.average,p:sw.popTime.average,r:sw.runnerTime.average},
                    {label:"Easy Steal",d:sw.deliveryTime.slow,p:sw.popTime.slow,r:sw.runnerTime.elite},
                    {label:"No Chance",d:sw.deliveryTime.quick,p:sw.popTime.elite,r:sw.runnerTime.slow},
                    {label:"Youth League",d:1.50,p:2.10,r:3.65},
                  ].map(pr=><button key={pr.label} onClick={()=>{setDeliveryTime(pr.d);setPopTime2(pr.p);setRunnerTime(pr.r);}} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:6,padding:"3px 8px",fontSize:8,color:"#9ca3af",cursor:"pointer"}}>{pr.label}</button>)}
                </div>
                {/* Pickoff risk panel */}
                <div style={{background:"rgba(247,150,22,.04)",border:"1px solid rgba(247,150,22,.1)",borderRadius:10,padding:"8px 10px",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#f97316",marginBottom:3}}>Pickoff Risk</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:9}}>
                    <span style={{color:"#9ca3af"}}>Blind throw: <strong style={{color:"#ef4444"}}>{Math.round(pk.blindThrow*100)}%</strong></span>
                    <span style={{color:"#9ca3af"}}>Read throw: <strong style={{color:"#f59e0b"}}>{Math.round(pk.readThrow*100)}%</strong></span>
                    <span style={{color:"#9ca3af"}}>Daylight: <strong style={{color:"#22c55e"}}>{Math.round(pk.daylightPlay*100)}%</strong></span>
                  </div>
                  {vocabTier>=3&&<div style={{fontSize:8,color:"#9ca3af",marginTop:3}}>Post-pitch-clock: only 2 free pickoff attempts per at-bat. 3rd attempt that fails = BALK. Violation rate dropped from {(pcv.pitcherRate*100).toFixed(1)}% (2023) to {(pcv.pitcherRate2024*100).toFixed(1)}% (2024).</div>}
                </div>
                {/* B3+B4: Cross-links + Test Yourself */}
                <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8}}>
                  <button onClick={()=>navigateBrain("re24",{runners:[1],outs:0})} style={{background:"none",border:"none",color:"#22c55e",fontSize:9,cursor:"pointer",textDecoration:"underline"}}>See RE24 break-even math →</button>
                  {activeTab.concept&&<button onClick={()=>launchQuizFromBrain(activeTab.concept)} style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:6,padding:"5px 12px",fontSize:9,color:"#22c55e",fontWeight:600,cursor:"pointer"}}>Test Yourself →</button>}
                </div>
              </div>;
            })()}

            {/* CONCEPT MAP TAB */}
            {brainTab==="concepts"&&(()=>{
              const concepts=BRAIN.concepts;
              const conceptEntries=Object.entries(concepts);
              const domains=[...new Set(conceptEntries.map(([,c])=>c.domain))].sort();
              const domainColors={defense:"#3b82f6",baserunning:"#22c55e",pitching:"#ef4444",hitting:"#f59e0b",strategy:"#a855f7",rules:"#6b7280",mental:"#06b6d4",catching:"#ec4899"};
              const getMastery=(tag)=>{const m=stats.masteryData?.concepts?.[tag];if(!m)return"unseen";return m.state||"unseen";};
              const masteryIcon={unseen:"🔒",introduced:"👁",learning:"📖",mastered:"⭐",degraded:"⚠️"};
              const masteryColor={unseen:"#4b5563",introduced:"#6b7280",learning:"#3b82f6",mastered:"#22c55e",degraded:"#f59e0b"};
              const filtered=domainFilter?conceptEntries.filter(([,c])=>c.domain===domainFilter):conceptEntries;
              const ageFiltered=filtered.filter(([,c])=>!c.ageMin||ageNum>=c.ageMin);
              // Progress stats
              const totalConcepts=conceptEntries.length;
              const masteredCount=conceptEntries.filter(([k])=>getMastery(k)==="mastered").length;
              const learningCount=conceptEntries.filter(([k])=>getMastery(k)==="learning").length;
              const degradedCount=conceptEntries.filter(([k])=>getMastery(k)==="degraded").length;
              const readyToLearn=conceptEntries.filter(([k,c])=>{const st=getMastery(k);if(st!=="unseen")return false;if(c.ageMin&&ageNum<c.ageMin)return false;if(!c.prereqs||c.prereqs.length===0)return true;return c.prereqs.every(p=>getMastery(p)==="mastered");}).length;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#a855f7",letterSpacing:1,marginBottom:8}}>CONCEPT MAP</div>
                {/* Progress dashboard */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
                  {[
                    {v:masteredCount,l:"Mastered",c:"#22c55e",icon:"⭐"},
                    {v:learningCount,l:"Learning",c:"#3b82f6",icon:"📖"},
                    {v:degradedCount,l:"Review",c:"#f59e0b",icon:"⚠️"},
                    {v:readyToLearn,l:"Ready",c:"#a855f7",icon:"🔓"},
                  ].map((s,i)=><div key={i} style={{textAlign:"center",background:"rgba(255,255,255,.02)",border:`1px solid ${s.c}15`,borderRadius:10,padding:"6px 4px"}}>
                    <div style={{fontSize:14}}>{s.icon}</div>
                    <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:7,color:"#9ca3af"}}>{s.l}</div>
                  </div>)}
                </div>
                <div style={{textAlign:"center",marginBottom:8}}>
                  <div style={{fontSize:10,color:"#9ca3af"}}>{masteredCount} / {totalConcepts} concepts mastered</div>
                  <div style={{height:4,background:"rgba(255,255,255,.04)",borderRadius:2,overflow:"hidden",marginTop:3,maxWidth:200,margin:"3px auto 0"}}>
                    <div style={{height:"100%",width:`${(masteredCount/totalConcepts)*100}%`,background:"linear-gradient(90deg,#a855f7,#22c55e)",borderRadius:2}}/>
                  </div>
                </div>
                {/* Domain filter */}
                <div style={{display:"flex",gap:3,overflowX:"auto",marginBottom:10,paddingBottom:4}}>
                  <button onClick={()=>setDomainFilter(null)} style={{flexShrink:0,padding:"3px 8px",borderRadius:6,fontSize:9,fontWeight:600,background:!domainFilter?"rgba(168,85,247,.15)":"rgba(255,255,255,.02)",border:`1px solid ${!domainFilter?"rgba(168,85,247,.3)":"rgba(255,255,255,.06)"}`,color:!domainFilter?"#a855f7":"#6b7280",cursor:"pointer"}}>All</button>
                  {domains.map(d=><button key={d} onClick={()=>setDomainFilter(domainFilter===d?null:d)} style={{flexShrink:0,padding:"3px 8px",borderRadius:6,fontSize:9,fontWeight:600,background:domainFilter===d?`${domainColors[d]||"#6b7280"}15`:"rgba(255,255,255,.02)",border:`1px solid ${domainFilter===d?`${domainColors[d]||"#6b7280"}30`:"rgba(255,255,255,.06)"}`,color:domainFilter===d?domainColors[d]||"#6b7280":"#6b7280",cursor:"pointer",textTransform:"capitalize"}}>{d}</button>)}
                </div>
                {/* Concept list */}
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {ageFiltered.map(([tag,c])=>{
                    const st=getMastery(tag);const mc=masteryColor[st];const mi=masteryIcon[st];
                    const sel=selConcept===tag;
                    const dc=domainColors[c.domain]||"#6b7280";
                    const prereqsMet=!c.prereqs||c.prereqs.length===0||c.prereqs.every(p=>getMastery(p)==="mastered");
                    return <div key={tag}>
                      <button onClick={()=>setSelConcept(sel?null:tag)} style={{width:"100%",display:"flex",alignItems:"center",gap:6,background:sel?`${mc}10`:"rgba(255,255,255,.01)",border:`1px solid ${sel?`${mc}25`:"rgba(255,255,255,.04)"}`,borderRadius:8,padding:"6px 8px",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                        <span style={{fontSize:12,flexShrink:0}}>{mi}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10,fontWeight:600,color:mc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isYoung?(CONCEPT_KIDS?.[tag]||c.name):c.name}</div>
                          <div style={{fontSize:7,color:dc,textTransform:"capitalize"}}>{c.domain} · diff {c.diff}</div>
                        </div>
                        {!prereqsMet&&st==="unseen"&&<span style={{fontSize:8,color:"#6b7280"}}>🔒</span>}
                      </button>
                      {/* Detail panel */}
                      {sel&&<div style={{background:`${mc}08`,border:`1px solid ${mc}15`,borderRadius:8,padding:"8px 10px",marginTop:2,marginBottom:2}}>
                        <div style={{fontSize:9,color:"#d1d5db",marginBottom:4}}>
                          <strong>Domain:</strong> <span style={{color:dc,textTransform:"capitalize"}}>{c.domain}</span>
                          {" · "}<strong>Difficulty:</strong> {"⭐".repeat(c.diff)}
                          {c.ageMin&&<>{" · "}<strong>Min age:</strong> {c.ageMin}</>}
                        </div>
                        {c.prereqs&&c.prereqs.length>0&&<div style={{fontSize:9,color:"#9ca3af",marginBottom:4}}>
                          <strong>Prerequisites:</strong> {c.prereqs.map(p=><span key={p} style={{color:getMastery(p)==="mastered"?"#22c55e":"#ef4444",marginLeft:3}}>{getMastery(p)==="mastered"?"✓":"✗"} {concepts[p]?.name||p}</span>)}
                        </div>}
                        <div style={{display:"flex",gap:4,marginTop:4}}>
                          <div style={{fontSize:9,background:`${mc}15`,borderRadius:4,padding:"2px 6px",color:mc,fontWeight:600}}>{st}</div>
                          {st!=="mastered"&&prereqsMet&&<button onClick={()=>{const scens=Object.values(SCENARIOS).flat().filter(s=>s.conceptTag===tag||s.concept?.toLowerCase().includes(tag.replace(/-/g," ")));if(scens.length>0){const s=scens[Math.floor(Math.random()*scens.length)];setPos(s._pos||Object.entries(SCENARIOS).find(([,arr])=>arr.includes(s))?.[0]||"batter");setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);setScreen("play");}}} style={{fontSize:9,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",borderRadius:4,padding:"2px 8px",color:"#a855f7",fontWeight:600,cursor:"pointer"}}>Practice This →</button>}
                        </div>
                      </div>}
                    </div>;
                  })}
                </div>
              </div>;
            })()}

            {/* PITCH COUNT TRACKER TAB */}
            {brainTab==="pitchcount"&&(()=>{
              const pct=BRAIN.stats.pitchCountThresholds;
              const pcm=BRAIN.stats.matchupMatrix.pitchCountMatrix;
              const ageKey=ageNum<=8?"7-8":ageNum<=10?"9-10":ageNum<=12?"11-12":ageNum<=14?"13-14":ageNum<=16?"15-16":"17-18";
              const youthLimit=pct.youthByAge[ageKey]||85;
              const pcBucket=pcCount<=25?"0-25":pcCount<=50?"26-50":pcCount<=75?"51-75":pcCount<=90?"76-90":pcCount<=100?"91-100":"100+";
              const veloDrop=pct.velocityDrop[pcBucket]||0;
              const eraInc=pct.eraIncrease[pcBucket.replace("0-50","0-75").replace("26-50","0-75").replace("51-75","0-75")]||0;
              const fatWoba=pcm[pcBucket]?.[`tto${pcTTO}`]||0.310;
              const zoneColor=pcCount<=50?"#22c55e":pcCount<=75?"#86efac":pcCount<=90?"#f59e0b":pcCount<=100?"#f97316":"#ef4444";
              const zoneLabel=pcCount<=50?"Fresh":pcCount<=75?"Strong":pcCount<=90?"Fading":pcCount<=100?"Tired":"Danger Zone";
              const restDays=pcCount<=25?0:pcCount<=50?1:pcCount<=65?2:pcCount<=85?3:4;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#eab308",letterSpacing:1,marginBottom:10}}>PITCH COUNT TRACKER</div>
                {/* Gauge */}
                <div style={{textAlign:"center",marginBottom:12}}>
                  <div style={{fontSize:42,fontWeight:900,color:zoneColor}}>{pcCount}</div>
                  <div style={{fontSize:12,fontWeight:700,color:zoneColor}}>{zoneLabel}</div>
                  <input type="range" min={0} max={120} value={pcCount} onChange={e=>setPcCount(parseInt(e.target.value))} style={{width:"80%",accentColor:zoneColor,marginTop:6}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#6b7280",width:"80%",margin:"0 auto"}}>
                    <span>0</span><span>50</span><span>75</span><span>90</span><span>100</span><span>120</span>
                  </div>
                </div>
                {/* Stats row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                  <div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:10,padding:"6px 4px"}}>
                    <div style={{fontSize:16,fontWeight:800,color:veloDrop>1?"#ef4444":"#d1d5db"}}>-{veloDrop.toFixed(1)}</div>
                    <div style={{fontSize:7,color:"#9ca3af"}}>MPH drop</div>
                  </div>
                  {vocabTier>=3&&<div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:10,padding:"6px 4px"}}>
                    <div style={{fontSize:16,fontWeight:800,color:fatWoba>0.340?"#ef4444":"#d1d5db"}}>.{Math.round(fatWoba*1000)}</div>
                    <div style={{fontSize:7,color:"#9ca3af"}}>wOBA (TTO {pcTTO})</div>
                  </div>}
                  <div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:10,padding:"6px 4px"}}>
                    <div style={{fontSize:16,fontWeight:800,color:restDays>=3?"#f59e0b":"#d1d5db"}}>{restDays}</div>
                    <div style={{fontSize:7,color:"#9ca3af"}}>Rest days</div>
                  </div>
                </div>
                {/* TTO selector */}
                {vocabTier>=3&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                  <span style={{fontSize:10,color:"#9ca3af"}}>Times Through Order:</span>
                  {[1,2,3].map(t=><button key={t} onClick={()=>setPcTTO(t)} style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:pcTTO===t?"rgba(234,179,8,.15)":"rgba(255,255,255,.03)",border:`1px solid ${pcTTO===t?"rgba(234,179,8,.3)":"rgba(255,255,255,.06)"}`,color:pcTTO===t?"#eab308":"#6b7280",cursor:"pointer"}}>{t}{t===1?"st":t===2?"nd":"rd"}</button>)}
                </div>}
                {/* Youth limits */}
                <div style={{background:"rgba(234,179,8,.05)",border:"1px solid rgba(234,179,8,.1)",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#eab308",marginBottom:4}}>{isYoung?"Your Pitch Limit":"Youth Pitch Limits"}</div>
                  {isYoung?<div style={{fontSize:11,color:"#d1d5db"}}>Your arm can throw <strong style={{color:"#eab308"}}>{youthLimit} pitches</strong> per game. {pcCount>youthLimit?<span style={{color:"#ef4444"}}>You're over your limit!</span>:pcCount>youthLimit*0.8?<span style={{color:"#f59e0b"}}>Getting close to your limit!</span>:<span style={{color:"#22c55e"}}>You're in the green zone.</span>}</div>
                  :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>
                    {Object.entries(pct.youthByAge).map(([age,limit])=><div key={age} style={{textAlign:"center",background:age===ageKey?"rgba(234,179,8,.1)":"rgba(0,0,0,.2)",border:`1px solid ${age===ageKey?"rgba(234,179,8,.3)":"rgba(255,255,255,.04)"}`,borderRadius:6,padding:"4px"}}>
                      <div style={{fontSize:9,color:age===ageKey?"#eab308":"#9ca3af",fontWeight:age===ageKey?700:400}}>{age}</div>
                      <div style={{fontSize:12,fontWeight:700,color:age===ageKey?"#eab308":"#d1d5db"}}>{limit}</div>
                    </div>)}
                  </div>}
                </div>
                {activeTab.concept&&<div style={{textAlign:"center",marginTop:8}}><button onClick={()=>launchQuizFromBrain(activeTab.concept)} style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:6,padding:"5px 12px",fontSize:9,color:"#22c55e",fontWeight:600,cursor:"pointer"}}>Test Yourself →</button></div>}
              </div>;
            })()}

            {/* WIN PROBABILITY TAB */}
            {brainTab==="winprob"&&(()=>{
              const wp=BRAIN.stats.winProbability;
              const innings=[1,3,6,7,8,9];
              const diffs=["-3","-2","-1","0","+1","+2","+3"];
              const getWP=(inn,diff)=>{const closest=innings.reduce((a,b)=>Math.abs(b-inn)<Math.abs(a-inn)?b:a);return wp.byInningScore[closest]?.[String(diff>=0?"+"+diff:diff)]||0.50;};
              const curWP=getWP(wpInning,wpDiff);
              const li=wp.leverageIndex.byInning[wpInning]||1.0;
              return <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#06b6d4",letterSpacing:1}}>WIN PROBABILITY</div>
                  {vocabTier>=4&&<button onClick={()=>setShowDivergence(!showDivergence)} style={{fontSize:9,padding:"4px 8px",borderRadius:6,background:showDivergence?"rgba(6,182,212,.15)":"rgba(255,255,255,.03)",border:`1px solid ${showDivergence?"rgba(6,182,212,.3)":"rgba(255,255,255,.08)"}`,color:showDivergence?"#06b6d4":"#6b7280",cursor:"pointer",fontWeight:600}}>RE24 vs WP</button>}
                </div>
                {/* WP display */}
                <div style={{textAlign:"center",marginBottom:12}}>
                  <div style={{fontSize:10,color:"#9ca3af",marginBottom:2}}>{isYoung?"How likely is your team to win?":"Win Probability"}</div>
                  <div style={{fontSize:48,fontWeight:900,color:curWP>0.6?"#22c55e":curWP>0.4?"#f59e0b":"#ef4444"}}>{isYoung?(curWP>0.6?"😊":curWP>0.4?"😐":"😰"):Math.round(curWP*100)+"%"}</div>
                  {!isYoung&&<div style={{fontSize:10,color:"#9ca3af"}}>Leverage Index: {li.toFixed(1)}x — {li>=1.5?"Every decision matters "+li.toFixed(1)+"x more!":li>=1.0?"Normal pressure":"Low-impact situation"}</div>}
                </div>
                {/* Inning selector */}
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:9,color:"#9ca3af",marginBottom:3}}>Inning:</div>
                  <div style={{display:"flex",gap:3}}>
                    {[1,2,3,4,5,6,7,8,9].map(i=><button key={i} onClick={()=>setWpInning(i)} style={{flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:wpInning===i?700:400,background:wpInning===i?"rgba(6,182,212,.15)":"rgba(255,255,255,.02)",border:`1px solid ${wpInning===i?"rgba(6,182,212,.3)":"rgba(255,255,255,.06)"}`,color:wpInning===i?"#06b6d4":"#6b7280",cursor:"pointer"}}>{i}</button>)}
                  </div>
                </div>
                {/* Score diff selector */}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:9,color:"#9ca3af",marginBottom:3}}>Score Differential:</div>
                  <div style={{display:"flex",gap:3}}>
                    {[-3,-2,-1,0,1,2,3].map(d=><button key={d} onClick={()=>setWpDiff(d)} style={{flex:1,padding:"4px 0",borderRadius:6,fontSize:9,fontWeight:wpDiff===d?700:400,background:wpDiff===d?(d>0?"rgba(34,197,94,.15)":d<0?"rgba(239,68,68,.15)":"rgba(245,158,11,.15)"):"rgba(255,255,255,.02)",border:`1px solid ${wpDiff===d?(d>0?"rgba(34,197,94,.3)":d<0?"rgba(239,68,68,.3)":"rgba(245,158,11,.3)"):"rgba(255,255,255,.06)"}`,color:wpDiff===d?(d>0?"#22c55e":d<0?"#ef4444":"#f59e0b"):"#6b7280",cursor:"pointer"}}>{d>0?"+"+d:d}</button>)}
                  </div>
                </div>
                {/* WP across innings for selected diff */}
                {vocabTier>=3&&<div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontWeight:700}}>WP Across Innings ({wpDiff>=0?"+":""}{wpDiff} runs)</div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:4,height:100}}>
                    {innings.map(inn=>{const v=getWP(inn,wpDiff);return <div key={inn} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:8,color:v>0.5?"#22c55e":"#ef4444",fontWeight:600,marginBottom:2}}>{Math.round(v*100)}%</div>
                      <div style={{height:`${v*80}px`,background:`linear-gradient(to top,${v>0.5?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"},${v>0.5?"rgba(34,197,94,.6)":"rgba(239,68,68,.6)"})`,borderRadius:"4px 4px 0 0",transition:"height .3s"}}/>
                      <div style={{fontSize:7,color:inn===wpInning?"#06b6d4":"#6b7280",fontWeight:inn===wpInning?700:400,marginTop:2}}>Inn {inn}</div>
                    </div>;})}
                  </div>
                </div>}
                {/* LI by inning */}
                {vocabTier>=3&&<div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontWeight:700}}>Leverage Index by Inning</div>
                  <div style={{display:"flex",gap:3}}>
                    {Object.entries(wp.leverageIndex.byInning).map(([inn,lv])=><div key={inn} style={{flex:1,textAlign:"center",background:Number(inn)===wpInning?"rgba(6,182,212,.1)":"rgba(0,0,0,.2)",borderRadius:6,padding:"4px 2px",border:Number(inn)===wpInning?"1px solid rgba(6,182,212,.3)":"1px solid rgba(255,255,255,.04)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:lv>=1.5?"#06b6d4":lv>=1.0?"#d1d5db":"#6b7280"}}>{lv.toFixed(1)}x</div>
                      <div style={{fontSize:7,color:"#6b7280"}}>{inn}</div>
                    </div>)}
                  </div>
                </div>}
                {/* RE24 vs WP divergence */}
                {showDivergence&&<div style={{background:"rgba(6,182,212,.04)",border:"1px solid rgba(6,182,212,.12)",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#06b6d4",marginBottom:6}}>When RE24 and WP Disagree</div>
                  <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.6,marginBottom:6}}>{wp.concept.keyInsight}</div>
                  {[wp.reDivergence.buntJustified,wp.reDivergence.ibbJustified,wp.reDivergence.playForOneRun].map((d,i)=><div key={i} style={{background:"rgba(0,0,0,.2)",borderRadius:8,padding:"6px 8px",marginBottom:4}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#67e8f9"}}>{d.description}</div>
                    {d.conditions&&<div style={{fontSize:8,color:"#9ca3af",marginTop:2}}>{d.conditions.join(" + ")}</div>}
                    {d.wpGain&&<div style={{fontSize:8,color:"#22c55e",marginTop:1}}>WP gain: {d.wpGain}</div>}
                  </div>)}
                </div>}
                {/* Clutch myth */}
                {vocabTier>=4&&<div style={{background:"rgba(168,85,247,.04)",border:"1px solid rgba(168,85,247,.1)",borderRadius:10,padding:"8px 10px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#a855f7",marginBottom:3}}>Does Clutch Hitting Exist?</div>
                  <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5}}>{wp.clutch.explanation}</div>
                  <div style={{fontSize:8,color:"#c4b5fd",marginTop:3,fontStyle:"italic"}}>{wp.clutch.teachingPoint}</div>
                </div>}
                {activeTab.concept&&<div style={{textAlign:"center",marginTop:8}}><button onClick={()=>launchQuizFromBrain(activeTab.concept)} style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:6,padding:"5px 12px",fontSize:9,color:"#22c55e",fontWeight:600,cursor:"pointer"}}>Test Yourself →</button></div>}
              </div>;
            })()}

            {/* MATCHUP ANALYZER TAB */}
            {brainTab==="matchup"&&(()=>{
              const mm=BRAIN.stats.matchupMatrix;
              const md=getMatchupData(mPitcher,mBatter==="S"?"L":mBatter,mTTO,mPC);
              const dangerColor=md.adjustedBA>=0.300?"#ef4444":md.adjustedBA>=0.280?"#f59e0b":md.adjustedBA>=0.260?"#f59e0b":"#22c55e";
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#ec4899",letterSpacing:1,marginBottom:10}}>MATCHUP ANALYZER</div>
                {/* Controls */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:3}}>Pitcher Hand</div>
                    <div style={{display:"flex",gap:3}}>{["L","R"].map(h=><button key={h} onClick={()=>setMPitcher(h)} style={{flex:1,padding:"6px",borderRadius:8,fontSize:11,fontWeight:700,background:mPitcher===h?"rgba(236,72,153,.15)":"rgba(255,255,255,.03)",border:`1px solid ${mPitcher===h?"rgba(236,72,153,.3)":"rgba(255,255,255,.06)"}`,color:mPitcher===h?"#ec4899":"#6b7280",cursor:"pointer"}}>{h}HP</button>)}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:3}}>Batter Hand</div>
                    <div style={{display:"flex",gap:3}}>{["L","R","S"].map(h=><button key={h} onClick={()=>setMBatter(h)} style={{flex:1,padding:"6px",borderRadius:8,fontSize:11,fontWeight:700,background:mBatter===h?"rgba(236,72,153,.15)":"rgba(255,255,255,.03)",border:`1px solid ${mBatter===h?"rgba(236,72,153,.3)":"rgba(255,255,255,.06)"}`,color:mBatter===h?"#ec4899":"#6b7280",cursor:"pointer"}}>{h==="S"?"Switch":h+"HB"}</button>)}</div>
                  </div>
                </div>
                {vocabTier>=3&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:3}}>Times Through Order <span style={{fontSize:7,color:"#6b7280"}}>(how many times this batter faced this pitcher)</span></div>
                    <div style={{display:"flex",gap:3}}>{[1,2,3].map(t=><button key={t} onClick={()=>setMTTO(t)} style={{flex:1,padding:"4px",borderRadius:6,fontSize:10,fontWeight:600,background:mTTO===t?"rgba(236,72,153,.15)":"rgba(255,255,255,.03)",border:`1px solid ${mTTO===t?"rgba(236,72,153,.3)":"rgba(255,255,255,.06)"}`,color:mTTO===t?"#ec4899":"#6b7280",cursor:"pointer"}}>{t}{t===1?"st":t===2?"nd":"rd"}</button>)}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:3}}>Pitch Count: {mPC}</div>
                    <input type="range" min={0} max={110} value={mPC} onChange={e=>setMPC(parseInt(e.target.value))} style={{width:"100%",accentColor:"#ec4899"}}/>
                  </div>
                </div>}
                {/* Matchup card */}
                <div style={{background:`${dangerColor}08`,border:`1.5px solid ${dangerColor}25`,borderRadius:14,padding:"14px",marginBottom:12,textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#9ca3af",marginBottom:2}}>Projected Batting Average</div>
                  <div style={{fontSize:40,fontWeight:900,color:dangerColor}}>.{Math.round(md.adjustedBA*1000)}</div>
                  <div style={{fontSize:11,fontWeight:600,color:dangerColor,marginBottom:6}}>{md.platoonEdge}</div>
                  <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.5}}>{md.recommendation}</div>
                </div>
                {/* Compound stacking bar */}
                {vocabTier>=3&&<div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:700}}>How Effects Stack</div>
                  {[
                    {label:"Baseline",ba:mm.platoon.sameHand.ba},
                    {label:mPitcher===mBatter?"Same hand":"Opposite hand",ba:md.baseBA},
                    {label:`${mTTO}${mTTO===1?"st":mTTO===2?"nd":"rd"} TTO`,ba:md.adjustedBA},
                    {label:`${mPC} pitches`,ba:md.fatigueWOBA*1.05},
                  ].map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <div style={{width:70,fontSize:9,color:"#9ca3af"}}>{s.label}</div>
                    <div style={{flex:1,height:8,background:"rgba(255,255,255,.04)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(s.ba/.400)*100}%`,background:s.ba>=0.300?"#ef4444":s.ba>=0.270?"#f59e0b":"#22c55e",borderRadius:4,transition:"width .3s"}}/>
                    </div>
                    <div style={{width:35,fontSize:9,fontWeight:700,color:s.ba>=0.300?"#ef4444":"#d1d5db",textAlign:"right"}}>.{Math.round(s.ba*1000)}</div>
                  </div>)}
                  <div style={{fontSize:8,color:"#9ca3af",marginTop:4,fontStyle:"italic"}}>Platoon + TTO + fatigue compound together. A tired pitcher facing the lineup for the 3rd time against opposite-hand hitters is in danger.</div>
                </div>}
                {/* Switch hitter insight */}
                {mBatter==="S"&&<div style={{background:"rgba(236,72,153,.05)",border:"1px solid rgba(236,72,153,.1)",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:"#ec4899",fontWeight:700}}>Switch Hitter Advantage</div>
                  <div style={{fontSize:9,color:"#d1d5db",marginTop:2}}>Switch hitters always bat opposite-hand, neutralizing the platoon advantage. BA: .{Math.round(mm.platoon.switchHitter.ba*1000)} regardless of pitcher hand.</div>
                </div>}
              </div>;
            })()}

            {/* PARK FACTOR EXPLORER TAB */}
            {brainTab==="park"&&(()=>{
              const pe=BRAIN.stats.parkAndEnvironment;
              const pf=pe.parkFactors;
              const parks=[
                {name:"Coors Field",factor:120,type:"hitters",city:"Denver"},
                {name:"Great American",factor:108,type:"hitters",city:"Cincinnati"},
                {name:"Fenway Park",factor:106,type:"hitters",city:"Boston"},
                {name:"Wrigley Field",factor:102,type:"neutral",city:"Chicago"},
                {name:"Dodger Stadium",factor:100,type:"neutral",city:"Los Angeles"},
                {name:"Petco Park",factor:95,type:"pitchers",city:"San Diego"},
                {name:"Oracle Park",factor:96,type:"pitchers",city:"San Francisco"},
                {name:"Tropicana Field",factor:97,type:"pitchers",city:"Tampa Bay"},
              ];
              // A6: Select individual parks, not by type
              const selParkIdx=typeof parkType==="number"?parkType:4;
              const selPark=parks[selParkIdx]||parks[4];
              const adj=selPark.type==="hitters"?pf.hitterspark:selPark.type==="pitchers"?pf.pitcherspark:null;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#84cc16",letterSpacing:1,marginBottom:10}}>PARK FACTOR EXPLORER</div>
                {/* Park cards — A6: individual park selection */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>
                  {parks.map((p,idx)=><button key={p.name} onClick={()=>{setParkType(idx);snd.play('tap');trackInteraction("park");}} style={{background:selParkIdx===idx?`${p.type==="hitters"?"rgba(239,68,68,.15)":p.type==="pitchers"?"rgba(59,130,246,.15)":"rgba(245,158,11,.15)"}`:"rgba(255,255,255,.02)",border:`1.5px solid ${selParkIdx===idx?"rgba(255,255,255,.2)":"rgba(255,255,255,.04)"}`,borderRadius:8,padding:"6px 3px",cursor:"pointer",textAlign:"center",minHeight:44}}>
                    <div style={{fontSize:16,fontWeight:900,color:p.type==="hitters"?"#ef4444":p.type==="pitchers"?"#3b82f6":"#f59e0b"}}>{p.factor}</div>
                    <div style={{fontSize:7,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  </button>)}
                </div>
                {/* Selected park info */}
                <div style={{background:"rgba(132,204,22,.04)",border:"1px solid rgba(132,204,22,.12)",borderRadius:12,padding:"10px 12px",marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#84cc16",marginBottom:2}}>{selPark.name} · {selPark.city}</div>
                  <div style={{fontSize:10,color:"#d1d5db",marginBottom:6}}>Park Factor: <strong style={{color:selPark.factor>105?"#ef4444":selPark.factor<96?"#3b82f6":"#f59e0b"}}>{selPark.factor}</strong> — {selPark.type==="hitters"?"Hitter-friendly: more runs score here":selPark.type==="pitchers"?"Pitcher-friendly: fewer runs score here":"Neutral park"}</div>
                  {adj&&vocabTier>=3&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                    {[
                      {label:"Steal value",val:adj.stealValueAdjust>0?"+"+adj.stealValueAdjust:adj.stealValueAdjust,color:adj.stealValueAdjust>0?"#22c55e":"#ef4444"},
                      {label:"Bunt cost",val:adj.buntCostAdjust>0?"+"+adj.buntCostAdjust:adj.buntCostAdjust,color:adj.buntCostAdjust>0?"#ef4444":"#22c55e"},
                      {label:"IBB risk",val:adj.ibbRiskAdjust>0?"+"+adj.ibbRiskAdjust:adj.ibbRiskAdjust,color:adj.ibbRiskAdjust>0?"#ef4444":"#22c55e"},
                    ].map((s,i)=><div key={i} style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:6,padding:"4px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:s.color}}>{s.val}</div>
                      <div style={{fontSize:7,color:"#9ca3af"}}>{s.label}</div>
                    </div>)}
                  </div>}
                </div>
                {/* Wind effects */}
                <div style={{background:"rgba(132,204,22,.03)",border:"1px solid rgba(132,204,22,.08)",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#84cc16",marginBottom:4}}>Wind Effects</div>
                  <div style={{display:"flex",gap:3,marginBottom:6}}>
                    {["out","in","cross"].map(d=><button key={d} onClick={()=>setWindDir(d)} style={{flex:1,padding:"4px",borderRadius:6,fontSize:9,fontWeight:600,background:windDir===d?"rgba(132,204,22,.15)":"rgba(255,255,255,.03)",border:`1px solid ${windDir===d?"rgba(132,204,22,.3)":"rgba(255,255,255,.06)"}`,color:windDir===d?"#84cc16":"#6b7280",cursor:"pointer",textTransform:"capitalize"}}>Wind {d}</button>)}
                  </div>
                  <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5}}>{pe.wind.pitcherAdjust[windDir==="out"?"windOut":windDir==="in"?"windIn":"windCross"]}</div>
                  {vocabTier>=3&&windDir!=="cross"&&<div style={{fontSize:8,color:"#9ca3af",marginTop:3}}>
                    OF depth adjustment at 15mph: {windDir==="out"?`+${pe.wind.depthAdjust.out_15mph} feet deeper`:`${pe.wind.depthAdjust.in_15mph} feet shallower`}
                  </div>}
                </div>
                {/* Surface effects */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                  {[{type:"Grass",data:pe.surface.grass,desc:"Standard speed"},{type:"Turf",data:pe.surface.turf,desc:`Grounders ${Math.round((pe.surface.turf.grounderSpeedFactor-1)*100)}% faster`}].map(s=><div key={s.type} style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#d1d5db"}}>{s.type}</div>
                    <div style={{fontSize:8,color:"#9ca3af"}}>{s.desc}</div>
                    {s.data.infieldDepthAdjust!==undefined&&s.data.infieldDepthAdjust!==0&&<div style={{fontSize:7,color:"#84cc16"}}>IF: +{s.data.infieldDepthAdjust}ft · OF: +{s.data.outfieldDepthAdjust}ft</div>}
                  </div>)}
                </div>
                {/* Altitude */}
                {vocabTier>=3&&<div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#d1d5db",marginBottom:3}}>Altitude Effect (Coors Field)</div>
                  <div style={{fontSize:9,color:"#9ca3af",lineHeight:1.5}}>{pe.temperature.altitude.coors.description}</div>
                  <div style={{display:"flex",gap:8,marginTop:3,fontSize:8}}>
                    <span style={{color:"#ef4444"}}>Carry: +{Math.round(pe.temperature.altitude.coors.carryBonus*100)}%</span>
                    <span style={{color:"#3b82f6"}}>Breaking ball: {Math.round(pe.temperature.altitude.coors.breakingBallPenalty*100)}%</span>
                  </div>
                </div>}
              </div>;
            })()}

            {/* DEFENSIVE POSITIONING SANDBOX TAB */}
            {brainTab==="defense"&&(()=>{
              const dp=BRAIN.stats.defensivePositioning;
              const ii=BRAIN.stats.infieldInRunImpact;
              const presets=[
                {id:"normal",label:"Normal",desc:dp.infieldDepth.normalDepth.description,gb:dp.infieldDepth.normalDepth.groundBallConversionRate,dpRate:dp.infieldDepth.normalDepth.doublePlayRate},
                {id:"dp",label:"DP Depth",desc:dp.infieldDepth.dpDepth.description,gb:dp.infieldDepth.dpDepth.groundBallConversionRate,dpRate:dp.infieldDepth.dpDepth.doublePlayRate},
                {id:"in",label:"Infield In",desc:dp.infieldDepth.infieldIn.description,gb:dp.infieldDepth.infieldIn.groundBallConversionRate,saves:dp.infieldDepth.infieldIn.runsSavedPerGame,costs:dp.infieldDepth.infieldIn.runsCostPerGame},
                {id:"lines",label:"Guard Lines",desc:dp.lineGuarding.description},
                {id:"shallow",label:"OF Shallow",desc:dp.outfieldDepth.shallowIn.description},
                {id:"deep",label:"OF Deep",desc:dp.outfieldDepth.deep.description},
              ];
              const sel=presets.find(p=>p.id===defPreset)||presets[0];
              const isInfieldIn=defPreset==="in";
              const justified=isInfieldIn&&defRunners.includes(3)&&defOuts<2;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#f59e0b",letterSpacing:1,marginBottom:10}}>DEFENSIVE POSITIONING</div>
                {/* Preset buttons */}
                <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
                  {presets.map(p=><button key={p.id} onClick={()=>setDefPreset(p.id)} style={{padding:"5px 10px",borderRadius:8,fontSize:9,fontWeight:600,background:defPreset===p.id?"rgba(245,158,11,.15)":"rgba(255,255,255,.03)",border:`1px solid ${defPreset===p.id?"rgba(245,158,11,.3)":"rgba(255,255,255,.06)"}`,color:defPreset===p.id?"#f59e0b":"#6b7280",cursor:"pointer"}}>{p.label}</button>)}
                </div>
                {/* Selected alignment info */}
                <div style={{background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",borderRadius:12,padding:"10px 12px",marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#f59e0b",marginBottom:4}}>{sel.label}</div>
                  <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.5,marginBottom:6}}>{sel.desc}</div>
                  {sel.gb!==undefined&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                    <div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"4px"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#d1d5db"}}>{Math.round(sel.gb*100)}%</div>
                      <div style={{fontSize:7,color:"#9ca3af"}}>GB conversion</div>
                    </div>
                    {sel.dpRate!==undefined&&<div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"4px"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#d1d5db"}}>{Math.round(sel.dpRate*100)}%</div>
                      <div style={{fontSize:7,color:"#9ca3af"}}>DP rate</div>
                    </div>}
                    {sel.saves!==undefined&&<>
                      <div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"4px"}}>
                        <div style={{fontSize:14,fontWeight:800,color:"#22c55e"}}>+{sel.saves}</div>
                        <div style={{fontSize:7,color:"#9ca3af"}}>Runs saved/gm</div>
                      </div>
                      <div style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:"4px"}}>
                        <div style={{fontSize:14,fontWeight:800,color:"#ef4444"}}>-{sel.costs}</div>
                        <div style={{fontSize:7,color:"#9ca3af"}}>Runs cost/gm</div>
                      </div>
                    </>}
                  </div>}
                </div>
                {/* Situation context for infield in */}
                {isInfieldIn&&vocabTier>=3&&<div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"#9ca3af",marginBottom:4,fontWeight:700}}>Set the situation:</div>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <div>
                      <div style={{fontSize:8,color:"#6b7280",marginBottom:2}}>Runners</div>
                      <div style={{display:"flex",gap:2}}>{[1,2,3].map(b=><button key={b} onClick={()=>setDefRunners(r=>r.includes(b)?r.filter(x=>x!==b):[...r,b])} style={{width:24,height:24,borderRadius:4,fontSize:9,fontWeight:700,background:defRunners.includes(b)?"rgba(34,197,94,.2)":"rgba(255,255,255,.03)",border:`1px solid ${defRunners.includes(b)?"rgba(34,197,94,.3)":"rgba(255,255,255,.06)"}`,color:defRunners.includes(b)?"#22c55e":"#6b7280",cursor:"pointer"}}>{b}B</button>)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:8,color:"#6b7280",marginBottom:2}}>Outs</div>
                      <div style={{display:"flex",gap:2}}>{[0,1,2].map(o=><button key={o} onClick={()=>setDefOuts(o)} style={{width:24,height:24,borderRadius:4,fontSize:9,fontWeight:700,background:defOuts===o?"rgba(239,68,68,.2)":"rgba(255,255,255,.03)",border:`1px solid ${defOuts===o?"rgba(239,68,68,.3)":"rgba(255,255,255,.06)"}`,color:defOuts===o?"#ef4444":"#6b7280",cursor:"pointer"}}>{o}</button>)}</div>
                    </div>
                  </div>
                  <div style={{background:justified?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)",border:`1px solid ${justified?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`,borderRadius:8,padding:"6px 8px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:justified?"#22c55e":"#ef4444"}}>{justified?"JUSTIFIED":"NOT JUSTIFIED"}</div>
                    <div style={{fontSize:8,color:"#9ca3af",marginTop:2}}>{justified?`R3, ${defOuts} out${defOuts!==1?"s":""} — the run matters. ${ii.justifiedWhen}.`:defOuts>=2?"2 outs — force play exists regardless of depth.":!defRunners.includes(3)?"No runner on 3rd — infield in gives up hits for no benefit.":"Early game — play for the big inning, not 1 run."}</div>
                  </div>
                </div>}
                {/* Infield in deep dive */}
                {isInfieldIn&&<div style={{background:"rgba(245,158,11,.03)",border:"1px solid rgba(245,158,11,.08)",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#f59e0b",marginBottom:3}}>The Infield-In Tradeoff</div>
                  <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5}}>
                    Normal depth, R3, 0 outs: <strong style={{color:"#22c55e"}}>{Math.round(ii.scoringProbDelta.normal_0out*100)}%</strong> scoring probability.
                    Infield in: <strong style={{color:"#ef4444"}}>{Math.round(ii.scoringProbDelta.infieldIn_0out*100)}%</strong> scoring probability.
                    Net: <strong style={{color:"#ef4444"}}>{ii.netCostPerGame}</strong> runs/game.
                  </div>
                </div>}
                {/* Historical shift */}
                {vocabTier>=3&&<div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#d1d5db",marginBottom:3}}>The Shift Ban (2023)</div>
                  <div style={{fontSize:9,color:"#9ca3af",lineHeight:1.5}}>{dp.historicalShift.note} {dp.historicalShift.postBanEffect}</div>
                </div>}
                {/* OF arm value */}
                {vocabTier>=3&&<div style={{fontSize:9,color:"#9ca3af"}}>{dp.outfieldArm.rfArmPremium}</div>}
              </div>;
            })()}

            {/* HISTORICAL MOMENTS TAB */}
            {brainTab==="history"&&(()=>{
              const lt=BRAIN.stats.leagueTrends;
              const moments=[
                {id:"roberts",title:"Dave Roberts Steals 2B",year:2004,game:"ALCS Game 4",setup:"Bottom 9th, 1 out, trailing 4-3. Red Sox facing elimination — down 0-3 in the series. Roberts pinch-runs at 1st.",data:"WP: ~4%. Steal break-even: 72%. Roberts' speed: elite (3.30s).",options:["Hold — don't risk the out down to your last 3 outs","Steal 2nd — get into scoring position","Hit and run — move the runner while protecting the bat"],correct:1,result:"Roberts stole 2nd. Bill Mueller singled him home. Red Sox won in 12 innings, then won 4 straight games — the greatest comeback in baseball history.",analysis:"The steal was -EV by the numbers (72% needed, ~65% estimated success). But at 4% WP, conventional strategy was already losing. The steal changed the psychology of the series."},
                {id:"bonds_ibb",title:"Bonds IBB With Bases Loaded",year:1998,game:"Diamondbacks vs Giants",setup:"Bottom 9th, 2 outs, bases loaded. Barry Bonds at the plate. D-backs leading 8-6.",data:"RE24 with bases loaded, 2 outs: 0.77. Walking in a run makes it 8-7. But Bonds hit .370 that year with 73 HR.",options:["Pitch to Bonds — don't put the tying run on base","Intentional walk — take your chances with the next batter","Pitch around Bonds — nothing in the zone"],correct:0,result:"Buck Showalter intentionally walked Bonds, loading the bases and forcing in a run (8-7). The next batter, Brent Mayne, struck out. Arizona won.",analysis:"The IBB actually worked! RE24 says walking in a run is almost never correct (bases loaded RE24 = 2.29). But Bonds was so dangerous that the expected damage from pitching to him exceeded the cost of one free run."},
                {id:"chapman",title:"Chapman's Fatigue — 2016 WS Game 7",year:2016,game:"World Series Game 7",setup:"8th inning, Cubs leading 6-3. Manager Maddon brings in closer Aroldis Chapman — who threw 42 pitches the night before in Game 6.",data:"Chapman's avg fastball: 101 mph. After 20+ pitches: drops to 97 mph. Fatigue ERA increase at 90+ pitches across 2 days: +2.1.",options:["Use Chapman for 1 inning max — he's fatigued","Ride Chapman as long as possible — it's Game 7","Save Chapman for the 9th only"],correct:0,result:"Maddon left Chapman in for 2.2 innings (29 pitches). Chapman blew the save — Rajai Davis hit a game-tying HR in the 8th on a 97-mph fastball (Chapman's typical was 101). Cubs won after a rain delay in extras.",analysis:"Chapman's velocity dropped 4 mph due to fatigue. The pitch count data predicted this: after 90+ pitches across 2 days, velocity drops ~3 mph and ERA rises +2.1. Maddon over-used his closer."},
                {id:"bunt_shift",title:"Bunting Against the Shift",year:2023,game:"Modern Era",setup:"Pre-2023: extreme shift with 3 infielders on the right side. Pull-heavy LHH at the plate with nobody on.",data:"Shift BA penalty: ~.010-.015 BA for pull hitters. Bunt BA against shift: .600+ (wide open 3B side). Shift was banned in 2023.",options:["Swing away — don't change your approach for the shift","Bunt toward the empty 3B side for a free single","Hit opposite field to beat the shift"],correct:1,result:"Smart hitters like Joey Gallo and Anthony Rizzo started bunting for hits against the shift, hitting .600+ on bunt attempts. This partly led to MLB banning the shift in 2023.",analysis:"The math was overwhelming: bunting against an extreme shift turned a .230 BA hitter into a .600 BA batter on that specific play. The shift only works if hitters refuse to adjust."},
                {id:"buckner",title:"Buckner's Error — Ball Through the Legs",year:1986,game:"World Series Game 6",setup:"Bottom 10th, 2 outs, tie game. Mets' Mookie Wilson hits a slow grounder to 1B Bill Buckner. Red Sox are one out from winning the World Series.",data:"WP before the grounder: ~97% for Red Sox. Buckner was playing with bad ankles. Manager McNamara had been subbing Dave Stapleton for defense late in games all season — but not tonight.",options:["Keep Buckner in — he's your veteran, trust him","Sub in Stapleton for defense like you've done all season","It doesn't matter — routine play either way"],correct:1,result:"Buckner let the ball roll through his legs. The Mets scored the winning run. Boston lost Game 7 and the Series. It became the most infamous error in baseball history.",analysis:"The defensive substitution was routine — McNamara had made it in 8 of 9 postseason games. Skipping it in the biggest moment was a process failure, not a talent failure. Buckner's ankles limited his range. The data supported the sub."},
                {id:"gibson",title:"Kirk Gibson's Walk-Off HR",year:1988,game:"World Series Game 1",setup:"Bottom 9th, 2 outs, runner on 2nd, Dodgers trailing A's 4-3. Kirk Gibson can barely walk — two injured knees. He pinch-hits against the best closer in baseball, Dennis Eckersley.",data:"Gibson's BA this postseason: .154. He could barely run. Eckersley had 45 saves and a 2.35 ERA. WP for A's: ~87%. Gibson fouled off several pitches on one good leg.",options:["Don't use Gibson — he's too injured to be effective","Send Gibson up — the moment is bigger than the injury","Walk Gibson intentionally and face the next batter"],correct:1,result:"On a 3-2 count, Gibson launched a backdoor slider into the right field bleachers. He limped around the bases pumping his fist — one of the most iconic moments in sports history. Dodgers won Game 1 and the Series in 5.",analysis:"By the numbers, Gibson was a terrible choice (.154 BA, couldn't run). But Eckersley threw a mistake pitch on 3-2 — a backdoor slider that stayed over the plate. Sometimes the unmeasurable (adrenaline, moment, will) overrides the data. This is why WP is a probability, not a certainty."},
                {id:"jeter_flip",title:"Jeter's Flip Play",year:2001,game:"ALDS Game 3",setup:"Bottom 7th, A's trailing 1-0. Jeremy Giambi singles, runner rounds 3rd heading home. Right fielder Spencer overthrows both cutoff men — the ball is rolling toward the 1st base line, nowhere near home plate.",data:"Standard cutoff relay from RF to home requires 2 throws. Spencer's overthrew both cutoff men. The ball was 20+ feet from the plate with a runner sprinting home. Expected run: 100%.",options:["Nothing can be done — the throw missed both cutoff men","Someone needs to back up the play at the plate","The runner scores easily — no defensive play possible"],correct:1,result:"Derek Jeter, playing shortstop, sprinted across the entire diamond from his position and caught the errant throw on the first base line. He shoveled a backhanded flip to catcher Jorge Posada, who tagged Giambi at the plate. Out. Yankees won 1-0 and eventually the series.",analysis:"The Jeter Flip is the ultimate backup play. Jeter had no business being near first base — that's a first baseman's backup zone. But he read the overthrow and sprinted 90+ feet to create a relay point that shouldn't have existed. This is BACKUP_MAP in action: the best defenders are always moving to where the ball MIGHT go."},
                {id:"bumgarner",title:"Bumgarner's Iron Man Performance",year:2014,game:"World Series Game 7",setup:"Bottom 5th, Giants leading 3-2. Madison Bumgarner enters in relief on 2 days rest after throwing a complete game shutout in Game 5 (117 pitches). He'd also pitched 7 shutout innings in Game 1.",data:"Bumgarner's pitch count across the Series: 117 (CG Game 5) + 109 (7 IP Game 1) = 226 pitches in 10 days. Velocity typically drops 3+ mph on short rest. Standard rest between starts: 4-5 days.",options:["Don't use Bumgarner — he's on 2 days rest after 117 pitches","Use Bumgarner for 1-2 innings max as a bridge","Ride Bumgarner as long as he's effective"],correct:2,result:"Bumgarner threw 5 shutout innings of relief in Game 7, finishing the game. He allowed no runs on 2 hits. His velocity barely dropped. Giants won the World Series. It may be the greatest pitching performance in postseason history.",analysis:"Every pitch count model said this was dangerous. But Bumgarner's mechanics were elite, his adrenaline was superhuman, and the alternative (the Giants' bullpen) was unreliable. Manager Bochy trusted his ace over the data — and it worked. This is the tension between pitch-count science and playoff reality."},
              ];
              const sel=selMoment!==null?moments.find(m=>m.id===selMoment):null;
              return <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#8b5cf6",letterSpacing:1,marginBottom:10}}>FAMOUS MOMENTS</div>
                {/* League trends ticker */}
                <div style={{background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.1)",borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:9,color:"#c4b5fd"}}>
                  {lt.strikeoutRate.trend.length>120?lt.strikeoutRate.trend.slice(0,120)+"...":lt.strikeoutRate.trend}
                </div>
                {/* Moment cards */}
                {!sel&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {moments.map(m=><button key={m.id} onClick={()=>{setSelMoment(m.id);setMomentChoice(null);}} style={{width:"100%",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#d1d5db"}}>{m.title}</div>
                      <div style={{fontSize:9,color:"#8b5cf6"}}>{m.year}</div>
                    </div>
                    <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{m.game}</div>
                  </button>)}
                </div>}
                {/* Selected moment */}
                {sel&&<div>
                  <button onClick={()=>{setSelMoment(null);setMomentChoice(null);}} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:10,marginBottom:8}}>← Back to moments</button>
                  <div style={{fontSize:14,fontWeight:800,color:"#8b5cf6",marginBottom:2}}>{sel.title} ({sel.year})</div>
                  <div style={{fontSize:10,color:"#9ca3af",marginBottom:8}}>{sel.game}</div>
                  {/* Setup */}
                  <div style={{background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.1)",borderRadius:10,padding:"8px 10px",marginBottom:8}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",marginBottom:3}}>The Setup</div>
                    <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.5}}>{sel.setup}</div>
                  </div>
                  {/* Data */}
                  {vocabTier>=3&&<div style={{fontSize:9,color:"#93c5fd",marginBottom:8,padding:"4px 8px",background:"rgba(59,130,246,.04)",borderRadius:6}}>{sel.data}</div>}
                  {/* What would you do? */}
                  {momentChoice===null&&<div style={{marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#d1d5db",marginBottom:4}}>What would you do?</div>
                    {sel.options.map((opt,i)=><button key={i} onClick={()=>setMomentChoice(i)} style={{width:"100%",marginBottom:4,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"8px 10px",cursor:"pointer",textAlign:"left",fontSize:10,color:"#d1d5db"}}>{opt}</button>)}
                  </div>}
                  {/* Result + analysis */}
                  {momentChoice!==null&&<div>
                    <div style={{background:momentChoice===sel.correct?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)",border:`1px solid ${momentChoice===sel.correct?"rgba(34,197,94,.2)":"rgba(239,68,68,.2)"}`,borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                      <div style={{fontSize:10,fontWeight:700,color:momentChoice===sel.correct?"#22c55e":"#ef4444"}}>{momentChoice===sel.correct?"You chose what they chose!":"That's not what happened..."}</div>
                    </div>
                    <div style={{background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.1)",borderRadius:10,padding:"8px 10px",marginBottom:6}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",marginBottom:3}}>What Actually Happened</div>
                      <div style={{fontSize:10,color:"#d1d5db",lineHeight:1.5}}>{sel.result}</div>
                    </div>
                    {vocabTier>=3&&<div style={{background:"rgba(0,0,0,.2)",borderRadius:10,padding:"8px 10px",marginBottom:6}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#67e8f9",marginBottom:3}}>The Analysis</div>
                      <div style={{fontSize:9,color:"#d1d5db",lineHeight:1.5}}>{sel.analysis}</div>
                    </div>}
                    <button onClick={()=>setMomentChoice(null)} style={{background:"none",border:"1px solid rgba(255,255,255,.08)",borderRadius:6,padding:"4px 12px",fontSize:9,color:"#9ca3af",cursor:"pointer"}}>Try Again</button>
                  </div>}
                </div>}
                {/* BABIP teaching */}
                {!sel&&vocabTier>=3&&<div style={{marginTop:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#d1d5db",marginBottom:3}}>Contact Type BABIP</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                    {Object.entries(lt.babip.byContactType).map(([type,val])=><div key={type} style={{textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:6,padding:"4px"}}>
                      <div style={{fontSize:12,fontWeight:800,color:val>0.5?"#22c55e":val>0.2?"#f59e0b":"#ef4444"}}>.{Math.round(val*1000)}</div>
                      <div style={{fontSize:7,color:"#9ca3af",textTransform:"capitalize"}}>{type.replace(/([A-Z])/g,' $1').trim()}</div>
                    </div>)}
                  </div>
                  <div style={{fontSize:8,color:"#9ca3af",marginTop:4}}>{lt.babip.teachingPoint}</div>
                </div>}
              </div>;
            })()}
          </div>;
        })()}

        {/* SITUATION HUD — persistent during sit play */}
        {sitMode&&sitSet&&screen==="play"&&!aiLoading&&!sitTransition&&<div style={{background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderRadius:12,padding:"8px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:12,minHeight:42}}>
          {/* Position dots */}
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {sitSet.questions.map((q,i)=>{
              const res=sitResults[i];const isCur=i===sitQ;const pm=POS_META[q.pos];
              return <div key={q.id} style={{width:isCur?28:18,height:isCur?28:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isCur?14:10,border:isCur?`2px solid ${pm?.color||"#3b82f6"}`:res?`2px solid ${res.correct?"#22c55e":"#ef4444"}`:"1.5px solid rgba(255,255,255,.15)",background:isCur?`${pm?.color||"#3b82f6"}20`:res?(res.correct?"rgba(34,197,94,.15)":"rgba(239,68,68,.15)"):"transparent",transition:"all .3s",animation:isCur?"sitPulse 1.5s ease-in-out infinite":undefined}}>
                {isCur?pm?.emoji:res?(res.correct?"✓":"✗"):""}
              </div>;
            })}
          </div>
          {/* Game state mini */}
          <div style={{fontSize:9,color:"#9ca3af",whiteSpace:"nowrap"}}>
            {sitSet.situation.inning} | {sitSet.situation.outs} Out{sitSet.situation.outs!==1?"s":""} | {sitSet.situation.runners.length>0?sitSet.situation.runners.map(r=>r===1?"1B":r===2?"2B":"3B").join(" "):"Empty"}
          </div>
          {/* Set title */}
          <div style={{fontSize:10,fontWeight:700,color:sitSet.color,whiteSpace:"nowrap"}}>{sitSet.emoji} {sitSet.title.replace(/ \(.*\)$/,"")}</div>
        </div>}

        {/* SITUATION TRANSITION — position switch animation */}
        {sitTransition&&sitMode&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.85)",animation:"fi .3s ease-out"}}>
          <div style={{textAlign:"center",animation:"su .4s ease-out .1s both"}}>
            <div style={{fontSize:72,marginBottom:12,animation:"pulse 1s ease-in-out infinite"}}>{sitTransition.emoji}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:sitTransition.color,marginBottom:8,textTransform:"uppercase"}}>Now you're the {sitTransition.label}</div>
            <div style={{fontSize:13,color:"#9ca3af"}}>Question {sitTransition.qIdx+1} of {sitTransition.total}</div>
            <div style={{width:60,height:3,borderRadius:2,background:`${sitTransition.color}40`,margin:"16px auto 0",overflow:"hidden"}}>
              <div style={{width:"100%",height:"100%",background:sitTransition.color,borderRadius:2,animation:"sitSlide 1.2s ease-in-out"}}/>
            </div>
          </div>
        </div>}

        {/* PLAYING */}
        {screen==="play"&&aiLoading&&(()=>{
          const msgs=["COACH IS DRAWING UP A PLAY...","AI COACH IS THINKING...","ALMOST THERE...","TAKING A LITTLE LONGER..."]
          const subs=["Creating a personalized scenario based on your skill level","Analyzing your strengths and building a challenge","Putting the finishing touches on your scenario","Hang tight — the AI is working hard on this one"]
          const phase=Math.min(Math.floor(aiLoadTick/3), 3)
          return <div style={{textAlign:"center",padding:"80px 20px"}}>
          <div style={{fontSize:48,marginBottom:12,animation:"spin 2s linear infinite"}}>⚾</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f59e0b",letterSpacing:2,marginBottom:6}}>{msgs[phase]}</div>
          <p style={{color:"#9ca3af",fontSize:12,maxWidth:280,margin:"0 auto"}}>{subs[phase]}</p>
          <div style={{marginTop:16,display:"flex",justifyContent:"center",gap:4}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:4,background:"#f59e0b",animation:"pulse 1s ease-in-out " + (i*.2) + "s infinite"}}/>)}
          </div>
          {aiLoadTick>=8&&skipAiRef.current&&<button onClick={()=>{if(skipAiRef.current)skipAiRef.current()}} style={{marginTop:16,background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.2)",borderRadius:10,padding:"8px 18px",color:"#a855f7",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>{"\u23ED\uFE0F"} Skip to Practice Scenario</button>}
          <button onClick={()=>{skipAiRef.current=null;if(abortRef.current)abortRef.current.abort();setAiLoading(false);goHome()}} style={{marginTop:aiLoadTick>=8?10:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"6px 16px",color:"#9ca3af",fontSize:11,cursor:"pointer"}}>{"\u2190"} Cancel</button>
        </div>})()}

        {screen==="play"&&!aiLoading&&sc&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <button onClick={goHome} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#9ca3af",cursor:"pointer",minHeight:32}}>← Back</button>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {placementMode&&placementData&&<span style={{background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#22c55e"}}>📊 Placement {placementData.round+1}/{placementData.scenarios.length}</span>}
              {survivalMode&&<span style={{background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#a855f7"}}>💀 #{survivalRun?survivalRun.count+1:1}</span>}

              {speedMode&&<span style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#ef4444"}}>⚡ {speedRound?speedRound.round+1:1}/5</span>}
              {dailyMode&&<span style={{background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#f59e0b"}}>💎 Daily · 2x XP</span>}
              {seasonMode&&(()=>{const st=getSeasonStage(stats.seasonGame);return <span style={{background:`${st.color}15`,border:`1px solid ${st.color}25`,borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:st.color}}>{st.emoji} {st.name}</span>})()}
              {challengePack&&<span style={{background:"rgba(59,130,246,.15)",border:"1px solid rgba(59,130,246,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#3b82f6"}}>⚔️ {(challengePack.round||0)+1}/5</span>}
              {aiMode&&<span style={{background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#a855f7"}}>🤖 AI</span>}
              {aiFallback&&!aiMode&&<span style={{background:"rgba(59,130,246,.12)",border:"1px solid rgba(59,130,246,.2)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#60a5fa"}}>📚 Practice</span>}
              {aiFallbackBanner&&!aiMode&&<div style={{background:"rgba(139,92,246,.06)",border:"1px solid rgba(139,92,246,.15)",borderRadius:10,padding:"8px 12px",margin:"6px 0",display:"flex",alignItems:"center",justifyContent:"space-between",animation:"sd .35s ease-out"}}><span style={{fontSize:11,color:"#a78bfa"}}>⚾ AI scenario loading in background — next one will be custom!</span><button onClick={()=>setAiFallbackBanner(false)} style={{background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontSize:14,padding:"0 4px",lineHeight:1}}>✕</button></div>}
              <span style={{fontSize:9,color:DIFF_TAG[(sc.diff||1)-1].c}}>{"⭐".repeat(sc.diff||1)}</span>
              <span style={{background:`${POS_META[pos].color}15`,border:`1px solid ${POS_META[pos].color}25`,borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:POS_META[pos].color}}>{POS_META[pos].emoji} {POS_META[pos].label}</span>
            </div>
          </div>

          {/* Real Game mini scoreboard */}
          {realGameMode&&realGame&&<div style={{display:"flex",justifyContent:"center",gap:12,alignItems:"center",background:"rgba(0,0,0,.3)",borderRadius:10,padding:"6px 14px",marginBottom:8,border:"1px solid rgba(245,158,11,.15)"}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#f59e0b",letterSpacing:1}}>INN {realGame.inning}</span>
            <span style={{color:"rgba(255,255,255,.15)"}}>|</span>
            <span style={{fontSize:13,fontWeight:800,color:"#3b82f6"}}>YOU {realGame.playerScore}</span>
            <span style={{color:"rgba(255,255,255,.15)"}}>-</span>
            <span style={{fontSize:13,fontWeight:800,color:"#ef4444"}}>OPP {realGame.opponentScore}</span>
          </div>}

          {/* Speed Round timer bar */}
          {speedMode&&choice===null&&<div style={{marginBottom:8}}>
            {timerGo&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#22c55e",letterSpacing:2,animation:"pulse .5s ease",textShadow:"0 0 12px rgba(34,197,94,.5)"}}>GO!</span></div>}
            {timerActive&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:13,fontWeight:800,color:timer<=5?"#ef4444":timer<=10?"#f59e0b":"#22c55e"}}>⏱ {timer}s</span>
              <span style={{fontSize:10,color:"#9ca3af",fontWeight:600}}>+{timer} speed bonus</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(timer/speedTimerMax)*100}%`,background:timer<=5?"#ef4444":timer<=Math.round(speedTimerMax*0.67)?"#f59e0b":"#22c55e",borderRadius:3,transition:"width 1s linear",boxShadow:timer<=5?`0 0 8px ${timer<=5?"rgba(239,68,68,.4)":"none"}`:"none"}}/>
            </div></>}
            {!timerActive&&!timerGo&&<div style={{textAlign:"center",fontSize:10,color:"#9ca3af",fontWeight:600}}>Get ready...</div>}
          </div>}

          <div style={{background:"rgba(0,0,0,.25)",borderRadius:12,padding:6,marginBottom:8,border:"1px solid rgba(255,255,255,.03)"}}>
            <Field runners={sc.situation.runners} outcome={fo} ak={ak} anim={fo?sc.anim:null} theme={FIELD_THEMES.find(th=>th.id===stats.fieldTheme)||FIELD_THEMES[0]} avatar={{j:stats.avatarJersey||0,c:stats.avatarCap||0,b:stats.avatarBat||0}} pos={pos}/>
            <div style={{marginTop:3}}><Board sit={sc.situation}/></div>
          </div>

          {/* Pressure Meter */}
          {(()=>{const p=getPressure(sc.situation);if(p<=20)return null;const pl=getPressureLabel(p);
            return(<div style={{marginBottom:8,padding:"5px 10px",background:"rgba(0,0,0,.15)",borderRadius:8,border:"1px solid rgba(255,255,255,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:9,fontWeight:700,color:pl.color,textTransform:"uppercase",letterSpacing:1}}>{pl.text}</span>
                <span style={{fontSize:9,color:"#9ca3af",fontWeight:600}}>{p}/100</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${p}%`,borderRadius:2,background:`linear-gradient(90deg,#22c55e,${p>=55?"#f59e0b":"#22c55e"},${p>=80?"#ef4444":p>=55?"#f59e0b":"#22c55e"})`,transition:"width .5s ease"}}/>
              </div>
            </div>);
          })()}

          <div style={{...card,marginBottom:8,padding:12}}>
            <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:"#f59e0b",marginBottom:4}}>{sc.title}</h3>
            <p style={{fontSize:fs(14),lineHeight:fontScale>1?1.65:1.55,color:"#d1d5db"}}>{sc.description}</p>
          </div>

          {/* Phase 3.5: First-game guided tooltip */}
          {stats.gp===0&&!stats.firstGameGuide&&choice===null&&<div style={{background:"linear-gradient(135deg,rgba(59,130,246,.1),rgba(139,92,246,.1))",border:"1px solid rgba(59,130,246,.2)",borderRadius:12,padding:"10px 12px",marginBottom:10,textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#93c5fd"}}>👇 Pick the best play!</div>
            <div style={{fontSize:10,color:"#60a5fa"}}>You got this! Read carefully and choose wisely.</div>
          </div>}

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sc.options.map((opt,i)=>{
              const vis=ri>=i;const sel=choice===i;
              let bg="rgba(255,255,255,.02)",bd="rgba(255,255,255,.05)";
              if(sel&&placementMode){if(i===sc.best){bg="rgba(34,197,94,.08)";bd="#22c55e"}else{bg="rgba(239,68,68,.08)";bd="#ef4444"}}
              else if(sel&&od){if(od.cat==="success"){bg="rgba(34,197,94,.08)";bd="#22c55e"}else if(od.cat==="warning"){bg="rgba(245,158,11,.08)";bd="#f59e0b"}else{bg="rgba(239,68,68,.08)";bd="#ef4444"}}
              if(choice!==null&&i===sc.best&&!sel){bg="rgba(34,197,94,.04)";bd="rgba(34,197,94,.3)"}
              return(
                <button key={i} aria-label={`Option ${i+1}: ${opt}`} onClick={()=>{if(stats.gp===0&&!stats.firstGameGuide)setStats(p=>({...p,firstGameGuide:true}));snd.play('tap');handleChoice(i)}} disabled={choice!==null}
                  style={{background:bg,border:`1.5px solid ${bd}`,borderRadius:12,padding:"14px 12px",cursor:choice!==null?"default":"pointer",transition:"all .2s",opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-10px)",textAlign:"left",width:"100%",color:"white",fontSize:fs(14),lineHeight:fontScale>1?1.55:1.4,display:"flex",alignItems:"flex-start",gap:8,minHeight:fs(48)}}>
                  <span style={{width:24,height:24,borderRadius:7,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:sel?(placementMode?(i===sc.best?"#22c55e":"#ef4444"):(od?.cat==="success"?"#22c55e":od?.cat==="warning"?"#f59e0b":"#ef4444")):choice!==null&&i===sc.best?"#22c55e":"rgba(255,255,255,.04)",
                    color:sel||(choice!==null&&i===sc.best)?"white":"#9ca3af",fontSize:fs(10),fontWeight:800,transition:"all .25s"}}>
                    {sel?(placementMode?(i===sc.best?"✓":"✗"):(od?.isOpt?"✓":"✗")):choice!==null&&i===sc.best?"✓":i+1}
                  </span>
                  <span style={{flex:1}}>{opt}{sel&&od?<span style={{fontSize:fs(11),fontWeight:700,marginLeft:6,color:od.cat==="success"?"#22c55e":od.cat==="warning"?"#f59e0b":"#ef4444"}}>{od.isOpt?" ✓ Best Play":od.cat==="warning"?" ~ Okay":""}</span>:choice!==null&&i===sc.best&&!sel?<span style={{fontSize:fs(11),fontWeight:700,marginLeft:6,color:"#22c55e"}}> ← Best</span>:null}</span>
                </button>
              );
            })}
          </div>
          {choice===null&&<div style={{textAlign:"center",marginTop:5,fontSize:8,color:"#9ca3af"}}>Press 1-4 or tap</div>}
        </div>}

        {/* OUTCOME */}
        {screen==="outcome"&&od&&<div>
          <button onClick={goHome} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#9ca3af",cursor:"pointer",marginBottom:8,minHeight:32}}>← Home</button>

          <div style={{textAlign:"center",marginBottom:10,padding:"8px 0"}}>
            <div style={{fontSize:44,marginBottom:2}}>{od.isOpt?"🎯":od.cat==="warning"?"🤔":"📚"}</div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1.5,color:od.cat==="success"?"#22c55e":od.cat==="warning"?"#f59e0b":"#ef4444",marginBottom:3}}>
              {od.isOpt?"PERFECT STRATEGY!":od.cat==="warning"?"NOT BAD!":"LEARNING MOMENT"}
            </h2>
            <div style={{display:"flex",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
              {od.pts>0&&<span style={{background:"rgba(34,197,94,.08)",color:"#22c55e",padding:"2px 10px",borderRadius:14,fontSize:11,fontWeight:800,border:"1px solid rgba(34,197,94,.15)"}}>+{od.pts} pts{stats.isPro?" (2x All-Star)":""}{dailyMode?" (2x Daily)":""}{od.speedBonus>0?` (+${od.speedBonus} speed)`:""}</span>}
              {dailyMode&&<span style={{background:"rgba(245,158,11,.08)",color:"#f59e0b",padding:"2px 10px",borderRadius:14,fontSize:11,fontWeight:800,border:"1px solid rgba(245,158,11,.15)"}}>💎 Daily Done!</span>}
              {stats.str>1&&od.isOpt&&<span style={{background:"rgba(249,115,22,.08)",color:"#f97316",padding:"2px 10px",borderRadius:14,fontSize:11,fontWeight:800,border:"1px solid rgba(249,115,22,.15)"}}>🔥 {stats.str}</span>}
            </div>
          </div>

          {/* === GAME FILM MODE: Replay the correct play on the SVG field === */}
          {sc&&sc.anim&&<div style={{marginBottom:10}}>
            {!showReplay?<button onClick={()=>{setShowReplay(true);setReplayKey(k=>k+1);snd.play('tap');
              // Replay sound effects timed to slow-mode animation phases (2.5x + 1s pre-delay)
              const a=sc.anim;if(a){
                if(a==='hit'||a==='groundout'||a==='flyout'||a==='bunt'||a==='squeeze'||a==='doubleplay')setTimeout(()=>snd.play('batCrack'),1200); // bat contact
                if(a==='steal'||a==='advance'||a==='score'||a==='wildPitch')setTimeout(()=>snd.play('whoosh'),1500); // runner takes off
                if(a==='strike'||a==='strikeout')setTimeout(()=>snd.play('whoosh'),1300); // pitch delivery
                if(a==='strike'||a==='strikeout')setTimeout(()=>snd.play('glovePop'),2200); // catcher receives
                if(a==='doubleplay'||a==='groundout'||a==='relay')setTimeout(()=>snd.play('glovePop'),3500); // fielder catch
                if(a==='flyout')setTimeout(()=>snd.play('glovePop'),3200); // OF catch
                if(a==='steal'||a==='score')setTimeout(()=>snd.play('slideDust'),3800); // slide into base
                if(a==='steal'||a==='score'||a==='hit'||a==='advance')setTimeout(()=>snd.play('umpSafe'),4500); // safe call
                if(a==='strike'||a==='strikeout'||a==='flyout'||a==='groundout'||a==='doubleplay')setTimeout(()=>snd.play('umpOut'),4000); // out call
                if(a==='steal'||a==='score'||a==='hit')setTimeout(()=>snd.play('cheer'),4800); // crowd
              }
            }} style={{width:"100%",background:"linear-gradient(135deg,rgba(59,130,246,.06),rgba(168,85,247,.06))",border:"1.5px solid rgba(59,130,246,.2)",borderRadius:12,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>▶</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#93c5fd"}}>Watch the Play</div>
                <div style={{fontSize:10,color:"#9ca3af"}}>See the {od.isOpt?"play you called":"correct play"} animated on the field</div>
              </div>
            </button>
            :<div data-replay-field="true" style={{background:"rgba(0,0,0,.3)",border:"1.5px solid rgba(59,130,246,.2)",borderRadius:14,padding:"10px 8px 6px",overflow:"hidden",position:"relative"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,padding:"0 4px"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#93c5fd",textTransform:"uppercase",letterSpacing:1}}>Game Film</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{
                    if(replayPaused){setReplayPaused(false);return}
                    setReplayKey(k=>k+1);setReplayPaused(false);snd.play('tap');
                    const a=sc.anim;if(a){
                      if(a==='hit'||a==='groundout'||a==='flyout'||a==='bunt'||a==='doubleplay')setTimeout(()=>snd.play('batCrack'),1200);
                      if(a==='steal'||a==='score')setTimeout(()=>snd.play('whoosh'),1500);
                      if(a==='strike'||a==='strikeout')setTimeout(()=>snd.play('glovePop'),2200);
                      if(a==='steal'||a==='score'||a==='hit')setTimeout(()=>snd.play('cheer'),4800);
                    }
                  }} style={{background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.2)",borderRadius:6,padding:"2px 8px",fontSize:9,color:"#60a5fa",cursor:"pointer",fontWeight:700}}>↻ Replay</button>
                  <button onClick={()=>{
                    setReplayPaused(p=>{
                      const svg=document.querySelector('[data-replay-field] svg');
                      if(svg){if(!p)svg.pauseAnimations();else svg.unpauseAnimations()}
                      return !p;
                    });
                  }} style={{background:replayPaused?"rgba(245,158,11,.1)":"rgba(255,255,255,.04)",border:`1px solid ${replayPaused?"rgba(245,158,11,.2)":"rgba(255,255,255,.06)"}`,borderRadius:6,padding:"2px 8px",fontSize:9,color:replayPaused?"#f59e0b":"#9ca3af",cursor:"pointer",fontWeight:700}}>{replayPaused?"▶ Play":"⏸ Pause"}</button>
                  <button onClick={()=>setShowReplay(false)} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"2px 8px",fontSize:9,color:"#9ca3af",cursor:"pointer"}}>✕</button>
                </div>
              </div>
              <Field key={`replay-${replayKey}`} runners={(()=>{const r=sc.situation?.runners||[];const moveFrom={steal:1,score:3,advance:1,wildPitch:1,squeeze:3};const rm=moveFrom[sc.anim];return rm?r.filter(b=>b!==rm):r})()} outcome="success" ak={replayKey} anim={sc.anim} animVariant={sc.animVariant||sc.pitchType||null} theme={FIELD_THEMES.find(th=>th.id===stats.fieldTheme)||FIELD_THEMES[0]} avatar={{j:stats.avatarJersey||0,c:stats.avatarCap||0,b:stats.avatarBat||0}} pos={pos} slow={true}/>
              <div style={{marginTop:2}}><Board sit={sc.situation}/></div>
              {/* AF7: Decision tree overlay — show outcome arrows after replay */}
              {showReplay&&sc.anim&&!replayPaused&&(()=>{
                const trees={steal:{from:[290,210],paths:[{to:[200,135],label:"SAFE",color:"#22c55e"},{to:[248,178],label:"OUT",color:"#ef4444"}]},
                  hit:{from:[200,290],paths:[{to:[306,75],label:"BASE HIT",color:"#22c55e"},{to:[248,195],label:"FIELDED",color:"#ef4444"}]},
                  groundout:{from:[200,290],paths:[{to:[290,210],label:"OUT AT 1B",color:"#22c55e"},{to:[200,135],label:"RUNNER SAFE",color:"#f59e0b"}]},
                  score:{from:[110,210],paths:[{to:[200,290],label:"SCORES!",color:"#22c55e"},{to:[155,250],label:"HELD AT 3B",color:"#f59e0b"}]}};
                const tree=trees[sc.anim];
                if(!tree)return null;
                return <svg viewBox="0 0 400 310" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
                  {tree.paths.map((p,i)=><g key={i} opacity="0"><animate attributeName="opacity" values="0;0;0;0;.6" dur="5s" fill="freeze"/>
                    <line x1={tree.from[0]} y1={tree.from[1]} x2={p.to[0]} y2={p.to[1]} stroke={p.color} strokeWidth="1.5" strokeDasharray="3,3"/>
                    <circle cx={p.to[0]} cy={p.to[1]} r="14" fill={`${p.color}15`} stroke={p.color} strokeWidth="1"/>
                    <text x={p.to[0]} y={p.to[1]+3} textAnchor="middle" fontSize="5" fill={p.color} fontWeight="800">{p.label}</text>
                  </g>)}
                </svg>;
              })()}
              {/* AF2: Ghost overlay renders on top of replay field when comparison active */}
              {showFailComparison&&ANIM_DATA[sc.anim+"_fail"]&&<svg viewBox="0 0 400 310" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
                <GhostPhases phases={ANIM_DATA[sc.anim+"_fail"]} ak={replayKey}/>
              </svg>}
              <div style={{textAlign:"center",fontSize:9,color:"#6b7280",marginTop:4}}>{od.isOpt?"The play you called — executed perfectly":replayAutoExpanded?"Watch how the correct play works — tap ▶ to see it in action":"The correct play — this is what should happen"}</div>
              {/* AF2+CI2: Ghost comparison — show wrong play as transparent overlay */}
              {!od.isOpt&&sc.anim&&(()=>{
                const failKey=sc.anim+"_fail";
                const ghostPhases=ANIM_DATA[failKey];
                if(!ghostPhases)return null;
                return <div style={{textAlign:"center",marginTop:6}}>
                  {!showFailComparison?<button onClick={()=>{setShowFailComparison(true);snd.play('tap');setReplayKey(k=>k+1)}} style={{background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)",borderRadius:8,padding:"5px 14px",fontSize:10,color:"#ef4444",cursor:"pointer",fontWeight:600}}>
                    👻 Compare: See What Goes Wrong
                  </button>:<div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>
                    <span style={{color:"#22c55e"}}>●</span> Correct play (solid) vs <span style={{color:"#ef4444"}}>●</span> Wrong outcome (ghost)
                  </div>}
                </div>;
              })()}
            </div>}
          </div>}

          {/* Phase 3.5: Coach line shown inline, not separate box for young players */}
          {(stats.ageGroup!=="6-8"&&stats.ageGroup!=="9-10")&&<Coach mood={od.cat} msg={coachMsg}/>}

          <div style={{background:od.cat==="success"?"rgba(34,197,94,.03)":od.cat==="warning"?"rgba(245,158,11,.03)":"rgba(239,68,68,.03)",border:`1px solid ${od.cat==="success"?"rgba(34,197,94,.12)":od.cat==="warning"?"rgba(245,158,11,.12)":"rgba(239,68,68,.12)"}`,borderRadius:12,padding:12,borderLeft:`3px solid ${od.cat==="success"?"#22c55e":od.cat==="warning"?"#f59e0b":"#ef4444"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:fs(9),color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>{od.cat==="success"?"✓ ":od.cat==="warning"?"~ ":"✗ "}Your Choice{od.cat==="success"?" — Great Call!":od.cat==="warning"?" — Not Bad":""}</div><div style={{fontSize:fs(13),fontWeight:700,color:"white",marginTop:2}}>"{od.chosen}"</div>{(stats.ageGroup==="6-8"||stats.ageGroup==="9-10")&&coachMsg&&<div style={{fontSize:fs(11),color:"#d1d5db",marginTop:4,fontStyle:"italic"}}>💬 {coachMsg}</div>}</div>
              <button onClick={()=>setShowExp(!showExp)} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 10px",fontSize:10,color:"#9ca3af",cursor:"pointer",minHeight:32}}>{showExp?"▼":"▶"}</button>
            </div>
            {showExp&&(()=>{const ed=od.explDepth?.[od.chosenIdx];return ed?<div style={{marginTop:6}}><p style={{fontSize:fs(14),lineHeight:fontScale>1?1.6:1.5,color:"#d1d5db"}}>{ed.simple}</p>{explDepthLayer>=1&&<p style={{fontSize:fs(13),lineHeight:fontScale>1?1.6:1.5,color:"#9ca3af",marginTop:4,paddingLeft:8,borderLeft:"2px solid rgba(255,255,255,.08)"}}>{ed.why}</p>}{explDepthLayer>=2&&ed.data&&ed.data!=="n/a"&&<p style={{fontSize:fs(12),lineHeight:1.4,color:"#60a5fa",marginTop:4,fontStyle:"italic"}}>{ed.data}</p>}<div style={{display:"flex",gap:6,marginTop:6}}>{explDepthLayer<1&&<button onClick={()=>setExplDepthLayer(1)} style={{background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.15)",borderRadius:6,padding:"3px 10px",fontSize:fs(10),color:"#a855f7",cursor:"pointer",fontWeight:600}}>Why?</button>}{explDepthLayer===1&&stats.ageGroup!=="6-8"&&stats.ageGroup!=="9-10"&&<button onClick={()=>setExplDepthLayer(2)} style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:6,padding:"3px 10px",fontSize:fs(10),color:"#60a5fa",cursor:"pointer",fontWeight:600}}>Show Data</button>}</div></div>:<p style={{fontSize:fs(14),lineHeight:fontScale>1?1.6:1.5,color:"#d1d5db",marginTop:6}}>{od.exp}</p>})()}
          </div>

          {!od.isOpt&&<div style={{background:"rgba(34,197,94,.02)",border:"1px solid rgba(34,197,94,.1)",borderRadius:12,padding:12,marginTop:8,borderLeft:"3px solid #22c55e"}}>
            <div style={{fontSize:fs(9),color:"#22c55e",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:3}}>✅ Best Strategy</div>
            <div style={{fontSize:fs(13),fontWeight:700,color:"white",marginBottom:4}}>"{od.bestOpt}"</div>
            {showExp&&(()=>{const ed=od.explDepth?.[od.bestIdx];return ed?<div><p style={{fontSize:fs(14),lineHeight:fontScale>1?1.6:1.5,color:"#d1d5db"}}>{ed.simple}</p>{explDepthLayer>=1&&<p style={{fontSize:fs(13),lineHeight:fontScale>1?1.6:1.5,color:"#9ca3af",marginTop:4,paddingLeft:8,borderLeft:"2px solid rgba(34,197,94,.15)"}}>{ed.why}</p>}{explDepthLayer>=2&&ed.data&&ed.data!=="n/a"&&<p style={{fontSize:fs(12),lineHeight:1.4,color:"#60a5fa",marginTop:4,fontStyle:"italic"}}>{ed.data}</p>}</div>:<p style={{fontSize:fs(14),lineHeight:fontScale>1?1.6:1.5,color:"#d1d5db"}}>{od.bestExp}</p>})()}
          </div>}

          {/* Try Again? — remediation offer on wrong answers */}
          {!od.isOpt&&(stats.isPro||(DAILY_FREE-(stats.todayPlayed||0))>0)&&!speedMode&&!survivalMode&&!realGameMode&&<div style={{textAlign:"center",marginTop:8}}>
            <button onClick={()=>{
              const remedConcept=sc?.conceptTag||findConceptTag(sc?.concept)||null
              console.log("[BSM] Try Again remediation for concept:",remedConcept)
              conceptTargetRef.current=remedConcept
              setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setShowExp(true);setExplainMore(null);setScreen("play");setAiLoading(true);setAiMode(true)
              const _aiHist=stats.aiHistory||[]
              generateAIScenario(pos,stats,stats.cl||[],stats.recentWrong||[],null,remedConcept,_aiHist).then(result=>{
                setAiLoading(false)
                if(result?.scenario){
                  result.scenario._remediation=true
                  setSc(result.scenario);result.scenario.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)})
                }else{
                  setAiMode(false);setAiFallback(true)
                  const s=getSmartRecycle(pos,Object.entries(SCENARIOS).flatMap(([k,arr])=>arr.filter(s=>s._pos===pos||(!s._pos&&k===pos))),lastScRef.current?.id)
                  setSc(s);setScreen("play");s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)})
                }
              })
            }} style={{background:"linear-gradient(135deg,rgba(59,130,246,.08),rgba(168,85,247,.08))",border:"1px solid rgba(59,130,246,.2)",borderRadius:10,padding:"8px 20px",color:"#60a5fa",fontSize:13,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}>
              🔄 Try Again? <span style={{fontSize:11,fontWeight:400,color:"#9ca3af"}}>Same concept, different angle</span>
            </button>
          </div>}

          {showC&&(()=>{
            const cTag=sc?.conceptTag||findConceptTag(od?.concept);
            const cState=cTag&&stats.masteryData?.concepts?.[cTag];
            const mLabel=cState?.state==="mastered"?"Mastered":cState?.state==="learning"?"Learning":cState?.state==="introduced"?"Introduced":cState?.state==="degraded"?"Review":"New";
            const mColor=cState?.state==="mastered"?"#22c55e":cState?.state==="learning"?"#3b82f6":cState?.state==="introduced"?"#f59e0b":cState?.state==="degraded"?"#ef4444":"#6b7280";
            const correctCount=cState?.consecutiveCorrect||0;
            const needed=3;
            return <div style={{background:"linear-gradient(135deg,rgba(59,130,246,.04),rgba(168,85,247,.04))",border:"1px solid rgba(59,130,246,.12)",borderRadius:12,padding:12,marginTop:10,textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:2}}>💡</div>
              <div style={{fontSize:9,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:3}}>Key Concept</div>
              <p style={{fontSize:14,fontWeight:600,color:"white",lineHeight:1.45}}>{od.concept}</p>
              {cTag&&<div style={{marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span style={{fontSize:9,fontWeight:700,color:mColor,textTransform:"uppercase",letterSpacing:1}}>{mLabel}</span>
                {cState?.state!=="mastered"&&<div style={{display:"flex",gap:2}}>
                  {[...Array(needed)].map((_,i)=><div key={i} style={{width:12,height:4,borderRadius:2,background:i<correctCount?mColor:"rgba(255,255,255,.1)"}}/>)}
                </div>}
                {cState?.state==="mastered"&&<span style={{fontSize:10}}>✅</span>}
              </div>}
            </div>;
          })()}

          {/* Famous Plays: What Really Happened epilogue */}
          {showC&&sc?.historicalNote&&<div style={{background:"linear-gradient(135deg,rgba(234,179,8,.04),rgba(202,138,4,.02))",border:"1px solid rgba(234,179,8,.12)",borderRadius:12,padding:12,marginTop:8}}>
            <div style={{fontSize:14,marginBottom:2,textAlign:"center"}}>📜</div>
            <div style={{fontSize:9,color:"#eab308",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:4,textAlign:"center"}}>What Really Happened</div>
            <p style={{fontSize:13,color:"#d1d5db",lineHeight:1.55,margin:0}}>{sc.historicalNote}</p>
          </div>}

          {/* Explain More — AI deep dive (Pro) */}
          {showC&&od?.concept&&<div style={{textAlign:"center",marginTop:6}}>
            {stats.isPro?<>{!explainMore&&!explainLoading&&<button onClick={async()=>{
              setExplainLoading(true);
              try{
                const _ec=new AbortController();const _et=setTimeout(()=>_ec.abort(),45000);
                if(stats.useLLM70B){
                  const res=await fetch(LLM_70B_ENRICH_URL,{method:"POST",headers:{"Content-Type":"application/json"},signal:_ec.signal,body:JSON.stringify({scenario:sc,choiceIdx:choice,situation:sc.situation,position:pos,playerAge:stats.ageGroup})});
                  clearTimeout(_et);if(!res.ok)throw new Error("API "+res.status);
                  const d=await res.json();setExplainMore(d.enrichment||d.choices?.[0]?.message?.content||"Couldn't load explanation. Try again later!");
                }else{
                const res=await fetch(AI_PROXY_URL,{method:"POST",headers:{"Content-Type":"application/json"},signal:_ec.signal,body:JSON.stringify({model:"grok-4",messages:[{role:"system",content:"You are a baseball coach explaining concepts to young players (ages 8-18). Keep it clear, engaging, and under 100 words. Use specific examples."},{role:"user",content:`Explain this baseball concept in more depth: "${od.concept}". The player ${od.isOpt?"got this right":"got this wrong"} in a ${POS_META[pos]?.label||pos} scenario. Give a deeper explanation with a real-game example.`}],max_tokens:200,temperature:0.5})});
                clearTimeout(_et);
                if(!res.ok)throw new Error("API "+res.status);
                const d=await res.json();
                setExplainMore(d.choices?.[0]?.message?.content||"Couldn't load explanation. Try again later!");};
              }catch{setExplainMore("Couldn't load explanation. Check your connection and try again.")}
              setExplainLoading(false);
            }} style={{background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.15)",borderRadius:8,padding:"6px 14px",color:"#a855f7",fontSize:11,fontWeight:600,cursor:"pointer"}}>🔍 Explain More</button>}
            {explainLoading&&<div style={{fontSize:11,color:"#a855f7"}}>Loading deeper explanation...</div>}
            {explainMore&&<div style={{background:"linear-gradient(135deg,rgba(168,85,247,.04),rgba(59,130,246,.04))",border:"1px solid rgba(168,85,247,.12)",borderRadius:12,padding:12,marginTop:4,textAlign:"left"}}>
              <div style={{fontSize:9,color:"#a855f7",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:4}}>🔍 Deep Dive</div>
              <p style={{fontSize:13,color:"#d1d5db",lineHeight:1.5,margin:0}}>{explainMore}</p>
            </div>}</>
            :<button onClick={()=>{setPanel('upgrade');trackFunnel('explain_more_gated',setStats);goHome()}} style={{background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.12)",borderRadius:8,padding:"6px 14px",color:"#9ca3af",fontSize:11,fontWeight:600,cursor:"pointer"}}>🔒 Explain More (All-Star Pass)</button>}
          </div>}

          {/* Brain Insights — statistical context for ages 11+ */}
          {showC&&stats.ageGroup!=="6-8"&&stats.ageGroup!=="9-10"&&(()=>{
            const insights=enrichFeedback(sc,choice,sc.situation);
            if(insights.length===0)return null;
            return(<div style={{background:"linear-gradient(135deg,rgba(168,85,247,.04),rgba(59,130,246,.04))",border:"1px solid rgba(168,85,247,.12)",borderRadius:12,padding:12,marginTop:8}}>
              <div style={{fontSize:9,color:"#a855f7",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6,textAlign:"center"}}>Brain Insights</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {insights.map((ins,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6}}>
                    <span style={{fontSize:13,flexShrink:0}}>{ins.icon}</span>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,color:"#d1d5db",lineHeight:1.4}}>{ins.text}</span>
                      {ins.deepLink&&<button onClick={()=>{setBrainTab(ins.deepLink.tab);if(ins.deepLink.state){const s=ins.deepLink.state;if(s.runners!==undefined){setReRunners(s.runners);setReOuts(s.outs||0);}if(s.count)setSelCount(s.count);if(s.inning!==undefined){setWpInning(s.inning);setWpDiff(s.diff||0);}}setScreen("brain");}} style={{display:"inline-block",marginLeft:4,background:"none",border:"none",color:"#a855f7",fontSize:10,fontWeight:600,cursor:"pointer",padding:0,textDecoration:"underline"}}>Explore →</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>);
          })()}

          {/* 70B Deep Analysis — deeper RE24/situational reasoning when 70B is enabled */}
          {showC&&stats.useLLM70B&&stats.ageGroup!=="6-8"&&stats.ageGroup!=="9-10"&&<div style={{marginTop:8}}>
            {deepAnalysisLoading&&<div style={{textAlign:"center",fontSize:11,color:"#a855f7"}}>Loading deep analysis...</div>}
            {!deepAnalysis&&!deepAnalysisLoading&&<button onClick={()=>{setDeepAnalysisLoading(true);fetch(LLM_70B_ENRICH_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({scenario:sc,choiceIdx:choice,situation:sc.situation,position:pos,playerAge:stats.ageGroup})}).then(r=>r.json()).then(d=>{setDeepAnalysis(d.enrichment||null);setDeepAnalysisLoading(false)}).catch(()=>setDeepAnalysisLoading(false))}} style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.15)",borderRadius:8,padding:"6px 14px",color:"#3b82f6",fontSize:11,fontWeight:600,cursor:"pointer",width:"100%"}}>🧠 70B Deep Analysis</button>}
            {deepAnalysis&&<div style={{background:"linear-gradient(135deg,rgba(59,130,246,.04),rgba(168,85,247,.04))",border:"1px solid rgba(59,130,246,.12)",borderRadius:12,padding:12}}>
              <div style={{fontSize:9,color:"#3b82f6",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6,textAlign:"center"}}>70B Deep Analysis</div>
              <p style={{fontSize:12,color:"#d1d5db",lineHeight:1.5,margin:0}}>{deepAnalysis}</p>
            </div>}
          </div>}

          {sc?.isAI&&stats.ageGroup!=="6-8"&&stats.ageGroup!=="9-10"&&(()=>{
            const sid=sc.id||sc._aiId;
            const flagged=stats.flaggedScenarios?.[sid];
            const alreadyFlagged=flagged&&Date.now()-new Date(flagged.lastFlagged).getTime()<86400000;
            const submitFlag=(category)=>{
              const prev=stats.flaggedScenarios?.[sid]||{count:0,lastFlagged:null,position:pos};
              const newCount=(prev.count||0)+1;
              setStats(p=>({...p,flaggedScenarios:{...(p.flaggedScenarios||{}),[sid]:{count:newCount,lastFlagged:new Date().toISOString(),position:pos,category}}}));
              setToast({e:"\u{1F914}",n:"Thanks for the feedback!",d:FLAG_CATEGORIES[category]?.desc||"We'll review this."});
              setTimeout(()=>setToast(null),2500);
              setFlagOpen(false);
              setFlagComment("");
              // Send rich feedback to server
              const scenarioSnapshot={title:sc.title,description:sc.description,options:sc.options,best:sc.best,explanations:sc.explanations,concept:sc.concept,diff:sc.diff,chosenAnswer:typeof choice==="number"?choice:null,chosenOption:typeof choice==="number"?sc.options[choice]:null};
              fetch(WORKER_BASE+'/feedback-scenario',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario_id:sid,position:pos,flag_category:category,comment:flagComment.slice(0,140),scenario_json:JSON.stringify(scenarioSnapshot)})}).catch(()=>{});
              // Report flag to pool
              if (sc.isPooled && sc.id) { reportPoolFeedback(sc.id, false, true) }
            };
            if(alreadyFlagged)return(<div style={{display:"flex",justifyContent:"center",marginTop:6,marginBottom:2}}>
              <span style={{fontSize:10,color:"#9ca3af",fontWeight:600}}>✓ Feedback received</span>
            </div>);
            return(<div style={{marginTop:6,marginBottom:2}}>
              {!flagOpen?<div style={{display:"flex",justifyContent:"center"}}>
                <button onClick={()=>setFlagOpen(true)} style={{background:"rgba(107,114,128,.06)",border:"1px solid rgba(107,114,128,.15)",borderRadius:8,padding:"4px 12px",color:"#9ca3af",fontSize:10,fontWeight:600,cursor:"pointer"}}>
                  🤔 Something off?
                </button>
              </div>:<div style={{background:"rgba(107,114,128,.04)",border:"1px solid rgba(107,114,128,.12)",borderRadius:10,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:6,textAlign:"center"}}>What felt wrong?</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",marginBottom:6}}>
                  {Object.entries(FLAG_CATEGORIES).map(([key,{label}])=>(
                    <button key={key} onClick={()=>submitFlag(key)} style={{background:"rgba(107,114,128,.08)",border:"1px solid rgba(107,114,128,.2)",borderRadius:6,padding:"3px 8px",fontSize:9,color:"#d1d5db",cursor:"pointer",fontWeight:500}}>{label}</button>
                  ))}
                </div>
                <input value={flagComment} onChange={e=>setFlagComment(e.target.value)} placeholder="Optional: tell us more (140 chars)" maxLength={140} style={{width:"100%",background:"rgba(0,0,0,.2)",border:"1px solid rgba(107,114,128,.2)",borderRadius:6,padding:"4px 8px",fontSize:9,color:"#d1d5db",outline:"none",boxSizing:"border-box"}}/>
                <div style={{display:"flex",justifyContent:"center",marginTop:4}}>
                  <button onClick={()=>{setFlagOpen(false);setFlagComment("")}} style={{fontSize:9,color:"#9ca3af",background:"none",border:"none",cursor:"pointer"}}>Cancel</button>
                </div>
              </div>}
            </div>);
          })()}
          <button onClick={next} style={{...btn(dailyMode?"linear-gradient(135deg,#d97706,#f59e0b)":"linear-gradient(135deg,#2563eb,#3b82f6)"),...{marginTop:12,boxShadow:dailyMode?"0 4px 12px rgba(245,158,11,.25)":"0 4px 12px rgba(37,99,235,.25)"}}}>{dailyMode?"Back to Home →":"Next Challenge →"}</button>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:6}}>
            <button onClick={goHome} style={ghost}>← Pick Position</button>
            <button onClick={shareChallenge} style={{...ghost,color:"#3b82f6"}}>📎 Challenge a Friend</button>
          </div>

          {/* Pro upsell (non-annoying, after outcome) */}
          {!stats.isPro&&stats.gp>5&&stats.gp%5===0&&<div style={{marginTop:12,textAlign:"center",background:"linear-gradient(135deg,rgba(245,158,11,.04),rgba(234,179,8,.02))",border:"1.5px solid rgba(245,158,11,.15)",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#f59e0b",fontWeight:700,marginBottom:4}}>{stats.displayName||"Player"} has learned {(stats.cl||[]).length} concept{(stats.cl||[]).length!==1?"s":""} in {stats.gp} games!</div>
            <div style={{fontSize:10,color:"#9ca3af",marginBottom:8}}>Unlock unlimited play, AI coaching, and 2x XP with the All-Star Pass.</div>
            <button onClick={()=>{setPanel('upgrade');trackFunnel('postgame_upsell',setStats);goHome()}} style={{background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"white",border:"none",borderRadius:10,padding:"8px 20px",fontSize:12,fontWeight:700,cursor:"pointer"}}>View All-Star Pass</button>
          </div>}
        </div>}

        {/* SEASON STAGE INTRO */}
        {screen==="seasonIntro"&&seasonStageIntro&&(()=>{
          const stIdx=SEASON_STAGES.indexOf(seasonStageIntro);
          const seasonAcc=stats.seasonGame>0?Math.round(((stats.seasonCorrect||0)/stats.seasonGame)*100):0;
          return(<div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:64,marginBottom:12,animation:"su .5s ease-out"}}>{seasonStageIntro.emoji}</div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:seasonStageIntro.color,marginBottom:6,animation:"su .5s ease-out .1s both"}}>{seasonStageIntro.name.toUpperCase()}</h2>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12,animation:"su .5s ease-out .2s both"}}>
              <span style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"3px 10px",fontSize:10,color:"#9ca3af"}}>Stage {stIdx+1} of {SEASON_STAGES.length}</span>
              <span style={{background:`${seasonStageIntro.color}15`,border:`1px solid ${seasonStageIntro.color}30`,borderRadius:8,padding:"3px 10px",fontSize:10,color:seasonStageIntro.color}}>{"⭐".repeat(seasonStageIntro.diff)} {["Rookie","Pro","All-Star"][seasonStageIntro.diff-1]}</span>
            </div>
            <div style={{...card,maxWidth:340,margin:"0 auto 16px",textAlign:"left",animation:"su .5s ease-out .3s both"}}>
              <p style={{fontSize:14,color:"#d1d5db",lineHeight:1.6,fontStyle:"italic"}}>"{seasonStageIntro.story}"</p>
            </div>
            {stats.seasonGame>0&&<div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:16,animation:"su .5s ease-out .4s both"}}>
              <div><div style={{fontSize:18,fontWeight:800,color:"#22c55e"}}>{seasonAcc}%</div><div style={{fontSize:9,color:"#9ca3af"}}>Accuracy</div></div>
              <div><div style={{fontSize:18,fontWeight:800,color:"#f59e0b"}}>{stats.seasonCorrect||0}</div><div style={{fontSize:9,color:"#9ca3af"}}>Optimal</div></div>
              <div><div style={{fontSize:18,fontWeight:800,color:"#3b82f6"}}>{stats.seasonGame}</div><div style={{fontSize:9,color:"#9ca3af"}}>Played</div></div>
            </div>}
            <button onClick={()=>{snd.play('tap');launchSeasonGame(stats.seasonGame)}} style={{...btn(`linear-gradient(135deg,${seasonStageIntro.color},${seasonStageIntro.color}cc)`),...{maxWidth:300,margin:"0 auto",boxShadow:`0 4px 15px ${seasonStageIntro.color}40`,animation:"su .5s ease-out .5s both"}}}>Play Ball!</button>
            <button onClick={goHome} style={{...ghost,display:"block",margin:"8px auto"}}>← Back to Home</button>
          </div>);
        })()}

        {/* SURVIVAL GAME OVER */}
        {/* REAL GAME OVER — Box Score Summary */}
        {screen==="realGameOver"&&realGame&&(()=>{
          const won=realGame.playerScore>realGame.opponentScore;const tied=realGame.playerScore===realGame.opponentScore;
          const gameIQ=computeBaseballIQ({...stats,gp:realGame.results.length,ps:Object.fromEntries(realGame.results.map(r=>[r.pos,{p:1,c:r.isOpt?1:0}]))});
          const greens=realGame.results.filter(r=>r.cat==="success").length;
          const yellows=realGame.results.filter(r=>r.cat==="warning").length;
          const reds=realGame.results.filter(r=>r.cat==="danger").length;
          const shareText=`⚾ I ${won?"won":"lost"} ${realGame.playerScore}-${realGame.opponentScore} with a Baseball IQ of ${gameIQ} in Baseball Strategy Master!`;
          return(<div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:56,marginBottom:6}}>{won?"🏆":tied?"🤝":"📉"}</div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:won?"#f59e0b":tied?"#60a5fa":"#ef4444",marginBottom:2}}>
              {won?"YOU WIN!":tied?"TIE GAME":"TOUGH LOSS"}
            </h2>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:48,letterSpacing:3,color:"white",marginBottom:4}}>
              {realGame.playerScore} — {realGame.opponentScore}
            </div>
            <p style={{color:"#9ca3af",fontSize:12,marginBottom:16}}>Final Score · 9 Innings</p>

            {/* Game IQ Card */}
            {(()=>{const careerIQ=computeBaseballIQ(stats);const gC=getIQColor(gameIQ);const cC=getIQColor(careerIQ);const gLabel=gameIQ>=140?"Elite":gameIQ>=120?"Advanced":gameIQ>=100?"Solid":gameIQ>=80?"Developing":"Rookie";const gPct=Math.min(100,Math.round(((gameIQ-50)/110)*100));return(
              <div style={{margin:"0 auto 16px",maxWidth:300,padding:"14px 16px",background:"linear-gradient(135deg,rgba(0,0,0,.4),rgba(0,0,0,.25))",border:`1.5px solid ${gC}30`,borderRadius:16,boxShadow:`0 4px 20px ${gC}15`}}>
                <div style={{fontSize:9,color:"#9ca3af",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:4,textAlign:"center"}}>Game IQ</div>
                <div style={{fontSize:40,fontWeight:900,color:gC,letterSpacing:2,textShadow:`0 0 20px ${gC}40`,textAlign:"center"}}>{gameIQ}</div>
                <div style={{fontSize:10,color:gC,fontWeight:700,marginBottom:8,letterSpacing:1,textAlign:"center"}}>{gLabel}</div>
                <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
                  <div style={{height:"100%",width:`${gPct}%`,background:`linear-gradient(90deg,${gC}60,${gC})`,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
                  {[{v:greens,l:"Perfect",c:"#22c55e"},{v:yellows,l:"OK",c:"#f59e0b"},{v:reds,l:"Missed",c:"#ef4444"},{v:careerIQ,l:"Career IQ",c:cC}].map((s,i)=>(
                    <div key={i}><div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>{s.l}</div></div>
                  ))}
                </div>
                <div style={{fontSize:8,color:"#9ca3af",marginTop:8,letterSpacing:1,textAlign:"center"}}>⚾ Baseball Strategy Master</div>
              </div>
            )})()}

            {/* Inning-by-inning breakdown */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Box Score</div>
              <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:4}}>
                {realGame.results.map((r,i)=>(
                  <div key={i} style={{width:28,textAlign:"center"}}>
                    <div style={{fontSize:8,color:"#9ca3af",marginBottom:2}}>{i+1}</div>
                    <div style={{width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,background:r.cat==="success"?"rgba(34,197,94,.12)":r.cat==="warning"?"rgba(245,158,11,.12)":"rgba(239,68,68,.12)",color:r.cat==="success"?"#22c55e":r.cat==="warning"?"#f59e0b":"#ef4444",border:`1px solid ${r.cat==="success"?"rgba(34,197,94,.2)":r.cat==="warning"?"rgba(245,158,11,.2)":"rgba(239,68,68,.2)"}`}}>
                      {r.cat==="success"?"✓":r.cat==="warning"?"~":"✗"}
                    </div>
                    <div style={{fontSize:7,color:"#9ca3af",marginTop:1}}>{r.pDelta>0?`+${r.pDelta}`:r.oDelta>0?`-${r.oDelta}`:"·"}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:12,fontSize:10,color:"#9ca3af",marginTop:4}}>
                <span style={{color:"#3b82f6"}}>YOU: {realGame.results.map((_,i)=>{let s=0;for(let j=0;j<=i;j++)s+=realGame.results[j].pDelta;return s}).pop()||0}</span>
                <span style={{color:"#ef4444"}}>OPP: {realGame.results.map((_,i)=>{let s=0;for(let j=0;j<=i;j++)s+=realGame.results[j].oDelta;return s}).pop()||0}</span>
              </div>
            </div>

            {/* Play-by-play */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Play-by-Play</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {realGame.results.map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:r.cat==="success"?"rgba(34,197,94,.04)":r.cat==="warning"?"rgba(245,158,11,.04)":"rgba(239,68,68,.04)",border:`1px solid ${r.cat==="success"?"rgba(34,197,94,.1)":r.cat==="warning"?"rgba(245,158,11,.1)":"rgba(239,68,68,.1)"}`,borderRadius:8,padding:"5px 10px",textAlign:"left"}}>
                    <span style={{fontSize:11,fontWeight:800,color:"#9ca3af",width:20,flexShrink:0}}>#{i+1}</span>
                    <span style={{fontSize:13,flexShrink:0}}>{r.cat==="success"?"✅":r.cat==="warning"?"🟡":"❌"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:"#d1d5db",lineHeight:1.3}}>{POS_META[r.pos]?.emoji} {r.concept}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {won&&<div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"8px 16px",display:"inline-block",marginBottom:12}}>
              <span style={{fontSize:13,fontWeight:800,color:"#f59e0b"}}>🏆 2x XP Bonus for the Win!</span>
            </div>}

            {navigator.share&&<button onClick={()=>{try{navigator.share({text:shareText})}catch{}}} style={{...btn("linear-gradient(135deg,#2563eb,#3b82f6)"),...{marginBottom:6}}}>📤 Share Result</button>}
            <button onClick={startRealGame} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{marginBottom:6,boxShadow:"0 4px 12px rgba(245,158,11,.25)"}}}>⚾ Play Again</button>
            <button onClick={goHome} style={{...btn("rgba(255,255,255,.06)"),...{fontSize:12}}}>← Back to Home</button>
          </div>);
        })()}

        {screen==="survivalOver"&&survivalRun&&(()=>{
          const count=survivalRun.count;const best=Math.max(stats.survivalBest||0,count);const isNewBest=count>=(stats.survivalBest||0)&&count>0;
          const hist=survivalRun.history||[];
          return(<div style={{textAlign:"center",padding:"30px 0"}}>
            <div style={{fontSize:56,marginBottom:8}}>💀</div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,letterSpacing:2,color:"#ef4444",marginBottom:4}}>GAME OVER</h2>
            <p style={{color:"#9ca3af",fontSize:12,marginBottom:16}}>You survived {count} scenario{count!==1?"s":""}!</p>
            {isNewBest&&<div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10,padding:"8px 16px",display:"inline-block",marginBottom:12}}>
              <span style={{fontSize:13,fontWeight:800,color:"#f59e0b"}}>🏆 NEW PERSONAL BEST!</span>
            </div>}
            <div style={{display:"flex",justifyContent:"space-around",maxWidth:300,margin:"0 auto 16px"}}>
              {[{v:count,l:"Survived",c:"#a855f7"},{v:survivalRun.pts,l:"Points",c:"#f59e0b"},{v:best,l:"Best Ever",c:"#22c55e"}].map((s,i)=>(
                <div key={i}><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#9ca3af",marginTop:1}}>{s.l}</div></div>
              ))}
            </div>
            {od&&<div style={{...card,textAlign:"left",marginBottom:12}}>
              <div style={{fontSize:9,color:"#ef4444",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>What ended your run</div>
              <p style={{fontSize:12,color:"#d1d5db",lineHeight:1.4,marginBottom:4}}>{od.exp}</p>
              <div style={{fontSize:9,color:"#22c55e",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Best strategy</div>
              <p style={{fontSize:12,color:"#d1d5db",lineHeight:1.4}}>"{od.bestOpt}" — {od.bestExp}</p>
            </div>}
            {hist.length>0&&<div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:"#a855f7",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Full Run Review</div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {hist.map((h,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:h.isOpt?"rgba(34,197,94,.04)":"rgba(239,68,68,.04)",border:`1px solid ${h.isOpt?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)"}`,borderRadius:8,padding:"6px 10px",textAlign:"left"}}>
                    <span style={{fontSize:14,flexShrink:0}}>{h.isOpt?"✅":"❌"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:"#d1d5db",lineHeight:1.3}}>{POS_META[h.pos]?.emoji} {h.concept}</div>
                      {!h.isOpt&&<div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>Best: "{h.bestOpt}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>}
            <button onClick={startSurvival} style={{...btn("linear-gradient(135deg,#7c3aed,#a855f7)"),...{marginBottom:6,boxShadow:"0 4px 12px rgba(168,85,247,.25)"}}}>💀 Try Again</button>
            <button onClick={goHome} style={{...btn("rgba(255,255,255,.06)"),...{fontSize:12}}}>← Back to Home</button>
          </div>);
        })()}

        {/* SITUATION ROOM — PICKER */}
        {screen==="sitPicker"&&(()=>{
          const gradeBadge={S:{emoji:"⭐",color:"#f59e0b",border:"rgba(245,158,11,.3)"},A:{emoji:"A",color:"#22c55e",border:"rgba(34,197,94,.3)"},B:{emoji:"B",color:"#3b82f6",border:"rgba(59,130,246,.3)"},C:{emoji:"C",color:"#f59e0b",border:"rgba(245,158,11,.3)"},D:{emoji:"D",color:"#9ca3af",border:"rgba(107,114,128,.3)"}};
          const tiers=[
            {diff:1,label:"Rookie",stars:"⭐",color:"#22c55e",accent:"rgba(34,197,94,"},
            {diff:2,label:"Pro",stars:"⭐⭐",color:"#3b82f6",accent:"rgba(59,130,246,"},
            {diff:3,label:"All-Star",stars:"⭐⭐⭐",color:"#a855f7",accent:"rgba(168,85,247,"}
          ];
          // Default tab: match age group (6-8→Rookie, 9-10→Pro, 11+→All-Star) or use level
          const ageMaxDiff=(AGE_GROUPS.find(a=>a.id===stats.ageGroup)||AGE_GROUPS[2]).maxDiff;
          const defaultTab=Math.min(ageMaxDiff,3);
          const activeTab=sitTab||defaultTab;
          // All-Star unlock: need 3+ "A" or better grades at Pro level
          const proAGrades=SITUATION_SETS.filter(s=>s.diff===2).filter(s=>{const g=stats.sitMastery?.[s.id]?.bestGrade;return g==="S"||g==="A"}).length;
          const allStarLocked=proAGrades<3;
          // Filter sets for active tab
          const tabSets=SITUATION_SETS.filter(s=>s.diff===activeTab);
          // Relevance scoring for recommendation
          const ps=stats.ps||{};const cm=(stats.masteryData?.concepts)||{};
          const weakPositions=new Set();
          Object.entries(ps).filter(([,v])=>v.p>=5&&(v.c/v.p)<0.5).forEach(([p])=>weakPositions.add(p));
          Object.keys(POS_META).filter(p=>!ps[p]||ps[p].p===0).forEach(p=>weakPositions.add(p));
          const dueOrDegraded=new Set();
          const now=new Date();
          Object.entries(cm).forEach(([tag,v])=>{if(v.state==="degraded"||(v.state!=="unseen"&&v.state!=="mastered"))dueOrDegraded.add(tag);if(v.state==="mastered"&&v.nextReviewDate&&new Date(v.nextReviewDate)<=now)dueOrDegraded.add(tag)});
          const getSitRelevance=(set)=>{
            let score=0;
            set.questions.forEach(q=>{if(weakPositions.has(q.pos))score+=10;if(q.conceptTag&&dueOrDegraded.has(q.conceptTag))score+=15});
            if(!stats.sitMastery?.[set.id]?.lastPlayed)score+=5;
            const bg=stats.sitMastery?.[set.id]?.bestGrade;if(bg&&bg!=="S"&&bg!=="A"&&bg!=="B")score+=10;
            return score;
          };
          // Sort: highest relevance first, then oldest played
          const sortedSets=[...tabSets].sort((a,b)=>{
            const aScore=getSitRelevance(a);const bScore=getSitRelevance(b);
            if(bScore!==aScore)return bScore-aScore;
            const aTime=stats.sitMastery?.[a.id]?.lastPlayed||0;
            const bTime=stats.sitMastery?.[b.id]?.lastPlayed||0;
            return aTime-bTime;
          });
          // Aggregate stats
          const totalSets=SITUATION_SETS.length;
          const masteredCount=SITUATION_SETS.filter(s=>{const g=stats.sitMastery?.[s.id]?.bestGrade;return g==="S"||g==="A"}).length;
          const activeTier=tiers.find(t=>t.diff===activeTab)||tiers[1];
          const rank=getSitRank(stats.sitMastery);
          return(<div style={{padding:"20px 0"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:42,marginBottom:4}}>🏟️</div>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:"#10b981",marginBottom:4}}>SITUATION ROOM</h2>
              <p style={{color:"#9ca3af",fontSize:11}}>{masteredCount} of {totalSets} mastered · {rank.emoji} {rank.title}</p>
            </div>
            {/* DIFFICULTY TABS */}
            <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              {tiers.map(t=>{
                const active=activeTab===t.diff;
                const locked=t.diff===3&&allStarLocked;
                return(<button key={t.diff} onClick={()=>{if(!locked)setSitTab(t.diff)}} style={{flex:1,background:"none",border:"none",borderBottom:active?`2px solid ${t.color}`:"2px solid transparent",padding:"10px 4px 8px",cursor:locked?"not-allowed":"pointer",opacity:locked?.45:1,transition:"all .15s"}}>
                  <div style={{fontSize:12,marginBottom:2}}>{t.stars}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:1,color:active?t.color:"#9ca3af"}}>{t.label}</div>
                  {locked&&<div style={{fontSize:8,color:"#9ca3af",marginTop:2}}>🔒 Get 3 A's at Pro</div>}
                </button>);
              })}
            </div>
            {/* CARD GRID */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {sortedSets.map(set=>{
                const sm=stats.sitMastery?.[set.id];const bg=sm?.bestGrade;const badge=bg?gradeBadge[bg]:null;
                const tier=getSitTier(set.id,stats.sitMastery);
                const isRec=getSitRelevance(set)>15;
                return(
                <div key={set.id} onClick={()=>startSituation(set)} style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.05)",borderLeft:`3px solid ${set.color}`,borderRadius:12,padding:"12px 10px",cursor:"pointer",transition:"transform .15s",position:"relative",display:"flex",flexDirection:"column",gap:6}}>
                  {/* Top row: emoji + title + tier badge */}
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:22}}>{set.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:set.color,letterSpacing:.5,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{set.title.replace(/ \(.*\)$/,"")}</div>
                    </div>
                    {tier&&<span style={{fontSize:14,flexShrink:0}} title={tier.label}>{tier.emoji}</span>}
                  </div>
                  {/* Grade + difficulty stars */}
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {badge?<span style={{background:`${badge.color}15`,border:`1px solid ${badge.border}`,borderRadius:5,padding:"0 5px",fontSize:10,fontWeight:800,color:badge.color,lineHeight:"18px"}}>{badge.emoji}</span>
                      :<span style={{background:"rgba(255,255,255,.06)",borderRadius:5,padding:"0 5px",fontSize:9,fontWeight:700,color:"#9ca3af",lineHeight:"18px"}}>NEW</span>}
                    <span style={{fontSize:9,color:"#9ca3af"}}>{set.diff===1?"⭐":set.diff===2?"⭐⭐":"⭐⭐⭐"}</span>
                  </div>
                  {/* Position icons row */}
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                    {set.questions.map(q=><span key={q.id} title={POS_META[q.pos]?.label} style={{fontSize:13}}>{POS_META[q.pos]?.emoji}</span>)}
                  </div>
                  {/* Footer: attempts + recommended */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"auto"}}>
                    <span style={{fontSize:9,color:"#9ca3af"}}>{sm?`Played ${sm.attempts}x`:"NEW!"}</span>
                    {isRec&&<span style={{fontSize:8,color:"#f59e0b",fontWeight:700}}>📍 Rec</span>}
                  </div>
                </div>);
              })}
            </div>
            {/* AI Situation button (Pro only) */}
            {stats.isPro&&!aiSitLoading&&<button onClick={async()=>{
              setAiSitLoading(true);snd.play('tap');
              const ctrl=new AbortController();aiSitAbortRef.current=ctrl;
              const timeout=setTimeout(()=>{ctrl.abort();setAiSitLoading(false);setToast({e:"⏰",n:"Timed Out",d:"Couldn't create a situation right now. Try a handcrafted one!"});setTimeout(()=>setToast(null),4000)},45000);
              try{
                const result=await generateAISituation(stats,ctrl.signal);
                clearTimeout(timeout);
                if(result){
                  setStats(p=>({...p,aiSitCount:(p.aiSitCount||0)+1}));
                  startSituation(result);
                }else{
                  // Fallback: pick an unplayed or lowest-grade handcrafted set
                  const tabDiff=activeTab||2;const pool=SITUATION_SETS.filter(s=>s.diff===tabDiff);
                  const unplayed=pool.filter(s=>!stats.sitMastery?.[s.id]?.lastPlayed);
                  const fallback=unplayed.length>0?unplayed[Math.floor(Math.random()*unplayed.length)]
                    :pool.sort((a,b)=>{const ga={D:1,C:2,B:3,A:4,S:5};return(ga[stats.sitMastery?.[a.id]?.bestGrade]||0)-(ga[stats.sitMastery?.[b.id]?.bestGrade]||0)})[0]||pool[0];
                  if(fallback){startSituation(fallback);setToast({e:"🏟️",n:"AI Unavailable",d:"Here's a handcrafted situation instead!"});setTimeout(()=>setToast(null),3000)}
                }
              }catch(e){
                clearTimeout(timeout);
                if(e.name!=="AbortError"){setToast({e:"❌",n:"Generation Failed",d:"Couldn't create a situation. Try a handcrafted one!"});setTimeout(()=>setToast(null),4000)}
              }finally{setAiSitLoading(false);aiSitAbortRef.current=null}
            }} style={{...btn("linear-gradient(135deg,#8b5cf6,#7c3aed)"),...{display:"block",margin:"14px auto 0",maxWidth:300,boxShadow:"0 4px 12px rgba(139,92,246,.25)"}}}>
              🤖 AI Situation — Custom for You
            </button>}
            {aiSitLoading&&<div style={{textAlign:"center",margin:"14px auto 0",maxWidth:300}}>
              <div style={{background:"rgba(139,92,246,.06)",border:"1px solid rgba(139,92,246,.15)",borderRadius:12,padding:"16px 14px"}}>
                <div style={{fontSize:28,marginBottom:8,animation:"su .5s ease-out infinite alternate"}}>🤖</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#8b5cf6",letterSpacing:1,marginBottom:4}}>CREATING YOUR SITUATION...</div>
                <div style={{fontSize:10,color:"#9ca3af",marginBottom:10}}>Building a multi-position situation — this takes 20-40 seconds</div>
                <button onClick={()=>{if(aiSitAbortRef.current){aiSitAbortRef.current.abort();aiSitAbortRef.current=null}setAiSitLoading(false)}} style={{...ghost,fontSize:10,color:"#ef4444"}}>Cancel</button>
              </div>
            </div>}
            {!stats.isPro&&<div style={{textAlign:"center",margin:"14px auto 0",maxWidth:300,opacity:.5}}>
              <div style={{background:"rgba(139,92,246,.04)",border:"1px solid rgba(139,92,246,.08)",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#9ca3af"}}>🤖 AI Situations — <span style={{color:"#f59e0b",fontWeight:700}}>Pro</span></div>
            </div>}
            <button onClick={goHome} style={{...ghost,display:"block",margin:"16px auto"}}>← Back to Home</button>
          </div>);
        })()}

        {/* SITUATION ROOM — INTRO */}
        {screen==="sitIntro"&&sitSet&&(()=>{
          const sit=sitSet.situation;
          const runnerNames=[];if(sit.runners.includes(1))runnerNames.push("1st");if(sit.runners.includes(2))runnerNames.push("2nd");if(sit.runners.includes(3))runnerNames.push("3rd");
          const runnerStr=runnerNames.length>0?runnerNames.join(", "):"None";
          return(<div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:6,animation:"su .4s ease-out"}}>{sitSet.emoji}</div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:sitSet.color,marginBottom:4,animation:"su .4s ease-out .1s both"}}>{sitSet.title}{sitSet.isAI&&<span style={{fontSize:10,background:"rgba(139,92,246,.15)",color:"#a78bfa",padding:"2px 8px",borderRadius:6,marginLeft:8,verticalAlign:"middle",fontFamily:"system-ui",letterSpacing:0}}>🤖 AI</span>}</h2>
            <p style={{color:"#9ca3af",fontSize:12,lineHeight:1.5,maxWidth:320,margin:"0 auto 16px",animation:"su .4s ease-out .15s both"}}>{sitSet.desc}</p>
            <div style={{background:"rgba(0,0,0,.3)",borderRadius:12,padding:6,marginBottom:14,border:"1px solid rgba(255,255,255,.04)",animation:"su .4s ease-out .2s both"}}>
              <Field pos="pitcher" runners={sit.runners} anim="freeze" theme={FIELD_THEMES.find(th=>th.id===stats.fieldTheme)||FIELD_THEMES[0]} avatar={{j:stats.avatarJersey||0,c:stats.avatarCap||0,b:stats.avatarBat||0}}/>
            </div>
            <div style={{...card,textAlign:"left",marginBottom:14,animation:"su .4s ease-out .25s both"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#9ca3af",letterSpacing:1,marginBottom:8}}>GAME STATE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px",fontSize:12}}>
                <div><span style={{color:"#9ca3af"}}>Inning:</span> <span style={{color:"#d1d5db",fontWeight:700}}>{sit.inning}</span></div>
                <div><span style={{color:"#9ca3af"}}>Outs:</span> <span style={{color:"#d1d5db",fontWeight:700}}>{sit.outs}</span></div>
                <div><span style={{color:"#9ca3af"}}>Count:</span> <span style={{color:"#d1d5db",fontWeight:700}}>{sit.count}</span></div>
                <div><span style={{color:"#9ca3af"}}>Score:</span> <span style={{color:"#d1d5db",fontWeight:700}}>{sit.score}</span></div>
                <div style={{gridColumn:"1/-1"}}><span style={{color:"#9ca3af"}}>Runners:</span> <span style={{color:"#d1d5db",fontWeight:700}}>{runnerStr}</span></div>
              </div>
            </div>
            <div style={{marginBottom:16,animation:"su .4s ease-out .3s both"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#9ca3af",letterSpacing:1,marginBottom:8}}>YOU WILL PLAY AS</div>
              <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
                {sitSet.questions.map((q,i)=><div key={q.id} style={{background:`${POS_META[q.pos]?.color}12`,border:`1px solid ${POS_META[q.pos]?.color}30`,borderRadius:10,padding:"8px 14px",textAlign:"center",minWidth:70}}>
                  <div style={{fontSize:20,marginBottom:2}}>{POS_META[q.pos]?.emoji}</div>
                  <div style={{fontSize:10,fontWeight:700,color:POS_META[q.pos]?.color}}>{POS_META[q.pos]?.label}</div>
                  <div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>Q{i+1}</div>
                </div>)}
              </div>
            </div>
            <button onClick={()=>launchSitQuestion(sitSet,0)} style={{...btn(`linear-gradient(135deg,${sitSet.color},${sitSet.color}cc)`),...{maxWidth:300,margin:"0 auto",boxShadow:`0 4px 15px ${sitSet.color}40`,animation:"su .4s ease-out .35s both"}}}>Play Ball!</button>
            <button onClick={goHome} style={{...ghost,display:"block",margin:"8px auto"}}>← Back to Home</button>
          </div>);
        })()}

        {/* SITUATION ROOM — RESULTS (Film Room) */}
        {screen==="sitResults"&&sitSet&&(()=>{
          const total=sitResults.length;const correct=sitResults.filter(r=>r.correct).length;
          const pct=total>0?Math.round((correct/total)*100):0;
          const totalXp=sitResults.reduce((s,r)=>s+r.xp,0);
          const grade=pct===100?"S":pct>=80?"A":pct>=60?"B":pct>=40?"C":"D";
          const gradeColor=grade==="S"?"#f59e0b":pct>=80?"#22c55e":pct>=60?"#f59e0b":"#ef4444";
          // Track sitMastery (one-time per render, keyed by sitSet.id)
          if(sitSet&&!stats.sitMastery?.[sitSet.id]?.lastPlayed||Date.now()-(stats.sitMastery?.[sitSet.id]?.lastPlayed||0)>2000){
            const setId=sitSet.id;const prev=stats.sitMastery?.[setId]||{bestGrade:null,attempts:0,grades:[],perfectCount:0,lastPlayed:null};
            const gradeRank={S:5,A:4,B:3,C:2,D:1};const newBest=!prev.bestGrade||gradeRank[grade]>gradeRank[prev.bestGrade]?grade:prev.bestGrade;
            const newMastery={bestGrade:newBest,attempts:prev.attempts+1,grades:[...prev.grades.slice(-9),grade],perfectCount:prev.perfectCount+(pct===100?1:0),lastPlayed:Date.now()};
            if(!prev.lastPlayed||Date.now()-prev.lastPlayed>2000){
              const today=new Date().toDateString();const dailySit=getDailySituation();const isDailySit=sitSet.id===dailySit.id;
              setStats(p=>{
                const upd={...p,sitMastery:{...p.sitMastery,[setId]:newMastery}};
                if(isDailySit&&p.dailySitDate!==today){
                  const yesterday=new Date(Date.now()-86400000).toDateString();
                  const streak=p.lastDailySitDate===yesterday?(p.dailySitStreak||0)+1:1;
                  upd.dailySitDone=true;upd.dailySitDate=today;upd.dailySitStreak=streak;upd.dailySitBestStreak=Math.max(streak,p.dailySitBestStreak||0);upd.lastDailySitDate=today;
                }
                return upd;
              })
            }
          }
          const inFilm=filmStep>=0&&filmStep<total;
          const isSummary=filmStep>=total;
          const filmAdvance=()=>{if(filmTimerRef.current){clearTimeout(filmTimerRef.current);filmTimerRef.current=null}setFilmStep(s=>s+1)};
          const filmSkip=()=>{if(filmTimerRef.current){clearTimeout(filmTimerRef.current);filmTimerRef.current=null}setFilmStep(total)};
          // Auto-advance timer for film steps (4s per step)
          if(inFilm){
            if(filmTimerRef.current)clearTimeout(filmTimerRef.current);
            filmTimerRef.current=setTimeout(filmAdvance,4000);
          }
          // Position highlight coordinates for SVG glow overlay
          const POS_COORDS={pitcher:{x:200,y:212},catcher:{x:200,y:300},firstBase:{x:290,y:210},secondBase:{x:245,y:165},shortstop:{x:155,y:165},thirdBase:{x:110,y:210},leftField:{x:80,y:90},centerField:{x:200,y:60},rightField:{x:320,y:90},batter:{x:215,y:285},baserunner:{x:240,y:250},manager:{x:60,y:290}};
          const sit=sitSet.situation;
          const thm=FIELD_THEMES.find(th=>th.id===stats.fieldTheme)||FIELD_THEMES[0];
          const av={j:stats.avatarJersey||0,c:stats.avatarCap||0,b:stats.avatarBat||0};
          return(<div style={{padding:"20px 0"}}>
            {/* HEADER — always visible */}
            <div style={{textAlign:"center",marginBottom:inFilm?10:16}}>
              <div style={{fontSize:inFilm?32:48,marginBottom:4,transition:"font-size .3s"}}>{inFilm?"🎬":"🏟️"}</div>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:inFilm?20:26,letterSpacing:2,color:sitSet.color,marginBottom:4,transition:"font-size .3s"}}>{inFilm?"FILM ROOM":"SITUATION COMPLETE"}</h2>
              <p style={{color:"#9ca3af",fontSize:12,marginBottom:inFilm?6:14}}>{sitSet.title}</p>
              <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:inFilm?8:14}}>
                <div><div style={{fontSize:inFilm?24:36,fontWeight:800,color:gradeColor,transition:"font-size .3s"}}>{grade}</div><div style={{fontSize:9,color:"#9ca3af"}}>Grade</div></div>
                <div><div style={{fontSize:inFilm?16:22,fontWeight:800,color:"#22c55e",transition:"font-size .3s"}}>{correct}/{total}</div><div style={{fontSize:9,color:"#9ca3af"}}>Optimal</div></div>
                <div><div style={{fontSize:inFilm?16:22,fontWeight:800,color:"#f59e0b",transition:"font-size .3s"}}>{totalXp}</div><div style={{fontSize:9,color:"#9ca3af"}}>XP Earned</div></div>
              </div>
            </div>

            {/* FILM ROOM — not started (filmStep === -1) */}
            {filmStep===-1&&<div style={{textAlign:"center",animation:"fi .3s ease-out"}}>
              <button onClick={()=>setFilmStep(0)} style={{...btn(`linear-gradient(135deg,${sitSet.color},${sitSet.color}cc)`),...{maxWidth:300,margin:"0 auto 8px",boxShadow:`0 4px 12px ${sitSet.color}40`}}}>🎬 Watch Film Room</button>
              <button onClick={filmSkip} style={{...ghost,display:"block",margin:"0 auto 8px",fontSize:11}}>Skip to Summary →</button>
            </div>}

            {/* FILM ROOM — step-through mode */}
            {inFilm&&(()=>{
              const r=sitResults[filmStep];const q=sitSet.questions[filmStep];const pm=POS_META[r?.pos];
              const bestExp=q?.explanations?.[q?.best]||"";
              const chosenText=q?.options?.[r?.choice]||"";
              const bestText=q?.options?.[q?.best]||"";
              const coord=POS_COORDS[r?.pos]||{x:200,y:200};
              return(<div onClick={filmAdvance} style={{animation:"fi .3s ease-out"}}>
                {/* Skip + progress row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {sitResults.map((_,i)=>{const done=i<filmStep;const cur=i===filmStep;const ri=sitResults[i];return(
                      <div key={i} style={{width:cur?10:8,height:cur?10:8,borderRadius:"50%",background:done?(ri.correct?"#22c55e":"#ef4444"):cur?pm?.color||"#3b82f6":"rgba(255,255,255,.12)",transition:"all .3s",boxShadow:cur?`0 0 8px ${pm?.color||"#3b82f6"}50`:undefined}}/>
                    )})}
                  </div>
                  <button onClick={e=>{e.stopPropagation();filmSkip()}} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"4px 10px",fontSize:10,color:"#9ca3af",cursor:"pointer"}}>Skip to Summary →</button>
                </div>
                {/* Field with position highlight glow */}
                <div style={{background:"rgba(0,0,0,.3)",borderRadius:12,padding:4,marginBottom:10,border:`1px solid ${pm?.color||"#3b82f6"}20`,position:"relative",overflow:"hidden"}}>
                  <Field pos={r.pos} runners={sit.runners} anim="freeze" theme={thm} avatar={av}/>
                  {/* SVG glow overlay for highlighted position */}
                  <svg viewBox="0 0 400 340" style={{position:"absolute",top:4,left:4,right:4,bottom:4,width:"calc(100% - 8px)",height:"calc(100% - 8px)",pointerEvents:"none"}}>
                    <defs>
                      <radialGradient id={`filmGlow${filmStep}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={pm?.color||"#3b82f6"} stopOpacity=".35"/>
                        <stop offset="100%" stopColor={pm?.color||"#3b82f6"} stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                    <circle cx={coord.x} cy={coord.y} r="28" fill={`url(#filmGlow${filmStep})`}>
                      <animate attributeName="r" values="24;32;24" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="1;.6;1" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx={coord.x} cy={coord.y} r="18" fill="none" stroke={pm?.color||"#3b82f6"} strokeWidth="1.5" opacity=".5">
                      <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values=".5;.15;.5" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>
                {/* Position banner */}
                <div key={filmStep} style={{textAlign:"center",marginBottom:10,animation:"su .35s ease-out"}}>
                  <div style={{fontSize:36,marginBottom:4}}>{pm?.emoji}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:pm?.color||"#d1d5db"}}>{pm?.label}</div>
                  <div style={{fontSize:10,color:"#9ca3af"}}>Position {filmStep+1} of {total}</div>
                </div>
                {/* Choice + result card */}
                <div key={"c"+filmStep} style={{...card,textAlign:"left",marginBottom:10,animation:"su .4s ease-out .1s both"}}>
                  <div style={{fontSize:11,color:"#9ca3af",marginBottom:4}}>You chose:</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#d1d5db",marginBottom:8,borderLeft:`3px solid ${r.correct?"#22c55e":"#ef4444"}`,paddingLeft:8}}>"{chosenText}"</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                    <span style={{fontSize:18}}>{r.correct?"✅":"❌"}</span>
                    <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:r.correct?"#22c55e":"#ef4444"}}>{r.correct?"Optimal!":"Not quite..."}</span>
                    <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:"#f59e0b"}}>+{r.xp} XP</span>
                  </div>
                  {!r.correct&&<div style={{fontSize:11,color:"#22c55e",marginBottom:6,fontWeight:600}}>Best answer: "{bestText}"</div>}
                  <div style={{fontSize:11,color:"#d1d5db",lineHeight:1.5,maxHeight:130,overflowY:"auto"}}>{bestExp}</div>
                </div>
                {/* Auto-advance progress bar (4s) */}
                <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                  <div key={"bar"+filmStep} style={{height:"100%",background:pm?.color||"#3b82f6",borderRadius:2,animation:"filmBar 4s linear"}}/>
                </div>
                <div style={{textAlign:"center",marginTop:6}}>
                  <span style={{fontSize:9,color:"#9ca3af"}}>Tap anywhere to continue</span>
                </div>
              </div>);
            })()}

            {/* SUMMARY VIEW — after all film steps or skipped */}
            {isSummary&&(()=>{const tier=getSitTier(sitSet.id,stats.sitMastery);const prevTier=getSitTier(sitSet.id,{...stats.sitMastery,[sitSet.id]:{...(stats.sitMastery?.[sitSet.id]||{}),bestGrade:stats.sitMastery?.[sitSet.id]?.grades?.slice(-2,-1)?.[0]||null}});const isNewTier=tier&&(!prevTier||tier.id!==prevTier.id);return(<div style={{animation:"fi .4s ease-out"}}>
              {pct===100&&<div style={{textAlign:"center",marginBottom:12}}>
                <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,padding:"8px 16px",display:"inline-block"}}>
                  <span style={{fontSize:13,fontWeight:800,color:"#22c55e"}}>🏆 PERFECT! You nailed every position!</span>
                </div>
              </div>}
              {tier&&<div style={{textAlign:"center",marginBottom:12}}>
                <div style={{background:`${tier.bg}.06)`,border:`1px solid ${tier.bg}.15)`,borderRadius:12,padding:"10px 18px",display:"inline-block"}}>
                  <div style={{fontSize:28,marginBottom:2}}>{tier.emoji}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1,color:tier.color}}>{isNewTier?"NEW: ":""}{tier.label} Tier{isNewTier?" Earned!":""}</div>
                </div>
              </div>}
              {/* Position breakdown */}
              <div style={{...card,textAlign:"left",marginBottom:12}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"#9ca3af",letterSpacing:1,marginBottom:8}}>POSITION BREAKDOWN</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {sitResults.map((r,i)=>{const q=sitSet.questions[i];const pm=POS_META[r.pos];return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:r.correct?"rgba(34,197,94,.04)":"rgba(239,68,68,.04)",border:`1px solid ${r.correct?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)"}`,borderRadius:8,padding:"6px 10px"}}>
                      <span style={{fontSize:16}}>{r.correct?"✅":"❌"}</span>
                      <span style={{fontSize:12,fontWeight:700,color:pm?.color||"#d1d5db"}}>{pm?.emoji} {pm?.label}</span>
                      <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:"#f59e0b"}}>+{r.xp}</span>
                    </div>
                  )})}
                </div>
              </div>
              {/* Debrief + teamwork takeaway */}
              <div style={{...card,textAlign:"left",marginBottom:14}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:sitSet.color,letterSpacing:1,marginBottom:6}}>🎬 HOW THE PLAY UNFOLDED</div>
                <p style={{fontSize:12,color:"#9ca3af",lineHeight:1.5,marginBottom:8}}>{sitSet.debrief||sitSet.desc}</p>
                <div style={{padding:"8px 10px",background:"rgba(168,85,247,.04)",border:"1px solid rgba(168,85,247,.1)",borderRadius:8}}>
                  <div style={{fontSize:10,color:"#a855f7",fontWeight:700,marginBottom:3}}>💡 Teamwork Takeaway</div>
                  <div style={{fontSize:11,color:"#d1d5db",lineHeight:1.45}}>
                    {sitSet.teamworkTakeaway||"Every position's decision connects to every other position's decision. That's what makes baseball a team sport."}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <button onClick={()=>setFilmStep(0)} style={{...ghost,display:"block",margin:"0 auto 4px",fontSize:10}}>🎬 Watch Film Room Again</button>
              <button onClick={()=>setScreen("sitPicker")} style={{...btn(`linear-gradient(135deg,${sitSet.color},${sitSet.color}cc)`),...{marginBottom:6,boxShadow:`0 4px 12px ${sitSet.color}40`}}}>🏟️ Play Another</button>
              <button onClick={goHome} style={{...btn("rgba(255,255,255,.06)"),...{fontSize:12}}}>← Back to Home</button>
            </div>)})()}
          </div>);
        })()}

        {/* Sprint D3: CHALLENGE PACK RESULTS */}
        {challengePack&&challengePack.done&&screen==="play"&&(()=>{
          const cp=challengePack;const correct=cp.correct;const total=cp.totalPts;
          const isCreator=cp.creating;const won=cp.winner==="challenger"?"You win!":cp.winner==="creator"?"They win!":"It's a tie!";
          return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .3s ease-out"}}>
            <div style={{textAlign:"center",maxWidth:360,padding:"20px",width:"90%"}}>
              <div style={{fontSize:56,marginBottom:8}}>⚔️</div>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#3b82f6",marginBottom:4}}>{isCreator?"CHALLENGE CREATED":"CHALLENGE COMPLETE"}</h2>
              <p style={{color:"#9ca3af",fontSize:12,marginBottom:16}}>{correct}/5 correct — {total} points</p>
              <div style={{display:"flex",justifyContent:"space-around",maxWidth:300,margin:"0 auto 16px"}}>
                {[{v:correct+"/5",l:"Correct",c:"#22c55e"},{v:total,l:"Points",c:"#f59e0b"}].map((s,i)=>(
                  <div key={i}><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#9ca3af",marginTop:1}}>{s.l}</div></div>
                ))}
              </div>
              {!isCreator&&cp.winner&&<div style={{background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)",borderRadius:10,padding:"10px 16px",marginBottom:16}}>
                <div style={{fontSize:11,color:"#9ca3af",marginBottom:4}}>{cp.creatorName}: {cp.creatorScore} pts vs You: {total} pts</div>
                <div style={{fontSize:20,fontWeight:800,color:cp.winner==="challenger"?"#22c55e":cp.winner==="tie"?"#f59e0b":"#ef4444"}}>{won}</div>
              </div>}
              {isCreator&&cp.id&&<div style={{marginBottom:16}}>
                <button onClick={()=>shareChallengeLink(cp.id)} style={{...btn("linear-gradient(135deg,#3b82f6,#2563eb)"),boxShadow:"0 4px 12px rgba(59,130,246,.25)"}}>📎 Send Challenge to a Friend</button>
                <p style={{color:"#9ca3af",fontSize:10,marginTop:6}}>They'll play the same 5 scenarios and try to beat your score!</p>
              </div>}
              {cp.error&&<p style={{color:"#ef4444",fontSize:11,marginBottom:8}}>Couldn't save to server — but your score counted locally!</p>}
              <button onClick={goHome} style={{...btn("rgba(255,255,255,.06)"),...{fontSize:12}}}>← Back to Home</button>
            </div>
          </div>);
        })()}

        {/* SPEED ROUND RESULTS */}
        {screen==="speedResults"&&speedRound&&(()=>{
          // BUG-08: Show deferred level-up after Speed Round ends
          if(pendingLvlUpRef.current){const pl=pendingLvlUpRef.current;pendingLvlUpRef.current=null;setTimeout(()=>{setLvlUp(pl);snd.play('lvl')},800)}
          const r=speedRound.results;
          const correct=r.filter(x=>x.isOpt).length;
          const totalPts=r.reduce((s,x)=>s+x.pts,0);
          const totalBonus=r.reduce((s,x)=>s+x.speedBonus,0);
          const elapsed=Math.round((Date.now()-speedRound.startTime)/1000);
          const grade=correct>=5?"S":correct>=4?"A":correct>=3?"B":correct>=2?"C":"D";
          const gradeColor={S:"#a855f7",A:"#22c55e",B:"#3b82f6",C:"#f59e0b",D:"#ef4444"}[grade];
          return(<div>
            <div style={{textAlign:"center",padding:"20px 0 10px"}}>
              <div style={{fontSize:48,marginBottom:4}}>⚡</div>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#ef4444",marginBottom:4}}>SPEED ROUND COMPLETE!</h2>
              <div style={{display:"inline-block",background:`${gradeColor}15`,border:`2px solid ${gradeColor}`,borderRadius:12,padding:"4px 20px",marginBottom:8}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:gradeColor}}>GRADE: {grade}</span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:12}}>
              {[{v:`${correct}/5`,l:"Correct",c:"#22c55e"},{v:totalPts,l:"Points",c:"#f59e0b"},{v:`+${totalBonus}`,l:"Speed Bonus",c:"#ef4444"},{v:`${elapsed}s`,l:"Time",c:"#3b82f6"}].map((s,i)=>(
                <div key={i}><div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#9ca3af",marginTop:1}}>{s.l}</div></div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
              {r.map((res,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:res.isOpt?"rgba(34,197,94,.04)":"rgba(239,68,68,.04)",border:`1px solid ${res.isOpt?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)"}`,borderRadius:8,padding:"6px 10px"}}>
                  <span style={{fontSize:14}}>{res.isOpt?"✅":"❌"}</span>
                  <span style={{fontSize:12,flex:1,color:"#d1d5db"}}>{POS_META[res.pos]?.emoji} {res.concept}</span>
                  <span style={{fontSize:10,fontWeight:700,color:res.isOpt?"#22c55e":"#ef4444"}}>+{res.pts}</span>
                </div>
              ))}
            </div>
            <button onClick={startSpeedRound} style={{...btn("linear-gradient(135deg,#dc2626,#ef4444)"),...{marginBottom:6,boxShadow:"0 4px 12px rgba(239,68,68,.25)"}}}>⚡ Play Again</button>
            <button onClick={goHome} style={{...btn("rgba(255,255,255,.06)"),...{fontSize:12}}}>← Back to Home</button>
          </div>);
        })()}
      </div>

      <style>{`
        @keyframes sd{from{transform:translate(-50%,-20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes su{from{opacity:0;transform:scale(.8)translateY(20px)}to{opacity:1;transform:scale(1)translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes sitPulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.4)}50%{box-shadow:0 0 0 6px rgba(59,130,246,0)}}
        @keyframes sitSlide{from{width:0}to{width:100%}}
        @keyframes filmBar{from{width:0}to{width:100%}}
        @keyframes crowdSway{0%{transform:translateY(0)}100%{transform:translateY(1.5px)}}
        @keyframes crowdCheer{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.15)}100%{transform:translateY(0) scale(1)}}
        @keyframes bannerWave{0%{transform:rotate(0deg)}100%{transform:rotate(3deg)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        button:hover{filter:brightness(1.05)}
        button:active{transform:scale(.98)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:2px}
      `}</style>
    </div>
  );
}
