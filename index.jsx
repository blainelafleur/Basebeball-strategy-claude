import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================================
// BASEBALL STRATEGY MASTER V5 — 330 handcrafted + unlimited AI scenarios
// Each scenario: id, title, diff (1-3), description, situation, options (4),
// best (index), explanations (4), rates (4), concept, anim, category
// ============================================================================
const SCENARIOS = {
  pitcher: [
    {id:"p1",title:"Full Count Pressure",diff:3,cat:"pressure",
      description:"Bottom 9th, bases loaded, 2 outs. Tie game. The cleanup hitter is hot. Count is full 3-2. What's your pitch?",
      situation:{inning:"Bot 9",outs:2,count:"3-2",runners:[1,2,3],score:[4,4]},
      options:["Fastball down the middle — challenge him","Slider low and away — make him chase","Changeup — keep him off balance","Inside fastball — brush him back"],
      best:1,explanations:["Too risky! MLB hitters bat .350+ on middle-middle fastballs in high-leverage spots.","Perfect! The slider low-away gets a 34% whiff rate in full counts. Make him chase out of the zone.","On 3-2 with bases loaded, a changeup that misses becomes ball four — walk-off walk.","Inside on 3-2 with bases loaded? If you miss, it's a walk-off walk. Too much risk."],
      rates:[30,85,55,15],concept:"Pitch location beats velocity in pressure situations",anim:"strikeout"},
    {id:"p2",title:"First Batter of the Game",diff:1,cat:"counts",
      description:"Top of the 1st. You're facing the leadoff hitter — a contact guy who gets on base. What's your approach?",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["First-pitch fastball for a strike","Start with a curveball to surprise him","Throw a changeup to set up your fastball","Waste a pitch high and inside"],
      best:0,explanations:["Great! Getting ahead 0-1 is huge. Pitchers who throw first-pitch strikes have ERAs nearly 2 runs lower.","Risky to start with a breaking ball — if it hangs, he'll jump on it.","Changeups work best when he expects fastball. First pitch, he doesn't know yet.","Wasting pitches against a leadoff hitter just drives up your pitch count."],
      explSimple:["Nice! Throwing a strike first makes the batter have to worry. You're in charge now.","Starting with a tricky pitch can go wrong because it's hard to control.","A changeup works better later when the batter is expecting a fastball.","Throwing balls on purpose just wastes pitches and lets the batter get comfortable."],
      rates:[85,40,50,30],concept:"Getting ahead in the count is a pitcher's biggest advantage",anim:"strike"},
    {id:"p3",title:"Runner Threatening to Steal",diff:2,cat:"baserunners",
      description:"Speedster on 1st — 40 stolen bases this year. He's taking a big lead. Count is 1-0.",
      situation:{inning:"Top 4",outs:0,count:"1-0",runners:[1],score:[2,1]},
      options:["Throw over to first","Quick-pitch with a slide step","Pitch out","Ignore the runner — focus on the batter"],
      best:1,explanations:["Throwing over is fine, but the runner is still fast afterward.","The slide step cuts delivery from 1.5s to 1.2s — giving the catcher a real chance to throw him out.","A pitchout on 1-0 makes it 2-0 — terrible count.","Ignoring a 40-steal threat? He'll take 2nd easily."],
      explSimple:["Throwing to first is okay, but it doesn't stop him from running next time.","A quick pitch helps your catcher throw the runner out because you get the ball there faster.","A pitchout means another ball, and now the count is bad for you.","You can't just ignore a fast runner — he'll steal the base easily!"],
      rates:[50,80,35,25],concept:"The slide step controls the running game without hurting pitch count",anim:"strike"},
    {id:"p4",title:"Protecting a Lead",diff:2,cat:"late-game",
      description:"Top 8th, up 3-1, runners on 1st and 2nd, 1 out. Power hitter up. Your arm is tired.",
      situation:{inning:"Top 8",outs:1,count:"0-0",runners:[1,2],score:[3,1]},
      options:["Fastballs — go right after him","Pitch around him","Mix speeds — work the corners","Ask to come out"],
      best:2,explanations:["Tired arm = less velocity. Challenging a power hitter with diminished stuff is dangerous.","Pitching around loads the bases — tying run comes to the plate.","Smart! Changing speeds when tired beats trying to overpower. Keep him guessing.","That's the manager's call, not yours. Compete."],
      explSimple:["When your arm is tired, your fastball isn't as fast — a big hitter could crush it.","Pitching around him fills up the bases, and that makes things even scarier.","Smart! When you're tired, trick the batter by mixing slow and fast pitches instead of throwing hard.","It's not your decision to leave the game — keep competing and do your best."],
      rates:[30,40,80,55],concept:"When fatigued, pitching smart (mixing speeds) beats pitching hard",anim:"strike"},
    {id:"p5",title:"Setting Up the Strikeout",diff:2,cat:"counts",
      description:"2 outs, 6th inning, nobody on. Count is 0-2 on a slugger who homered off you earlier.",
      situation:{inning:"Bot 6",outs:2,count:"0-2",runners:[],score:[5,3]},
      options:["Waste one in the dirt","Fastball up in the zone","Slider on the outside corner","Fastball down the middle — dare him"],
      best:0,explanations:["With 0-2 you can afford a ball. Expand his zone, then finish him.","He homered off your fastball. Don't give him another one he can see.","Good but risky — if the slider hangs, it's in his wheelhouse.","Never challenge a guy who already went deep off you!"],
      explSimple:["You have two strikes already, so you can throw one in the dirt and see if he chases it.","He already hit a home run off your fastball — don't give him the same pitch again!","A slider could work, but if you don't throw it perfectly, he might hit it hard.","Throwing it right down the middle to a guy who already homered off you is a bad idea!"],
      rates:[85,35,60,10],concept:"Use waste pitches on 0-2 to expand the zone before the strikeout pitch",anim:"strikeout"},
    {id:"p6",title:"Double Play Groundball",diff:2,cat:"situational",
      description:"Runners on 1st and 2nd, nobody out. Need a ground ball. Lefty batter likes the ball up. Count 1-1.",
      situation:{inning:"Bot 3",outs:0,count:"1-1",runners:[1,2],score:[2,2]},
      options:["Sinker down in the zone","High fastball where he likes it","Curveball in the dirt","Changeup away"],
      best:0,explanations:["Sinkers generate ground balls at nearly 2x the rate of four-seamers. Double play time.","Throwing where a hitter is comfortable when you need a groundball = bad combo.","Curveball in the dirt could be a wild pitch advancing both runners.","Changeup away can work, but the sinker is the ground ball gold standard."],
      explSimple:["A sinker dips down and makes batters hit the ball on the ground — perfect for a double play!","Throwing where the batter likes it makes it easy for him to get a hit.","A curveball in the dirt could bounce away and let the runners move up.","A changeup is okay, but a sinker is the best pitch for getting ground balls."],
      rates:[85,15,40,55],concept:"Sinkers and two-seamers are the best double play pitches",anim:"groundout"},
    {id:"p7",title:"Inherited Runners",diff:3,cat:"pressure",
      description:"You just entered in relief. Runners on 2nd and 3rd, 1 out, tie game. Right-handed contact hitter up.",
      situation:{inning:"Bot 7",outs:1,count:"0-0",runners:[2,3],score:[3,3]},
      options:["Go right after him","Walk him to set up a force at home","Try for the strikeout","Pitch carefully — nothing to drive"],
      best:3,explanations:["Coming in cold and challenging a contact hitter with RISP is reckless.","Loading bases means a walk or HBP scores the go-ahead run.","Striking out a contact hitter when you're cold is tough.","Smart! Pitch the corners. Make him get himself out on weak contact."],
      rates:[35,30,40,80],concept:"In high-leverage relief, pitch to contact carefully — don't try to overpower",anim:"groundout"},
    {id:"p8",title:"Pitcher's Count",diff:1,cat:"counts",
      description:"Nobody on, 2 outs. 0-2 count on the #8 hitter who's been swinging at everything.",
      situation:{inning:"Top 5",outs:2,count:"0-2",runners:[],score:[4,2]},
      options:["Fastball up and in","Slider down and away","Fastball off the plate","Curveball in the dirt"],
      best:3,explanations:["Fastball in on 0-2 can work, but if you miss over the plate...","Decent but predictable.","Off-plate fastball isn't a great put-away pitch.","The 0-2 curveball in the dirt is a classic strikeout pitch. An aggressive hitter will chase it."],
      explSimple:["A fastball inside could work, but if it goes over the plate he might hit it.","A slider is okay but the batter might be expecting it.","A fastball outside the zone isn't the best way to trick him.","A curveball in the dirt is the best trick pitch! He'll swing and miss because it looks like a strike but drops down."],
      rates:[50,60,45,85],concept:"The 0-2 curveball in the dirt is baseball's classic strikeout pitch",anim:"strikeout"},
    {id:"p9",title:"Third Time Through the Order",diff:3,cat:"adjustments",
      description:"6th inning, facing the lineup a 3rd time. Leadoff hitter crushed your fastball last time.",
      situation:{inning:"Top 6",outs:0,count:"0-0",runners:[],score:[3,2]},
      options:["Throw the fastball again","Lead with a changeup","Start with a slider","Pitch inside"],
      best:1,explanations:["He crushed it last time. Hitters' BA rises 40+ points 3rd time through.","The changeup arrives 8-10mph slower, completely disrupting his fastball timing.","Slider first can work but changeup is better for disrupting timing.","Inside without establishing it earlier is risky."],
      rates:[25,85,60,40],concept:"Third time through the order, change speeds to disrupt hitter timing",anim:"strike"},
    {id:"p10",title:"In the Zone",diff:1,cat:"approach",
      description:"Scoreless game, 4th inning. You're rolling — 8 straight outs. #3 hitter up. Count 1-0.",
      situation:{inning:"Bot 4",outs:2,count:"1-0",runners:[],score:[0,0]},
      options:["Fastball for a strike","Waste a pitch","Best breaking ball","Same sequence as last at-bat"],
      best:0,explanations:["You're dealing and it's only 1-0. Get the strike and keep attacking.","Wasting pitches when you're in a groove is overthinking.","Your fastball in a groove is highest-percentage.","Good hitters adjust. Mix it up."],
      explSimple:["You're doing great! Keep throwing strikes and stay confident.","Don't waste pitches when everything is working — just keep attacking.","Your fastball is your best pitch right now because you're in a groove.","Good batters remember what you threw last time, so don't do the exact same thing."],
      rates:[80,35,55,40],concept:"When you're in a groove, stay aggressive — don't overthink",anim:"strike"},
    {id:"p11",title:"First and Third Jam",diff:3,cat:"pressure",
      description:"Runners on 1st and 3rd, nobody out, down by 1. Contact hitter up. You need a double play or strikeout.",
      situation:{inning:"Top 6",outs:0,count:"0-0",runners:[1,3],score:[2,3]},
      options:["Pitch for the strikeout","Sinker for a ground ball DP","Walk him to load bases","Fastball — challenge him"],
      best:1,explanations:["Strikeouts are great but you need TWO more outs. A DP gets both.","Exactly! A sinker down gets the ground ball you need. DP erases the inning.","Loading bases makes any wild pitch or walk score a run.","A fastball challenge might get hit in the air. You want the ball on the ground."],
      rates:[45,85,20,35],concept:"With runners on 1st and 3rd, pitch for the double play ground ball",anim:"groundout"},
    {id:"p12",title:"Opening Day Jitters",diff:1,cat:"approach",
      description:"1st inning of the season. Your adrenaline is pumping. Fastball feels extra fast. Leadoff hitter up.",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Let it rip — throw your hardest","Start with off-speed to surprise","Fastball for strike — establish the zone","Pitch out of the zone to start"],
      best:2,explanations:["Adrenaline makes you overthrow, losing control. Channel the energy.","Surprise isn't needed first pitch of the season.","Smart! Establish the strike zone early. Controlled aggression beats wild energy.","Nibbling pitch 1 of the season sets a bad tone."],
      explSimple:["When you're too excited, you throw too hard and lose control.","You don't need to surprise anyone — just throw a good pitch.","Great choice! Throw a nice fastball for a strike. Stay calm and in control even when you're excited.","Throwing outside the zone on your very first pitch starts the game off badly."],
      rates:[40,35,85,25],concept:"Channel adrenaline into controlled aggression — establish the strike zone early",anim:"strike"},
    {id:"p13",title:"Covering First Base",diff:1,cat:"defense",
      description:"Ground ball hit to the first baseman. He fields it but he's too far from the bag to step on it himself. What do you do as the pitcher?",
      situation:{inning:"Bot 2",outs:0,count:"1-0",runners:[],score:[1,0]},
      options:["Stay on the mound — that's the first baseman's job","Sprint to first base to take the throw","Run toward home plate to back up","Watch and see what happens"],
      best:1,explanations:["Covering first on ground balls is ALWAYS the pitcher's responsibility.","Pitchers MUST cover first base on any ground ball to the right side. Sprint to the bag, catch the toss, touch first. This is a basic but critical responsibility that gets ignored in youth baseball.","Backing up home is for overthrows, not routine plays.","Watching gets nobody out. Move your feet!"],
      explSimple:["It IS your job! When the first baseman fields the ball, the pitcher has to run to first base.","Yes! Sprint to first base and catch the throw. This is one of the most important things a pitcher does besides pitching.","Backing up home plate isn't needed here — you need to cover first base.","Don't just stand and watch! Run to the base so your teammate can throw it to you."],
      rates:[10,85,20,15],concept:"Pitchers must cover 1st base on ground balls to the right side — sprint to the bag!",anim:"groundout"},
    // Batch 1 — Pitch Selection by Count
    {id:"p14",title:"First Pitch Strike",diff:1,cat:"counts",
      description:"Top of the 3rd, score is 1-0. The leadoff hitter steps in — he's a patient batter who likes to work counts. 0-0, nobody on, nobody out. Do you go after him or nibble?",
      situation:{inning:"Top 3",outs:0,count:"0-0",runners:[],score:[1,0]},
      options:["Fastball right down the middle for a strike","Curveball on the corner — nibble at the edges","Changeup low to start with something soft","Fastball high and tight to set a tone"],
      best:0,explanations:["Yes! First-pitch strikes put pitchers in control. Hitters bat about .160 after falling behind 0-1, compared to .340 when ahead 1-0. Attack the zone early.","Nibbling against a patient hitter is his dream — he'll take close pitches and work the count to 1-0, exactly what he wants.","Starting with offspeed gives away your advantage. You want to get ahead, then use the changeup later.","High and tight misses are ball one. Against a patient hitter, you just gave him what he wanted — a free ball."],
      explSimple:["Yes! Throwing a strike first puts you in charge. The batter has to start swinging now.","Throwing tricky pitches on the corners is exactly what a patient batter wants — he'll just wait for a ball.","Save your slower pitches for later. Start with a fastball strike to get ahead.","Throwing up and inside might miss for a ball, and now the batter is winning the count."],
      rates:[85,40,35,30],concept:"First-pitch strikes are a pitcher's best weapon — hitters bat .160 after falling behind 0-1",anim:"strike"},
    {id:"p15",title:"Ahead 0-2 — Now What?",diff:1,cat:"counts",
      description:"Bottom of the 4th, 1 out, nobody on. You've got the #6 hitter in an 0-2 hole. He's an aggressive swinger who's been chasing pitches all day. Score is 3-2.",
      situation:{inning:"Bot 4",outs:1,count:"0-2",runners:[],score:[3,2]},
      options:["Curveball in the dirt — make him chase","Fastball right down the middle — blow it by him","Slider on the black — paint the corner","Fastball up and in to push him off the plate"],
      best:0,explanations:["Perfect! With 0-2, you can afford to waste a pitch. An aggressive hitter chasing all day is almost guaranteed to swing at a curveball in the dirt. The strikeout rate on 0-2 buried breaking balls is over 40%.","Throwing down the middle on 0-2 is giving away your advantage. Even weak hitters can hit a fastball with no movement over the plate.","The slider on the corner is a solid option, but against a chaser, the curveball in the dirt is even more effective — make him swing at something he can't hit.","Up and in on 0-2 is okay for backing him off, but you're wasting the count advantage. You want a swing-and-miss, not just a foul ball."],
      rates:[85,20,60,45],concept:"On 0-2, use the advantage — waste a pitch out of the zone and make the hitter chase",anim:"strikeout"},
    {id:"p16",title:"Must-Throw-a-Strike Count",diff:1,cat:"counts",
      description:"Top of the 5th, runner on second, 1 out. Count is 3-1 on the #9 hitter. Your catcher sets up on the outside corner. Score tied 2-2.",
      situation:{inning:"Top 5",outs:1,count:"3-1",runners:[2],score:[2,2]},
      options:["Fastball on the outside corner — hit the glove","Curveball and hope he swings","Changeup to surprise him","Fastball down the middle — just get it in the zone"],
      best:0,explanations:["Great choice! On 3-1 you need a strike, and the fastball is your most controllable pitch. Throwing it to the outside corner gives you the best chance to get a called strike or weak contact instead of a walk.","A curveball on 3-1 is risky — if it bounces, you walk him. Breaking balls on hitter's counts only work if you can absolutely locate them.","A changeup that misses the zone is ball four and puts runners on first and second. Too risky in this count.","Down the middle works if you must, but the outside corner is smarter — you still get the strike while avoiding the hitter's power zone."],
      rates:[85,30,35,55],concept:"On 3-1 counts, throw your most controllable pitch — a strike is more important than a strikeout",anim:"strike"},
    {id:"p17",title:"Even Count Power Threat",diff:2,cat:"counts",
      description:"Bot 5th, nobody on, 2 outs. The count is 1-1 against their cleanup hitter — a power-hitting righty who crushes fastballs. He hit a double off your heater last time. Score 4-3 your lead.",
      situation:{inning:"Bot 5",outs:2,count:"1-1",runners:[],score:[4,3]},
      options:["Fastball — challenge him again","Changeup low in the zone","Slider backdoor on the outside corner","Curveball up in the zone to freeze him"],
      best:1,explanations:["He already doubled off your fastball. Power hitters sit on fastballs in even counts. Throwing what he's looking for is playing his game.","Smart! The changeup looks like a fastball out of your hand but arrives 8-10 mph slower. Power hitters who gear up for fastballs are most vulnerable to speed changes. Ground ball rate on changeups is over 50%.","The backdoor slider is a good pitch, but it needs perfect location. If it leaks over the plate, a power hitter will crush it.","Curveballs up in the zone hang and get hammered. Curveballs need to be down to be effective."],
      rates:[25,80,55,20],concept:"Against power hitters looking fastball, the changeup is your best friend — same arm speed, different velocity",anim:"groundout"},
    {id:"p18",title:"Two-Two Tightrope",diff:2,cat:"counts",
      description:"Top 7th, runner on third, 1 out, you're up 5-4. The count is 2-2 on a contact hitter. Your catcher wants a strikeout so the runner can't score on a ground ball.",
      situation:{inning:"Top 7",outs:1,count:"2-2",runners:[3],score:[5,4]},
      options:["Slider low and away — try for the strikeout","Fastball at the knees — pitch to contact","Curveball in the dirt — make him chase","Changeup on the outside corner"],
      best:0,explanations:["Yes! With a runner on third and 1 out, a strikeout avoids any chance of a run scoring on contact. The slider low-away has a 30% whiff rate and is the best strikeout pitch in this spot.","Pitching to contact with a runner on third and 1 out is dangerous — even a routine ground ball can score the tying run.","The curveball in the dirt on 2-2 is risky — if it bounces too far, the catcher might not block it and the runner on third scores on a wild pitch.","The changeup is a solid pitch, but the slider gives you a better chance at a swing-and-miss, which is what you really want here."],
      rates:[80,40,50,60],concept:"With a runner on third, strikeouts are more valuable than outs on contact",anim:"strikeout"},
    {id:"p19",title:"Expand or Attack?",diff:2,cat:"counts",
      description:"Bot 3rd, bases empty, nobody out. Count is 0-1 after a called strike on the outside corner. The batter fouled off a fastball last at-bat. Score 1-0 your lead.",
      situation:{inning:"Bot 3",outs:0,count:"0-1",runners:[],score:[1,0]},
      options:["Slider just off the outside corner — expand the zone","Fastball inside — change his eye level","Curveball right down the middle — surprise him","Same pitch same spot — the outside fastball again"],
      best:0,explanations:["Perfect! After getting strike one on the outside corner, expanding just off that edge is textbook. The hitter's eye is calibrated to that spot — a pitch 2 inches further off the plate looks like the same pitch. Hitters chase expanded-zone pitches 35% more after seeing a strike in the same area.","Changing eye level is a good strategy, but going inside after establishing outside should come later in the sequence — you haven't fully exploited the outside yet.","A curveball down the middle on 0-1 is hittable. You're giving up your count advantage for a surprise that isn't necessary.","The same pitch same spot can work, but smart hitters adjust. Expanding just off the edge is better than repeating the exact same location."],
      rates:[85,50,30,45],concept:"After getting a strike on the corner, expand the zone 2 inches further — the hitter's eye will follow",anim:"strike"},
    {id:"p20",title:"Behind 2-0 to a Weak Hitter",diff:2,cat:"counts",
      description:"Top 4th, nobody on, 2 outs. You fell behind 2-0 to the #8 hitter after two close pitches were called balls. He's batting .210 on the season. Score 3-1 your lead.",
      situation:{inning:"Top 4",outs:2,count:"2-0",runners:[],score:[3,1]},
      options:["Groove a fastball down the middle — just get a strike","Fastball on the outside corner — work the edge","Curveball for a strike — change his timing","Walk him and face the pitcher next"],
      best:1,explanations:["Groving one down the middle to a .210 hitter sounds safe, but even weak hitters hit .310+ on pitches middle-middle. Don't give away free contact.","Right! Work the outside corner — you need a strike, but you don't need to give in. The outside corner fastball gets called strikes 65% of the time and generates weak contact even when hit. It's a competitive strike without being a meatball.","A curveball on 2-0 is too risky with this ump squeezing you. If it's called a ball, you're at 3-0 to a weak hitter — embarrassing.","Walking the #8 hitter to face the pitcher seems clever, but you're putting a free baserunner on with a 2-run lead. Trust your stuff and make a pitch."],
      rates:[45,80,30,25],concept:"Behind in the count, throw competitive strikes on the corners — don't groove one down the middle",anim:"strike"},
    {id:"p21",title:"Full Count, Bases Juiced",diff:3,cat:"counts",
      description:"Bot 8th, bases loaded, 2 outs, tie game 4-4. Full count 3-2 on the #5 hitter. He's a good breaking ball hitter but has struggled with high heat today. The crowd is going crazy.",
      situation:{inning:"Bot 8",outs:2,count:"3-2",runners:[1,2,3],score:[4,4]},
      options:["Your best pitch — a curveball","Fastball up in the zone — attack his weakness today","Slider low — make him chase","Changeup — keep him off balance"],
      best:1,explanations:["Your curveball is normally your best pitch, but he's a good breaking ball hitter. Throwing his strength in this moment is playing his game, not yours.","Exactly! In the biggest moments, attack what's NOT working for the hitter, not what's best for you. He's struggled with high heat all day — that's the pitch to throw. MLB data shows targeting a hitter's cold zone raises strikeout probability by 25% regardless of the pitcher's preferred pitch.","Slider low on 3-2 with bases loaded — if it misses, you just walked in the tying run. Too much risk on a pitch that's designed to be out of the zone.","Changeup on a full count is risky — if you hang it, it's a grand slam. If you miss, it's a walk-off walk. The margin is too thin."],
      rates:[40,85,35,30],concept:"In big spots, throw what the hitter can't hit today — not just your best pitch",anim:"strikeout"},
    {id:"p22",title:"Runner Stealing on 3-2",diff:3,cat:"counts",
      description:"Top 6th, runner on first, 2 outs. Count is 3-2. The runner will be going on the pitch — he has to with 2 outs. The batter is a pull hitter. Score 2-1 your lead.",
      situation:{inning:"Top 6",outs:2,count:"3-2",runners:[1],score:[2,1]},
      options:["Fastball for a strike — forget the runner","Slider low — hope he chases for strike three","Pitch out to let the catcher throw out the runner","Slide-step fastball on the outside corner"],
      best:3,explanations:["You can't just forget the runner. A regular windup gives the base stealer an easy jump to second, and if the batter fouls it off or takes, the runner is in scoring position.","A slider on 3-2 with a runner going is dangerous — if it's a ball, it's a walk AND the runner advances. Plus the low slider is harder for the catcher to handle and throw from.","A pitchout on 3-2 is ball four — you walk the batter! Never pitchout on a full count.","Smart! The slide-step cuts your delivery time by 0.3 seconds, giving your catcher a real chance to throw out the runner. The outside corner location makes it easy for the catcher to receive and throw. You compete for the strike AND control the running game."],
      rates:[40,30,10,85],concept:"On 3-2 with a runner stealing, use a slide-step to give your catcher the best chance",anim:"strike"},
    {id:"p23",title:"0-2 to a Fastball Crusher",diff:3,cat:"counts",
      description:"Bot 7th, nobody on, 1 out. You're ahead 0-2 on a hitter who's batting .380 against fastballs this season but only .180 against breaking stuff. He's their best hitter. Score 3-3 tie game.",
      situation:{inning:"Bot 7",outs:1,count:"0-2",runners:[],score:[3,3]},
      options:["Fastball up — challenge him with your best","Curveball in the dirt — classic 0-2 waste pitch","Slider backdoor — try for the punchout right now","Changeup low — look fastball, get changeup"],
      best:1,explanations:["He bats .380 against fastballs! Even up in the zone, you're throwing his favorite pitch. An 0-2 count is too valuable to waste by giving him what he hits best.","Perfect! The 0-2 curveball in the dirt is the textbook play here, and doubly so against a fastball hitter. He's gearing up for heat — the curveball in the dirt looks like a strike out of the hand, then drops below the zone. Even if he doesn't chase, you're only at 1-2 and still ahead. Never rush to finish a hitter when you're dominating the count.","Going for the punchout on 0-2 is aggressive but unnecessary. You have TWO strikes to work with. A backdoor slider that catches too much plate gets hit 400 feet by this guy.","The changeup low is a decent idea but the curveball has more break and is harder to lay off when a hitter is geared up for fastball speed. Save the changeup for 1-2 if he takes the curve."],
      rates:[15,85,45,55],concept:"Against fastball hitters, use 0-2 to show breaking balls — never throw what they crush",anim:"strikeout"},
    // Batch 2 — Pitching With Runners On Base
    {id:"p24",title:"Runner on First — Stay Focused",diff:1,cat:"baserunners",
      description:"Top of the 2nd, runner on first, nobody out. The batter is a right-handed contact hitter. Count is 0-0. Score is 0-0. You notice the runner taking a normal lead. Do you focus on the batter or the runner?",
      situation:{inning:"Top 2",outs:0,count:"0-0",runners:[1],score:[0,0]},
      options:["Focus on the batter — the runner isn't your problem","Throw over to first a few times to keep him close","Focus on the batter but be quick to the plate","Step off the rubber and stare at the runner"],
      best:2,explanations:["Completely ignoring the runner is a mistake. If he gets a big secondary lead or steals easily, you've given the other team a free base.","Throwing over multiple times before your first pitch slows the game, drives up your stress, and doesn't help you get the batter out. One quick look is enough.","Smart! Your #1 job is always getting the batter out. But being quick to the plate — a compact delivery around 1.3 seconds — keeps the runner honest without changing your approach. You can do both at once.","Stepping off and staring is a waste of time and energy. The runner isn't going to go back to the dugout because you looked at him."],
      rates:[30,35,85,20],concept:"With a runner on first, your priority is the batter — but stay quick to the plate to keep the runner honest",anim:"strike"},
    {id:"p25",title:"Windup or Stretch?",diff:1,cat:"baserunners",
      description:"Bot 3rd, runner just reached first on a single. Nobody out, 0-0 count on the next batter. Score 2-1. You've been pitching from the windup all game. Your coach yells something from the dugout.",
      situation:{inning:"Bot 3",outs:0,count:"0-0",runners:[1],score:[2,1]},
      options:["Stay in the windup — it's working fine","Switch to the stretch since there's a runner on","Pitch from the windup but speed it up","Ask your catcher what to do"],
      best:1,explanations:["The windup takes longer and you can't see the runner. With a man on first, the windup gives base stealers an easy jump — they'll take second for free.","Correct! Any time a runner is on base, you pitch from the stretch. The stretch lets you see the runner, hold him with a quick look or pickoff, and deliver the ball faster. It cuts your delivery time from about 1.5 seconds to 1.2 seconds. This is one of the first things every pitcher learns.","You can't really speed up a windup without losing mechanics. The stretch exists specifically for this situation — use it.","Your catcher will give you pitch signs, but windup vs stretch is the pitcher's basic responsibility. Every pitcher should know: runners on base = stretch."],
      rates:[15,85,25,20],concept:"Always pitch from the stretch with runners on base — it lets you control the running game",anim:"strike"},
    {id:"p26",title:"Runner in Scoring Position",diff:1,cat:"baserunners",
      description:"Top 5th, runner on second, nobody out. A single will score him. The batter is their #7 hitter — not a great hitter but capable. Count 0-0. Score 3-2 your lead.",
      situation:{inning:"Top 5",outs:0,count:"0-0",runners:[2],score:[3,2]},
      options:["Pitch the same as with nobody on — don't overthink it","Be extra careful — don't give him anything to hit","Attack the zone — get ahead and get outs","Walk him intentionally to set up a double play"],
      best:2,explanations:["Pitching the exact same way ignores the situation. You need to be aware that a run is 90 feet away, but that doesn't mean you change everything — just be smart.","Being too careful with a weak hitter is how you walk him and put TWO runners on. Now a single scores one and puts a man on third. You made things worse.","Yes! With a runner on second and nobody out, the best strategy is to attack the zone aggressively. Get ahead in the count and force the weak hitter to put the ball in play. Pitchers who attack the zone with RISP give up fewer runs than pitchers who nibble — walks just add more runners.","Walking the #7 hitter to face the #8 hitter puts TWO men on with nobody out. You're not afraid of a .230 hitter. Intentional walks should be saved for their best hitters."],
      rates:[40,25,85,20],concept:"With runners in scoring position, attack the zone — walks are more dangerous than hits",anim:"strike"},
    {id:"p27",title:"Speed Demon on First",diff:2,cat:"baserunners",
      description:"Top 4th, their fastest player is on first with a stolen base in the 1st inning already. Count is 1-1, nobody out. He's dancing off the bag taking a big lead. Score 1-1.",
      situation:{inning:"Top 4",outs:0,count:"1-1",runners:[1],score:[1,1]},
      options:["Throw over to first to keep him close","Slide-step fastball to the plate — be quick","Forget the runner and just pitch normally","Pitch out so your catcher can throw him out"],
      best:1,explanations:["Throwing over is fine as a look, but this runner already stole a base — he's not scared of pickoff throws. You're just delaying the inevitable and falling behind the hitter mentally.","Perfect! The slide step is your best weapon against speedsters. It shaves 0.3 seconds off your delivery — the difference between safe and out. By staying quick to the plate, you neutralize his speed advantage without losing focus on the batter. MLB pitchers who use the slide step cut stolen base attempts by 40%.","Pitching normally with a full delivery against a guy who already stole on you? He'll take second standing up. You must adjust your timing.","A pitchout on 1-1 makes it 2-1 — you're behind in the count and you might not even get him. Pitchouts work best when you're certain the runner is going."],
      rates:[40,85,20,30],concept:"Against fast runners, the slide step is your best friend — it cuts delivery time and steal success rates",anim:"strike"},
    {id:"p28",title:"First and Third Groundball",diff:2,cat:"baserunners",
      description:"Bot 6th, runners on first and third, 1 out. Tie game 3-3. Contact hitter up, count 0-1. Your infield is at double play depth. A ground ball could turn two and end the inning — but it could also score the run from third.",
      situation:{inning:"Bot 6",outs:1,count:"0-1",runners:[1,3],score:[3,3]},
      options:["Fastball up — try for a strikeout instead","Sinker down — pitch for the double play ground ball","Curveball — get him to pop up","Pitch carefully around him — don't give in"],
      best:1,explanations:["Strikeouts are nice, but on 0-1 to a contact hitter, you're unlikely to get one. And if you walk him trying for K's, you've loaded the bases.","Exactly! The sinker down in the zone is the double play pitch. Yes, the runner on third might score on a ground ball, but a 6-4-3 double play ends the inning and limits the damage to just one run. Giving up one to get two outs is a great trade. Sinkers generate ground balls at twice the rate of four-seamers.","A popup would be great, but you can't really pitch for a popup — curveballs are meant to get swings and misses or ground balls, not lazy fly balls.","Pitching carefully with first and third and one out is how you load the bases. A walk here brings the tying run home from third AND loads the bases. Be aggressive and get the double play."],
      rates:[40,85,35,20],concept:"With first and third, pitch for the double play — giving up one run to get two outs is a smart trade",anim:"doubleplay"},
    {id:"p29",title:"Scoring Position Strategy",diff:2,cat:"baserunners",
      description:"Top 7th, runner on second, 1 out. The batter is their #3 hitter — dangerous. Count is 1-0. First base is open. Score 4-3 your lead. Your catcher puts down the sign for a fastball away.",
      situation:{inning:"Top 7",outs:1,count:"1-0",runners:[2],score:[4,3]},
      options:["Shake off the catcher — throw inside to jam him","Follow the sign — fastball away","Walk him intentionally to set up the double play","Throw a changeup to keep him off balance"],
      best:1,explanations:["Shaking off to go inside on 1-0 to a dangerous hitter is risky. If you miss inside, it's 2-0. If you miss over the plate, he crushes it. Trust your catcher's read.","Smart! The fastball away is the right call. With a runner on second, pitching to the outside part of the plate does two things: it keeps the ball away from the hitter's power zone, and if he makes contact, it's more likely to be hit to the right side — away from the runner at second. Your catcher has a great view of the whole field. Trust the sign.","Walking their #3 hitter puts the go-ahead run on base too. Now first and second with 1 out — any hit scores at least one. Only walk him if you're certain the next hitter is much weaker.","A changeup on 1-0 that misses is 2-0, and you're in a hitter's count against their best hitter. Save the changeup for when you're ahead."],
      rates:[30,80,45,35],concept:"With a runner on second, pitch to the outside — it limits damage and directs contact away from the runner",anim:"strike"},
    {id:"p30",title:"Slide Step Timing",diff:2,cat:"baserunners",
      description:"Bot 4th, runner on first, 1 out. The runner is average speed. Count is 0-0. You've been using your full stretch delivery all game and throwing well. Your catcher signals for a slide step. Score 2-0 your lead.",
      situation:{inning:"Bot 4",outs:1,count:"0-0",runners:[1],score:[2,0]},
      options:["Use the slide step like the catcher wants","Stick with your full stretch — it's been working","Throw over to first instead","Slide step on every pitch from now on"],
      best:0,explanations:["Right! Trust your catcher. He can see the runner's lead and timing better than you can. If he's calling for a slide step, the runner is probably getting a big secondary lead or showing steal signs. One slide step delivery keeps the runner honest without disrupting your rhythm.","Your full stretch has been great, but the catcher sees something you can't — the runner is getting too aggressive. Ignoring your catcher's read on the running game is a mistake.","Throwing over is an option, but the catcher specifically asked for a slide step on the pitch. He wants you to deliver the ball AND control the runner at the same time.","Using the slide step on EVERY pitch sacrifices some velocity and command for no reason. Use it strategically when the runner is a threat, not as your default delivery. The slide step is a weapon, not a permanent change."],
      rates:[80,35,40,30],concept:"Use the slide step strategically when your catcher calls for it — he can read the runner's intentions",anim:"strike"},
    {id:"p31",title:"Runner on Third, Infield In",diff:3,cat:"baserunners",
      description:"Top 8th, runner on third, nobody out. Score 5-4 your lead. Infield is playing in to cut off the run. The batter is a left-handed contact hitter who puts the ball in play. Count 0-0. A ground ball on the drawn-in infield could sneak through.",
      situation:{inning:"Top 8",outs:0,count:"0-0",runners:[3],score:[5,4]},
      options:["Pitch for a strikeout — don't let him put it in play","Pitch for a fly ball — let the outfield handle it","Sinker for a ground ball — trust the infield","Pitch for a popup — something up in the zone"],
      best:1,explanations:["Trying for a strikeout sounds great but forcing it often means falling behind in the count. If you walk him, you've put the tying run on AND the go-ahead run in scoring position.","Yes! With the infield in and nobody out, a fly ball is your best friend. A medium-deep fly ball is an out — and even if the runner tags and scores from third, you now have 1 out and nobody on instead of 0 outs with a runner on third. An elevated fastball or a pitch up in the zone generates fly balls. Giving up the one run for an out is smart here.","Ground balls with the infield in are risky. The fielders are closer so they have less range, and the drawn-in infield creates holes. A grounder that normally is an out might sneak through for an RBI single.","Pitching for a popup specifically isn't really controllable. You can pitch up to get fly balls, but you can't aim for a popup — and if you leave a pitch up and over the plate, it gets hit hard."],
      rates:[35,85,40,30],concept:"With infield in and runner on third, pitch for fly balls — sacrifice the run for the out",anim:"flyout"},
    {id:"p32",title:"Pickoff or Finish Him?",diff:3,cat:"baserunners",
      description:"Bot 5th, runner on first taking a huge lead — he's been inching further each pitch. But the batter is in an 0-2 hole and has been fooled twice. Score 2-1. 1 out. The runner is daring you to throw over.",
      situation:{inning:"Bot 5",outs:1,count:"0-2",runners:[1],score:[2,1]},
      options:["Throw over to first — that lead is too big","Ignore the runner — focus on finishing the batter","Quick look, then your best 0-2 pitch to the batter","Step off the rubber to reset everything"],
      best:2,explanations:["The runner WANTS you to throw over. He's baiting you into losing focus on the batter who's in an 0-2 hole. Experienced runners do this — they take a big lead specifically to distract you from a hitter you're dominating. If you throw over and the batter resets mentally, you may have lost your advantage.","Completely ignoring the runner isn't smart either. If he steals second, a single ties the game. You need to at least show him you're aware.","Perfect! A quick look acknowledges the runner and keeps him honest, but your focus stays on finishing the 0-2 at-bat. The batter is in trouble — don't bail him out by getting distracted. One glance, then your best put-away pitch. The 0-2 count is more valuable than catching a runner. A strikeout here is worth more than a pickoff.","Stepping off kills your rhythm and gives the batter a chance to reset from an 0-2 count. The runner is winning the mental game if you step off here."],
      rates:[30,25,85,35],concept:"Don't let an aggressive runner distract you from finishing a hitter in an 0-2 count — quick look, then attack",anim:"strikeout"},
    {id:"p33",title:"Bases Loaded Jam",diff:3,cat:"baserunners",
      description:"Top 6th, bases loaded, 1 out, tie game 4-4. The #4 hitter is up — he's 2-for-3 today with a homer. First pitch. Your catcher comes out to talk. He suggests pitching to him because the next hitter is also dangerous.",
      situation:{inning:"Top 6",outs:1,count:"0-0",runners:[1,2,3],score:[4,4]},
      options:["Walk him intentionally to force in a run","Pitch to him — your catcher is right","Pitch around him — nothing in the zone but don't walk him","Ask the coach to come get you"],
      best:2,explanations:["Intentionally walking with bases loaded gives them a free run! The score goes to 5-4 and the bases are STILL loaded. That's almost never the right play. You'd need the next hitter to be astronomically weaker to justify a free run.","Your catcher is right that you have to face someone, but pitching right to a guy who's 2-for-3 with a homer is too aggressive. He's locked in today — you don't want to give him anything to drive.","Exactly! Pitching around him means throwing competitive pitches just off the zone — making him get himself out if he swings. You're not giving him anything to crush, but you're also not walking in a run. If he chases a ball off the plate, great. If he takes four balls, you walked one run in but didn't groove one for a grand slam. It's damage control — bend but don't break.","Asking to come out is the manager's decision, and it shows the hitter you're scared. Compete — even if carefully."],
      rates:[10,35,80,20],concept:"Bases loaded vs a hot hitter — pitch around him carefully, don't walk in the run and don't groove one",anim:"strike"},
    // Batch 3 — Game Situation Pitching
    {id:"p34",title:"Big Lead Comfort Zone",diff:1,cat:"approach",
      description:"Top of the 6th, you're up 7-2. Five-run lead. The #7 hitter is at the plate. You've been cruising all game. Count is 0-0.",
      situation:{inning:"Top 6",outs:0,count:"0-0",runners:[],score:[7,2]},
      options:["Keep attacking — don't let up","Cruise — throw it down the middle and save energy","Pitch carefully — don't give up any more runs","Experiment with new pitches you've been working on"],
      best:0,explanations:["With a big lead, keep attacking the zone with your best stuff. You don't need to overthrow or be perfect, but stay aggressive. Big leads disappear when pitchers get lazy.","Grooving pitches down the middle even against weak hitters is asking for trouble. Stay competitive.","Pitching too carefully with a big lead leads to walks and long innings. Attack the zone — let them get themselves out.","A game is never a practice session. Save the experiments for bullpen sessions."],
      rates:[85,25,35,15],concept:"With a big lead, stay aggressive but don't overthrow — attack the zone and let hitters get themselves out",anim:"strike"},
    {id:"p35",title:"Opening At-Bat of the Game",diff:1,cat:"approach",
      description:"Top of the 1st, very first batter of the game. You're on the mound, nervous and excited. The leadoff hitter steps in. What's your plan?",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["First-pitch fastball strike — set the tone","Start with your best breaking ball to surprise him","Throw a changeup to mess with his timing","Nibble the corners — don't give in"],
      best:0,explanations:["Get strike one! Starting the game with a first-pitch strike tells the whole lineup you're in command. Pitchers who throw first-pitch strikes have ERAs nearly 2 runs lower. Set the tone for the day.","Breaking balls first pitch of the game are risky — your feel for them isn't established yet. Start with what you can control.","A changeup works best when the hitter expects something faster. First pitch of the game, he doesn't know what to expect yet.","Nibbling against the leadoff hitter puts you behind in the count immediately. Attack the zone."],
      rates:[85,30,35,20],concept:"Start the game with a first-pitch strike — set the tone and take command early",anim:"strike"},
    {id:"p36",title:"Your Team Just Scored Big",diff:1,cat:"approach",
      description:"Bot of the 4th, your team just scored 4 runs to take a 6-1 lead. You're heading back to the mound with a big cushion. Top of the order is coming up.",
      situation:{inning:"Top 5",outs:0,count:"0-0",runners:[],score:[6,1]},
      options:["Attack the zone — put up a quick inning","Take it easy — you have a big lead now","Try to strike everyone out — dominate","Pitch carefully — don't give the lead back"],
      best:0,explanations:["After your team scores big, the best thing you can do is put up a quick, efficient inning. Throw strikes, get ground balls, and get your team back to the plate fast. Momentum is real — keep it going.","Taking it easy leads to walks and long innings. Stay engaged.","Trying to strike everyone out drives up your pitch count. You want quick outs.","Being too careful after a big scoring inning kills the momentum your offense just built."],
      rates:[85,20,35,30],concept:"After your team scores big, put up a quick inning — keep the momentum going",anim:"strike"},
    {id:"p37",title:"Tie Game, Deep in the Count",diff:2,cat:"situational",
      description:"Bot 7th, tied 3-3, you've thrown 85 pitches. You feel strong but the top of the order is coming. 0 outs. Do you keep attacking or conserve energy?",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[],score:[3,3]},
      options:["Keep attacking — you feel good, stay aggressive","Mix in more off-speed to save your arm","Pitch to contact — let your defense work","Throw everything you have — empty the tank"],
      best:2,explanations:["Attacking is good but being smart about it is better. At 85 pitches, you need efficiency.","Throwing more off-speed just to save your arm changes your approach and hitters notice.","At 85 pitches in a tie game, pitching to contact is the smartest approach. Throw strikes, let your defense field ground balls and fly balls. Quick outs keep your pitch count down and keep you in the game longer. Trust your fielders.","Emptying the tank in the 7th means you won't make it to the 8th. Pace yourself."],
      rates:[40,35,85,20],concept:"Deep in games, pitch to contact — trust your defense and stay efficient",anim:"groundout"},
    {id:"p38",title:"Third Time Through — Adjust",diff:2,cat:"adjustments",
      description:"Top of the 6th, you're facing the #3 hitter for the third time. He singled off your fastball in the 2nd and doubled off it in the 4th. Score 4-3 your lead.",
      situation:{inning:"Top 6",outs:1,count:"0-0",runners:[],score:[4,3]},
      options:["Throw the fastball again — you're a fastball pitcher","Lead with a changeup — disrupt his timing","Start with a curveball — something completely different","Pitch inside — he's been hitting outside pitches"],
      best:1,explanations:["He's 2-for-2 on your fastball. Definition of insanity: doing the same thing and expecting different results.","The changeup is the perfect pitch here. He's timed your fastball twice. The changeup looks like a fastball coming out of your hand but arrives 8-10 mph slower. His timing will be completely off. Third time through, you MUST adjust.","A curveball is a speed change too, but the changeup better mimics the fastball arm action — harder for him to recognize.","Pitching inside helps, but if the speed is the same, he can still time it. Change the speed, not just the location."],
      rates:[15,85,55,35],concept:"Third time through, you MUST change something — if your fastball's been hit, lead with off-speed",anim:"strike"},
    {id:"p39",title:"Teammate Hit a Homer — Keep Your Cool",diff:2,cat:"approach",
      description:"Top of the 5th, the batter before this one crushed a solo homer off your fastball. 3-2, still your lead. You're angry. Next batter steps in.",
      situation:{inning:"Top 5",outs:1,count:"0-0",runners:[],score:[3,2]},
      options:["Throw harder — show this next guy you're still in charge","Take a deep breath and reset — pitch your game","Pitch inside to send a message","Be extra careful — can't give up another homer"],
      best:1,explanations:["Overthrowing after giving up a homer leads to more mistakes. Anger makes you lose mechanics.","The best pitchers have short memories. That homer is done — you can't un-throw it. Take a breath, reset your focus, and pitch to THIS batter. Your game plan worked for 4.1 innings. One homer doesn't mean your plan is broken.","Pitching inside to 'send a message' can hit a batter and put another runner on. That hurts YOU, not the other team.","Being too careful leads to walks and more baserunners. Stick to your game plan — one homer doesn't change everything."],
      rates:[20,85,15,35],concept:"After giving up a homer, reset mentally — short memory, stay with your game plan",anim:"strike"},
    {id:"p40",title:"Walking Batters — What's Wrong?",diff:2,cat:"adjustments",
      description:"Bot 3rd, you just walked two batters in a row. Runners on 1st and 2nd, nobody out. Your catcher comes out. Score 2-0 your lead.",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[1,2],score:[2,0]},
      options:["Throw harder — overpower the next guy","Slow down — take a deep breath between pitches","Simplify — throw fastball strikes, forget about off-speed","Mix more off-speed to change the batter's eye level"],
      best:2,explanations:["Throwing harder when you're already losing control makes control even worse. Velocity isn't your problem — location is.","Slowing down helps mentally, but you also need an action plan for what to throw.","When you're walking batters, your mechanics are off. Simplify! Throw fastballs and aim for the middle of the zone. Don't try to be perfect — just throw strikes. A single is better than another walk. Once you find your rhythm again, you can add in off-speed.","Adding more off-speed when you can't throw your fastball for strikes makes things worse, not better."],
      rates:[15,45,85,25],concept:"When you're walking batters, simplify — throw fastball strikes until you find your rhythm",anim:"strike"},
    {id:"p41",title:"Cold Weather Breaking Ball",diff:3,cat:"adjustments",
      description:"Top of the 3rd, it's 45 degrees and your curveball has no bite today. Usually it drops 6 inches — today it's flat. Tied 1-1.",
      situation:{inning:"Top 3",outs:0,count:"0-0",runners:[],score:[1,1]},
      options:["Keep throwing the curveball — it'll come around","Stop throwing the curveball entirely — all fastball","Use the changeup instead — it doesn't need spin like the curve","Switch between curveball and more fastball/changeup"],
      best:2,explanations:["A flat curveball in cold weather won't suddenly start biting. It's a batting practice pitch waiting to get crushed.","Going all-fastball makes you predictable. Hitters will time your velocity.","In cold weather, the curveball often loses its bite because your fingers are cold and can't grip the seams as well. The changeup doesn't rely on spin as much — it's a grip-based pitch that works in any weather. Replace your dead curveball with the changeup and you still have a speed-change weapon.","Mixing in a flat curve occasionally still risks hanging one. Commit to the changeup as your off-speed."],
      rates:[15,30,85,40],concept:"In cold weather, replace your curveball with the changeup — it doesn't rely on finger spin",anim:"strike"},
    {id:"p42",title:"Top of the Order in the 8th",diff:3,cat:"late-game",
      description:"Top of the 8th, 1-run lead. You've thrown 95 pitches. The top of their order — 1-2-3 hitters — is coming up. They've seen you twice each.",
      situation:{inning:"Top 8",outs:0,count:"-",runners:[],score:[4,3]},
      options:["Stay in and compete — you've got this","Ask the coach for a reliever — the bullpen is fresh","Change your pitch mix completely — surprise them","Keep the same approach — it's worked for 7 innings"],
      best:0,explanations:["At 95 pitches with a 1-run lead, you can pitch another inning IF you're efficient. The key is adjusting your approach since they've seen you twice. Change sequences, add more off-speed, and pitch to contact. Don't try to overpower — outsmart.","Asking for a reliever is the manager's call. Your job is to compete until told otherwise.","Completely changing your approach is too drastic. Adjust, don't reinvent.","The same approach won't work as well the third time through. Hitters improve 40+ points in BA third time through the order. You must adjust."],
      rates:[85,40,35,25],concept:"Third time through, adjust your sequences — same pitcher, different approach beats the hitters' adjustments",anim:"strike"},
    {id:"p43",title:"Fastball's Not Working Today",diff:3,cat:"adjustments",
      description:"Bot of the 4th, your fastball keeps missing arm-side. You've thrown 3 wild fastballs already. But your slider has been sharp. Tied 2-2.",
      situation:{inning:"Bot 4",outs:0,count:"0-0",runners:[],score:[2,2]},
      options:["Keep throwing fastballs until they start going where you want","Make the slider your primary pitch today","Only throw fastballs in fastball counts to get strikes","Mix everything and hope the fastball comes around"],
      best:1,explanations:["Forcing a pitch that isn't working leads to walks and meatballs. Adapt.","When your primary pitch isn't working, make your best pitch your primary. If the slider is sharp, throw it 60-70% of the time and use the fastball sparingly. Great pitchers adapt in real time — they don't stubbornly force a pitch that's misbehaving.","Only throwing fastballs in fastball counts makes you predictable in those counts. Hitters will sit on it.","Hoping the fastball comes around is not a strategy. Use what you have today."],
      rates:[20,85,35,30],concept:"When your primary pitch isn't working, adapt — make your best pitch today your primary pitch",anim:"strike"},
    // Batch 4 — Holding Runners & Pickoffs
    {id:"p44",title:"Big Lead — Throw a Pickoff?",diff:1,cat:"baserunners",
      description:"Top of the 4th, runner on 1st, nobody out, tied 2-2. The runner is taking a huge lead — three big steps off the bag. Your first baseman is holding him on.",
      situation:{inning:"Top 4",outs:0,count:"0-0",runners:[1],score:[2,2]},
      options:["Throw to first — pick him off","Ignore the lead — focus on the batter","Quick-pitch to home","Step off the rubber and look at him"],
      best:0,explanations:["A runner taking a huge lead is begging to be picked off. Throw to first! Even if you don't get him out, you'll shorten his lead and make him respect your move. A shorter lead means a harder steal.","Ignoring a massive lead invites a steal. The runner will get even more aggressive.","Quick-pitching to home doesn't address the lead. He's still got a great jump.","Stepping off is fine but throwing to first is more effective — it actually threatens the runner with an out."],
      rates:[85,15,35,45],concept:"When a runner takes a big lead, throw over to first — shorten his lead and keep him honest",anim:"safe"},
    {id:"p45",title:"Known Base Stealer — Adjust Timing",diff:1,cat:"baserunners",
      description:"Bot 5th, the fastest runner in the league is on 1st, 1 out. He steals 80% of the time. Your catcher has an average arm. Count is 1-0.",
      situation:{inning:"Bot 5",outs:1,count:"1-0",runners:[1],score:[3,2]},
      options:["Throw over to first three times before pitching","Vary your timing — hold the ball different amounts","Quick-pitch every time","Ignore him — you can't stop speed"],
      best:1,explanations:["Three pickoff attempts in a row frustrates everyone and still doesn't solve the problem if he's fast enough.","Base stealers time your delivery. They count seconds: 'one-Mississippi, two-Mississippi, throw.' If you vary your hold time — sometimes 1 second, sometimes 3 seconds, sometimes 2.5 — they can't get a good jump because they can't predict when you'll pitch. This is the best weapon against speedsters.","Quick-pitching every time becomes predictable — the runner adjusts.","Giving up means he steals easily. You can disrupt his timing even if you can't stop him completely."],
      rates:[30,85,25,10],concept:"Against base stealers, vary your hold time — unpredictable timing ruins their jump",anim:"strike"},
    {id:"p46",title:"Runner on Second — Big Secondary Lead",diff:2,cat:"baserunners",
      description:"Top of the 6th, runner on 2nd, 1 out, tied 3-3. The runner keeps taking a huge secondary lead after you deliver to home — drifting almost to the shortstop.",
      situation:{inning:"Top 6",outs:1,count:"1-1",runners:[2],score:[3,3]},
      options:["Step off the rubber and look at him","Throw a quick pitch — ignore the secondary","Have the shortstop sneak behind him after the pitch","Spin and throw to second"],
      best:2,explanations:["Stepping off before you pitch doesn't address the SECONDARY lead — that happens after you throw.","Quick-pitching to home means the runner's secondary lead goes unchecked.","The daylight play! Have the shortstop or second baseman sneak behind the runner after you pitch. Your catcher throws back to second immediately after receiving the pitch, and the fielder is waiting for the tag. This catches aggressive secondary leads.","Spinning to throw to second from the stretch is a balk if you don't step off first."],
      rates:[35,20,85,25],concept:"For aggressive secondary leads, use the daylight play — the catcher throws behind the runner after the pitch",anim:"catch"},
    {id:"p47",title:"Two Pickoffs Already — Try Again?",diff:2,cat:"baserunners",
      description:"Bot 3rd, runner on 1st, nobody out. You've thrown to first twice already and the runner is still taking the same lead. He's not intimidated. Count is 0-1.",
      situation:{inning:"Bot 3",outs:0,count:"0-1",runners:[1],score:[1,1]},
      options:["Throw over again — third time's the charm","Focus on the batter — you've shown him your move","Vary your timing and pitch to home","Step off and hold the ball extra long"],
      best:2,explanations:["A third pickoff attempt after two failures wastes time and annoys your defense. The runner has timed your move — he's not going to get picked off.","Focusing only on the batter lets the runner relax. You need a compromise.","You've established the pickoff threat — the runner knows you'll throw over. Now use that to your advantage. Vary your timing to home so he can't time his jump. The pickoff threat plus unpredictable timing is the best combination for controlling the running game.","Holding the ball extra long can be called for delay. Pitch the ball."],
      rates:[20,35,85,30],concept:"After establishing the pickoff threat, vary your delivery timing — the combination controls runners",anim:"strike"},
    {id:"p48",title:"Lefty Advantage — Pickoff Move",diff:2,cat:"baserunners",
      description:"Top of the 7th, fast runner on 1st, nobody out, up 4-3. You're a left-handed pitcher — you face the runner naturally when pitching from the stretch.",
      situation:{inning:"Top 7",outs:0,count:"0-0",runners:[1],score:[4,3]},
      options:["Use your pickoff move — lefties have the best angle","Ignore the runner — just pitch","Quick-pitch to surprise the runner","Hold the ball and stare him down"],
      best:0,explanations:["Left-handed pitchers have the best pickoff move in baseball because they face first base while pitching. Your kick leg goes toward both home and first — the runner can't tell which way you're going until the last moment. Use this advantage! A good lefty pickoff move picks off runners who would steal easily on righties.","As a lefty with a fast runner on first, ignoring your biggest advantage is wasteful.","Quick-pitching is a gimmick. Your natural pickoff advantage is better.","Staring at the runner without throwing doesn't accomplish anything."],
      rates:[85,20,30,15],concept:"Left-handed pitchers have a natural pickoff advantage — your body faces first base. Use it!",anim:"safe"},
    {id:"p49",title:"Runner Faking — Stay Composed",diff:3,cat:"baserunners",
      description:"Bot 6th, runner on 1st, 1 out, tied 5-5. The runner keeps faking like he's going to steal — bluffing secondary leads, dancing off first. He's trying to distract you.",
      situation:{inning:"Bot 6",outs:1,count:"1-1",runners:[1],score:[5,5]},
      options:["Throw over every time he fakes — teach him a lesson","Ignore his fakes — focus completely on the batter","Acknowledge the fake with a look, then deliver to home","Step off and throw to first when he fakes"],
      best:2,explanations:["Throwing over every time he moves is exhausting and exactly what he wants — to get you out of your rhythm.","Completely ignoring him means you can't react if he actually goes.","The runner is in your head — that's his goal. Acknowledge him with a quick glance so he knows you're aware, then deliver to the plate. Don't let him change your timing or your focus on the batter. A quick look says 'I see you' without disrupting your pitch.","Stepping off every fake wastes time and breaks your rhythm. A glance is enough."],
      rates:[20,35,85,30],concept:"When runners try to distract you, acknowledge with a look but stay focused on the batter",anim:"strike"},
    {id:"p50",title:"Pitchout — When to Agree",diff:3,cat:"baserunners",
      description:"Top of the 8th, fast runner on 1st, nobody out, up 3-2. Your catcher signals for a pitchout — he thinks the runner is stealing on the next pitch. Count is 1-1.",
      situation:{inning:"Top 8",outs:0,count:"1-1",runners:[1],score:[3,2]},
      options:["Agree to the pitchout — trust your catcher","Shake it off — you don't want to fall behind 2-1","Only pitchout on even or pitcher's counts","Throw a fastball up and in instead"],
      best:0,explanations:["Your catcher has the best view of the runner's movements. If he thinks the runner is going, trust him. A pitchout (an intentional ball thrown high and outside) lets the catcher receive the ball standing up and throw to second quickly. If the runner IS stealing, it's almost a guaranteed out.","Falling behind 2-1 is a concern, but catching a runner stealing is worth more than the count. The catcher reads body language you can't see.","Limiting pitchouts to certain counts makes them predictable. If the catcher reads the runner's body language, act on it.","A fastball up and in doesn't give the catcher the same clean receiving position as a pitchout."],
      rates:[85,35,30,40],concept:"Trust your catcher's pitchout call — he reads the runner's body language better than anyone",anim:"catch"},
    {id:"p51",title:"Daylight Play at Second",diff:3,cat:"baserunners",
      description:"Bot 7th, runner on 2nd, nobody out, tied 4-4. The shortstop flashes his glove — the signal for the daylight play. He's going to sneak behind the runner on 2nd.",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[2],score:[4,4]},
      options:["Throw to second after the signal — pick him off","Ignore the signal — focus on the batter","Look at the runner, step off, then throw when the SS gets there","Step off, wait for the shortstop to get in position, then throw"],
      best:3,explanations:["Throwing immediately after the signal might beat the shortstop — he needs time to get to the bag.","Ignoring a defensive signal from your middle infielder wastes a strategic opportunity.","Looking at the runner tips him off. The whole point is to catch him off guard.","Step off the rubber (so it's not a balk), wait for the shortstop to reach the bag behind the runner, then throw. The timing has to be coordinated — the runner doesn't know the SS is sneaking behind him. This play picks off runners who get complacent at second base."],
      rates:[30,15,40,85],concept:"On the daylight play, step off and wait for the fielder to reach the bag — timing and coordination are key",anim:"catch"},
    // Batch 5 — Intentional Walks & Pitching Around
    {id:"p52",title:"Their Best Hitter — First Base Open",diff:2,cat:"strategy",
      description:"Top of the 8th, runner on 2nd, 2 outs, up 4-3. Their best hitter (.340 avg) is at the plate. First base is open. The #5 hitter (.230) is on deck.",
      situation:{inning:"Top 8",outs:2,count:"-",runners:[2],score:[4,3]},
      options:["Walk him intentionally — face the .230 hitter","Pitch to him — don't put the tying run on base","Pitch around him carefully — not an intentional walk but nothing hittable","Walk only if you fall behind 2-0"],
      best:0,explanations:["With first base open, 2 outs, and a massive gap in batting averages (.340 vs .230), the intentional walk is smart. You put a runner on first but face a much weaker hitter. The .230 hitter is far less likely to drive in the run.","Pitching to a .340 hitter in a clutch spot when you can face a .230 hitter is unnecessarily risky.","Pitching around him risks walking him on a ball count when you could just walk him immediately and face the weaker hitter with a fresh count.","Waiting until 2-0 to decide means you've already thrown 2 pitches to their best hitter and risked a hit."],
      rates:[85,25,50,35],concept:"With first base open and a much weaker hitter on deck, walk the dangerous hitter intentionally",anim:"walk"},
    {id:"p53",title:"Set Up the Force at Any Base",diff:2,cat:"strategy",
      description:"Bot 7th, runner on 2nd, 2 outs, tied 3-3. First base is open. An intentional walk puts the tying run on first and gives you a force play at any base.",
      situation:{inning:"Bot 7",outs:2,count:"-",runners:[2],score:[3,3]},
      options:["Walk him — set up the force play","Pitch to him — don't put extra runners on","Walk only if the next batter is weaker","Pitch carefully but don't walk him intentionally"],
      best:0,explanations:["Walking the batter to put runners on 1st and 2nd creates a force play at second, third, and first. On any ground ball, you can get the force out at any base instead of needing a tag. The force play is much easier to execute than a tag play.","Pitching to this batter without the force play means a ground ball to the left side requires a tag at third — much harder than a force.","The next batter's stats matter, but the force play advantage is valuable regardless.","Pitching carefully often leads to unintentional walks on 3-2 counts — just walk him on purpose and be ready."],
      rates:[85,30,40,35],concept:"Walk a batter to set up the force play — force outs are easier than tag plays",anim:"walk"},
    {id:"p54",title:"Lefty-Righty Walk Advantage",diff:2,cat:"strategy",
      description:"Top of the 6th, runner on 1st, 1 out, tied 4-4. A tough left-handed hitter (.320 avg) is at the plate. The next batter is a right-handed hitter (.210 avg). You're a right-handed pitcher.",
      situation:{inning:"Top 6",outs:1,count:"-",runners:[1],score:[4,4]},
      options:["Walk the lefty to face the righty — platoon advantage","Pitch to the lefty — don't put another runner on","Pitch carefully to the lefty — don't give him anything good","Only walk him if he gets ahead in the count"],
      best:0,explanations:["As a righty, you have a natural advantage against right-handed hitters — your breaking balls move AWAY from them, which is harder to hit. Walking the lefty to face the righty gives you the platoon advantage AND sets up a double play.","Pitching to a tough lefty as a righty means your breaking balls move INTO his hitting zone — toward him, not away. That's dangerous.","Pitching carefully often leads to walks anyway, but on a 3-2 count with a full count battle. Just walk him cleanly.","Waiting to decide until the count develops wastes pitches and risks giving up a hit."],
      rates:[85,30,40,25],concept:"Walk a tough opposite-hand hitter to face a same-hand hitter — use the platoon advantage",anim:"walk"},
    {id:"p55",title:"3-for-3 Against You — Walk Him?",diff:3,cat:"strategy",
      description:"Bot 8th, runners on 1st and 2nd, 1 out, up 6-4. Their cleanup hitter is 3-for-3 against you today with a double and a homer. First base is NOT open — walking him loads the bases.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[1,2],score:[6,4]},
      options:["Walk him anyway — he owns you today","Pitch to him — don't load the bases","Pitch around him very carefully — nothing hittable","Bring in a new pitcher to face him"],
      best:2,explanations:["Walking him loads the bases — now a walk, HBP, or wild pitch scores a run. That's too dangerous.","Pitching to a guy who's 3-for-3 with extra-base hits is also dangerous. He's got your timing.","Pitch around him — throw competitive pitches just off the zone. If he chases, great. If he doesn't, you walk him but at least you made him earn it. This is the middle ground between challenging a hot hitter and loading the bases intentionally.","A new pitcher with runners on in the 8th is high-pressure. Sometimes you have to compete with what you've got."],
      rates:[30,20,85,40],concept:"When a hitter owns you, pitch around him carefully — don't groove one but don't load the bases free",anim:"strike"},
    {id:"p56",title:"Walk to Load Bases — Force at Home",diff:3,cat:"strategy",
      description:"Top of the 9th, runners on 2nd and 3rd, 2 outs, up 5-3. First base is open. Walking the batter loads the bases but gives you a force at home.",
      situation:{inning:"Top 9",outs:2,count:"-",runners:[2,3],score:[5,3]},
      options:["Walk him — force at home on any ground ball","Pitch to him — don't load the bases","Walk only if this batter is better than the next one","Bring in a reliever instead"],
      best:0,explanations:["With a 2-run lead and 2 outs, loading the bases gives you a force at EVERY base, including home. Any ground ball, the catcher steps on home for the force out — no tag needed. A tag play at home on a close play is much harder. The force at home is a huge defensive advantage.","Pitching to him without the force at home means a ground ball through the infield scores a run, and a tag play at the plate might not get the runner.","The force at home is valuable regardless of who's batting next. It's about defensive positioning, not matchups.","Bringing in a reliever doesn't address the defensive advantage of the force at home."],
      rates:[85,30,35,25],concept:"Loading the bases for a force at home can be smart — force outs at the plate are much easier than tags",anim:"walk"},
    {id:"p57",title:"IBB Backfires — Surprise Pinch Hitter",diff:3,cat:"strategy",
      description:"Bot 8th, you just intentionally walked their #4 hitter to face the weaker #5 hitter. But the opposing manager sends up a pinch hitter — a left-handed veteran with a .290 average.",
      situation:{inning:"Bot 8",outs:1,count:"0-0",runners:[1,2],score:[4,3]},
      options:["Stick with your game plan — pitch to the pinch hitter","Ask your manager for help — this changes things","Be extra careful — this guy is better than expected","Attack the zone — don't pitch scared"],
      best:3,explanations:["Sticking with the plan is fine, but you need to adjust your approach for a different hitter.","Your manager already made the call. Adapt and compete.","Being 'extra careful' leads to walks and more runners. You already have runners on 1st and 2nd.","A surprise pinch hitter means you expected a weaker batter. Don't panic — attack the zone. The pinch hitter is cold (hasn't batted all game), and you're warm. Throw strikes and make him beat you. Cold pinch hitters struggle with the first few pitches. Use that."],
      rates:[35,20,30,85],concept:"When a pinch hitter surprises you, attack — they're cold and you're warm. Throw strikes",anim:"strike"},
    {id:"p58",title:"Walk the 8th Hitter?",diff:3,cat:"strategy",
      description:"Top of the 7th, runner on 3rd, 2 outs, up 3-2. The #8 hitter (.200) is up. The pitcher (.100) bats next. Should you walk the 8 hitter to face the pitcher?",
      situation:{inning:"Top 7",outs:2,count:"-",runners:[3],score:[3,2]},
      options:["Walk the .200 hitter to face the .100 pitcher","Pitch to the .200 hitter — he's weak enough","Pitch around the .200 hitter — nothing good","Only walk if you fall behind in the count"],
      best:0,explanations:["Walking the .200 hitter to face the pitcher (.100) is a massive upgrade. You're going from a 1-in-5 chance of a hit to a 1-in-10 chance. Plus, pitchers are terrible hitters. With the tying run on third, take every advantage you can.","A .200 hitter can still get a hit. A .100 pitcher is almost a guaranteed out. Take the sure thing.","Pitching around him wastes pitches when you could just walk him and face the pitcher fresh.","Waiting to fall behind wastes pitches and risks giving up a hit in the process."],
      rates:[85,40,45,30],concept:"Walk a weak hitter to face an even weaker one — pitchers batting are almost automatic outs",anim:"walk"},
    {id:"f22",title:"Bunt With Runners — Get the Lead Runner",diff:3,cat:"infield",
      description:"Bot 3rd, runners on 1st and 2nd, nobody out, tied 1-1. The batter bunts — decent bunt rolling toward the mound. You're the pitcher. Where do you throw?",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[1,2],score:[1,1]},
      options:["Throw to third — get the lead runner","Throw to second — start a double play","Throw to first — get the sure out","Hold it and eat the ball"],
      best:0,explanations:["Getting the lead runner at third is the best play on a bunt with runners on 1st and 2nd! The runner from second is forced to third — it's a force out, so the third baseman just catches it on the bag. Getting the lead runner prevents him from reaching scoring position.","There's no double play on a bunt — everyone is moving forward and the batter is fast out of the box.","Throwing to first is easy but advances both runners into scoring position (2nd and 3rd). Getting the lead runner is worth the effort.","Eating the ball with nobody out loads the bases. Make a play!"],
      rates:[85,15,40,5],concept:"On a bunt with runners on 1st and 2nd, get the lead runner at third — it's a force out",anim:"bunt"},
  ],
  batter: [
    {id:"b1",title:"RBI Opportunity",diff:1,cat:"situational",
      description:"Runner on 3rd, 1 out, down 2-1 in the 7th. Pitcher throws mostly fastballs. Infield at normal depth.",
      situation:{inning:"Bot 7",outs:1,count:"1-1",runners:[3],score:[1,2]},
      options:["Swing for the fences","Fly ball — sacrifice fly","Ground ball to the right side","Work a walk"],
      best:1,explanations:["Swinging for a homer is selfish here. You just need 1 run to tie.","A fly ball to the outfield scores the runner even if you're out. Ties the game.","Ground ball with infield at normal depth might get the runner thrown out at home.","Walking doesn't help with the tying run 90 feet away."],
      explSimple:["You don't need a home run — you just need to get the runner home to tie it up.","A fly ball lets the runner on third tag up and score. Even if you're out, the run counts!","A ground ball might let the other team throw the runner out at home.","A walk doesn't help because the runner on third still can't score from a walk."],
      rates:[25,85,45,30],concept:"With runner on 3rd, less than 2 outs: a fly ball is a productive out",anim:"flyout"},
    {id:"b2",title:"Two-Strike Approach",diff:2,cat:"counts",
      description:"0-2 count, runner on 2nd, 2 outs. The pitcher's slider has been devastating today.",
      situation:{inning:"Bot 5",outs:2,count:"0-2",runners:[2],score:[3,4]},
      options:["Sit on the slider","Choke up and battle — protect the plate","Look fastball, react to off-speed","Surprise bunt"],
      best:1,explanations:["Guessing one pitch on 0-2 is a gamble.","Perfect! Choke up for bat control and a shorter swing. Fight off tough pitches until you get something hittable.","Sitting fastball when the slider is dominant means you'll chase.","Foul bunt with 2 strikes = strikeout. Game over."],
      explSimple:["Guessing one pitch with two strikes is too risky — you might guess wrong and strike out.","Great! Choke up on the bat and just try to make contact. Fight off tough pitches until you get a good one.","If the pitcher keeps throwing sliders, just looking for fastballs means you'll swing at bad pitches.","Be careful — if you try to bunt and it goes foul with two strikes, you're out!"],
      rates:[35,80,45,10],concept:"With 2 strikes, shorten your swing and focus on putting the ball in play",anim:"hit"},
    {id:"b3",title:"Hit and Run",diff:1,cat:"plays",
      description:"Coach gives the hit-and-run sign. Runner on 1st, 1 out, count 1-1.",
      situation:{inning:"Top 3",outs:1,count:"1-1",runners:[1],score:[1,1]},
      options:["Swing no matter what","Only swing if it's good","Bunt instead","Swing and pull for power"],
      best:0,explanations:["On a hit-and-run, the runner goes on the pitch. You MUST swing to protect him.","You can't be selective — the runner is committed and will be thrown out.","The sign was hit-and-run, not bunt. Don't change the play.","The goal is contact, not power."],
      explSimple:["On a hit-and-run, you HAVE to swing because the runner is already running. If you don't swing, he could get thrown out.","You can't wait for a good pitch — the runner is counting on you to swing!","The coach said hit-and-run, not bunt. Do what the coach says.","Just try to hit the ball — you don't need to hit it hard, just make contact."],
      rates:[85,30,40,20],concept:"On a hit-and-run, your job is to swing and make contact — protect the runner",anim:"hit"},
    {id:"b4",title:"Smart Aggression",diff:2,cat:"approach",
      description:"It's your first at-bat and you're feeling out the pitcher. First pitch is a fastball right down the middle.",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Take it — see what he has","Swing — be aggressive on strikes","Bunt for a hit","Take until you get a strike"],
      best:1,explanations:["Seeing pitches is nice, but a meatball down the middle is the most hittable pitch you'll see. Being patient doesn't mean taking every pitch — it means being ready when you get your pitch.","Smart aggression! MLB hitters who swing at first-pitch strikes bat .340+. Being selectively aggressive means pouncing on hittable pitches in the zone.","Bunting a meatball wastes a gift.","That IS a strike. You're already in trouble at 0-1. Being patient means waiting for YOUR pitch, not watching strikes go by."],
      explSimple:["Watching pitches is fine, but if the ball is right down the middle, you should swing!","Yes! If the pitch is right there to hit, go for it. A good hitter swings at good pitches.","Bunting a pitch that's easy to hit is a waste. Swing away!","That pitch was already a strike. Now you're behind in the count."],
      rates:[45,85,30,35],concept:"Be selectively aggressive — attack hittable pitches in the zone",anim:"hit"},
    {id:"b5",title:"Advancing the Runner",diff:1,cat:"situational",
      description:"Runner on 2nd, nobody out, tie game in the 7th. You're a #2 hitter with good contact.",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[2],score:[3,3]},
      options:["Pull for extra bases","Hit to the right side","Bunt him to 3rd","Swing for the fences"],
      best:1,explanations:["Pulling doesn't reliably advance the runner.","Hitting right side moves him to 3rd. From there he scores on a sac fly, wild pitch, or groundout.","Bunting is okay but a hit to the right side moves him AND potentially gets you on base.","Ignores the situation entirely."],
      explSimple:["Pulling the ball to the left side doesn't help the runner move to third.","Hit the ball to the right side! That moves the runner to third, where he can score really easily.","A bunt is okay, but hitting to the right side is even better because you might get on base too.","Swinging for the fences ignores the runner — your job is to help the team score."],
      rates:[30,85,60,15],concept:"Moving runners to 3rd with 0 outs creates multiple ways to score",anim:"hit"},
    {id:"b6",title:"Hitter's Count",diff:2,cat:"counts",
      description:"Bases loaded, 2 outs, down by 1. Count is 3-1. Pitcher has been wild.",
      situation:{inning:"Bot 8",outs:2,count:"3-1",runners:[1,2,3],score:[4,5]},
      options:["Take — a walk ties the game","Swing only at YOUR pitch","Swing at anything close","Grand slam swing"],
      best:1,explanations:["What if it's a perfect strike? Now you're 3-2 and defending.","3-1 is the best hitter's count. Only swing at YOUR pitch. If not perfect, take ball four.","Being too aggressive wastes the 3-1 advantage.","Grand slam swings change your mechanics. Trust your swing."],
      explSimple:["What if it's a great pitch to hit? You'd miss your chance by just watching.","This is YOUR count! Only swing if the pitch is perfect for you. If it's not great, take ball four and walk.","Swinging at anything wastes the advantage — be patient and wait for your pitch.","Trying to crush it changes your swing. Just swing normal and hit it hard."],
      rates:[50,85,35,20],concept:"3-1 is a hitter's count — swing only at YOUR pitch",anim:"hit"},
    {id:"b7",title:"Going Opposite Field",diff:2,cat:"adjustments",
      description:"Pitcher keeps throwing outside. You've fouled off 3 pitches. Count 1-2. Runner on 1st.",
      situation:{inning:"Top 5",outs:1,count:"1-2",runners:[1],score:[2,2]},
      options:["Normal swing — he'll come inside","Go with the pitch — opposite field","Step closer to the plate","Bunt"],
      best:1,explanations:["If it's working, he won't change. YOU adjust.","Smart! When the pitcher works outside, drive it the other way. That's what the best hitters do.","Moving in the box doesn't fix your swing approach.","Bunting with 2 strikes risks a foul-bunt strikeout."],
      explSimple:["The pitcher keeps throwing outside because it's working. You need to change, not him.","Smart! If the pitch is on the outside, hit it the other way. Don't fight it — go with it.","Moving closer to the plate doesn't help if you're still swinging the same way.","Bunting with two strikes is dangerous because a foul bunt means you're out."],
      rates:[25,85,50,20],concept:"When the pitcher works away, go with it to the opposite field",anim:"hit"},
    {id:"b8",title:"Cold Off the Bench",diff:3,cat:"pressure",
      description:"Pinch hitting, bottom 9th, runner on 2nd, 2 outs, down by 1. You haven't batted all game. Pitcher throws 95.",
      situation:{inning:"Bot 9",outs:2,count:"0-0",runners:[2],score:[3,4]},
      options:["Take the first pitch to time his speed","Swing if it's hittable","Ambush a specific pitch","Bunt"],
      best:0,explanations:["Coming in cold against 95mph, you need to time him. Taking one pitch gives you a read on his velocity and movement. But stay ready — if he grooves one, be prepared to adjust.","Your timing will be off against 95mph without any at-bats. It's a close call, but seeing one pitch helps more than it hurts.","Ambushing requires locked-in timing you don't have yet.","Bunting with 2 outs and a runner on 2nd makes no sense."],
      rates:[70,60,45,5],concept:"As a pinch hitter, taking the first pitch to time the pitcher's velocity is usually smart — but stay ready",anim:"strike"},
    {id:"b9",title:"Infield Playing In",diff:2,cat:"situational",
      description:"Runner on 3rd, 1 out. Infield drawn in. Count 2-2.",
      situation:{inning:"Bot 6",outs:1,count:"2-2",runners:[3],score:[2,3]},
      options:["Fly ball to score the runner","Hard grounder","Hit over the infield","Ground ball anywhere"],
      best:0,explanations:["With infield in, ground balls are more likely fielded. A fly ball scores the runner on a tag-up.","Infield in means they're positioned to throw the runner out at home.","Trying to hit over them changes your swing.","Ground ball contact is what the drawn-in defense wants."],
      explSimple:["A fly ball is great because the runner can tag up from third and score!","The infield is playing close, so a grounder lets them throw the runner out at home.","Trying to hit it over their heads changes your swing and makes it harder to hit.","A ground ball is exactly what the defense wants when they're playing in close."],
      rates:[80,35,40,30],concept:"When the infield plays in, fly balls are more valuable than ground balls",anim:"flyout"},
    {id:"b10",title:"After a Teammate's Homer",diff:1,cat:"approach",
      description:"Teammate just went deep. Pitcher walked the last batter on 4 pitches. He's rattled. Stadium is rocking.",
      situation:{inning:"Bot 5",outs:1,count:"0-0",runners:[1],score:[5,3]},
      options:["Swing first pitch — keep pressure","Take pitches — let him struggle","Look for YOUR pitch","Pull for another homer"],
      best:2,explanations:["Swinging at anything can bail him out with a cheap out.","Too patient — lets the pitcher reset and breathe.","When a pitcher is rattled, wait for your pitch and drive it.","Trying for homers changes your mechanics."],
      explSimple:["Swinging at everything helps the pitcher because you might get out on a bad pitch.","Being too patient gives the pitcher time to calm down and get back on track.","The pitcher is nervous! Wait for a good pitch and hit it hard.","Trying to hit a home run changes how you swing. Just hit the ball well."],
      rates:[45,30,85,25],concept:"When a pitcher is struggling, look for YOUR pitch — don't bail him out",anim:"hit"},
    {id:"b11",title:"First At-Bat Data",diff:2,cat:"adjustments",
      description:"2nd at-bat against this pitcher. First time he struck you out on 3 straight sliders. What's different now?",
      situation:{inning:"Top 4",outs:0,count:"0-0",runners:[],score:[1,2]},
      options:["Sit slider — he'll start with it again","Look fastball, react to slider","Swing at the first pitch before he sets up","Crowd the plate"],
      best:1,explanations:["He knows you saw 3 sliders. Smart pitchers mix it up the 2nd time.","Right! Expect fastball, then react to the slider. If he starts slider, you're ready.","Aggressive but uninformed. Use what you learned.","Crowding the plate doesn't help you hit sliders."],
      explSimple:["He threw you sliders last time, so he might throw something different now. Don't just look for one pitch.","Smart! Look for a fastball but be ready for the slider too. You learned from last time!","Swinging at the first pitch doesn't use what you learned from your first at-bat.","Moving closer to the plate doesn't help you hit better."],
      rates:[40,85,35,30],concept:"Use your first at-bat to gather data — adjust in the second at-bat",anim:"hit"},
    {id:"b12",title:"Down to the Last Strike",diff:3,cat:"pressure",
      description:"Bottom 9th, 2 outs, down by 2. Runners on 1st and 2nd. Count is 2-2. You represent the tying run at the plate.",
      situation:{inning:"Bot 9",outs:2,count:"2-2",runners:[1,2],score:[3,5]},
      options:["Swing hard — need a big hit","Shorten up and put the ball in play","Sit on one pitch and guess right","Take — pray for a walk"],
      best:1,explanations:["Overswinging with 2 strikes leads to strikeouts. Keep your season alive.","In elimination situations, shorten your swing and find a way to keep the at-bat alive. Contact creates chaos.","Guessing wrong ends your season.","A walk only loads the bases. You still need a hit."],
      rates:[25,80,35,30],concept:"With your back against the wall, shorten up and make contact — keep the line moving",anim:"hit"},
    {id:"b13",title:"Which Pitch to Expect",diff:1,cat:"basic",
      description:"You're a young batter stepping up to the plate for the first time in the game. You don't know anything about this pitcher yet. What should you look for?",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Look for a fastball — most pitchers throw fastballs first","Close your eyes and swing hard","Wait for a slow pitch — they're easier to hit","Guess curveball"],
      best:0,explanations:["Most pitchers throw fastballs 60%+ of the time. Until you see what a pitcher has, look for the most common pitch — the fastball. Be ready to hit it!","Never close your eyes! Watch the ball all the way.","You can't control what the pitcher throws. Be ready for the most likely pitch.","Guessing curveball on the first pitch you ever see from a pitcher is too specific."],
      rates:[85,5,30,20],concept:"Look fastball first — it's the most common pitch. React to everything else",anim:"hit"},
    // Batch 1 — Situational Hitting
    {id:"b14",title:"Runner on Third — Make Contact",diff:1,cat:"situational",
      description:"Top of the 5th, runner on 3rd, 1 out. Score tied 2-2. Count is 1-0. The pitcher throws mostly fastballs and the infield is at normal depth.",
      situation:{inning:"Top 5",outs:1,count:"1-0",runners:[3],score:[2,2]},
      options:["Hit a fly ball to the outfield","Swing for a home run","Bunt the runner home","Strike out looking — don't risk a double play"],
      best:0,explanations:["With a runner on 3rd and less than 2 outs, a fly ball to the outfield scores the run even if you make an out. That's called a sacrifice fly — one of the most productive outs in baseball.","Swinging for the fences changes your mechanics and often leads to strikeouts. You just need to get the run home.","Bunting with the infield at normal depth is risky — the catcher or pitcher could throw the runner out at home.","Striking out helps nobody. You have a chance to drive in the tying run!"],
      rates:[85,25,35,10],concept:"With a runner on 3rd and less than 2 outs, a fly ball is the most productive play",anim:"flyout"},
    {id:"b15",title:"Move the Runner Over",diff:1,cat:"situational",
      description:"Bottom of the 6th, runner on 2nd, nobody out, your team is up 3-2. You're the #2 hitter and a good contact guy. Count is 0-0.",
      situation:{inning:"Bot 6",outs:0,count:"0-0",runners:[2],score:[3,2]},
      options:["Hit to the right side to move the runner to 3rd","Pull the ball to left field for extra bases","Bunt the runner to 3rd","Swing hard — try to drive him in right now"],
      best:0,explanations:["Hitting to the right side moves the runner to 3rd with one out. From 3rd, he can score on a sac fly, wild pitch, passed ball, or groundout. You create many ways to score!","Pulling the ball doesn't reliably advance the runner, and ground balls to the left side can leave him stranded at 2nd.","Bunting is decent, but a ground ball to the right side moves the runner AND gives you a chance to reach base safely — two for one!","Swinging hard often leads to strikeouts or pop-ups. Play the percentages and move the runner."],
      rates:[85,30,55,25],concept:"With a runner on 2nd and nobody out, hitting to the right side advances him to 3rd",anim:"hit"},
    {id:"b16",title:"Leading Off an Inning",diff:1,cat:"situational",
      description:"Top of the 3rd, score is 1-0, you're the leadoff hitter starting the inning. Nobody on, nobody out. The pitcher's been sharp — only 1 hit so far.",
      situation:{inning:"Top 3",outs:0,count:"0-0",runners:[],score:[0,1]},
      options:["Work the count — see pitches and get on base","Swing at the first pitch to catch him off guard","Bunt for a hit to get something started","Swing for the fences — a homer ties it"],
      best:0,explanations:["As a leadoff hitter, your #1 job is getting on base. See some pitches, work the count, and look for a walk or a good pitch to hit. Getting on base starts rallies! Working the count doesn't mean taking every pitch — it means being patient but ready when you get your pitch.","First-pitch swinging can work, especially if you spot a pitch in your zone. Against a sharp pitcher though, seeing a pitch or two first helps you find his patterns.","Bunting when the defense isn't expecting it can work, but it's low-percentage as a first choice. Working the count gives you more options.","Swinging for the fences as the leadoff hitter is selfish. Get on base and let your teammates drive you in."],
      rates:[75,60,35,15],concept:"Leadoff hitters start rallies — get on base any way you can",anim:"walk"},
    {id:"b17",title:"Infield In — Fly or Ground?",diff:2,cat:"situational",
      description:"Bot 7th, runner on 3rd, 1 out, tied 4-4. Infield is playing in to cut off the run at home. Count is 1-1 against a sinkerball pitcher.",
      situation:{inning:"Bot 7",outs:1,count:"1-1",runners:[3],score:[4,4]},
      options:["Try to lift a fly ball to the outfield","Hit a hard grounder through the drawn-in infield","Bunt — surprise the defense","Swing for the fences to win it with a homer"],
      best:0,explanations:["When the infield plays in, a fly ball to the outfield scores the runner on a sacrifice fly — even if you're out. It's the highest-percentage play with 1 out.","The infield is drawn in specifically to throw the runner out on grounders. Even hard grounders give them a play at home.","A bunt against a drawn-in infield is dangerous — the fielders are already close and can throw the runner out at home.","Swinging for the fences changes your swing and often leads to strikeouts. A simple fly ball wins here."],
      rates:[85,35,20,15],concept:"Against a drawn-in infield, fly balls beat ground balls — the runner scores on a sac fly",anim:"flyout"},
    {id:"b18",title:"First and Third — Hit and Run?",diff:2,cat:"situational",
      description:"Top of the 4th, runners on 1st and 3rd, 1 out. Score is 3-1 you're winning. Count is 1-0. Coach flashes the hit-and-run sign. The runner on 1st will be going.",
      situation:{inning:"Top 4",outs:1,count:"1-0",runners:[1,3],score:[3,1]},
      options:["Swing at anything — protect the runner","Only swing if it's a strike","Try to hit behind the runner to the right side","Pull for a double to score both runners"],
      best:0,explanations:["On a hit-and-run, the runner is committed. You MUST swing to protect him, no matter what the pitch looks like. If you don't swing, the catcher has an easy throw to catch the runner stealing.","Being selective defeats the purpose. The runner will be thrown out if you take the pitch.","Hitting to the right side is nice if you can, but the priority is making contact — any contact. The runner is running!","Pulling for power changes your mechanics and increases strikeout risk. The runner needs you to put the ball in play."],
      rates:[85,20,55,25],concept:"On a hit-and-run, swing at anything — the runner is committed and needs your protection",anim:"hit"},
    {id:"b19",title:"Trailing by One, Runner in Scoring Position",diff:2,cat:"situational",
      description:"Bot 8th, runner on 2nd, 2 outs, down 5-4. You're facing a reliever who throws hard but has been missing his spots. Count is 2-1.",
      situation:{inning:"Bot 8",outs:2,count:"2-1",runners:[2],score:[4,5]},
      options:["Look for YOUR pitch — be patient but ready","Swing at the next pitch — be aggressive","Take all the way — work toward a walk","Choke up and just make contact"],
      best:0,explanations:["With a 2-1 count against a wild reliever, you're in the driver's seat. Wait for your pitch — a fastball in your zone — and drive it. Don't chase his mistakes, but be ready to attack a hittable pitch.","Being too aggressive on 2-1 can bail him out. He's struggling with control — let him come to you.","A walk puts runners on 1st and 2nd, but you still need a hit. With 2 outs, looking for your pitch to drive in the run is better than a walk.","Choking up isn't necessary on 2-1. You have the count advantage — use it to look for a pitch you can drive."],
      rates:[85,40,45,35],concept:"With a hitter's count against a wild pitcher, be patient — wait for your pitch and drive it",anim:"hit"},
    {id:"b20",title:"Bunt or Swing — Tie Game",diff:2,cat:"situational",
      description:"Bot 6th, runner on 2nd, nobody out, tied 3-3. You're the #7 hitter, decent contact but not much power. The pitcher has been tough all day. Count 0-0.",
      situation:{inning:"Bot 6",outs:0,count:"0-0",runners:[2],score:[3,3]},
      options:["Bunt him to 3rd — play for one run","Hit to the right side — advance him and maybe reach base","Swing away — try to drive him in yourself","Take pitches and hope for a walk"],
      best:1,explanations:["Bunting is okay, but it gives away an out for free. There's a better option that moves the runner AND keeps you alive.","Hitting to the right side moves the runner to 3rd AND gives you a chance to reach base. It's the best of both worlds — you advance the runner without giving up an out automatically.","Swinging away against a tough pitcher with no power isn't the highest-percentage play. Play smart baseball.","Taking pitches is too passive. With nobody out and a runner on 2nd, you want to be aggressive with a purpose."],
      rates:[55,85,30,25],concept:"Hit to the right side — advance the runner without giving up an out for free",anim:"hit"},
    {id:"b21",title:"Down by One in the 9th",diff:3,cat:"situational",
      description:"Bot 9th, runner on 3rd, 1 out, down 6-5. Their closer is on the mound throwing 96. Count is 0-1. A fly ball ties it. A hit wins it.",
      situation:{inning:"Bot 9",outs:1,count:"0-1",runners:[3],score:[5,6]},
      options:["Fly ball approach — just tie the game","Look for a pitch to drive — win the game","Take pitches — work the count back","Squeeze bunt — surprise the closer"],
      best:0,explanations:["A fly ball to the outfield ties the game on a sacrifice fly. That's the smart play — tie it first, then win it later. Going for the hero swing often leads to strikeouts and heartbreak.","Trying to be a hero against a 96-mph closer is tempting but dangerous. A strikeout ends the threat. A fly ball keeps the game alive.","With only 1 out left, you can't afford to be too passive. Getting behind in the count against a closer limits your options.","Squeeze bunting against a 96-mph closer is extremely difficult. If you miss or bunt it foul, the runner is hung out to dry."],
      rates:[85,40,30,15],concept:"Tie the game first — a sacrifice fly is worth more than a hero swing in the 9th",anim:"flyout"},
    {id:"b22",title:"Bases Loaded, Nobody Out",diff:3,cat:"situational",
      description:"Top of the 3rd, bases loaded, nobody out. Your team is up 2-0. Count is 1-0. The pitcher looks rattled — he just walked the last two batters.",
      situation:{inning:"Top 3",outs:0,count:"1-0",runners:[1,2,3],score:[2,0]},
      options:["Swing for a grand slam — blow the game open","Put the ball in play — any hit scores runs","Be patient — another walk forces a run in","Look for your pitch — something you can drive hard"],
      best:3,explanations:["Swinging for the fences changes your mechanics and often leads to pop-ups or strikeouts. You don't need a grand slam — any solid contact scores runs.","Just putting the ball in play is okay, but you can be smarter. With 1-0 against a rattled pitcher, you'll likely get a hittable pitch.","Waiting for a walk is too passive. You're ahead 1-0 and he's rattled — he's likely to throw a strike to avoid another free pass. Be ready for it!","With bases loaded, 1-0 count, and a rattled pitcher, you'll see a hittable pitch. Look for YOUR pitch — a fastball in your zone — and drive it into the gap. Hard contact with the bases loaded is devastating."],
      rates:[20,50,40,85],concept:"Bases loaded with a rattled pitcher — look for your pitch and drive it. Don't try to do too much",anim:"hit"},
    {id:"b23",title:"Wild Pitcher — Be Patient",diff:3,cat:"situational",
      description:"Bot 4th, runner on 1st, nobody out, tied 1-1. The pitcher has walked 3 batters already and just threw 2 balls to start your at-bat. Count 2-0.",
      situation:{inning:"Bot 4",outs:0,count:"2-0",runners:[1],score:[1,1]},
      options:["Take pitches — let the runner steal while he walks you","Swing at the next pitch — crush a mistake","Look for your pitch — if it's perfect, drive it","Bunt the runner to 2nd"],
      best:2,explanations:["Being completely passive wastes a great count. If he throws a 2-0 fastball right down the middle, you want to be ready for it. But you also don't need to chase bad pitches.","Swinging at anything on 2-0 is too aggressive. What if it's another ball? Then you're 3-0 and practically on base.","Smart! On 2-0, look for one specific pitch — a fastball in your happy zone. If you get it, drive it. If not, take it to 3-0 and you're almost guaranteed to reach base. This combines patience with aggression.","Bunting on 2-0 against a wild pitcher gives away all your advantage. He might walk you without you lifting the bat!"],
      rates:[45,30,85,10],concept:"Against a wild pitcher, be selectively aggressive — wait for YOUR pitch on hitter's counts",anim:"hit"},
    // Batch 2 — Count Management
    {id:"b24",title:"The 3-0 Take",diff:1,cat:"counts",
      description:"Bot 3rd, nobody on, 1 out, score is 2-1. Count is 3-0. The pitcher has been wild — you haven't swung once this at-bat.",
      situation:{inning:"Bot 3",outs:1,count:"3-0",runners:[],score:[2,1]},
      options:["Take the pitch — a walk is almost guaranteed","Swing if it's a fastball down the middle","Swing hard — he has to throw a strike","Bunt for a surprise hit"],
      best:0,explanations:["At 3-0, the pitcher must throw a strike or walk you. The best play for most hitters is to take the pitch. If it's a ball, you walk. If it's a strike, you're still ahead 3-1 — the best hitter's count in baseball.","Only elite hitters with the coach's green light should swing 3-0. For most young players, taking is the smart play.","Swinging hard at 3-0 is selfish. You're one ball away from a free base. Don't bail the pitcher out.","Bunting on 3-0 when you're about to walk is the worst play in baseball. Let the pitcher beat himself."],
      rates:[85,45,20,5],concept:"At 3-0, take the pitch — a walk is almost certain and you're ahead no matter what",anim:"walk"},
    {id:"b25",title:"Behind 0-2 — Survival Mode",diff:1,cat:"counts",
      description:"Top of the 4th, nobody on, 0 outs. The pitcher just threw two perfect strikes and you're behind 0-2. He's got a nasty slider.",
      situation:{inning:"Top 4",outs:0,count:"0-2",runners:[],score:[1,1]},
      options:["Choke up and protect the plate — foul off tough pitches","Sit on the slider and crush it","Swing hard — show him you're not scared","Take the next pitch and hope it's a ball"],
      best:0,explanations:["Down 0-2, your job changes from hitting to surviving. Choke up, shorten your swing, and fight off anything close. Foul off tough pitches until you get something you can handle. Hitters who battle back from 0-2 earn respect.","Guessing one pitch on 0-2 is risky. If he throws a fastball instead, you're frozen for strike three.","Swinging hard with 2 strikes leads to big swings and misses. Shorten up and make contact.","Just watching a pitch on 0-2 is dangerous — if it catches the corner, you're out looking. Be ready to fight."],
      rates:[85,30,15,40],concept:"With 2 strikes, shorten your swing, protect the plate, and battle — make the pitcher work",anim:"strike"},
    {id:"b26",title:"Ahead 2-0 — Your Count",diff:1,cat:"counts",
      description:"Bot 5th, runner on 2nd, 1 out, up 4-2. Count is 2-0. The pitcher threw two fastballs that missed. What are you looking for?",
      situation:{inning:"Bot 5",outs:1,count:"2-0",runners:[2],score:[4,2]},
      options:["Look for a fastball in your zone — be ready to drive it","Take the pitch — get to 3-0","Swing at anything — he has to throw strikes","Bunt to advance the runner"],
      best:0,explanations:["2-0 is a great hitter's count! The pitcher needs to throw a strike, and fastballs are the most common pitch on 2-0. Zone in on a fastball in your happy zone and be ready to drive it. If it's not there, take it.","Taking to 3-0 isn't bad, but 2-0 is actually a better count to hit in because pitchers throw more hittable pitches. Don't waste it!","Swinging at anything wastes your count advantage. Be selective — only swing at YOUR pitch.","Bunting on 2-0 gives away a huge advantage. The pitcher is behind and you're in control."],
      rates:[85,50,30,10],concept:"On 2-0, look for a fastball in your zone — it's one of the best counts to hit in",anim:"hit"},
    {id:"b27",title:"First Pitch — Swing or Take?",diff:2,cat:"counts",
      description:"Top of the 2nd, nobody on, 0 outs. First pitch of your at-bat. You've watched this pitcher from the bench — he throws a first-pitch fastball 80% of the time.",
      situation:{inning:"Top 2",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Take the first pitch — see his stuff up close","Swing if it's a fastball in your zone","Swing at the first pitch no matter what","Fake bunt to see how the defense reacts"],
      best:1,explanations:["Taking isn't bad for your first at-bat, but you know he throws first-pitch fastballs 80% of the time. That's valuable info you're wasting.","You did your homework! If he throws a first-pitch fastball 80% of the time, be ready for it. If it's in your zone, drive it. If not, take it. Using data makes you a smart hitter.","Swinging at anything regardless of location is reckless. Be aggressive but selective.","Fake bunting on the first pitch gives away information about yourself without gaining much."],
      rates:[45,85,25,15],concept:"Use what you learn from the bench — if you know what's coming, be ready for it",anim:"hit"},
    {id:"b28",title:"1-0 After a Close Call",diff:2,cat:"counts",
      description:"Bot 6th, runner on 1st, nobody out, tied 3-3. The pitcher just missed with a fastball on the corner — ump called it ball one. Count is 1-0.",
      situation:{inning:"Bot 6",outs:0,count:"1-0",runners:[1],score:[3,3]},
      options:["Get aggressive — jump on the next pitch","Stay patient — work the count deeper","Look for your pitch — if it's perfect, drive it","Take the next pitch to see if the ump's zone is small"],
      best:2,explanations:["Being too aggressive on 1-0 can lead to weak contact. The count is slightly in your favor, but you don't need to chase.","Being too patient wastes your slight advantage. The pitcher just barely missed — he's going to come back with a strike.","At 1-0, you have the luxury of being selective. Look for one pitch in one location — your best zone. If you get it, drive it. If not, take it to 2-0 and you're in great shape either way.","The ump's zone doesn't matter to your approach. Focus on YOUR zone — the pitches you can drive."],
      rates:[40,35,85,30],concept:"At 1-0, you're slightly ahead — look for your pitch. If it's there, attack. If not, take it",anim:"hit"},
    {id:"b29",title:"3-1 Double Play Danger",diff:2,cat:"counts",
      description:"Top of the 5th, runner on 1st, 1 out, up 2-1. Count is 3-1. This is your pitch to hit — but a ground ball could be a double play.",
      situation:{inning:"Top 5",outs:1,count:"3-1",runners:[1],score:[2,1]},
      options:["Swing only at a pitch you can lift — avoid grounders","Take the pitch — walk to first and avoid the DP","Swing at anything — 3-1 is your count","Hit and run — the runner goes with the pitch"],
      best:0,explanations:["Smart! On 3-1 with a runner on first, you want to swing at a pitch you can elevate. Ground balls into double plays kill innings. Look for something up in the zone you can drive in the air.","Walking isn't bad, but 3-1 is a premium hitting count. Pitchers throw their most hittable pitches here. Don't waste it completely.","Swinging at anything is reckless. You still need to be selective — look for a pitch you can lift, not ground into a DP.","A hit and run on 3-1 is possible, but it forces you to swing at anything. Better to be selective and look for a ball you can drive in the air."],
      rates:[85,50,25,40],concept:"On 3-1 with a runner on 1st, look for a pitch you can lift — avoid the double play grounder",anim:"hit"},
    {id:"b30",title:"2-2 — Protect or Attack?",diff:2,cat:"counts",
      description:"Bot 7th, runner on 2nd, 2 outs, down 3-2. Count is 2-2. The pitcher has mixed fastballs and changeups all day. You're the tying run.",
      situation:{inning:"Bot 7",outs:2,count:"2-2",runners:[2],score:[2,3]},
      options:["Protect the plate — swing at anything close","Sit on the changeup — he's thrown 3 in a row","Look for a fastball, react to everything else","Take the pitch — hope for a walk"],
      best:2,explanations:["Swinging at anything close leads to weak contact on bad pitches. You can be more strategic than that.","Guessing changeup is risky — what if he switches to a fastball? You'd be way behind it.","On 2-2, you can't afford to be completely passive or completely aggressive. The best approach is to look for the pitch you hit best (usually a fastball) and react to anything else. If it's off the plate, fight it off.","Taking on 2-2 with 2 outs is too passive. A called strike three means your team doesn't score."],
      rates:[35,30,85,20],concept:"On 2-2, look for a fastball and react to off-speed — balance aggression with discipline",anim:"hit"},
    {id:"b31",title:"Full Count Battle — 2 Outs, RISP",diff:3,cat:"counts",
      description:"Top of the 8th, runners on 2nd and 3rd, 2 outs, tied 5-5. Full count 3-2. The pitcher just threw two nasty sliders you fouled off. You're exhausted.",
      situation:{inning:"Top 8",outs:2,count:"3-2",runners:[2,3],score:[5,5]},
      options:["Battle — foul off anything close until you get your pitch","Sit slider — he's going back to it","Swing hard — end the at-bat one way or another","Take the pitch — a walk loads the bases"],
      best:0,explanations:["This is what great hitters do — they battle. Foul off tough pitches, extend the at-bat, wear down the pitcher, and wait for a mistake. Every foul ball is a small victory that brings you closer to a hittable pitch.","Sitting on one pitch on a full count is risky. What if he throws a fastball for strike three?","Swinging hard often leads to a strikeout in these situations. Shorten up and fight.","Taking on 3-2 with 2 outs is dangerous — if it catches the corner, you're out looking and the runners are stranded."],
      rates:[85,35,20,40],concept:"On a full count with 2 outs, battle — foul off tough pitches and wait for your mistake pitch",anim:"hit"},
    {id:"b32",title:"3-0 Green Light",diff:3,cat:"counts",
      description:"Bot 9th, runner on 3rd, 1 out, down 7-6. Count is 3-0. Your coach gives you the green light — meaning you CAN swing if you want. The pitcher needs a strike badly.",
      situation:{inning:"Bot 9",outs:1,count:"3-0",runners:[3],score:[6,7]},
      options:["Take the pitch — a walk puts another runner on","Swing only if it's a perfect fastball right down the middle","Swing at any strike — you have the green light","Squeeze bunt — the runner on 3rd scores"],
      best:1,explanations:["A walk helps, but it doesn't tie the game. The runner on 3rd is the tying run — you want to drive him in if possible.","The green light doesn't mean swing at everything — it means swing at a PERFECT pitch. On 3-0, the pitcher must throw a strike. If it's a meatball fastball right in your wheelhouse, crush it. If it's not absolutely perfect, take it to 3-1.","Swinging at any strike wastes the green light's purpose. You only swing at a pitch you can CRUSH.","A squeeze bunt on 3-0 wastes an incredible count advantage."],
      rates:[40,85,30,15],concept:"A green light on 3-0 means swing at a PERFECT pitch — not any pitch, THE pitch",anim:"hit"},
    {id:"b33",title:"0-2 Same Pitch Twice",diff:3,cat:"counts",
      description:"Top of the 6th, runner on 1st, 1 out, down 3-2. Count is 0-2. The pitcher has thrown you two changeups in a row — both for strikes. Is he coming back with a third?",
      situation:{inning:"Top 6",outs:1,count:"0-2",runners:[1],score:[2,3]},
      options:["Sit on the changeup — he'll throw it again","Look fastball, react to changeup","Crowd the plate to take away the outside changeup","Just try to foul everything off"],
      best:1,explanations:["Sitting changeup on 0-2 is tempting, but good pitchers rarely throw the same pitch three times in a row. He knows you've seen two changeups — he might come with heat.","Even though he threw two changeups, look fastball and react to off-speed. If the changeup comes, your hands will adjust. But if a fastball comes while you're sitting changeup, you'll be way late. It's easier to slow down than speed up.","Crowding the plate on 0-2 just gives the pitcher more inside options. It doesn't solve the sequencing problem.","Fouling off everything is survival mode, which is fine, but having a plan (look fastball, react to off-speed) gives you a better chance of getting a hit."],
      rates:[30,85,25,45],concept:"Look fastball, react to off-speed — it's easier to slow down your swing than speed it up",anim:"hit"},
    // Batch 3 — Bunting Decisions
    {id:"b34",title:"Sacrifice Bunt — 9-Hole Hitter",diff:1,cat:"plays",
      description:"Top of the 5th, runner on 1st, nobody out, tied 2-2. You're the #9 hitter — weakest bat in the lineup. The leadoff hitter is on deck. Coach gives the bunt sign.",
      situation:{inning:"Top 5",outs:0,count:"0-0",runners:[1],score:[2,2]},
      options:["Bunt the runner to 2nd — do your job","Swing away — surprise the defense","Fake the bunt and swing","Take pitches and hope for a walk"],
      best:0,explanations:["As the #9 hitter with nobody out, the sacrifice bunt is your job. Move the runner to 2nd where a single from the leadoff hitter scores him. You're trading your out for a runner in scoring position. That's a good trade when you're the weakest hitter.","Swinging away as the #9 hitter ignores the team's best strategy. The leadoff hitter behind you is more likely to drive in the run.","Fake bunt and swing goes against the coach's sign. Execute the play that was called.","Hoping for a walk wastes the bunt opportunity. The runner on first needs to be advanced."],
      rates:[85,25,20,30],concept:"As the weakest hitter, the sacrifice bunt trades your out for a runner in scoring position — a good trade",anim:"bunt"},
    {id:"b35",title:"Bunt Him to Third",diff:1,cat:"plays",
      description:"Bot 7th, runner on 2nd, nobody out, down 3-2. You're a decent contact hitter but not a power guy. The tying run is at second.",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[2],score:[2,3]},
      options:["Bunt the runner to 3rd","Hit to the right side — advance him and reach base","Swing away — drive the run in yourself","Take a pitch first to see what the pitcher has"],
      best:1,explanations:["Bunting the runner to third is okay, but it gives away an out. There's a better option.","Hitting to the right side moves the runner to 3rd AND gives you a chance to reach base! From third with less than 2 outs, the runner can score on a sac fly, ground ball, wild pitch, or passed ball. You've created all those options WITHOUT giving away an out.","Swinging away is fine if you have power, but a contact hitter should play smart.","Taking a pitch doesn't advance the runner or get you closer to a productive at-bat."],
      rates:[55,85,30,20],concept:"Hit to the right side to advance the runner — it's like a bunt but you might also reach base",anim:"hit"},
    {id:"b36",title:"Bunt for a Hit — Speed Advantage",diff:2,cat:"plays",
      description:"Top of the 3rd, nobody on, 1 out, tied 1-1. You're fast — really fast. The third baseman is playing deep. You've noticed he's been slow to react to grounders.",
      situation:{inning:"Top 3",outs:1,count:"0-0",runners:[],score:[1,1]},
      options:["Bunt for a hit down the third base line","Swing away — bunting with nobody on is weird","Fake bunt to pull the 3B in, then bunt next pitch","Bunt toward first base instead"],
      best:0,explanations:["A drag bunt or push bunt down the third base line when the 3B is playing deep is a great play for fast runners. He has to charge 30 feet, barehand the ball, and make a long throw — all while you're sprinting. If he's slow to react, you're safe easily.","Bunting for a hit isn't a sacrifice — it's using your speed as a weapon. There's nothing weird about it.","Faking the bunt gives away the element of surprise. Just do it.","Bunting toward first can work too, but with the third baseman playing deep, the third base side is the bigger opening."],
      rates:[85,30,35,45],concept:"Fast runners can bunt for hits when the corner infielders play deep — use your speed as a weapon",anim:"bunt"},
    {id:"b37",title:"Good Hitter — Sacrifice or Swing?",diff:2,cat:"plays",
      description:"Bot 6th, runner on 1st, nobody out, tied 4-4. You're the #3 hitter — one of the best bats in the lineup. The coach hasn't given a sign. Do you bunt?",
      situation:{inning:"Bot 6",outs:0,count:"0-0",runners:[1],score:[4,4]},
      options:["Sacrifice bunt — move the runner","Swing away — you're the #3 hitter for a reason","Bunt for a hit — surprise the defense","Hit and run — put the runner in motion"],
      best:1,explanations:["Sacrifice bunting with your #3 hitter wastes one of your best at-bats. That's like trading a dollar for a quarter.","You're batting third because you're one of the team's best hitters. A sacrifice bunt trades your quality at-bat for one base advancement. A single does the same thing while also getting you on base. A double scores the run. Swing your bat — good hitters should hit.","Bunting for a hit as the #3 hitter is unexpected, but you're giving up the chance to drive in the run with real power.","A hit and run is possible but constrains your swing. As the #3 hitter, you should get your full swing."],
      rates:[25,85,40,45],concept:"Don't sacrifice bunt with your best hitters — their swings are too valuable to give away",anim:"hit"},
    {id:"b38",title:"Squeeze Play with Runner on Third",diff:2,cat:"plays",
      description:"Bot 8th, runner on 3rd, 1 out, tied 3-3. The coach calls the squeeze play — the runner will break for home when the pitcher starts his motion. You MUST bunt.",
      situation:{inning:"Bot 8",outs:1,count:"1-0",runners:[3],score:[3,3]},
      options:["Bunt the ball on the ground — anywhere fair","Only bunt if it's a good pitch","Pull back if the pitch is bad","Square early to let the defense see the bunt coming"],
      best:0,explanations:["On a squeeze play, you MUST bunt the ball. The runner from 3rd is committed — he's sprinting home the moment the pitcher starts his delivery. If you miss the bunt, he's a dead duck. Get the bat on the ball and put it on the ground, anywhere fair. That's all you need to do.","On a squeeze, you can't be selective. The runner is committed. You bunt no matter what.","Pulling back means the runner is caught between third and home with nowhere to go. Never pull back on a squeeze.","Squaring early tips off the defense and they might pitch out. Stay in your batting stance as long as possible, then square to bunt late."],
      rates:[85,20,10,15],concept:"On a squeeze play, bunt the ball no matter what — the runner is committed and needs you to make contact",anim:"bunt"},
    {id:"b39",title:"Suicide Squeeze — Bad Pitch",diff:3,cat:"plays",
      description:"Top of the 9th, runner on 3rd, 1 out, down 5-4. Suicide squeeze is on. The pitcher throws a fastball HIGH AND INSIDE — almost at your face. The runner is already running.",
      situation:{inning:"Top 9",outs:1,count:"1-0",runners:[3],score:[4,5]},
      options:["Bunt it anyway — the runner needs you","Bail out — protect yourself from the pitch","Swing at it — maybe you can hit it","Duck and hope the pitch goes to the backstop"],
      best:0,explanations:["On a suicide squeeze, you bunt NO MATTER WHAT. Even a pitch up and in — get your bat on it. Stick the bat head up high, angle it toward the ground, and deaden the ball. Your teammate is sprinting home counting on you. Even a foul ball keeps the play alive. (Safety note: if a pitch is truly at your head, protect yourself first — but this one is just high and inside, still buntable.)","Bailing out leaves the runner completely exposed between 3rd and home. He'll be tagged out easily.","Swinging at a high-and-in pitch on a squeeze defeats the purpose. You need the ball on the ground, not hit in the air.","Ducking means the runner is dead. On a squeeze, the batter MUST attempt to bunt."],
      rates:[85,10,15,5],concept:"On a suicide squeeze, bunt the ball no matter where it's thrown — your teammate's safety depends on you",anim:"bunt"},
    {id:"b40",title:"Power Hitter Asked to Bunt",diff:3,cat:"plays",
      description:"Bot 5th, runner on 2nd, nobody out, tied 2-2. You're the #4 hitter — cleanup — with 15 home runs. The coach shockingly calls for a sacrifice bunt. What do you think?",
      situation:{inning:"Bot 5",outs:0,count:"0-0",runners:[2],score:[2,2]},
      options:["Bunt — follow the coach's sign no matter what","Ask the coach to reconsider — you can drive the run in","Swing away — the coach must have made a mistake","Fake bunt and slash — compromise"],
      best:0,explanations:["Even if you disagree, you execute the coach's sign. The coach has information you might not — maybe the pitcher owns you, maybe the hitters behind you are better in this spot, maybe there's a strategic reason. Trust the process and bunt.","Asking to reconsider mid-at-bat isn't the time. Discuss strategy before or after the game, not during it.","Ignoring the coach's sign destroys team trust. Even if you think you know better, execute the play.","Going rogue with a slash play when the bunt is called is disobedient. Save suggestions for the dugout."],
      rates:[85,30,10,20],concept:"Execute the coach's sign even if you disagree — trust, teamwork, and discipline win games",anim:"bunt"},
    {id:"b41",title:"Fake Bunt and Slash",diff:3,cat:"plays",
      description:"Top of the 4th, runner on 2nd, nobody out, up 3-1. The coach calls a fake bunt-and-slash play. You show bunt early, the infield charges, then you pull back and swing.",
      situation:{inning:"Top 4",outs:0,count:"1-0",runners:[2],score:[3,1]},
      options:["Show bunt, then slash away at whatever pitch comes","Show bunt, pull back, and only swing at a good pitch","Show bunt early but don't commit — read the pitch first","Show bunt and actually bunt instead"],
      best:1,explanations:["Slashing at whatever comes defeats the purpose. If the pitch is bad, take it for a ball. The bunt fake already pulled the infield in.","The slash play is a two-part trick: First, show bunt to pull the infield in. Second, pull back and ONLY swing at a hittable pitch. With the infield charging, there are huge gaps behind them. A sharp ground ball or line drive goes right through the holes. But don't swing at a bad pitch — the fake already helped you.","Not committing to either the fake or the swing makes you do neither well.","The coach called a slash, not a bunt. Execute the play that was called."],
      rates:[35,85,30,15],concept:"The slash play exploits a charging infield — show bunt, then swing at a good pitch through the gaps",anim:"hit"},
    // Batch 4 — Two-Strike Approach
    {id:"b42",title:"Two Strikes — Change Your Swing",diff:1,cat:"counts",
      description:"Bot 4th, nobody on, 1 out, tied 2-2. You fell behind 0-2 quickly. The pitcher has been pounding the outside corner. What do you do with your swing?",
      situation:{inning:"Bot 4",outs:1,count:"0-2",runners:[],score:[2,2]},
      options:["Shorten your swing — choke up and make contact","Keep swinging the same — don't change for anyone","Swing harder — you need to catch up to the fastball","Open your stance to see the ball better"],
      best:0,explanations:["With 2 strikes, shorten your swing. Choke up an inch on the bat, widen your stance slightly, and focus on putting the ball in play. A shorter swing gives you more time to see the pitch and better bat control. The goal changes from driving the ball to making contact.","Keeping the same big swing with 2 strikes leads to more strikeouts. The best hitters in the world adjust with 2 strikes.","Swinging harder with 2 strikes is the opposite of what you should do. You need more control, not more power.","Opening your stance is a drastic change mid-at-bat. Choking up is simpler and more effective."],
      rates:[85,20,10,30],concept:"With 2 strikes, choke up and shorten your swing — contact is more important than power",anim:"hit"},
    {id:"b43",title:"Protecting the Plate with Runners On",diff:1,cat:"counts",
      description:"Top of the 6th, runner on 3rd, 1 out, down 3-2. Count is 1-2. A borderline pitch comes — it might be a ball, might be a strike.",
      situation:{inning:"Top 6",outs:1,count:"1-2",runners:[3],score:[2,3]},
      options:["Swing at it — can't take a called strike three","Take it — trust the umpire to call it a ball","Foul it off — protect the plate","Swing for the fences — go for the big hit"],
      best:2,explanations:["Swinging at a borderline pitch with a full swing often leads to weak contact or a swing-and-miss.","Taking a borderline pitch with 2 strikes and a runner on 3rd is risky — if the ump calls it a strike, you struck out looking with the tying run at third.","Fouling off borderline pitches is elite hitting. You're not giving in (striking out), and you're not swinging hard at a tough pitch. You're keeping the at-bat alive until you get something you can drive. With a runner on 3rd, every extra pitch is another chance to get a hittable ball.","Swinging for the fences with 2 strikes is how you strike out."],
      rates:[35,25,85,10],concept:"With 2 strikes and runners on, foul off borderline pitches — keep the at-bat alive",anim:"hit"},
    {id:"b44",title:"Two Strikes — Breaking Ball Barrage",diff:2,cat:"counts",
      description:"Bot 5th, nobody on, 2 outs, up 4-3. Count is 1-2. The pitcher has been throwing you nothing but curveballs. You've fouled off two of them.",
      situation:{inning:"Bot 5",outs:2,count:"1-2",runners:[],score:[4,3]},
      options:["Sit on the curveball and crush it","Look for the fastball — he might switch","Stay ready for anything — react to what comes","Take the next pitch — it'll probably be a ball"],
      best:2,explanations:["Sitting on the curveball means if he throws a fastball, you're frozen. He knows you've seen three curves.","Looking fastball only leaves you vulnerable to another curveball. After three curves, he might throw a fourth OR switch.","After seeing multiple breaking balls, stay reactive. Don't commit to guessing one pitch. See the ball, react to the ball. If it's a curve, your eyes have adjusted to the spin. If it's a fastball, your hands can react. Trust your eyes and your training.","Taking with 2 strikes and 2 outs is dangerous — a called strike three is game over."],
      rates:[35,30,85,20],concept:"After a breaking ball barrage, stay reactive — don't guess, let your eyes and hands adjust",anim:"hit"},
    {id:"b45",title:"Choking Up — Why and When",diff:2,cat:"counts",
      description:"Top of the 7th, runner on 2nd, 2 outs, tied 3-3. Count is 0-2. The pitcher throws 95 mph and has been blowing you away. You're late on every fastball.",
      situation:{inning:"Top 7",outs:2,count:"0-2",runners:[2],score:[3,3]},
      options:["Choke up 2 inches — shorten the bat for quicker hands","Keep your normal grip — don't change mid-game","Move up in the batter's box — catch the fastball earlier","Swing earlier in your load"],
      best:0,explanations:["Choking up 2 inches on the bat makes it lighter and gives you quicker hands through the zone. When you're late on a fastball, the bat speed is the problem. A shorter bat is a faster bat. You lose a little power but gain bat speed and contact ability. With 2 strikes, that trade is worth it.","Keeping your normal grip when you're consistently late means you'll keep being late. Adjust!","Moving up in the box can help, but choking up is a more natural adjustment that doesn't change your timing.","Swinging earlier changes your whole timing mechanism. Choking up is simpler and more effective."],
      rates:[85,15,35,30],concept:"When you're late on fastballs, choke up — a shorter bat is a faster bat. Trade power for contact",anim:"hit"},
    {id:"b46",title:"Fouling Off — Battle Mode",diff:2,cat:"counts",
      description:"Bot 8th, runner on 1st, 1 out, down 4-3. Count is 2-2. You've fouled off the last 5 pitches. The pitcher is getting frustrated. The at-bat is at 10 pitches.",
      situation:{inning:"Bot 8",outs:1,count:"2-2",runners:[1],score:[3,4]},
      options:["Keep fouling — wear him down until he makes a mistake","Swing for a hit — enough battling","Take the next pitch — you've earned a ball","Change your approach — try something different"],
      best:0,explanations:["You're winning this battle! Every foul ball costs the pitcher a pitch and energy. He's getting frustrated, which means he's more likely to make a mistake — a hanging curve, a fastball over the plate, or a walk. The longer this at-bat goes, the better your chances. Keep battling.","Changing from battle mode to power swing mode throws away everything you've built.","Taking on 2-2 after a long battle risks a called strike three. Keep your bat ready.","Your approach IS working — you're still alive after 10 pitches. Don't fix what isn't broken."],
      rates:[85,25,30,20],concept:"Long at-bats wear down pitchers — keep fouling off tough pitches until they make a mistake",anim:"hit"},
    {id:"b47",title:"Two Strikes — Expand the Zone?",diff:2,cat:"counts",
      description:"Top of the 3rd, nobody on, nobody out, tied 1-1. Count is 1-2. The pitcher has been nibbling the corners all day — he barely throws anything over the plate.",
      situation:{inning:"Top 3",outs:0,count:"1-2",runners:[],score:[1,1]},
      options:["Expand your zone — swing at anything close","Keep your normal zone — if it's not a strike, don't swing","Expand slightly — protect the plate on borderline pitches","Swing at everything — can't strike out looking"],
      best:2,explanations:["Swinging at anything close leads to bad contact on pitcher's pitches. You'll ground out weakly.","Keeping your exact normal zone with 2 strikes means called strike threes on borderline pitches. Umps expand their zone late in counts.","Expand your zone slightly — about one ball-width in each direction. If a pitch catches the black (the edge of the plate), fight it off. If it's clearly off the plate, lay off. This keeps you from striking out on borderline calls without chasing bad pitches.","Swinging at everything is just hacking. Have a plan — expand slightly, not completely."],
      rates:[25,35,85,15],concept:"With 2 strikes, expand your zone slightly — protect the plate without chasing bad pitches",anim:"hit"},
    {id:"b48",title:"Two Strikes, Runner on Third — Contact At All Costs?",diff:3,cat:"counts",
      description:"Bot 9th, runner on 3rd, 1 out, tied 6-6. Count is 0-2. A fly ball wins the game. A strikeout kills the rally. The pitcher is throwing his best stuff.",
      situation:{inning:"Bot 9",outs:1,count:"0-2",runners:[3],score:[6,6]},
      options:["Shorten up — put the ball in play at all costs","Wait for your pitch — don't swing at junk","Swing for a fly ball — that wins the game","Take the pitch — hope for a ball"],
      best:0,explanations:["With a runner on 3rd, 1 out, and the game on the line, PUT THE BALL IN PLAY. A fly ball scores the run. A ground ball might score the run. Even weak contact creates a chance. A strikeout creates nothing. Shorten your swing, protect the plate, and make contact — any contact is better than a strikeout in this spot.","Waiting for your pitch on 0-2 against a pitcher's best stuff means you'll be waiting for a long time. Fight.","Swinging for a fly ball specifically changes your mechanics. Just make contact — fly balls happen naturally.","Taking on 0-2 in the bottom of the 9th risks a called third strike. Be ready to fight."],
      rates:[85,25,35,20],concept:"With the winning run on 3rd and 2 strikes, make contact — any contact is better than a strikeout",anim:"hit"},
    {id:"b49",title:"0-2 Curveball Incoming?",diff:3,cat:"counts",
      description:"Top of the 8th, runner on 2nd, 2 outs, tied 4-4. Count is 0-2. The pitcher has thrown you an 0-2 curveball in every at-bat today — you've chased it all three times.",
      situation:{inning:"Top 8",outs:2,count:"0-2",runners:[2],score:[4,4]},
      options:["Sit on the curveball — you know it's coming","Look fastball but be ready for the curve","Lay off everything low — the curve will be in the dirt","Swing early to catch the curve before it breaks"],
      best:2,explanations:["Sitting on the curve means if he throws a fastball, you're frozen for strike three.","Looking fastball and reacting to the curve is the standard approach, but you KNOW the 0-2 curve is coming — use that knowledge.","You've chased the 0-2 curveball three times today. The curve will be low — probably in or near the dirt. The fix is simple: lay off anything below the belt. If the curve is a strike, fight it off. If it's in the dirt (which it usually is on 0-2), you've taken ball one and the count is 1-2. You just turned the tables.","Swinging early at a curveball makes the timing even worse. The curve is designed to fool your timing."],
      rates:[30,40,85,10],concept:"If you keep chasing 0-2 curveballs, lay off everything low — the 0-2 curve is almost always in the dirt",anim:"strike"},
    // Batch 5 — Hitting Strategy by Game Situation
    {id:"b50",title:"Winning Big — Still Compete",diff:1,cat:"approach",
      description:"Top of the 7th, your team is crushing it — up 10-2. You're at the plate with nobody on, 2 outs. Do you change your approach?",
      situation:{inning:"Top 7",outs:2,count:"0-0",runners:[],score:[10,2]},
      options:["Swing normally — compete every at-bat","Swing for the fences — might as well go big","Take every pitch — end the game faster","Bunt for fun"],
      best:0,explanations:["Compete every at-bat the same way regardless of the score. Don't showboat (swinging for homers in a blowout is disrespectful), but don't stop trying either. Swing at good pitches, take bad ones. Play the game the right way.","Swinging for the fences in a blowout is considered showing up the other team. It's bad sportsmanship.","Deliberately making outs disrespects the game and your own teammates. Always compete.","Bunting in a blowout to mess around is unsportsmanlike."],
      rates:[85,15,20,10],concept:"Compete the same way in every at-bat — don't showboat in a blowout or give up in a loss",anim:"hit"},
    {id:"b51",title:"First At-Bat — Gather Intel",diff:1,cat:"approach",
      description:"Top of the 1st, your first at-bat of the game. You've never faced this pitcher before. Your teammates haven't given you any intel.",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Take the first pitch — see what he has","Look for a fastball and be ready to swing","Swing at the first pitch — surprise him","Watch from the dugout first, then adjust"],
      best:0,explanations:["Your first at-bat against an unknown pitcher is a scouting mission. Take the first pitch to see his velocity, movement, and arm slot. This information makes your NEXT at-bat much more dangerous. Working the count doesn't mean taking every pitch — it means being patient but ready when you get your pitch.","Looking fastball first isn't bad — if you spot a hittable pitch, being ready to swing is smart hitting. But against a total unknown, seeing one pitch first helps.","Swinging at the first pitch against an unknown pitcher is guessing blind. Get some data first.","You can't watch from the dugout during your own at-bat. You ARE the first data point."],
      rates:[75,60,25,10],concept:"First at-bat against an unknown pitcher, take a pitch — gather data for your next at-bat",anim:"strike"},
    {id:"b52",title:"In a Slump — What to Adjust",diff:2,cat:"adjustments",
      description:"Bot 6th, you're 0-for-your-last-12 over three games. Your confidence is low. You keep popping up and grounding out weakly. Runner on 1st, 1 out.",
      situation:{inning:"Bot 6",outs:1,count:"0-0",runners:[1],score:[2,2]},
      options:["Swing harder — force your way out of the slump","Simplify — look for one pitch in one zone only","Change everything — new stance, new grip, new approach","Don't think — just see the ball and hit the ball"],
      best:1,explanations:["Swinging harder during a slump usually makes things worse. You get tense and lose your natural swing.","In a slump, simplify. Instead of looking for everything, pick one pitch (fastball) in one zone (middle-away, for example) and only swing at that. If you don't see YOUR pitch, take it. This narrows your focus and rebuilds your confidence with quality swings on pitches you can handle.","Changing everything during a slump creates more confusion. Your mechanics got you to this level — don't abandon them.","'Don't think' sounds nice but isn't realistic. Having a simple plan IS the way to clear your mind."],
      rates:[15,85,10,40],concept:"In a slump, simplify — look for one pitch in one zone. Rebuild confidence with quality swings",anim:"hit"},
    {id:"b53",title:"Pitcher Hit Your Teammate — Stay Focused",diff:2,cat:"approach",
      description:"Top of the 5th, the pitcher just hit your teammate with a pitch. The benches are chirping. Now it's your turn to bat. Emotions are high.",
      situation:{inning:"Top 5",outs:1,count:"0-0",runners:[1],score:[2,3]},
      options:["Step in angry — punish the pitcher","Stay calm and focused — don't let emotions affect your at-bat","Take every pitch — show the pitcher you're not intimidated","Crowd the plate — dare him to throw inside"],
      best:1,explanations:["Anger changes your swing, your timing, and your pitch selection. You'll chase bad pitches and try to hit the ball 500 feet.","After a teammate gets hit, the best thing you can do is get a hit. And the best way to get a hit is to stay calm, see the ball clearly, and stick to your approach. Don't let the pitcher live rent-free in your head. Channel any emotion into focus, not rage.","Taking every pitch lets the pitcher off the hook. Get a hit — that hurts him more than a walk.","Crowding the plate after an HBP is asking to get hit yourself. Stay in your normal position."],
      rates:[20,85,25,15],concept:"After a teammate gets hit, the best revenge is a base hit — stay calm and focused",anim:"hit"},
    {id:"b54",title:"Cold Weather — Adjust for Power",diff:2,cat:"adjustments",
      description:"Bot 3rd, nobody on, 1 out, tied 0-0. It's 42 degrees — the coldest game of the year. The ball isn't carrying at all. Your hands hurt.",
      situation:{inning:"Bot 3",outs:1,count:"0-0",runners:[],score:[0,0]},
      options:["Swing for the fences anyway — trust your power","Adjust to a line-drive approach — hit the gaps","Bunt more — the cold makes everyone less athletic","Swing easier to protect your hands"],
      best:1,explanations:["In cold weather, fly balls die. What would be a home run in July is a fly out in March. Swinging for the fences wastes effort.","In cold weather, switch to a line-drive approach. Hit the ball hard on a line into the gaps. Line drives aren't affected by cold air as much as fly balls because they don't have to fight gravity as long. Focus on hard contact through the middle and to the gaps.","Bunting more because of cold weather is an overreaction. The cold affects everyone, but good hitters adjust.","Swinging easier reduces bat speed, making it even harder to generate the power you need in cold air."],
      rates:[15,85,25,30],concept:"In cold weather, switch to a line-drive approach — fly balls die but line drives travel in any temperature",anim:"hit"},
    {id:"b55",title:"Pitcher Tips His Curveball",diff:2,cat:"adjustments",
      description:"Top of the 4th, you notice the pitcher changes his glove position before throwing a curveball — he lifts it higher. This is called 'tipping pitches.' Nobody out, tied 1-1.",
      situation:{inning:"Top 4",outs:0,count:"0-0",runners:[],score:[1,1]},
      options:["Wait for the curveball tell, then crush it","Look for the tell but don't be obvious — use it subtly","Tell your whole team — let everyone benefit","Ignore it — it might be a decoy"],
      best:1,explanations:["Waiting only for the curveball means ignoring fastballs that might be in your zone. Use the information, don't become a slave to it.","Use the tell to CONFIRM what's coming, but don't change your entire approach. If you see the high glove, you know a curve is coming — sit on it. If you don't see it, look fastball. This gives you an edge without being obvious. If you're too obvious (staring at his glove), the catcher will tell him and he'll fix it.","Telling your whole team is helpful, but do it quietly in the dugout — not during your at-bat. And it needs to be subtle or they'll fix the tell.","Tipping pitches is a real thing. If you see it consistently, use it."],
      rates:[40,85,55,15],concept:"If you spot a pitch-tipping tell, use it subtly — don't be obvious or the pitcher will fix it",anim:"hit"},
    {id:"b56",title:"Bases Loaded, Cleanup Spot — Smart Approach",diff:3,cat:"approach",
      description:"Bot 7th, bases loaded, nobody out, up 5-3. You're the cleanup hitter. Everyone in the stadium expects a grand slam. The pitcher is nervous.",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[1,2,3],score:[5,3]},
      options:["Swing for the grand slam — give the fans what they want","Put the ball in play hard — any solid contact scores runs","Be patient — the pitcher might walk you for a free run","Bunt — nobody would ever expect it"],
      best:1,explanations:["Swinging for the grand slam changes your mechanics and usually leads to pop-ups or strikeouts. You're trying to do too much.","With bases loaded and nobody out, solid contact is devastating. A single scores 1-2 runs. A double scores 2-3 runs. A hard ground ball might score a run. You don't need a grand slam — you need hard contact. The bases being loaded means EVERYTHING good is amplified. Just drive the ball.","Being too patient with nobody out and bases loaded wastes the pressure on a nervous pitcher. If he grooves one, crush it.","Bunting with bases loaded as the cleanup hitter is insane. Drive the ball."],
      rates:[25,85,40,5],concept:"Bases loaded, don't swing for the grand slam — hard contact with the bases loaded is devastating enough",anim:"hit"},
    {id:"b57",title:"Go-Ahead Run in the 9th — Nervous Pitcher",diff:3,cat:"approach",
      description:"Bot 9th, runner on 2nd, 1 out, tied 7-7. You can see the pitcher sweating. He's bounced two curveballs. His fastball has been up. He's clearly nervous.",
      situation:{inning:"Bot 9",outs:1,count:"0-0",runners:[2],score:[7,7]},
      options:["Be aggressive — he's going to groove a fastball","Be patient — let him walk you","Look for one specific pitch — his fastball up in the zone","Jump on the first hittable pitch you see"],
      best:3,explanations:["Being overly aggressive might mean swinging at a curveball in the dirt as he tries to settle down.","Being too patient lets him recover. Nervous pitchers sometimes settle down after a few pitches.","Looking for one specific pitch is too narrow. He's wild — you don't know what's coming.","A nervous pitcher will make a mistake — a fastball that drifts over the plate, a hanging curve, a changeup that stays up. Jump on the FIRST hittable pitch you see. Don't give him time to settle in. The longer the at-bat goes, the more comfortable he gets. Strike early while he's shaking."],
      rates:[40,30,35,85],concept:"Against a nervous pitcher, jump on the first hittable pitch — don't let him settle in",anim:"hit"},
    {id:"b58",title:"Third At-Bat — You've Seen Everything",diff:3,cat:"adjustments",
      description:"Top of the 7th, runner on 1st, 2 outs, down 4-3. Third at-bat against this pitcher. He struck you out on a slider in the 2nd and got you on a changeup in the 5th.",
      situation:{inning:"Top 7",outs:2,count:"0-0",runners:[1],score:[3,4]},
      options:["Sit on the slider — he got you with it once","Look for the changeup — it worked last time","Expect fastball early, then adjust to off-speed","Look for the pitch you HAVEN'T seen — he might go there"],
      best:2,explanations:["Sitting on the slider only means he throws the changeup and you're lost again.","Sitting changeup means the slider gets you. You can't guess one pitch against a pitcher with multiple weapons.","Third time through, you KNOW his arsenal. He has a fastball, slider, and changeup. Expect fastball early in the count (most pitchers go back to the fastball to get ahead), then be ready to react to the off-speed. Your previous at-bats taught you what the slider and changeup LOOK like — use that knowledge to recognize them earlier.","Trying to guess a new pitch is overthinking. Use what you've learned from your first two at-bats."],
      rates:[30,25,85,35],concept:"Third at-bat, use your data — expect fastball early, react to off-speed with what you've learned",anim:"hit"},
  ],
  secondBase: [
    {id:"f1",title:"Double Play Chance",diff:1,cat:"infield",
      description:"You're at 2nd base. Runner on 1st, 0 outs. Ground ball right at you. Runner isn't fast.",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[1],score:[3,2]},
      options:["Tag 2nd, throw to 1st — double play","Throw to 1st for the sure out","Flip to SS covering 2nd","Hold and check the runner"],
      best:0,explanations:["Ball came right to you — step on 2nd (force out) and fire to 1st. Two outs!","One out is okay but you're leaving a free out on the field.","The flip adds an extra throw. You're right there — do it yourself.","Never hold the ball with runners moving!"],
      explSimple:["The ball came right to you! Step on second base, then throw to first to get two outs.","Throwing to first only gets one out. You could have gotten two!","You're standing right there at second — just step on the base yourself instead of flipping it.","Don't hold the ball! You need to make a throw and get someone out."],
      rates:[85,55,50,10],concept:"When a ground ball comes right to you, turn the double play yourself",anim:"doubleplay"},
    {id:"f12",title:"Relay Position",diff:2,cat:"outfield",
      description:"Deep fly ball to the corner in right. Runner trying to score from 1st. You're the 2nd baseman going out for the relay.",
      situation:{inning:"Bot 5",outs:1,count:"-",runners:[1],score:[2,3]},
      options:["Line up between outfielder and home plate","Line up between outfielder and 3rd","Go to shallow right field","Stay near 2nd base"],
      best:0,explanations:["Perfect relay positioning! Get in a straight line between the outfielder and home plate.","The throw needs to go HOME, not 3rd. Line up accordingly.","Too close to the outfielder — you need distance for a relay.","Staying at 2nd means no relay. The throw bounces in."],
      explSimple:["Stand in a straight line between the outfielder and home plate so you can catch and throw it home quickly.","The runner is going home, so line up toward home plate — not third base.","Don't go too close to the outfielder. You need to be in the middle to make a good relay throw.","If you stay at second base, nobody catches the throw and it bounces all the way in."],
      rates:[85,35,25,15],concept:"On relay throws, line up directly between the outfielder and the target base",anim:"throwHome"},
    {id:"f14",title:"Bases Empty — Routine Grounder",diff:1,cat:"infield",
      description:"Bot 4th, nobody on, 1 out, tied 3-3. You're at second base. Routine ground ball hit right to you.",
      situation:{inning:"Bot 4",outs:1,count:"-",runners:[],score:[3,3]},
      options:["Throw to first base","Throw to second base","Hold the ball — no rush","Tag the base you're standing near"],
      best:0,explanations:["With nobody on base, throw to first! There's no force play anywhere else. Field the ball cleanly, set your feet, and make a strong throw to first base for the out. Simple, fundamental baseball.","There's no runner going to second — nobody's on base! Throwing there accomplishes nothing.","Holding the ball lets the batter reach first safely. Make the play!","Tagging second base doesn't create an out — there's no force play. The batter is running to first."],
      rates:[85,5,10,5],concept:"With nobody on base, every ground ball goes to first — know where to throw before the ball is hit",anim:"groundout"},
    {id:"f17",title:"Bases Loaded — Throw Home",diff:2,cat:"infield",
      description:"Top of the 3rd, bases loaded, 1 out, up 5-4. You're the second baseman. Hard ground ball hit right at you.",
      situation:{inning:"Top 3",outs:1,count:"-",runners:[1,2,3],score:[5,4]},
      options:["Throw home for the force out","Step on second and throw to first — double play","Throw to first for the sure out","Flip to the shortstop at second"],
      best:0,explanations:["With bases loaded and 1 out, throwing home gets the force out AND prevents a run. After the catcher catches it, he can throw to first for the double play. Protecting the plate is priority #1 with a 1-run lead.","The double play at second-first gets two outs but lets the runner on third score — that ties the game. With a 1-run lead, you can't give up that run.","Throwing to first only gets one out and lets a run score from third.","Flipping to second gets a force out but lets the run score. Throw home first!"],
      rates:[85,50,20,40],concept:"With bases loaded, throw home first — prevent the run and set up the double play",anim:"throwHome"},
    {id:"f20",title:"Fast Runner — Can You Turn Two?",diff:3,cat:"infield",
      description:"Bot 5th, runner on 1st, nobody out, tied 3-3. The runner is their fastest player. Ground ball to second — you flip to short to start the DP.",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[1],score:[3,3]},
      options:["Turn the double play — every millisecond counts","Get the force at second and hold — don't rush the relay","Make the flip and let the shortstop decide","Skip the flip — throw directly to first"],
      best:1,explanations:["Trying to turn a DP against the fastest runner might result in a rushed wild throw. Two men on, nobody out is much worse.","When the runner is extremely fast, get the sure out at second. A force out is guaranteed — but the relay throw to first might not beat the fastest runner. Take the sure out and avoid the error.","The shortstop will try to turn it, but a rushed throw against a blazing runner could be wild.","Throwing to first only gets one out and doesn't address the runner. The force at second is better."],
      rates:[30,85,40,25],concept:"Against very fast runners, get the sure out at second — don't force a double play and risk an error",anim:"groundout"},
    {id:"f47",title:"Runner on Second — Hold or Play Back?",diff:1,cat:"positioning",
      description:"Bot 3rd, runner on 2nd, nobody out, tied 1-1. You're the second baseman. Should you play at double play depth even though there's no runner on first?",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[2],score:[1,1]},
      options:["Double play depth — get the runner at third on a ground ball","Normal depth — maximize your range","Play in — cut off the run at home","Split the difference — shade toward 2nd a bit"],
      best:1,explanations:["No conventional double play is available with only a runner on 2nd — there's no force at third base.","With a runner on 2nd and nobody out, play at normal depth. Your job is to get outs. If the ball is hit to you, throw to first for the out. Glance at the runner on second, but he's not your primary concern — getting the batter out is.","Playing in with a runner on 2nd and nobody out is too aggressive — you give up too much range.","Shading toward 2nd isn't needed without a runner on first."],
      rates:[20,85,30,35],concept:"With only a runner on 2nd, play normal depth — no conventional DP is available without a runner on first",anim:"groundout"},
    {id:"f60",title:"Rundown — How Many Throws?",diff:1,cat:"communication",
      description:"Top of the 6th, runner caught in a rundown between first and second. You're the second baseman with the ball. The first baseman is at first. How do you handle this?",
      situation:{inning:"Top 6",outs:0,count:"-",runners:[1],score:[3,3]},
      options:["Chase him toward first and throw to the first baseman — one throw","Run at him full speed and tag him yourself","Pump fake a few times to freeze him, then tag","Throw the ball back and forth until he makes a mistake"],
      best:0,explanations:["A rundown should take ONE throw, maximum two. Run hard at the runner, driving him back toward first base. When you get close enough that the first baseman can tag him, make a firm throw. The first baseman catches and tags. One throw, one out. The more throws you make, the more chances for an error.","Running at him yourself works if you're fast enough, but a throw is more reliable.","Pump fakes waste time and give the runner a chance to reverse direction.","Throwing back and forth is the worst rundown technique. Every throw is a chance for an error."],
      rates:[85,40,30,10],concept:"Rundowns should take one throw — run hard at the runner, drive him back, make one firm throw for the tag",anim:"catch"},
    {id:"2b1",title:"Turning Two at the Pivot",diff:1,cat:"fielder",
      description:"You're the second baseman. Runner on first, one out, and the batter hits a ground ball to the shortstop. Your SS fields it cleanly and fires to you at second base. You catch the ball on the bag — what do you do next?",
      situation:{inning:"Top 4",outs:1,count:"1-0",runners:[1],score:[3,2]},
      options:["Catch the ball, drag your foot across the bag, and make a quick throw to first","Hold the ball at second and settle for just the force out","Catch it and run toward first base before throwing","Jump high in the air to avoid the runner, then throw to first"],
      best:0,explanations:["Perfect double play pivot! You catch the throw, touch second base with your foot, and fire to first in one smooth motion. Quick hands and footwork turn two outs — that's textbook.","Getting one out is okay, but with a runner on first and a ground ball, this is a golden double play chance. You always want to try to complete the turn unless the runner is right on top of you.","Running toward first wastes precious time. The batter is sprinting down the line. You need to get rid of the ball quickly from second base — your arm is strong enough to make the throw from there.","Jumping high to avoid the runner looks cool in the movies, but it makes your throw wild and slow. A small hop or shuffle to the side is all you need to clear the runner and make an accurate throw."],
      rates:[88,35,15,20],concept:"On a double play pivot, catch the ball, touch the bag, and make a quick accurate throw to first — footwork and fast hands are everything.",anim:"doubleplay"},
    {id:"2b2",title:"Ball Up the Middle",diff:2,cat:"fielder",
      description:"You're the second baseman. No runners on, two outs, and the batter smacks a hard ground ball up the middle, just to the right of second base. You have to range to your left to get it. What's your play?",
      situation:{inning:"Bot 5",outs:2,count:"2-1",runners:[],score:[1,1]},
      options:["Sprint to your left, backhand the ball, plant your right foot, and throw across your body to first","Let it go through — the center fielder will back you up","Try to dive for it and flip the ball from your knees","Run to your left, field it, then spin all the way around to throw to first"],
      best:0,explanations:["Great play! Ranging to your left, backhanding the ball, planting hard, and throwing across your body is the fastest way to get this out. It takes practice but it's how the best second basemen make this play.","Never give up on a ball you can reach! The center fielder backing you up means a single, not an out. With two outs, you need to make this play to end the inning.","Diving is a last resort. If you can get to the ball on your feet, always stay on your feet. Throwing from your knees is weak and inaccurate, and the runner will beat it out.","Spinning all the way around takes way too long. By the time you complete the spin and throw, the batter is already past first base. The across-the-body throw is much quicker."],
      rates:[85,10,25,20],concept:"When ranging to your left as a second baseman, backhand the ball, plant hard, and throw across your body — spinning around wastes too much time.",anim:"groundout"},
    {id:"2b3",title:"Covering First on the Bunt",diff:1,cat:"fielder",
      description:"You're the second baseman. Runner on first, no outs, and the other team is bunting. Your first baseman charges toward home plate to field the bunt. The bunt rolls toward the pitcher. Who covers first base?",
      situation:{inning:"Top 3",outs:0,count:"1-1",runners:[1],score:[0,0]},
      options:["Sprint to first base to cover the bag — you're the one who takes over when the 1B charges","Stay at your normal position and let the pitcher cover first","Run to second base instead in case the lead runner goes there","Wait and see what happens before you move"],
      best:0,explanations:["Exactly right! When the first baseman charges a bunt, the second baseman MUST hustle over to cover first base. This is your responsibility on every bunt play — get there fast and give the fielder a target!","The pitcher might field the bunt, but then who does he throw to at first? Someone has to be on the bag, and that someone is you. The pitcher can't cover first AND field the bunt.","The shortstop covers second base on this play, not you. Your job is first base. If you both go to second, nobody covers first and the batter gets a free base.","Waiting and watching is the worst thing you can do on a bunt play. Everything happens fast — you need to be sprinting toward first the instant you see the bunt go down. Hesitation means the runner is safe."],
      rates:[85,20,25,10],concept:"On a bunt play when the first baseman charges, the second baseman must sprint over to cover first base — hesitation means a free base.",anim:"bunt"},
    {id:"2b4",title:"Relay From Right Field",diff:1,cat:"fielder",
      description:"You're the second baseman. Runner on first, one out, and the batter hits a line drive into the right field gap. The ball rolls to the wall. The runner from first is rounding second and heading to third — and he looks like he might keep going. You're the relay man — where do you position yourself?",
      situation:{inning:"Bot 6",outs:1,count:"0-0",runners:[1],score:[4,3]},
      options:["Line yourself up between the right fielder and third base, arms up, calling for the ball","Line up between the right fielder and home plate","Stay near second base and let the shortstop handle the relay","Run out toward right field to get as close to the outfielder as possible"],
      best:1,explanations:["Lining up to third can work if the runner clearly stops there, but your default should always be toward home. Preventing runs is the priority, and your teammates can yell to redirect you if needed.","Perfect relay positioning! Your default is always to line up between the outfielder and home plate. Preventing the run is the #1 priority. Put your arms up high so the outfielder can see you, and listen for your teammates — they'll tell you where to throw. If the runner stops at third, you can cut it and hold.","The second baseman IS the relay man on balls hit to right field. The shortstop covers second base. If you don't go out for the relay, the outfielder has to make a long throw all by himself.","Going too far toward the outfielder defeats the purpose. You want to be about halfway so you can catch the throw and quickly relay it. If you're too deep, you're just an extra step that slows things down."],
      rates:[55,85,15,20],concept:"On a relay from right field, the second baseman lines up between the outfielder and home plate — preventing runs is always the default priority.",anim:"advance"},
    {id:"2b5",title:"Tag Play at Second Base",diff:2,cat:"fielder",
      description:"You're the second baseman covering second base on a steal attempt. The runner on first takes off for second, and the catcher fires a strong throw. The ball is coming to you on the shortstop side of the bag. How do you apply the tag?",
      situation:{inning:"Top 2",outs:0,count:"1-2",runners:[1],score:[0,0]},
      options:["Straddle the bag, catch the ball, and sweep your glove down in front of the base to tag the runner's feet as he slides in","Catch the ball and chase the runner to tag him","Stand behind the bag and wait for the runner to slide into your glove","Catch the ball and slap the tag on the runner's head or shoulders"],
      best:0,explanations:["Textbook tag! You straddle the bag so you're in a strong position, catch the throw, and sweep your glove down right in front of the base. The runner slides right into your tag. Quick and clean — that's how you get the out.","Never chase a runner when you're already at the base! You have the ball and you're at second — let the runner come to you. Chasing wastes time and might cause a collision.","Standing behind the bag means the runner touches the base before your tag gets there. You need to put the tag in FRONT of the base so the runner slides into it. Position is everything on a tag play.","Tagging up high is dangerous and can hurt the runner. Always tag low, near the feet or legs, as the runner slides in. It's safer and more effective because that's what reaches the base first."],
      rates:[85,15,25,20],concept:"On a steal tag play, straddle the bag and sweep the glove tag down in front of the base — let the runner slide right into it.",anim:"steal"},
    {id:"2b6",title:"Pop Fly in Shallow Right",diff:1,cat:"fielder",
      description:"You're the second baseman. Runner on third, one out, tie game. The batter pops the ball up in shallow right field — it's a tweener between you, the first baseman, and the right fielder. All three of you are converging. What should you do?",
      situation:{inning:"Bot 7",outs:1,count:"0-2",runners:[3],score:[5,5]},
      options:["Call for it yourself — you're coming out on the ball","Peel off and let the right fielder take it — he's charging in with momentum toward the infield","Let the first baseman take it since he's closer to home plate","Stop running and duck so nobody crashes into each other"],
      best:1,explanations:["You're going back on this ball, which is the hardest catch in baseball — the ball drifts away from you and you're running blind. The right fielder charging in can see the ball in front of him the entire way. Plus, with a runner on third and one out, the RF's forward momentum gives him a better throwing position for the tag-up play at home.","Correct! Outfielders coming in always have priority over infielders going back. The right fielder has the ball in front of him, better depth perception, and forward momentum. With a runner on third tagging up, the RF is also in a much better position to catch and throw home — his momentum is already heading toward the infield. Two reasons to let the outfielder take it!","The first baseman going back has the same problem you do — he's running away from the ball. Plus, with a runner on third, the first baseman needs to get back to his position in case of a play. Let the outfielder handle it.","Stopping and ducking might avoid a collision, but it also means nobody catches the ball! Someone has to take charge — and on tweeners between infield and outfield, the outfielder coming in is always the priority fielder."],
      rates:[40,85,20,10],concept:"Outfielders coming in have priority over infielders going back — with a runner on third, the outfielder's forward momentum also sets up a better throw home on a tag-up.",anim:"catch"},
    {id:"2b7",title:"Holding the Runner at Second",diff:3,cat:"fielder",
      description:"You're the second baseman in a close game. There's a speedy runner on second base with a big lead. The pitcher is in the stretch. Your coach wants you to keep that runner close to second so he can't score easily on a single. What's your move?",
      situation:{inning:"Top 7",outs:1,count:"0-0",runners:[2],score:[3,3]},
      options:["Fake like you're going to cover second to keep the runner honest, then get back to your fielding position before the pitch","Ignore the runner and stay in your normal position the whole time","Stand right on second base the entire at-bat to guard the runner","Yell at the runner to get back to the base"],
      best:0,explanations:["Smart play! By faking toward the bag, you freeze the runner and keep his lead short. Then you hustle back to your fielding position before the pitch so you're ready for a ground ball. This cat-and-mouse game keeps the runner close without hurting your defense.","Ignoring the runner lets him take a huge secondary lead. If a single is hit, he'll score easily from second. Part of your job as a middle infielder is to control the running game.","Standing on the bag the whole time leaves a massive hole in the defense on the right side. The batter could hit a ground ball through your empty position. You have to balance holding the runner AND being ready to field.","Yelling at the runner does nothing — he's not going to listen to the other team! Use your positioning and fakes to control the runner, not your voice."],
      rates:[82,25,20,10],concept:"Hold runners close by faking toward the bag, then hustle back to fielding position before the pitch — balance runner control with defensive positioning.",anim:"freeze"},
    {id:"2b8",title:"Hit and Run Coverage",diff:3,cat:"fielder",
      description:"You're the second baseman. Runner on first, one out, and you suspect the other team is running a hit-and-run play. As the pitcher delivers, you see the runner take off from first. The batter swings and hits a ground ball toward the hole between first and second. Where should you be?",
      situation:{inning:"Bot 4",outs:1,count:"1-1",runners:[1],score:[2,1]},
      options:["Stay near your normal position to field the ground ball — since you didn't break to cover second, you're perfectly placed to make the play","Break early to cover second base since the runner is going","Charge toward home plate to cut off the ground ball","Move toward first base to help the first baseman"],
      best:0,explanations:["On a hit-and-run, the shortstop usually covers second. Your job as the second baseman is to stay home and cover the right side of the infield. Because you held your position, you're right there to field the ground ball and get the out. Smart baseball!","If you break toward second to cover the bag, you leave a giant hole on the right side of the infield — exactly where the batter is trying to hit the ball on a hit-and-run! The shortstop has second base covered.","There's no reason to charge toward home plate on a ground ball hit to your area. Stay in your zone and make the play. Charging in takes you away from the ball.","The first baseman can handle his own position. Your job is to cover the area between first and second. Moving toward first creates a gap in the defense right where the ball is heading."],
      rates:[82,20,10,15],concept:"On a hit-and-run, the second baseman holds position to cover the right side while the shortstop covers second — don't leave your zone empty.",anim:"groundout"},
  ],
  shortstop: [
    {id:"f2",title:"Cutoff Decision",diff:2,cat:"outfield",
      description:"You're the SS cutoff. Deep hit to left-center, runner from 1st trying to score. Throw coming to you.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[1],score:[2,2]},
      options:["Cut it off and throw home","Let the throw go through","Cut and hold","Cut and throw to 3rd"],
      best:0,explanations:["Your relay is faster and more accurate than a bouncing outfield throw.","Letting throws through only works on perfect one-hoppers.","Holding lets the tying run score with no play.","Home is the priority, not 3rd."],
      explSimple:["Catch the ball and make a strong throw home. Your throw will be faster and better than letting the outfield throw bounce all the way.","Letting the throw go past you only works if it's a perfect throw, and that's rare.","If you just hold the ball, the runner scores and you didn't even try to get him.","The runner is going home, so that's where you need to throw — not third base."],
      rates:[80,35,25,40],concept:"The cutoff man relays accurate throws home — catch and throw, don't let it go",anim:"throwHome"},
    {id:"f13",title:"Ground Ball to Short — Runner on First",diff:1,cat:"infield",
      description:"Top of the 3rd, runner on 1st, nobody out. You're at shortstop. Ground ball hit right at you. The runner isn't very fast.",
      situation:{inning:"Top 3",outs:0,count:"-",runners:[1],score:[2,1]},
      options:["Throw to second to start the double play","Throw to first for the sure out","Tag the runner yourself","Hold the ball and check the runner"],
      best:0,explanations:["With a runner on first and nobody out, the double play is the best outcome. Flip to second base, the middle infielder turns it, and you get two outs on one play. That's how you get out of innings fast!","Throwing to first gets one out but advances the runner to second — now he's in scoring position. The double play clears the bases.","Tagging the runner as a shortstop would require chasing him. Throw to second for the force.","Holding the ball with a runner advancing means nobody is out. Make a play!"],
      explSimple:["Throw to second base to get the first out, and then your teammate throws to first for the second out. Two outs on one play!","Throwing to first gets one out, but the runner moves to second base where he can score more easily.","You can't chase the runner — just throw to second base for the easy force out.","Don't hold the ball! Throw it to a base and get someone out."],
      rates:[85,45,10,15],concept:"With a runner on first and nobody out, the double play is always the first thought",anim:"doubleplay"},
    {id:"f16",title:"First and Second — Start the DP",diff:2,cat:"infield",
      description:"Bot 6th, runners on 1st and 2nd, nobody out, tied 4-4. You're at shortstop. Hard ground ball right at you. Both runners are going.",
      situation:{inning:"Bot 6",outs:0,count:"-",runners:[1,2],score:[4,4]},
      options:["Step on second and throw to first — double play","Throw to third for the force out","Throw to first for the sure out","Tag the runner coming from first"],
      best:0,explanations:["With runners on 1st and 2nd, stepping on second starts the double play — the runner from first is forced at second, then a quick throw to first gets the batter. Two outs!","Throwing to third gets one out but lets the batter reach first. The double play is worth more.","Throwing to first gets one out but advances both runners into scoring position.","Tagging one runner still leaves the other runners advancing. The double play is the best play."],
      rates:[85,45,30,15],concept:"With runners on 1st and 2nd, step on second and throw to first for the double play",anim:"doubleplay"},
    {id:"f18",title:"Runner Breaks from Third",diff:1,cat:"infield",
      description:"Bot 7th, runner on 3rd, 1 out, down 3-4. You're at shortstop playing normal depth. Slow ground ball to your left — you field it, but the runner on 3rd breaks for home!",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[3],score:[3,4]},
      options:["Throw home to get the runner","Throw to first — get the sure out","Hold the ball — check if the runner commits","Throw to third — maybe he'll go back"],
      best:0,explanations:["With a runner breaking from 3rd, your first priority is preventing the run! If you have a play at home, throw it. Stopping the run is more important than the out at first.","Getting the out at first lets the run score. If the game is close, that run matters more than the out.","Holding the ball while the runner sprints home means the run scores for free. Make a decision and throw.","The runner already committed to home — throwing to third does nothing. Throw home!"],
      rates:[85,35,25,5],concept:"When a runner breaks from 3rd, prevent the run — throw home if you have a play",anim:"throwHome"},
    {id:"f31",title:"Cutoff Man Position on a Relay",diff:3,cat:"outfield",
      description:"Top of the 6th, runner on 1st, nobody out. Double to right-center gap. You're the shortstop going out as the relay man. Where do you position yourself?",
      situation:{inning:"Top 6",outs:0,count:"-",runners:[1],score:[2,2]},
      options:["In a straight line between the outfielder and home plate","In a straight line between the outfielder and third base","Halfway between the outfielder and the infield","As close to the outfielder as possible"],
      best:0,explanations:["Line yourself up directly between the outfielder and home plate. Raise your arms so the outfielder can see you and has a target. The throw from the outfielder should come to you chest-high, and you catch-and-fire to home in one motion.","Lining up toward third only works if you know the throw is going to third. Default to home — you can always redirect to third after catching it.","Halfway is too vague. You need to be in the optimal relay distance — close enough to receive a strong throw but far enough to get momentum on your throw home.","Being too close to the outfielder makes your relay throw longer. Position yourself about 100-130 feet from home."],
      rates:[85,35,30,15],concept:"As the relay man, line up between the outfielder and home plate — give the outfielder a clear target",anim:"throwHome"},
    {id:"f44",title:"Double Play Depth",diff:1,cat:"positioning",
      description:"Top of the 4th, runner on 1st, nobody out, tied 2-2. You're the shortstop. Where should you position yourself?",
      situation:{inning:"Top 4",outs:0,count:"-",runners:[1],score:[2,2]},
      options:["Double play depth — a few steps closer to 2nd base","Normal depth — play your regular spot","Deep in the hole — maximize range","Shift toward the pull side"],
      best:0,explanations:["With a runner on first and nobody out, move to double play depth. This means moving a few steps toward second base and a step or two in (closer to home). This shorter path to second base lets you start the double play faster. You sacrifice a little range in the hole, but the DP is worth it.","Normal depth makes the double play harder — you have to cover more ground to get to second.","Deep in the hole maximizes your range but makes the throw to second for the DP much longer.","Shifting without knowing the hitter's tendencies is guessing."],
      rates:[85,30,20,25],concept:"Double play depth means a few steps toward 2nd and a step in — shorter path to start the DP",anim:"doubleplay"},
    {id:"f48",title:"Fast Runner at the Plate — Adjust Depth",diff:1,cat:"positioning",
      description:"Top of the 8th, nobody on, 1 out, up 3-2. Their fastest player steps in — he can beat out routine ground balls if you play too deep. You're the shortstop.",
      situation:{inning:"Top 8",outs:1,count:"-",runners:[],score:[3,2]},
      options:["Play a step or two in — shorten the throw to first","Play normal depth — don't change for one batter","Play deep — get more range","Shade toward the hole — fast guys pull the ball"],
      best:0,explanations:["Against fast runners, cheat in a step or two. A shorter throw to first means the ball gets there faster. You're trading a tiny bit of range for a quicker throw — which matters against speed. The difference between safe and out against a fast runner is often 0.1 seconds.","Normal depth against a speedster means routine grounders become infield singles. Adjust!","Playing deep gives you more range but a longer throw. Against a fast runner, the long throw means he beats it out.","There's no evidence this fast player is a pull hitter. Don't guess — adjust your depth."],
      rates:[85,30,15,25],concept:"Against fast runners, play a step in — a shorter throw to first compensates for their speed",anim:"groundout"},
    {id:"f61",title:"Relay from Deep Center — Who Goes Where?",diff:3,cat:"outfield",
      description:"Bot 8th, runner on 1st, nobody out. Ball hit to deep center — it's a triple. The center fielder is chasing it to the wall. Who goes out for the relay?",
      situation:{inning:"Bot 8",outs:0,count:"-",runners:[1],score:[4,5]},
      options:["Shortstop goes out for the relay, second baseman covers second","Second baseman goes out, shortstop covers second","Both middle infielders go out — one for each possible target","The third baseman goes out as the relay man"],
      best:0,explanations:["On balls to center and left-center, the shortstop goes out as the relay man. He lines up between the outfielder and home plate, arms raised as a target. The second baseman stays and covers second base. This is the standard relay alignment.","The second baseman goes out for relay throws to the right side (right-center and right field). On balls to center and left, it's the shortstop's job.","Having both go out leaves second base uncovered. One goes, one stays.","The third baseman stays at third to take a possible throw. The shortstop is the relay man on balls to center."],
      rates:[85,30,15,10],concept:"On balls to center/left, the shortstop is the relay man — the second baseman covers second base",anim:"throwHome"},
    {id:"ss1",title:"Deep in the Hole",diff:2,cat:"fielder",
      description:"You're the shortstop. No outs, nobody on base. The batter hits a sharp ground ball deep in the hole between short and third. You range far to your right, backhand the ball, and now you're deep behind third base. What's the play?",
      situation:{inning:"Top 3",outs:0,count:"1-1",runners:[],score:[1,0]},
      options:["Plant your back foot hard, set your feet, and make a strong overhand throw across the diamond to first","Flip the ball to the third baseman and let him throw to first","Lob a soft throw to first to make sure it's accurate","Run toward first base to shorten the throw before letting it go"],
      best:0,explanations:["This is the signature shortstop play! After a deep backhand, you plant your back foot hard to stop your momentum, set your feet, and fire a strong throw across the diamond. It takes a cannon arm and great footwork — that's why shortstop is a premium position.","The third baseman isn't expecting a flip, and by the time he catches it and throws, the runner is safe. You have to make this throw yourself — it's one of the most important plays a shortstop makes.","A lob throw from deep in the hole will never beat the runner. You're far from first base and the batter is sprinting. You need your strongest, most accurate throw to get the out in time.","Running toward first eats up valuable time. The batter is faster than you running toward first, so every step you take closer costs you. Plant and throw — your arm strength is what gets this out."],
      rates:[85,20,15,25],concept:"On a deep backhand in the hole, plant hard, set your feet, and make a strong throw across the diamond — this is the shortstop's signature play.",anim:"groundout"},
    {id:"ss2",title:"Starting the Double Play",diff:1,cat:"fielder",
      description:"You're the shortstop. Runner on first, one out, and the batter hits a ground ball right at you. You field it cleanly. You need to start the double play by getting the ball to second base. What's the best way to feed the second baseman?",
      situation:{inning:"Bot 5",outs:1,count:"0-1",runners:[1],score:[2,3]},
      options:["Make a quick, chest-high throw to the second baseman at the bag — firm but easy to handle","Shovel a hard underhand flip right at his feet","Throw the ball as hard as you possibly can to save time","Run the ball over to second base yourself and then throw to first"],
      best:0,explanations:["A firm, chest-high throw right to the second baseman's glove is the perfect double play feed. It gives him a clean catch and lets him turn the play quickly. Accuracy matters more than speed on the feed — help your teammate make the turn!","An underhand flip at his feet is hard to handle and slows down the turn. The second baseman has to reach down, adjust, and then throw — that extra time lets the runner reach first safely.","Throwing as hard as you can might be wild or hard for the second baseman to catch. A firm, accurate throw is much better than a bullet that sails into center field. Control your throw!","Running the ball to second wastes way too much time. By the time you get there, the runner from first is already at second, and the batter is almost to first. Use your arm — that's what it's for!"],
      rates:[88,25,20,10],concept:"On a double play feed to second, make a firm chest-high throw the second baseman can handle — accuracy beats raw speed every time.",anim:"doubleplay"},
    {id:"ss3",title:"Covering on the Steal",diff:2,cat:"fielder",
      description:"You're the shortstop. Runner on first with good speed, and you suspect he's going to steal second. The pitcher delivers, and the runner takes off! The catcher pops up and fires to second. You're covering the bag. How should you set up?",
      situation:{inning:"Top 1",outs:0,count:"2-1",runners:[1],score:[0,0]},
      options:["Get to the bag early, straddle it with your left foot on the outfield side, and give the catcher a clear target with your glove","Stand in front of the bag blocking the base path so the runner can't reach it","Get to the bag and jump out of the way as the throw arrives to avoid getting hit by the runner","Wait at your normal position until you see the throw, then run to the bag"],
      best:0,explanations:["Perfect steal coverage! Getting to the bag early gives the catcher a clear target. Straddling with your left foot on the outfield side keeps you out of the runner's path while letting you sweep a tag down in front of the base. Quick glove, quick tag, out!","Blocking the base path without the ball is obstruction — the umpire will award the runner the base! You need to straddle the bag and leave a lane for the runner to slide, then apply the tag.","Jumping out of the way means you won't be in position to make the tag. Yes, the runner is coming hard, but you need to be strong at the bag. Straddle it so you can apply the tag and let the runner slide past you on the other side.","Waiting at your normal position means the catcher has no target and you won't get to the bag in time. You need to anticipate the steal and get to the bag as the pitch is delivered, not after the throw."],
      rates:[85,15,20,25],concept:"On steal coverage, get to the bag early, straddle it to give the catcher a target, and sweep the tag down in front of the base.",anim:"steal"},
    {id:"ss4",title:"Pop Fly in Shallow Left",diff:1,cat:"fielder",
      description:"You're the shortstop. Bases empty, two outs. The batter pops the ball up into shallow left field. It's a tweener — the left fielder is charging in and you're drifting back. The third baseman is nearby too. Who takes this ball?",
      situation:{inning:"Bot 3",outs:2,count:"1-2",runners:[],score:[0,2]},
      options:["Call for it yourself — you're an infielder going back on the ball","Let the left fielder take it — he's charging in with the ball in front of him","Let the third baseman call for it since he's closer to that side","Nobody calls it — whoever gets there first just catches it"],
      best:1,explanations:["Going back on a fly ball is one of the hardest plays in baseball — the ball drifts AWAY from you and you're running blind. The left fielder charging in has it in front of him the whole way, which is a much easier catch. Let the outfielder take this one.","Correct! The outfielder coming in always has priority over the infielder going back. Running forward, the left fielder can see the ball in front of him and has momentum toward the infield for a throw. Going back, you're chasing a ball drifting away from you — that's the toughest catch in baseball. Call him off? Never. Let him call YOU off.","The third baseman would have to range a long way to his left for this ball. Even if he got there, he'd be going back too — same problem as the shortstop. The outfielder coming in has the best angle by far.","Never leave a pop fly uncalled! When nobody calls it, players crash into each other or the ball drops between them. Someone MUST take charge — and on tweeners, the outfielder is the one who calls it."],
      rates:[35,88,20,10],concept:"Outfielders coming in have priority over infielders going back — running forward with the ball in front of you is always easier than chasing it over your shoulder.",anim:"catch"},
    {id:"ss5",title:"Relay Man to Left-Center",diff:1,cat:"fielder",
      description:"You're the shortstop. Runner on first, one out. The batter hits a deep fly ball to left-center field that drops and rolls to the wall. The runner from first is rounding second and heading for third — and he might keep going. You need to be the relay man. Where do you go?",
      situation:{inning:"Top 6",outs:1,count:"0-0",runners:[1],score:[3,4]},
      options:["Run out to line up between the left-center fielder and third base, arms up high so the outfielder can see you","Line up between the outfielder and home plate, arms up","Stay at shortstop position and let the third baseman handle it","Go to second base in case the batter tries to stretch it to a double"],
      best:1,explanations:["Lining up to third can work if the runner clearly stops, but your default should always be toward home. Preventing runs is the priority, and your teammates can yell to redirect you if needed.","Perfect relay positioning! Your default is always to line up between the outfielder and home plate — preventing runs is the #1 priority. Put your arms up high so the outfielder has a target, and listen to your teammates. They'll tell you where to throw. If the runner stops at third, you can cut it and hold.","The third baseman needs to be at third base to receive the throw! He can't be out doing the relay. The shortstop is always the relay man on balls hit to the left side of the outfield.","The second baseman or another infielder can cover second. Your priority as shortstop on a deep left-center hit is to get out there as the relay man. Without a relay, the outfielder has to make an impossible long throw."],
      rates:[55,85,15,20],concept:"On relay plays, the default alignment is toward home plate — preventing runs is always the priority.",anim:"advance"},
    {id:"ss6",title:"Do-Or-Die With Runner on Third",diff:3,cat:"fielder",
      description:"You're the shortstop. Runner on third, one out, tie game in the bottom of the last inning. The batter hits a slow chopper toward you — not hit hard, and the runner on third is breaking for home the moment the ball is hit. This is a do-or-die play. What do you do?",
      situation:{inning:"Bot 7",outs:1,count:"0-0",runners:[3],score:[4,4]},
      options:["Charge the ball hard, field it with your bare hand if needed, and fire home to try to get the runner","Play it safe — field the ball cleanly and throw to first for the sure out","Wait for the ball to come to you, then decide where to throw","Let the third baseman field it since he's closer to home"],
      best:0,explanations:["This is the do-or-die play! With the game on the line and the runner going home, you MUST charge hard and throw home. Even a bare-hand pickup and throw gives you a chance to save the game. If you throw to first, the runner scores and the game is over.","Throwing to first gets an out, but the runner from third scores and the game is over — you lose! In a tie game with a runner breaking from third, you have to try to get the runner at home. The out at first doesn't matter if the winning run scores.","Waiting for the ball to come to you wastes precious time. The runner is sprinting home — every fraction of a second matters. You have to charge aggressively and make a quick play. There's no time to be patient here.","The ball is hit toward you, not the third baseman. Even if the third baseman could get it, he'd have to field it and then spin to throw home. You're already facing home plate as you charge in — it's your play to make."],
      rates:[82,30,10,15],concept:"On a do-or-die play with a runner scoring from third, charge hard and throw home — the out at first doesn't matter if the winning run scores.",anim:"throwHome"},
    {id:"ss7",title:"Positioning for a Pull Hitter",diff:1,cat:"fielder",
      description:"You're the shortstop. Nobody on base, two outs. A big right-handed pull hitter is stepping up to bat. Your coach tells you to shade toward the third base side. Where should you position yourself?",
      situation:{inning:"Top 5",outs:2,count:"0-0",runners:[],score:[1,0]},
      options:["Move a few steps toward third base from your normal position — right-handed pull hitters tend to hit toward the left side of the infield","Stay in your normal shortstop position because you don't want to leave gaps","Move a few steps toward second base to cover the middle","Move way over right next to the third baseman"],
      best:0,explanations:["Smart positioning! Right-handed pull hitters hit the ball to the left side of the field most of the time. By shading a few steps toward third, you put yourself right where the ball is most likely to be hit. Good defense is about being in the right spot BEFORE the ball is hit.","Your normal position is designed for an average hitter. But this is a known pull hitter, so the ball is more likely to be hit toward third. Adjusting your position a few steps gives you a much better chance at making the play.","Moving toward second takes you AWAY from where a pull hitter is most likely to hit the ball. That's the opposite of what you want. You'd be leaving the hot zone unprotected.","Moving right next to the third baseman is too extreme. You'd leave a huge gap between you and second base. A few steps toward third is enough — you still need to cover your zone. Subtle adjustments make a big difference."],
      rates:[85,30,15,20],concept:"Against pull hitters, shade a few steps toward the side they tend to hit — positioning yourself where the ball is most likely to go is smart defense.",anim:"groundout"},
    {id:"ss8",title:"Bare-Hand the Swinging Bunt",diff:3,cat:"fielder",
      description:"You're the shortstop. Runner on second, two outs, one-run game. The batter barely makes contact — a weak dribbler rolling slowly up the third base line. It's dying in the grass between the mound and third. The third baseman is playing deep. Can you make the play?",
      situation:{inning:"Top 7",outs:2,count:"2-2",runners:[2],score:[3,2]},
      options:["Charge full speed, bare-hand the ball on the run, and make a quick throw to first in one motion","Let the third baseman come in for it since it's on his side","Wait for the ball to stop rolling, then pick it up with your glove and throw","Charge in but field it with your glove first, then transfer and throw"],
      best:0,explanations:["This is the ultimate athletic play! The ball is dying in the grass, so you have to charge full speed. Bare-handing lets you grab it and throw in one motion — no glove transfer needed. It's risky but it's the only way to get the runner at first in time. Elite shortstop play!","The third baseman is playing deep and has to cover more ground than you. Plus, he'd be running in and to his left, which is a harder angle. You can charge straight in — you have the better path to this ball.","If you wait for the ball to stop, the batter is safe at first by a mile. On a slow dribbler like this, every millisecond counts. You can't play it safe — you have to be aggressive and make a bang-bang play.","Fielding with your glove means you have to transfer the ball to your throwing hand, and that extra step takes too long on a slow roller. The bare-hand scoop-and-throw is one motion. When the ball is rolling that slowly, you need the bare hand."],
      rates:[80,20,10,30],concept:"On a dying swinging bunt, charge hard and bare-hand it — the scoop-and-throw in one motion is the only way to beat the runner on a slow roller.",anim:"groundout"},
  ],
  centerField: [
    {id:"f3",title:"Pop Fly Priority",diff:1,cat:"communication",
      description:"You're center field. High pop between you, the right fielder, and the 2nd baseman.",
      situation:{inning:"Top 2",outs:1,count:"-",runners:[2],score:[0,1]},
      options:["Call 'I got it!' and wave off others","Let the infielder take it","Stay quiet and see who gets there","Back off for the right fielder"],
      best:0,explanations:["CF has priority on ALL fly balls they can reach. Call early and loud!","You're running in (easier). Outfielder coming in has priority over infielder going back.","NEVER stay quiet! Collisions happen when nobody communicates.","CF has priority over corner outfielders."],
      explSimple:["You're the center fielder — you're the boss of fly balls! Yell 'I got it!' nice and loud so everyone hears you.","You're running toward home, which is easier than running back. The outfielder should take it.","Never stay quiet! If nobody calls it, players crash into each other.","Center field is in charge over the other outfielders on fly balls."],
      rates:[90,30,5,35],concept:"Center fielder has priority on all fly balls — call it early and loud!",anim:"catch"},
    {id:"f10",title:"Do-or-Die Play",diff:3,cat:"pressure",
      description:"Bottom 9th, tie game, runner on 2nd, 2 outs. Single to you in center. Runner going home.",
      situation:{inning:"Bot 9",outs:2,count:"-",runners:[2],score:[3,3]},
      options:["Field cleanly, set feet, strong throw home","Charge and throw on the run","Field and hit cutoff","Dive for the ball"],
      best:0,explanations:["This is it. Accuracy beats speed. Set your feet and make your best throw.","Throwing on the run sacrifices accuracy in the biggest moment.","Cutoff adds time on a game-ending throw.","Diving adds recovery time."],
      rates:[85,40,45,20],concept:"In do-or-die plays: field cleanly, set your feet, throw accurately",anim:"throwHome"},
    {id:"f24",title:"Fly Ball Caught — Throw Home or Cutoff?",diff:1,cat:"outfield",
      description:"Bot 6th, runner on 3rd, 1 out, tied 3-3. Fly ball caught by you in center field — medium depth. The runner is tagging up.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[3],score:[3,3]},
      options:["Throw directly home — gun him down","Hit the cutoff man with a strong throw","Throw to second — the batter isn't going anywhere","Hold the ball — save your arm"],
      best:0,explanations:["On a tag-up play from center field at medium depth, you have a realistic chance to throw the runner out at home. Crow-hop, set your feet, and fire a strong throw home. This is one of the few times you throw through the cutoff.","The cutoff man is great on base hits, but on a tag play you need the ball home as fast as possible. A relay adds time.","Throwing to second ignores the run scoring. The runner on third is the priority.","Holding the ball lets the tying run score. Make a play!"],
      rates:[85,50,10,5],concept:"On tag-up plays, throw directly home — speed matters more than accuracy on this play",anim:"throwHome"},
    {id:"f27",title:"Extra Base Hit to the Gap",diff:2,cat:"outfield",
      description:"Top of the 7th, runner on 1st, 1 out, tied 4-4. Ball hit into the right-center gap. Runner is sprinting for home. You're the center fielder — you get to the ball first.",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[1],score:[4,4]},
      options:["Throw home — try to get the runner at the plate","Hit the relay man between you and home","Throw to third to stop the batter","Hold the ball and run it in"],
      best:1,explanations:["Throwing home from the gap is 300+ feet — way too far for an accurate throw. It'll bounce multiple times and the batter will advance.","On extra-base hits to the gap, the relay throw is essential. Hit the relay man (usually the shortstop or second baseman) who is positioned in a straight line between you and home plate. He catches your throw and fires home in one motion. Two short throws beat one long throw.","Throwing to third ignores the scoring runner. Stop the run first.","Running the ball in is way too slow. The runner scores easily and the batter takes an extra base."],
      rates:[20,85,25,10],concept:"On balls in the gap, use the relay man — two short throws beat one long throw",anim:"throwHome"},
    {id:"f30",title:"Two Runners Going — Which Throw?",diff:3,cat:"outfield",
      description:"Bot 9th, runners on 1st and 2nd, 1 out, down 5-4. Single to center field. Runner from 2nd is scoring. Runner from 1st is trying for third. You're the center fielder.",
      situation:{inning:"Bot 9",outs:1,count:"-",runners:[1,2],score:[4,5]},
      options:["Throw home — stop the tying run","Throw to third — get the batter trying to advance","Hit the cutoff and let him decide","Throw to second — hold the batter to a single"],
      best:0,explanations:["With a runner scoring the tying run in the 9th, preventing that run is everything. The runner from second to home is the throw you must make. If you get him, the game stays in your favor.","Getting the runner at third is nice, but the tying run scoring from second is far more important. Stop the lead runner first.","The cutoff is usually smart, but in a do-or-die situation where the tying run is scoring, you throw home. The cutoff can catch the throw if the runner stops.","Throwing to second is the lowest-priority play. The tying run is about to score!"],
      rates:[85,35,50,10],concept:"When the tying or go-ahead run is scoring, throw home — stop the most important runner first",anim:"throwHome"},
    {id:"f51",title:"Routine Fly — Catch It Right",diff:1,cat:"outfield",
      description:"Bot 3rd, nobody on, 1 out, tied 1-1. Fly ball hit right to you in center field. It's a routine catch. How should you catch it?",
      situation:{inning:"Bot 3",outs:1,count:"-",runners:[],score:[1,1]},
      options:["Catch it above your head with both hands — the right way","Basket catch at your waist — it looks cool","One-hand snag — show off your skills","Catch it on the run — charge in"],
      best:0,explanations:["Catch fly balls above your head with two hands. Your glove hand catches the ball and your throwing hand covers it immediately. This is the safest, most reliable way to catch a fly ball. You can also transition to a throw quickly from this position.","Basket catches look cool but are much riskier. If you misjudge the ball, it hits you in the face. There's no margin for error at your waist.","One-handed catches increase the chance of the ball popping out of your glove. Use two hands.","The ball is coming to you — don't charge in on a routine fly. Get under it and make the catch."],
      rates:[85,25,20,15],concept:"Catch fly balls above your head with two hands — safe, reliable, and ready to throw",anim:"catch"},
    {id:"f52",title:"Ball Between Two Outfielders — Who Gets It?",diff:1,cat:"communication",
      description:"Top of the 5th, nobody on, 2 outs. Fly ball hit to left-center — both the left fielder and center fielder are running for it. Who calls it?",
      situation:{inning:"Top 5",outs:2,count:"-",runners:[],score:[2,2]},
      options:["Center fielder calls it — he has priority","Left fielder calls it — he called it first","Whoever is closer calls it","They should both try to catch it"],
      best:0,explanations:["The center fielder is the captain of the outfield. On any ball between two outfielders, the center fielder has priority. He calls 'I got it!' or 'Mine!' and the other fielder peels off. This prevents collisions and dropped balls. The CF has priority because he's running toward the ball and has a better angle.","The left fielder should defer to the center fielder even if he called it first.","Whoever is closer is a recipe for collisions. There must be a clear priority system.","Both going for the ball is how outfielders get hurt. One person catches it, the other backs up."],
      rates:[85,25,30,5],concept:"The center fielder has priority on fly balls between outfielders — he calls it and everyone else defers",anim:"catch"},
    {id:"f53",title:"Ball Deep to the Warning Track",diff:2,cat:"outfield",
      description:"Bot 6th, runner on 2nd, 1 out, tied 3-3. Deep fly ball hit toward the warning track in right-center. You're the center fielder — it's going over your head.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[2],score:[3,3]},
      options:["Sprint back, turn your back to the infield, and run to the spot","Drift back while keeping your eyes on the ball","Sprint to the wall and wait for it","Take an angle route — the banana route to the ball"],
      best:3,explanations:["Sprinting straight back while watching over your shoulder is the old-school method but it's inefficient.","Drifting back is too slow for a ball going over your head. You won't get there.","Sprinting to the wall and waiting doesn't work — the ball might land short of the wall.","Take an angle route (the 'banana route') — turn and run at an angle to where the ball will land, then curve back to catch it. This is faster than running straight back because you run in a more efficient path. You also end up facing the right direction to make a throw after the catch. Elite outfielders always use angle routes on deep fly balls."],
      rates:[35,15,20,85],concept:"On deep fly balls, use an angle route — turn and run to the spot, don't drift back or run straight",anim:"catch"},
    {id:"cf1",title:"Take Charge on the Pop Fly",diff:1,cat:"fielder",
      description:"You're the center fielder. A high pop fly is hit to short left-center field. The left fielder is running over and the shortstop is drifting back. You have a clear path to the ball and can get there easily.",
      situation:{inning:"Top 3",outs:1,count:"0-1",runners:[],score:[2,2]},
      options:["Call 'I got it!' loudly and wave off both players","Let the left fielder take it since it's closer to his side","Stay quiet and just run to the ball","Yell for the shortstop to catch it"],
      best:0,explanations:["As the center fielder you're the outfield captain. You have priority over corner outfielders and infielders on fly balls, and calling loudly prevents collisions.","The left fielder can catch it, but center fielders have priority on balls they can reach because you're coming in and can see the whole field better.","Running to the ball without calling it is dangerous. Two players could collide at full speed trying to make the same catch.","The shortstop is running with his back to the infield, making it a harder catch. Outfielders have priority over infielders on fly balls."],
      rates:[90,35,15,25],concept:"The center fielder is the outfield captain and has priority on any fly ball they can reach.",anim:"catch"},
    {id:"cf2",title:"Shade the Gap",diff:2,cat:"fielder",
      description:"You're in center field. A left-handed pull hitter steps up with nobody on base and one out. Your coach taught you to watch the batter's stance. This batter has an open stance and likes to drive the ball to right-center.",
      situation:{inning:"Bot 4",outs:1,count:"0-0",runners:[],score:[1,3]},
      options:["Shade a few steps toward right-center field","Shade a few steps toward left-center field","Stay in straightaway center","Move way over to the right field line"],
      best:0,explanations:["A left-handed pull hitter with an open stance tends to drive the ball to right-center. Shading that direction puts you in the best spot to cut off a gap hit.","Left-center is the opposite of where this batter likes to hit. You'd be leaving the right-center gap wide open for a double.","Staying in straightaway center is okay, but you're giving up a step or two toward where this hitter is most likely to drive the ball.","Moving all the way to the right field line is way too extreme. You'd leave a huge gap in left-center and couldn't recover on an opposite-field hit."],
      rates:[85,20,45,10],concept:"Study the batter's stance and tendencies to shade your position toward where they're most likely to hit.",anim:"catch"},
    {id:"cf3",title:"Hit the Right Base",diff:2,cat:"fielder",
      description:"You're the center fielder. A line drive single is hit to you on one hop. There's a runner on first who was running on the pitch and is already rounding second base heading for third. No other runners are on base with one out.",
      situation:{inning:"Top 6",outs:1,count:"2-1",runners:[1],score:[4,3]},
      options:["Throw to third base to try to get the lead runner","Throw to second base to hold the batter at first","Throw home just in case the runner tries to score","Throw to first base to keep the batter honest"],
      best:0,explanations:["The lead runner is the most dangerous baserunner. If you can gun him down at third, you get the second out and take away a scoring threat. That's the high-value play.","The batter already has a single and is unlikely to try for second on a ball hit right at you. Throwing to second base wastes time while the lead runner takes third easily.","The runner is only going to third, not home. Throwing home lets the batter move up to second and gives nobody a chance at an out.","Throwing to first makes no sense since the batter is already safe on the hit. You'd be ignoring the advancing lead runner completely."],
      rates:[80,40,15,10],concept:"Always target the lead runner — getting the out on the most advanced baserunner takes away the biggest scoring threat.",anim:"catch"},
    {id:"cf4",title:"Back Up the Play",diff:1,cat:"fielder",
      description:"You're the center fielder. With a runner on second and one out, a ground ball is hit to the shortstop. The shortstop fields it cleanly and throws to first base for the out. You notice nobody is behind the left fielder's area.",
      situation:{inning:"Bot 2",outs:1,count:"1-1",runners:[2],score:[0,0]},
      options:["Sprint toward left field to back up any overthrow or bobble at third","Stay in center field and watch the play","Run toward second base to back up the throw","Jog toward the infield to congratulate the shortstop"],
      best:0,explanations:["The runner on second may try to advance to third on the groundout. If the third baseman bobbles a throw or an overthrow gets past, you need to be backing up in left field to prevent the runner from scoring.","Standing still in center field means if anything goes wrong near third base, the ball rolls to the fence and the runner scores easily. Always be moving to back up.","The throw is going to first, not second. Running to second base doesn't help anyone on this play.","Never jog during a play! The ball is still live and runners are moving. Hustling to back up is how great center fielders prevent extra bases."],
      rates:[85,30,20,10],concept:"Great center fielders are always moving to back up throws, even on routine plays — that's how you prevent disaster.",anim:"advance"},
    {id:"cf5",title:"Go Back on the Deep Ball",diff:2,cat:"fielder",
      description:"You're in center field playing at normal depth. The batter crushes a towering fly ball that's hit well over your head toward the warning track. You need to turn and run. The ball is drifting slightly to your right.",
      situation:{inning:"Top 7",outs:2,count:"3-2",runners:[1,2],score:[5,5]},
      options:["Turn your body to the right, sprint back at an angle, and look for the ball over your right shoulder","Backpedal straight back while keeping your eyes on the ball the whole time","Turn completely around and sprint straight back, then look up at the last second","Drift back slowly while watching the ball so you don't lose it"],
      best:0,explanations:["Turning to the side the ball is drifting and sprinting at an angle is the fastest way to cover ground while still tracking the ball over your shoulder. This is textbook deep-ball technique.","Backpedaling is the slowest way to move backward. On a ball hit well over your head, you'll never catch up by going backward — you need to turn and run.","Sprinting straight back without looking risks running to the wrong spot. You need to peek over your shoulder to track the ball's flight and adjust your path.","Drifting slowly won't get you to a ball that's over your head. You need full speed immediately or the ball lands behind you for extra bases."],
      rates:[85,15,40,20],concept:"On balls over your head, drop-step to the side the ball is drifting, sprint at an angle, and track it over your shoulder.",anim:"catch"},
    {id:"cf6",title:"Direct the Outfield",diff:3,cat:"fielder",
      description:"You're the center fielder and the outfield captain. A pinch hitter comes up that nobody on your team has seen before. He's a right-handed batter in a tie game. Your left fielder is shading toward the line and your right fielder is playing straightaway. The scouting report on your lineup card says this hitter is a dead pull hitter.",
      situation:{inning:"Bot 8",outs:0,count:"0-0",runners:[2],score:[3,3]},
      options:["Wave the right fielder to shade toward the right field line and have the left fielder move toward center","Tell both outfielders to stay where they are since you don't know the hitter","Wave the left fielder closer to the left field line to protect against a hit down the line","Move yourself toward right-center but don't direct the other outfielders"],
      best:0,explanations:["A dead pull right-handed hitter drives the ball to left field and left-center. Moving RF toward the line and LF toward center creates an outfield shift that puts all three fielders where the ball is most likely to go. Great captainship!","Doing nothing wastes the scouting report you were given. The center fielder's job is to use information and position the outfield before each batter.","Moving LF toward the left field line leaves the biggest gap in left-center, exactly where a right-handed pull hitter drives the ball most. That's the opposite of what you want.","Moving yourself is good, but part of being outfield captain is directing all three outfielders. The team defense is only as good as its positioning."],
      rates:[85,30,10,45],concept:"The center fielder uses scouting reports and batter tendencies to position the entire outfield before each pitch.",anim:"catch"},
    {id:"cf7",title:"Relay Throw From the Gap",diff:3,cat:"fielder",
      description:"You're in center field. A line drive is hit into the left-center gap and rolls to the wall. The left fielder gets to the ball first. You see a runner from first base rounding third and heading home. The shortstop is running out to be the relay man.",
      situation:{inning:"Top 8",outs:1,count:"1-0",runners:[1],score:[6,5]},
      options:["Line up behind the shortstop and yell directions — 'Home! Home!' — so the relay throw goes to the plate","Run to the ball to help the left fielder field it","Stand at second base to take a throw from the left fielder","Run toward home plate to help the catcher"],
      best:0,explanations:["On relay plays, the center fielder lines up behind the relay man and yells where to throw. Your voice and positioning help the shortstop make an accurate relay throw home. This is your most important job on gap hits.","The left fielder already has the ball. Two outfielders at the wall means nobody is directing the relay, and the throw home will be late and inaccurate.","Standing at second base doesn't help when the play is at the plate. The batter's base doesn't matter right now — the run scoring does.","The catcher handles home plate. Your job is behind the relay man, giving directions and backing up in case the relay throw is off-line."],
      rates:[85,15,20,10],concept:"On relay plays, the center fielder lines up behind the cutoff man and calls out where to throw — you're the eyes of the relay.",anim:"throwHome"},
    {id:"cf8",title:"Shallow or Deep?",diff:1,cat:"fielder",
      description:"You're the center fielder. It's the bottom of the last inning and your team leads by one run. There's a runner on third with one out. A fly ball to you would tie the game on a sacrifice fly. The batter is a contact hitter who rarely hits deep fly balls.",
      situation:{inning:"Bot 7",outs:1,count:"0-0",runners:[3],score:[4,3]},
      options:["Play shallow to have a better chance of throwing the runner out at home on a sac fly","Play extra deep to make sure nothing gets over your head","Stay at normal depth since you don't want to change anything","Move to left-center because the runner is on third"],
      best:0,explanations:["Playing shallow gives you momentum going forward and a shorter throw home. With a contact hitter who doesn't hit deep, you can afford to come in. A strong throw might nail the runner at the plate and save the game.","Playing extra deep makes your throw home longer, almost guaranteeing the runner scores. Against a contact hitter who doesn't hit deep, there's no reason to play back.","Normal depth is okay, but with the game on the line and a runner on third, you should adjust. Good fielders change their positioning based on the situation.","Moving left or right doesn't help you throw the runner out at home. The issue is depth — how close or far from home plate you are."],
      rates:[80,20,40,15],concept:"In late-game situations with a runner on third, play shallow to give yourself a shorter throw home and a chance to save the run.",anim:"throwHome"},
  ],
  leftField: [
    {id:"f4",title:"Hit the Cutoff",diff:1,cat:"outfield",
      description:"You're in left. Single to you, runners on 1st and 2nd. Lead runner rounding 3rd.",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[1,2],score:[4,3]},
      options:["Throw home directly","Throw to 3rd","Throw to 2nd","Hit the cutoff man"],
      best:3,explanations:["A direct throw from left is long. If offline, everyone advances.","3rd isn't the priority — the run matters.","Throwing behind ignores the scoring runner.","The cutoff man can redirect to home or hold to prevent extras."],
      explSimple:["Throwing all the way home from left field is really far. If you miss, everyone moves up.","Third base isn't where the action is — the runner is going home!","Throwing to second ignores the runner trying to score.","Throw to the cutoff man! He's closer and can decide where the ball needs to go."],
      rates:[30,35,15,85],concept:"Always hit the cutoff man — he makes the best decision for the team",anim:"throwHome"},
    {id:"f9",title:"Ball in the Sun",diff:1,cat:"outfield",
      description:"High fly ball headed right into the sun. You lose sight of it.",
      situation:{inning:"Top 7",outs:2,count:"-",runners:[1],score:[3,2]},
      options:["Glove up to shade your eyes","Keep running where you think it's going","Stop and call for help","Drop to one knee"],
      best:0,explanations:["The glove-up technique is standard sun defense. Practice it every spring.","Running blind is how you misplay balls badly.","By the time help arrives, the ball has landed.","Kneeling doesn't solve the sun problem."],
      explSimple:["Hold your glove up to block the sun from your eyes. That way you can still see the ball!","Running without seeing where the ball is means you'll probably miss it.","If you stop and call for help, the ball will land before anyone gets there.","Dropping to your knee doesn't block the sun — you need your glove up high."],
      rates:[85,25,35,30],concept:"Use your glove to shade the sun — fundamental outfield technique",anim:"catch"},
    {id:"f23",title:"Hit the Cutoff Man",diff:1,cat:"outfield",
      description:"Top of the 5th, runner on 2nd, 1 out. Single to left field — the runner is rounding third heading home. You're the left fielder. The shortstop is your cutoff man.",
      situation:{inning:"Top 5",outs:1,count:"-",runners:[2],score:[2,3]},
      options:["Throw directly home — skip the cutoff","Hit the cutoff man with a strong, low throw","Hold the ball — the runner will score anyway","Throw to third to get the batter"],
      best:1,explanations:["Throwing over the cutoff man often results in a wild throw that bounces past the catcher. The runner scores AND the batter advances. Always hit the cutoff!","Hitting the cutoff man is fundamental outfield play. A strong throw to the cutoff gives your team options — the cutoff can relay home, cut it off if the runner stops, or redirect to another base. It's the smart play every time.","Giving up before making a play is never the right answer. Make a throw and let the cutoff man decide.","The batter is your secondary concern. Stop the run from scoring first, then worry about the batter."],
      rates:[30,85,10,20],concept:"Always hit the cutoff man — it gives your team the most options and prevents wild throws",anim:"throwHome"},
    {id:"f28",title:"Runner Trying to Score from First on a Double",diff:2,cat:"outfield",
      description:"Bot 5th, runner on 1st, nobody out, down 3-2. Ball bounces off the left field wall — it's a double. Runner from first is trying to score all the way from first base.",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[1],score:[2,3]},
      options:["Throw home — he started from first, it's a long run","Hit the relay man lined up between you and home","Throw to third — stop the batter from getting to third","Hold the ball — the runner will score anyway"],
      best:1,explanations:["A throw from the left field wall to home is 350+ feet. Even if you have a cannon arm, that throw bounces 3 times and arrives too late.","The relay man is your best friend on balls off the wall. He should be positioned between you and home. Fire a strong, chest-high throw to him. He catches and fires home. This is how runners get thrown out from the outfield — through relay throws, not one long heave.","The run scoring is more important than holding the batter at second. Stop the run first.","Never give up on a play. Even if the runner probably scores, a strong relay throw can save a run."],
      rates:[25,85,20,10],concept:"On doubles off the wall, the relay throw is essential — no arm is strong enough to throw 350 feet accurately",anim:"throwHome"},
    {id:"f29",title:"Ball Off the Wall — Play It Quick",diff:2,cat:"outfield",
      description:"Top of the 8th, nobody on, 1 out, up 5-4. Ball slices toward the left field corner and hits the wall. You're the left fielder — the ball caroms off at an angle.",
      situation:{inning:"Top 8",outs:1,count:"-",runners:[],score:[5,4]},
      options:["Chase the ball and play the carom off the wall","Wait for the ball to settle on the ground","Sprint to the ball but be cautious of the wall","Let the center fielder back you up and play it"],
      best:0,explanations:["Play the carom! When a ball hits the wall, read the angle it bounces and position yourself to field it quickly. Getting the ball back to the infield fast is the difference between holding the batter to a double or letting him reach third.","Waiting for the ball to settle lets the runner take an extra base. Every second counts.","Being cautious of the wall is important for safety, but you should know where the wall is before the ball is hit. Attack the carom.","Waiting for backup wastes time. You're the closest player — play it yourself and get the ball back in."],
      rates:[85,15,55,25],concept:"Play the carom off the wall quickly — reading the angle and fielding fast prevents extra bases",anim:"hit"},
    {id:"f54",title:"Line Drive Sinking — Dive or Play It Safe?",diff:2,cat:"outfield",
      description:"Top of the 7th, runner on 1st, 2 outs, up 4-3. Line drive sinking in front of you in left field. If you dive and catch it, the inning is over. If you miss, the ball rolls past you.",
      situation:{inning:"Top 7",outs:2,count:"-",runners:[1],score:[4,3]},
      options:["Dive for it — catch it and end the inning","Play it on a hop — keep the damage to a single","Slide feet-first to catch it low","Let it bounce and field it quickly"],
      best:0,explanations:["With 2 outs and a lead, dive for it! If you catch it, the inning is over. If you miss, the worst case is the ball gets past you and the tying run scores. But with 2 outs, you want to end the inning NOW. The risk of diving is worth the reward of ending the threat.","Playing it on a hop concedes a single and keeps the inning alive with the tying run at the plate.","Sliding feet-first in the outfield is not a standard technique for catching a sinking liner.","Letting it bounce guarantees a base hit and extends the inning. End it here."],
      rates:[85,40,15,25],concept:"With 2 outs and a lead, dive for sinking liners — ending the inning is worth the risk",anim:"catch"},
    {id:"f57",title:"Wind Blowing Out — Play Deeper",diff:3,cat:"outfield",
      description:"Bot 5th, nobody on, tied 2-2. The wind is blowing hard toward the outfield today — straight out. A routine fly ball in the 2nd inning carried 20 feet farther than expected.",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[],score:[2,2]},
      options:["Play deeper than normal — give yourself more room","Play normal depth — adjust on each ball","Play shallow — the wind won't affect line drives","It doesn't matter — just react to each ball"],
      best:0,explanations:["When the wind is blowing out, play 10-15 feet deeper than normal. Fly balls will carry farther, and balls that would normally be warning track fly outs become home runs or extra-base hits if you're playing too shallow. Depth is your friend with the wind at your back.","Adjusting on each ball means you're constantly behind. Set your depth before the pitch.","Playing shallow is the OPPOSITE of what you should do. Wind blowing out means balls carry — give yourself room.","It absolutely matters. A ball you would normally catch at the warning track now sails over the fence if you're too shallow."],
      rates:[85,35,10,20],concept:"When the wind blows out, play deeper — fly balls carry farther and you need the extra room",anim:"catch"},
    {id:"lf1",title:"Hit the Cutoff",diff:1,cat:"fielder",
      description:"You're the left fielder. Bottom of the 4th, runner on second, one out. The batter singles to your left. You field it cleanly about 20 feet from the foul line. The runner is rounding third and heading home. Your shortstop is lined up as the cutoff man.",
      situation:{inning:"Bot 4",outs:1,count:"0-2",runners:[2],score:[3,1]},
      options:["Throw a strong one-hopper to the cutoff man's chest","Throw it directly to home plate, skipping the cutoff","Throw it to third base to keep the batter from advancing","Hold the ball and jog it in"],
      best:0,explanations:["Hitting the cutoff man gives your team options — he can let it go through to the plate or redirect it. A one-hopper to his chest is a throw he can handle cleanly.","Trying to skip the cutoff from deep left field often leads to wild throws that miss everyone. Even strong arms should use the relay to keep throws accurate.","Throwing to third ignores the runner scoring. The priority is always the lead runner, and right now he's heading home.","Holding the ball lets the runner score easily and the batter take extra bases. You must get the ball in quickly."],
      rates:[88,30,15,10],concept:"Always hit the cutoff man — it keeps your throw accurate and gives your team options on where to send the ball.",anim:"throwHome"},
    {id:"lf2",title:"Ball Off the Wall",diff:2,cat:"fielder",
      description:"You're in left field. Top of the 6th, runner on first, no outs. The batter drives a ball to the left field corner. It hits the wall and caroms back at a sharp angle toward center field. You're running toward the corner to play the bounce.",
      situation:{inning:"Top 6",outs:0,count:"1-0",runners:[1],score:[2,2]},
      options:["Round the ball so your momentum carries toward the infield as you field it","Run straight to the ball, pick it up, then spin and throw","Let the ball come to you off the wall and wait for it to settle","Call for the center fielder to get it since it bounced toward him"],
      best:0,explanations:["Rounding the ball lets you field it with your momentum already going toward the infield. You save a full second compared to fielding and spinning, which can be the difference between the runner being safe or out.","Running straight at the ball means you have to stop, field, spin 180 degrees, then throw. That wasted motion gives runners extra bases.","Waiting for the ball to settle is way too passive. Every second you wait, runners are advancing. Attack the ball off the wall.","The ball is in your territory — calling off to the center fielder creates confusion and delays. You're closer and it's your wall to play."],
      rates:[85,40,15,20],concept:"Round the ball off the wall so your momentum is already heading toward the infield — never field and spin.",anim:"catch"},
    {id:"lf3",title:"Shallow Fly Communication",diff:1,cat:"fielder",
      description:"You're the left fielder. Bottom of the 3rd, nobody on, two outs. The batter hits a soft fly ball that's dropping into short left field. You're running in hard, and you can see the shortstop backpedaling toward the same spot. You're going to get there at the same moment.",
      situation:{inning:"Bot 3",outs:2,count:"0-0",runners:[],score:[1,0]},
      options:["Call 'I got it!' loudly and early so the shortstop peels off","Stay quiet and let the shortstop take it since he's an infielder","Both go for it and whoever gets there first catches it","Pull up and let the shortstop have it — infielders have priority on shallow flies"],
      best:0,explanations:["As the outfielder coming in, you have the ball in front of you the whole way. You have the better angle and can see it clearly. Call it loud and early so the shortstop knows to peel off.","Staying quiet causes collisions. Communication is the number one rule on fly balls between infielders and outfielders.","Both going for it without talking is how players get hurt. Collisions between fielders are one of the most dangerous plays in baseball.","Actually, on balls in between, the outfielder has priority because they're running in and can see the ball better. The shortstop is running with his back to the infield, making it a harder catch."],
      rates:[88,15,10,40],concept:"Outfielders have priority on shallow flies because they're running forward with the ball in front of them — call it loud and early.",anim:"catch"},
    {id:"lf4",title:"Back Up Third",diff:1,cat:"fielder",
      description:"You're in left field. Top of the 5th, runner on first, no outs. The batter hits a ground ball to second base. The second baseman fields it and throws to the shortstop at second for the force out. The shortstop now throws to first for the double play. Where should you be?",
      situation:{inning:"Top 5",outs:0,count:"1-1",runners:[1],score:[3,3]},
      options:["Backing up third base in case of an overthrow from the outfield later","Stay in your normal left field position — the play is on the infield","Move toward the infield to back up any throw to third base","Back up second base in case the throw from the shortstop is wild"],
      best:2,explanations:["You're thinking ahead, but the immediate play might involve a throw to third if the double play doesn't turn. Moving toward third to back up is the smart positioning right now.","Standing in your normal spot means you're too far away to help if a throw gets away. Left fielders should always be moving toward a backup position on ground balls.","Correct! On ground balls with a runner on first, the left fielder backs up third base. If the throw from second goes wild, or if a runner advances to third, you're there to prevent extra bases.","Second base is the center fielder's backup responsibility, not yours. As the left fielder, third base is your backup assignment."],
      rates:[55,10,85,20],concept:"On ground balls, the left fielder always moves to back up third base — every throw needs a backup behind it.",anim:"groundout"},
    {id:"lf5",title:"Two Runners Moving",diff:3,cat:"fielder",
      description:"You're the left fielder. Bottom of the 7th, runners on first and second, one out, tie game. The batter singles hard into left field. The runner from second is scoring easily. The runner from first is rounding second and heading to third. The batter is taking a wide turn at first.",
      situation:{inning:"Bot 7",outs:1,count:"2-0",runners:[1,2],score:[3,3]},
      options:["Throw to third base to try to get the runner coming from first","Throw home to try to get the runner scoring from second","Hit the cutoff man and let him decide where to throw","Throw to second base to get the batter trying to stretch it"],
      best:2,explanations:["The runner from first has a huge head start to third. By the time you field and throw, he's likely safe. You might also throw it away and let the batter advance.","The runner from second is scoring easily — there's no play at home. Throwing there wastes your time and lets other runners advance.","With multiple runners moving, hitting the cutoff man is the smartest play. He can see all the runners and redirect the throw to wherever the best play is. This prevents wild throws.","The batter is just rounding first. Throwing behind him to second is a low-value play when you have a runner going to third. Get the ball to the cutoff."],
      rates:[30,10,85,20],concept:"With multiple runners moving, always hit the cutoff man — he can see the whole field and redirect to the best play.",anim:"throwHome"},
    {id:"lf6",title:"Reading Off the Bat",diff:2,cat:"fielder",
      description:"You're in left field. Top of the 1st, nobody on, no outs. A right-handed batter swings and you hear a loud crack. The ball comes off the bat high in the air, hooking toward you. Your first step will determine if you catch it or it drops.",
      situation:{inning:"Top 1",outs:0,count:"2-1",runners:[],score:[0,0]},
      options:["Take a drop step back and to your right, then read the ball in the air","Take a step forward to charge the ball","Stand still and watch the trajectory for a moment before moving","Break hard toward center field since right-handed hitters usually pull"],
      best:0,explanations:["A drop step back opens your hips and lets you cover ground quickly. A high fly ball hooking toward left from a right-hander usually carries more than you think. Getting back first is safer — you can always come in.","Charging forward on a high fly ball is dangerous. If it carries over your head, you can't recover. It's much easier to come in on a ball than to go back.","Standing still wastes your best reaction time. Your first step in the first half-second determines whether you reach the ball. Read and react immediately.","Breaking toward center ignores where the ball actually is — it's hooking toward you in left, not going to center. React to the ball, not a guess about the hitter."],
      rates:[85,20,30,15],concept:"On fly balls, your first step determines everything — a drop step back gives you time to read the carry and adjust.",anim:"flyout"},
    {id:"lf7",title:"Sun in Your Eyes",diff:3,cat:"fielder",
      description:"You're the left fielder. Bottom of the 2nd in an afternoon game. The sun is low and directly in your eyes when you look toward home plate. A high fly ball is hit your way and you immediately lose it in the sun. You know it's somewhere above you.",
      situation:{inning:"Bot 2",outs:0,count:"1-0",runners:[],score:[0,0]},
      options:["Use your glove to shade the sun while tracking the ball","Turn your head sideways and try to pick up the ball's shadow on the grass","Put your sunglasses down, shift your head to find the ball out of the sun's glare, and get under it","Close your eyes and put your glove up where you think it will land"],
      best:2,explanations:["Using your glove to shade works and is a solid backup technique. Every outfielder should know the glove-shield method — raise your glove to block the sun while tracking the ball. If you don't have sunglasses, this is your go-to move.","Looking for the ball's shadow is creative but unreliable — shadows shift depending on the sun angle and the grass, and it doesn't help you judge the ball's height.","Dropping your sunglasses, shifting your angle to find the ball outside the sun's glare, and repositioning is the best technique when you have sunglasses. But the glove-shield is a strong backup — use both together if needed.","Closing your eyes and guessing is never a good idea. The ball could hit you in the face. You need to find a way to track it."],
      rates:[70,15,85,10],concept:"In the sun, use sunglasses AND the glove-shield technique — sunglasses are primary, glove-up is your always-available backup.",anim:"flyout"},
    {id:"lf8",title:"Dive or Play Safe",diff:3,cat:"fielder",
      description:"You're in left field. Top of the 8th, your team leads 6-3. Runner on first, two outs. The batter hits a sinking line drive to your left. You can probably catch it with a full dive, but if you miss, the ball rolls to the wall and at least one run scores — maybe two.",
      situation:{inning:"Top 8",outs:2,count:"0-1",runners:[1],score:[6,3]},
      options:["Play it safe on a hop — keep the ball in front of you and hold the runner to second","Dive for the catch — with two outs, the inning is over if you catch it","Sprint and try a sliding catch to stay in control","Dive but angle your body so if you miss, the ball stays in front of you"],
      best:0,explanations:["With a 3-run lead in the 8th and two outs, playing it safe is the percentage play. If the ball gets past you, you turn a 3-run lead into a 1-run game. Keeping it in front means runners on first and second with two outs — your pitcher can get the next guy.","A diving catch ends the inning, but if you miss, the ball rolls to the wall and suddenly it's a one-run game. The risk isn't worth the reward when you're protecting a lead.","A sliding catch sounds controlled, but on a sinking liner to your side, a slide is hard to execute. If you misjudge it, you're on the ground and the ball is rolling away.","Angling your dive is good in theory, but it's very hard to control where your body goes mid-dive. If you're going to play it safe, commit to playing it safe."],
      rates:[82,30,35,40],concept:"With a comfortable lead and two outs, play it safe — keeping the ball in front of you protects your lead better than a risky dive.",anim:"catch"},
  ],
  firstBase: [
    {id:"f5",title:"First Base Fundamentals",diff:1,cat:"infield",
      description:"You're at 1st. Grounder to the shortstop, nobody on. What do you do BEFORE the throw?",
      situation:{inning:"Bot 4",outs:0,count:"-",runners:[],score:[1,0]},
      options:["Get to the bag and give a target","Move toward the ball","Stay back from the bag","Cover home"],
      best:0,explanations:["Get to the bag, face the thrower, stretch toward the ball. Textbook.","SS has it. Your job is to receive the throw at the bag.","Staying back means you can't stretch for offline throws.","Nobody on base — no need to cover home."],
      explSimple:["Get to the base, look at the person throwing, and stretch toward the ball. That's how first basemen do it!","The shortstop has the ball — your job is to be at the base ready to catch the throw.","If you stand too far from the base, you can't stretch to catch bad throws.","There's no one on base, so you don't need to go to home plate."],
      rates:[90,20,40,5],concept:"First baseman: get to the bag early, face the thrower, stretch toward the throw",anim:"catch"},
    {id:"f21",title:"First Baseman's DP — Bases Loaded",diff:3,cat:"infield",
      description:"Top of the 4th, bases loaded, 1 out, down 4-2. You're the first baseman. Hard ground ball hit right at you, 15 feet from the bag.",
      situation:{inning:"Top 4",outs:1,count:"-",runners:[1,2,3],score:[2,4]},
      options:["Step on first, throw home for the double play","Step on first, throw to second for the double play","Throw home first, then cover first after","Step on first — one out is enough"],
      best:0,explanations:["With bases loaded, step on first (that's out #2), then fire home where the catcher steps on home plate for the force out (out #3 if he hasn't scored). This is the 3-2 double play — two outs AND you prevent a run.","Throwing to second after stepping on first gets two outs but lets the runner from 3rd score.","Throwing home first requires the catcher to step on the plate for a force. Stepping on first is the easy first out, then throw home.","One out is never enough when you can get two. With bases loaded and you near the bag, the double play is right there."],
      rates:[85,45,30,20],concept:"Bases loaded, ball hit to the first baseman — step on first, then throw home to prevent the run",anim:"doubleplay"},
    {id:"f32",title:"Let It Through or Cut It Off?",diff:3,cat:"outfield",
      description:"Bot 8th, runner on 2nd, 1 out, up 6-5. Single to right. Runner from 2nd is heading home. You're the cutoff man. The throw from right field is coming — the runner is going to be close at home.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[2],score:[6,5]},
      options:["Let the throw go through to home — it's on line","Cut it off — the throw is off-line and won't get there","Listen for the catcher's call — he can see the play","Catch it and throw to third to get the batter"],
      best:2,explanations:["You can't see the runner and the throw at the same time. Letting it through when it's off-line means it gets past the catcher.","Cutting it off when it's on-line means the runner scores for free. You need more information.","The catcher can see the runner AND the throw. He'll yell 'Cut!' if the throw is off-line or the runner has already scored, or 'Let it go!' if the throw is on-target. Listen to your catcher — he's the quarterback of the defense.","Getting the batter at third is secondary to preventing the tying run from scoring."],
      rates:[35,35,85,20],concept:"As the cutoff man, listen to the catcher — he can see the play and tells you to cut or let it go",anim:"throwHome"},
    {id:"f46",title:"Pull Hitter — Shade or Stay?",diff:2,cat:"positioning",
      description:"Top of the 6th, nobody on, 2 outs, up 4-2. A left-handed pull hitter steps in. He's hit every ball to the right side today — 3 ground balls to second and first.",
      situation:{inning:"Top 6",outs:2,count:"-",runners:[],score:[4,2]},
      options:["Shade the whole infield toward the right side","Play straight up — he might adjust","Only shade the second baseman","Shift the shortstop all the way to the right side"],
      best:0,explanations:["When a hitter pulls everything, shade your infield toward the pull side. Move the second baseman toward first, the shortstop toward second, and the first baseman closer to the line. You're positioning where the ball is most likely to go based on the data you have.","Playing straight up ignores three at-bats of evidence. Use the information!","Only shading one player is a half-measure. Move the whole infield together.","A full shift with the shortstop on the right side is too extreme for most situations. Shading is enough."],
      rates:[85,25,35,30],concept:"Against pull hitters, shade the infield toward the pull side — position where the ball is going",anim:"groundout"},
    {id:"f59",title:"Pop-Up Between Three Players",diff:1,cat:"communication",
      description:"Bot 3rd, nobody on, 1 out. Pop-up hit between the pitcher, catcher, and first baseman. All three are drifting toward it. Nobody has called it.",
      situation:{inning:"Bot 3",outs:1,count:"-",runners:[],score:[2,1]},
      options:["Someone needs to call it NOW — first baseman has priority","The pitcher should catch it — he's closest","The catcher should call it — he sees the whole field","Wait and see who gets there first"],
      best:0,explanations:["On pop-ups in the infield, there's a priority system: the fielder behind the play has priority because the ball is moving toward them (easier catch). The first baseman has priority over the pitcher, and the pitcher has priority over the catcher. Someone MUST call 'I got it!' — the worst outcome is nobody calling it.","The pitcher should defer to the first baseman, who is a better fielder and has the ball coming toward him.","The catcher CAN call it, but the first baseman has priority on pop-ups in front of home plate.","Waiting is how easy pop-ups drop for hits. Someone must take charge immediately."],
      rates:[85,35,30,5],concept:"On pop-ups, the priority is: infielder behind the play > pitcher > catcher. CALL IT!",anim:"catch"},
    {id:"f62",title:"Bunt Defense — Who Covers What?",diff:3,cat:"communication",
      description:"Top of the 3rd, runners on 1st and 2nd, nobody out. Bunt is expected. Your team calls the bunt defense. Who covers what?",
      situation:{inning:"Top 3",outs:0,count:"-",runners:[1,2],score:[1,1]},
      options:["1B and 3B charge, SS covers 3rd, 2B covers 1st, pitcher fields near the mound","Everyone holds their position and reacts","1B charges, 3B holds, pitcher covers the bunt area","Only the pitcher and catcher handle the bunt"],
      best:0,explanations:["Standard bunt defense with runners on 1st and 2nd: the first baseman and third baseman charge toward home as the pitch is delivered. The shortstop breaks to cover third base. The second baseman breaks to cover first base. The pitcher is ready to field the bunt and throw to the base where the lead runner is going. Everyone has a job.","Holding position means slow reaction time. The bunt dies before anyone gets to it.","Only the 1B charging leaves the third base line bunt uncovered if the 3B holds.","The pitcher and catcher alone can't cover all the bases. The whole infield must shift."],
      rates:[85,10,30,15],concept:"Bunt defense is a team play — corners charge, SS covers 3rd, 2B covers 1st, pitcher fields",anim:"bunt"},
    {id:"1b1",title:"Holding the Runner On",diff:1,cat:"fielder",
      description:"You're the first baseman. There's a speedy runner on first with one out. The pitcher is in the stretch position and looking back at the runner. The runner is taking a big lead — almost four steps off the bag.",
      situation:{inning:"Top 5",outs:1,count:"1-0",runners:[1],score:[2,1]},
      options:["Stay on the bag with your foot touching it and give the pitcher a target with your glove for the pickoff throw","Play behind the runner in case the batter hits a ground ball to the right side","Cheat toward second base to get a head start on covering the hole between first and second","Bluff like you're going to the bag, then back off to play deep for a ground ball"],
      best:0,explanations:["Exactly right! With a fast runner taking a big lead, you need to hold him on the bag. Keep your foot on first and show the pitcher your glove as a target. This keeps the runner honest and close to the base.","Playing behind the runner means he can extend his lead even more, making a stolen base almost automatic. Your job right now is to keep that runner close to first base.","Cheating toward second leaves first base uncovered. If the pitcher tries a pickoff throw, no one is there to catch it and the runner advances easily — or even scores.","Bluffing can work sometimes, but with an aggressive runner already taking four steps, you need to be ON the bag. A bluff won't hold this runner — only your physical presence on the base will."],
      rates:[90,25,20,35],concept:"With a fast runner on first, the first baseman's primary job is to hold the runner on by staying on the bag and giving the pitcher a pickoff target.",anim:"safe"},
    {id:"1b2",title:"Scooping a Short-Hop Throw",diff:2,cat:"fielder",
      description:"You're the first baseman. Routine ground ball to shortstop, runner sprinting down the line. The shortstop's throw is low — it's going to bounce about three feet in front of you. The runner is fast and it'll be close.",
      situation:{inning:"Top 3",outs:0,count:"0-0",runners:[],score:[1,1]},
      options:["Keep your foot on the bag, stretch toward the throw, and scoop it by keeping your glove low with the pocket facing up","Pull your foot off the bag and catch the ball cleanly with two hands, then try to tag the runner","Stay upright on the bag and try to catch the ball chest-high after it bounces up","Move off the bag entirely to block the ball like a hockey goalie"],
      best:0,explanations:["Textbook first baseman play! Keep your foot on the base for the force out, stretch toward the throw to catch it sooner, and scoop with your glove low and open. Great first basemen save errors by picking these short hops every day.","If you pull your foot off the bag, it's not a force out anymore. You'd have to tag the runner, and he's already sprinting past you. Keep your foot on the bag — that's the whole point of a force play at first.","Short-hop throws don't bounce up to chest height at first base — they stay low. Waiting for a big hop means the ball scoots under your glove or past you. Get down to where the ball is.","Leaving the bag means no out even if you stop the ball. First base is all about keeping your foot on the bag while making the catch. That's what makes the position special."],
      rates:[88,30,20,15],concept:"First basemen save infielders' errors by scooping short hops — keep your foot on the bag, stretch toward the throw, and get your glove down low.",anim:"groundout"},
    {id:"1b3",title:"Fielding a Bunt as the First Baseman",diff:1,cat:"fielder",
      description:"You're at first base. Runner on first, no outs, and the batter squares to bunt. The pitch is bunted hard right at you, about 20 feet down the first base line. The second baseman is sprinting to cover first.",
      situation:{inning:"Bot 4",outs:0,count:"1-0",runners:[1],score:[0,0]},
      options:["Charge the ball, field it, and throw to second base to get the lead runner if you have time","Charge the ball, field it, and flip to the second baseman covering first for the sure out","Let the pitcher field it since bunts are always the pitcher's job","Field the ball and run to first base yourself to get the easy out"],
      best:1,explanations:["Going to second for the lead runner sounds great, but the ball was bunted hard right at you — by the time you field it, the runner from first has already gotten a good jump. The safe play is to get the sure out at first.","Smart play! The ball is right in front of you, so you can field it quickly. The second baseman is covering first, so flip it to him for the guaranteed out. Getting the sure out prevents a big inning.","Bunts are NOT always the pitcher's job. When a bunt comes right at the first baseman, you field it. The pitcher covers his zone, and you cover yours. This one is yours all the way.","Running to first yourself takes too long and you might not beat the batter. The second baseman is already sprinting to cover first — flip it to him for a much faster out."],
      rates:[40,85,10,25],concept:"On bunt plays, the first baseman fields balls in his zone and flips to the second baseman covering first for the sure out.",anim:"bunt"},
    {id:"1b4",title:"Cover First or Play the Ball?",diff:3,cat:"fielder",
      description:"You're the first baseman. Runner on second, one out. The batter hits a sharp ground ball right in the hole between you and second base — about 15 feet to your right. The pitcher is breaking toward first base to cover. The second baseman is also moving toward the ball.",
      situation:{inning:"Top 6",outs:1,count:"0-0",runners:[2],score:[3,2]},
      options:["Let the second baseman field it — sprint back to first base so someone is there to take the throw","Go after the ball yourself since you're closer, and let the pitcher cover first","Freeze and see what happens — wait to see if the second baseman or pitcher gets to it first","Go after the ball and then try to beat the runner back to first base yourself"],
      best:0,explanations:["This is the right call! When the ball is in the hole, the second baseman has a better angle to field it and throw to first. Your job is to get back to the bag so there's someone to receive the throw. If nobody's on first, the out is impossible.","You might be closer, but the second baseman has a much better throwing angle to first base from that position. If you field it, you have to spin and throw across your body or run to the bag yourself — both are harder plays.","Freezing is the worst thing a first baseman can do. Every ground ball requires an instant decision — either go get the ball or get back to the bag. Hesitation means nobody covers first and the runner is safe.","You cannot field a ball 15 feet to your right and then beat a sprinting batter back to first base. Even the fastest first baseman can't outrun a thrown ball. Get to the bag and let your teammate make the throw."],
      rates:[88,40,10,20],concept:"First basemen must decide instantly: go after the ball or get back to the bag. When the second baseman has a better angle, get to first and be the target.",anim:"groundout"},
    {id:"1b5",title:"Cutoff Positioning on a Single to Right",diff:1,cat:"fielder",
      description:"You're the first baseman. Runner on second base, and the batter singles to right field. The runner is rounding third and heading home. The right fielder picks up the ball and is ready to throw. You need to get in the cutoff position.",
      situation:{inning:"Bot 5",outs:1,count:"0-0",runners:[2],score:[2,3]},
      options:["Line up between the right fielder and home plate, about 45 feet from home, with your arms up so the fielder can see you","Run to home plate to back up the catcher in case the throw gets past him","Stay at first base in case the batter tries to stretch his single into a double","Move halfway between first and second base to cover the cutoff from right-center field"],
      best:0,explanations:["Perfect cutoff positioning! Line up between the outfielder and home plate so the throw comes right through you. Arms up so the fielder can see your target. You can cut the throw and redirect it or let it go through to the catcher.","Backing up the catcher sounds helpful, but who's going to cut the throw off? If the throw is offline or the catcher has no play, nobody is there to redirect the ball. The cutoff man is the most important player on this play.","Staying at first base ignores the bigger play — a run is about to score! The batter advancing to second doesn't matter as much as cutting down the runner at home. Cutoff plays save runs.","The cutoff position for a throw from right field to home plate is between the fielder and home, not between first and second. You need to be in a straight line from the right fielder to the catcher."],
      rates:[85,25,20,15],concept:"On throws to home from right field, the first baseman is the cutoff man — line up between the fielder and home plate with your arms raised.",anim:"throwHome"},
    {id:"1b6",title:"Turning the 3-6-3 Double Play",diff:3,cat:"fielder",
      description:"You're the first baseman. Runner on first, one out, ground ball hit right at you. The runner is going on the pitch. You field the ball cleanly about eight feet in front of the bag. The shortstop is covering second base.",
      situation:{inning:"Top 7",outs:1,count:"0-1",runners:[1],score:[4,4]},
      options:["Throw to the shortstop at second base for the force out, then sprint back to first and get ready for the return throw","Tag first base yourself first, then throw to second to try to get the runner","Hold the ball and just tag first base for the one sure out","Throw to second base and let the pitcher cover first for the return throw"],
      best:0,explanations:["That's the 3-6-3 double play! Throw to the shortstop at second for the first out, then hustle back to the bag for the return throw from the shortstop. It's one of the hardest double plays in baseball, but it ends the inning in a tie game.","Tagging first base first removes the force at second — without the force, it becomes a TAG play, which is fundamentally harder. The shortstop now has to tag the runner instead of just touching the base. Get the lead runner first while the force is still on.","One out is okay, but in a tie game in the 7th inning, a double play ends the inning and keeps the score tied. You have a chance for two outs — take it.","The pitcher covering first is less reliable than you getting back to the bag yourself. The 3-6-3 is your play to make — you know where the bag is and you're the best at receiving throws at first base."],
      rates:[85,30,40,35],concept:"The 3-6-3 double play requires quick feet — throw to the shortstop at second, then sprint back to first for the return throw.",anim:"doubleplay"},
    {id:"1b7",title:"Foul Ball Communication Near First",diff:1,cat:"fielder",
      description:"You're at first base. The batter pops a foul ball high in the air between first base and the dugout on the home team side. The second baseman is running over, the pitcher is drifting toward the area, and the ball is drifting toward the stands.",
      situation:{inning:"Top 2",outs:0,count:"1-2",runners:[],score:[0,0]},
      options:["Call 'I got it! I got it!' loudly and wave off your teammates since you have the best angle as the first baseman","Let the second baseman take it since he's running toward the ball","Wait to see who gets there first and then the closest player catches it","Stay quiet and just try to catch it without saying anything"],
      best:0,explanations:["Take charge! Foul balls on the first base side are your territory. You're closest to the stands, you know how much room you have, and you face these pop-ups all the time. Call it loud and clear so nobody crashes into each other.","The second baseman is running a longer distance and doesn't know how close the stands are. The first baseman plays near the dugout every day and knows exactly how much room is available. This is your ball.","Waiting to see who gets there first causes collisions. Somebody has to call for the ball EARLY so the other players can get out of the way. Hesitation leads to dropped balls and banged-up teammates.","Never try to catch a fly ball silently! Without calling it, two or three players might converge on the same spot. Collisions cause injuries and dropped balls. Always communicate — be loud and be early."],
      rates:[90,35,15,10],concept:"On foul balls near your position, call it loudly and early — communication prevents collisions and dropped balls.",anim:"catch"},
    {id:"1b8",title:"First-and-Third Pickoff Play",diff:3,cat:"fielder",
      description:"You're the first baseman. Runners on first and third, one out. The runner on first takes off for second base on the pitch. Your catcher catches the ball and fires a throw to second base — but it's actually a designed play where the shortstop will cut the throw and look at third.",
      situation:{inning:"Top 8",outs:1,count:"1-1",runners:[1,3],score:[5,4]},
      options:["Sprint to cover home plate in case the runner on third tries to score during the chaos of the play","Stay near first base in case the throw from the shortstop comes back to you for a pickoff on the runner retreating","Get behind the mound to back up any throw that goes to second base or back to the pitcher","Run toward the runner going to second to get in a rundown between first and second"],
      best:1,explanations:["The catcher covers home plate — that's his position. If you leave first base to go home, nobody is covering first and you create a gap the offense can exploit. Stay at your position and trust your catcher.","Smart positioning! In a first-and-third situation, the shortstop might cut the throw and fire back to first if the runner on first hesitates or retreats. If you're on the bag, you can catch the throw and get a surprise out.","Backing up behind the mound takes you away from first base, which is your responsibility. Every player has a specific job on this play, and yours is to stay at first base ready for a possible return throw.","Running toward the baserunner creates confusion and leaves first base completely uncovered. Rundowns are for when the ball is already in play between two fielders — let the middle infielders handle this."],
      rates:[20,88,25,15],concept:"In first-and-third pickoff plays, the first baseman must stay on the bag — the throw might come right back to you for a surprise out.",anim:"safe"},
  ],
  rightField: [
    {id:"f7",title:"Shallow Fly Tag-Up",diff:2,cat:"outfield",
      description:"You're in right. Runner on 3rd, 1 out. Shallow fly — you catch it. Runner tags up.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[3],score:[2,3]},
      options:["Throw home immediately","Throw to cutoff","Hold — too shallow","Throw to 2nd"],
      best:0,explanations:["Shallow = you're CLOSE to home. Direct throw has your best shot.","Cutoff relay adds time on a short throw.","Being shallow means you're CLOSER. Best chance ever.","Nobody is running to 2nd."],
      explSimple:["You caught the ball close to home plate — throw it right home because you're not far away!","Using a cutoff man takes extra time when you're already close enough to throw home yourself.","You're close to home plate! That means you have a great chance to throw the runner out.","Nobody is running to second base, so there's no reason to throw there."],
      rates:[85,50,20,10],concept:"On shallow fly balls, throw directly home — the short distance is your advantage",anim:"throwHome"},
    {id:"f11",title:"Backing Up Bases",diff:1,cat:"positioning",
      description:"You're in right field. Grounder to shortstop, runner on 2nd going to 3rd. Where should you go?",
      situation:{inning:"Top 3",outs:1,count:"-",runners:[2],score:[1,1]},
      options:["Stay in position","Back up 1st base","Back up 3rd base","Back up home"],
      best:1,explanations:["Staying in position means you can't help if there's an overthrow.","Correct! Right fielder backs up throws to 1st. If the ball gets away, you're there.","Left fielder backs up 3rd, not right fielder.","Catcher covers home."],
      explSimple:["Don't just stand there! Run to back up the throw in case someone misses it.","Right! Go stand behind first base in case the throw gets past the first baseman.","The left fielder backs up third base, not you. You back up first base.","The catcher is already at home plate — that's not where you need to go."],
      rates:[20,85,30,15],concept:"Always back up the base where the throw is going — anticipate overthrows",anim:"catch"},
    {id:"f25",title:"Who Backs Up the Throw?",diff:1,cat:"outfield",
      description:"Top of the 3rd, runner on 1st, nobody out. Ground ball to the shortstop — he's throwing to first. You're the right fielder. What should you be doing?",
      situation:{inning:"Top 3",outs:0,count:"-",runners:[1],score:[1,0]},
      options:["Stand and watch — it's an infield play","Back up first base","Run toward the infield to help","Back up second base"],
      best:1,explanations:["Standing and watching is lazy outfield play. Every outfielder has a backup responsibility on every play.","The right fielder backs up throws to first base. If the throw gets past the first baseman, you're there to keep the runner from advancing. This prevents one error from becoming two bases.","Running toward the infield gets you too close. You need to be behind first base at a distance.","The throw is going to first, not second. Back up the base where the throw is going."],
      rates:[10,85,15,25],concept:"Right fielders back up first base on infield grounders — prevent one error from becoming two bases",anim:"catch"},
    {id:"f26",title:"Runner Rounding Second Hard",diff:2,cat:"outfield",
      description:"Bot 4th, runner on 1st, nobody out, down 2-1. Clean single to right field. The runner from first is rounding second hard — the first base coach is waving him to third.",
      situation:{inning:"Bot 4",outs:0,count:"-",runners:[1],score:[1,2]},
      options:["Throw to third — cut him down","Hit the cutoff man and let him redirect","Throw home in case he tries to score","Hold the ball — he's already at third"],
      best:1,explanations:["Throwing directly to third from right field is a long throw that's likely to sail. If it gets past the third baseman, the runner scores.","Hit the cutoff man! On a single to right with a runner going first to third, your job is to throw a strong, low throw to the cutoff. He can redirect to third if there's a play, or hold it to prevent the batter from advancing. The cutoff creates options.","Throwing home when the runner is only going to third wastes a throw and lets the batter advance.","Holding the ball lets runners take extra bases for free. Always make a throw."],
      rates:[35,85,15,20],concept:"On singles to right with runners advancing, hit the cutoff — he can redirect to the right base",anim:"throwHome"},
    {id:"f55",title:"Fly Ball in the Sun",diff:1,cat:"outfield",
      description:"Bot 4th, nobody on, 1 out. Fly ball hit to right field — you look up and the sun is directly in your eyes. You lost the ball!",
      situation:{inning:"Bot 4",outs:1,count:"-",runners:[],score:[2,1]},
      options:["Use your glove as a sun shield — put it up to block the sun","Close your eyes and guess where it'll land","Call off and let someone else catch it","Drop your head and pick up the ball below the sun"],
      best:0,explanations:["Use your glove to shield the sun! Raise your glove above your eyes to block the sun while keeping your other eye on the ball. This is the classic sun-fly technique that every outfielder learns. You can track the ball in the shadow your glove creates.","Never close your eyes in the outfield. You'll get hit in the face.","Calling off wastes time. Use the glove-shield technique to track the ball yourself.","Dropping your head means you lose the ball completely. Keep your head up and use the glove to block the sun."],
      rates:[85,5,30,25],concept:"On fly balls in the sun, use your glove as a sun shield — raise it to block the sun while tracking the ball",anim:"catch"},
    {id:"f56",title:"Communication Between Outfielders",diff:2,cat:"communication",
      description:"Top of the 3rd, nobody on. Ball hit to the gap in right-center. Both you (RF) and the center fielder are sprinting for it. You're both close.",
      situation:{inning:"Top 3",outs:1,count:"-",runners:[],score:[1,0]},
      options:["Call 'I got it!' loudly and clearly","Don't call it — whoever gets there first catches it","Wave your glove so the CF sees you","Call 'Mine!' and keep running — he'll get out of the way"],
      best:0,explanations:["CALL IT! Yell 'I got it!' or 'Mine!' loudly and clearly. If the center fielder also calls it, defer to him — he has priority. If he doesn't call it, it's yours. Communication prevents collisions and dropped balls. The call must be LOUD — a stadium is noisy.","Not calling it guarantees confusion and possibly a collision. Always communicate.","Waving your glove takes your hand off the catch. Use your voice, not your glove.","'Mine!' works, but you should also listen for the CF's call. If he calls it, peel off."],
      rates:[85,5,20,35],concept:"On fly balls between fielders, CALL IT loudly — communication prevents collisions and errors",anim:"catch"},
    {id:"f58",title:"Ball at the Wall — Make the Play or Protect Yourself?",diff:3,cat:"outfield",
      description:"Top of the 9th, runner on 1st, 2 outs, up 5-4. Deep fly ball to the warning track. You're sprinting back and feel the warning track under your feet. The ball is catchable but you'll hit the wall.",
      situation:{inning:"Top 9",outs:2,count:"-",runners:[1],score:[5,4]},
      options:["Make the catch — win the game, worry about the wall later","Pull up — your safety comes first","Reach up and try to time the catch before impact","Feel the wall with your hand, then make the catch"],
      best:3,explanations:["Crashing into the wall without awareness is how outfielders get seriously hurt. Be smart.","Pulling up lets the ball drop and the game might be lost. There's a better way.","Reaching up blindly might work, but you could hit the wall face-first.","Feel the warning track, then find the wall with your non-glove hand. Reach up with your glove hand for the catch while bracing yourself against the wall with your other hand. This is the technique all great outfielders use — it lets you make the catch while protecting yourself from the full impact of the wall."],
      rates:[30,20,35,85],concept:"At the wall, use your free hand to find and brace against it while catching with your glove hand",anim:"catch"},
    {id:"rf1",title:"Gun Down at Third",diff:2,cat:"fielder",
      description:"You're the right fielder. A sharp single is hit to right field. The runner on first base is rounding second hard and trying to advance to third. You field the ball cleanly on one hop. You have a strong arm and third base is open.",
      situation:{inning:"Top 4",outs:1,count:"2-2",runners:[1],score:[2,1]},
      options:["Fire a strong throw to third base on a line to try to nail the runner","Throw to second base to keep the batter from advancing","Hold the ball and jog it back in to the cutoff man","Throw home in case the runner doesn't stop at third"],
      best:0,explanations:["You have a clean field and a strong arm. Throwing to third base to get the advancing runner is the high-value play. Getting an out here stops a runner from reaching scoring position.","Throwing to second lets the runner take third base for free. The batter already has a single — the dangerous runner is the one heading to third.","Holding the ball and jogging it in is playing too safe. You have a chance to get an out, and that's always worth taking when you field the ball cleanly.","The runner is going to third, not home. Throwing home wastes your arm and lets the runner take third easily while accomplishing nothing."],
      rates:[85,30,15,10],concept:"Right fielders with strong arms can keep runners from going first-to-third — that throw takes away a scoring-position runner.",anim:"catch"},
    {id:"rf2",title:"Stop First-to-Third",diff:1,cat:"fielder",
      description:"You're in right field. A ground ball single comes through the infield and rolls toward you. There's a runner on first base who is a fast runner. Your coach always says the right fielder's most important job is preventing first-to-third advances.",
      situation:{inning:"Bot 5",outs:0,count:"1-1",runners:[1],score:[3,3]},
      options:["Charge the ball aggressively to field it quickly and throw to third base","Hang back and wait for the ball to come to you, then throw to second","Let the ball roll to you while watching the runner","Throw to first base to make sure the batter doesn't take second"],
      best:0,explanations:["Charging the ball cuts down the time the runner has to advance. Getting to the ball fast and making a quick throw to third gives you the best chance to cut down the runner or at least hold him at second.","Hanging back lets the runner round second and cruise into third easily. Every extra second the ball is on the ground is an extra step for the runner.","Watching the runner instead of attacking the ball is passive play. By the time the ball reaches you, the runner is standing on third.","Throwing to first doesn't help since the batter already has a single. The critical play is stopping the lead runner from taking third."],
      rates:[85,30,15,10],concept:"Charge ground ball singles aggressively in right field — every second you save keeps runners from going first-to-third.",anim:"catch"},
    {id:"rf3",title:"Hit the Cutoff Man",diff:1,cat:"fielder",
      description:"You're the right fielder. A deep fly ball drops in front of the warning track for a hit. A runner is scoring from second base. You pick up the ball 320 feet from home plate. The second baseman is set up as your cutoff man about 150 feet from you. Your arm can reach home on the fly from 250 feet but not from 320.",
      situation:{inning:"Top 6",outs:1,count:"0-2",runners:[2],score:[1,2]},
      options:["Throw a hard one-hop throw to the cutoff man so he can relay it home","Air-mail a throw toward home plate even though you can't reach it","Run the ball in closer before throwing so you can reach home","Throw to third base instead to keep the batter from advancing"],
      best:0,explanations:["Hitting the cutoff man with a strong throw gives your team the best chance. The relay can reach home faster than you can throw it there, and the cutoff man can redirect the throw if needed.","Throwing a rainbow toward home that bounces multiple times gives the runner an easy score and lets the batter take extra bases. A throw you can't reach is a wasted throw.","Running the ball in takes too long. The runner scores easily while you're jogging forward, and now the batter advances too.","Throwing to third ignores the runner scoring. The run matters more than the batter's position, and the cutoff man can redirect to third anyway if needed."],
      rates:[85,15,20,35],concept:"When you can't reach home on the fly, always hit your cutoff man — a good relay is faster than a bad long throw.",anim:"throwHome"},
    {id:"rf4",title:"Playing the Wall",diff:2,cat:"fielder",
      description:"You're the right fielder. A hard line drive is hit down the right field line toward the corner. The ball is going to hit the wall. You need to play the carom. Your coach taught you that balls hitting the wall straight-on bounce straight back, but balls hitting the corner angle toward center field.",
      situation:{inning:"Bot 3",outs:0,count:"1-0",runners:[1],score:[0,1]},
      options:["Angle your run toward center field side of the corner to play the carom off the wall","Run straight at where the ball will hit the wall and wait for it","Run to the corner and put your back against the wall to trap the ball","Stay where you are and let the ball bounce back to you"],
      best:0,explanations:["The ball hitting the corner will angle back toward center field. By running to where the carom will end up instead of where the ball hits, you save precious seconds and field the ball much quicker.","Running straight at the wall means the carom bounces past you toward center field. You'll have to spin around and chase it, giving the runners extra time to advance.","Putting your back against the wall is dangerous and the ball will bounce off the wall well before it reaches you, caroming away toward center field.","Staying where you are means the ball bounces around in the corner while runners circle the bases. You need to attack the ball, not wait for it."],
      rates:[85,35,15,10],concept:"Learn how balls carom off the wall — corner hits angle toward center field, so position yourself where the bounce will go, not where the ball hits.",anim:"catch"},
    {id:"rf5",title:"Shallow Fly Communication",diff:1,cat:"fielder",
      description:"You're in right field. A soft fly ball is hit to shallow right field. The second baseman is drifting back and you're charging in. You can see the second baseman is going to have to make an over-the-shoulder catch, while you're coming straight in with the ball in front of you.",
      situation:{inning:"Top 2",outs:0,count:"0-1",runners:[1,2],score:[1,0]},
      options:["Call 'I got it!' loudly and keep charging — the ball is in front of you for an easier catch","Stay quiet and let the second baseman take it since he's closer","Call off the second baseman but then slow down and let it drop","Call for the infielder to take it since infielders have priority on pop flies"],
      best:0,explanations:["An outfielder coming in has the ball in front of them and more momentum for a throw. Outfielders have priority over infielders on balls they can reach. Call it loud and clear to avoid a collision!","Staying quiet with two fielders converging is how collisions happen. Someone must call for the ball, and the outfielder has the better angle coming forward.","Calling for the ball and then slowing down could cause the ball to drop for a hit with runners on base. If you call it, commit to making the catch.","Infielders have priority on infield pop-ups, but on balls in the shallow outfield, the outfielder has priority because they're running forward with the ball in front of them."],
      rates:[85,20,10,30],concept:"Outfielders have priority over infielders on fly balls because running in is easier than running out with the ball over your shoulder.",anim:"catch"},
    {id:"rf6",title:"Back Up First Base",diff:1,cat:"fielder",
      description:"You're the right fielder. A ground ball is hit to the shortstop with nobody on base and one out. The shortstop fields it and throws to first base. You know your coach always says right fielders should back up first base on infield grounders.",
      situation:{inning:"Bot 1",outs:1,count:"0-0",runners:[],score:[0,0]},
      options:["Sprint toward the area behind first base in foul territory to back up the throw","Stay in right field and watch the play since it's a routine grounder","Run toward second base to cover in case of an error","Move toward center field to back up a possible overthrow there"],
      best:0,explanations:["Backing up first base is one of the right fielder's most important responsibilities. If the throw gets past the first baseman, you're there to keep the ball from rolling to the fence and the batter from taking extra bases.","Watching from right field means an overthrow rolls all the way to the fence. That turns a routine out into a runner on second or third. Never stand and watch!","Second base doesn't need coverage on this play. The throw is going to first, so that's where the backup needs to be.","An overthrow at first goes into foul territory on the right side, not toward center field. You need to be behind first base, not in center."],
      rates:[90,20,15,10],concept:"The right fielder backs up first base on every infield grounder — it's a routine responsibility that prevents disaster on overthrows.",anim:"advance"},
    {id:"rf7",title:"Charge or Play It Safe",diff:2,cat:"fielder",
      description:"You're in right field. A hard ground ball single gets through the infield into right field. There's a runner on second base who's rounding third. The ball is bouncing toward you with good speed. If you charge hard, you might bobble it but will have a shorter throw. If you play it safe, you'll field it cleanly but the throw will be longer.",
      situation:{inning:"Top 7",outs:2,count:"1-2",runners:[2],score:[5,4]},
      options:["Charge hard and field the ball aggressively to make the shorter throw home","Hang back, field it cleanly, then make a long throw home","Charge hard but throw to second base instead of home","Let the ball come to you and throw to the cutoff man"],
      best:0,explanations:["With two outs in a one-run game, you need to be aggressive. Charging the ball saves time and shortens the throw home. A clean aggressive play gives you the best chance to throw out the tying run at the plate.","Playing it safe means a longer throw home, and the runner scores easily. In a close game with two outs, the safe play lets the tying run score without a contest.","Throwing to second base concedes the run at home. With two outs in a one-run game, the only throw that matters is to home plate.","Letting the ball come to you and throwing to the cutoff is fine when the run doesn't matter, but this is the tying run with two outs. You need to be aggressive and try to make the play at the plate."],
      rates:[80,35,15,30],concept:"In close games with two outs, charge the ball aggressively — saving a half-second on your throw can be the difference between an out and a run scoring.",anim:"throwHome"},
    {id:"rf8",title:"Throw Through or Hit Cutoff",diff:3,cat:"fielder",
      description:"You're the right fielder. A line drive single comes right at you and you field it on one clean hop. The runner on first is rounding second. You're playing at medium depth, about 280 feet from home. Your arm is decent but not elite — you can reach third on the fly from here but home would require a bounce. The first base coach is waving the runner to third.",
      situation:{inning:"Bot 5",outs:0,count:"2-1",runners:[1],score:[2,2]},
      options:["Hit the cutoff man with a strong throw so the relay can go to third or home","Try to throw all the way home on one bounce in case the runner goes","Throw directly to third base to try to get the runner","Hold the ball since the runner is going to make it to third anyway"],
      best:0,explanations:["Hitting the cutoff man gives your team options. The relay man can throw to third if the runner stops, or redirect home if the runner rounds too far. A good cutoff throw keeps all your options alive.","Throwing home on a bounce from 280 feet will be too slow and the ball could bounce away from the catcher. Meanwhile, if the runner stops at third, your throw to home accomplishes nothing.","You might get the runner at third, but a throw that misses goes into the dugout and the runner scores. Hitting the cutoff is safer and the relay can still get him at third.","Holding the ball gives the runner a free base and possibly lets him round third. Always make a strong throw to keep the pressure on the baserunner."],
      rates:[80,25,40,15],concept:"When in doubt, hit the cutoff man — it keeps every option alive and prevents the throw from becoming an error that gives up extra bases.",anim:"throwHome"},
  ],
  thirdBase: [
    {id:"f6",title:"Bunt Against the Shift",diff:3,cat:"positioning",
      description:"You're 3B, shifted right vs a lefty pull hitter. He squares to bunt down the 3B line!",
      situation:{inning:"Top 3",outs:0,count:"1-0",runners:[1],score:[0,0]},
      options:["Sprint back to 3B position","Stay in the shift","Yell for the pitcher","Charge from where you are"],
      best:0,explanations:["React and get back! Don't let a bunt beat the shift.","Staying in the shift with a bunt coming gives a free base hit.","Pitcher coverage is limited. YOU make this play.","Charging from the wrong side — you won't get there."],
      rates:[80,10,30,25],concept:"Always adjust positioning when the batter shows bunt",anim:"catch"},
    {id:"f8",title:"Wheel Play",diff:3,cat:"plays",
      description:"You're 3B. Runner on 1st, 0 outs. Batter bunts. Coach called a wheel play — SS covers 3rd.",
      situation:{inning:"Top 4",outs:0,count:"0-0",runners:[1],score:[1,0]},
      options:["Charge hard (no plan)","Hold position","Charge, throw to 1st","Charge, spin-throw to 3rd"],
      best:3,explanations:["Charging without a throw target wastes time.","Holding lets the bunt die.","1st gets 1 out but lead runner advances to scoring position.","On a wheel play, charge and throw to 3rd. Getting the lead runner is worth more."],
      rates:[40,15,50,85],concept:"On bunt defense, getting the lead runner is more valuable than the sure out",anim:"throwHome"},
    {id:"f15",title:"Runner on Second — Check Before Throwing",diff:1,cat:"infield",
      description:"Top of the 5th, runner on 2nd, 1 out, down 2-1. You're the third baseman. Ground ball hit to you. But the runner on 2nd is edging toward third.",
      situation:{inning:"Top 5",outs:1,count:"-",runners:[2],score:[1,2]},
      options:["Throw to first — get the sure out","Throw to third to tag the runner","Look the runner back to 2nd, then throw to first","Hold the ball and chase the runner"],
      best:2,explanations:["Throwing to first without checking the runner could let him advance to third — then he scores on anything.","There's no force at third, so you'd need to tag him. He's probably not committed yet.","Smart! Glance at the runner first. If he's going, throw to the shortstop covering third. If he's staying, throw to first. This quick look takes half a second but prevents a free base.","Chasing a runner starts a rundown that gives the batter time to reach base. Make a throw instead."],
      rates:[50,25,85,10],concept:"With a runner on 2nd, look him back before throwing to first — don't give a free base",anim:"groundout"},
    {id:"f19",title:"Slow Roller — Eat It or Throw?",diff:1,cat:"infield",
      description:"Top of the 8th, nobody on, 2 outs, up 2-1. You're the third baseman. Slow roller — you charge in and barehand it, but the batter is fast and almost to first.",
      situation:{inning:"Top 8",outs:2,count:"-",runners:[],score:[2,1]},
      options:["Throw it anyway — you might get him","Eat the ball — don't risk an overthrow","Flip it underhand to first","Sprint toward first and throw on the run"],
      best:1,explanations:["A rushed throw from deep in the grass is the #1 cause of throwing errors. If the batter is almost at first, a wild throw puts him in scoring position.","Smart! If you don't have a clean throw, hold the ball. An error with 2 outs and a 1-run lead could let the tying run reach scoring position. A single is much less dangerous than a runner on 2nd or 3rd from an error.","An underhand flip from the third base side doesn't have the arm strength to reach first.","Throwing on the run from deep grass is one of the hardest throws in baseball. If the batter is almost there, the risk isn't worth it."],
      rates:[25,85,20,30],concept:"If you don't have a clean throw, eat the ball — an error is worse than a single",anim:"safe"},
    {id:"f45",title:"Bunt Situation — Where to Move",diff:1,cat:"positioning",
      description:"Bot 5th, runner on 1st, nobody out, tied 3-3. The #8 hitter is up — he's almost certainly going to bunt. You're the third baseman. Where should you play?",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[1],score:[3,3]},
      options:["Charge in aggressively — be ready to field the bunt","Play normal depth — react after the ball is bunted","Halfway in — compromise between bunt and swing","Stay deep and let the pitcher field it"],
      best:0,explanations:["When you KNOW a bunt is coming, charge aggressively as the pitcher delivers. The third baseman crashing in on a bunt gives you the best angle to field it and throw to second for the force on the lead runner. Don't wait — attack the bunt.","Normal depth means the bunt dies before you get to it. The runner advances for free.","Halfway is better than deep but not as good as a full crash. When you're confident of the bunt, commit.","The pitcher can field some bunts, but the third baseman crashing has a better angle for the throw to second."],
      rates:[85,15,45,25],concept:"When you know a bunt is coming, crash in aggressively — field it and throw to second for the force",anim:"bunt"},
    {id:"f49",title:"No Outs, Known Bunter — Stay or Crash?",diff:3,cat:"positioning",
      description:"Bot 4th, runner on 1st, nobody out, tied 2-2. A known bunter steps in. Your first baseman is holding the runner. You're the third baseman. How do you play?",
      situation:{inning:"Bot 4",outs:0,count:"-",runners:[1],score:[2,2]},
      options:["Crash in on every pitch — be ready for the bunt","Play in but wait to see if he actually shows bunt","Play normal depth — he might slash instead","Crash in but only after the pitcher starts his motion"],
      best:3,explanations:["Crashing on every pitch means you're out of position if he swings away. Be smart about when you crash.","Waiting to see the bunt show means you're late charging in. You need to commit.","Playing normal depth against a known bunter means the bunt dies before you reach it.","Crash in as the pitcher starts his delivery. If the batter shows bunt, you're already charging and can field it quickly to get the lead runner at second. If he pulls the bat back and swings, you're caught in no-man's land — but that's a risk worth taking against a known bunter. Time your crash with the pitch."],
      rates:[40,35,20,85],concept:"Against known bunters, crash in as the pitcher delivers — time your charge with the pitch",anim:"bunt"},
    {id:"f50",title:"Power Hitter — Deep or Guard the Line?",diff:3,cat:"positioning",
      description:"Top of the 9th, nobody on, 2 outs, up 5-4. Their power hitter steps in — he's a right-handed pull hitter. You're the third baseman.",
      situation:{inning:"Top 9",outs:2,count:"-",runners:[],score:[5,4]},
      options:["Guard the line — a double down the line extends the inning","Play normal — he might go the other way","Shade toward the hole — most ground balls go to short","Play deep — give yourself more reaction time"],
      best:0,explanations:["In the 9th with a lead and 2 outs, guard the line. A double down the third base line puts the tying run in scoring position. A single through the normal hole keeps him at first — less dangerous. You'd rather give up a single than a double in this situation.","A power hitter who pulls the ball is not likely to go the other way. Use the data.","Shading toward the hole ignores the line — a double down the line is the most dangerous hit.","Playing deep against a power hitter is fine for range, but the LINE is the priority in the 9th."],
      rates:[85,25,30,35],concept:"In the 9th with a lead, guard the line — a double is more dangerous than a single",anim:"catch"},
    {id:"3b1",title:"Bunt Charge",diff:1,cat:"fielder",
      description:"You're the third baseman. Bottom of the 6th, runner on first, one out. The batter squares to bunt and drops it about 15 feet in front of home plate. The ball is rolling slowly toward you on the grass.",
      situation:{inning:"Bot 6",outs:1,count:"1-0",runners:[1],score:[4,3]},
      options:["Charge hard, field with bare hand, throw to first","Wait for it to come to you, field with glove, throw to first","Charge hard, field with glove, throw to second for the lead runner","Let the catcher handle it and cover third"],
      best:0,explanations:["Charging aggressively and bare-handing the slow roller lets you get rid of the ball quickly for the out at first. This is the textbook third baseman play on a bunt.","Waiting lets the batter reach safely. On slow rollers you must attack the ball, not let it come to you.","Trying for the lead runner at second is the ideal play if you can execute it — getting the lead runner is always better. But after charging forward on a bunt, you've lost momentum toward second, making it a very tough throw.","The catcher has to come too far out — this is clearly in your zone. Letting it go means the batter reaches easily."],
      rates:[88,25,45,10],concept:"On bunts, the third baseman charges aggressively and bare-hands when needed to get the out at first.",anim:"bunt"},
    {id:"3b2",title:"Bare-Hand Roller",diff:2,cat:"fielder",
      description:"You're at third base. Top of the 3rd, nobody on, two outs. The batter chops a slow roller that dies on the infield grass about 20 feet from you. It's barely moving and the batter is fast — he's already halfway to first.",
      situation:{inning:"Top 3",outs:2,count:"0-1",runners:[],score:[1,1]},
      options:["Sprint in, bare-hand the ball, and make a strong throw across the diamond","Run in, field it with your glove, transfer to throwing hand, then throw","Charge in and try to backhand flip it to the shortstop covering","Hold your position and wait for the ball to reach you"],
      best:0,explanations:["With a fast runner and a dying roller, bare-handing lets you skip the glove transfer and fire to first in one motion. Every split second counts on the long throw across the diamond.","Fielding with the glove adds a transfer step. On a ball this slow with a fast runner, that extra half-second often means the runner beats the throw.","There's no reason for the shortstop to be involved — the play is to first base. A flip to short just adds a relay and wastes time.","Waiting means the runner reaches first easily. On slow rollers at third, you must come get it."],
      rates:[82,50,15,10],concept:"On dying rollers, bare-handing saves the glove transfer time needed to beat fast runners on the long throw to first.",anim:"groundout"},
    {id:"3b3",title:"Long Throw Mechanics",diff:2,cat:"fielder",
      description:"You're the third baseman. Bottom of the 4th, one out, no runners on. A hard grounder is hit right at you and you field it cleanly. You're about 120 feet from first base — the longest infield throw on the diamond. The batter is an average-speed runner.",
      situation:{inning:"Bot 4",outs:1,count:"2-2",runners:[],score:[0,0]},
      options:["Crow-hop toward first to build momentum, then throw overhand with your body behind it","Stand still and rifle it from where you fielded it to save time","Throw sidearm to get it there faster","Lob it high so the first baseman has time to adjust"],
      best:0,explanations:["The crow-hop builds momentum for the long throw across the diamond. Using your body and an overhand release gives you accuracy and carry. This is how third basemen are taught to make this throw.","Standing still means you're throwing with only arm strength from 120 feet. Without body momentum, the throw tails or bounces, and you risk a throwing error.","Sidearm throws from third base tend to tail away from the first baseman, especially on long throws. Save sidearm for short-range plays.","A lob takes too long in the air and gives the runner extra steps. Even average runners will beat a rainbow throw from third."],
      rates:[85,35,30,15],concept:"The crow-hop builds momentum for the long throw across the diamond — your body generates the power, not just your arm.",anim:"groundout"},
    {id:"3b4",title:"Guard the Line",diff:1,cat:"fielder",
      description:"You're at third base. Top of the 8th, your team leads 3-2. Runner on first, one out. The coach signals you to guard the line. The batter is a left-handed pull hitter who has hit two doubles down the line tonight.",
      situation:{inning:"Top 8",outs:1,count:"0-0",runners:[1],score:[3,2]},
      options:["Move two steps closer to the foul line and shade toward the bag","Stay in your normal position — you can react to anything","Cheat toward the shortstop hole to take away the ground ball up the middle","Move in closer to home plate for a potential bunt"],
      best:0,explanations:["In late innings with a lead, preventing extra-base hits is the priority. Shading the line takes away the double down the line from a known pull hitter. A single through the hole hurts less than a double.","Your normal position leaves the line exposed against a proven pull hitter. In a close late-inning game, a double could tie or win it for the other team.","Shading toward the middle leaves the line wide open for the left-handed pull hitter. You're giving him exactly what he wants.","There's no bunt situation here with one out and a runner on first in a one-run game. The hitter is looking to drive the ball, not bunt."],
      rates:[85,40,20,12],concept:"In late innings with a lead, guard the line to prevent extra-base hits — a single hurts less than a double.",anim:"catch"},
    {id:"3b5",title:"Tag Play at Third",diff:1,cat:"fielder",
      description:"You're the third baseman. Bottom of the 5th, runner on second, no outs. The batter hits a single to right field. The runner rounds third hard but the right fielder comes up throwing. You receive the throw right as the runner is sliding back to the bag.",
      situation:{inning:"Bot 5",outs:0,count:"1-1",runners:[2],score:[2,5]},
      options:["Catch the ball and sweep a quick tag down low in front of the bag","Catch the ball and tag the runner on the chest as he slides","Catch the ball, hold it up to show the umpire, then tag","Catch the ball and block the bag with your foot"],
      best:0,explanations:["A quick sweep tag low and in front of the bag is the fastest way to apply the tag on a sliding runner. You meet him before he reaches the base, giving the umpire a clear look.","Tagging the chest on a sliding runner is awkward — the runner is low to the ground and sliding feet-first. You're more likely to miss or apply a slow tag.","Holding the ball up wastes precious time. The runner is sliding NOW — tag first, celebrate later.","Blocking the bag with your foot without the ball in your glove isn't a tag. You could also get hurt in a collision. You need ball-in-glove touching the runner."],
      rates:[88,35,15,10],concept:"On tag plays, sweep the glove low in front of the bag to meet the sliding runner before he reaches the base.",anim:"catch"},
    {id:"3b6",title:"Hot Corner Rocket",diff:3,cat:"fielder",
      description:"You're the third baseman. Top of the 7th, tie game, runners on first and second, one out. The cleanup hitter smashes a one-hop rocket right at you. The ball is hit so hard you barely have time to react. You knock it down but it rolls a few feet to your right.",
      situation:{inning:"Top 7",outs:1,count:"3-1",runners:[1,2],score:[4,4]},
      options:["Pick it up and step on third for the force out","Pick it up and throw to second to start a double play","Pick it up and throw to first for the sure out","Hold the ball — with runners moving you might throw it away"],
      best:0,explanations:["Stepping on third base for the force out is the smart play. It's the closest base, you don't need a throw, and you get the lead runner. With two outs, it changes the whole at-bat for the next hitter.","After knocking a ball down and scrambling, a throw to second for a double play is extremely difficult. You'll likely rush it and throw it into center field.","Throwing to first after a knockdown means a long throw while off-balance. With runners moving, an error puts the go-ahead run in scoring position or worse.","Holding the ball with bases loaded and one out lets everyone advance safely. The tying and go-ahead runs both move up. You need to get an out."],
      rates:[82,25,35,12],concept:"After knocking down a hard shot, look for the closest force out — stepping on the bag beats a risky throw every time.",anim:"groundout"},
    {id:"3b7",title:"Foul Ball Near Dugout",diff:1,cat:"fielder",
      description:"You're at third base. Bottom of the 2nd, nobody on, one out. The batter pops up a high foul ball drifting toward the third base dugout. You're tracking it well, but it's carrying closer to the dugout railing. The dugout steps are about three feet away.",
      situation:{inning:"Bot 2",outs:1,count:"1-2",runners:[],score:[0,1]},
      options:["Track the ball but pull up if you get within one step of the dugout — player safety comes first","Sprint full speed, reach over the railing, and try to make the spectacular catch","Call off your teammates and catch it, planting your feet well before the dugout edge","Ignore it and let the catcher handle all foul pops"],
      best:2,explanations:["Pulling up too early gives away a free out. You should know your surroundings and catch the ball as long as you can plant safely before the dugout.","Reaching over the railing is dangerous — you can tumble into the dugout and get seriously injured. No single out is worth an injury.","Calling the ball, tracking it, and planting your feet safely while still being far enough from the dugout is the smart play. You get the out without risking injury.","Foul pops near third base are the third baseman's ball. The catcher has to spin around and fight his mask. You have a much better angle."],
      rates:[45,15,85,10],concept:"On foul pops, know your surroundings — catch the ball confidently, but never blindly run into the dugout.",anim:"catch"},
    {id:"3b8",title:"Cutoff From Left",diff:3,cat:"fielder",
      description:"You're the third baseman. Top of the 9th, your team leads 5-4. Runner on second, one out. The batter singles to left field. The runner rounds third heading home. The left fielder throws it in, and you're the cutoff man positioned between third and home.",
      situation:{inning:"Top 9",outs:1,count:"2-1",runners:[2],score:[5,4]},
      options:["Let the throw go through to the catcher — the play is at home","Cut it off and throw home because the throw is offline","Cut it off and look to get the batter who rounded first too far","Check the runner at home, and if the throw is on line, let it go through; if not, cut and redirect"],
      best:3,explanations:["Automatically letting it go through is risky — if the throw is offline, it gets past the catcher and the tying run scores easily. You need to read the throw first.","Automatically cutting every throw takes away plays at the plate when the outfielder's throw is right on target. You should read it first.","Looking to get the batter at first sounds smart, but with the tying run heading home in the 9th, the priority is always the lead runner. Letting the batter take second is fine if you get the out at home.","As the cutoff man, your job is to read the throw. If it's on line and has a chance, let it through. If it's off target, cut it and redirect to give the catcher a better throw or hold the ball. This is the most advanced cutoff decision."],
      rates:[35,40,20,85],concept:"The cutoff man reads the throw — let accurate throws go through, cut off bad ones and redirect to give your team the best chance.",anim:"throwHome"},
  ],
  baserunner: [
    {id:"r1",title:"Stealing Second",diff:1,cat:"stealing",
      description:"You're on 1st, 2-1 count. Pitcher is slow to the plate, catcher has a weak arm. You've got speed.",
      situation:{inning:"Top 6",outs:0,count:"2-1",runners:[1],score:[2,3]},
      options:["Go! Steal on the next pitch","Wait for a better count","Stay — let the batter work","Take a bigger lead but don't go"],
      best:0,explanations:["Perfect conditions: slow pitcher, weak catcher, hitter's count. MLB runners succeed 85%+ here.","You might not get a better spot. All signs point to GO.","Too passive when everything favors you.","Indecisive! If you take a bigger lead, the pitcher throws over."],
      explSimple:["Everything is perfect — the pitcher is slow and the catcher can't throw well. Go steal that base!","This is the best time to steal. Don't wait for a better chance because this IS the best chance.","Just standing there wastes your speed. Everything says it's time to run!","Taking a bigger lead without running just makes the pitcher throw to first base."],
      rates:[85,60,30,40],concept:"Steal when conditions align: slow pitcher, weak catcher, hitter's count",anim:"steal"},
    {id:"r2",title:"Tag Up Deep Fly",diff:1,cat:"tagging",
      description:"You're on 3rd, 1 out. Deep fly to center. Routine catch. Tie game, 8th inning.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[3],score:[3,3]},
      options:["Tag up and score after the catch","Go halfway","Stay on 3rd","Break for home immediately"],
      best:0,explanations:["Deep fly, 1 out — textbook tag up. The throw from deep center is long.","Halfway on a routine catch = can't score from there.","A deep fly with 1 out? That's your chance for the go-ahead run.","Leaving early = out on appeal. Wait for the catch!"],
      explSimple:["Wait on third base until the outfielder catches it, then run home! The throw is really far so you'll make it.","Going only halfway means you can't score. You need to stay on the base and then run after the catch.","This is a great chance to score! Tag up and run home after the catch.","Don't leave the base early — wait for the catch first, or the other team can get you out."],
      rates:[90,25,20,5],concept:"Always tag up on deep fly balls from 3rd with less than 2 outs",anim:"score"},
    {id:"r3",title:"Ball in the Dirt",diff:1,cat:"baserunning",
      description:"You're on 1st, 2 outs. Batter swings and misses, pitch bounces away from catcher.",
      situation:{inning:"Top 5",outs:2,count:"2-2",runners:[1],score:[1,2]},
      options:["Sprint to 2nd!","Wait for the catcher","Stay at 1st","Only go if it hits backstop"],
      best:0,explanations:["Run! With 2 outs, go on anything in the dirt. Catcher has to find, pick up, and throw.","Hesitation kills. By the time you decide, the catcher has recovered.","Having 2 outs makes advancing MORE important.","Any ball away from the catcher is your chance."],
      explSimple:["Run! The ball bounced away from the catcher, so go to second base right now!","If you wait too long, the catcher will pick up the ball and you'll miss your chance.","With two outs, moving to the next base is super important because any hit could score you.","Whenever the ball gets away from the catcher, that's your chance to run."],
      rates:[85,25,15,45],concept:"With 2 outs, always advance on balls in the dirt",anim:"steal"},
    {id:"r4",title:"First-to-Third",diff:2,cat:"baserunning",
      description:"You're on 1st, 1 out. Clean single to right. Right fielder has a strong arm.",
      situation:{inning:"Bot 4",outs:1,count:"-",runners:[1],score:[2,2]},
      options:["Round 2nd and read the coach","Sprint to 3rd no matter what","Stop at 2nd","Watch the throw first"],
      best:0,explanations:["Round 2nd aggressively and trust your 3rd base coach. He sees everything.","Running blind into a strong arm gets you thrown out.","Too conservative. At 3rd you score on a sac fly or wild pitch.","By the time you watch the throw, it's too late."],
      explSimple:["Run hard around second and look at your third base coach. He'll tell you to keep going or stop!","Don't just run without looking — the right fielder has a strong arm and could throw you out.","Stopping at second is too safe. If you get to third, you can score way more easily.","Don't look at the ball yourself — by the time you see the throw, it's too late. Trust your coach!"],
      rates:[85,25,40,35],concept:"Round bases aggressively and trust your 3rd base coach",anim:"advance"},
    {id:"r5",title:"Delayed Steal",diff:3,cat:"stealing",
      description:"You're on 2nd. Middle infielders aren't covering the bag. Catcher lazily throwing back to pitcher.",
      situation:{inning:"Top 3",outs:1,count:"1-1",runners:[2],score:[0,0]},
      options:["Go! Break when catcher throws back","Don't — stealing 3rd is too risky","Wait for a passed ball","Only go on the coach's signal"],
      best:0,explanations:["Nobody covers, catcher isn't paying attention. Baseball IQ beats speed here.","Normally risky, but nobody is covering. Risk drops dramatically.","Waiting is passive. CREATE the opportunity.","Smart runners see opportunities the coach might miss."],
      rates:[85,30,25,45],concept:"The delayed steal exploits defensive inattention — awareness over pure speed",anim:"steal"},
    {id:"r6",title:"Two Outs, Run on Contact",diff:1,cat:"baserunning",
      description:"You're on 2nd, 2 outs. Sharp grounder to SS — tough play, he has to charge it.",
      situation:{inning:"Bot 6",outs:2,count:"-",runners:[2],score:[3,4]},
      options:["Sprint home!","Wait to see if SS fields it","Go halfway","Stay at 2nd"],
      best:0,explanations:["Run! With 2 outs, always run on contact. SS has a tough play AND has to throw to 1st.","Waiting loses the advantage. Go!","Halfway with 2 outs makes no sense.","NEVER assume a routine play with 2 outs."],
      explSimple:["Run home as fast as you can! With two outs, you always run when the ball is hit on the ground.","Waiting to see what happens wastes time. Just go!","Going only halfway makes no sense with two outs — you need to run all the way.","Don't just stand there! With two outs, always run when the ball is hit."],
      rates:[90,20,30,10],concept:"With 2 outs, ALWAYS run on contact — nothing to lose",anim:"score"},
    {id:"r7",title:"Reading the Pitcher",diff:3,cat:"stealing",
      description:"You notice the pitcher's shoulder dips before a pickoff but stays level when going home. You're on 1st.",
      situation:{inning:"Top 5",outs:0,count:"1-1",runners:[1],score:[1,1]},
      options:["Use the tell — go when shoulder stays level","Ignore it, might be a decoy","Share with dugout but don't go","Wait for the steal sign"],
      best:0,explanations:["Reading a pitcher's tell gives you a massive jump. The best base stealers do this.","A consistent tell is very reliable. Trust your eyes.","Good to share, but acting NOW helps your team right now.","You have better info than the coach here."],
      rates:[85,20,45,40],concept:"Reading the pitcher's tells gives a huge advantage on the basepaths",anim:"steal"},
    {id:"r8",title:"Running Out a Double",diff:1,cat:"baserunning",
      description:"You hit one in the gap. Definite single. Ball is still rolling as you round 1st.",
      situation:{inning:"Top 3",outs:1,count:"-",runners:[],score:[0,1]},
      options:["Peek at the ball while running","Full sprint to 2nd, then look up","Round 1st and decide","Sprint all the way to 3rd"],
      best:1,explanations:["Peeking slows you down significantly.","Run full speed to 2nd, then read your 3rd base coach.","Deciding at 1st is too early and slows you down.","Going to 3rd without reading is reckless."],
      explSimple:["Looking at the ball while running slows you down. Keep your head up and run fast!","Run as fast as you can to second base, then look at your coach to see if you should keep going.","You can't decide at first base — just run hard to second and then look up.","Running all the way to third without checking is dangerous. You could get thrown out."],
      rates:[40,85,30,25],concept:"On extra base hits, sprint full speed and let the coach guide you",anim:"advance"},
    {id:"r9",title:"Freeze on a Line Drive",diff:2,cat:"baserunning",
      description:"You're on 2nd. Screaming line drive toward shortstop. It might be caught.",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[2],score:[2,1]},
      options:["FREEZE!","Sprint to 3rd","Go halfway","Break back to 2nd"],
      best:0,explanations:["On line drives, FREEZE. If caught, you're safe at 2nd. If it drops, advance.","Sprinting on a line drive = doubled off. The #1 baserunning mistake.","Even halfway is dangerous on a liner.","Breaking back means you can't advance if it's a hit."],
      explSimple:["Freeze! Don't move until you see if the ball is caught or drops. If it's caught, you're safe. If it drops, then run.","If you run and the fielder catches it, they can throw to your base and get you out too — that's a double play!","Even going halfway is risky because line drives get caught fast and you won't have time to get back.","Running back to second means you can't go to third if the ball drops for a hit."],
      rates:[85,10,30,40],concept:"FREEZE on line drives — running on a catch means an easy double play",anim:"freeze"},
    {id:"r10",title:"Scoring from 2nd",diff:2,cat:"baserunning",
      description:"You're on 2nd, 1 out. Single to left. LF fields it on one hop. Score or hold?",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[2],score:[3,4]},
      options:["Score!","Hold at 3rd","Round 3rd and read the coach","Score only if you're fast"],
      best:2,explanations:["Aggressive is good but running blind into a throw can end the rally.","Too conservative with 1 out in a close game.","Round 3rd hard and read your coach. He sees the throw and catcher.","Speed matters less than the coach's eyes on the play."],
      explSimple:["Running home without looking could get you thrown out. Be smart!","Staying at third is too safe when you might be able to score.","Run hard around third base and look at your coach! He can see the throw and will tell you to go or stop.","It doesn't matter how fast you are — your coach can see things you can't. Listen to him!"],
      rates:[45,35,85,40],concept:"Round 3rd aggressively and read your coach — he sees the whole play",anim:"score"},
    {id:"r11",title:"Wild Pitch Awareness",diff:1,cat:"baserunning",
      description:"You're on 3rd, 2 outs. Pitcher throws a curveball that bounces 5 feet in front of the plate.",
      situation:{inning:"Bot 8",outs:2,count:"1-2",runners:[3],score:[2,3]},
      options:["Sprint home!","Wait — too risky with 2 outs","See where the ball goes first","Only go if it gets past the catcher"],
      best:0,explanations:["Any ball that bounces well in front of the plate is your chance. Be aggressive from 3rd with 2 outs!","With 2 outs, the risk-reward heavily favors going.","By the time you see, the catcher has recovered.","It bounced 5 feet in front — it WILL get away at least briefly. Go!"],
      explSimple:["The ball bounced way in front of the catcher — run home right now! This is your chance to score!","With two outs, you should try to score because your team really needs it.","If you wait to see where the ball goes, the catcher will pick it up and you'll miss your chance.","The ball bounced far from the catcher, so he can't catch it right away. Go!"],
      rates:[85,20,35,50],concept:"On wild pitches with a runner on 3rd, react immediately — don't wait and watch",anim:"score"},
    {id:"r12",title:"Running Through First Base",diff:1,cat:"basic",
      description:"You hit a ground ball to shortstop. It's going to be close at first base. How should you run through the bag?",
      situation:{inning:"Top 2",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Run full speed straight through the bag","Slow down before the bag to hit it perfectly","Dive headfirst into first base","Round the bag toward second"],
      best:0,explanations:["Run THROUGH first base at full speed! You're allowed to overrun 1st base without being tagged out (as long as you turn right/foul territory). Never slow down.","Slowing down loses time. The difference between safe and out is often 0.1 seconds.","NEVER dive headfirst into 1st base — it's slower than running through. You lose momentum.","Only round the bag if the ball gets through to the outfield. On a ground ball, run straight through."],
      explSimple:["Run as fast as you can straight through first base! You're allowed to run past it without getting tagged out.","Slowing down means you might be out! Keep running full speed.","Never dive into first base — running through is faster and safer.","Only curve toward second if the ball goes to the outfield. On a ground ball, run straight through the base."],
      rates:[85,15,10,35],concept:"Run full speed through 1st base — you can overrun it safely in foul territory",anim:"advance"},
    // Batch 1 — Steal Decisions
    {id:"r13",title:"Slow Pitcher, Big Lead",diff:1,cat:"stealing",
      description:"Bot 3rd, you're on 1st with nobody out. The pitcher takes forever to deliver — his time to the plate is 1.8 seconds (average is 1.4). Score is 2-1.",
      situation:{inning:"Bot 3",outs:0,count:"1-1",runners:[1],score:[2,1]},
      options:["Steal second — the pitcher is slow","Stay put — don't risk it","Wait for a better count to steal","Only go if the coach gives the sign"],
      best:0,explanations:["A pitcher with a 1.8-second delivery is a gift for baserunners. Most catchers need the ball in 2.0 seconds total to throw out a runner. If the pitcher takes 1.8 just to deliver, even an average runner can steal second easily.","Playing it safe with a slow pitcher wastes a golden opportunity. This is exactly when aggressive baserunning wins games.","The count doesn't matter much when the pitcher is this slow. His delivery time gives you the advantage, not the count.","Waiting for a sign is good fundamentals, but any smart coach would give the steal sign against a pitcher this slow."],
      rates:[85,25,40,50],concept:"A pitcher's delivery time is the key to stealing bases — slow deliveries mean easy steals",anim:"steal"},
    {id:"r14",title:"Fast but Strong-Armed Catcher",diff:1,cat:"stealing",
      description:"Top of the 5th, you're on 1st, 1 out, tied 2-2. You're one of the fastest kids on the team, but their catcher has thrown out 3 runners today.",
      situation:{inning:"Top 5",outs:1,count:"0-0",runners:[1],score:[2,2]},
      options:["Steal anyway — you're fast enough","Stay put — the catcher is too good","Get a great jump — timing beats arm strength","Take a bigger lead to make up the difference"],
      best:2,explanations:["Speed alone doesn't beat a great arm. Plenty of fast runners get thrown out by strong catchers.","Staying put isn't wrong, but you're giving up on your speed advantage. There's a better approach.","Against a strong-armed catcher, your jump is everything. Study the pitcher's pickoff move, time his leg kick, and get a perfect first step. A great jump beats a great arm because the runner gains distance before the catcher even receives the ball.","A bigger lead just makes you more vulnerable to a pickoff. It's your JUMP that matters, not your lead."],
      rates:[35,40,85,20],concept:"Against a great throwing catcher, your jump is more important than your speed",anim:"steal"},
    {id:"r15",title:"Is Stealing Third Worth It?",diff:1,cat:"stealing",
      description:"Bot 6th, you're on 2nd, nobody out, up 3-2. You're fast and thinking about stealing 3rd. The pitcher is in the windup, focused on the batter.",
      situation:{inning:"Bot 6",outs:0,count:"1-0",runners:[2],score:[3,2]},
      options:["Steal third — you're already in scoring position","Stay at second — it's not worth the risk","Only steal if the pitcher isn't paying attention","Wait for a passed ball to advance"],
      best:1,explanations:["Stealing third with nobody out is one of the worst risks in baseball. You're already in scoring position at 2nd! From 2nd, you can score on most singles. Getting thrown out takes you off the bases entirely.","Smart! You're already in scoring position. From 2nd base, you score on most singles, doubles, sac flies, and many ground balls. Risking an out to gain one base when you're already in scoring position is bad math.","Even if the pitcher isn't paying attention, stealing third with nobody out is rarely worth it. The only time to steal third is with 2 outs when a single might not score you from 2nd.","Waiting for a passed ball is fine, but the key lesson is that stealing 3rd with nobody out is almost never the right play."],
      rates:[20,85,35,45],concept:"Don't steal third with nobody out — you're already in scoring position at second base",anim:"freeze"},
    {id:"r16",title:"3-1 Count — Pitcher Must Throw a Strike",diff:2,cat:"stealing",
      description:"Top of the 4th, you're on 1st, nobody out, down 2-1. Count is 3-1. The pitcher HAS to throw a fastball strike here or walk the batter.",
      situation:{inning:"Top 4",outs:0,count:"3-1",runners:[1],score:[1,2]},
      options:["Steal on this pitch — he'll throw a fastball","Stay and let the batter hit","Wait for a full count to steal","Take a bigger lead but don't go"],
      best:0,explanations:["On 3-1, the pitcher almost always throws a fastball for a strike. Fastballs are easier to steal on because they take longer to reach the catcher. Plus, the catcher is set up for a strike, not a pitchout. This is the best count to steal on!","Letting the batter hit is fine, but you're wasting a perfect stealing count. The 3-1 fastball is coming.","Waiting for a full count means the runner goes anyway on ball four. The 3-1 count is actually better for stealing because you know a fastball is coming.","A bigger lead without going wastes the count advantage and makes you vulnerable to a pickoff."],
      rates:[85,40,30,25],concept:"3-1 counts are great for stealing — the pitcher must throw a fastball strike",anim:"steal"},
    {id:"r17",title:"Down Big — Play It Safe?",diff:2,cat:"stealing",
      description:"Bot 5th, you're on 1st, 1 out, down 7-2. Your team needs a big rally. You're fast.",
      situation:{inning:"Bot 5",outs:1,count:"0-1",runners:[1],score:[2,7]},
      options:["Steal — get into scoring position","Stay put — save your energy, it's a blowout","Only go if the pitcher is slow","Take a chance — you've got nothing to lose"],
      best:0,explanations:["When you're down big, you need baserunners in scoring position. Stealing second puts you where a single can score you. Playing it safe when you're down 5 runs won't help you come back.","Playing it safe when you're down by 5 means you've already given up. Aggressive baserunning gives you the best chance at a rally.","Waiting to evaluate the pitcher is too cautious when you're down this much. Take the risk.","The instinct is right but the reasoning should be smarter — you're going because getting into scoring position is essential for a comeback."],
      rates:[85,15,40,55],concept:"When trailing big, aggressive baserunning gives your team the best chance at a rally",anim:"steal"},
    {id:"r18",title:"Left-Handed Pitcher on the Mound",diff:2,cat:"stealing",
      description:"Top of the 3rd, you're on 1st, nobody out, tied 1-1. But there's a problem — the pitcher is left-handed, which means he's facing you while in the stretch.",
      situation:{inning:"Top 3",outs:0,count:"1-1",runners:[1],score:[1,1]},
      options:["Don't steal — lefties are impossible to steal on","Watch his front foot — if it crosses toward home, he's pitching","Take a huge lead to compensate","Wait until there are 2 outs to steal"],
      best:1,explanations:["Lefties are tougher to steal on, but not impossible. Many runners steal on lefties by reading their move correctly.","The key to stealing on a lefty is reading the front foot. If the front foot goes toward home plate (crossing an imaginary line from the rubber), he's delivering to the batter and you GO. If it goes toward first, he's picking off and you dive back.","A huge lead against a lefty who can see you is asking for a pickoff. Lefties have the easiest pickoff move in baseball.","Waiting for 2 outs has nothing to do with the lefty problem. Learn to read the move."],
      rates:[20,85,15,30],concept:"Steal on lefties by reading the front foot — if it crosses toward home, GO!",anim:"steal"},
    {id:"r19",title:"The Delayed Steal",diff:2,cat:"stealing",
      description:"Bot 4th, you're on 1st, 1 out, up 4-3. The catcher has been lazily lobbing the ball back to the pitcher after each pitch. He's not paying attention.",
      situation:{inning:"Bot 4",outs:1,count:"1-0",runners:[1],score:[4,3]},
      options:["Normal steal on the next pitch","Delayed steal — go when the catcher throws back to the pitcher","Stay at first — no need to risk it with a lead","Wait for the hit-and-run sign"],
      best:1,explanations:["A normal steal works, but you'd be ignoring the bigger opportunity the catcher is giving you.","The delayed steal is one of the smartest plays in baseball. Instead of going when the pitcher delivers, you go when the catcher lazily lobs the ball back. The pitcher isn't expecting it, the catcher isn't ready, and nobody covers second.","You have a lead, but building a bigger lead with smart baserunning puts more pressure on the defense.","Waiting for a coach's sign is fine, but recognizing this opportunity yourself shows great baseball IQ."],
      rates:[50,85,30,35],concept:"The delayed steal exploits a lazy catcher — go when they lob the ball back to the pitcher",anim:"steal"},
    {id:"r20",title:"Two Outs, Best Hitter Up",diff:3,cat:"stealing",
      description:"Top of the 7th, you're on 1st, 2 outs, tied 3-3. Your team's best hitter is at the plate — he's 3-for-3 today with a double and a homer.",
      situation:{inning:"Top 7",outs:2,count:"1-0",runners:[1],score:[3,3]},
      options:["Steal second — get into scoring position","Stay and let the best hitter drive you in","Take a big lead but don't steal — distract the pitcher","Only steal if you get a great jump"],
      best:1,explanations:["Stealing here is risky because if you're thrown out, your best hitter — who's 3-for-3 — never gets to swing. That's a terrible trade.","Your best hitter is ON FIRE. He's 3-for-3 with extra-base hits. Let him hit! If he doubles, you score from first. If he homers, you both score. Getting thrown out stealing robs your team of its best chance to score.","Distracting the pitcher is okay, but the main point is: don't risk getting thrown out before your hottest hitter swings.","Even a great jump isn't worth the risk. If you're thrown out, the inning is over and your best hitter goes back to the dugout."],
      rates:[25,85,45,35],concept:"Don't steal in front of a hot hitter — let your best players drive you in",anim:"safe"},
    {id:"r21",title:"Double Steal — First and Third",diff:3,cat:"stealing",
      description:"Bot 6th, runners on 1st and 3rd, 1 out, down 4-3. You're the runner on 1st. Coach signals a double steal — if they throw to second, the runner on 3rd scores.",
      situation:{inning:"Bot 6",outs:1,count:"0-0",runners:[1,3],score:[3,4]},
      options:["Sprint to second — make them throw to you","Jog to second — get in a rundown to give the runner on 3rd time","Stay and ignore the sign — it's too risky","Go halfway and stop — see what happens"],
      best:0,explanations:["On a double steal with 1st and 3rd, sprint to second to force the catcher to choose. If he throws to second, the runner on 3rd breaks home. If he holds the ball, you're safe at second. Win-win.","Getting into a rundown on purpose wastes time and gives the defense a chance to make the play at both ends. A clean steal attempt is better.","Ignoring the coach's sign is never okay. The double steal is a smart, high-percentage play when executed correctly.","Going halfway and stopping is the worst option — you're neither stealing nor safe. Commit fully or don't go."],
      rates:[85,40,10,15],concept:"On a double steal from 1st and 3rd, force the catcher to choose — throw to 2nd and the runner on 3rd scores",anim:"steal"},
    {id:"r22",title:"Reading the Pitcher's Move",diff:3,cat:"stealing",
      description:"Top of the 8th, you're on 1st, nobody out, tied 5-5. The pitcher keeps looking over at you and throwing to first. He's picked off two runners today.",
      situation:{inning:"Top 8",outs:0,count:"1-1",runners:[1],score:[5,5]},
      options:["Steal anyway — don't let him intimidate you","Shorten your lead and be safe","Time his pickoff move — find the pattern, then go","Don't steal — he's too dangerous"],
      best:2,explanations:["Running blindly against a pitcher who's picked off two runners is reckless, not brave.","Shortening your lead too much takes away your steal threat entirely.","Every pitcher has a pattern — maybe he always looks twice before throwing home, or his leg moves differently on a pickoff vs a pitch. Watch, learn his tell, and exploit it. Great baserunners study the pitcher before they run.","Giving up entirely lets the pitcher control you. Study his move and find your moment."],
      rates:[15,35,85,40],concept:"Study the pitcher's pickoff move — every pitcher has a tell. Find it, then exploit it",anim:"steal"},
    // Batch 2 — Tagging Up
    {id:"r23",title:"Deep Fly Ball — Tag and Score",diff:1,cat:"tagging",
      description:"Bot 5th, you're on 3rd, 1 out, up 3-2. The batter hits a deep fly ball to center field — the outfielder catches it near the warning track.",
      situation:{inning:"Bot 5",outs:1,count:"-",runners:[3],score:[3,2]},
      options:["Tag up and score after the catch","Run halfway and watch","Run on contact — don't wait for the catch","Stay on the base — don't risk it"],
      best:0,explanations:["A deep fly ball to center is the perfect tagging opportunity. Touch the base, and the moment the ball hits the glove, sprint home. The outfielder has a long throw, and you'll score easily.","Going halfway means you can't go back if it's caught and you don't get the full head start of a tag. Commit to one or the other.","Running on contact before the catch means you're out if the ball is caught — you can't get back to third in time.","Staying on third with a deep fly ball wastes a chance to score. One out, deep fly — this is exactly what tagging up is for!"],
      rates:[85,30,10,25],concept:"On a deep fly ball with less than 2 outs, tag up — touch the base and go when the ball is caught",anim:"score"},
    {id:"r24",title:"Shallow Fly — Too Risky?",diff:1,cat:"tagging",
      description:"Top of the 4th, you're on 3rd, 1 out, tied 1-1. The batter pops a short fly to left field — the outfielder is jogging in to catch it about 200 feet from home.",
      situation:{inning:"Top 4",outs:1,count:"-",runners:[3],score:[1,1]},
      options:["Tag up and go — any fly ball scores from 3rd","Stay at third — the throw is too short","Go halfway and see what happens","Run on contact before the catch"],
      best:1,explanations:["A shallow fly at 200 feet means the outfielder is close enough to throw you out easily. Bad idea.","Good read! A shallow fly means the left fielder's throw will be quick and accurate. Stay at third and wait for a better opportunity — a deeper fly, a ground ball, or a hit.","Going halfway commits you to neither option. Either tag or stay — don't get caught in between.","Running before the catch means you're out if the ball is caught."],
      rates:[15,85,25,10],concept:"Not every fly ball is a good tag-up — shallow fly balls give the outfielder an easy throw home",anim:"freeze"},
    {id:"r25",title:"Advancing from Second on a Fly",diff:1,cat:"tagging",
      description:"Bot 7th, you're on 2nd, 1 out, down 3-2. Deep fly ball to right field — the right fielder catches it near the warning track. Can you tag to third?",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[2],score:[2,3]},
      options:["Tag up and advance to third","Stay at second — too risky","Go halfway and see what happens","Sprint home — try to score"],
      best:0,explanations:["Tagging from 2nd to 3rd on a deep fly to right field is great! Right fielders have the longest throw to third base. At third, you can score on a wild pitch, sac fly, or ground ball.","Staying at second is too conservative. Deep fly to right means the right fielder has the farthest throw to third. Take the base!","Going halfway means you can't advance and might get doubled off. Commit to tagging or staying.","Trying to score from second on a fly ball is way too aggressive — the throw is much shorter."],
      rates:[85,30,20,5],concept:"Tag from 2nd to 3rd on deep flies to right field — the right fielder has the longest throw to 3rd",anim:"advance"},
    {id:"r26",title:"Strong Arm in Right — Tag or Hold?",diff:2,cat:"tagging",
      description:"Top of the 6th, you're on 3rd, 1 out, up 4-2. Medium-depth fly to right field. The right fielder has the strongest arm on their team — he threw out a runner at home last inning.",
      situation:{inning:"Top 6",outs:1,count:"-",runners:[3],score:[4,2]},
      options:["Tag up and go — you're fast enough","Stay at third — his arm is too strong","Read the catch — if he's off-balance, go. If he's set, stay","Tag up and bluff — force a bad throw"],
      best:2,explanations:["Going blindly against a strong arm without reading the catch is risky.","Staying at third is safe but you might be wasting a chance. There's a smarter way to decide.","Reading the catch is the key! If the outfielder has to reach, run sideways, or catch off-balance, his throw will be weaker — GO. If he's camped under it with his feet set, his throw will be strong — STAY. Great baserunners make this read in real time.","Bluffing to force a bad throw can backfire. If he ignores you, you've wasted energy."],
      rates:[35,40,85,30],concept:"Read the outfielder's catch — if he's off-balance, go. If he's set, stay",anim:"score"},
    {id:"r27",title:"Line Drive — Freeze!",diff:2,cat:"tagging",
      description:"Bot 3rd, you're on 2nd, nobody out, tied 2-2. The batter hits a screaming line drive to left-center. You took a few steps toward third on contact.",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[2],score:[2,2]},
      options:["Keep going to third — it's a hit!","Freeze and get back to second immediately","Go halfway and see if it's caught","Sprint home — it's in the gap!"],
      best:1,explanations:["Line drives can be caught by diving outfielders. If you're off the base and it's caught, you're doubled off for an easy double play.","On line drives, FREEZE and get back to your base. Line drives are caught at a much higher rate than fly balls, and if you're off the base, you're doubled off. Wait until the ball gets past the fielders, THEN run.","Going halfway is for fly balls, not line drives. Line drives are too fast — by the time you see if it's caught, it's too late to get back.","Sprinting home on a line drive is the fastest way to get doubled off."],
      rates:[20,85,30,5],concept:"On line drives, freeze and get back to your base — if it's caught, you can't get doubled off",anim:"freeze"},
    {id:"r28",title:"Sacrifice Fly Timing",diff:2,cat:"tagging",
      description:"Top of the 7th, you're on 3rd, 1 out, up 5-4. Deep fly ball to center. You're tagging up. When exactly do you leave?",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[3],score:[5,4]},
      options:["Leave right when the ball is hit — get a head start","Leave right when the ball touches the glove","Leave a split second before the catch — anticipate it","Wait until the outfielder's throw is in the air"],
      best:1,explanations:["Leaving when the ball is hit means you haven't tagged up. You must be touching the base when the catch is made or you can be called out on appeal.","The rule says you can leave the moment the ball is first touched by the fielder. Watch the ball into his glove, and the instant it touches leather, explode toward home.","Leaving before the catch is illegal — if the defense appeals, you'll be called out.","Waiting until the throw is in the air wastes precious seconds. Leave at the moment of the catch."],
      rates:[10,85,25,15],concept:"On a tag-up, leave the moment the ball touches the glove — not before, not after",anim:"score"},
    {id:"r29",title:"Two Runners Tagging",diff:3,cat:"tagging",
      description:"Bot 8th, runners on 2nd and 3rd, 1 out, down 6-5. You're the runner on 3rd. Deep fly to center — your teammate on 2nd wants to tag to 3rd too.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[2,3],score:[5,6]},
      options:["Both tag — score the tying run and advance your teammate","Only you tag — don't risk your teammate getting thrown out","Stay at third — let your teammate tag to 3rd instead","Run without tagging — get home as fast as possible"],
      best:0,explanations:["When two runners tag up, the lead runner goes first. If you score, your teammate advances to 3rd because the throw goes home. Both tagging creates maximum pressure on the defense.","Only you tagging is too conservative. If both tag, the defense has to choose — throw home or throw to 3rd. They can't do both.","Staying while your teammate tags to 3rd would put two runners on the same base — automatic out!","Running without tagging means you'll be called out on appeal. Always tag first."],
      rates:[85,45,5,10],concept:"When two runners can tag, both should go — the defense can only make one throw",anim:"score"},
    {id:"r30",title:"Foul Ball Tag-Up",diff:3,cat:"tagging",
      description:"Top of the 9th, you're on 3rd, 1 out, tied 7-7. The batter pops up a foul ball deep down the first base line. The first baseman drifts toward the dugout and catches it.",
      situation:{inning:"Top 9",outs:1,count:"-",runners:[3],score:[7,7]},
      options:["Tag up and score — a catch is a catch, even in foul territory","Stay at third — you can't tag on foul balls","Go halfway and watch the play","Sprint home before the catch"],
      best:0,explanations:["You CAN tag up on foul ball catches! As long as the fielder catches it, you can tag and advance. A catch near the dugout means the first baseman is far from home and in an awkward position to throw.","Common mistake — you absolutely CAN tag up on foul ball catches. The rule only requires the ball to be caught.","Going halfway on a foul ball doesn't help. Either tag or stay.","Sprinting before the catch means you haven't tagged up — you'll be called out on appeal."],
      rates:[85,20,15,5],concept:"You CAN tag up on foul ball catches — a catch is a catch, fair or foul",anim:"score"},
    {id:"r31",title:"Fly Ball to Shallow Right",diff:3,cat:"tagging",
      description:"Bot 6th, you're on 3rd, 1 out, down 3-2. Fly ball to shallow right — the right fielder is charging in hard. He'll catch it about 230 feet from home, running toward you.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[3],score:[2,3]},
      options:["Tag and go — his momentum makes the throw hard","Stay at third — he's too close","Go if he bobbles the catch","Tag up but read his body — go if he stumbles"],
      best:3,explanations:["Just because he's running in doesn't automatically mean you should go. If he catches cleanly while running forward, he might throw you out.","He might be close, but his momentum matters. If he has to stop and set his feet, his throw will be late.","Waiting for a bobble is too specific. Read his overall body position.","Smart! When a fielder charges in, watch his body. If he stumbles, slides, or reaches awkwardly, his throw will be weak — GO. If he catches it in stride with his feet under him, STAY."],
      rates:[40,30,25,85],concept:"When an outfielder charges in, read his body — stumble or reach means GO, clean catch means STAY",anim:"score"},
    {id:"r32",title:"Deep Fly to the Warning Track",diff:3,cat:"tagging",
      description:"Top of the 5th, you're on 3rd, 1 out, tied 4-4. Deep fly to left — the wind held it up but the left fielder catches it at the warning track, 320+ feet from home.",
      situation:{inning:"Top 5",outs:1,count:"-",runners:[3],score:[4,4]},
      options:["Tag and score — outfielder is at the track, throw will be long","Stay at third — the wind might help his throw","Tag but wait to see the throw before committing","Go halfway and watch"],
      best:0,explanations:["The left fielder caught it at the warning track — that's 320+ feet from home plate. No outfielder can throw you out from that distance with only 90 feet to run. This is an automatic tag-up.","The wind might help slightly, but the distance matters way more. 320 feet is too far for any throw to beat you.","Waiting to see the throw wastes time. You need to be sprinting the moment the ball hits the glove. The decision to go happens BEFORE the throw.","Going halfway means you lose your head start and can't tag properly."],
      rates:[85,15,25,20],concept:"When the outfielder catches at the warning track, tag and score — the throw is too long to beat you",anim:"score"},
    // Batch 3 — Reading the Ball Off the Bat
    {id:"r33",title:"Ground Ball to the Left Side",diff:1,cat:"baserunning",
      description:"Bot 4th, you're on 1st, nobody out, tied 2-2. The batter hits a ground ball to the shortstop. Do you advance to second?",
      situation:{inning:"Bot 4",outs:0,count:"-",runners:[1],score:[2,2]},
      options:["Run to second — you have to go on a ground ball","Stay at first — the shortstop might throw to second","Sprint to second but slide to avoid the tag","Run only if the ball gets past the shortstop"],
      best:0,explanations:["On a ground ball with a runner on first, you MUST go to second. It's a force play — you have no choice. The next base is occupied (by the batter running to first), so you're forced to advance. Run hard to second base and try to break up the double play.","You can't stay at first — the batter is running to first. Two runners can't occupy the same base. You must advance.","You don't need to slide at second on a force play — just run hard through the base. Sliding actually slows you down.","Waiting to see if the ball gets past the fielder means you'll be too late. On a ground ball, the runner on first always goes."],
      rates:[85,5,40,15],concept:"On a ground ball with a runner on first, you MUST advance — it's a force play",anim:"advance"},
    {id:"r34",title:"Line Drive at the Shortstop",diff:1,cat:"baserunning",
      description:"Top of the 5th, you're on 1st, 1 out, up 3-1. The batter smashes a line drive right at the shortstop. You took a few steps toward second on the crack of the bat.",
      situation:{inning:"Top 5",outs:1,count:"-",runners:[1],score:[3,1]},
      options:["Keep going — it's a hit!","Stop and get back to first immediately","Dive back headfirst","Go halfway and wait"],
      best:1,explanations:["A line drive right at the shortstop is likely caught. If you're off the base, you'll be doubled off at first for an easy double play.","Get back to first NOW! Line drives hit right at fielders are usually caught. If you're off the base, the fielder catches the ball and throws to first for a double play. Always freeze or retreat on line drives hit at fielders.","Diving back headfirst to first is actually slower than running back. Turn and run back to the base.","Going halfway on a line drive is dangerous — they're hit too hard for you to react in time. Either you're going or you're going back."],
      rates:[10,85,30,20],concept:"On line drives hit at fielders, get back to your base — don't get doubled off",anim:"freeze"},
    {id:"r35",title:"Fly Ball to the Outfield — Go Halfway",diff:1,cat:"baserunning",
      description:"Bot 6th, you're on 1st, nobody out, down 3-2. The batter lofts a high fly ball to center field. It's not clear if it'll be caught or drop.",
      situation:{inning:"Bot 6",outs:0,count:"-",runners:[1],score:[2,3]},
      options:["Run to second — assume it drops","Go halfway between first and second and watch","Stay at first — it'll probably be caught","Sprint to third — be aggressive"],
      best:1,explanations:["Running to second assumes the ball drops. If it's caught, you can't get back to first in time — you're doubled off.","Go halfway! On fly balls, run to the midpoint between first and second and watch the outfielder. If the ball drops, you can advance to second (or beyond). If it's caught, you can retreat safely to first. Halfway gives you the best of both options.","Staying at first is too conservative. If the ball drops, you've only advanced one base when you could have reached second or third.","Sprinting to third on a fly ball means you'll be out at first on a double play if it's caught."],
      rates:[25,85,20,5],concept:"On fly balls, go halfway — you can advance if it drops and retreat if it's caught",anim:"advance"},
    {id:"r36",title:"Ground Ball to the Right Side — Second to Third",diff:2,cat:"baserunning",
      description:"Top of the 3rd, you're on 2nd, nobody out, tied 1-1. The batter hits a ground ball to the second baseman. The second baseman is fielding it on the right side.",
      situation:{inning:"Top 3",outs:0,count:"-",runners:[2],score:[1,1]},
      options:["Advance to third — he's throwing to first","Stay at second — it's too risky","Only go if he doesn't look at you","Sprint home — catch them off guard"],
      best:0,explanations:["When the ball is hit to the right side (first baseman or second baseman) and you're on second, advance to third! The fielder's back is to you as he throws to first. He can't throw to third and first at the same time. This is one of the easiest advances in baseball.","Staying at second when the ball is hit to the right side wastes a golden opportunity. The fielder has to throw to first — he can't get you at third.","He's going to throw to first regardless — he has to. Don't wait for a look. Go!","Sprinting home from second on a ground ball to the second baseman is way too aggressive. Third base is the right target."],
      rates:[85,20,40,5],concept:"On ground balls to the right side, advance from 2nd to 3rd — the fielder has to throw to first",anim:"advance"},
    {id:"r37",title:"Ball in the Gap — First to Third?",diff:2,cat:"baserunning",
      description:"Bot 5th, you're on 1st, 1 out, down 4-3. The batter drives a ball into the right-center gap. It's going to the wall. Can you make it from first to third?",
      situation:{inning:"Bot 5",outs:1,count:"-",runners:[1],score:[3,4]},
      options:["Sprint to third — the ball is in the gap","Stop at second — don't risk getting thrown out at third","Round second hard and watch the third base coach","Sprint home — score the tying run"],
      best:2,explanations:["Sprinting to third without looking at the coach could get you thrown out if the outfielder plays it quickly.","Stopping at second is too conservative on a ball in the gap. You should be looking to take the extra base.","Round second hard and look at your third base coach! He can see the outfielder, the ball, and the throw. If he's waving you, go to third. If he's holding you up, stop at second. Trusting your third base coach is fundamental to smart baserunning.","Going home from first on a ball to the gap is risky unless the ball gets past the outfielder completely."],
      rates:[45,30,85,20],concept:"On extra-base hits, round the base hard and watch your third base coach — he sees the whole play",anim:"advance"},
    {id:"r38",title:"Chopper Over the Pitcher — Score?",diff:2,cat:"baserunning",
      description:"Top of the 7th, you're on 2nd, 1 out, up 3-2. The batter hits a high chopper that bounces over the pitcher's head toward second base. The shortstop ranges over to field it.",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[2],score:[3,2]},
      options:["Sprint home — the shortstop has to throw to first","Advance to third only — don't overrun the play","Watch and read — go based on where the fielder throws","Hold at second — too risky"],
      best:0,explanations:["On a high chopper with the shortstop ranging to his right, his momentum carries him away from home plate. He HAS to throw to first to get the batter. By the time the ball reaches first and could be relayed home, you've already scored. This is aggressive but smart baserunning.","Third base is the safe choice, but with the shortstop moving away from you and the ball bouncing high (buying you time), you can score.","Watching wastes the time advantage the chopper gave you. On a high chopper, you read it instantly and GO.","Holding at second on a ball that takes the shortstop away from you wastes a great opportunity."],
      rates:[85,50,35,15],concept:"On high choppers that take the fielder away from you, be aggressive — score if you can",anim:"score"},
    {id:"r39",title:"Sharp Grounder to Third — Frozen at Second",diff:2,cat:"baserunning",
      description:"Bot 3rd, you're on 2nd, nobody out, tied 3-3. Sharp ground ball hit to the third baseman — he's standing right next to the bag. You're only 10 feet off second.",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[2],score:[3,3]},
      options:["Advance to third — the ground ball gets through","Stay at second — the third baseman can tag the bag","Bluff toward third to distract him","Get back to second immediately"],
      best:1,explanations:["The third baseman is standing next to the bag. If you run to third, he just steps on third for the force-out — wait, there's no force. But he can tag you easily since he's right there.","Smart! When the third baseman fields a ground ball right next to his bag, DO NOT advance. He can look at you, fake a throw, or tag you easily. Stay at second and let the play go to first. You'll advance later on the next at-bat.","Bluffing toward third when the fielder is right there is dangerous — he might tag you.","You don't need to get back to second — there's no force play. Just stay where you are."],
      rates:[10,85,25,30],concept:"When the third baseman fields near his bag, stay at second — don't run into a tag",anim:"freeze"},
    {id:"r40",title:"Slow Roller — Go on Contact?",diff:3,cat:"baserunning",
      description:"Top of the 8th, you're on 3rd, 1 out, down 4-3. 'Go on contact' is the call — run home on anything hit on the ground. But the batter hits a slow roller right at the first baseman, 15 feet from home.",
      situation:{inning:"Top 8",outs:1,count:"-",runners:[3],score:[3,4]},
      options:["Go — the call was go on contact","Hold up — the ball is too close to home","Freeze and read the play — did the first baseman field it cleanly?","Sprint home and hope for the best"],
      best:2,explanations:["'Go on contact' is a guideline, not a suicide pact. You still need to read the play. A slow roller right at the first baseman 15 feet from home is different from a ground ball to shortstop.","Holding up entirely ignores the 'go on contact' call. You should at least read the play.","Even with 'go on contact,' you still have to read the ball. If the first baseman bobbles it or has to reach, GO — his throw home will be late. If he fields it cleanly and is close to home, HOLD — he can throw home or tag the batter and throw home easily. Smart baserunners read the play even on 'go on contact.'","Sprinting home blindly into a tag when the first baseman is 15 feet away is an easy out."],
      rates:[30,35,85,15],concept:"'Go on contact' still requires reading the play — a ball right at a fielder near home is an exception",anim:"freeze"},
    {id:"r41",title:"Blooper to Shallow Center",diff:3,cat:"baserunning",
      description:"Bot 6th, you're on 1st, 1 out, tied 5-5. Blooper hit to shallow center — the center fielder and shortstop are both running for it. If it drops, you might score. If caught, you're doubled off.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[1],score:[5,5]},
      options:["Sprint to third — be aggressive","Go halfway and read the play","Stay at first — it's probably caught","Freeze and wait to see what happens"],
      best:1,explanations:["Sprinting to third on a blooper means you're out at first on a double play if it's caught. Way too risky.","Go halfway! On a blooper where you're unsure if it'll drop, get to the halfway point between first and second. If the ball drops, you can advance to second (or beyond). If it's caught, you can get back to first safely. Halfway is the smart baserunning play on any 'tweener' ball.","Staying at first is too conservative. If the ball drops, you've only gone to second when you could have reached third from the halfway point.","Freezing at first base is the same as staying. Be more proactive — go halfway."],
      rates:[15,85,35,30],concept:"On bloopers and tweeners, go halfway — you can advance if it drops and retreat if it's caught",anim:"advance"},
    {id:"r42",title:"Hard Grounder Back to the Pitcher",diff:3,cat:"baserunning",
      description:"Top of the 9th, you're on 3rd, 1 out, tied 6-6. Hard one-hopper back to the pitcher. He fields it, fakes a throw home, and spins to look at you.",
      situation:{inning:"Top 9",outs:1,count:"-",runners:[3],score:[6,6]},
      options:["Sprint home — he faked, so he's throwing to first","Freeze — don't fall for the fake","Jog back to third — play it safe","Take a few steps and see what he does next"],
      best:1,explanations:["The fake throw home is designed to get you to commit so he can throw you out. If you sprint, he throws you out easily.","The fake throw is one of the oldest tricks in baseball. The pitcher fields the ball, fakes a throw home to get you to commit toward the plate, then throws to third (or chases you down) for the tag. FREEZE. Don't react to the fake. Stay at third. He still has to throw to first for the out.","Jogging back to third shows you're scared. Just freeze in place — you're safe at third.","Taking steps toward home after the fake is exactly what he wants. Freeze!"],
      rates:[10,85,25,30],concept:"When the pitcher fakes a throw home, freeze — don't fall for the oldest trick in the book",anim:"freeze"},
    // Batch 4 — Advancing & Game Situations
    {id:"r43",title:"Wild Pitch — Advance from Second",diff:1,cat:"baserunning",
      description:"Bot 5th, you're on 2nd, 1 out, tied 3-3. The pitcher throws a curveball that bounces off the catcher's glove and rolls a few feet away. Do you advance?",
      situation:{inning:"Bot 5",outs:1,count:"1-2",runners:[2],score:[3,3]},
      options:["Sprint to third — the ball got away","Stay at second — it didn't go far enough","Take a few steps and watch the catcher","Only go if the ball goes to the backstop"],
      best:0,explanations:["On a wild pitch or passed ball from 2nd base, advance to 3rd! Even if the ball only goes a few feet from the catcher, it takes him time to recover, pick it up, and throw to third. From 3rd, you can score on a sac fly, ground ball, or another wild pitch.","Staying at second wastes a free base. Any ball that gets away from the catcher is an opportunity.","Taking a few steps wastes the head start. Commit and go — hesitation costs you the base.","Waiting for the backstop means you only advance on really bad wild pitches. Aggressive runners go on ANY ball that gets away."],
      rates:[85,20,35,30],concept:"On wild pitches, advance immediately — don't wait for the ball to reach the backstop",anim:"advance"},
    {id:"r44",title:"Passed Ball — Score from Third",diff:1,cat:"baserunning",
      description:"Top of the 7th, you're on 3rd, 2 outs, down 4-3. The pitcher's fastball gets past the catcher and rolls toward the backstop. You're 90 feet from tying the game.",
      situation:{inning:"Top 7",outs:2,count:"1-1",runners:[3],score:[3,4]},
      options:["Sprint home immediately — score the tying run","Wait to see how far the ball goes","Only go if the catcher turns his back","Freeze — it's too risky with 2 outs"],
      best:0,explanations:["On a passed ball from 3rd with 2 outs, GO HOME. The catcher has to turn around, find the ball, retrieve it, and throw or tag. By the time he does all that, you should be sliding into home. With 2 outs, this might be your last chance to score.","Waiting wastes your head start. The second the ball gets past the catcher, sprint.","The catcher will always turn to get the ball. You don't need to wait for permission.","With 2 outs and the tying run at third, a passed ball is a gift. Take it!"],
      rates:[85,25,30,10],concept:"On passed balls from 3rd base, sprint home — react instantly, don't watch and wait",anim:"score"},
    {id:"r45",title:"Overthrow at First — How Far Do You Go?",diff:1,cat:"baserunning",
      description:"Bot 3rd, you hit a ground ball to third. The third baseman's throw to first is wild — it sails over the first baseman's head and rolls down the right field line.",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[],score:[1,1]},
      options:["Stop at first — you were safe already","Round first and sprint to second","Try for third — the ball is loose","Sprint for home — the ball is rolling away"],
      best:1,explanations:["Stopping at first ignores a free extra base. The ball is in right field — take advantage!","When the throw goes past the first baseman, round first and go to second. Watch where the ball goes and listen to your first base coach. An overthrow at first is almost always a free base to second. Be aggressive but smart — if the ball stays near the line, go to second. If it rolls far away, keep going.","Third might be possible if the ball rolls really far, but second is the smart, safe advance.","Going home on a simple overthrow at first is too aggressive unless the ball goes completely out of play."],
      rates:[15,85,45,20],concept:"On overthrows at first, take the extra base — round first and head to second immediately",anim:"advance"},
    {id:"r46",title:"Throw to Wrong Base — Keep Going?",diff:2,cat:"baserunning",
      description:"Top of the 6th, you're on 1st. The batter singles to right. You round second and see the right fielder throw to third — but nobody is going to third. The ball arrives at the bag with no one there.",
      situation:{inning:"Top 6",outs:1,count:"-",runners:[1],score:[2,3]},
      options:["Take third — the ball went to the wrong base","Stop at second — don't overrun the play","Watch the third baseman — if he's not there, go","Sprint home — total chaos"],
      best:0,explanations:["When the outfielder throws to the wrong base, TAKE THE EXTRA BASE. The ball is at third with no one covering — by the time someone retrieves it, you're standing on third safely. Smart baserunners exploit defensive mistakes.","Stopping at second when the ball went to an unoccupied third base wastes a free base.","Watching takes too long. If you can see the ball is at an empty bag, go immediately.","Home is too far unless the ball gets away from third base too."],
      rates:[85,25,45,15],concept:"When the defense throws to the wrong base, take the extra base — exploit their mistakes",anim:"advance"},
    {id:"r47",title:"Hit and Run — Batter Misses",diff:2,cat:"baserunning",
      description:"Bot 4th, you're on 1st, 1 out. The hit-and-run is called — you take off running. But the batter swings and MISSES. You're now a sitting duck between first and second.",
      situation:{inning:"Bot 4",outs:1,count:"1-1",runners:[1],score:[2,2]},
      options:["Keep going — try to steal second","Stop and get back to first","Slide into second and hope the catcher's throw is bad","Get in a rundown to let the batter get set for the next pitch"],
      best:0,explanations:["When the batter misses on a hit-and-run, you're committed — keep going to second! Don't stop, don't hesitate. You had a running start and the catcher still has to receive the pitch, then throw. Your jump might be good enough to be safe. Stopping or turning back almost guarantees you're out.","Stopping between bases is the worst option — you'll be caught in a rundown with nowhere to go.","Sliding into second is what you should do — but you also need to keep sprinting there first.","Getting into a rundown on purpose wastes an out. Your best chance is to keep going and try to be safe."],
      rates:[85,15,45,20],concept:"On a missed hit-and-run, keep going — you're committed. A good jump might still be safe",anim:"steal"},
    {id:"r48",title:"First to Third on a Single",diff:2,cat:"baserunning",
      description:"Top of the 5th, you're on 1st, nobody out, tied 2-2. Clean single to left field. The left fielder is taking his time fielding it. Can you go first to third?",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[1],score:[2,2]},
      options:["Sprint to third — the left fielder is lazy","Stop at second — don't take risks with nobody out","Round second and read the third base coach","Only go if the ball gets past the left fielder"],
      best:2,explanations:["Sprinting to third without reading the play could get you thrown out if the fielder recovers quickly.","Second base is safe, but if the fielder is being lazy, you're leaving a free base on the table.","Round second hard and pick up your third base coach! He can see the left fielder and his throw. If the coach is waving, sprint to third. If he's holding you, stop at second. First to third on a single puts enormous pressure on the defense and puts you in scoring position with nobody out.","The left fielder doesn't need to miss the ball for you to take third. A lazy fielding effort or a weak arm is enough."],
      rates:[40,30,85,25],concept:"Going first to third on a single requires reading — round second hard and watch your third base coach",anim:"advance"},
    {id:"r49",title:"Double Play in Progress — Advance?",diff:3,cat:"baserunning",
      description:"Bot 6th, runners on 1st and 2nd, nobody out, tied 4-4. Ground ball to short — the shortstop flips to second for the force. You're the runner on 2nd. While the DP is being turned, do you advance to 3rd?",
      situation:{inning:"Bot 6",outs:0,count:"-",runners:[1,2],score:[4,4]},
      options:["Sprint to third while they turn the DP","Stay at second — the DP ends the play","Advance to third only if the throw to first is late","Go halfway and watch the play"],
      best:0,explanations:["While the defense is turning a double play, the runner on second should advance to third! The middle infielder is focused on the flip and throw to first — nobody is covering third. Even if the DP is completed (2 outs), you're now on third with 2 outs. If the DP isn't completed, you're on third with 1 out. Win-win.","Staying at second wastes a free advance. The defense is occupied with the DP.","Waiting to see if the throw is late means you've lost your head start. Go immediately.","Halfway gives up your advantage. Sprint to third — the defense can't throw to three places at once."],
      rates:[85,15,35,30],concept:"During a double play, the runner on 2nd should advance to 3rd — the defense can't cover everywhere",anim:"advance"},
    {id:"r50",title:"Balk — Free Base",diff:2,cat:"baserunning",
      description:"Top of the 4th, you're on 1st, nobody out. The pitcher starts his motion, stops, then restarts. The umpire calls BALK. What happens?",
      situation:{inning:"Top 4",outs:0,count:"1-0",runners:[1],score:[1,2]},
      options:["Advance to second — all runners advance one base on a balk","Stay at first — a balk is just a warning","Go to second only if the umpire tells you","Run as far as you can — it's a dead ball"],
      best:0,explanations:["On a balk, ALL runners advance one base. You go from first to second for free. A balk is called when the pitcher makes an illegal motion — like starting and stopping his delivery. It's a free base for all runners, no exceptions.","A balk is not a warning — it's an immediate penalty. All runners advance one base.","You don't need to wait for the umpire to tell you. Once a balk is called, it's automatic — advance one base.","You only advance one base on a balk, not as many as you want. It's a dead ball."],
      rates:[85,5,30,15],concept:"On a balk, all runners advance one base — it's a free base when the pitcher makes an illegal motion",anim:"advance"},
    {id:"r51",title:"Rundown — Make Them Throw",diff:3,cat:"baserunning",
      description:"Bot 8th, you're caught in a rundown between second and third. Two fielders are chasing you. You're probably going to be out, but how can you help your team?",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[1,2],score:[4,5]},
      options:["Sprint toward third — maybe you'll be safe","Make them throw as many times as possible — buy time","Give up and get tagged — save your energy","Run toward the fielder with the ball to force a bad throw"],
      best:1,explanations:["Just sprinting to one base means you're out quickly with no benefit to your team.","In a rundown, make the defense throw as many times as possible. Every throw is a chance for an error. Every second in the rundown is time for OTHER runners to advance. If there's a runner on first, he might advance to second (or further) while the defense is focused on you. Even if you're out, you've helped your team.","Giving up wastes the opportunity to help your teammates advance.","Running at the fielder is unpredictable but risky — you might run into an obstruction call or just get tagged."],
      rates:[30,85,10,25],concept:"In a rundown, make them throw — every throw is a chance for an error and lets other runners advance",anim:"safe"},
    {id:"r52",title:"Overthrow on Pickoff — React!",diff:3,cat:"baserunning",
      description:"Top of the 7th, you're on 1st, nobody out, tied 5-5. The pitcher throws to first for a pickoff, but the first baseman drops the ball! It's rolling behind him toward right field.",
      situation:{inning:"Top 7",outs:0,count:"-",runners:[1],score:[5,5]},
      options:["Sprint to second — the ball is loose","Stay at first — it might be a trick","Go to second only if you see the ball on the ground","Sprint to third — take two bases on the error"],
      best:0,explanations:["When the pickoff throw gets away, sprint to second immediately! Don't wait, don't think, just react. The ball is loose and the first baseman has to chase it. By the time he recovers, you should be safe at second. Aggressive baserunners turn defensive mistakes into scoring opportunities.","It's not a trick — the ball is on the ground. React!","You should already be sprinting while verifying. Don't stand and watch.","Third might be possible if the ball goes far, but second is the guaranteed safe advance."],
      rates:[85,10,40,35],concept:"On dropped pickoff throws, react immediately — sprint to the next base while the ball is loose",anim:"advance"},
    // Batch 5 — Special Situations
    {id:"r53",title:"Infield Fly Rule — What Do I Do?",diff:2,cat:"rules",
      description:"Bot 3rd, runners on 1st and 2nd, 1 out. The batter pops up a high fly to the shortstop. The umpire yells 'INFIELD FLY — BATTER IS OUT!' What do you do as the runner on 2nd?",
      situation:{inning:"Bot 3",outs:1,count:"-",runners:[1,2],score:[2,2]},
      options:["Run to third — the batter is out, I'm free to go","Stay on second — the infield fly means stay put","Tag up and advance if the ball is caught","Stay near your base — advance at your own risk"],
      best:3,explanations:["You're NOT free to just run. The ball is still in play — if the fielder catches it and you've left, you could be doubled off.","You don't HAVE to stay put, but you should be careful. The batter is automatically out regardless of whether the ball is caught.","Tagging up is one option, but the key is understanding the rule first.","On an infield fly, the batter is automatically out whether or not the ball is caught. But the ball is STILL LIVE. You can advance at your own risk. If the fielder drops it, you can try to advance. If he catches it, you must tag up first. Stay near your base and react to what happens. The key: don't panic, don't assume anything."],
      rates:[10,35,40,85],concept:"On an infield fly, the batter is out but the ball is still live — stay near your base and react",anim:"freeze"},
    {id:"r54",title:"Ground Rule Double — Where Do I Go?",diff:2,cat:"rules",
      description:"Top of the 5th, you're on 1st, nobody out. The batter ropes a line drive that bounces in fair territory and then hops over the outfield fence. The umpire signals ground rule double.",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[1],score:[1,3]},
      options:["Sprint home — the ball went over the fence","Advance to third only","Advance to second only — you were on first","Stay at first base — the ground rule double only advances the batter"],
      best:1,explanations:["You can't score from first on a ground rule double. The rule gives you exactly two bases from where you were when the ball was hit.","On a ground rule double, all runners are awarded two bases from where they were when the ball was pitched. You were on first, so you advance two bases to third. The batter advances to second. You can't score from first on a ground rule double — only two bases.","Two bases from first is third, not second. You advance two bases.","A ground rule double awards ALL runners two bases from where they were at the time of the pitch, not just the batter. You advance from first to third."],
      rates:[15,85,10,10],concept:"On a ground rule double, all runners advance exactly two bases from where they started",anim:"advance"},
    {id:"r55",title:"Obstruction — Fielder in My Way",diff:3,cat:"rules",
      description:"Bot 7th, you're on 2nd, 1 out. The batter singles to left. You sprint toward third, but the third baseman is standing in the baseline without the ball — blocking your path!",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[2],score:[3,3]},
      options:["Stop and go back — you can't go through him","Run through him — he's blocking you illegally","Avoid him and keep running — go around","Keep running and signal the umpire — it's obstruction"],
      best:3,explanations:["Don't stop! If you go back, you lose the base you're entitled to.","Running through the fielder could get you called for interference. Don't initiate contact.","Going around him costs you time and might prevent you from reaching the base you deserve.","Obstruction is when a fielder blocks the baseline without the ball. Keep running toward the base and let the umpire handle it. The ump will call obstruction and award you the base (or bases) you would have reached without the obstruction. Don't stop, don't go back — the rule protects you."],
      rates:[10,20,30,85],concept:"If a fielder blocks you without the ball, it's obstruction — keep running, the umpire will award the base",anim:"advance"},
    {id:"r56",title:"Appeal Play — Missed a Base",diff:3,cat:"rules",
      description:"Top of the 8th, you're on 1st. The batter hits a triple to deep right. You sprint around the bases — but in your excitement, you miss touching second base. You're standing on third, safe.",
      situation:{inning:"Top 8",outs:1,count:"-",runners:[1],score:[2,4]},
      options:["Go back and touch second before anyone notices","Stay at third — they probably didn't see it","Ask the umpire if you touched second","Hope the defense doesn't appeal"],
      best:0,explanations:["Go back and touch second base now! Before the defense appeals, retrace your steps and touch second. You're allowed to go back and touch a missed base as long as the defense hasn't appealed yet and you do it in the right order.","Staying at third and hoping is a gamble. If the defense throws to second and appeals, you're out.","The umpire won't tell you if you missed a base. That's the defense's job to appeal.","Hoping the defense doesn't notice is risky. Fix it yourself — go back and touch second."],
      rates:[85,15,5,30],concept:"If you miss a base, go back and touch it before the defense appeals — fix your mistake yourself",anim:"advance"},
    {id:"r57",title:"Force Removed — Am I Still Forced?",diff:3,cat:"rules",
      description:"Bot 6th, runners on 1st and 2nd, nobody out. Ground ball to short — the shortstop steps on second for the force out on the runner from first. You're the runner from 2nd heading to 3rd. Are you still forced?",
      situation:{inning:"Bot 6",outs:0,count:"-",runners:[1,2],score:[4,4]},
      options:["Keep going — I'm still forced to third","Go back to second — the force was removed when my teammate was out","Keep going but now I have to be tagged, not forced","The play is dead — stop where I am"],
      best:2,explanations:["The force on you was removed when the runner behind you was called out. You can still advance, but you must be tagged.","Going back to second could actually be smart, but you're not required to — the force was removed. You can choose to advance.","When the runner behind you (on first) was forced out at second, there's no longer anyone behind you requiring you to advance. The force on you is REMOVED. You can still run to third, but now the defense must TAG you — they can't just step on third base. This changes the play significantly.","The play is definitely not dead. The ball is still live and the game continues."],
      rates:[15,30,85,5],concept:"When the runner behind you is forced out, your force is removed — you must be tagged, not just forced",anim:"advance"},
  ],
  manager: [
    {id:"m1",title:"Intentional Walk",diff:2,cat:"late-game",
      description:"Bottom 9th, runner on 2nd, 1 out, up by 1. The .310 hitter is up. .220 hitter (8 HRs) on deck.",
      situation:{inning:"Bot 9",outs:1,count:"-",runners:[2],score:[5,4]},
      options:["Walk him — set up the DP","Pitch to him","Walk both — load bases","Bring in a new pitcher"],
      best:0,explanations:["Walking the .310 hitter sets up a force at every base + potential DP. The .245 hitter strikes out more.","Pitching to a .310 hitter in a 1-run 9th is risky.","Loading bases means any walk/HBP/error scores the tying run.","A cold reliever with runners on is worse."],
      explSimple:["Walk the better hitter on purpose! Then you can get a force out at any base, and the next batter isn't as good.","Pitching to their best hitter when the game is this close is really risky.","Walking both batters puts runners everywhere, and then even a little mistake ties the game.","Bringing in a new pitcher who hasn't warmed up with runners on base is a bad idea."],
      rates:[80,40,15,45],concept:"Intentional walks set up force plays and let you face a weaker hitter",anim:"walk"},
    {id:"m2",title:"Pinch Hitter Timing",diff:1,cat:"substitutions",
      description:"Bottom 8th, down 2, bases loaded, 1 out. Your pitcher is due up. He's been great.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[1,2,3],score:[2,4]},
      options:["Pinch hit — need runs NOW","Let pitcher hit — he's earned it","Only if a good reliever is ready","Have the pitcher bunt"],
      best:0,explanations:["Bases loaded, down 2 — you need runs. Pitchers bat .120. A real hitter's odds are much better.","Loyalty is nice, but the job is winning.","Can't wait for ideal conditions. This IS the moment.","Bunting scores 1 max. You need 2."],
      explSimple:["The bases are loaded and you need runs! Put in a real hitter because pitchers aren't good at hitting.","The pitcher did great on the mound, but you need someone who can hit right now.","This is the perfect time to use a pinch hitter — don't wait for a better moment.","A bunt can only score one run, and you need two to catch up."],
      rates:[85,15,60,20],concept:"Use pinch hitters in high-leverage spots — pitchers can't hit",anim:"hit"},
    {id:"m3",title:"Defensive Replacement",diff:2,cat:"late-game",
      description:"Top 9th, up by 1. Your LF went 3-4 with a HR but plays below-average defense. Gold Glover on bench.",
      situation:{inning:"Top 9",outs:0,count:"-",runners:[],score:[5,4]},
      options:["Bring in the Gold Glover","Keep the hot bat","Wait for runners","Switch if first batter gets on"],
      best:0,explanations:["In a 1-run 9th, one misplayed fly ball ties the game. Prioritize defense.","You're trying to win NOW. Defense matters more than potential extras.","Waiting until runners are on is too late if it's a misplay that puts them on.","That misplay could BE the first batter getting on."],
      explSimple:["Put in the better fielder! One dropped ball could tie the game. Defense matters most right now.","The hot bat doesn't matter if he drops a fly ball that lets them tie the game.","Don't wait for someone to get on base — by then it's too late to switch.","The mistake that lets a runner on base might be the one that costs you the game."],
      rates:[85,30,35,40],concept:"In close late innings, prioritize defense — one play decides the game",anim:"catch"},
    {id:"m4",title:"Sacrifice Bunt",diff:1,cat:"plays",
      description:"Bottom 7th, tie. Runner on 2nd, nobody out. #7 hitter (.220) is up.",
      situation:{inning:"Bot 7",outs:0,count:"-",runners:[2],score:[2,2]},
      options:["Bunt the runner to 3rd","Let him swing","Hit-and-run","Squeeze play"],
      best:0,explanations:["A .220 hitter + 0 outs = the bunt moves the runner for multiple scoring chances.","A .220 hitter is more likely to make an unproductive out.","Hit-and-run from 2nd is risky if he misses.","Squeeze only works from 3rd."],
      explSimple:["Have him bunt! That moves the runner to third base, where he can score really easily.","This batter isn't a great hitter, so he'll probably make an out anyway. A bunt at least moves the runner.","A hit-and-run is risky because if the batter misses, the runner could get thrown out.","You can only do a squeeze play when the runner is on third, not second."],
      rates:[80,35,40,10],concept:"Sacrifice bunts are smart with weak hitters and runners in scoring position",anim:"bunt"},
    {id:"m5",title:"Lefty vs. Lefty",diff:2,cat:"matchups",
      description:"Top 8th, up 1, runners on 1st and 3rd, 2 outs. Dangerous lefty up. Lefty specialist available.",
      situation:{inning:"Top 8",outs:2,count:"-",runners:[1,3],score:[4,3]},
      options:["Bring in the lefty","Trust your current pitcher","Wait until 2-0 to decide","Walk the lefty"],
      best:0,explanations:["L-on-L matchups are huge. Lefties bat 30-50 points lower vs lefty pitchers.","Platoon advantage is real. Use your specialist.","Waiting until 2-0 means your pitcher is already losing.","Walking puts the go-ahead run on base."],
      explSimple:["Bring in the lefty pitcher! Left-handed batters have a much harder time hitting against left-handed pitchers.","The lefty specialist is there for exactly this situation. Use him!","If you wait too long, the batter might already be winning the at-bat.","Walking the batter puts another runner on base, and that makes things worse."],
      rates:[85,45,25,35],concept:"Lefty-on-lefty matchups give a significant platoon advantage",anim:"strikeout"},
    {id:"m6",title:"Stolen Base Call",diff:2,cat:"plays",
      description:"Bottom 6th, down 1. Fastest guy on 1st, nobody out. Slow pitcher. #3 hitter batting 1-0.",
      situation:{inning:"Bot 6",outs:0,count:"1-0",runners:[1],score:[2,3]},
      options:["Send him","Don't — let #3 drive him in","Hit-and-run","Let the runner decide"],
      best:0,explanations:["Fast runner + slow pitcher + hitter's count = green light. Get into scoring position.","He can drive him in from 2nd too. Scoring position helps.","Hit-and-run is fine but straight steal has better odds here.","Managers make the tactical calls."],
      explSimple:["Send the fast runner! The pitcher is slow, so your runner can easily steal second base.","The batter can still drive in the run from second base, so getting there first is great.","A hit-and-run is okay, but just stealing is simpler and the runner is really fast.","The manager decides when to steal — it's part of the job!"],
      rates:[85,40,55,30],concept:"Give the steal sign when the matchup heavily favors the runner",anim:"steal"},
    {id:"m7",title:"Lineup Construction",diff:1,cat:"pregame",
      description:"Setting your lineup. Leadoff: Player A (.320, speed, walks) vs Player B (.280, 20 HRs, speed).",
      situation:{inning:"Pre",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Player A — OBP machine","Player B — power sets the tone","Alternate by pitcher","Best hitter leads off"],
      best:0,explanations:["Leadoff job = get on base. .320 + walks = highest OBP.","Power at leadoff = lower OBP = fewer baserunners.","OBP should lead off regardless.","Best hitter usually bats 2nd or 3rd in modern lineups."],
      explSimple:["Player A gets on base a lot, and that's exactly what a leadoff hitter needs to do!","The power hitter is great, but the leadoff spot needs someone who gets on base, not someone who hits home runs.","The player who gets on base the most should always bat first.","Your best hitter usually bats second or third, not first."],
      rates:[85,40,50,35],concept:"The leadoff hitter's job is to get on base — OBP is king",anim:"hit"},
    {id:"m8",title:"Challenge the Call",diff:2,cat:"game-management",
      description:"Top 7th, tie. Close play at 1st — ump calls your runner out. Replay looks favorable. 1 challenge left.",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[],score:[3,3]},
      options:["Challenge it","Save for later","Ask the bench coach","Only if clearly wrong"],
      best:0,explanations:["Tie game, 7th inning — every baserunner matters. Use it.","'Saving for later' often means never using it.","Getting input is good but you already think it's favorable. Don't overthink.","Too conservative. If replay looks good, go."],
      explSimple:["The game is tied and it looks like the call was wrong. Challenge it now because every runner matters!","If you save it for later, you might never use it. Use it when it matters!","Don't think too hard about it — if the replay looks good, challenge the call.","Don't be afraid to challenge. If you think the umpire got it wrong, speak up!"],
      rates:[80,35,50,45],concept:"Use challenges when they matter most — don't save them hoping for a better spot",anim:"safe"},
    {id:"m9",title:"Pitching Change Timing",diff:3,cat:"pitching",
      description:"Your starter has thrown 95 pitches through 6. He's been great but his velocity dropped 2mph last inning. Up 2.",
      situation:{inning:"Top 7",outs:0,count:"-",runners:[],score:[4,2]},
      options:["Pull him — velocity drop is a red flag","Let him start the 7th","Let him face one more batter","Go to the bullpen after he allows a baserunner"],
      best:3,explanations:["Pulling a dominant pitcher with no runners is premature.","Letting him pitch without a plan is risky. Velocity drop means fatigue.","One more batter isn't a real plan.","Smart! Let him start the inning but have someone ready. First baserunner = bullpen. Balances his dominance with the fatigue signs."],
      rates:[40,45,35,85],concept:"Have a short leash plan: let dominant pitchers continue but act on the first sign of trouble",anim:"strike"},
    {id:"m10",title:"Closer Usage",diff:2,cat:"pitching",
      description:"Top 9th, up by 3. Your closer hasn't pitched in 4 days. Use him or save him?",
      situation:{inning:"Top 9",outs:0,count:"-",runners:[],score:[6,3]},
      options:["Use the closer","Save him for a closer game","Use a setup man","Use whoever's freshest"],
      best:2,explanations:["A 3-run lead doesn't need your best arm. Save him.","Smart thinking — but you still need a competent reliever.","Correct! The setup man can handle a 3-run lead. Save the closer for a 1-run game tomorrow.","Freshest isn't always best in the 9th. Use the setup man who's built for high leverage."],
      explSimple:["You're winning by three runs — you don't need your best pitcher. Save him for a closer game.","Saving him is smart, but you still need a good pitcher to finish the game.","Use your setup man! He can handle a big lead, and you'll need your closer when the game is tight.","Just because a pitcher is rested doesn't mean he's the right choice. Use the setup man."],
      rates:[35,50,85,45],concept:"Save your closer for tight games — setup men can handle comfortable leads",anim:"strike"},
    {id:"m11",title:"When to Call Timeout",diff:1,cat:"in-game",
      description:"Your pitcher just gave up back-to-back singles. He's shaking his head on the mound. The cleanup hitter is up. What do you do?",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[1,2],score:[4,2]},
      options:["Let him figure it out — he's a competitor","Visit the mound to slow things down and refocus him","Immediately pull him for a reliever","Yell encouragement from the dugout"],
      best:1,explanations:["Good competitors can lose focus. A visit slows the game and resets the mental clock.","A mound visit breaks the opponent's momentum, gives your pitcher a breather, and lets you remind him of the game plan. Sometimes all a pitcher needs is a moment to breathe.","Back-to-back singles aren't a crisis. Save the bullpen unless he's clearly done.","Yelling from the dugout doesn't slow the game or provide real support."],
      explSimple:["Even tough pitchers need help sometimes. Don't just let him struggle alone.","Go visit the mound! It gives your pitcher a chance to take a deep breath and calm down. Sometimes that's all he needs.","Two hits don't mean the pitcher is done. Don't pull him yet — just go talk to him.","Yelling from far away doesn't really help. Go out to the mound and talk to him."],
      rates:[25,85,30,20],concept:"Mound visits break momentum and refocus your pitcher — use them strategically",anim:"strike"},
    {id:"m12",title:"Batting Order Basics",diff:1,cat:"lineup",
      description:"You're setting your lineup. Where should your fastest player who gets on base a lot bat?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Leadoff (1st)","3rd in the order","Cleanup (4th)","9th (last)"],
      best:0,explanations:["Leadoff! Your fastest, highest-OBP player bats first. Their job is to get on base and score. The leadoff hitter gets the most at-bats over a season.","3rd is traditionally for your best all-around hitter, not necessarily the fastest.","Cleanup is for your power hitter — the one who drives in runs, not steals bases.","9th is usually your weakest hitter (or a second leadoff in NL before universal DH)."],
      rates:[85,35,20,15],concept:"Leadoff hitter = speed + on-base ability. They set the table for the whole lineup",anim:"advance"},
    // Batch 1 — Pitching Changes
    {id:"m13",title:"Starter Getting Tired",diff:1,cat:"pitching",
      description:"Top of the 7th, your starter has thrown 90 pitches. He gave up a double last inning and his fastball is losing velocity. Score is 4-2 your lead.",
      situation:{inning:"Top 7",outs:0,count:"-",runners:[],score:[4,2]},
      options:["Pull him — go to your bullpen","Let him start the 7th and see how it goes","Leave him in — he's earned the right to finish","Ask him how he feels"],
      best:0,explanations:["At 90 pitches with declining velocity and a hit given up, it's time to go to the bullpen. Pitchers' injury risk and hit rate both spike after 90 pitches. Protect the lead and protect your pitcher's arm.","Letting him 'see how it goes' often means watching a lead disappear. By the time he gives up a run, you're bringing in a reliever with runners on and pressure.","Earning the right to finish doesn't apply when his stuff is declining. A fresh reliever protects the lead better than a tired starter.","Asking a pitcher how he feels always gets the same answer — 'I'm fine.' Pitchers never want to come out. That's YOUR job as manager."],
      rates:[85,35,25,40],concept:"When a starter's velocity drops and pitch count is high, go to the bullpen — protect the lead and the arm",anim:"freeze"},
    {id:"m14",title:"Back-to-Back Hits",diff:1,cat:"pitching",
      description:"Bot 5th, your pitcher just gave up back-to-back singles. Runners on 1st and 2nd, nobody out. He looked sharp before that. Score tied 3-3.",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[1,2],score:[3,3]},
      options:["Go get him — it's falling apart","Send the pitching coach to settle him down","Leave him alone — two hits happen","Warm someone up but leave him in"],
      best:3,explanations:["Two hits don't necessarily mean it's falling apart. Good pitchers give up hits — it's how they respond that matters.","A mound visit now is premature. Save your mound visits for when you really need them (you only get a limited number per game).","Leaving him alone AND not warming anyone up is risky. What if the next batter gets a hit too?","Smart! Warm up a reliever in the bullpen as insurance, but let your pitcher work through it. Two hits aren't a disaster — he's been sharp all game. If he gives up another hit or walks someone, your reliever is ready. This protects against both scenarios."],
      rates:[30,40,25,85],concept:"After back-to-back hits, warm up a reliever but let your pitcher try to work out of it",anim:"freeze"},
    {id:"m15",title:"Shutout but High Pitch Count",diff:1,cat:"pitching",
      description:"Top of the 7th, your starter is throwing a shutout — 0 runs on 3 hits. But he's already at 105 pitches. Do you let him finish?",
      situation:{inning:"Top 7",outs:0,count:"-",runners:[],score:[5,0]},
      options:["Pull him — 105 pitches is enough","Let him go one more inning","Leave him in to finish the shutout","Let him face one more batter and decide"],
      best:0,explanations:["A shutout is special, but arm health is more important than stats. At 105 pitches, injury risk increases significantly. Your bullpen can hold a 5-0 lead for three innings. Protect your pitcher for the future.","One more inning could mean 120+ pitches. That's dangerous territory for any pitcher, especially a young one.","Finishing the shutout feels great today but a torn ligament hurts for a year or more. The win is what matters, not who throws the last pitch.","He's already at 105. The decision should already be made. Take him out and celebrate the great outing."],
      rates:[85,35,20,30],concept:"Pitch count matters more than stats — protect your pitcher's arm even during a shutout",anim:"freeze"},
    {id:"m16",title:"Lefty-Righty Matchup",diff:2,cat:"pitching",
      description:"Top of the 8th, your righty reliever is on the mound. He just got the first out. But now a tough left-handed hitter is coming up. You have a lefty specialist in the bullpen.",
      situation:{inning:"Top 8",outs:1,count:"-",runners:[],score:[4,3]},
      options:["Bring in the lefty specialist","Leave the righty in — he just got an out","Let the righty face the lefty, then bring in the lefty for the next hitter","Wait to see how the at-bat starts"],
      best:0,explanations:["The platoon advantage is real — left-handed pitchers get left-handed hitters out at a significantly higher rate than right-handed pitchers do. This is exactly the situation your lefty specialist exists for.","Getting one out doesn't mean the righty will get this tough lefty out. The matchup favors the hitter against a same-side disadvantage.","Waiting to use the lefty means the tough lefty gets to face a righty — that's backwards. Use the advantage NOW.","Waiting wastes the platoon advantage. The time to make the switch is before the at-bat, not during it."],
      rates:[85,35,25,30],concept:"Use the platoon advantage — lefty specialists exist to get tough left-handed hitters out",anim:"freeze"},
    {id:"m17",title:"Reliever Came Back — Send Him Out Again?",diff:2,cat:"pitching",
      description:"Top of the 8th, your reliever was lights out in the 7th — struck out the side. He's thrown 15 pitches. Do you send him back out for the 8th?",
      situation:{inning:"Top 8",outs:0,count:"-",runners:[],score:[5,3]},
      options:["Send him back out — he's dealing","Bring in a fresh arm for the 8th","Let him start the 8th but have someone warming","Only send him out if the closer isn't available"],
      best:2,explanations:["Sending him back out makes sense, but you need a backup plan. What if the top of their order gets to him the second time through?","A fresh arm isn't necessary when your guy struck out the side on just 15 pitches. Don't fix what isn't broken.","Let him ride the wave but have insurance. He's sharp and only threw 15 pitches, so he should start the 8th. But have someone warming in case the top of the order adjusts. This covers both scenarios without wasting an arm.","Closer availability shouldn't affect whether your setup man goes back out. Manage each inning independently."],
      rates:[50,25,85,35],concept:"If your reliever is sharp on a low pitch count, send him back out — but have someone warming just in case",anim:"freeze"},
    {id:"m18",title:"Bases Loaded Jam — Pull or Stay?",diff:2,cat:"pitching",
      description:"Bot 6th, bases loaded, 1 out. Your pitcher walked the last batter to load the bases. He's thrown 80 pitches. Their #4 hitter is up. Score 4-3 your lead.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[1,2,3],score:[4,3]},
      options:["Pull him now — bring in a fresh arm","Leave him in — let him pitch out of his own mess","Send the pitching coach for a mound visit first","Pull him only if he falls behind in the count"],
      best:0,explanations:["Your pitcher just walked a batter to load the bases — he's struggling. Bringing in a fresh reliever to face their cleanup hitter gives you the best chance of getting out of this jam. Don't let pride cost you the game.","Letting a struggling pitcher face the other team's best hitter with the bases loaded is a recipe for disaster. The walk showed he's losing it.","A mound visit delays the decision but doesn't change the reality — he just loaded the bases. Make the move.","Waiting until he falls behind means you're already in deeper trouble. The time to act is now."],
      rates:[85,25,35,30],concept:"In a bases-loaded jam after a walk, bring in a fresh arm — don't let a struggling pitcher face their best hitter",anim:"freeze"},
    {id:"m19",title:"Closer Pitched Two Days in a Row",diff:2,cat:"pitching",
      description:"Top of the 9th, you have a 3-run lead. Your closer has pitched the last 2 days (25 pitches total). It's a save situation. Do you use him?",
      situation:{inning:"Top 9",outs:0,count:"-",runners:[],score:[6,3]},
      options:["Use your closer — it's a save situation","Rest him — use your setup man to close","Use the closer only if the tying run gets to the plate","Bring in your closer but pull him early if he struggles"],
      best:1,explanations:["Using your closer three days in a row risks injury and burnout. With a 3-run cushion, your setup man should be able to handle it.","Smart! A 3-run lead gives you a cushion. Your setup man or another reliever can close this game while your closer rests. If it was a 1-run lead, you might use the closer. But 3 runs gives you flexibility to protect his arm for tomorrow.","Waiting until the tying run reaches the plate means your closer enters in a higher-pressure spot — worse for a tired arm.","Starting him and pulling him early wastes his availability for tomorrow without getting full value."],
      rates:[35,85,40,25],concept:"With a big lead, rest your closer — save him for closer games tomorrow",anim:"freeze"},
    {id:"m20",title:"No-Hitter Through 6 — High Pitch Count",diff:3,cat:"pitching",
      description:"Top of the 7th, your starter has a no-hitter going through 6 innings. But he's thrown 105 pitches. He walked 4 batters. Score is 2-0.",
      situation:{inning:"Top 7",outs:0,count:"-",runners:[],score:[2,0]},
      options:["Pull him — 105 pitches with 4 walks means he's laboring","Let him try for the no-hitter — it's special","One more inning, then pull him regardless","Ask him if his arm feels okay"],
      best:0,explanations:["A no-hitter is exciting, but 105 pitches with 4 walks tells you he's not in control. He's working hard for every out. Adding 15-20 more pitches in the 7th risks his arm AND the lead. The smart move is to protect both.","No-hitters are magical, but arm health is permanent. Plus, the 4 walks show he's been wild — a hit is likely eventually. Protect the lead and the arm.","One more inning could mean 125+ pitches. At 105 with 4 walks, he's already past the safe zone.","Pitchers always say they feel fine. The data (105 pitches, 4 walks) tells you more than his pride does."],
      rates:[85,20,30,25],concept:"Pitch count and control matter more than chasing a no-hitter — protect the arm and the win",anim:"freeze"},
    {id:"m21",title:"Best Reliever — Use Now or Save?",diff:3,cat:"pitching",
      description:"Bot of the 6th, runners on 1st and 3rd, 1 out. Your best reliever is available, but it's only the 6th. Their best hitter is at the plate. Score tied 3-3.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[1,3],score:[3,3]},
      options:["Use him now — this is the highest-leverage moment","Save him for the 8th or 9th","Use your second-best reliever now","Bring in your best but only for this batter"],
      best:0,explanations:["This is the moment that decides the game — runners on the corners, their best hitter up, tie game. Your best reliever should face the highest-leverage situation, NOT the last three outs. Analytics prove that saves are overrated — leverage is what matters.","Saving him for a hypothetical future situation when a REAL crisis is happening right now is bad managing. What if you never have a lead to protect?","Your second-best reliever against their best hitter in the biggest moment is a mismatch. Use your ace.","Using him for just one batter is possible, but if he gets this out, you might want him for the next batter too. Let him work."],
      rates:[85,20,35,50],concept:"Use your best reliever in the highest-leverage situation — that's not always the 9th inning",anim:"freeze"},
    {id:"m22",title:"Lefty-Righty vs Switch Hitter",diff:3,cat:"pitching",
      description:"Top of the 8th, 1 out, runner on 2nd, up 5-4. Their best hitter is a switch hitter. You have both a lefty and righty reliever available. Does the platoon advantage apply?",
      situation:{inning:"Top 8",outs:1,count:"-",runners:[2],score:[5,4]},
      options:["Bring in the lefty — force him to bat righty","Bring in the righty — force him to bat lefty","It doesn't matter — switch hitters negate the platoon","Bring in whoever has been pitching better lately"],
      best:3,explanations:["Bringing in the lefty forces a righty at-bat, but if the switch hitter is better from the right side, you've helped him.","Same logic — you might be forcing him into his stronger side.","It matters a little, but not in the traditional platoon way. Switch hitters do often have a weaker side.","Smart! Against switch hitters, the traditional platoon advantage is reduced. Instead, use the reliever who has been the most effective recently, regardless of handedness. The pitcher's current form, stuff, and confidence matter more than which side the batter stands on."],
      rates:[30,30,35,85],concept:"Against switch hitters, use your most effective reliever — handedness matters less than performance",anim:"freeze"},
    // Batch 2 — Offensive Strategy Calls
    {id:"m23",title:"Sacrifice Bunt or Swing Away?",diff:1,cat:"plays",
      description:"Bot 7th, runner on 1st, nobody out, down 3-2. Your #8 hitter is at the plate — he's batting .190 today. The tying run is on first.",
      situation:{inning:"Bot 7",outs:0,count:"-",runners:[1],score:[2,3]},
      options:["Bunt the runner to second","Let him swing away","Hit and run","Have him take pitches and hope for a walk"],
      best:0,explanations:["With a weak hitter up and the tying run on first, the sacrifice bunt is the smart play. Move the runner to second (scoring position) so a single from your #9 or leadoff hitter ties the game. You're trading a weak at-bat for a runner in scoring position.","A .190 hitter is more likely to make an out than get a hit. Use that out productively — advance the runner.","A hit and run with a .190 hitter is risky — if he misses, the runner gets thrown out stealing.","Hoping for a walk is too passive in a one-run game."],
      rates:[85,30,25,20],concept:"With a weak hitter and a runner to advance, the sacrifice bunt is a productive out",anim:"bunt"},
    {id:"m24",title:"Down by One in the 9th — Bunt or Hit?",diff:1,cat:"plays",
      description:"Bot 9th, runner on 1st, nobody out, down 4-3. Your leadoff hitter just singled. Your #2 hitter is at the plate — he's a good contact guy who's been hitting well.",
      situation:{inning:"Bot 9",outs:0,count:"-",runners:[1],score:[3,4]},
      options:["Sacrifice bunt — move the runner to scoring position","Let him hit — he's been hot","Hit and run — put pressure on the defense","Have him bunt for a hit — get two runners on"],
      best:1,explanations:["Bunting gives away an out when your #2 hitter has been hitting well. You're turning your good hitter into a free out for the defense.","Let your hot hitter swing! He's your #2 hitter because he's one of your best bats. A single puts runners on 1st and 3rd with nobody out. A double ties or wins the game. Don't waste good at-bats on sacrifice bunts.","A hit and run is aggressive but restricts the batter's approach. When he's already hitting well, let him pick his pitch.","Bunting for a hit is lower percentage than just letting him swing normally."],
      rates:[40,85,50,30],concept:"Don't sacrifice bunt with your good hitters — let them swing and produce",anim:"hit"},
    {id:"m25",title:"Bases Loaded, Nobody Out — Squeeze?",diff:1,cat:"plays",
      description:"Top of the 4th, bases loaded, nobody out, up 2-0. Your #6 hitter is at the plate. The pitcher has been wild.",
      situation:{inning:"Top 4",outs:0,count:"-",runners:[1,2,3],score:[2,0]},
      options:["Squeeze bunt — guarantee a run","Let him swing — bases loaded with a wild pitcher","Hit and run","Take all the way — walk forces a run"],
      best:1,explanations:["A squeeze bunt with bases loaded and nobody out limits you to one run. With nobody out and a wild pitcher, you could score 3-4 runs this inning.","With bases loaded, nobody out, and a wild pitcher, let your hitter swing. Any hit scores runs. A walk forces a run in. An error scores runs. Everything good can happen — don't limit yourself to one run with a squeeze bunt.","A hit and run with bases loaded is unnecessary — the runners will be moving on contact with nobody out anyway.","Taking is okay if the pitcher is truly wild, but your hitter should be ready to drive a mistake pitch."],
      rates:[30,85,20,45],concept:"Bases loaded with nobody out and a wild pitcher — don't squeeze for one run when you can score several",anim:"hit"},
    {id:"m26",title:"Steal or Hit and Run?",diff:2,cat:"plays",
      description:"Bot 5th, runner on 1st, 1 out, tied 2-2. Your fastest player is on first. The pitcher is slow to the plate. Count is 1-0.",
      situation:{inning:"Bot 5",outs:1,count:"1-0",runners:[1],score:[2,2]},
      options:["Straight steal — he's your fastest player","Hit and run — the batter must make contact","Let the batter hit naturally","Sacrifice bunt to move the runner"],
      best:0,explanations:["Your fastest player against a slow pitcher is a stolen base waiting to happen. A straight steal doesn't require the batter to do anything — the runner handles it himself. On 1-0 against a slow pitcher, this is high-percentage.","A hit and run makes the batter swing at whatever comes — it could be a bad pitch. The straight steal is cleaner and doesn't restrict the batter.","Letting the batter hit naturally is fine but doesn't use your speed advantage against the slow pitcher.","A sacrifice bunt with 1 out gives away a precious out. Save bunts for 0-out situations."],
      rates:[85,50,35,20],concept:"With your fastest runner and a slow pitcher, the straight steal is cleaner than a hit and run",anim:"steal"},
    {id:"m27",title:"Down by Three — Steal?",diff:2,cat:"plays",
      description:"Top of the 6th, runner on 1st, nobody out, down 5-2. Your runner is fast. Is this a good time to steal?",
      situation:{inning:"Top 6",outs:0,count:"0-0",runners:[1],score:[2,5]},
      options:["Steal — get in scoring position for a rally","Don't steal — play for a big inning instead","Steal only if the pitcher is slow","Bunt the runner over instead"],
      best:1,explanations:["Down by 3, you need a big inning — multiple runs. Stealing one base doesn't create a big inning. If the runner is thrown out, you've lost a baserunner when you need everyone on base.","When trailing by 3+ runs, you need a rally — multiple baserunners and hits. Stealing risks losing a baserunner for just one base. The math doesn't work: you need at least 3 runs, and each baserunner is precious. Play for the big inning.","The pitcher's speed doesn't change the strategic math. Down by 3, you play for big innings, not small ball.","Bunting gives away an out when you need baserunners. Down by 3, every out is valuable."],
      rates:[30,85,35,15],concept:"Down by 3+, don't steal or bunt — play for a big inning. You need runners, not outs",anim:"safe"},
    {id:"m28",title:"Hit and Run Goes Wrong",diff:2,cat:"plays",
      description:"Bot 3rd, runner on 1st, 1 out, up 3-1. You call the hit and run. The batter swings and misses. The runner is caught stealing. Was it the right call?",
      situation:{inning:"Bot 3",outs:1,count:"1-1",runners:[1],score:[3,1]},
      options:["Bad call — should never have called it","Unlucky — the hit and run was the right play","Should have called a straight steal instead","Only call hit and runs with 2-strike hitters"],
      best:1,explanations:["Just because it didn't work doesn't mean it was the wrong call. Baseball involves probability, not certainty.","The hit and run was a reasonable call — runner on first, 1 out, 1-1 count, your team has a lead. The batter just didn't execute. In baseball, good decisions sometimes lead to bad results. That doesn't make the decision wrong. You'd call it again in the same spot.","A straight steal doesn't put pressure on the defense the same way. The hit and run has more upside when it works.","The hitter's count doesn't determine when to hit and run — the game situation does."],
      rates:[20,85,35,25],concept:"Good strategy sometimes fails — judge decisions by the reasoning, not just the result",anim:"safe"},
    {id:"m29",title:"Slumping Cleanup Hitter",diff:2,cat:"lineup",
      description:"Your cleanup hitter is 0-for-15 over the last 4 games. He's frustrated but he's still your best power hitter. Today's game matters. Do you drop him in the order?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Drop him to 6th — send a message","Keep him at 4th — trust his talent","Move him to 2nd — more at-bats might help","Bench him — give him a day off"],
      best:1,explanations:["Dropping him sends a message of no confidence. A slumping player needs support, not public demotion.","Slumps happen to every hitter. Your cleanup hitter is in the 4-hole because of his season-long performance, not one bad week. Moving him tells the whole team you panic when things go wrong. Trust your guys.","Moving him to 2nd changes the whole lineup dynamic and doesn't fix the slump.","Benching your best power hitter in an important game because of a slump is overreacting. Unless he's hurt, he plays."],
      rates:[25,85,30,20],concept:"Trust your best hitters through slumps — don't panic-move your lineup after a bad week",anim:"freeze"},
    {id:"m30",title:"One Run Game, 8th Inning — Bunt to Third?",diff:3,cat:"plays",
      description:"Bot 8th, runner on 2nd, nobody out, tied 3-3. Your #3 hitter is at the plate. Should you bunt the runner to third?",
      situation:{inning:"Bot 8",outs:0,count:"-",runners:[2],score:[3,3]},
      options:["Bunt to third — set up the sac fly","Let your #3 hitter swing — he can drive the run in","Hit and run — put pressure on the defense","Take a pitch first, then decide"],
      best:1,explanations:["Bunting your #3 hitter is giving away your best bat. He can drive in the run himself with a hit.","Your #3 hitter is in that spot because he's one of your best bats. A hit scores the run. A sac fly scores the run. A ground ball to the right side scores the run. He can do all of these while swinging. Bunting him wastes your best opportunity to score.","A hit and run with a runner on second is unusual and risky.","Waiting a pitch doesn't help the strategic decision. The question is bunt or hit, not what pitch to wait for."],
      rates:[30,85,35,25],concept:"Don't sacrifice your best hitters — they can drive in runs while swinging",anim:"hit"},
    {id:"m31",title:"Intentional Walk to Load the Bases",diff:3,cat:"late-game",
      description:"Top of the 9th, runners on 2nd and 3rd, 1 out, up 5-4. Their #3 hitter is at the plate (.320 avg). The #4 hitter on deck is a power hitter (.240 avg, 30 HRs). First base is open.",
      situation:{inning:"Top 9",outs:1,count:"-",runners:[2,3],score:[5,4]},
      options:["Walk him — load the bases for a force at every base","Pitch to him — .320 is scary but walking him loads the bases","Walk him only if he gets ahead in the count","Bring in a new pitcher instead"],
      best:0,explanations:["Walking the .320 hitter to load the bases is smart here. You set up a force out at every base (including home), the possibility of a double play, and you face a .240 hitter instead. The .240 guy hits for power, but he also strikes out more.","Pitching to a .320 hitter with runners in scoring position is dangerous. He's more likely to drive in runs than the .240 hitter.","Waiting for him to get ahead in the count means he's already winning the at-bat. Make the decision now.","A new pitcher with the bases about to be loaded is high-pressure. Your current pitcher knows the situation."],
      rates:[85,30,35,25],concept:"Walk the better hitter to load the bases — set up forces at every base and face the weaker hitter",anim:"walk"},
    {id:"m32",title:"Pinch Hitter — Now or Save?",diff:3,cat:"substitutions",
      description:"Bot 7th, runner on 2nd, 2 outs, tied 4-4. Your weakest hitter (.150) is due up. You have 2 pinch hitters on the bench — one is solid (.280) and one is your best (.310 but you might need him later).",
      situation:{inning:"Bot 7",outs:2,count:"-",runners:[2],score:[4,4]},
      options:["Use your best pinch hitter (.310) — this situation matters","Use the .280 hitter — save the .310 for later","Let the .150 hitter bat — save both for later","Use neither — call a different play"],
      best:0,explanations:["Use your best hitter NOW. The tying run is in scoring position with 2 outs in a tied game. There's no guarantee you'll get a better situation later. If you save your best bat and never get to use him, you wasted an advantage. The game is decided in moments like this.","The .280 hitter is solid, but this is a key moment. If the .310 hitter can drive in the go-ahead run, the game changes. Don't save your best weapon for a situation that might not come.","Letting a .150 hitter bat in this spot is malpractice. You have better options — use them.","There's no play that replaces a good at-bat. Use your pinch hitter."],
      rates:[85,55,10,15],concept:"Use your best pinch hitter in the current big moment — don't save him for a situation that may never come",anim:"hit"},
    // Batch 3 — Defensive Strategy
    {id:"m33",title:"Late Game Defense — Sub in Glove Man?",diff:1,cat:"defense",
      description:"Top of the 9th, your team is up 3-2. Your left fielder has been great at the plate (2-for-3) but he's not a good defender. You have a great defensive outfielder on the bench.",
      situation:{inning:"Top 9",outs:0,count:"-",runners:[],score:[3,2]},
      options:["Sub in the defensive replacement","Leave the hitter in — his bat might be needed","Only sub if a runner gets on base","Sub in the defense for the last out only"],
      best:0,explanations:["In the 9th inning with a 1-run lead, defense is more important than offense. You're not going to bat again (you're winning). A defensive replacement in left field could be the difference between a routine catch and a ball dropping for a hit. Protect the lead with your best glove.","His bat doesn't matter — you're on defense protecting a lead. You likely won't bat again unless the game goes to extras.","Waiting until a runner is on base is too late — the defensive mistake that put the runner on is exactly what you're trying to prevent.","You can't sub in 'for the last out only' — defensive substitutions last the rest of the game."],
      rates:[85,30,25,10],concept:"In late innings with a lead, defense matters more than offense — bring in your best glove",anim:"catch"},
    {id:"m34",title:"Steal Alert — Warn the Catcher",diff:1,cat:"defense",
      description:"Bot 6th, their fastest runner just reached first. He's stolen 25 bases this season. Your pitcher isn't paying attention. Score is 4-3 your lead.",
      situation:{inning:"Bot 6",outs:0,count:"-",runners:[1],score:[4,3]},
      options:["Call time and tell the catcher to watch for a steal","Tell the pitcher to use the slide step","Call a pitchout on the first pitch","Just let the battery handle it"],
      best:0,explanations:["As a manager, it's your job to recognize threats. Call timeout and remind your catcher that the fastest runner in the league is on first. Make sure the pitcher and catcher are ready for the steal attempt. Communication prevents easy stolen bases.","The slide step helps, but the whole team needs to be aware. Start with communication.","A pitchout on the first pitch is too predictable and puts your pitcher behind 1-0. Save it for later.","Letting the battery handle it when they clearly aren't paying attention is negligent managing."],
      rates:[85,55,25,15],concept:"When a dangerous basestealer reaches base, communicate — make sure your catcher and pitcher are ready",anim:"freeze"},
    {id:"m35",title:"Pull Hitter at the Plate — Shift?",diff:2,cat:"defense",
      description:"Top of the 5th, nobody on, 2 outs, tied 2-2. Their left-handed cleanup hitter is up — he's pulled every ball to the right side today. He's hit 2 hard ground balls to the right.",
      situation:{inning:"Top 5",outs:2,count:"-",runners:[],score:[2,2]},
      options:["Shift — move the shortstop to the right side","Play straight up — standard positioning","Shift slightly — shade toward the right but don't overshift","Only shift with the bases empty"],
      best:2,explanations:["A full shift with the shortstop on the right side is aggressive. If he adjusts and hits the other way, there's nobody on the left side of the infield.","Playing straight up ignores the information you have. He's pulled every ball today.","Shade the infield toward the right side without going to an extreme shift. Move the shortstop a few steps toward second and the second baseman a few steps toward first. This takes away his pull zone while still covering the left side if he adjusts. Smart positioning uses data without overcommitting.","You can shift in any situation. Bases empty is actually the safest time to shift."],
      rates:[40,25,85,20],concept:"Shade your defense based on the hitter's tendencies — use data but don't overcommit",anim:"groundout"},
    {id:"m36",title:"Bunt Defense — Runners on First and Second",diff:2,cat:"defense",
      description:"Bot 3rd, runners on 1st and 2nd, nobody out, tied 1-1. The opposing #8 hitter is at the plate — he's likely going to bunt. What defense do you call?",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[1,2],score:[1,1]},
      options:["Crash the first and third basemen — charge the bunt","Have the third baseman crash, first baseman holds","Standard bunt defense — hold positions","Call the wheel play — rotation defense"],
      best:0,explanations:["With a bunt expected, crash both corner infielders. The first baseman and third baseman charge as the pitch is delivered, giving them the best chance to field the bunt and throw to third to get the lead runner. This is standard bunt defense and gives you the best chance at the out at third.","Having only the third baseman crash means the first baseman is too far back to field a bunt between the mound and first base.","Standard positioning lets the bunt drop and gives the defense less time to make a play. Charge it!","The wheel play is a more complex rotation that works best with practice. Standard crash defense is more reliable."],
      rates:[85,45,20,35],concept:"On bunt defense, crash the corners — the first and third basemen charge to field the bunt quickly",anim:"bunt"},
    {id:"m37",title:"Infield In or Back?",diff:2,cat:"defense",
      description:"Top of the 7th, runner on 3rd, 1 out, up 5-4. The hitter at the plate is a contact hitter with some pop. Do you bring the infield in?",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[3],score:[5,4]},
      options:["Infield in — cut off the run at the plate","Infield back — play for the ground ball out","Infield halfway — compromise position","Corners in, middle back — split the difference"],
      best:3,explanations:["Full infield in gives up a lot of range — ground balls that are normally outs get through. With a 1-run lead and 1 out, that's risky.","Infield back gives up the run on most ground balls. The runner on 3rd scores easily on a grounder to short.","Halfway positioning doesn't give you the range of playing back or the throw home of playing in.","Corners in (1st and 3rd basemen play close) while the middle infielders play at normal depth. The corners can throw home if the ball is hit to them, while the shortstop and second baseman maintain their range. This gives you the best of both worlds."],
      rates:[35,30,25,85],concept:"Corners in, middle back is the best compromise — you can cut off the run AND maintain range",anim:"groundout"},
    {id:"m38",title:"Guard the Lines in the 9th",diff:3,cat:"defense",
      description:"Top of the 9th, nobody on, 2 outs, up 5-3. But the next batter is their best hitter. A double down the line could start a rally.",
      situation:{inning:"Top 9",outs:2,count:"-",runners:[],score:[5,3]},
      options:["Guard the lines — move 1B and 3B closer to the foul lines","Play straight up — don't overadjust","Shift toward the pull side","Bring the outfield in to prevent extra bases"],
      best:0,explanations:["With 2 outs and a 2-run lead in the 9th, guard the lines! A double down the line keeps the inning alive and brings the tying run to the plate. A single through the normal hole is less dangerous. You'd rather give up a single up the middle than a double down the line in this situation.","Playing straight up risks a double down the line that extends the inning in the worst way.","Shifting ignores the extra-base hit risk on the non-pull side.","Bringing the outfield in is for single-run situations. With a 2-run lead, you can afford a single — you can't afford a double."],
      rates:[85,30,25,20],concept:"In the 9th with a lead, guard the foul lines — a double is more dangerous than a single",anim:"catch"},
    {id:"m39",title:"Power Hitter Up — DP or Guard Lines?",diff:3,cat:"defense",
      description:"Bot 8th, runner on 1st, nobody out, up 6-4. Their power hitter is up — he's hit 2 homers today. But a double play ends the threat.",
      situation:{inning:"Bot 8",outs:0,count:"-",runners:[1],score:[6,4]},
      options:["Play for the double play — DP depth","Guard the lines — prevent extra bases","Play straight up — balanced approach","Bring the outfield way back to prevent a homer"],
      best:0,explanations:["With a runner on first and nobody out, the double play is your best friend. Move the middle infielders to DP depth. Yes, the hitter has power and hit 2 homers — but you can't prevent a homer with positioning. What you CAN control is turning a ground ball into two outs. The double play erases the threat completely.","Guarding the lines with a runner on first and nobody out gives up the double play opportunity.","Straight up is neutral but doesn't maximize the DP chance.","Outfield positioning doesn't prevent home runs — the ball goes over their heads regardless. Play the infield for the DP."],
      rates:[85,30,40,15],concept:"With a runner on first and nobody out, play DP depth — a double play erases the threat",anim:"doubleplay"},
    {id:"m40",title:"Outfielder Tired — Defensive Sub?",diff:3,cat:"defense",
      description:"Top of the 9th, up 4-3. Your center fielder has been struggling in the field the last few innings — he misjudged a fly ball in the 7th. You have a solid defensive CF on the bench, but only 2 bench players left.",
      situation:{inning:"Top 9",outs:0,count:"-",runners:[],score:[4,3]},
      options:["Sub in the defensive center fielder — protect the lead","Keep the current CF — save the bench for emergencies","Only sub if a runner gets on base","Move the right fielder to center, sub the RF"],
      best:0,explanations:["Center field is the most important defensive position in the outfield. With a 1-run lead in the 9th and your CF already misjudging fly balls, put in your best defensive center fielder. A ball dropping in center because of a misjudgment could cost you the game.","Saving the bench is less important than winning THIS game. The 9th inning with a 1-run lead is the most important moment.","A misjudged fly ball in center could be the tying run. Don't wait until it's too late.","Moving the right fielder to center disrupts two positions. Just make the straight swap."],
      rates:[85,30,20,25],concept:"In close games, protect center field — it's the most important defensive position in the outfield",anim:"catch"},
    // Batch 4 — Lineup Construction
    {id:"m41",title:"Building the Lineup — What Each Spot Means",diff:1,cat:"lineup",
      description:"You're setting today's lineup. You have 9 players. Your best all-around hitter gets on base and hits for power. Where does he bat?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Third in the order","Leadoff","Cleanup (4th)","Second in the order"],
      best:0,explanations:["The 3-hole hitter is traditionally your best all-around hitter — the guy who hits for average AND power. He bats third because: (1) he gets up in the first inning with runners possibly on from the 1-2 hitters, (2) he has the skills to both get on base and drive in runs, and (3) he gets lots of plate appearances over the course of a season.","Leadoff is for speed and on-base percentage — not your best power hitter.","Cleanup (4th) is for your best POWER hitter — the guy who drives in runs. If your best hitter is an all-arounder, he bats 3rd.","Second is becoming more popular for the best hitter in modern baseball, but traditionally it's for a contact hitter who can hit-and-run."],
      rates:[85,25,35,50],concept:"The 3-hole hitter is your best all-around player — he gets on base and drives in runs",anim:"hit"},
    {id:"m42",title:"Fastest Player — Where Does He Bat?",diff:1,cat:"lineup",
      description:"Your fastest player has great on-base skills (.380 OBP) but not much power. He's perfect for one specific lineup spot.",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Leadoff — he gets on base and uses speed","Cleanup — let him drive in runs","9th — hit him last, save speed for defense","3rd — your best OBP should bat 3rd"],
      best:0,explanations:["Leadoff! Your fastest player with the best on-base skills bats first. His job: get on base, use his speed to steal bases and advance on hits, and score runs. The leadoff hitter gets the most at-bats over a season. Speed + OBP = leadoff hitter.","Cleanup requires power to drive in runs. Speed without power doesn't help in the 4-hole.","Batting 9th wastes his on-base skills and gives him fewer plate appearances.","The 3-hole needs a combination of average AND power. An OBP-only guy belongs at leadoff."],
      rates:[85,10,15,30],concept:"Your fastest player with the best on-base skills bats leadoff — speed + OBP = leadoff hitter",anim:"advance"},
    {id:"m43",title:"Best Hitter vs Best Power Hitter",diff:2,cat:"lineup",
      description:"Your best hitter bats .320 with 15 HRs. Your best power hitter bats .250 with 35 HRs. Where do they bat — 3rd and 4th?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:[".320 hitter bats 3rd, .250 power hitter bats 4th","Power hitter bats 3rd, .320 hitter bats 4th",".320 hitter bats 2nd, power hitter bats 3rd","Both bat wherever they're comfortable"],
      best:0,explanations:["The .320 hitter bats 3rd — he's your best all-around hitter who gets on base and drives in runs. The .250 power hitter bats 4th (cleanup) — his job is to drive in the runners that the 1-2-3 hitters got on base. The 4-hole is for raw power; the 3-hole is for consistency + power.","The power hitter's lower average means he gets on base less. He's better suited to drive in runners from the cleanup spot.","This isn't traditional, though some modern analytics support the best hitter batting 2nd. The traditional answer is 3rd and 4th.","Comfort matters, but lineup construction follows strategic principles for a reason."],
      rates:[85,25,40,15],concept:"Your best hitter bats 3rd (consistency), your best power hitter bats 4th (cleanup, drives in runs)",anim:"hit"},
    {id:"m44",title:"Pitcher Batting — 8th or 9th?",diff:2,cat:"lineup",
      description:"In leagues where pitchers still bat (youth, some college, and international play), where should the pitcher hit in the order — 8th or 9th?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["9th — he's the weakest hitter","8th — so the leadoff hitter is like a second leadoff in the 9th spot","It doesn't matter — he'll make an out either way","Wherever the pitcher feels comfortable"],
      best:0,explanations:["Traditionally, the pitcher bats 9th because he's the weakest hitter. His job is simple: don't hurt the team. If he can bunt, that's a bonus. The 9th spot gets the fewest at-bats, which minimizes the damage of having a weak hitter in the lineup.","Batting the pitcher 8th is a strategy some managers use (Tony La Russa popularized it), but it's controversial. The standard approach is 9th.","It does matter — proper lineup construction maximizes scoring opportunities.","Pitchers should focus on pitching. Bat them 9th and let them focus on what they're good at."],
      rates:[85,50,10,15],concept:"The pitcher bats 9th — the weakest hitter gets the fewest at-bats to minimize damage",anim:"strike"},
    {id:"m45",title:"Platoon Advantage — Who Starts?",diff:2,cat:"lineup",
      description:"The opposing starter is a left-handed pitcher. You have two right fielders: one is right-handed (.280 avg) and one is left-handed (.300 avg overall, but .220 vs lefties).",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Start the righty (.280) — platoon advantage vs the lefty pitcher","Start the lefty (.300) — he's the better overall hitter","Start both somehow — rotate them between RF and DH","Flip a coin — both are good options"],
      best:0,explanations:["Start the right-handed hitter against the left-handed pitcher. Even though the lefty has a higher overall average (.300), he hits only .220 against lefties. The righty (.280) will hit better against this pitcher because of the platoon advantage — right-handed hitters see the ball better from left-handed pitchers.","The lefty's overall .300 is misleading. His .220 vs lefties is the relevant number today.","You can't play two right fielders. The platoon is the right strategy.","This isn't a coin flip — the data clearly favors the righty against a lefty pitcher."],
      rates:[85,25,15,10],concept:"Use the platoon advantage — start the opposite-handed hitter against the opposing pitcher",anim:"hit"},
    {id:"m46",title:"Hot Hitter — Move Him Up?",diff:2,cat:"lineup",
      description:"Your #7 hitter has been on fire this week — 10-for-15 (.667) with 3 doubles and a homer. He normally bats 7th. Should you move him up?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Move him to 5th — ride the hot hand","Keep him at 7th — don't overreact to one week","Move him to 3rd — he's your best hitter right now","Move him to leadoff — more at-bats for the hot bat"],
      best:1,explanations:["Moving him to 5th disrupts the rest of the lineup. Hot streaks are exciting but often regress quickly.","One hot week doesn't change a player's fundamental talent. The lineup is built on season-long performance, not one-week samples. If you move him up, you have to move someone down — and that player might be a better hitter in the long run. Trust your lineup construction and let him keep mashing from the 7th spot.","The 3rd spot is for your best overall hitter, not your hottest-this-week hitter.","Leadoff is for OBP and speed. A hot streak doesn't change his skill set."],
      rates:[30,85,20,15],concept:"Don't rearrange the lineup for one hot week — hot streaks end, but lineup construction is based on talent",anim:"freeze"},
    {id:"m47",title:"Modern Analytics — Best Hitter Bats 2nd?",diff:3,cat:"lineup",
      description:"Your analytics coach says your best hitter should bat 2nd, not 3rd. Modern stats show the 2nd spot gets the best combination of plate appearances and runners on base. Do you listen?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Go with analytics — bat your best hitter 2nd","Stick with tradition — best hitter bats 3rd","Try it for a few games and see how it works","The difference is too small to matter"],
      best:2,explanations:["Going all-in on analytics without testing is risky. Your players might be confused by the change.","Tradition isn't always right. Analytics have improved baseball significantly.","Try it! The best approach is to test the analytical suggestion for a stretch of games and see how it fits your team. Modern analytics DO show that the 2nd spot gets more plate appearances than the 3rd spot over a season and often comes up with runners on base. But every team is different.","The difference can actually amount to several runs over a season. It's worth exploring."],
      rates:[40,30,85,20],concept:"Modern analytics suggest batting your best hitter 2nd — test new ideas, don't blindly follow tradition OR analytics",anim:"freeze"},
    {id:"m48",title:"Too Many Lefties — Adjust?",diff:3,cat:"lineup",
      description:"Your lineup has 6 left-handed batters. Today's opposing pitcher is a tough lefty with a nasty slider. He dominates left-handed hitters.",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Start as many right-handed hitters as possible — platoon","Keep your regular lineup — they're your best players","Mix in 2-3 righties but keep your core lefty hitters","Stack all the lefties together to tire the pitcher"],
      best:2,explanations:["Starting all righties might mean benching much better players just for the platoon advantage.","Keeping all lefties against a tough lefty pitcher is stubborn. The data says they'll struggle.","Mix in 2-3 right-handed hitters from your bench to break up the lefty-on-lefty matchups. Keep your best lefty hitters (your core guys) but replace the weakest lefties with righties who can handle a left-handed pitcher. This balances platoon advantage with overall talent.","Stacking lefties doesn't tire a pitcher — it gives him the same matchup advantage repeatedly."],
      rates:[35,20,85,15],concept:"Against a tough same-side pitcher, mix in opposite-handed hitters but keep your core players",anim:"freeze"},
    // Batch 5 — Game Management
    {id:"m49",title:"Rain Delay — Can Your Pitcher Come Back?",diff:1,cat:"game-management",
      description:"Top of the 5th, your starter was dealing — 8 strikeouts, only 1 hit. Then a 45-minute rain delay hits. The game is about to resume. Can he come back?",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[],score:[4,0]},
      options:["Let him come back — he was dominant","Go to the bullpen — rain delays kill momentum","Let him warm up and decide based on how he looks","Pull him only if the delay was longer than an hour"],
      best:2,explanations:["Letting him come back without checking how he looks after the delay is risky. His arm cooled down.","Going straight to the bullpen wastes a dominant outing. Give him a chance.","Let him throw some warm-up pitches and evaluate. If his velocity is still there and his mechanics look good, send him back out. If he's stiff, laboring, or can't find the zone, go to the bullpen. Rain delays affect every pitcher differently — use your eyes, not a blanket rule.","An arbitrary time limit ignores the reality that some pitchers handle delays better than others."],
      rates:[35,30,85,20],concept:"After a rain delay, let your pitcher warm up and evaluate — use your eyes, not a blanket rule",anim:"freeze"},
    {id:"m50",title:"Losing Big — When to Rest Starters",diff:1,cat:"game-management",
      description:"Bot of the 5th, you're losing 10-1. Your regular players look defeated. Tomorrow is an important game. When do you start pulling starters?",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[],score:[1,10]},
      options:["Pull starters now — save them for tomorrow","Play until the 7th, then pull them","Never give up — play to win every inning","Only pull starters who are injured or tired"],
      best:0,explanations:["Down 10-1 in the 5th with an important game tomorrow, start resting your regulars. Get your bench players game experience and save your starters' legs and arms. There's competing and then there's being strategic — saving your energy for a winnable game tomorrow is the smart move.","Waiting until the 7th wastes two more innings of your starters' energy in a game that's already decided.","Playing to win is admirable, but a 9-run deficit in the 5th is statistically almost impossible to overcome. Be smart.","You don't need to wait for injuries. Strategic rest is smart managing."],
      rates:[85,40,20,30],concept:"In a blowout loss, rest your starters for tomorrow — strategic rest wins more games in the long run",anim:"freeze"},
    {id:"m51",title:"Extra Innings — Manage the Bullpen",diff:2,cat:"pitching",
      description:"Bot of the 9th, the game just went to extra innings — tied 4-4. You've used 3 relievers already. You have 2 left in the bullpen. How do you manage this?",
      situation:{inning:"Bot 9",outs:0,count:"-",runners:[],score:[4,4]},
      options:["Use your best remaining reliever for the 10th","Use your weakest remaining arm — save the best for later","Give the current pitcher one more inning","Use position players to pitch — save the relievers"],
      best:0,explanations:["In extra innings, use your best available arm NOW. There's no guarantee you'll need a pitcher in the 12th if you lose in the 10th. The game could end any inning — win it now with your best stuff.","Saving the best for later assumes the game will go deep into extras. It might end in the 10th — use your best.","The current pitcher might be spent. Fresh arms are more effective.","Position players pitching is for blowouts, not tied games."],
      rates:[85,20,35,5],concept:"In extra innings, use your best available arm — win the game NOW, don't save for hypothetical later innings",anim:"freeze"},
    {id:"m52",title:"Team Made 3 Errors — Keep Morale Up",diff:2,cat:"game-management",
      description:"Top of the 4th, your team has committed 3 errors already. The opposing team scored 4 unearned runs. Your players' heads are down. What do you do?",
      situation:{inning:"Top 4",outs:0,count:"-",runners:[],score:[2,6]},
      options:["Yell at them — they need to focus","Encourage them — errors happen, keep fighting","Bench the players who made errors — send a message","Call a team meeting on the mound"],
      best:1,explanations:["Yelling at players who already feel terrible makes them tighter and more error-prone.","Errors are part of baseball — even MLB players make them. Encouraging your team keeps their confidence up and prevents more errors. Tell them: 'Shake it off, next play. We're still in this game.' Positive energy in the dugout is contagious, and so is negativity. As a manager, you set the tone.","Benching players for errors embarrasses them and doesn't fix the problem. It creates fear of mistakes instead of confidence.","A mound meeting in the 4th inning after errors just draws more attention to the mistakes. Move forward."],
      rates:[10,85,15,30],concept:"After errors, encourage your team — positive energy prevents more mistakes, negativity causes them",anim:"freeze"},
    {id:"m53",title:"Sign Stealing Suspicion",diff:2,cat:"game-management",
      description:"Bot of the 3rd, you notice the opposing team seems to know what pitch is coming. Their hitters aren't swinging at off-speed at all — they're laying off everything not a fastball. You suspect sign stealing.",
      situation:{inning:"Bot 3",outs:0,count:"-",runners:[],score:[3,1]},
      options:["Tell your catcher to change signs immediately","Complain to the umpire about cheating","Test it — have your catcher show one sign and throw another","Keep the same signs — you might be paranoid"],
      best:0,explanations:["If you suspect signs are being stolen, change them immediately. Switch to a multiple-sign system — show 3-4 signs and the second one (or the one after a fist) is the real pitch. This is simple, effective, and doesn't require proof of cheating. Prevention is better than accusations.","Complaining without proof just makes you look paranoid. Fix the problem yourself.","Testing is clever but takes time. Change signs first, then observe.","Keeping the same signs when you suspect they're stolen is negligent."],
      rates:[85,20,50,15],concept:"If you suspect sign stealing, change your signs immediately — prevention is better than accusation",anim:"freeze"},
    {id:"m54",title:"Late Game, Tie — One Run or Big Inning?",diff:2,cat:"game-management",
      description:"Bot 7th, tied 3-3. Runner on 1st, nobody out. Your #6 hitter is up. Do you play for one run (bunt, steal, sac fly) or try for a big inning?",
      situation:{inning:"Bot 7",outs:0,count:"-",runners:[1],score:[3,3]},
      options:["Play for one run — bunt the runner over","Play for a big inning — let your hitters swing","Steal to get the runner in scoring position, then decide","It depends on who's hitting"],
      best:1,explanations:["Bunting in the 7th inning of a tie game gives away an out when you might need a big inning. The other team can just tie it back up if you score one.","In a tie game, play for a big inning. Here's why: if you score one run, the other team gets to bat and might tie it. If you score 2-3 runs, the game is likely over. Don't limit yourself to one run by bunting and playing small ball. Let your hitters swing and try to blow the game open.","Stealing is fine, but the main decision is whether to play small ball or let your hitters hit.","Every hitter should get a chance to swing in a tie game in the 7th."],
      rates:[30,85,45,35],concept:"In a tie game, play for a big inning — one run can be matched. Multiple runs end the game",anim:"hit"},
    {id:"m55",title:"Day Game After Night Game",diff:3,cat:"game-management",
      description:"Your team played a tough night game that ended at 10:30 PM. Today's game is at 1:00 PM — a day game after a night game. Your regulars are tired.",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Rest your regulars — start the bench","Play your regulars — every game matters","Rest 2-3 key players and keep the rest","Only rest players who played the most innings last night"],
      best:2,explanations:["Resting ALL regulars is too extreme unless it's a truly meaningless game.","Playing everyone ignores the reality that tired players perform worse and get injured more easily.","Rest 2-3 key players who played the most or who you need most for tomorrow. Keep the core of your lineup but give your catcher (who caught the whole night game), your closer (who pitched last night), and maybe one position player a day off. Strategic rest keeps your team fresh over a long season.","This is close, but resting 2-3 strategically is better than a rigid rule based only on innings."],
      rates:[25,30,85,40],concept:"After a night game, rest 2-3 key players — strategic rest over a season prevents injuries and burnout",anim:"freeze"},
    {id:"m56",title:"Fighting for Playoffs — Use the Ace on Short Rest?",diff:3,cat:"pitching",
      description:"Final series of the season. You need 2 wins in 3 games to make the playoffs. Your ace pitched 3 days ago (normally needs 4 days rest). Game 1 is today.",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Start the ace on short rest — you need him now","Save the ace for Game 2 on normal rest","Start the ace in Game 1 AND Game 3 if needed","Use the ace as a reliever today, start him Game 2"],
      best:1,explanations:["Short rest increases injury risk significantly and usually reduces effectiveness. Your ace at 85% isn't much better than your #2 starter at 100%.","Save the ace for Game 2 on normal rest. He'll be at full strength and dominant. Start your #2 in Game 1 — you might win anyway. If you lose Game 1, your ace is ready for the must-win Game 2. If you win Game 1, you only need one more win and your ace starts Game 2 with a chance to clinch.","Starting him twice in 3 days would destroy his arm. Never do this.","Using the ace as a reliever wastes his stamina for Game 2."],
      rates:[25,85,10,30],concept:"Save your ace for normal rest — a fully rested ace is more valuable than a tired one on short rest",anim:"freeze"},
    {id:"m57",title:"Bench-Clearing Situation — Handle Conflict",diff:3,cat:"game-management",
      description:"Bot 6th, tensions have been building all game. The pitcher just hit your batter — both benches are yelling. Players are starting to stand up. What do you do as the manager?",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[1],score:[3,4]},
      options:["Run out and yell at the other team — defend your players","Hold your team back — stay calm and don't escalate","Let your players handle it — they're adults","Argue with the umpire to eject the pitcher"],
      best:1,explanations:["Running out and yelling escalates the situation. Brawls lead to ejections and suspensions that hurt YOUR team.","Stay calm and hold your team back. Bench-clearing incidents look dramatic but they HURT teams — ejections, suspensions, and injuries from brawls damage your roster for future games. Protect your players by keeping them on the bench. Let the umpires handle the discipline. Your team wins by winning the game, not by fighting.","Letting it escalate can result in your best players getting ejected or suspended.","Arguing for an ejection might happen naturally, but your first priority is keeping your team out of trouble."],
      rates:[15,85,10,35],concept:"In heated situations, hold your team back — ejections and suspensions hurt more than the other team's pitcher",anim:"freeze"},
    {id:"m58",title:"Infield In — Cut Off the Run",diff:1,cat:"positioning",
      description:"Bot 7th, runner on 3rd, less than 2 outs, tied 3-3. You're the manager. Should you bring the infield in to cut off the run at home?",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[3],score:[3,3]},
      options:["Infield in — stop the run from scoring","Infield back — get the out and worry about the run later","Play normal depth — balanced approach","Only bring the corners in"],
      best:0,explanations:["With the tying or winning run on 3rd and less than 2 outs in a tie game, bring the infield in. Yes, you give up range, but preventing the run from scoring is the priority. A ground ball to a drawn-in infielder gives you a play at home.","Infield back means any ground ball scores the runner from 3rd. In a tie game, you can't afford to let that run score.","Normal depth doesn't give you a throw home on a routine grounder.","Only corners in is a compromise — but in a tie game, you need the full infield in to maximize your chance at the play at home."],
      rates:[85,20,35,50],concept:"With a runner on 3rd in a tie game, bring the infield in — preventing the run is the priority",anim:"groundout"},
  ],
  catcher: [
    {id:"ct1",title:"Pitch Calling — Full Count",diff:2,cat:"pitch-calling",
      description:"Runner on 2nd, 2 outs, full count 3-2. The batter has struck out twice on breaking balls today. What do you call?",
      situation:{inning:"Bot 5",outs:2,count:"3-2",runners:[2],score:[3,2]},
      options:["Fastball — don't walk him","Slider low and away — he's been chasing","Changeup — keep him guessing","Curveball in the dirt — try to get him to chase"],
      best:1,explanations:["A fastball on 3-2 is predictable. Good hitters sit fastball in this count.","He's struck out twice on breaking balls — go back to the well. Make him prove he can lay off.","A changeup that misses is ball four. Too risky with a runner in scoring position.","Curveball in the dirt on 3-2 risks a wild pitch advancing the runner to 3rd on ball four."],
      rates:[45,85,35,30],concept:"Use a hitter's weakness even in full counts — pattern recognition wins",anim:"strikeout"},
    {id:"ct2",title:"Blocking a Pitch in the Dirt",diff:1,cat:"blocking",
      description:"Runner on 3rd, 1 out, tie game. Your pitcher just threw a curveball in the dirt. How do you block it?",
      situation:{inning:"Bot 7",outs:1,count:"1-2",runners:[3],score:[2,2]},
      options:["Drop to both knees and center your body on the ball","Reach out and try to catch it with your mitt","Stay standing and swipe at it","Turn sideways to create a wider wall"],
      best:0,explanations:["Textbook! Drop to knees, tuck chin, center body on ball, keep it in front. Runner stays at 3rd.","Trying to backhand a ball in the dirt often leads to it squirting away. Block first, catch second.","Staying standing leaves a huge gap underneath. The ball will roll to the backstop.","Turning sideways can deflect the ball unpredictably. Square up and smother it."],
      rates:[85,30,15,40],concept:"Block first, catch second — keep your body centered behind the ball in the dirt",anim:"catch"},
    {id:"ct3",title:"Steal Attempt at 2nd",diff:2,cat:"throwing",
      description:"Fast runner on 1st takes off for 2nd on the pitch. Fastball, good location. What's your play?",
      situation:{inning:"Top 3",outs:0,count:"0-1",runners:[1],score:[1,0]},
      options:["Fire to 2nd immediately","Pump fake, then throw","Hold the ball — don't risk a wild throw","Throw to the pitcher for a rundown"],
      best:0,explanations:["Quick transfer, strong throw to 2nd! A 1.9-second pop time gives you the best chance to nail him.","Pump fakes work in football. In baseball they just waste time — the runner is already sliding.","Holding lets him take 2nd for free. Trust your arm.","The runner is already at 2nd by the time the pitcher gets involved. Throw through to the bag."],
      rates:[85,25,30,20],concept:"Quick transfer and pop time under 2.0 seconds is the key to throwing out runners",anim:"throwHome"},
    {id:"ct4",title:"Framing a Borderline Pitch",diff:2,cat:"framing",
      description:"Your pitcher just threw a fastball that caught the outside corner — barely. It could go either way. How do you frame it?",
      situation:{inning:"Top 6",outs:1,count:"2-2",runners:[],score:[3,1]},
      options:["Hold your glove completely still right where you caught it","Pull the mitt toward the center of the zone subtly","Stab at the ball dramatically to show it was a strike","Stand up immediately — show confidence it was a strike"],
      best:1,explanations:["Holding still is solid framing, especially in high-leverage situations. But on a routine borderline pitch like this, a subtle pull can help sell it without being obvious.","On a borderline pitch in a normal count, the best framers 'stick and pull' — catch it cleanly and gently bring it toward the zone. Studies show this adds 20+ called strikes per season. The subtle pull works best when the umpire isn't hyper-focused on your glove.","Stabbing is obvious and umpires hate it. It screams 'I know that was a ball.'","Standing up tells the umpire you're already moving on — but it can also look like you're lobbying."],
      rates:[55,85,15,35],concept:"Elite framing is subtle — catch, stick, and gently guide toward the zone",anim:"strike"},
    {id:"ct5",title:"Pitch Calling — Leadoff Hitter",diff:1,cat:"pitch-calling",
      description:"Top of the 1st inning, nobody on. Leadoff hitter is a contact guy who slaps singles. What's your game plan?",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Start with a first-pitch fastball for a strike","Curveball to surprise him","Pitch around him — he's not a power threat","Changeup low to induce a groundball"],
      best:0,explanations:["Get ahead! First-pitch strikes put the at-bat in the pitcher's control. 0-1 counts favor the pitcher significantly.","Risky to start with off-speed — if he's patient, you're behind 1-0 immediately.","Never pitch around a leadoff hitter. Don't put a free runner on base.","Changeups are great — but on the first pitch, the hitter doesn't have a timing reference yet."],
      rates:[85,40,15,50],concept:"Getting strike one against leadoff hitters sets the tone for the entire inning",anim:"strike"},
    {id:"ct6",title:"Pop-Up Coverage",diff:1,cat:"defense",
      description:"High pop-up near home plate! It's drifting toward the 1st base dugout. Whose ball is it?",
      situation:{inning:"Bot 4",outs:1,count:"0-1",runners:[],score:[1,0]},
      options:["It's the catcher's ball — rip off your mask and get under it","Let the first baseman take it — he has a better angle","Call for the pitcher to catch it","Wait and see who gets there first"],
      best:0,explanations:["That's your ball! Toss your mask AWAY from the play, turn your back to the field, and track the spin. Catchers own all pop-ups near home.","The first baseman would be running away from the ball. You're already facing the right direction.","Pitchers rarely catch pop-ups. This is the catcher's domain.","Waiting causes collisions and dropped balls. Someone has to take charge — and that's you."],
      rates:[85,35,15,20],concept:"Catchers own pop-ups near home — toss mask away, turn to the infield, and take charge",anim:"catch"},
    {id:"ct7",title:"Squeeze Play Defense",diff:3,cat:"defense",
      description:"Runner on 3rd, 1 out, close game. You notice the batter's hands shift on the bat and the runner on third is leaning hard. You suspect a squeeze play is coming on the next pitch.",
      situation:{inning:"Bot 7",outs:1,count:"1-0",runners:[3],score:[4,3]},
      options:["Call for a pitchout to catch the runner","Charge the bunt and fire home","Set up normally and react to whatever happens","Signal the pitcher to throw high and tight — bust the squeeze"],
      best:3,explanations:["A pitchout can catch the runner, but if the batter doesn't bunt, you've just thrown a ball for no reason. It also doesn't make the bunt harder if they do squeeze.","If you charge before the bunt, you leave home plate uncovered. You need to stay back.","Reacting is too passive when you've spotted the squeeze coming. You have the advantage of reading it early — use it.","High and tight makes the bunt almost impossible. The runner is committed and dead to rights. This is how you kill a squeeze — a pitch up and in is nearly unbuntable."],
      rates:[40,20,25,85],concept:"The best squeeze defense is pitching high and inside — it's nearly impossible to bunt",anim:"strike"},
    {id:"ct8",title:"Pitch Calling — Power Hitter",diff:2,cat:"pitch-calling",
      description:"Cleanup hitter, known for pulling inside pitches. Count is 1-1. How do you attack him?",
      situation:{inning:"Bot 3",outs:0,count:"1-1",runners:[1],score:[2,1]},
      options:["Fastball inside — challenge him","Slider away — make him reach","Changeup inside — he'll pull it foul","Curveball right down the middle — surprise him"],
      best:1,explanations:["He thrives on inside pitches. Don't feed his strength.","Work the outer half! If he pulls everything, make him beat you the other way. Most power hitters are weakest on pitches away.","Inside changeup still gives him something to turn on.","Hanging a curve over the plate to a power hitter? That's a souvenir in the stands."],
      rates:[25,85,45,15],concept:"Pitch away from a pull hitter's strength — make them beat you the opposite way",anim:"strike"},
    {id:"ct9",title:"Runner on 3rd — Throw Down to 2nd",diff:3,cat:"throwing",
      description:"Runner on 3rd, 2 outs. Your pitcher just struck out the batter. Do you throw down to 2nd base?",
      situation:{inning:"Top 5",outs:2,count:"-",runners:[3],score:[2,1]},
      options:["Throw to 2nd — routine play after a strikeout","Hold the ball — the runner on 3rd might go","Fake the throw to 2nd to freeze the runner","Throw back to the pitcher quickly"],
      best:1,explanations:["Never throw to 2nd with a runner on 3rd! If the throw gets away or the runner breaks, he scores.","Smart! With a runner on 3rd, hold the ball. Any throw is a chance for a mistake and a free run.","A fake throw can work but it's risky if the runner doesn't freeze.","Throwing back to the pitcher is safe, but be aware of the runner's lead."],
      rates:[10,85,45,55],concept:"Never make an unnecessary throw with a runner on 3rd — any error scores a run",anim:"catch"},
    {id:"ct10",title:"Pitch Calling — Two Strikes",diff:2,cat:"pitch-calling",
      description:"Count is 0-2. The batter has been late on fastballs all night. Runner on 1st. What do you call?",
      situation:{inning:"Top 6",outs:1,count:"0-2",runners:[1],score:[3,2]},
      options:["Fastball up and in — he can't catch up to it","Waste a pitch in the dirt, then come back with heat","Slider on the outside corner — finish him","Changeup — change his eye level"],
      best:1,explanations:["He's late on fastballs, but don't groove one. 0-2 gives you room to expand.","Perfect! Waste one to expand the zone, THEN finish him. You have two strikes to play with — use that advantage.","Going right for the corner on 0-2 is a mistake if you miss back over the plate.","Changeup is fine but you want to set up the put-away pitch with a ball first."],
      rates:[45,85,50,55],concept:"On 0-2, waste a pitch to expand the zone — then go for the strikeout",anim:"strikeout"},
    {id:"ct11",title:"Communication — Positioning",diff:1,cat:"defense",
      description:"Left-handed pull hitter at the plate. Your infielders haven't shifted. What do you do?",
      situation:{inning:"Bot 2",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Nothing — fielders should know their positioning","Signal the infield to shift toward the pull side","Call time and physically walk out to reposition them","Yell positioning adjustments from behind the plate"],
      best:3,explanations:["As catcher, YOU are the field general. You can see the whole field — take charge.","Subtle signals might not be seen or understood in-game.","Calling time slows the game and tips off the batter about the upcoming shift.","Catchers are the field generals! Quick verbal calls to shift the defense are your job. You see the whole field."],
      rates:[20,45,40,85],concept:"The catcher is the field general — direct defensive positioning from behind the plate",anim:"catch"},
    {id:"ct12",title:"Passed Ball Prevention",diff:2,cat:"blocking",
      description:"Runner on 2nd, 2 outs, pitcher's count 1-2. Your pitcher wants to throw a hard curveball. How do you set up?",
      situation:{inning:"Bot 8",outs:2,count:"1-2",runners:[2],score:[5,4]},
      options:["Set up normally and react to the bounce","Pre-shift your weight forward, ready to drop and block","Set the target low to keep the pitch down","Move your target up — don't risk a pitch in the dirt"],
      best:1,explanations:["Reacting after the ball bounces is too late. You need to anticipate.","Get your weight forward and be READY to block before the pitch. Great catchers expect to block curveballs in the dirt. Prevention starts before the pitch.","A low target is fine, but you need body preparation, not just glove positioning.","Moving the target up might cause the pitcher to leave the curve flat — a mistake to hit."],
      rates:[30,85,45,25],concept:"Anticipate the block before the pitch — pre-shift weight and be ready for dirt",anim:"catch"},
    {id:"f33",title:"Runner on First — Call a Pickoff?",diff:1,cat:"infield",
      description:"Top of the 4th, runner on 1st, 1 out, tied 2-2. Your pitcher is ignoring the runner and the runner keeps taking bigger leads. You're the catcher.",
      situation:{inning:"Top 4",outs:1,count:"0-0",runners:[1],score:[2,2]},
      options:["Call for a pickoff throw to first","Call a pitchout","Ignore the runner — focus on the batter","Throw down to first yourself after the pitch"],
      best:0,explanations:["When the runner gets comfortable with big leads and your pitcher isn't holding him close, call for a pickoff! Signal your pitcher to throw to first base. Even if you don't get the runner out, it shortens his lead and makes him think twice about stealing.","A pitchout is a ball — it puts your pitcher behind in the count. A pickoff attempt doesn't cost a ball.","Ignoring a runner who's taking huge leads is asking for a stolen base. Keep him honest.","Throwing behind the runner after a pitch rarely works — the runner is usually moving back already."],
      rates:[85,35,20,30],concept:"When a runner takes big leads, call for a pickoff — keep him honest even if you don't get him",anim:"catch"},
    {id:"f34",title:"Ball in the Dirt — Block It",diff:1,cat:"infield",
      description:"Bot 5th, runner on 3rd, 1 out, down 3-2. Your pitcher throws a curveball that bounces in the dirt right in front of you. The runner on 3rd is watching.",
      situation:{inning:"Bot 5",outs:1,count:"1-2",runners:[3],score:[2,3]},
      options:["Try to catch it cleanly","Drop to your knees and block it — keep it in front of you","Reach down and backhand it","Move to the side to avoid it"],
      best:1,explanations:["Trying to catch a ball in the dirt often leads to it getting past you. If it gets past, the runner on 3rd scores.","Drop to your knees, tuck your chin, and make yourself as wide as possible. The goal isn't to catch it — it's to keep it in front of you. With a runner on 3rd, a passed ball scores a run. Blocking is the most important skill a catcher has.","Backhanding a ball in the dirt is unreliable. If you miss, the runner scores. Block it with your body.","Moving away from the ball lets it go to the backstop. The runner scores easily."],
      rates:[25,85,20,5],concept:"With runners on base, block balls in the dirt — drop to your knees and keep it in front of you",anim:"catch"},
    {id:"f35",title:"Pop-Up Near the Backstop",diff:1,cat:"infield",
      description:"Top of the 3rd, nobody on, 2 outs. The batter pops up a foul ball drifting toward the backstop. You're the catcher. Whose ball is it?",
      situation:{inning:"Top 3",outs:2,count:"1-2",runners:[],score:[1,0]},
      options:["Your ball — catchers take all pop-ups near home","Let the pitcher get it — he's closer","Call off the first baseman — it's your territory","Wait and see who gets there first"],
      best:0,explanations:["Foul pop-ups near home plate are the catcher's ball. Rip off your mask, find the ball, and call everyone off. You have the best angle on pop-ups behind and around home plate because you're already facing the right direction.","The pitcher should be backing up, not fielding pop-ups behind home. That's your job.","You should call off the first baseman, but more importantly — it's YOUR ball to catch, not just to direct traffic.","Waiting creates confusion and lets easy outs drop. Someone has to take charge, and near home plate, that's always the catcher."],
      rates:[85,15,50,10],concept:"Pop-ups near home plate are the catcher's ball — rip off the mask, call everyone off, and catch it",anim:"catch"},
    {id:"f36",title:"Batter Keeps Fouling Off Pitches",diff:2,cat:"infield",
      description:"Bot 6th, nobody on, 2 outs, up 4-3. Count is 1-2 but the batter has fouled off your last 4 pitches. He keeps fighting off your fastball. What do you call?",
      situation:{inning:"Bot 6",outs:2,count:"1-2",runners:[],score:[4,3]},
      options:["Keep throwing fastballs — eventually he'll miss","Change speeds — call for a changeup or curveball","Move the pitch location — go inside if you've been outside","Waste a pitch way out of the zone"],
      best:1,explanations:["If he's fouling off your fastball, he's timed it. Throwing more of the same pitch at the same speed just gives him more chances to connect.","When a hitter keeps fouling off your fastball, he's ON your fastball. Change speeds! A changeup or curveball arrives 8-15 mph slower and completely disrupts his timing. That's how you get the swing-and-miss after a long battle.","Moving location helps, but if he's timed the speed, he'll foul it off anywhere in the zone. Change SPEED, not just location.","Wasting a pitch after a 7-pitch at-bat just adds to the count. Go for the strikeout with a speed change."],
      rates:[25,85,45,30],concept:"When a batter is fouling off your fastball, change speeds — a changeup disrupts his timing",anim:"strikeout"},
    {id:"f37",title:"Mound Visit — Pitcher Losing Control",diff:2,cat:"infield",
      description:"Top of the 4th, your pitcher just walked back-to-back batters. Runners on 1st and 2nd, nobody out. He looks frustrated. You're the catcher — time for a mound visit.",
      situation:{inning:"Top 4",outs:0,count:"-",runners:[1,2],score:[3,2]},
      options:["Tell him to calm down and throw strikes","Remind him of the game plan — get a ground ball for a DP","Joke around to lighten the mood, then talk strategy","Yell at him to focus"],
      best:2,explanations:["Telling someone to 'calm down' rarely works. It often makes them more tense.","Going straight to strategy is fine, but a frustrated pitcher might not hear you if he's still in his head.","A quick joke or light moment breaks the tension and resets his mental state. Then talk strategy: 'Hey, let's get a ground ball — sinker down, double play, we're out of this.' The mood shift followed by a clear plan is the best mound visit.","Yelling at your pitcher destroys his confidence. Build him up, don't tear him down."],
      rates:[35,50,85,10],concept:"On mound visits, lighten the mood first, then give a clear plan — frustrated pitchers need a reset",anim:"freeze"},
    {id:"f38",title:"Wild Pitch Recovery",diff:2,cat:"infield",
      description:"Bot 7th, runner on 3rd, 2 outs, tied 5-5. Your pitcher's curveball gets away — wild pitch to the backstop! The runner from 3rd is sprinting home. You're the catcher.",
      situation:{inning:"Bot 7",outs:2,count:"1-1",runners:[3],score:[5,5]},
      options:["Sprint to the ball, pick it up, and throw to the pitcher covering home","Sprint to the ball, pick it up, and dive back to tag the runner","Sprint to the ball and rush a throw home","Sprint to the ball and hold it — the runner already scored"],
      best:0,explanations:["On a wild pitch with a runner on 3rd, the pitcher MUST cover home plate. Sprint to the backstop, pick up the ball, and throw to your pitcher who should be standing on home plate ready for the tag. This is a practiced play.","Trying to dive back and tag the runner yourself takes too long. By the time you get the ball and turn around, the runner is already home.","Rushing a throw from the backstop to an empty home plate (no one covering) just throws the ball into the field.","Never give up on a play! Even if it looks hopeless, the pitcher covering home gives you a chance to save the run."],
      rates:[85,25,20,15],concept:"On wild pitches, the catcher gets the ball and the pitcher covers home — it's a team play",anim:"throwHome"},
    {id:"f39",title:"Batter Peeks at Your Signs",diff:3,cat:"infield",
      description:"Top of the 5th, nobody on, 1 out, up 3-1. You notice the batter keeps glancing down at your hand as you set up. He's trying to see what pitch you're calling.",
      situation:{inning:"Top 5",outs:1,count:"0-0",runners:[],score:[3,1]},
      options:["Ignore it — he can't really see your signs","Change your signs to a more complex system","Call the opposite of what you show — fake him out","Tell the umpire to make him stop"],
      best:2,explanations:["Ignoring it gives the batter free information. If he can read even one sign, he knows what's coming.","Changing to complex signs is smart long-term, but right now you can use his peeking against him immediately.","If the batter is peeking, show him one sign and call another. Flash a fastball sign but set up for a changeup. He'll be expecting heat and get fooled by the speed change. Turn his cheating into your advantage.","The umpire may warn him, but the smarter play is to exploit his peeking to your benefit."],
      rates:[15,50,85,30],concept:"If a batter peeks at your signs, show one pitch and call another — use his cheating against him",anim:"strikeout"},
    {id:"f40",title:"Runner on Second Sees Your Signs",diff:3,cat:"infield",
      description:"Bot 3rd, runner on 2nd, nobody out, tied 2-2. You realize the runner on second might be relaying your pitch signs to the batter. What do you do?",
      situation:{inning:"Bot 3",outs:0,count:"0-0",runners:[2],score:[2,2]},
      options:["Keep your regular signs — they can't really see them","Switch to a series of signs with an indicator","Use your glove to hide your hand better","Shake off every pitch to confuse them"],
      best:1,explanations:["Regular single signs are easy to steal with a runner on second looking right at your hand. This is a real problem.","With a runner on second, switch to multiple signs with an indicator. For example, show three signs and the second one is the real pitch. Or the sign after a fist is the real one. This makes it nearly impossible for the runner to relay the pitch to the batter.","Hiding your hand better helps, but a runner directly behind the pitcher has a great angle. Multiple signs are the standard solution.","Shaking off every pitch just slows down the game and confuses your own pitcher."],
      rates:[10,85,30,25],concept:"With a runner on 2nd, use multiple signs with an indicator — single signs can be stolen",anim:"freeze"},
    {id:"f41",title:"Pitcher Wants Fastball, You See Danger",diff:3,cat:"infield",
      description:"Top of the 8th, runner on 1st, 2 outs, up 4-3. The batter has been sitting on off-speed all night. Your pitcher shakes you off — he wants his fastball. But you've seen the batter tee off on fastballs twice.",
      situation:{inning:"Top 8",outs:2,count:"1-1",runners:[1],score:[4,3]},
      options:["Go with the pitcher's fastball — he has to be comfortable","Put down the off-speed sign again — trust your read","Call timeout and talk to him on the mound","Signal for a different location — fastball but away from his hot zone"],
      best:2,explanations:["Just giving in without communicating can cost you a big hit. The pitcher might not know what you know.","Putting the same sign down again when he's already shaken you off creates a disagreement on the mound. Talk about it.","A quick mound visit solves this. Tell him what you've seen: 'He's been sitting fastball — he crushed your heater twice. Let's go changeup and fool him.' Now you're both on the same page. Communication is what great batteries do.","Different location helps, but the batter has been teeing off on the fastball speed. Changing location still leaves him timed on the velocity."],
      rates:[30,25,85,45],concept:"When you disagree with your pitcher, call a mound visit — great catchers communicate, not just receive",anim:"freeze"},
    {id:"f42",title:"Passed Ball vs Wild Pitch",diff:3,cat:"infield",
      description:"Bot 6th, runner on 2nd, 1 out, down 4-3. Your pitcher throws a fastball that tails in on the right-handed batter. It's catchable but tough — it nips the inside corner and dips.",
      situation:{inning:"Bot 6",outs:1,count:"2-1",runners:[2],score:[3,4]},
      options:["Stab at it with your glove — try to catch it","Shift your whole body to the ball — receive it with two hands","Just block it — drop to your knees","Let it go — it's too far inside"],
      best:1,explanations:["Stabbing with just your glove on a tough pitch often leads to it deflecting off your mitt. That's a passed ball and the runner advances.","Move your whole body behind the ball. Shift your feet first, then receive it with soft hands. Catching the ball cleanly prevents the runner from advancing and might earn your pitcher a called strike on a borderline pitch. Body movement first, then glove.","Blocking is for balls in the dirt. This pitch is catchable — block only if you can't get to it cleanly.","Letting a borderline pitch go means the runner could advance on a passed ball, and you lose a potential strike call."],
      rates:[30,85,35,10],concept:"On tough pitches, move your whole body first, then receive — don't just stab with the glove",anim:"catch"},
    {id:"ct13",title:"Pitch Calling With Runner on Second",diff:2,cat:"catcher",
      description:"You're the catcher. There's a runner on second base who can see your signs. The batter is a right-handed pull hitter with a 1-1 count. Your pitcher has a nasty slider today.",
      situation:{inning:"Top 4",outs:1,count:"1-1",runners:[2],score:[2,2]},
      options:["Switch to a secondary sign system so the runner can't steal your signs","Keep using regular signs but call for all fastballs","Just use one finger for every pitch and let the pitcher decide","Yell out the pitch name so your pitcher can hear you clearly"],
      best:0,explanations:["Smart move! With a runner on second, they can read your normal signs and relay them to the batter. Switching to a secondary system keeps your pitch calling secret.","Limiting yourself to only fastballs makes your pitcher predictable. The runner on second will figure this out quickly and the batter will sit on the fastball.","Letting the pitcher decide defeats the purpose of pitch calling. The catcher sees the whole field and the batter's stance — you need to stay in control of the game plan.","Never yell out pitch names! The other team will hear you and the batter will know exactly what's coming. Signs exist for a reason."],
      rates:[88,30,20,5],concept:"When a runner reaches second base, switch to a secondary sign system to protect your pitch calls.",anim:"strike"},
    {id:"ct14",title:"Blocking a Curveball in the Dirt",diff:1,cat:"catcher",
      description:"You're the catcher. Runner on third, one out, and the count is 0-2. Your pitcher throws a sharp curveball that bounces in the dirt about two feet in front of home plate. The runner on third is watching closely.",
      situation:{inning:"Bot 6",outs:1,count:"0-2",runners:[3],score:[4,3]},
      options:["Drop to your knees, tuck your chin, and smother the ball with your body to keep it in front of you","Try to backhand the ball with your glove for a quick transfer in case the runner goes","Stand up and try to catch the ball on a short hop cleanly","Dive to the side to try to snag the ball before it gets past you"],
      best:0,explanations:["Perfect technique! With a runner on third, your number one job is to keep the ball in front of you. Drop, block, and smother — even if you don't catch it cleanly, the runner can't score.","Trying a fancy backhand with a ball in the dirt is risky. If it gets past your glove, the runner on third scores easily. Block first, worry about throwing later.","Standing up exposes gaps between your legs and body where the ball can scoot through. The blocking position on your knees creates a wall that keeps everything in front.","Diving to the side opens up the entire plate area. If you miss, there's nothing between the ball and the backstop, and that runner is scoring for sure."],
      rates:[90,25,30,10],concept:"With a runner on third, blocking is more important than catching — drop to your knees and keep the ball in front of you.",anim:"catch"},
    {id:"ct15",title:"Pop Fly Behind the Plate",diff:2,cat:"catcher",
      description:"You're the catcher. The batter pops a ball straight up behind home plate. It's drifting back toward the screen. Your third baseman is running over, and the umpire is right behind you. The ball is spinning and curving toward the backstop.",
      situation:{inning:"Top 3",outs:0,count:"0-1",runners:[1,2],score:[1,0]},
      options:["Rip off your mask, toss it away from where you're running, turn your back to the field, and track the ball","Keep your mask on for protection and try to find the ball through the cage","Let the third baseman take it since infielders have an easier angle","Wait for the umpire to tell you who should catch it"],
      best:0,explanations:["This is textbook! Toss the mask away from your path so you don't trip, then turn your back to the infield because pop flies behind the plate curve back toward the field. You've got the best angle on this ball.","Your mask blocks your vision and makes it harder to track pop flies. Always remove it first, but throw it in the opposite direction of where you're headed so you don't trip over it.","Pop flies behind the plate are the catcher's ball. The third baseman has a harder time tracking a ball moving away from them, but you're already underneath it and can follow it naturally.","Waiting wastes precious time. On pop flies, the catcher takes charge and calls for the ball. You're the captain behind the plate — be aggressive and take control."],
      rates:[85,25,35,15],concept:"On pop flies behind the plate, toss your mask away from your path, turn your back to the field, and take charge of the catch.",anim:"catch"},
    {id:"ct16",title:"Pickoff Play at First Base",diff:3,cat:"catcher",
      description:"You're the catcher. Fast runner on first is taking an aggressive secondary lead after every pitch. He's been leaning toward second and you've noticed he's slow getting back to first. The count is 2-1 on a weak hitter.",
      situation:{inning:"Top 7",outs:1,count:"2-1",runners:[1],score:[3,3]},
      options:["Call a pitchout on the next pitch to give yourself a clean throw to first for the pickoff","After receiving the pitch, snap throw to first immediately — you've timed his slow return","Signal the pitcher for a pickoff throw to first from the mound since the pitcher has a quicker throw","Ignore the runner and focus on the batter since it's a tied game"],
      best:1,explanations:["A pitchout helps for stealing situations, but here you want to pick off at first base. A pitchout gives the runner a clue that something is up because the pitch is wide, and he may dive back early.","Great awareness! You've noticed the runner's pattern — slow to get back after his secondary lead. A quick snap throw from the catcher right after receiving the pitch can catch a runner who's lazy getting back.","The pitcher can try a pickoff, but you just noticed the runner is slow getting back after the PITCH is thrown, not during the pitcher's stretch. Your snap throw catches him at the moment he's most vulnerable.","With a fast runner in a tie game, you can't just ignore him. Your job as a catcher is to control the running game. You've spotted a weakness — take advantage of it."],
      rates:[40,85,45,15],concept:"Watch runners' habits after every pitch — a quick snap throw from the catcher can catch a runner with a lazy secondary lead.",anim:"safe"},
    {id:"ct17",title:"Framing a Borderline Pitch",diff:2,cat:"catcher",
      description:"You're the catcher. Full count, two outs, bases loaded. Your pitcher throws a fastball that catches the outside corner just below the letters. It's borderline — could go either way. The umpire hasn't made the call yet.",
      situation:{inning:"Bot 5",outs:2,count:"3-2",runners:[1,2,3],score:[5,4]},
      options:["Hold your glove perfectly still right where you caught it and keep your body quiet — let the umpire see the location","Quickly jerk your glove toward the center of the strike zone to make it look like a strike","Stand up immediately and start walking back to the dugout like you know it's strike three","Pull the ball down into the zone since it was a little high"],
      best:0,explanations:["This is elite framing for a high-leverage moment! Full count, bases loaded, two outs — the umpire is watching your glove like a hawk. Any movement looks like you're trying to fool him. A quiet glove and still body tell the umpire you received the ball exactly where you expected it. In big moments, stillness is more convincing than pulling.","Jerking your glove is called 'stabbing' and umpires hate it. In a bases-loaded, full-count moment, the umpire is extra alert — any sudden movement screams 'I know that was a ball.'","Walking away is disrespectful to the umpire and might cost you calls later in the game. It also makes you look like you're trying too hard to sell it, which backfires.","Pulling the ball down makes it obvious the pitch was high. In a big moment like this, the umpire is watching closely — hold the ball where it was caught."],
      rates:[88,20,15,30],concept:"In high-leverage moments, stillness beats pulling — the umpire is watching your glove closely, and quiet presentation is more convincing.",anim:"strikeout"},
    {id:"ct18",title:"Mound Visit Decision",diff:3,cat:"catcher",
      description:"You're the catcher. Your pitcher has walked two batters in a row and just threw three straight balls to the next hitter. He looks frustrated and is rushing his delivery. The pitching coach glances at you from the dugout.",
      situation:{inning:"Top 6",outs:0,count:"3-0",runners:[1,2],score:[6,4]},
      options:["Call time and go visit the mound to slow things down and settle your pitcher","Signal for a fastball right down the middle — just let him throw a strike","Wait for the pitching coach to make the mound visit since he's looking over","Keep calling pitches and hope your pitcher works through it on his own"],
      best:0,explanations:["Perfect call! Your pitcher is spiraling and needs a reset. A mound visit slows the game down, lets him take a breath, and gives you a chance to remind him to trust his stuff and focus on your glove. This is a catcher being a leader.","Grooving a fastball down the middle with a 3-0 count might get a strike, but a frustrated pitcher throwing flat fastballs over the plate can get crushed. You need to fix the problem, not put a bandage on it.","The pitching coach might come out, but the catcher is the pitcher's first line of defense. You're right there — don't wait for someone else to help YOUR pitcher. Take charge.","Hoping things get better isn't a strategy. Your pitcher has walked two and thrown three straight balls. He needs help now, and the catcher is the one who gives it. Be a leader."],
      rates:[90,25,35,15],concept:"A catcher is a pitcher's best friend — when your pitcher is struggling, visit the mound to slow things down and settle him.",anim:"freeze"},
    {id:"ct19",title:"Defending a Delayed Steal",diff:2,cat:"catcher",
      description:"You're the catcher. Runner on second base, one out. After you receive a routine fastball for a called strike, you casually lob the ball back to the pitcher. Suddenly the runner on second breaks for third as your throw floats toward the mound.",
      situation:{inning:"Top 4",outs:1,count:"1-2",runners:[2],score:[2,1]},
      options:["Yell to your pitcher to cut the throw and fire to third base immediately","Jump out and sprint toward the mound to get the ball back faster","Do nothing — the ball is already out of your hands so it's the pitcher's play now","Call timeout to stop the play"],
      best:0,explanations:["Yes! On a delayed steal, the key is recognizing it fast and communicating. Yelling to your pitcher tells him to catch your lob and immediately throw to third. The pitcher is in the best position to make that throw if you alert him.","Running toward the mound wastes time and takes you out of position. Your throw is already in the air — you can't outrun a baseball. Use your voice, not your legs.","It IS partly the pitcher's play now, but the pitcher might not see the runner going. As the catcher, you see everything — it's your job to alert your teammates. Communication wins baseball games.","You can't call timeout while a play is in progress. The runner is already moving, so the umpire won't grant time. You need to react to the play, not try to stop it."],
      rates:[85,30,20,10],concept:"Delayed steals catch catchers off guard — stay alert after every pitch and use your voice to direct teammates.",anim:"steal"},
    {id:"ct20",title:"Bunt Play With Runner on First",diff:1,cat:"catcher",
      description:"You're the catcher. Runner on first, no outs, and the batter squares around to bunt. The pitch is a fastball low and inside. The batter drops a bunt about eight feet up the third base line. Your third baseman is charging hard.",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[1],score:[3,3]},
      options:["Rip off your mask, field the ball if the third baseman can't get there, and be ready to tell everyone where to throw","Sprint past the ball to cover third base since the third baseman left it open","Stay at home plate since the pitcher or third baseman will handle all bunts","Run straight at the ball even though the third baseman is closer"],
      best:0,explanations:["Great instinct! On bunt plays the catcher is the quarterback. Remove your mask, read the play, and if your third baseman has the ball, yell where to throw it. If he can't reach it, you grab it. Either way, you're directing traffic.","Covering third is important but not your first job here. The shortstop or someone else can rotate to cover third. Your job is to be the closest backup fielder and the one who tells everyone where the throw goes.","Never just stand and watch! On bunt plays, the catcher must get out of the crouch immediately. Even if someone else fields it, you need to direct the play — you're the only one who can see the whole field.","Running at a ball when a teammate is closer creates confusion and collisions. Let the third baseman field it since he's already charging. Your job is to read the play and communicate."],
      rates:[88,25,15,20],concept:"On bunt plays, the catcher is the quarterback — get your mask off, read the play, and tell your teammates where to throw.",anim:"bunt"},

  ],
  famous: [
    {id:"fp1",title:"Jeter's Flip Play",diff:3,cat:"famous",
      description:"2001 ALDS, Game 3. Runner rounding 3rd heading home. The throw from right field sails up the first base line — way off target. You're the shortstop. What do you do?",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[3],score:[1,0]},
      options:["Let the first baseman handle it — it's his side","Cut the throw off and relay home","Sprint to the first base line and shovel-flip to the catcher","Call for the ball and throw home yourself"],
      best:2,explanations:["The first baseman can't reach it in time. The runner scores easily.","A standard cutoff relay takes too long — the runner beats it home.","This is THE play! Jeter sprinted from shortstop to the first base line, grabbed the overthrow, and backhanded a shovel-flip to the catcher — nailing Jeremy Giambi. Baseball's greatest hustle play.","You're 150 feet away. By the time you field and throw, the run scores."],
      rates:[10,35,85,25],concept:"Great plays happen when you anticipate — Jeter's hustle and instinct created the impossible",anim:"throwHome"},
    {id:"fp2",title:"Merkle's Boner",diff:2,cat:"famous",
      description:"1908, Giants vs Cubs. Bottom 9th, tie game. Your teammate singles — the winning run appears to score from 3rd! But you were the runner on 1st. What must you do?",
      situation:{inning:"Bot 9",outs:1,count:"-",runners:[1,3],score:[1,1]},
      options:["Run toward 2nd base and touch the bag","Celebrate with your teammates — the game is over!","Run to the dugout — the fans are storming the field","Stay at 1st base — you didn't need to advance"],
      best:0,explanations:["Correct! You MUST touch 2nd base for the run to count. In 1908, Fred Merkle didn't — the Cubs got the ball, touched 2nd, and Merkle was a force out. The run was nullified.","Celebrating cost Fred Merkle his legacy. The run didn't count because he never touched 2nd.","Leaving the field is abandoning the play. The defense can appeal and you're out.","The force at second still existed because Merkle was forced to advance when the batter hit the ball. You MUST touch second base — without it, you can be forced out and the run doesn't count."],
      rates:[85,10,10,20],concept:"Always touch the next base — Merkle's mistake in 1908 changed a pennant race",anim:"advance"},
    {id:"fp3",title:"Baez's Rundown Magic",diff:3,cat:"famous",
      description:"2021 Cubs vs Pirates. You're Javy Baez on 1st. The batter grounds out but you get caught in a rundown between 1st and 2nd. What's your strategy?",
      situation:{inning:"Top 3",outs:1,count:"-",runners:[1],score:[2,1]},
      options:["Give up and get tagged — save energy","Run full speed toward 2nd to force a bad throw","Stay in the rundown as long as possible to let the other runner score","Make the fielders throw as many times as possible — force an error"],
      best:3,explanations:["Never give up! Rundowns create chaos.","Running full speed at one fielder doesn't create enough confusion.","Good thinking — but the key is actively FORCING errors, not just surviving.","Baez made the Pirates throw 6 times, running back and forth, drawing TWO throwing errors. He ended up safe at 2nd AND a run scored. Chaos wins."],
      rates:[10,30,50,85],concept:"In a rundown, make them throw — every throw is a chance for an error",anim:"advance"},
    {id:"fp4",title:"The Hidden Ball Trick",diff:2,cat:"famous",
      description:"You're the first baseman. The runner on 1st just took a lead. Your pitcher is on the rubber. How do you execute the hidden ball trick?",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[1],score:[3,2]},
      options:["Keep the ball in your glove and tag the runner when he leads off","Ask the pitcher to pretend to have the ball while you keep it","Wait for the pitcher to step OFF the rubber, then tag the runner","Call time and tag the runner during the timeout"],
      best:2,explanations:["If the pitcher is on the rubber, this is a balk. The pitcher MUST have the ball when on the rubber.","This is a balk! The pitcher cannot be on the rubber without the ball.","The pitcher MUST step off the rubber for this to be legal. Once off, you can tag the unsuspecting runner. This is the only legal way to pull it off.","You can't tag a runner during a timeout — the ball is dead."],
      rates:[25,15,85,10],concept:"The hidden ball trick only works if the pitcher is OFF the rubber — otherwise it's a balk",anim:"safe"},
    {id:"fp5",title:"Lonnie Smith Gets Deked",diff:3,cat:"famous",
      description:"1991 World Series, Game 7. You're Lonnie Smith on 1st. The batter drives a ball to deep left-center gap. You're running on contact. But as you round 2nd, the middle infielders fake a double play. What should you do?",
      situation:{inning:"Bot 8",outs:0,count:"-",runners:[1],score:[0,0]},
      options:["Stop and check if the ball was fielded","Keep running full speed — the ball was hit to the outfield","Hesitate briefly then continue to 3rd","Dive back to 2nd — it might be a line drive out"],
      best:1,explanations:["Stopping is exactly what happened — Lonnie Smith hesitated, and it cost the Braves the winning run in Game 7 of the World Series.","Never stop running on a gap hit! The ball is clearly in the outfield. Trust your eyes and ears, not the infielders. Smith should have scored easily.","Even a brief hesitation costs critical seconds. That hesitation kept Smith at 3rd instead of scoring.","You saw the ball hit — it was a gap shot. Don't fall for the fake."],
      rates:[15,85,30,10],concept:"Watch the ball, not the fielders — dekes only work if you take your eyes off the play",anim:"score"},
    {id:"fp6",title:"The Suicide Squeeze",diff:2,cat:"famous",
      description:"Runner on 3rd, 1 out, tie game in the 8th. You're the batter. The coach gives the squeeze sign. The runner will break for home as the pitcher starts his motion. What's your job?",
      situation:{inning:"Bot 8",outs:1,count:"1-1",runners:[3],score:[3,3]},
      options:["Bunt the ball ANYWHERE in fair territory — just get it down","Swing away — surprise the defense","Fake the bunt and let the runner steal home","Bunt only if the pitch is in the strike zone"],
      best:0,explanations:["On a suicide squeeze, the runner is COMMITTED. Your ONLY job is to get the bunt down — anywhere, any pitch, even in the dirt. The runner is dead if you don't bunt.","Swinging means the catcher has a clear throw to nail the runner at home.","A fake bunt leaves your runner hung out to dry — he's already sprinting.","On a suicide squeeze, you bunt EVERYTHING. The runner is already committed. If you take a pitch, he's out by 20 feet."],
      rates:[85,5,10,25],concept:"On a suicide squeeze, bunt EVERYTHING — the runner is committed to scoring",anim:"bunt"},
    {id:"fp7",title:"Walk-Off Balk",diff:3,cat:"famous",
      description:"Bottom 9th, tie game, bases loaded, 1 out. You're a runner on 3rd. The pitcher starts his windup, then stops mid-motion. What happens?",
      situation:{inning:"Bot 9",outs:1,count:"2-1",runners:[1,2,3],score:[5,5]},
      options:["Nothing — play continues","It's a balk — all runners advance one base, you score!","The pitch doesn't count — redo it","It depends on whether the batter swung"],
      best:1,explanations:["A pitcher cannot stop mid-motion — that's always a balk.","Correct! A balk awards every runner one free base. With the bases loaded and a runner on 3rd, the winning run scores on a walk-off balk! It's rare but it happens.","Balks are not do-overs. The runners advance immediately.","A balk is called regardless of what the batter does. It's about the pitcher's illegal motion."],
      rates:[15,85,20,30],concept:"A balk advances all runners one base — with bases loaded, that's a run",anim:"score"},
    {id:"fp8",title:"Bonds — Intentional Walk with Bases Loaded",diff:3,cat:"famous",
      description:"1998. Barry Bonds at the plate, bases loaded, 2 outs. You're the opposing manager. The Diamondbacks chose to intentionally walk Bonds, forcing in a run. When might this make sense?",
      situation:{inning:"Bot 9",outs:2,count:"0-0",runners:[1,2,3],score:[8,6]},
      options:["It never makes sense — you just gave them a free run","Only if you're up by more than 1 run AND the next batter is much weaker","Only in extra innings","Only if Bonds has already homered in the game"],
      best:1,explanations:["It's counterintuitive but sometimes the math works. Buck Showalter did it when up by 2.","Exactly! If you're up 8-6 with bases loaded, walking Bonds makes it 8-7 but you face a weaker hitter. A Bonds grand slam makes it 10-8 — game over. Sometimes the intentional walk is the right risk.","Extra innings have nothing to do with this decision — it's about run prevention math.","His earlier at-bats don't change the math. It's about expected runs."],
      rates:[30,85,20,25],concept:"Sometimes giving up 1 run to avoid giving up 4 is the smart play — think expected value",anim:"walk"},
    {id:"fp9",title:"Three Men on Third",diff:2,cat:"famous",
      description:"1926 — Babe Ruth, Lou Gehrig, and a runner are all somehow near 3rd base at the same time. You're the third baseman with the ball. Who do you tag?",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[1,2,3],score:[3,3]},
      options:["Tag Babe Ruth first — he's the biggest star","Tag the runner closest to home plate","Tag the runner who was originally on 3rd — they have the right to the base","Tag all of them just to be safe"],
      best:2,explanations:["Star power doesn't matter in the rules. Tag the right runner.","The runner closest to home isn't necessarily the one you need. Think about who has the right to the base.","Correct! The lead runner (originally on 3rd) has the RIGHT to the base. The other two runners are trespassers. Tag the runners who don't belong — they're the outs.","Tagging all of them works, but you need to know WHY. Only the runners without the right to the base are out."],
      rates:[20,35,85,50],concept:"The lead runner has the right to the base — tag the others, they're trespassing",anim:"safe"},
    {id:"fp10",title:"Maddux Pitch Sequencing",diff:3,cat:"famous",
      description:"You're Greg Maddux — the greatest pitch sequencer ever. Bottom of the 7th, facing a power hitter. He's seen mostly fastballs from you. Count is 2-1. What do you throw?",
      situation:{inning:"Bot 7",outs:1,count:"2-1",runners:[],score:[2,0]},
      options:["Fastball on the inside corner — your best pitch","Changeup — make him way out front","Cutter that looks like a fastball but moves","Two-seam sinker for a ground ball"],
      best:2,explanations:["He's timing your fastball now. Throwing it again is predictable.","Changeup on 2-1 when behind is risky — if you miss, it's 3-1.","Maddux mastered the cutter for exactly this reason. It looks like a fastball out of the hand, but cuts 3-4 inches at the last moment. The batter swings where the ball WAS. Pure genius.","A sinker could work, but the cutter's deception is what made Maddux legendary."],
      rates:[40,45,85,55],concept:"Maddux's genius: throw pitches that LOOK like one thing but DO another — deception over velocity",anim:"groundout"},
  ],
  rules: [
    {id:"rl1",title:"Infield Fly Rule",diff:2,cat:"rules",
      description:"Runners on 1st and 2nd, 1 out. The batter pops up to shallow left field. The umpire raises his hand and yells 'Infield fly!' What does this mean?",
      situation:{inning:"Bot 4",outs:1,count:"1-0",runners:[1,2],score:[2,1]},
      options:["The batter is automatically out, runners can advance at their own risk","The play is dead — nobody moves","The fielder MUST catch it or it's an error","The runners must tag up like a regular fly ball"],
      best:0,explanations:["Correct! The infield fly rule protects runners from a fielder intentionally dropping the pop-up to turn a double play. Batter is out whether caught or not — runners can advance at their risk.","The ball is still live! Runners can advance at their own risk.","The rule doesn't require a catch — the batter is out either way.","They don't have to tag up because the batter is already called out. But they CAN stay on base safely."],
      rates:[85,20,25,40],concept:"Infield fly rule: batter is out, ball is live, runners advance at own risk — prevents trick double plays",anim:"flyout"},
    {id:"rl2",title:"What's a Balk?",diff:2,cat:"rules",
      description:"Runner on 1st base. The pitcher comes set, then flinches his shoulder toward home plate but doesn't throw. What's the call?",
      situation:{inning:"Top 3",outs:0,count:"1-1",runners:[1],score:[0,0]},
      options:["No call — he didn't actually pitch","Balk! The runner gets 2nd base","Strike — any motion toward home counts","Ball — failed pitch attempt"],
      best:1,explanations:["Any motion toward home that doesn't result in a pitch is a balk when runners are on base.","Once a pitcher starts his motion toward home, he MUST deliver the pitch. Any flinch, stop, or fake is a balk. The runner advances one base.","It's not a strike because the ball was never thrown.","It's not counted as a ball either — it's a balk, which is its own category."],
      rates:[25,85,15,20],concept:"Any start-and-stop motion by the pitcher with runners on base is a balk — one free base",anim:"advance"},
    {id:"rl3",title:"Dropped Third Strike",diff:2,cat:"rules",
      description:"2 outs, nobody on base. The pitcher throws strike three, but the ball bounces in the dirt and gets past the catcher. What can the batter do?",
      situation:{inning:"Top 7",outs:2,count:"0-2",runners:[],score:[3,1]},
      options:["Nothing — strikeout, he's automatically out","Run to first! If the catcher doesn't throw him out, he's safe","Only run if the umpire signals","Ask the umpire for another pitch"],
      best:1,explanations:["With less than 2 outs AND a runner on 1st, you'd be right. But with 2 outs or 1st base empty, the dropped 3rd strike rule is in effect.","On a dropped third strike with 2 outs (or no runner on 1st), the batter becomes a runner! Sprint to first. If the catcher's throw doesn't beat you, you're safe.","The umpire doesn't signal — you need to KNOW the rule and react immediately.","There's no do-over for a dropped third strike. Know the rule and RUN."],
      rates:[30,85,20,10],concept:"Dropped third strike: with 2 outs or 1st base empty, the batter can run to first",anim:"advance"},
    {id:"rl4",title:"Appeal Play — Missing a Base",diff:3,cat:"rules",
      description:"Runner on 1st takes off on contact. Ball is hit deep to center — off the wall! The runner rounds 2nd but barely misses touching the bag. He reaches 3rd. Can the defense do anything?",
      situation:{inning:"Bot 5",outs:1,count:"-",runners:[1],score:[3,3]},
      options:["Nothing — the play is over","Appeal! Throw to 2nd base and the runner is out","They can only appeal between innings","The runner has to go back and touch 2nd"],
      best:1,explanations:["The defense absolutely can appeal a missed base — it's one of the most missed rules in baseball.","The defensive team can 'appeal' by throwing to 2nd base while it's still a live ball. If the umpire saw the runner miss the bag, he's OUT. This has decided real MLB games.","Appeals can happen at any time while the ball is live — not just between innings.","Once the runner is at 3rd, he can't go back. The defense must appeal."],
      rates:[20,85,15,30],concept:"The defense can appeal a missed base — always touch every bag, even in the heat of the play",anim:"safe"},
    {id:"rl5",title:"Obstruction vs Interference",diff:3,cat:"rules",
      description:"Runner heading to 3rd base. The third baseman is standing in the baseline waiting for the throw, but doesn't have the ball yet. The runner has to go around him. What's the call?",
      situation:{inning:"Top 6",outs:0,count:"-",runners:[2],score:[2,1]},
      options:["Nothing — the fielder has the right to the baseline","Obstruction on the fielder — runner gets the base","Interference on the runner — runner is out","The runner should have slid"],
      best:1,explanations:["A fielder only has the right to the baseline when fielding the ball or in possession of it.","Obstruction! A fielder without the ball cannot block the baseline. The runner is awarded at least 3rd base. In the 2013 World Series, this call ended Game 3.","Interference is called on the RUNNER, not the fielder. This is obstruction.","Sliding doesn't matter. The fielder illegally blocked the path."],
      rates:[25,85,15,20],concept:"Obstruction: fielders can't block the baseline without the ball — runners get the base",anim:"advance"},
    {id:"rl6",title:"Designated Hitter Rule",diff:1,cat:"rules",
      description:"Your team's pitcher is due up 4th in the batting order. What's your option?",
      situation:{inning:"Top 1",outs:0,count:"-",runners:[],score:[0,0]},
      options:["The pitcher must bat — that's the rule","Use a designated hitter (DH) to bat in the pitcher's spot","Pinch hit for the pitcher every time he's due up","Let a fielder bat twice"],
      best:1,explanations:["In the AL (and now universally since 2022), the DH replaces the pitcher in the batting order.","The designated hitter (DH) bats in place of the pitcher. Since 2022, both AL and NL use the DH. The pitcher never has to bat.","Pinch hitting removes the pitcher from the game. The DH stays in the lineup all game.","A player can only occupy one spot in the batting order."],
      rates:[15,85,30,10],concept:"The designated hitter (DH) bats for the pitcher — universal in MLB since 2022",anim:"strike"},
    {id:"rl7",title:"Ground Rule Double",diff:1,cat:"rules",
      description:"Runner on 1st, 1 out. The batter hits a screaming line drive that bounces once in fair territory, then hops over the outfield fence. Where do the runners end up?",
      situation:{inning:"Bot 6",outs:1,count:"2-1",runners:[1],score:[1,2]},
      options:["Home run! Both runners score","Runner goes to 3rd, batter gets 2nd — ground rule double","Runner scores, batter gets 2nd","Batter returns to hit again — do-over"],
      best:1,explanations:["A ball that bounces over the fence is NOT a home run — it's a ground rule double.","A ground rule double awards all runners exactly two bases from where they were. Runner on 1st goes to 3rd. Batter stops at 2nd. Even if the runner could have scored, he only gets two bases.","The runner on 1st only advances to 3rd — two bases from 1st base, not home.","There's no do-over. The ground rule double stands."],
      rates:[20,85,30,10],concept:"Ground rule double: all runners advance exactly two bases — even if they could have scored",anim:"advance"},
    {id:"rl8",title:"Tag Up on a Fly Ball",diff:1,cat:"rules",
      description:"Runner on 3rd, 1 out. The batter hits a deep fly ball to center field. The runner wants to score after the catch. What MUST he do?",
      situation:{inning:"Bot 8",outs:1,count:"1-0",runners:[3],score:[2,3]},
      options:["Start running as soon as the ball is hit","Wait on the base until the fielder CATCHES the ball, then run","Wait until the umpire signals","He can't advance on a fly ball"],
      best:1,explanations:["Leaving early means the defense can throw to 3rd for an appeal out.","The runner must 'tag up' — keep his foot on 3rd base until the ball is CAUGHT, then sprint home. If he leaves early and the defense appeals, he's out.","There's no special umpire signal — you have to watch the catch yourself.","Runners absolutely can advance after a catch — that's the whole point of a sacrifice fly."],
      rates:[25,85,15,10],concept:"Tag up: on a fly ball, touch your base until the catch is made, THEN you can advance",anim:"score"},
  ],
  counts: [
    {id:"cn1",title:"0-0: First Pitch Approach (Batter)",diff:1,cat:"counts",
      description:"You're the batter. Count is 0-0. The pitcher has been throwing first-pitch fastballs all game. What's your approach?",
      situation:{inning:"Bot 3",outs:0,count:"0-0",runners:[],score:[1,1]},
      options:["Sit on the fastball and swing aggressively","Take the first pitch no matter what","Bunt for a surprise hit","Choke up and just make contact"],
      best:0,explanations:["MLB hitters bat .340 on first pitches they swing at. If you KNOW it's a fastball, be aggressive! Jumping on first-pitch fastballs is how you take advantage of pitcher patterns.","Always taking first pitches makes you predictable and puts you behind.","Bunting on the first pitch wastes the advantage of knowing what's coming.","Just making contact wastes the advantage. If you know fastball, drive it."],
      rates:[85,35,20,40],concept:"Hitting 0-0: if you know what's coming, be aggressive — hitters bat .340 on first pitches",anim:"hit"},
    {id:"cn2",title:"0-2: Pitcher's Count (Batter)",diff:2,cat:"counts",
      description:"You're behind 0-2. The pitcher has dominated this at-bat. What's your strategy?",
      situation:{inning:"Top 5",outs:1,count:"0-2",runners:[1],score:[2,3]},
      options:["Protect the plate — shorten your swing, fight off tough pitches","Swing for the fences — make him pay if he makes a mistake","Take the next pitch — he'll probably waste one","Bunt — surprise the defense"],
      best:0,explanations:["Down 0-2, your job is to survive. Shorten up, foul off borderline pitches, and wait for a mistake. MLB hitters bat only .167 on 0-2 counts — be defensive.","Swinging big on 0-2 leads to strikeouts. The pitcher has the advantage.","Good pitchers don't always waste on 0-2 — many go right after you. Be ready.","A 0-2 bunt is desperation. Just compete with a shortened approach."],
      rates:[85,15,40,20],concept:"Down 0-2, become a fighter — shorten your swing and protect the plate (.167 BA in 0-2)",anim:"strike"},
    {id:"cn3",title:"3-1: Hitter's Count",diff:2,cat:"counts",
      description:"Count is 3-1, you're the batter. A ball four puts you on base. The pitcher needs a strike. What's your approach?",
      situation:{inning:"Bot 6",outs:1,count:"3-1",runners:[2],score:[3,4]},
      options:["Sit on your pitch and crush it — hitters bat .340 on 3-1","Take the pitch — get to a full count","Swing at anything close — you don't want to strike out","Protect — shorten up like you're behind in the count"],
      best:0,explanations:["3-1 is the best hitter's count in baseball! The pitcher MUST throw a strike. Look for your pitch in your zone and drive it. MLB hitters bat .340+ on 3-1.","Why give away your best advantage? 3-1 is YOUR count.","Swinging at anything close isn't selective enough. LOOK for your pitch.","You don't need to protect on 3-1 — you have the leverage. Be aggressive."],
      rates:[85,35,30,20],concept:"3-1 is the hitter's best count (.340+ BA) — the pitcher must come to you, sit on your pitch",anim:"hit"},
    {id:"cn4",title:"1-2: Pitcher's Strategy",diff:2,cat:"counts",
      description:"You're the pitcher. Count is 1-2 on a slugger. You're ahead — one more strike gets him. What do you throw?",
      situation:{inning:"Top 4",outs:0,count:"1-2",runners:[],score:[2,0]},
      options:["Fastball right down the middle — challenge him","Slider just off the plate — expand the zone","Changeup in the dirt — make him chase","Same pitch you just threw — repeat it"],
      best:1,explanations:["Down the middle on 1-2 is a gift. You're ahead — use that leverage.","Expand the zone! On 1-2, throw to spots where the hitter THINKS it's a strike but it's actually a ball. Chase pitches get strikeouts.","In the dirt is too obvious — most hitters won't chase that far down on 1-2.","Repeating the same pitch is predictable. Mix it up."],
      rates:[15,85,45,30],concept:"1-2 counts: expand the zone with chase pitches just off the plate — make the hitter swing at balls",anim:"strikeout"},
    {id:"cn5",title:"2-0: Pitcher in Trouble",diff:2,cat:"counts",
      description:"You're the pitcher. Behind 2-0 to a good hitter. You need a strike. What's your play?",
      situation:{inning:"Bot 3",outs:1,count:"2-0",runners:[],score:[1,1]},
      options:["Fastball — your most command-able pitch for a strike","Breaking ball — surprise him","Nibble the corners — don't give him anything to hit","Changeup low — steal a strike"],
      best:0,explanations:["On 2-0, throw your best strike. Fastballs have the highest strike rate. You NEED to get back in the count. Don't try to be cute — be accurate.","Breaking balls are harder to control. On 2-0, command is everything.","Nibbling risks falling 3-0 which is even worse. Attack the zone.","Changeup on 2-0 is risky — if it misses, you're 3-0."],
      rates:[85,25,30,40],concept:"Behind 2-0, throw your best fastball for a strike — command beats trickery when you're behind",anim:"strike"},
    {id:"cn6",title:"Full Count: 3-2 with 2 Outs",diff:3,cat:"counts",
      description:"Full count 3-2, 2 outs, runner on 1st. You're the batter. The runner is going on the pitch. What's your approach?",
      situation:{inning:"Bot 7",outs:2,count:"3-2",runners:[1],score:[3,4]},
      options:["Swing at anything close — can't take strike 3","Be selective — wait for YOUR pitch in YOUR zone","Take the pitch — if it's a ball, you walk","Swing for extra bases to drive in the runner"],
      best:1,explanations:["Swinging at everything leads to weak contact on bad pitches.","Even on 3-2 with 2 outs, be selective within the zone. You don't need to swing at balls. LOOK for a pitch you can drive. The runner is going, so contact puts him in scoring position.","You can't just take on 3-2 — if it catches the corner, you're out looking.","Trying to do too much leads to overswinging. Just find a good pitch and put a good swing on it."],
      rates:[30,85,25,35],concept:"Full count discipline: be aggressively selective — swing at strikes, lay off balls, even with 2 strikes",anim:"hit"},
    {id:"cn7",title:"First Pitch After a Walk (Pitcher)",diff:1,cat:"counts",
      description:"You just walked the previous batter. New batter up. What should your first pitch be?",
      situation:{inning:"Top 5",outs:0,count:"0-0",runners:[1],score:[2,2]},
      options:["A careful pitch on the corner — don't fall behind again","A first-pitch strike — get ahead immediately","A pitchout to check the runner","Whatever you're most comfortable with"],
      best:1,explanations:["Being too careful after a walk often leads to another walk. Attack the zone.","After a walk, the most important thing is getting ahead on the new batter. Throw a strike. Pitchers who throw first-pitch strikes after walks cut their walk rate dramatically.","A pitchout on 0-0 puts you behind immediately.","Comfort is secondary — the game situation demands a strike."],
      rates:[35,85,15,40],concept:"After a walk, throw strike one immediately — getting ahead prevents walk snowballs",anim:"strike"},
    {id:"cn8",title:"2-2: Even Count Battle",diff:2,cat:"counts",
      description:"Count is 2-2. Both sides have fought hard this at-bat. You're the pitcher. What's your approach to get the strikeout?",
      situation:{inning:"Bot 8",outs:1,count:"2-2",runners:[2,3],score:[4,3]},
      options:["Your best pitch, best location — trust your stuff","Something he hasn't seen this at-bat","The same sequence that got you to 2-2","A fastball up to set up a breaking ball next pitch"],
      best:1,explanations:["Your best pitch is predictable if he's seen it multiple times this at-bat.","Change the eye level and the look! On 2-2, show something different. If you've been throwing low, go up. If fastballs, throw off-speed. The element of surprise gets strikeouts.","Repeating sequences is predictable for good hitters.","Setting up a next pitch works, but you might not GET a next pitch — this could be ball three."],
      rates:[40,85,30,45],concept:"On 2-2, change the hitter's eye level — show something he hasn't seen this at-bat",anim:"strikeout"},
  ],
};

const ALL_POS = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField","batter","baserunner","manager"];
const POS_META = {
  pitcher:{label:"Pitcher",emoji:"⚾",color:"#ef4444",bg:"linear-gradient(135deg,#7f1d1d,#991b1b,#dc2626)",desc:"Control the game from the mound",icon:"🔥"},
  catcher:{label:"Catcher",emoji:"🎭",color:"#06b6d4",bg:"linear-gradient(135deg,#164e63,#155e75,#0891b2)",desc:"Call the game behind the plate",icon:"🛡️"},
  firstBase:{label:"1st Base",emoji:"🥇",color:"#f97316",bg:"linear-gradient(135deg,#7c2d12,#9a3412,#ea580c)",desc:"Stretch, scoop, and hold runners",icon:"🧤"},
  secondBase:{label:"2nd Base",emoji:"🔄",color:"#22c55e",bg:"linear-gradient(135deg,#14532d,#166534,#22c55e)",desc:"Turn double plays and cover ground",icon:"🧤"},
  shortstop:{label:"Shortstop",emoji:"⚡",color:"#6366f1",bg:"linear-gradient(135deg,#312e81,#3730a3,#4f46e5)",desc:"Captain of the infield",icon:"🛡️"},
  thirdBase:{label:"3rd Base",emoji:"🔥",color:"#e11d48",bg:"linear-gradient(135deg,#881337,#9f1239,#e11d48)",desc:"Guard the hot corner",icon:"💥"},
  leftField:{label:"Left Field",emoji:"🌿",color:"#16a34a",bg:"linear-gradient(135deg,#14532d,#166534,#16a34a)",desc:"Track down balls and throw runners out",icon:"💪"},
  centerField:{label:"Center Field",emoji:"👑",color:"#0ea5e9",bg:"linear-gradient(135deg,#0c4a6e,#075985,#0284c7)",desc:"Cover the most ground and call the shots",icon:"🏃"},
  rightField:{label:"Right Field",emoji:"🎯",color:"#84cc16",bg:"linear-gradient(135deg,#365314,#3f6212,#65a30d)",desc:"Strongest arm in the outfield",icon:"💨"},
  batter:{label:"Batter",emoji:"💪",color:"#3b82f6",bg:"linear-gradient(135deg,#1e3a5f,#1e40af,#3b82f6)",desc:"Drive in runs when it counts",icon:"⚡"},
  baserunner:{label:"Runner",emoji:"🏃",color:"#f59e0b",bg:"linear-gradient(135deg,#78350f,#92400e,#d97706)",desc:"Run smart, score runs",icon:"💨"},
  manager:{label:"Manager",emoji:"📋",color:"#a855f7",bg:"linear-gradient(135deg,#3b0764,#581c87,#7c3aed)",desc:"Make championship decisions",icon:"🧠"},
  famous:{label:"Famous Play",emoji:"🏟️",color:"#eab308",bg:"linear-gradient(135deg,#713f12,#854d0e,#ca8a04)",desc:"Legendary moments in baseball history",icon:"⭐"},
  rules:{label:"Rule IQ",emoji:"📖",color:"#f472b6",bg:"linear-gradient(135deg,#831843,#9d174d,#db2777)",desc:"Know the rules that decide games",icon:"📐"},
  counts:{label:"Count IQ",emoji:"🔢",color:"#14b8a6",bg:"linear-gradient(135deg,#134e4a,#115e59,#0d9488)",desc:"Master every count in baseball",icon:"📊"},
};
const LEVELS=[{n:"Rookie",min:0,c:"#94a3b8",e:"🌱"},{n:"Varsity",min:75,c:"#3b82f6",e:"⭐"},{n:"All-Star",min:200,c:"#f59e0b",e:"🌟"},{n:"MVP",min:400,c:"#ef4444",e:"🏆"},{n:"Hall of Fame",min:700,c:"#a855f7",e:"👑"}];
const ACHS=[
  {id:"first",n:"First Pitch",d:"Complete your first scenario",e:"⚾",ck:s=>s.gp>=1},
  {id:"s3",n:"On a Roll",d:"3 optimal in a row",e:"🔥",ck:s=>s.bs>=3},
  {id:"s5",n:"Hot Streak",d:"5 in a row",e:"💥",ck:s=>s.bs>=5},
  {id:"s10",n:"Unstoppable",d:"10 in a row!",e:"⚡",ck:s=>s.bs>=10},
  {id:"g10",n:"Dedicated",d:"Play 10 scenarios",e:"📚",ck:s=>s.gp>=10},
  {id:"g25",n:"Student",d:"Play 25 scenarios",e:"🎓",ck:s=>s.gp>=25},
  {id:"g50",n:"Scholar",d:"Play 50 scenarios",e:"🏅",ck:s=>s.gp>=50},
  {id:"g100",n:"Veteran",d:"Play 100 scenarios",e:"💎",ck:s=>s.gp>=100},
  {id:"a80",n:"Sharp Eye",d:"80%+ accuracy (10+ games)",e:"🎯",ck:s=>s.gp>=10&&(s.co/s.gp)>=0.8},
  {id:"util",n:"Utility Player",d:"Play all 12 positions",e:"🔄",ck:s=>ALL_POS.every(p=>(s.ps[p]?.p||0)>=1)},
  {id:"c10",n:"Baseball Brain",d:"Learn 10 concepts",e:"🧠",ck:s=>(s.cl?.length||0)>=10},
  {id:"c20",n:"Professor",d:"Learn 20 concepts",e:"📖",ck:s=>(s.cl?.length||0)>=20},
  {id:"daily3",n:"3-Day Streak",d:"Play 3 days in a row",e:"📅",ck:s=>(s.ds||0)>=3},
  {id:"daily7",n:"Weekly Warrior",d:"7-day streak",e:"🗓️",ck:s=>(s.ds||0)>=7},
  {id:"perf5",n:"Perfect Inning",d:"5 optimal in one session",e:"💯",ck:s=>(s.sp||0)>=5},
];
function achProgress(id,s){
  const map={first:[s.gp,1],s3:[Math.min(s.str,3),3],s5:[Math.min(s.str,5),5],s10:[Math.min(s.str,10),10],
    g10:[Math.min(s.gp,10),10],g25:[Math.min(s.gp,25),25],g50:[Math.min(s.gp,50),50],g100:[Math.min(s.gp,100),100],
    a80:[s.gp>=10?Math.min(Math.round((s.co/Math.max(s.gp,1))*100),100):Math.min(s.gp,10),s.gp>=10?80:10],
    util:[ALL_POS.filter(p=>(s.ps[p]?.p||0)>=1).length,ALL_POS.length],
    c10:[Math.min(s.cl?.length||0,10),10],c20:[Math.min(s.cl?.length||0,20),20],
    daily3:[Math.min(s.ds||0,3),3],daily7:[Math.min(s.ds||0,7),7],perf5:[Math.min(s.sp||0,5),5]};
  return map[id]||[0,1];
}
function getLvl(p){for(let i=LEVELS.length-1;i>=0;i--)if(p>=LEVELS[i].min)return LEVELS[i];return LEVELS[0];}
function getNxt(p){for(const l of LEVELS)if(p<l.min)return l;return null;}

const DAILY_FREE = 15;
const STORAGE_KEY = "bsm_v5";
const LB_KEY = "bsm_lb";
function getWeek(){const d=new Date();const jan1=new Date(d.getFullYear(),0,1);return Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7)+"-"+d.getFullYear();}
const BASEBALL_NAMES=["Slugger","Ace","Rookie","MVP","Clutch","Hammer","Flash","Blaze","Storm","Thunder","Captain","Dash","Nitro","Phoenix","Cobra","Falcon","Eagle","Mustang","Raptor","Viking"];
const AGE_GROUPS=[{id:"6-8",label:"Ages 6-8",desc:"Basic concepts, simple language",maxDiff:1},{id:"9-10",label:"Ages 9-10",desc:"Force plays, cutoffs, stealing",maxDiff:2},{id:"11-12",label:"Ages 11-12",desc:"Full situational awareness",maxDiff:3},{id:"13+",label:"Ages 13+",desc:"Advanced strategy & sabermetrics",maxDiff:3}];
const SEASON_STAGES=[
  {name:"Spring Training",emoji:"🌴",games:2,diff:1,color:"#22c55e",
    story:"First day of camp. Coach hands you a glove and says 'Show me what you've got, kid.' The sun is warm, the grass is fresh, and anything feels possible."},
  {name:"Opening Day",emoji:"🎉",games:1,diff:1,color:"#3b82f6",
    story:"The stands are packed. The anthem just finished. The crowd roars as you step onto the field. It's real now."},
  {name:"Regular Season",emoji:"⚾",games:3,diff:2,color:"#f59e0b",
    story:"June heat. Dog days. Every game blends together — but every decision still counts. This is where real players separate themselves."},
  {name:"All-Star Break",emoji:"🌟",games:1,diff:2,color:"#a855f7",
    story:"You made the All-Star team. The best players from every team are here. Time to show the whole league what you're about."},
  {name:"Pennant Race",emoji:"🔥",games:2,diff:3,color:"#ef4444",
    story:"September. The air is electric. Every game matters. One wrong call and the season's over. Every at-bat feels like the last."},
  {name:"Playoffs",emoji:"🏆",games:2,diff:3,color:"#eab308",
    story:"Elimination game. The crowd is deafening. Your heart is pounding. No room for mistakes — this is what you trained for."},
  {name:"World Series",emoji:"👑",games:1,diff:3,color:"#f59e0b",
    story:"Game 7. Bottom of the 9th. The whole world is watching. This is the moment every kid dreams about. Make it count."},
];
const SEASON_TOTAL=SEASON_STAGES.reduce((s,st)=>s+st.games*3,0);
const FIELD_THEMES=[
  {id:"default",name:"Classic",emoji:"🏟️",grass:["#5cd97a","#4ec96c","#40b95e","#32a950"],dirt:["#e0b882","#cca06a"],sky:"#0c1520",skyTop:"#4a90d9",skyBot:"#87ceeb",wall:["#1a6030","#28843e"],fence:"#facc15",inGrass:"#48b85e",mound:["#cca068","#aa8450"],warn:"#b0905e",crowd:["#e74c3c","#3498db","#f1c40f","#2ecc71","#e67e22","#9b59b6"],crowdBg:"#2a5a3a",scoreBd:"#1a3a20",scoreTxt:"#f5d020",banner:["#e74c3c","#3498db","#f1c40f"],foulPole:"#f5d020",unlock:null,desc:"The original"},
  {id:"night",name:"Night Game",emoji:"🌙",grass:["#3a8a4e","#308a44","#26703a","#1c5a30"],dirt:["#c09068","#a87a55"],sky:"#040a14",skyTop:"#060e1a",skyBot:"#0c1a2e",wall:["#102818","#1a4028"],fence:"#e0b010",inGrass:"#308a40",mound:["#b08050","#906840"],warn:"#907048",crowd:["#8b3a3a","#2a6090","#b0902a","#2a8050","#a06020","#6a3a80"],crowdBg:"#0a1a10",scoreBd:"#0a180e",scoreTxt:"#c0a020",banner:["#8b3a3a","#2a6090","#b0902a"],foulPole:"#c0a020",unlock:{type:"gp",val:25},desc:"Under the lights"},
  {id:"sunny",name:"Sunny Day",emoji:"☀️",grass:["#62d880","#54c86c","#46b85e","#38a850"],dirt:["#e8c48a","#d0ac72"],sky:"#0e2040",skyTop:"#60a8f0",skyBot:"#a0d8ff",wall:["#1f7040","#30a050"],fence:"#fcd934",inGrass:"#56d06c",mound:["#dab880","#c0a068"],warn:"#c0a070",crowd:["#ff6b6b","#4ecdc4","#ffe66d","#51cf66","#ffa94d","#cc5de8"],crowdBg:"#2a6a40",scoreBd:"#1a4020",scoreTxt:"#ffe030",banner:["#ff6b6b","#4ecdc4","#ffe66d"],foulPole:"#ffe030",unlock:{type:"gp",val:50},desc:"Perfect weather"},
  {id:"dome",name:"The Dome",emoji:"🏛️",grass:["#40a855","#389848","#2e8840","#247838"],dirt:["#c8a470","#b09060"],sky:"#14142a",skyTop:"#1a1a36",skyBot:"#28284e",wall:["#2a2a4e","#3a3a5e"],fence:"#8080ff",inGrass:"#389848",mound:["#b89060","#987848"],warn:"#988060",crowd:["#6a6aaa","#5050c0","#8080d0","#7070b0","#6060a0","#9090c0"],crowdBg:"#1a1a30",scoreBd:"#14142a",scoreTxt:"#8080ff",banner:["#6a6aaa","#5050c0","#8080d0"],foulPole:"#8080ff",unlock:{type:"ds",val:10},desc:"Indoor arena"},
  {id:"retro",name:"Retro Park",emoji:"📻",grass:["#6a9a50","#5c8a46","#4e7a3c","#407032"],dirt:["#c8a878","#b09060"],sky:"#181410",skyTop:"#c0a060",skyBot:"#e8c880",wall:["#3a3020","#504030"],fence:"#d0a860",inGrass:"#5a8a45",mound:["#b89868","#987850"],warn:"#a89070",crowd:["#c06030","#806030","#d0a040","#607840","#b07030","#906050"],crowdBg:"#2a2018",scoreBd:"#1a1810",scoreTxt:"#d0a860",banner:["#c06030","#806030","#d0a040"],foulPole:"#d0a860",unlock:{type:"cl",val:30},desc:"Old-timey charm"},
  {id:"spring",name:"Spring Training",emoji:"🌸",grass:["#70d888","#62c87a","#54b86c","#46a85e"],dirt:["#e8c890","#d0b078"],sky:"#0e1828",skyTop:"#78b8e8","skyBot":"#c0e0f8",wall:["#2a7840","#3a9850"],fence:"#f8d840",inGrass:"#60c070",mound:["#d8b878","#c0a060"],warn:"#c0a868",crowd:["#f06898","#48c0d0","#f8d060","#60d070","#f0a040","#b870d0"],crowdBg:"#306840",scoreBd:"#204830",scoreTxt:"#f8d840",banner:["#f06898","#48c0d0","#f8d060"],foulPole:"#f8d840",unlock:{type:"gp",val:75},desc:"Fresh start vibes"},
  {id:"worldseries",name:"World Series",emoji:"🏆",grass:["#4ac066","#3cb058","#2ea04a","#20903c"],dirt:["#d8b070","#c09858"],sky:"#080e18",skyTop:"#1a2a40",skyBot:"#2a4060",wall:["#142838","#1e3a4e"],fence:"#f0c010",inGrass:"#38a850",mound:["#c8a058","#a88840"],warn:"#a89058",crowd:["#e84040","#3888d8","#f0c020","#38b858","#e88020","#a050c8"],crowdBg:"#142a28",scoreBd:"#0a1a18",scoreTxt:"#f0c010",banner:["#f0c010","#e84040","#3888d8"],foulPole:"#f0c010",unlock:{type:"gp",val:100},desc:"October classic"},
  {id:"sandlot",name:"Sandlot",emoji:"🏡",grass:["#7ab85a","#6ca84e","#5e9842","#508836"],dirt:["#d0a060","#b88848"],sky:"#121820",skyTop:"#80b8e0",skyBot:"#b0d8f0",wall:["#8a6840","#705030"],fence:"#a08040",inGrass:"#68a04c",mound:["#c09050","#a07838"],warn:"#a08848",crowd:["#c87040","#9070a0","#b0a040","#70a060","#c09030","#808070"],crowdBg:"#3a3020",scoreBd:"#282018",scoreTxt:"#c0a040",banner:["#c87040","#9070a0","#b0a040"],foulPole:"#a08040",unlock:{type:"ds",val:21},desc:"Neighborhood magic"},
  {id:"winter",name:"Winter Classic",emoji:"❄️",grass:["#88b8a0","#78a890","#689880","#588870"],dirt:["#c0b098","#a89880"],sky:"#0a1018",skyTop:"#607888",skyBot:"#98b0c0",wall:["#506068","#607078"],fence:"#90a8b0",inGrass:"#70a888",mound:["#b0a088","#988870"],warn:"#989080",crowd:["#5080a0","#406888","#7090a8","#608898","#507888","#80a0b0"],crowdBg:"#283038",scoreBd:"#1a2028",scoreTxt:"#90a8b0",banner:["#5080a0","#406888","#7090a8"],foulPole:"#90a8b0",unlock:{type:"cl",val:50},desc:"Frosty diamond"},
  {id:"allstar",name:"All-Star Game",emoji:"⭐",grass:["#50c870","#42b862","#34a854","#269846"],dirt:["#e0b878","#c8a060"],sky:"#0a0e1a",skyTop:"#1a2848",skyBot:"#304870",wall:["#18284a","#203860"],fence:"#f8d020",inGrass:"#42b060",mound:["#d0a860","#b89048"],warn:"#b89858",crowd:["#f04848","#4088e0","#f8c828","#40c060","#f09028","#a858d8"],crowdBg:"#182840",scoreBd:"#101830",scoreTxt:"#f8d020",banner:["#f8d020","#f04848","#4088e0"],foulPole:"#f8d020",unlock:{type:"gp",val:150},desc:"Midsummer showcase"},
];
function themeOk(th,s){if(!th.unlock)return true;const{type:t,val:v}=th.unlock;if(t==="gp")return s.gp>=v;if(t==="ds")return s.ds>=v;if(t==="cl")return(s.cl?.length||0)>=v;return false;}
const AVATAR_OPTS={
  jersey:["#2563eb","#ef4444","#22c55e","#f59e0b","#a855f7","#ec4899"],
  cap:["#1d4ed8","#dc2626","#16a34a","#d97706","#7c3aed","#db2777"],
  bat:["#c8a060","#404040","#e8e8e8"]
};
const STADIUM_MILESTONES=[
  {games:50,label:"Scoreboard Lights",desc:"Your scoreboard lights up!",icon:"💡"},
  {games:100,label:"Team Pennants",desc:"Pennant banners fly your colors!",icon:"🚩"},
  {games:200,label:"Fireworks",desc:"Fireworks on perfect answers!",icon:"🎆"},
  {games:330,label:"Legend Stadium",desc:"Golden border + Legend title!",icon:"👑"},
];
const DEFAULT = {pts:0,str:0,bs:0,gp:0,co:0,ps:{},achs:[],cl:[],ds:0,lastDay:null,todayPlayed:0,todayDate:null,sp:0,isPro:false,onboarded:false,soundOn:true,recentWrong:[],dailyDone:false,dailyDate:null,streakFreezes:0,survivalBest:0,ageGroup:"11-12",displayName:"",teamCode:"",seasonGame:0,seasonCorrect:0,seasonComplete:false,fieldTheme:"default",avatarJersey:0,avatarCap:0,avatarBat:0,season:1};

// Streak flame visual — grows with daily streak length
function getFlame(ds){
  if(ds>=100)return{icon:"🔷",label:"LEGENDARY",color:"#38bdf8",glow:"rgba(56,189,248,.3)",size:22};
  if(ds>=50)return{icon:"💜",label:"EPIC",color:"#a855f7",glow:"rgba(168,85,247,.3)",size:20};
  if(ds>=30)return{icon:"🔵",label:"BLUE FLAME",color:"#3b82f6",glow:"rgba(59,130,246,.3)",size:19};
  if(ds>=14)return{icon:"🔥",label:"ON FIRE",color:"#ef4444",glow:"rgba(239,68,68,.25)",size:18};
  if(ds>=7)return{icon:"🔥",label:"HOT",color:"#f97316",glow:"rgba(249,115,22,.2)",size:16};
  if(ds>=3)return{icon:"🔥",label:"WARM",color:"#f59e0b",glow:"rgba(245,158,11,.15)",size:14};
  return{icon:"🔥",label:"",color:"#f97316",glow:"none",size:12};
}
const STREAK_MILESTONES=[7,14,30,50,100];

// Daily Diamond Play — deterministic scenario based on date
function getDailyScenario(){
  const today=new Date().toDateString();
  // Simple hash: sum char codes of date string
  let hash=0;for(let i=0;i<today.length;i++)hash=((hash<<5)-hash+today.charCodeAt(i))|0;
  hash=Math.abs(hash);
  // Flatten all scenarios into one pool
  const allSc=Object.entries(SCENARIOS).flatMap(([pos,arr])=>arr.map(s=>({...s,_pos:pos})));
  const idx=hash%allSc.length;
  // Also pick a secondary based on different hash for variety across days
  return allSc[idx];
}

// ============================================================================
// AI SCENARIO GENERATION — calls Claude API for personalized content
// ============================================================================
const ANIMS = ["strike","strikeout","hit","groundout","flyout","steal","score","advance","catch","throwHome","doubleplay","bunt","walk","safe","freeze"];
const POS_PRINCIPLES = {
  pitcher:"Pitch selection depends on count, situation, and batter tendencies. First-pitch strikes are critical (.340 BA on first-pitch strikes vs .167 on 0-2). Work ahead in the count. Pitch to contact with a lead; pitch for strikeouts in high leverage. From the stretch with runners on: be quick to the plate, vary hold times. Pickoffs: disrupt timing, don't just throw blindly. Fielding bunts and covering first are pitcher responsibilities. Pitch sequencing: set up pitches with eye level and speed changes.",
  catcher:"The catcher is the field general — calls pitches based on count, batter weakness, and game situation. Framing: subtle glove pull on borderline pitches; stillness in high-leverage counts. Blocking: smother balls in the dirt, keep them in front. Throwing out runners: quick transfer, strong accurate throw to the bag side. Pop-ups near home: catcher has priority, turn your back to the field (the ball curves back toward the field). Mound visits: calm the pitcher, refocus on the plan.",
  firstBase:"Scoop low throws — stretch toward the throw, keep your foot on the bag. Hold runners: give the pitcher a target, apply tag on pickoff throws. On bunts: charge aggressively, the second baseman covers first. Cutoff on throws from right field to home. 3-6-3 double play: catch, step on first, throw to shortstop covering second. Know when force is removed (runner out ahead of you = tag play, not force).",
  secondBase:"Double play pivot: receive the feed, touch second, get off the bag quickly to avoid the runner. Relay man on balls hit to RIGHT field — line up between outfielder and home plate (default toward home). Cover first on bunts when 1B charges. FLY BALL PRIORITY: outfielder coming in ALWAYS has priority over you going back. Going back on a fly is the hardest catch — let the outfielder take tweeners.",
  shortstop:"Captain of the infield for communication. Double play feed: firm chest-high throw. Relay man on balls hit to LEFT field — default alignment toward home plate. Deep-hole play: plant hard, strong throw across the diamond. Steal coverage: straddle the bag, sweep tag down. FLY BALL PRIORITY: outfielder coming in ALWAYS has priority over you going back. Never call off an outfielder on a shallow fly — they have the easier catch.",
  thirdBase:"Hot corner: quick reactions on hard-hit balls. Bunt defense: crash hard, bare-hand if needed, strong throw to first. Slow rollers: charge aggressively, bare-hand pickup and throw in one motion. Guard the line late in close games to prevent extra-base hits. Against pull hitters (right-handed): shade toward the line. FLY BALL PRIORITY: outfielder coming in has priority on tweeners behind you.",
  leftField:"Outfielder priority: you have priority over ALL infielders on fly balls you can reach. Coming in on a ball is easier than going back — the ball is in front of you. Hit the cutoff man — don't try to throw all the way home unless the play is there. Wall play: round the ball so momentum carries toward the infield. Back up third base on all infield ground balls. Sun balls: use glove as a shield.",
  centerField:"You are the priority fielder on ALL fly balls you can reach — center fielder has priority over corner outfielders AND all infielders. Call it loud and early. Gap coverage: take angle routes, not straight-back routes. Do-or-die throws: charge the ball, crow-hop, throw through the cutoff. Communication is your responsibility — you see the whole field. Back up second base on infield plays.",
  rightField:"Strong arm is your biggest weapon — throw out runners at third and home. Back up first base on EVERY infield grounder (your most important routine job). Outfielder priority: you have priority over infielders (1B, 2B) on fly balls you can reach. Coming in is always easier than going back. Cutoff throws: hit the cutoff unless you have a clear play. Wall play: learn caroms off the wall in your corner.",
  batter:"Count leverage is everything. Hitter's counts (1-0, 2-0, 2-1, 3-1): be aggressive on your pitch. Pitcher's counts (0-1, 0-2, 1-2): protect the zone, shorten up. Two-strike approach: expand the zone slightly, fight off tough pitches. Situational hitting: runner on third with less than 2 outs = fly ball scores him. Hit behind the runner to advance from second to third. RE24 data: sacrifice bunts usually LOWER run expectancy except with weak hitters late in close games needing exactly 1 run.",
  baserunner:"Stolen bases break even at ~72% success rate (per RE24) — below that, you're hurting your team. Read the pitcher: watch first-move pickoff tells, time his delivery. Tag-ups: watch the fielder's feet, leave on the catch. Line drives: freeze and read, never get doubled off. Advancing on contact: aggressive but smart — never make the first or third out at third base. Respect coach's signs always. Secondary leads: key to advancing on passed balls and wild pitches.",
  manager:"Manage by the situation, not by the book. RE24 run expectancy guides sacrifice bunt decisions (usually bad except: weak hitter, late game, need exactly 1 run). Stolen bases need ~72% success to break even. Pitching changes: matchup advantages (L/R platoon), fatigue, times through the order (batters hit ~30 points better third time through). Intentional walks: only with first base open and a clear skill gap to next hitter. Defensive positioning: guard lines late, play for DP early."
};

async function generateAIScenario(position, stats, conceptsLearned = [], recentWrong = [], signal = null) {
  const lvl = getLvl(stats.pts);
  const posStats = stats.ps[position] || { p: 0, c: 0 };
  const posAcc = posStats.p > 0 ? Math.round((posStats.c / posStats.p) * 100) : 50;
  
  // Build personalization context
  const weakAreas = [];
  if (posAcc < 50) weakAreas.push("player struggles at this position — make it slightly easier to build confidence");
  if (posAcc > 80 && posStats.p > 5) weakAreas.push("player is strong here — increase difficulty and complexity");
  if (recentWrong.length > 0) weakAreas.push(`player recently got these concepts wrong: ${recentWrong.slice(-3).join("; ")}. Create a scenario that revisits one of these concepts from a different angle.`);
  
  const diffTarget = posAcc > 75 ? 3 : posAcc > 50 ? 2 : 1;
  
  const prompt = `You are creating a baseball strategy scenario for an educational game aimed at young players (ages 8-18).

PLAYER CONTEXT:
- Level: ${lvl.n} (${stats.pts} points, ${stats.gp} games played)
- Position: ${position} (${posStats.p} played, ${posAcc}% accuracy)
- Target difficulty: ${diffTarget}/3 (1=Rookie, 2=Intermediate, 3=Advanced)
- Concepts already mastered: ${conceptsLearned.length > 0 ? conceptsLearned.slice(-10).join("; ") : "none yet"}
${weakAreas.length > 0 ? `- Personalization: ${weakAreas.join(". ")}` : ""}

POSITION PRINCIPLES (authoritative — follow these strictly): ${POS_PRINCIPLES[position]}

DATA REFERENCE (use these real statistics in explanations when relevant):
- Run expectancy with runner on 1st, 0 out: ~0.94 runs. Runner on 2nd, 0 out: ~1.17 runs. Bases loaded, 0 out: ~2.29 runs.
- Sacrifice bunts usually LOWER run expectancy (e.g., runner on 2nd with 0 out: 1.17 → runner on 3rd with 1 out: 0.99). Exception: weak hitter, late game, need exactly 1 run.
- Stolen base break-even: ~72% success rate needed to be worthwhile (per RE24).
- Batting average by count: 0-0 ~.340 first-pitch strikes, 0-2 ~.167, 2-0 ~.400, 3-1 ~.370, full count ~.230.
- Batters hit ~30 points better the 3rd time through the order vs the 1st time.
- Fly ball priority hierarchy: OF coming in > IF going back. Center > corners. Ball drifts TOWARD outfielder, AWAY from infielder.
- Relay default: always toward HOME plate. Preventing runs is the #1 priority.
- Force play: removed when the runner ahead is put out. Remaining plays become TAG plays.

SELF-AUDIT — Before outputting, verify ALL of these:
1. Is the game situation physically possible? (outs 0-2, count valid, runners/score make sense together)
2. Can this player physically perform all 4 options from their position in this moment?
3. Does the best answer match what an authoritative coaching source would teach?
4. Do the explanations cite correct rules? (force vs tag, who has priority, relay direction)
5. Are cited statistics approximately correct? (don't invent fake percentages)
6. Does the scenario contradict any principle in POSITION PRINCIPLES above?
7. Is the anim type consistent with the scenario action? (e.g., don't use throwHome when the play is to third)

REQUIREMENTS:
- Create ONE unique scenario the player hasn't seen before
- It must teach a SPECIFIC baseball strategy concept not in the mastered list above
- Include realistic MLB context (real stats, real situations)
- Description should be 2-3 sentences, vivid and immersive
- Exactly 4 options — one clearly optimal, one decent, two poor
- Each explanation should be 1-2 sentences teaching the WHY
- The concept should be a single memorable sentence
- Success rates: optimal=75-90, decent=45-65, poor options=10-40
- Use age-appropriate language but don't talk down

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "title": "Short Catchy Title",
  "diff": ${diffTarget},
  "description": "Vivid 2-3 sentence scenario description",
  "situation": {"inning": "Bot 7", "outs": 1, "count": "2-1", "runners": [1, 3], "score": [3, 2]},
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "best": 0,
  "explanations": ["Why A is best/worst", "Why B is best/worst", "Why C is best/worst", "Why D is best/worst"],
  "rates": [85, 55, 30, 20],
  "concept": "One-sentence strategic concept this teaches",
  "anim": "one of: strike, strikeout, hit, groundout, flyout, steal, score, advance, catch, throwHome, doubleplay, bunt, walk, safe, freeze"
}

Rules for situation.runners: empty array [] = no runners, [1] = runner on 1st, [1,3] = runners on 1st and 3rd, [1,2,3] = bases loaded, etc.
Rules for situation.count: use "B-S" format like "2-1" or "3-2", or "-" for fielding scenarios where count doesn't matter.
Rules for situation.score: MUST be array format [home, away] like [3, 2].
Rules for best: 0-indexed integer matching the optimal option in the options array.`;

  try {
    // Create timeout - abort after 10 seconds
    const timeoutId = setTimeout(() => { if (signal && !signal.aborted) signal = null; }, 10000);
    const fetchOpts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    };
    if (signal) fetchOpts.signal = signal;
    
    const response = await Promise.race([
      fetch("https://api.anthropic.com/v1/messages", fetchOpts),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
    ]);
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    const text = data.content?.find(b => b.type === "text")?.text || "";
    
    // Parse JSON — strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, "").trim();
    const scenario = JSON.parse(clean);
    
    // Validate
    if (!scenario.title || !scenario.options || scenario.options.length !== 4 ||
        !scenario.explanations || scenario.explanations.length !== 4 ||
        typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3 ||
        !scenario.concept || !scenario.rates || scenario.rates.length !== 4) {
      throw new Error("Invalid scenario structure");
    }
    
    // Ensure anim is valid
    if (!ANIMS.includes(scenario.anim)) scenario.anim = "strike";
    // Ensure diff is valid
    if (![1,2,3].includes(scenario.diff)) scenario.diff = diffTarget;
    // Normalize situation
    if (!scenario.situation) scenario.situation = {};
    if (!Array.isArray(scenario.situation.runners)) scenario.situation.runners = [];
    // Normalize score — handle {home:X,away:Y} or missing
    const sc_score = scenario.situation.score;
    if (!Array.isArray(sc_score)) {
      if (sc_score && typeof sc_score === "object") {
        scenario.situation.score = [sc_score.home||0, sc_score.away||0];
      } else {
        scenario.situation.score = [0, 0];
      }
    }
    if (!scenario.situation.outs && scenario.situation.outs !== 0) scenario.situation.outs = 0;
    if (!scenario.situation.inning) scenario.situation.inning = "Mid";
    if (!scenario.situation.count) scenario.situation.count = "-";
    
    scenario.id = `ai_${Date.now()}`;
    scenario.isAI = true;
    scenario.cat = "ai-generated";
    
    return scenario;
  } catch (err) {
    console.error("AI generation failed:", err);
    return null;
  }
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
    }catch{}
  },[getCtx]);
  return{play,setEnabled:(v)=>{enabled.current=v}};
}

// Confetti burst — SVG particle effect for level-ups and achievements
function Confetti({active}){
  if(!active)return null;
  const colors=["#22c55e","#f59e0b","#3b82f6","#ef4444","#a855f7","#ec4899","#14b8a6"];
  const particles=Array.from({length:28},(_,i)=>({
    x:200+Math.cos(i*0.45)*10,y:150,
    dx:(Math.random()-.5)*8,dy:-(Math.random()*4+2),
    c:colors[i%colors.length],s:Math.random()*4+2,d:Math.random()*0.6+0.4
  }));
  return(<svg viewBox="0 0 400 300" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:50}}>
    {particles.map((p,i)=>(
      <rect key={i} width={p.s} height={p.s} rx={1} fill={p.c} opacity={0.9}>
        <animate attributeName="x" from={p.x} to={p.x+p.dx*40} dur={`${p.d+0.5}s`} fill="freeze"/>
        <animate attributeName="y" from={p.y} to={p.y+p.dy*20+120} dur={`${p.d+0.5}s`} fill="freeze"/>
        <animate attributeName="opacity" from="0.9" to="0" dur={`${p.d+0.5}s`} fill="freeze"/>
        <animateTransform attributeName="transform" type="rotate" from="0" to={`${Math.random()>0.5?360:-360}`} dur={`${p.d+0.3}s`} fill="freeze"/>
      </rect>
    ))}
  </svg>);
}

// Field SVG — Bright, fun, kid-friendly baseball field
function Field({runners=[],outcome=null,ak=0,anim=null,theme=null,avatar=null,pos=null}){
  const t=theme||FIELD_THEMES[0];
  const on=n=>runners.includes(n);
  // Coords: Home(200,290) 1B(290,210) 2B(200,135) 3B(110,210) Mound(200,218)
  // Player sprite — 40% smaller, pose-aware with distinct silhouettes per pose
  const Guy=({x,y,jersey="#2563eb",cap="#1d4ed8",pants="#eee",o=1,ring=false,bat=false,mask=false,batColor="#c8a060",pose="stand"})=>{
    const p=pose;const showBat=bat||p==="batter";const showMask=mask||p==="catcher";
    // Each pose gets a unique body transform for silhouette distinction
    const pxf=p==="runner"?" rotate(15)":p==="catcher"?" translate(0,8)":p==="pitcher"?" rotate(-8)":p==="batter"?" rotate(-8)":p==="infielder"?" translate(0,3)":"";
    // Catcher squat lowers head & cap
    const hy=p==="catcher"?-12:-16;
    return(
    <g transform={`translate(${x},${y})`} opacity={o}>
      {ring&&<><circle r="16" fill="none" stroke="#f59e0b" strokeWidth="2" opacity=".6"><animate attributeName="r" values="16;19;16" dur="1.3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;.2;.6" dur="1.3s" repeatCount="indefinite"/></circle><circle r="16" fill="rgba(245,158,11,.06)"/></>}
      <g transform={`scale(0.6)${pxf}`}>
        <ellipse cy="18" rx="10" ry="3.5" fill="rgba(0,0,0,.25)"/>
        {/* Feet — wider for catcher/batter/infielder; pitcher left foot raised */}
        <rect x={p==="catcher"?-9:p==="infielder"||p==="batter"?-8:-7.5} y={p==="pitcher"?8:13} width="6" height="4" rx="1.5" fill="#222"/>
        <rect x={p==="catcher"||p==="batter"?3:p==="infielder"?2:1.5} y={p==="runner"?10:13} width="6" height="4" rx="1.5" fill="#222"/>
        {/* Legs — pitcher: raised left knee; catcher: shorter squat */}
        {p==="catcher"?<>
          <rect x="-8" y="5" width="6" height="8" rx="2" fill={pants}/>
          <rect x="2" y="5" width="6" height="8" rx="2" fill={pants}/>
        </>:p==="pitcher"?<>
          <rect x="-7" y="5" width="6" height="6" rx="2" fill={pants}/>
          <rect x="1" y="5" width="6" height="10" rx="2" fill={pants}/>
        </>:<>
          <rect x="-7" y="5" width="6" height="10" rx="2" fill={pants}/>
          <rect x="1" y="5" width="6" height="10" rx="2" fill={pants}/>
        </>}
        {/* Torso — catcher: shorter */}
        <rect x="-9" y={p==="catcher"?-6:-10} width="18" height={p==="catcher"?13:17} rx="4" fill={jersey} stroke="rgba(255,255,255,.2)" strokeWidth=".8"/>
        {/* Left arm + hand — outfielder: raised shading eyes; runner: forward swing */}
        {p==="outfielder"?
          <g><rect x="-13" y="-14" width="5" height="10" rx="2" fill={jersey}/><circle cx="-10.5" cy="-10" r="2.5" fill="#e8c4a0"/></g>
        :p==="runner"?
          <g transform="rotate(20,-10.5,-3)"><rect x="-13" y="-8" width="5" height="10" rx="2" fill={jersey}/><circle cx="-10.5" cy="4" r="2.5" fill="#e8c4a0"/></g>
        :<>
          <rect x="-13" y="-8" width="5" height="10" rx="2" fill={jersey}/>
          <circle cx="-10.5" cy="4" r="2.5" fill="#e8c4a0"/>
        </>}
        {/* Right arm + hand/equipment — pitcher: wind-up -60deg w/ ball; runner: back swing */}
        {p==="pitcher"?
          <g transform="rotate(-60,10.5,-3)"><rect x="8" y="-12" width="5" height="10" rx="2" fill={jersey}/><circle cx="12" cy="-18" r="2" fill="white"/></g>
        :p==="runner"?
          <g transform="rotate(-20,10.5,-3)"><rect x="8" y="-8" width="5" height="10" rx="2" fill={jersey}/><circle cx="10.5" cy="4" r="2.5" fill="#e8c4a0"/></g>
        :<>
          <rect x="8" y="-8" width="5" height="10" rx="2" fill={jersey}/>
          {p==="infielder"?<ellipse cx="16" cy="8" rx="4" ry="3" fill="#8B5E3C"/>
            :p==="outfielder"?<ellipse cx="14" cy="0" rx="4" ry="3" fill="#8B5E3C"/>
            :p==="catcher"?<ellipse cx="14" cy="2" rx="5" ry="4" fill="#8B5E3C"/>
            :<circle cx="10.5" cy="4" r="2.5" fill="#e8c4a0"/>}
        </>}
        {/* Head — catcher head lowered via hy */}
        <circle cy={hy} r="8" fill="#e8c4a0"/>
        <circle cx="-3" cy={hy-1} r="1.2" fill="#333"/>
        <circle cx="3" cy={hy-1} r="1.2" fill="#333"/>
        <path d={`M-2.5,${hy+2.5} Q0,${hy+4.5} 2.5,${hy+2.5}`} fill="none" stroke="#a0785a" strokeWidth=".8" strokeLinecap="round"/>
        {/* Cap — position tracks head */}
        <ellipse cy={hy-5} rx="9.5" ry="4" fill={cap}/>
        <rect x="-9.5" y={hy-7} width="19" height="5" rx="3" fill={cap}/>
        <rect x="-2" y={hy-1} width="12" height="3" rx="1.5" fill={cap} opacity=".6"/>
        {/* Catcher mask */}
        {showMask&&<><rect x="-6.5" y={hy+1} width="13" height="10" rx="2" fill="none" stroke="#555" strokeWidth="1" opacity=".6"/><line x1="-5" y1={hy+4} x2="5" y2={hy+4} stroke="#555" strokeWidth=".6" opacity=".4"/><line x1="-5" y1={hy+7} x2="5" y2={hy+7} stroke="#555" strokeWidth=".6" opacity=".4"/></>}
        {/* Bat */}
        {showBat&&<><line x1="8" y1="-8" x2="20" y2="-28" stroke={batColor} strokeWidth="3" strokeLinecap="round"/><line x1="19.5" y1="-27.5" x2="22.5" y2="-33" stroke={batColor} strokeWidth="4.5" strokeLinecap="round" opacity=".8"/></>}
      </g>
    </g>
    );
  };
  return(
    <svg viewBox="0 0 400 310" style={{width:"100%",maxWidth:420,display:"block",margin:"0 auto"}}>
      <defs>
        <linearGradient id="drt" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0%" stopColor={t.dirt[0]}/>
          <stop offset="100%" stopColor={t.dirt[1]}/>
        </linearGradient>
        <linearGradient id="wal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.wall[0]}/>
          <stop offset="100%" stopColor={t.wall[1]}/>
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

      {/* === FULL-CANVAS GRASS === */}
      <rect width="400" height="310" fill={t.grass[0]}/>

      {/* === BOLD MOWING STRIPES (clipped to fan) === */}
      <g clipPath="url(#fc)">
        {[...Array(8)].map((_,i)=><rect key={`m${i}`} x="0" y={35+i*32} width="400" height="32"
          fill={i%2===0?t.grass[2]:"rgba(255,255,255,.07)"} opacity={i%2===0?".14":".08"}/>)}
      </g>

      {/* === GRASS TEXTURE OVERLAY === */}
      <rect width="400" height="310" fill="url(#grassTex)" clipPath="url(#fc)"/>

      {/* === DEPTH DARKENING (outfield fades darker — full height) === */}
      <rect width="400" height="310" fill="url(#depthGrad)" clipPath="url(#fc)"/>

      {/* === OUTFIELD WALL (padded) === */}
      <path d="M0,0 L400,0 L400,30 Q200,2 0,30 Z" fill="url(#wal)"/>
      {/* Wall padding seam lines */}
      {[8,16,24].map(y=><path key={`ws${y}`} d={`M10,${y} Q200,${y-4} 390,${y}`}
        fill="none" stroke="rgba(255,255,255,.06)" strokeWidth=".5"/>)}
      {/* Batter's eye (dark center field section) */}
      <path d="M160,0 L240,0 L240,30 Q200,2 160,30 Z" fill="rgba(0,0,0,.25)"/>
      <path d="M0,30 Q200,2 400,30" fill="none" stroke={t.wall[0]} strokeWidth=".8" strokeDasharray="3,2" opacity=".4"/>

      {/* === FENCE CAP === */}
      <path d="M0,30 Q200,2 400,30" fill="none" stroke={t.fence} strokeWidth="3"/>

      {/* === WALL SHADOW (cast onto field) === */}
      <path d="M0,32 Q200,4 400,32 L400,38 Q200,10 0,38 Z" fill="rgba(0,0,0,.12)"/>

      {/* === FOUL POLES === */}
      <line x1="12" y1="8" x2="12" y2="34" stroke={t.foulPole} strokeWidth="2" opacity=".8"/>
      <circle cx="12" cy="8" r="2.5" fill={t.foulPole} opacity=".8"/>
      <line x1="388" y1="8" x2="388" y2="34" stroke={t.foulPole} strokeWidth="2" opacity=".8"/>
      <circle cx="388" cy="8" r="2.5" fill={t.foulPole} opacity=".8"/>

      {/* === MINI SCOREBOARD === */}
      <g>
        <rect x="178" y="6" width="44" height="18" rx="2" fill={t.scoreBd} stroke={t.fence} strokeWidth=".5"/>
        <text x="200" y="14" textAnchor="middle" fontSize="4" fill={t.scoreTxt} fontWeight="700" fontFamily="monospace">HOME  AWAY</text>
        {[0,1,2,3,4,5,6,7,8].map(i=><circle key={`sd${i}`} cx={182+i*4.5} cy={20} r=".8" fill={t.scoreTxt} opacity=".4"/>)}
      </g>

      {/* === WARNING TRACK === */}
      <path d="M2,34 Q200,6 398,34 L394,42 Q200,14 6,42 Z" fill={t.warn} opacity=".5"/>

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

      {/* === BASES === */}
      {[[290,210,1],[200,135,2],[110,210,3]].map(([x,y,n])=>(
        <g key={`b${n}`} transform={`translate(${x},${y}) rotate(45)`}>
          <rect x="-6" y="-6" width="12" height="12" rx="1.2" fill={on(n)?"#3b82f6":"white"} stroke={on(n)?"#60a5fa":"#ccc"} strokeWidth="1.5">
            {on(n)&&<animate attributeName="opacity" values="1;.5;1" dur="1.2s" repeatCount="indefinite"/>}
          </rect>
        </g>
      ))}

      {/* === OUTFIELDERS (home team blue) === */}
      {[["leftField",100,80],["centerField",200,58],["rightField",300,80]].map(([p,x,y])=>(
        <Guy key={p} x={x} y={y} o={pos===p?1:.50} ring={pos===p} pose="outfielder"/>
      ))}

      {/* === INFIELDERS (home team blue) === */}
      {[["shortstop",152,185],["secondBase",248,185],["firstBase",278,205],["thirdBase",122,205]].map(([p,x,y])=>(
        <Guy key={p} x={x} y={y} o={pos===p?1:.50} ring={pos===p} pose="infielder"/>
      ))}

      {/* === PITCHER (home team — always blue) === */}
      {!outcome&&<Guy x={200} y={212} jersey="#1e40af" cap="#1e3a8a" ring={pos==="pitcher"} pose="pitcher"/>}

      {/* === CATCHER (home team — always blue) === */}
      {!outcome&&<Guy x={200} y={300} jersey="#1e3a5f" cap="#1a3050" ring={pos==="catcher"} pose="catcher"/>}

      {/* === BATTER (away team — always red) === */}
      {!outcome&&<Guy x={215} y={285} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" batColor={avatar?AVATAR_OPTS.bat[avatar.b||0]:"#c8a060"} ring={pos==="batter"} pose="batter"/>}

      {/* === RUNNERS (away team — always red, golden ring) === */}
      {on(1)&&<Guy x={298} y={200} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" ring={true} pose="runner"/>}
      {on(2)&&<Guy x={200} y={125} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" ring={true} pose="runner"/>}
      {on(3)&&<Guy x={102} y={200} jersey="#dc2626" cap="#b91c1c" pants="#d1d5db" ring={true} pose="runner"/>}

      {/* ============ ANIMATIONS ============ */}
      {outcome&&<circle key={ak} cx="200" cy="215" r="0" fill={outcome==="success"?"rgba(34,197,94,.18)":outcome==="warning"?"rgba(245,158,11,.12)":"rgba(239,68,68,.12)"}><animate attributeName="r" from="0" to="180" dur=".55s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".55s" fill="freeze"/></circle>}

      {anim==="steal"&&outcome==="success"&&<g key={`a${ak}`}><circle r="5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".6s" fill="freeze" path="M290,210 Q248,170 200,135"/></circle><text x="248" y="158" textAnchor="middle" fontSize="12" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>SAFE!</text></g>}
      {anim==="score"&&outcome==="success"&&<g key={`s${ak}`}><circle r="5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".5s" fill="freeze" path="M110,210 Q160,252 200,290"/></circle><text x="200" y="265" textAnchor="middle" fontSize="14" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>SAFE!</text></g>}
      {anim==="hit"&&outcome==="success"&&<g key={`h${ak}`}><circle r="3" fill="#f59e0b" filter="url(#gl)"><animateMotion dur=".45s" fill="freeze" path="M200,290 Q252,178 306,75"/></circle><text x="265" y="112" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>BASE HIT</text></g>}
      {anim==="throwHome"&&<g key={`t${ak}`}><line x1="200" y1="135" x2="200" y2="290" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" opacity="0"><animate attributeName="opacity" from=".65" to="0" dur=".9s" fill="freeze"/></line><circle r="2.5" fill="#ef4444"><animateMotion dur=".35s" fill="freeze" path="M200,135 L200,290"/></circle></g>}
      {anim==="doubleplay"&&outcome==="success"&&<g key={`dp${ak}`}><circle r="3.5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".25s" fill="freeze" path="M290,210 Q248,170 200,135"/></circle><circle r="3.5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".25s" begin=".28s" fill="freeze" path="M200,135 Q248,170 290,210"/></circle><text x="200" y="175" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.1s" fill="freeze"/>DOUBLE PLAY!</text></g>}
      {(anim==="strike"||anim==="strikeout")&&outcome==="success"&&<g key={`st${ak}`}><circle r="2.5" fill="white" opacity=".9"><animateMotion dur=".4s" fill="freeze" path="M200,218 L200,288"/></circle><text x="200" y="263" textAnchor="middle" fontSize={anim==="strikeout"?13:10} fill={anim==="strikeout"?"#ef4444":"#f59e0b"} fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.6s" fill="freeze"/>{anim==="strikeout"?"STRUCK OUT!":"STRIKE!"}</text></g>}
      {anim==="groundout"&&outcome==="success"&&<g key={`go${ak}`}><circle r="2.5" fill="white" filter="url(#gl)"><animateMotion dur=".5s" fill="freeze" path="M200,290 Q240,252 260,230"/></circle><circle r="2.5" fill="#22c55e"><animateMotion dur=".35s" begin=".52s" fill="freeze" path="M260,230 L290,210"/></circle><text x="276" y="198" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.4s" fill="freeze"/>OUT!</text></g>}
      {anim==="flyout"&&outcome==="success"&&<g key={`fl${ak}`}><circle r="3" fill="white" filter="url(#gl)"><animateMotion dur=".55s" fill="freeze" path="M200,290 Q242,118 282,108"/></circle><text x="282" y="95" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.2s" fill="freeze"/>CAUGHT!</text></g>}
      {anim==="catch"&&outcome==="success"&&<g key={`ca${ak}`}><circle r="2.5" fill="white"><animateMotion dur=".35s" fill="freeze" path="M238,92 Q216,140 192,172"/></circle><circle cx="192" cy="172" r="0" fill="rgba(34,197,94,.25)"><animate attributeName="r" from="0" to="16" dur=".25s" begin=".35s" fill="freeze"/><animate attributeName="opacity" from=".6" to="0" dur=".25s" begin=".35s" fill="freeze"/></circle><text x="192" y="162" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>GOT IT!</text></g>}
      {anim==="advance"&&outcome==="success"&&<g key={`ad${ak}`}><circle r="4.5" fill="#3b82f6" filter="url(#gl)"><animateMotion dur=".5s" fill="freeze" path="M290,210 Q248,170 200,135"/></circle><text x="248" y="163" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>ADVANCING!</text></g>}
      {anim==="walk"&&outcome==="success"&&<g key={`wk${ak}`}><circle r="4.5" fill="#3b82f6"><animateMotion dur=".7s" fill="freeze" path="M200,290 Q248,252 290,210"/></circle><text x="200" y="263" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>BALL FOUR</text></g>}
      {anim==="bunt"&&outcome==="success"&&<g key={`bn${ak}`}><circle r="2" fill="white"><animateMotion dur=".5s" fill="freeze" path="M200,290 Q198,272 192,258"/></circle><text x="180" y="250" textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1s" fill="freeze"/>BUNT!</text></g>}
      {anim==="safe"&&outcome==="success"&&<g key={`sf${ak}`}><circle cx="200" cy="210" r="0" fill="none" stroke="#22c55e" strokeWidth="2.5"><animate attributeName="r" from="0" to="32" dur=".45s" fill="freeze"/><animate attributeName="opacity" from=".8" to="0" dur=".45s" fill="freeze"/></circle><text x="200" y="196" textAnchor="middle" fontSize="13" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>SAFE!</text></g>}
      {anim==="freeze"&&outcome==="success"&&<g key={`fr${ak}`}><text x="200" y="174" textAnchor="middle" fontSize="20" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.5s" fill="freeze"/><animate attributeName="y" from="180" to="168" dur=".35s" fill="freeze"/>⚠️</text><text x="200" y="192" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>FREEZE!</text></g>}

      {outcome&&outcome!=="success"&&(anim==="strike"||anim==="strikeout")&&<text key={`ws${ak}`} x="200" y="266" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>BALL</text>}
      {outcome&&outcome!=="success"&&anim==="steal"&&<text key={`wo${ak}`} x="248" y="165" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>OUT!</text>}
      {outcome&&outcome!=="success"&&(anim==="hit"||anim==="groundout"||anim==="flyout")&&<text key={`wh${ak}`} x="200" y="256" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>{anim==="flyout"?"FLY OUT":"OUT"}</text>}
      {/* Idle ball toss on mound when no outcome */}
      {!outcome&&<circle r="2" fill="white" opacity=".7"><animateMotion dur="1.8s" repeatCount="indefinite" path="M200,214 Q200,204 200,208 Q200,212 200,214"/><animate attributeName="opacity" values=".7;.3;.7" dur="1.8s" repeatCount="indefinite"/></circle>}
    </svg>
  );
}
function Board({sit}){
  if(!sit)return null;const{inning,outs,count,score}=sit;
  return(<div style={{background:"linear-gradient(135deg,#0d1117,#161b22)",borderRadius:10,padding:"6px 10px",display:"flex",justifyContent:"space-around",alignItems:"center",fontFamily:"'Courier New',monospace",border:"1px solid #21262d"}}>
    {[{l:"INN",v:inning,c:"#f59e0b"},{l:"SCORE",v:<><span style={{color:"#58a6ff"}}>{score?.[0]||0}</span><span style={{color:"#484f58",margin:"0 2px"}}>-</span><span style={{color:"#f85149"}}>{score?.[1]||0}</span></>,c:"white"},...(count&&count!=="-"?[{l:"COUNT",v:count,c:"#3fb950"}]:[])].map((it,i)=>(<div key={i} style={{textAlign:"center",minWidth:40}}><div style={{fontSize:7,color:"#6e7681",textTransform:"uppercase",letterSpacing:1.5,marginBottom:1,fontWeight:700}}>{it.l}</div><div style={{fontSize:16,fontWeight:900,color:it.c,lineHeight:1}}>{it.v}</div></div>))}
    <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#6e7681",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2,fontWeight:700}}>OUTS</div><div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<(outs||0)?"#f85149":"rgba(255,255,255,.05)",border:`1.5px solid ${i<(outs||0)?"#da3633":"#21262d"}`}}/>)}</div></div>
  </div>);
}

// Coach Mascot — friendly baseball character with expressions
const COACH_LINES={
  success:[
    "Perfect call, slugger!","That's big-league thinking!","You nailed it!","Pro-level decision!",
    "Coach is impressed!","Textbook play!","You're reading the game like a pro!","That's exactly what I'd do!",
    "Sharp thinking out there!","You've got baseball IQ for days!","MVP material right there!",
    "That's a veteran move!","Way to stay cool under pressure!","Smart baseball, love it!",
    "You just made the highlight reel!","The scouts are watching!","That's what champions do!",
    "You're playing chess while they play checkers!","That's heads-up ball right there!",
    "You could teach this one!","Gold glove decision!","That's the right read every time!",
    "You're seeing the whole field!","Clutch play, no doubt!","That's instinct you can't teach — wait, we just did!"
  ],
  warning:[
    "Not bad! Close one.","Good instinct, almost there!","Decent call — let's learn why.",
    "You're on the right track!","Solid effort!","Hey, that's a reasonable play!",
    "Close — just one adjustment away!","Good thinking, wrong moment for it though.",
    "I've seen pros make that same call!","That works sometimes — but there's a better option.",
    "You're thinking about it the right way!","Almost had it — read the explanation!",
    "That's a B+ play — let's get to A+!","Halfway there, keep going!",
    "Smart idea, just slightly off target.","Not a bad play — but not the best play.",
    "You've got the right instincts — let's sharpen them!","That'll work in some situations!",
    "Good effort — next time you'll nail it!","Close call! The difference is in the details."
  ],
  danger:[
    "Hey, that's how we learn!","Every pro struck out first.","Let's break this down.",
    "Good try — check the tip!","No worries, you'll get it!","Even the greats make mistakes!",
    "That's a tough one — let's learn from it.","Shake it off and come back stronger!",
    "Babe Ruth struck out 1,330 times. You're in good company!","The best players study their mistakes.",
    "Don't sweat it — this is how you get better!","Read the breakdown — it'll click next time.",
    "That's a learning rep — those count the most!","This one's tricky. Let's figure it out together.",
    "Oops! But now you know for next time.","Every wrong answer is a future right answer!",
    "I missed that one too when I was learning!","Dust yourself off — next one's yours!",
    "The game is the best teacher!","That's why we practice!"
  ],
  posSuccess:{
    pitcher:"That's an ace-level pitch call!",catcher:"You're the quarterback of this defense!",
    firstBase:"Stretch and scoop — that's Gold Glove material!",secondBase:"Silky smooth! That's a double play artist!",
    shortstop:"Captain of the infield — nailed it!",thirdBase:"Hot corner hero! Lightning reflexes!",
    leftField:"Tracking that ball like a pro!",centerField:"That's why CF is the captain of the outfield!",
    rightField:"Cannon arm! That throw was perfect!",
    batter:"You've got the eye of a cleanup hitter!",baserunner:"Speed AND smarts — that's rare!",
    manager:"Skipper, that's a World Series move!",
    famous:"History lesson: aced!",rules:"You know the rulebook inside out!",counts:"Count IQ is off the charts!"
  },
  posDanger:{
    pitcher:"Pitching is all about outsmarting the hitter — you'll get there!",
    catcher:"Calling a game is the toughest job on the field — keep studying!",
    firstBase:"First base is all about footwork and focus — keep at it!",
    secondBase:"Turning two is an art — you'll get smoother with reps!",
    shortstop:"Shortstop is the hardest infield position — keep grinding!",
    thirdBase:"The hot corner is all about reactions — they'll get faster!",
    leftField:"Reading the ball off the bat takes practice — you're learning!",
    centerField:"Covering all that ground takes experience — keep running them down!",
    rightField:"That arm will get stronger — keep making those throws!",
    batter:"Even the best hitters fail 7 out of 10 times. Keep swinging!",
    baserunner:"Base running is the hardest thing to teach — you're learning!",
    manager:"Managing is all about the next decision. Reset and go!",
    famous:"These famous plays tripped up real pros too!",
    rules:"Even umpires argue about rules sometimes!",
    counts:"Counts are tricky — even big leaguers get fooled!"
  },
  streakLines:[
    null,null,null,
    "Three in a row! You're heating up!","Four straight! Stay locked in!",
    "Five in a row! You're on fire!","Six straight! Can't stop, won't stop!",
    "Seven! That's a whole week of perfection!","Incredible streak going!",
    "Double digits! You're unstoppable!","This streak is legendary!"
  ],
  facts:[
    "Did you know? A MLB game has about 300 strategic decisions!",
    "Fun fact: The pitcher's mound is exactly 60 feet, 6 inches from home plate!",
    "Did you know? A 90 mph fastball reaches home plate in 0.4 seconds!",
    "Fun fact: The average MLB game has about 146 pitches per team!",
    "Did you know? Only 6% of stolen base attempts use a delayed steal!",
    "Fun fact: Left-handed pitchers have a natural advantage holding runners!",
    "Did you know? Batters hit .100 points higher on 3-1 counts vs 0-2 counts!",
    "Fun fact: The infield fly rule was created in 1895 to stop sneaky double plays!",
    "Did you know? Catchers squat and stand up over 200 times per game!",
    "Fun fact: A curveball can break up to 17 inches from its starting path!",
    "Did you know? The hit-and-run play has been used since the 1890s!",
    "Fun fact: Relief pitchers didn't become common until the 1950s!"
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
function getCoachLine(cat,pos,streak){
  // Streak reactions (override everything)
  if(cat==="success"&&streak>=3&&COACH_LINES.streakLines[Math.min(streak,10)])return COACH_LINES.streakLines[Math.min(streak,10)];
  // 20% chance of a baseball fact on success
  if(cat==="success"&&Math.random()<0.2){const f=COACH_LINES.facts;return f[Math.floor(Math.random()*f.length)];}
  // 30% chance of position-specific line
  if(pos&&Math.random()<0.3){
    const posLines=cat==="success"?COACH_LINES.posSuccess:cat==="danger"?COACH_LINES.posDanger:null;
    if(posLines&&posLines[pos])return posLines[pos];
  }
  const lines=COACH_LINES[cat]||COACH_LINES.danger;return lines[Math.floor(Math.random()*lines.length)];
}

const DIFF_TAG = [{l:"Rookie",c:"#22c55e"},{l:"Intermediate",c:"#f59e0b"},{l:"Advanced",c:"#ef4444"}];

export default function App(){
  const[screen,setScreen]=useState("loading");
  const[pos,setPos]=useState(null);
  const[sc,setSc]=useState(null);
  const[choice,setChoice]=useState(null);
  const[od,setOd]=useState(null);
  const[hist,setHist]=useState({});
  const[ri,setRi]=useState(-1);
  const[fo,setFo]=useState(null);
  const[ak,setAk]=useState(0);
  const[showC,setShowC]=useState(false);
  const[toast,setToast]=useState(null);
  const[panel,setPanel]=useState(null); // 'ach','concepts','stats','settings'
  const[showExp,setShowExp]=useState(true);
  const[stats,setStats]=useState(DEFAULT);
  const[lvlUp,setLvlUp]=useState(null);
  const[aiLoading,setAiLoading]=useState(false);
  const[coachMsg,setCoachMsg]=useState(null);
  const[parentGate,setParentGate]=useState(false);
  const[aiMode,setAiMode]=useState(false); // true when playing AI-generated scenario
  const[dailyMode,setDailyMode]=useState(false); // true when playing daily diamond challenge
  const[seasonMode,setSeasonMode]=useState(false);
  const[seasonStageIntro,setSeasonStageIntro]=useState(null); // stage object to show intro for
  const[lastSeasonStage,setLastSeasonStage]=useState(-1); // track which stage we've shown intro for
  // Speed Round state
  const[speedMode,setSpeedMode]=useState(false);
  const[speedRound,setSpeedRound]=useState(null); // {round,total,results:[],startTime}
  const[timer,setTimer]=useState(15);
  const timerRef=useRef(null);
  // fielderTrack removed — positions are now split into 9 individual defensive positions
  // Survival Mode state
  const[survivalMode,setSurvivalMode]=useState(false);
  const[survivalRun,setSurvivalRun]=useState(null); // {count,pts,concepts[]}
  const snd=useSound();

  const abortRef=useRef(null);
  const speedNextRef=useRef(null);
  const survivalNextRef=useRef(null);
  const seasonNextRef=useRef(null);
  const goHomeRef=useRef(null);

  const[challengeMode,setChallengeMode]=useState(false);
  const[challengeId,setChallengeId]=useState(null);
  // Load
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(STORAGE_KEY);if(r?.value){const d=JSON.parse(r.value);setStats({...DEFAULT,...d});snd.setEnabled(d.soundOn!==false);if(d.onboarded)setScreen("home");else setScreen("onboard");} else setScreen("onboard");}catch{setScreen("onboard")}
    // Check for challenge in URL
    const hash=window.location.hash;if(hash.startsWith("#challenge=")){const cid=hash.slice(11);setChallengeId(cid);window.location.hash="";}
  })()},[]);
  // Save
  useEffect(()=>{(async()=>{try{await window.storage.set(STORAGE_KEY,JSON.stringify(stats))}catch{}})()},[stats]);
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
    // Award a streak freeze every 7-day milestone (max 3)
    const prev7=Math.floor(stats.ds/7);const new7=Math.floor(newDs/7);
    if(new7>prev7&&newFreezes<3)newFreezes=Math.min(3,newFreezes+(new7-prev7));
    // Check for streak milestone celebration
    if(STREAK_MILESTONES.includes(newDs)&&newDs>stats.ds){
      const fl=getFlame(newDs);
      setTimeout(()=>{setLvlUp({e:fl.icon,n:`${newDs}-Day Streak!`,c:fl.color});snd.play('streak')},800);
    }
    setStats(p=>({...p,todayPlayed:0,todayDate:today,ds:newDs,streakFreezes:newFreezes,lastDay:p.todayDate,dailyDone:p.dailyDate===today?p.dailyDone:false,dailyDate:today}));
  }},[stats.todayDate]);

  // Handle challenge links
  useEffect(()=>{
    if(!challengeId||screen!=="home")return;
    const allSc=Object.entries(SCENARIOS).flatMap(([p,arr])=>arr.map(s=>({...s,_pos:p})));
    const sc=allSc.find(s=>s.id===challengeId);
    if(sc){setChallengeMode(true);setPos(sc._pos);setSc(sc);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);setScreen("play");sc.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80)});setChallengeId(null);}
    else setChallengeId(null);
  },[challengeId,screen]);

  const shareChallenge=useCallback(()=>{
    if(!sc)return;
    const url=`${window.location.origin}${window.location.pathname}#challenge=${sc.id}`;
    if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>setToast({e:"📎",n:"Link Copied!",d:"Send to a friend to challenge them"}));
    setTimeout(()=>setToast(null),3000);
  },[sc]);

  const totalSc=Object.values(SCENARIOS).reduce((s,a)=>s+a.length,0);
  const remaining=DAILY_FREE-stats.todayPlayed;
  const atLimit=remaining<=0&&!stats.isPro;
  
  // INFIELD_CATS/OUTFIELD_CATS removed — individual position arrays replace fielder filtering
  const maxDiff=(AGE_GROUPS.find(a=>a.id===stats.ageGroup)||AGE_GROUPS[2]).maxDiff;
  const getRand=useCallback((p)=>{
    let raw=SCENARIOS[p]||[];
    // fielder track filtering removed — each position has its own scenario array
    const pool=raw.filter(s=>s.diff<=maxDiff);const fallback=raw;
    const src=pool.length>0?pool:fallback;const seen=hist[p]||[];
    const unseen=src.filter(s=>!seen.includes(s.id));
    const avail=unseen.length>0?unseen:src;
    const s=avail[Math.floor(Math.random()*avail.length)];
    setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-src.length)}));return s;
  },[hist,maxDiff]);

  const startDaily=useCallback(()=>{
    if(stats.dailyDone&&stats.dailyDate===new Date().toDateString())return;
    const daily=getDailyScenario();
    snd.play('tap');setPos(daily._pos);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setDailyMode(true);setAiMode(false);setAiLoading(false);
    setSc(daily);setScreen("play");
    daily.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
  },[snd,stats.dailyDone,stats.dailyDate]);

  const startGame=useCallback(async(p,forceAI=false)=>{
    if(atLimit){setPanel('limit');return;}
    snd.play('tap');setPos(p);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);setDailyMode(false);
    
    // Determine if we should use AI (respect maxDiff so young players get AI after exhausting their pool)
    const raw=SCENARIOS[p]||[];const pool=raw.filter(s=>s.diff<=maxDiff);const seen=hist[p]||[];
    const unseen=(pool.length>0?pool:raw).filter(s=>!seen.includes(s.id));
    const useAI = forceAI || unseen.length === 0;
    
    if(useAI){
      // Show loading screen
      setAiLoading(true);setAiMode(true);setScreen("play");
      const ctrl=new AbortController();abortRef.current=ctrl;
      const aiSc = await generateAIScenario(p, stats, stats.cl||[], stats.recentWrong||[], ctrl.signal);
      abortRef.current=null;
      setAiLoading(false);
      if(aiSc){
        setSc(aiSc);
        aiSc.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
      } else {
        // AI failed — fall back to random handcrafted (respect maxDiff)
        const avail=pool.length>0?pool:raw;const s=avail[Math.floor(Math.random()*avail.length)];
        setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-avail.length)}));
        setSc(s);setAiMode(false);
        s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
      }
    } else {
      // Use handcrafted
      setAiMode(false);
      const s=getRand(p);setSc(s);setScreen("play");
      s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
    }
  },[getRand,snd,atLimit,hist,stats,maxDiff]);

  const checkAch=useCallback((ns)=>{
    const earned=ns.achs||[];
    for(const a of ACHS){if(!earned.includes(a.id)&&a.ck(ns)){setToast(a);snd.play('ach');setTimeout(()=>setToast(null),3500);return[...earned,a.id];}}
    return earned;
  },[snd]);

  const handleChoice=useCallback((idx)=>{
    if(choice!==null||!sc)return;setChoice(idx);
    const isOpt=idx===sc.best;const rate=sc.rates[idx];const cat=isOpt?"success":rate>=55?"warning":"danger";
    let pts=isOpt?15:rate>=55?8:rate>=35?4:2;
    if(dailyMode)pts*=2; // 2x XP for Daily Diamond Play
    // Prestige season bonus: +10% per season past the first
    if((stats.season||1)>1)pts=Math.round(pts*(1+((stats.season-1)*0.1)));
    // Speed Round bonus: +1 pt per second remaining
    let speedBonus=0;
    if(speedMode&&isOpt&&timer>0){speedBonus=timer;pts+=speedBonus;}
    setFo(cat);setAk(k=>k+1);snd.play(isOpt?'correct':rate>=55?'near':'wrong');setCoachMsg(getCoachLine(cat,pos,isOpt?stats.str+1:0));
    // Crowd cheer on perfect answers, jackpot on every 5th streak
    if(isOpt){setTimeout(()=>snd.play('cheer'),300);const newStr=stats.str+1;if(newStr>0&&newStr%5===0)setTimeout(()=>snd.play('jackpot'),500);}
    // Use simplified explanations for young players when available
    const useSimple=sc.explSimple&&(stats.ageGroup==="6-8"||stats.ageGroup==="9-10");
    const expArr=useSimple?sc.explSimple:sc.explanations;
    const o={cat,isOpt,exp:expArr[idx],bestExp:expArr[sc.best],bestOpt:sc.options[sc.best],concept:sc.concept,pts,chosen:sc.options[idx],rate,anim:sc.anim,speedBonus,timeLeft:timer};
    setOd(o);
    // Track speed round result
    if(speedMode)setSpeedRound(sr=>sr?{...sr,results:[...sr.results,{isOpt,pts,speedBonus,timeLeft:timer,concept:sc.concept,pos}]}:sr);
    // Track survival run result
    if(survivalMode)setSurvivalRun(sr=>sr?{...sr,count:sr.count+1,pts:sr.pts+pts,concepts:[...sr.concepts,sc.concept],history:[...(sr.history||[]),{isOpt,concept:sc.concept,chosen:sc.options[idx],bestOpt:sc.options[sc.best],pos}]}:sr);
    const prevLvl=getLvl(stats.pts);
    setStats(p=>{
      const today=new Date().toDateString();
      const ns={...p,pts:p.pts+pts,str:isOpt?p.str+1:0,bs:Math.max(p.bs,isOpt?p.str+1:p.bs),gp:p.gp+1,co:p.co+(isOpt?1:0),
        ps:{...p.ps,[pos]:{p:(p.ps[pos]?.p||0)+1,c:(p.ps[pos]?.c||0)+(isOpt?1:0)}},
        cl:isOpt&&!p.cl?.includes(sc.concept)?[...(p.cl||[]),sc.concept]:(p.cl||[]),
        recentWrong:isOpt?(p.recentWrong||[]):[...(p.recentWrong||[]),sc.concept].slice(-5),
        todayPlayed:(p.todayDate===today?p.todayPlayed:0)+1,todayDate:today,
        sp:isOpt?(p.sp||0)+1:0,
        dailyDone:dailyMode?true:p.dailyDone,dailyDate:dailyMode?today:(p.dailyDate||today),
        seasonCorrect:seasonMode&&isOpt?(p.seasonCorrect||0)+1:(p.seasonCorrect||0)};
      ns.achs=checkAch(ns);
      const newLvl=getLvl(ns.pts);
      if(newLvl.n!==prevLvl.n){setTimeout(()=>{setLvlUp(newLvl);snd.play('lvl')},600)}
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
    }else{
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>setShowC(true),400);},1800);
    }
  },[choice,sc,pos,snd,checkAch,stats.pts,dailyMode,speedMode,timer,survivalMode,survivalRun,seasonMode]);

  const goHome=useCallback(()=>{setScreen("home");setPos(null);setSc(null);setChoice(null);setOd(null);setFo(null);setPanel(null);setLvlUp(null);setCoachMsg(null);setDailyMode(false);setSpeedMode(false);setSpeedRound(null);setSurvivalMode(false);setSurvivalRun(null);setChallengeMode(false);setSeasonMode(false);setSeasonStageIntro(null);if(timerRef.current)clearTimeout(timerRef.current)},[]);
  goHomeRef.current=goHome;
  const next=useCallback(()=>{setLvlUp(null);if(speedMode){speedNextRef.current?.()}else if(survivalMode){survivalNextRef.current?.()}else if(seasonMode){seasonNextRef.current?.()}else if(dailyMode){goHomeRef.current?.()}else{startGame(pos,aiMode)}},[pos,startGame,aiMode,dailyMode,speedMode,survivalMode,seasonMode]);
  const finishOnboard=useCallback(()=>{setStats(p=>({...p,onboarded:true,todayDate:new Date().toDateString()}));setScreen("home")},[]);
  
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

  // Speed Round timer
  useEffect(()=>{
    if(speedMode&&screen==="play"&&choice===null&&!aiLoading&&timer>0){
      if(timer<=5)snd.play('tick');
      timerRef.current=setTimeout(()=>setTimer(t=>t-1),1000);
      return()=>clearTimeout(timerRef.current);
    }
    if(speedMode&&screen==="play"&&choice===null&&timer<=0&&sc){
      // Time's up — reveal correct answer instead of auto-selecting wrong
      snd.play('wrong');setCoachMsg("Time's up! Read the answer — you'll get it next time!");
      const cat="danger";const pts=2;
      setChoice(-1);setFo(cat);setAk(k=>k+1);
      const o={cat,isOpt:false,exp:`Time ran out! The best answer was "${sc.options[sc.best]}"`,bestExp:sc.explanations[sc.best],bestOpt:sc.options[sc.best],concept:sc.concept,pts,chosen:"(timed out)",rate:0,anim:sc.anim,speedBonus:0,timeLeft:0};
      setOd(o);
      setSpeedRound(sr=>sr?{...sr,results:[...sr.results,{isOpt:false,pts,speedBonus:0,timeLeft:0,concept:sc.concept,pos,timedOut:true}]}:sr);
      setStats(p=>{const today=new Date().toDateString();return{...p,pts:p.pts+pts,str:0,gp:p.gp+1,ps:{...p.ps,[pos]:{p:(p.ps[pos]?.p||0)+1,c:p.ps[pos]?.c||0}},todayPlayed:(p.todayDate===today?p.todayPlayed:0)+1,todayDate:today,sp:0,recentWrong:[...(p.recentWrong||[]),sc.concept].slice(-5)}});
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>speedNextRef.current?.(),2000)},200)},1800);
    }
  },[speedMode,screen,choice,aiLoading,timer,sc,snd,pos]);

  // Speed Round flow
  const startSpeedRound=useCallback(()=>{
    if(atLimit){setPanel('limit');return;}
    snd.play('tap');
    setSpeedMode(true);setDailyMode(false);setAiMode(false);
    const positions=[...ALL_POS].sort(()=>Math.random()-.5);
    setSpeedRound({round:0,total:5,results:[],startTime:Date.now(),positions});
    // Start first round
    const p=positions[0];setPos(p);
    const s=getRand(p);setSc(s);
    setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);setLvlUp(null);setShowExp(true);
    setTimer(15);setScreen("play");
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
    const s=getRand(p);setSc(s);
    setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);
    setSpeedRound(sr=>({...sr,round:nextRound}));
    setTimer(15);setScreen("play");
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

  const survivalNext=useCallback(()=>{
    if(!survivalRun)return;
    const count=survivalRun.count+1;
    // Increase difficulty as you progress: 1-3→diff1, 4-6→diff2, 7+→diff3
    const targetDiff=count<3?1:count<6?2:3;
    const p=ALL_POS[Math.floor(Math.random()*ALL_POS.length)];setPos(p);
    const pool=(SCENARIOS[p]||[]).filter(s=>s.diff<=targetDiff);
    const s=pool.length>0?pool[Math.floor(Math.random()*pool.length)]:getRand(p);
    setSc(s);setChoice(null);setOd(null);setRi(-1);setFo(null);setShowC(false);
    setScreen("play");
    s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
  },[survivalRun,getRand]);
  survivalNextRef.current=survivalNext;

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
  const card={background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.05)",borderRadius:14,padding:14};
  const btn=(bg,c)=>({background:bg,color:c||"white",border:"none",borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",letterSpacing:.3,minHeight:48});
  const ghost={background:"none",border:"none",color:"#6b7280",fontSize:13,cursor:"pointer",padding:"8px 12px",minHeight:40};

  if(screen==="loading")return(<div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:8}}>⚾</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#f59e0b",letterSpacing:2}}>LOADING...</div></div></div>);

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0f1a,#111827 50%,#0f172a)",fontFamily:"'DM Sans',-apple-system,sans-serif",color:"white",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      
      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"linear-gradient(135deg,#1a1a2e,#16213e)",border:"2px solid #f59e0b",borderRadius:14,padding:"8px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 30px rgba(245,158,11,.3)",animation:"sd .35s ease-out",maxWidth:"90vw"}}>
        <span style={{fontSize:24}}>{toast.e}</span>
        <div><div style={{fontSize:9,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Achievement Unlocked!</div><div style={{fontSize:13,fontWeight:700}}>{toast.n}</div></div>
      </div>}

      {/* Level Up Overlay */}
      {lvlUp&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .3s ease-out"}} onClick={()=>setLvlUp(null)}>
        <Confetti active={true}/>
        <div style={{textAlign:"center",animation:"su .4s ease-out",position:"relative",zIndex:1}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:64,marginBottom:8}}>{lvlUp.e}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:2}}>LEVEL UP!</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:lvlUp.c,letterSpacing:2}}>{lvlUp.n.toUpperCase()}</div>
          <button onClick={()=>setLvlUp(null)} style={{...btn("rgba(255,255,255,.1)"),width:"auto",padding:"8px 24px",marginTop:16,fontSize:13}}>Continue</button>
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
          {!stats.isPro&&<span style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:600,color:"#6b7280"}}>{remaining>0?`${remaining} left`:""}</span>}
          <span style={{background:`${lvl.c}12`,border:`1px solid ${lvl.c}25`,borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:lvl.c}}>{lvl.e}{lvl.n}</span>
        </div>
      </div>}

      <div style={{maxWidth:640,margin:"0 auto",padding:"10px 16px"}}>
        
        {/* ONBOARDING */}
        {screen==="onboard"&&<div style={{textAlign:"center",padding:"60px 20px 40px"}}>
          <div style={{fontSize:64,marginBottom:12}}>⚾</div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,letterSpacing:2,color:"#f59e0b",lineHeight:1,marginBottom:6}}>BASEBALL<br/>STRATEGY MASTER</h1>
          <p style={{color:"#9ca3af",fontSize:14,maxWidth:320,margin:"0 auto 24px",lineHeight:1.6}}>Think like a pro. Make real strategic decisions across {totalSc} game scenarios.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:300,margin:"0 auto 24px"}}>
            {[{e:"🎯",t:"Choose wisely",d:"Read the situation and pick the best strategy"},{e:"💡",t:"Learn the WHY",d:"Every answer teaches real MLB strategy"},{e:"📈",t:"Level up",d:"Track your progress from Rookie to Hall of Fame"}].map((it,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",textAlign:"left",background:"rgba(255,255,255,.02)",borderRadius:10,padding:"10px 12px"}}>
                <span style={{fontSize:24,flexShrink:0}}>{it.e}</span>
                <div><div style={{fontSize:14,fontWeight:700}}>{it.t}</div><div style={{fontSize:12,color:"#6b7280",lineHeight:1.4}}>{it.d}</div></div>
              </div>
            ))}
          </div>
          <div style={{maxWidth:300,margin:"0 auto 20px"}}>
            <div style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6,textAlign:"center"}}>Your Player Name</div>
            <input value={stats.displayName} onChange={e=>setStats(p=>({...p,displayName:e.target.value.slice(0,15)}))}
              placeholder={BASEBALL_NAMES[Math.floor(Math.random()*BASEBALL_NAMES.length)]}
              style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 12px",color:"white",fontSize:14,textAlign:"center",outline:"none",marginBottom:12}}/>
          </div>
          <div style={{maxWidth:300,margin:"0 auto 20px",textAlign:"left"}}>
            <div style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6,textAlign:"center"}}>How old are you?</div>
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
          <button onClick={finishOnboard} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{boxShadow:"0 4px 15px rgba(245,158,11,.3)",maxWidth:300}}}>Let's Play! →</button>
        </div>}

        {/* HOME */}
        {screen==="home"&&<div>
          <div style={{textAlign:"center",padding:"20px 0 14px"}}>
            <div style={{fontSize:48,marginBottom:4}}>⚾</div>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:"#f59e0b",lineHeight:1,marginBottom:4}}>STRATEGY MASTER</h1>
            <p style={{color:"#6b7280",fontSize:12,maxWidth:340,margin:"0 auto"}}>{totalSc} scenarios · 6 positions · Real MLB strategy</p>
          </div>

          {/* Stats card */}
          {stats.gp>0&&<div style={{...card,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:8}}>
              {[{v:stats.pts,l:"Points",c:"#f59e0b"},{v:`${acc}%`,l:"Accuracy",c:"#22c55e"},{v:stats.bs,l:"Best Run",c:"#f97316"},{v:stats.gp,l:"Played",c:"#3b82f6"}].map((s,i)=>(
                <div key={i}><div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:"#6b7280",marginTop:1}}>{s.l}</div></div>
              ))}
            </div>
            {nxt&&<div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#6b7280",marginBottom:2}}>
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
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#6b7280",marginBottom:2}}>
                    <span>{stats.ds} days</span><span>{nextMile}-day milestone</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.03)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(stats.ds/nextMile)*100}%`,background:`linear-gradient(90deg,${fl.color},${getFlame(nextMile).color})`,borderRadius:2,transition:"width .5s"}}/>
                  </div>
                </div>}
                {stats.streakFreezes>0&&<div style={{textAlign:"center",marginTop:4,fontSize:9,color:"#6b7280"}}>
                  🧊 {stats.streakFreezes} streak freeze{stats.streakFreezes>1?"s":""} available
                </div>}
              </div>
            )})()}
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
              <button onClick={()=>setPanel(panel==='ach'?null:'ach')} style={{flex:"1 1 22%",background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.12)",borderRadius:10,padding:"8px 4px",color:"#f59e0b",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🏅 {(stats.achs||[]).length}/{ACHS.length}</button>
              <button onClick={()=>setPanel(panel==='concepts'?null:'concepts')} style={{flex:"1 1 22%",background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.12)",borderRadius:10,padding:"8px 4px",color:"#3b82f6",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🧠 {(stats.cl?.length||0)}</button>
              <button onClick={()=>setPanel(panel==='stats'?null:'stats')} style={{flex:"1 1 22%",background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.12)",borderRadius:10,padding:"8px 4px",color:"#22c55e",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>📊 Stats</button>
              <button onClick={()=>setPanel(panel==='progress'?null:'progress')} style={{flex:"1 1 22%",background:"rgba(168,85,247,.05)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"8px 4px",color:"#a855f7",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>📈 Map</button>
              <button onClick={()=>setPanel(panel==='cosmetics'?null:'cosmetics')} style={{flex:"1 1 22%",background:"rgba(236,72,153,.05)",border:"1px solid rgba(236,72,153,.12)",borderRadius:10,padding:"8px 4px",color:"#ec4899",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:38}}>🎨 Theme</button>
              <button onClick={()=>setPanel(panel==='lb'?null:'lb')} style={{flex:"1 1 100%",background:"rgba(234,179,8,.05)",border:"1px solid rgba(234,179,8,.12)",borderRadius:10,padding:"6px 4px",color:"#eab308",fontSize:10,fontWeight:600,cursor:"pointer",minHeight:34}}>🏆 Leaderboard</button>
            </div>
          </div>}

          {/* Expandable panels */}
          {panel==='ach'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f59e0b",letterSpacing:1,marginBottom:6}}>ACHIEVEMENTS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {ACHS.map(a=>{const earned=(stats.achs||[]).includes(a.id);const[cur,tgt]=achProgress(a.id,stats);const pct=Math.min(100,Math.round((cur/tgt)*100));return(
                <div key={a.id} style={{background:earned?"rgba(245,158,11,.04)":"rgba(255,255,255,.01)",border:`1px solid ${earned?"rgba(245,158,11,.12)":"rgba(255,255,255,.03)"}`,borderRadius:8,padding:"5px 7px",opacity:earned?1:.55}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12}}>{a.e}</span><span style={{fontSize:10,fontWeight:700,color:earned?"#f59e0b":"#6b7280"}}>{a.n}</span></div>
                  <div style={{fontSize:8,color:"#6b7280",marginTop:1}}>{a.d}</div>
                  {!earned&&<div style={{marginTop:3}}>
                    <div style={{height:3,background:"rgba(255,255,255,.04)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#f59e0b55,#f59e0b)",borderRadius:2,transition:"width .5s"}}/>
                    </div>
                    <div style={{fontSize:7,color:"#6b7280",marginTop:1,textAlign:"right"}}>{cur}/{tgt}</div>
                  </div>}
                </div>
              )})}
            </div>
          </div>}

          {panel==='concepts'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#3b82f6",letterSpacing:1,marginBottom:6}}>CONCEPTS LEARNED</div>
            {!(stats.cl?.length)?<p style={{color:"#6b7280",fontSize:11}}>Get the optimal answer to learn concepts!</p>:
              <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:250,overflowY:"auto"}}>
                {stats.cl.map((c,i)=><div key={i} style={{background:"rgba(59,130,246,.03)",border:"1px solid rgba(59,130,246,.08)",borderRadius:7,padding:"5px 8px",fontSize:11,color:"#93c5fd",lineHeight:1.35}}>💡 {c}</div>)}
              </div>}
          </div>}

          {panel==='stats'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#22c55e",letterSpacing:1,marginBottom:6}}>POSITION STATS</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {ALL_POS.map(p=>{const s=stats.ps[p];const m=POS_META[p];const a=s&&s.p>0?Math.round((s.c/s.p)*100):null;return(
                <div key={p} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,.02)",borderRadius:8,padding:"6px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{m.emoji}</span><span style={{fontSize:12,fontWeight:600}}>{m.label}</span></div>
                  <div style={{display:"flex",gap:8,fontSize:11,color:"#6b7280"}}>
                    {s?<><span>{s.p} played</span><span style={{color:a>=70?"#22c55e":a>=50?"#f59e0b":"#ef4444",fontWeight:700}}>{a}%</span></>:<span>Not played</span>}
                  </div>
                </div>
              )})}
            </div>
          </div>}

          {panel==='progress'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#a855f7",letterSpacing:1,marginBottom:6}}>CONCEPT MASTERY MAP</div>
            {ALL_POS.map(p=>{
              const m=POS_META[p];const concepts=(SCENARIOS[p]||[]).map(s=>s.concept);
              const learned=(stats.cl||[]).filter(c=>concepts.includes(c));
              const pct=concepts.length>0?Math.round((learned.length/concepts.length)*100):0;
              return(<div key={p} style={{marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:14}}>{m.emoji}</span>
                    <span style={{fontSize:11,fontWeight:700,color:m.color}}>{m.label}</span>
                  </div>
                  <span style={{fontSize:10,color:pct>=80?"#22c55e":pct>=40?"#f59e0b":"#6b7280",fontWeight:700}}>{learned.length}/{concepts.length} ({pct}%)</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,.03)",borderRadius:3,overflow:"hidden",marginBottom:2}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${m.color}88,${m.color})`,borderRadius:3,transition:"width .5s"}}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                  {concepts.map((c,i)=>{const has=(stats.cl||[]).includes(c);return(
                    <div key={i} title={c} style={{width:8,height:8,borderRadius:2,background:has?m.color:"rgba(255,255,255,.06)",border:`1px solid ${has?m.color+"60":"rgba(255,255,255,.08)"}`,transition:"all .3s"}}/>
                  )})}
                </div>
              </div>);
            })}
            <div style={{marginTop:6,textAlign:"center",fontSize:10,color:"#6b7280"}}>
              Total: {(stats.cl||[]).length}/{Object.values(SCENARIOS).flat().length} concepts mastered
            </div>
          </div>}

          {panel==='lb'&&<div style={{...card,marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#eab308",letterSpacing:1,marginBottom:2}}>LEADERBOARD</div>
            <div style={{fontSize:9,color:"#6b7280",marginBottom:8}}>Week {lbData.week} · Resets weekly · Play on same device to compete</div>
            {!stats.displayName&&<div style={{background:"rgba(234,179,8,.06)",border:"1px solid rgba(234,179,8,.15)",borderRadius:10,padding:"8px 10px",marginBottom:8}}>
              <div style={{fontSize:11,color:"#eab308",marginBottom:4}}>Set a display name to appear on the leaderboard:</div>
              <input value={stats.displayName} onChange={e=>setStats(p=>({...p,displayName:e.target.value.slice(0,15)}))}
                placeholder="Enter your name..." style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"white",fontSize:12,outline:"none"}}/>
            </div>}
            {lbData.entries.length===0&&<div style={{textAlign:"center",padding:"12px 0",color:"#4b5563",fontSize:11}}>No entries yet this week. Play to get on the board!</div>}
            {lbData.entries.map((e,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:e.name===stats.displayName?"rgba(234,179,8,.06)":"rgba(255,255,255,.01)",borderRadius:8,marginBottom:3,border:e.name===stats.displayName?"1px solid rgba(234,179,8,.15)":"1px solid transparent"}}>
                <span style={{fontSize:14,fontWeight:800,color:i===0?"#eab308":i===1?"#94a3b8":i===2?"#b45309":"#4b5563",width:22,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
                <span style={{flex:1,fontSize:12,fontWeight:e.name===stats.displayName?700:500,color:e.name===stats.displayName?"#eab308":"#d1d5db"}}>{e.name}</span>
                <span style={{fontSize:11,color:"#f59e0b",fontWeight:700}}>{e.pts} pts</span>
                <span style={{fontSize:10,color:"#6b7280"}}>{e.acc}%</span>
              </div>
            ))}
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
              <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>Jersey Color</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {AVATAR_OPTS.jersey.map((c,i)=><button key={i} onClick={()=>{setStats(p=>({...p,avatarJersey:i}));snd.play('tap')}} style={{width:28,height:28,borderRadius:8,background:c,border:i===(stats.avatarJersey||0)?`3px solid white`:"2px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s"}}/>)}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>Cap Color</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {AVATAR_OPTS.cap.map((c,i)=><button key={i} onClick={()=>{setStats(p=>({...p,avatarCap:i}));snd.play('tap')}} style={{width:28,height:28,borderRadius:8,background:c,border:i===(stats.avatarCap||0)?`3px solid white`:"2px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s"}}/>)}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>Bat Style</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {AVATAR_OPTS.bat.map((c,i)=><button key={i} onClick={()=>{setStats(p=>({...p,avatarBat:i}));snd.play('tap')}} style={{width:28,height:28,borderRadius:8,background:c,border:i===(stats.avatarBat||0)?`3px solid white`:"2px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s"}}/>)}
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
                <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>Resets XP but keeps achievements, concepts & stats</div>
              </div>
            </div>}

            {/* Field Themes */}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#ec4899",letterSpacing:1,marginBottom:6}}>FIELD THEMES</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {FIELD_THEMES.map(th=>{const unlocked=themeOk(th,stats);const active=stats.fieldTheme===th.id;return(
                <button key={th.id} onClick={()=>{if(unlocked){setStats(p=>({...p,fieldTheme:th.id}));snd.play('tap')}}}
                  style={{background:active?"rgba(236,72,153,.08)":unlocked?"rgba(255,255,255,.02)":"rgba(255,255,255,.01)",border:`1.5px solid ${active?"#ec4899":unlocked?"rgba(255,255,255,.08)":"rgba(255,255,255,.03)"}`,borderRadius:10,padding:"10px 8px",cursor:unlocked?"pointer":"default",textAlign:"center",opacity:unlocked?1:.45,transition:"all .2s",position:"relative"}}>
                  <div style={{fontSize:22,marginBottom:2}}>{th.emoji}</div>
                  <div style={{fontSize:11,fontWeight:700,color:active?"#ec4899":"white"}}>{th.name}</div>
                  <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{th.desc}</div>
                  {!unlocked&&th.unlock&&<div style={{fontSize:8,color:"#f59e0b",marginTop:3,fontWeight:600}}>
                    {th.unlock.type==="gp"?`🔒 Play ${th.unlock.val} games`:th.unlock.type==="ds"?`🔒 ${th.unlock.val}-day streak`:th.unlock.type==="cl"?`🔒 Learn ${th.unlock.val} concepts`:"🔒 Locked"}
                  </div>}
                  {active&&<div style={{fontSize:8,color:"#ec4899",marginTop:2,fontWeight:700}}>ACTIVE</div>}
                </button>
              )})}
            </div>
            <div style={{textAlign:"center",marginTop:8,fontSize:9,color:"#6b7280"}}>Earn themes through milestones — no purchase needed!</div>
          </div>}

          {panel==='limit'&&<div style={{...card,marginBottom:12,textAlign:"center",borderColor:"rgba(245,158,11,.2)"}}>
            <div style={{fontSize:32,marginBottom:6}}>⏰</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#f59e0b",letterSpacing:1}}>DAILY LIMIT REACHED</div>
            <p style={{fontSize:12,color:"#9ca3af",marginTop:4,marginBottom:10}}>You've played all {DAILY_FREE} free scenarios today. Come back tomorrow or go Pro for unlimited play!</p>
            <button onClick={()=>{setStats(p=>({...p,isPro:true}));setPanel(null);snd.play('ach')}} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{maxWidth:260,margin:"0 auto",boxShadow:"0 4px 15px rgba(245,158,11,.3)"}}}>⭐ Go Pro — Unlimited Play</button>
            <div style={{fontSize:9,color:"#6b7280",marginTop:6}}>$4.99/mo or $29.99/year</div>
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
                  <div style={{fontSize:11,color:done?"#6b7280":"#d1d5db",lineHeight:1.3}}>
                    {done?"Completed! Come back tomorrow for a new challenge."
                      :<>{dm.emoji} {daily.title} · <span style={{color:DIFF_TAG[(daily.diff||1)-1].c}}>{"⭐".repeat(daily.diff||1)}</span></>}
                  </div>
                </div>
                {!done&&<div style={{color:"#f59e0b",fontSize:20,flexShrink:0,cursor:"pointer"}}>▶</div>}
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
                    <div style={{fontSize:10,color:"#9ca3af"}}>{stats.seasonComplete?`${stats.seasonCorrect}/${SEASON_TOTAL} optimal · New season?`:`Game ${stats.seasonGame+1} of ${SEASON_TOTAL}`}</div>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:stage.color}}>{pct}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.03)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,#22c55e,${stage.color})`,borderRadius:2,transition:"width .5s"}}/>
              </div>
              <div style={{display:"flex",gap:4,marginTop:6,overflow:"hidden"}}>
                {SEASON_STAGES.map((st,i)=>{let before=0;for(let j=0;j<i;j++)before+=SEASON_STAGES[j].games*3;const active=stats.seasonGame>=before;return(
                  <div key={i} style={{flex:st.games,height:3,borderRadius:2,background:active?st.color:"rgba(255,255,255,.04)",transition:"all .3s"}} title={st.name}/>
                )})}
              </div>
            </div>
          );})()}

          {/* Game Modes */}
          {stats.gp>=3&&<div style={{display:"flex",gap:8,marginBottom:12}}>
            <div onClick={startSpeedRound} style={{flex:1,background:"linear-gradient(135deg,rgba(239,68,68,.08),rgba(220,38,38,.04))",border:"1px solid rgba(239,68,68,.2)",borderRadius:14,padding:"16px 12px",textAlign:"center",cursor:"pointer",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>⚡</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#ef4444",letterSpacing:1}}>SPEED ROUND</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>5 scenarios · 15s timer</div>
            </div>
            <div onClick={startSurvival} style={{flex:1,background:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(124,58,237,.04))",border:"1px solid rgba(168,85,247,.2)",borderRadius:14,padding:"16px 12px",textAlign:"center",cursor:"pointer",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>💀</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#a855f7",letterSpacing:1}}>SURVIVAL</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>Until you miss{stats.survivalBest>0?` · Best: ${stats.survivalBest}`:""}</div>
              <div style={{fontSize:8,color:"#6b7280",marginTop:2}}>1-3 Rookie · 4-6 Pro · 7+ All-Star</div>
            </div>
          </div>}

          {/* Special Modes — Famous Plays, Rule IQ, Count IQ */}
          {stats.gp>=5&&<div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <div onClick={()=>startGame("famous")} style={{flex:"1 1 30%",minWidth:90,background:"linear-gradient(135deg,rgba(234,179,8,.06),rgba(202,138,4,.03))",border:"1px solid rgba(234,179,8,.2)",borderRadius:14,padding:"14px 10px",cursor:"pointer",textAlign:"center",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>🏟️</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#eab308",letterSpacing:1}}>FAMOUS</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{SCENARIOS.famous?.length||0} plays</div>
            </div>
            <div onClick={()=>startGame("rules")} style={{flex:"1 1 30%",minWidth:90,background:"linear-gradient(135deg,rgba(244,114,182,.06),rgba(219,39,119,.03))",border:"1px solid rgba(244,114,182,.2)",borderRadius:14,padding:"14px 10px",cursor:"pointer",textAlign:"center",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>📖</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#f472b6",letterSpacing:1}}>RULES</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{SCENARIOS.rules?.length||0} rules</div>
            </div>
            <div onClick={()=>startGame("counts")} style={{flex:"1 1 30%",minWidth:90,background:"linear-gradient(135deg,rgba(20,184,166,.06),rgba(13,148,136,.03))",border:"1px solid rgba(20,184,166,.2)",borderRadius:14,padding:"14px 10px",cursor:"pointer",textAlign:"center",minHeight:48}}>
              <div style={{fontSize:22,marginBottom:3}}>🔢</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#14b8a6",letterSpacing:1}}>COUNTS</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{SCENARIOS.counts?.length||0} counts</div>
            </div>
          </div>}

          {/* Position grid — grouped by role */}
          {[
            {title:"AT THE PLATE",positions:["batter"]},
            {title:"ON THE BASES",positions:["baserunner"]},
            {title:"IN THE FIELD",positions:["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]},
            {title:"IN THE DUGOUT",positions:["manager"]},
          ].map(group=>(
            <div key={group.title} style={{marginBottom:10}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"#6b7280",marginBottom:5,letterSpacing:2}}>{group.title}</div>
              <div style={{display:"grid",gridTemplateColumns:group.positions.length>=3?"1fr 1fr 1fr":"1fr 1fr",gap:6}}>
                {group.positions.map(p=>{const m=POS_META[p];const ps=stats.ps[p];const a=ps&&ps.p>0?Math.round((ps.c/ps.p)*100):null;return(
                  <div key={p} onClick={()=>startGame(p)} style={{background:m.bg,borderRadius:12,padding:group.positions.length>=3?"10px 6px":"14px 10px",cursor:"pointer",transition:"all .2s",textAlign:"center",border:"2px solid transparent",position:"relative",overflow:"hidden"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.borderColor=`${m.color}50`}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.borderColor="transparent"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 30% 20%,rgba(255,255,255,.07),transparent 60%)"}}/>
                    <div style={{position:"relative"}}>
                      <div style={{fontSize:group.positions.length>=3?22:30,marginBottom:1}}>{m.emoji}</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:group.positions.length>=3?12:17,letterSpacing:1}}>{m.label.toUpperCase()}</div>
                      <div style={{fontSize:group.positions.length>=3?8:10,color:"rgba(255,255,255,.55)",marginTop:1}}>{m.desc}</div>
                      <div style={{fontSize:8,color:"rgba(255,255,255,.35)",marginTop:2}}>{SCENARIOS[p]?.length||0} scenarios</div>
                      {a!==null&&<div style={{fontSize:8,color:"rgba(255,255,255,.6)",marginTop:1}}>{a}% · {ps.p} played</div>}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          ))}

          {/* AI Challenge */}
          {stats.gp>=3&&<div style={{marginTop:12,background:"linear-gradient(135deg,rgba(168,85,247,.06),rgba(59,130,246,.06))",border:"1px solid rgba(168,85,247,.15)",borderRadius:14,padding:14,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:3}}>🤖</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#a855f7",letterSpacing:1,marginBottom:2}}>AI COACH'S CHALLENGE</div>
            <p style={{fontSize:11,color:"#9ca3af",marginBottom:8,lineHeight:1.4}}>A personalized scenario targeting your weak spots. Every one is unique to you.</p>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {ALL_POS.map(p=>{const m=POS_META[p];return(
                <button key={p} onClick={()=>startGame(p,true)} style={{background:`${m.color}12`,border:`1px solid ${m.color}20`,borderRadius:8,padding:"5px 10px",color:m.color,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
                  <span>{m.emoji}</span>{m.label}
                </button>
              )})}
            </div>
          </div>}

          {/* Daily remaining */}
          {!stats.isPro&&<div style={{textAlign:"center",marginTop:10}}>
            <div style={{fontSize:10,color:"#6b7280"}}>{remaining>0?`${remaining} free scenarios remaining today`:"Daily limit reached"}</div>
            <button onClick={()=>setPanel('limit')} style={{...ghost,color:"#f59e0b",fontSize:11,fontWeight:600,marginTop:2}}>⭐ Go Pro for unlimited play</button>
          </div>}

          <div style={{textAlign:"center",color:"#374151",fontSize:9,marginTop:16,display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            <span>1️⃣ Pick position</span><span>2️⃣ Read the play</span><span>3️⃣ Make the call</span><span>4️⃣ Learn why</span>
          </div>

          {/* Team & Settings */}
          <div style={{marginTop:12,background:"rgba(255,255,255,.01)",border:"1px solid rgba(255,255,255,.04)",borderRadius:12,padding:"10px 12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:14}}>👥</span>
              <span style={{fontSize:11,fontWeight:700,color:"#6b7280"}}>TEAM</span>
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
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={()=>{const v=!stats.soundOn;setStats(p=>({...p,soundOn:v}));snd.setEnabled(v)}} style={{...ghost,fontSize:10}}>{stats.soundOn?"🔊 Sound On":"🔇 Sound Off"}</button>
            <span style={{color:"#374151"}}>·</span>
            <button onClick={()=>{const groups=AGE_GROUPS.map(a=>a.id);const cur=groups.indexOf(stats.ageGroup);const next=groups[(cur+1)%groups.length];setStats(p=>({...p,ageGroup:next}))}} style={{...ghost,fontSize:10}}>🎂 {stats.ageGroup}</button>
            <span style={{color:"#374151"}}>·</span>
            <button onClick={()=>{
              if(parentGate){setPanel(panel==='parent'?null:'parent');return;}
              const a=Math.floor(Math.random()*10)+5;const b=Math.floor(Math.random()*10)+3;
              const answer=prompt(`Parent Gate: What is ${a} × ${b}?`);
              if(answer&&parseInt(answer)===a*b){setParentGate(true);setPanel('parent')}
            }} style={{...ghost,fontSize:10}}>👪 Parent Report</button>
          </div>

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
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6}}>ACCURACY BY POSITION</div>
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
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4}}>CONCEPTS MASTERED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10,maxHeight:120,overflowY:"auto"}}>
              {(stats.cl||[]).length===0?<span style={{fontSize:10,color:"#4b5563"}}>None yet — keep playing!</span>:
                (stats.cl||[]).map((c,i)=><span key={i} style={{background:"rgba(59,130,246,.06)",border:"1px solid rgba(59,130,246,.1)",borderRadius:6,padding:"2px 6px",fontSize:9,color:"#93c5fd"}}>{c}</span>)}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:4}}>ACHIEVEMENTS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
              {ACHS.map(a=>{const earned=(stats.achs||[]).includes(a.id);return(
                <span key={a.id} style={{fontSize:16,opacity:earned?1:.2,cursor:"default"}} title={`${a.n}${earned?" (earned)":""}`}>{a.e}</span>
              )})}
            </div>
            <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:10,color:"#6b7280",lineHeight:1.5}}>
                <strong>Summary:</strong> {stats.gp} total games · {(stats.cl||[]).length} concepts · {(stats.achs||[]).length}/{ACHS.length} achievements · Level: {lvl.n}
                {stats.ds>=7?" · Building great daily habits!":stats.ds>=3?" · Daily routine forming!":""}
              </div>
            </div>
          </div>}
        </div>}

        {/* PLAYING */}
        {screen==="play"&&aiLoading&&<div style={{textAlign:"center",padding:"80px 20px"}}>
          <div style={{fontSize:48,marginBottom:12,animation:"spin 2s linear infinite"}}>⚾</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#f59e0b",letterSpacing:2,marginBottom:6}}>COACH IS DRAWING UP A PLAY...</div>
          <p style={{color:"#6b7280",fontSize:12,maxWidth:280,margin:"0 auto"}}>Creating a personalized scenario based on your skill level and learning history</p>
          <div style={{marginTop:16,display:"flex",justifyContent:"center",gap:4}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:4,background:"#f59e0b",animation:`pulse 1s ease-in-out ${i*.2}s infinite`}}/>)}
          </div>
          <button onClick={()=>{if(abortRef.current)abortRef.current.abort();setAiLoading(false);goHome()}} style={{marginTop:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"6px 16px",color:"#6b7280",fontSize:11,cursor:"pointer"}}>← Cancel</button>
        </div>}

        {screen==="play"&&!aiLoading&&sc&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <button onClick={goHome} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#6b7280",cursor:"pointer",minHeight:32}}>← Back</button>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {survivalMode&&<span style={{background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#a855f7"}}>💀 #{survivalRun?survivalRun.count+1:1}</span>}
              {speedMode&&<span style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#ef4444"}}>⚡ {speedRound?speedRound.round+1:1}/5</span>}
              {dailyMode&&<span style={{background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#f59e0b"}}>💎 Daily · 2x XP</span>}
              {seasonMode&&(()=>{const st=getSeasonStage(stats.seasonGame);return <span style={{background:`${st.color}15`,border:`1px solid ${st.color}25`,borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:st.color}}>{st.emoji} {st.name}</span>})()}
              {aiMode&&<span style={{background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#a855f7"}}>🤖 AI</span>}
              <span style={{fontSize:9,color:DIFF_TAG[(sc.diff||1)-1].c}}>{"⭐".repeat(sc.diff||1)}</span>
              <span style={{background:`${POS_META[pos].color}15`,border:`1px solid ${POS_META[pos].color}25`,borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:POS_META[pos].color}}>{POS_META[pos].emoji} {POS_META[pos].label}</span>
            </div>
          </div>

          {/* Speed Round timer bar */}
          {speedMode&&choice===null&&<div style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:13,fontWeight:800,color:timer<=5?"#ef4444":timer<=10?"#f59e0b":"#22c55e"}}>⏱ {timer}s</span>
              <span style={{fontSize:10,color:"#6b7280",fontWeight:600}}>+{timer} speed bonus</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(timer/15)*100}%`,background:timer<=5?"#ef4444":timer<=10?"#f59e0b":"#22c55e",borderRadius:3,transition:"width 1s linear",boxShadow:timer<=5?`0 0 8px ${timer<=5?"rgba(239,68,68,.4)":"none"}`:"none"}}/>
            </div>
          </div>}

          <div style={{background:"rgba(0,0,0,.25)",borderRadius:12,padding:6,marginBottom:8,border:"1px solid rgba(255,255,255,.03)"}}>
            <Field runners={sc.situation.runners} outcome={fo} ak={ak} anim={od?.isOpt?sc.anim:null} theme={FIELD_THEMES.find(th=>th.id===stats.fieldTheme)||FIELD_THEMES[0]} avatar={{j:stats.avatarJersey||0,c:stats.avatarCap||0,b:stats.avatarBat||0}} pos={pos}/>
            <div style={{marginTop:3}}><Board sit={sc.situation}/></div>
          </div>

          <div style={{...card,marginBottom:8,padding:12}}>
            <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,color:"#f59e0b",marginBottom:4}}>{sc.title}</h3>
            <p style={{fontSize:14,lineHeight:1.55,color:"#d1d5db"}}>{sc.description}</p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sc.options.map((opt,i)=>{
              const vis=ri>=i;const sel=choice===i;
              let bg="rgba(255,255,255,.02)",bd="rgba(255,255,255,.05)";
              if(sel&&od){if(od.cat==="success"){bg="rgba(34,197,94,.08)";bd="#22c55e"}else if(od.cat==="warning"){bg="rgba(245,158,11,.08)";bd="#f59e0b"}else{bg="rgba(239,68,68,.08)";bd="#ef4444"}}
              if(choice!==null&&i===sc.best&&!sel){bg="rgba(34,197,94,.04)";bd="rgba(34,197,94,.3)"}
              return(
                <button key={i} onClick={()=>{snd.play('tap');handleChoice(i)}} disabled={choice!==null}
                  style={{background:bg,border:`1.5px solid ${bd}`,borderRadius:12,padding:"14px 12px",cursor:choice!==null?"default":"pointer",transition:"all .2s",opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-10px)",textAlign:"left",width:"100%",color:"white",fontSize:14,lineHeight:1.4,display:"flex",alignItems:"flex-start",gap:8,minHeight:48}}>
                  <span style={{width:24,height:24,borderRadius:7,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:sel?(od?.cat==="success"?"#22c55e":od?.cat==="warning"?"#f59e0b":"#ef4444"):choice!==null&&i===sc.best?"#22c55e":"rgba(255,255,255,.04)",
                    color:sel||( choice!==null&&i===sc.best)?"white":"#6b7280",fontSize:10,fontWeight:800,transition:"all .25s"}}>
                    {sel?(od?.isOpt?"✓":"✗"):choice!==null&&i===sc.best?"✓":i+1}
                  </span>
                  <span style={{flex:1}}>{opt}</span>
                </button>
              );
            })}
          </div>
          {choice===null&&<div style={{textAlign:"center",marginTop:5,fontSize:8,color:"#4b5563"}}>Press 1-4 or tap</div>}
        </div>}

        {/* OUTCOME */}
        {screen==="outcome"&&od&&<div>
          <button onClick={goHome} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#6b7280",cursor:"pointer",marginBottom:8,minHeight:32}}>← Home</button>

          <div style={{textAlign:"center",marginBottom:10,padding:"8px 0"}}>
            <div style={{fontSize:44,marginBottom:2}}>{od.isOpt?"🎯":od.cat==="warning"?"🤔":"📚"}</div>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1.5,color:od.cat==="success"?"#22c55e":od.cat==="warning"?"#f59e0b":"#ef4444",marginBottom:3}}>
              {od.isOpt?"PERFECT STRATEGY!":od.cat==="warning"?"NOT BAD!":"LEARNING MOMENT"}
            </h2>
            <div style={{display:"flex",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
              {od.pts>0&&<span style={{background:"rgba(34,197,94,.08)",color:"#22c55e",padding:"2px 10px",borderRadius:14,fontSize:11,fontWeight:800,border:"1px solid rgba(34,197,94,.15)"}}>+{od.pts} pts{dailyMode?" (2x)":""}{od.speedBonus>0?` (+${od.speedBonus} speed)`:""}</span>}
              {dailyMode&&<span style={{background:"rgba(245,158,11,.08)",color:"#f59e0b",padding:"2px 10px",borderRadius:14,fontSize:11,fontWeight:800,border:"1px solid rgba(245,158,11,.15)"}}>💎 Daily Done!</span>}
              {stats.str>1&&od.isOpt&&<span style={{background:"rgba(249,115,22,.08)",color:"#f97316",padding:"2px 10px",borderRadius:14,fontSize:11,fontWeight:800,border:"1px solid rgba(249,115,22,.15)"}}>🔥 {stats.str}</span>}
            </div>
          </div>

          <Coach mood={od.cat} msg={coachMsg}/>

          <div style={{background:od.cat==="success"?"rgba(34,197,94,.03)":od.cat==="warning"?"rgba(245,158,11,.03)":"rgba(239,68,68,.03)",border:`1px solid ${od.cat==="success"?"rgba(34,197,94,.12)":od.cat==="warning"?"rgba(245,158,11,.12)":"rgba(239,68,68,.12)"}`,borderRadius:12,padding:12,borderLeft:`3px solid ${od.cat==="success"?"#22c55e":od.cat==="warning"?"#f59e0b":"#ef4444"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:9,color:"#6b7280",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Your Choice</div><div style={{fontSize:13,fontWeight:700,color:"white",marginTop:2}}>"{od.chosen}"</div></div>
              <button onClick={()=>setShowExp(!showExp)} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 10px",fontSize:10,color:"#6b7280",cursor:"pointer",minHeight:32}}>{showExp?"▼":"▶"}</button>
            </div>
            {showExp&&<p style={{fontSize:14,lineHeight:1.5,color:"#d1d5db",marginTop:6}}>{od.exp}</p>}
          </div>

          {!od.isOpt&&<div style={{background:"rgba(34,197,94,.02)",border:"1px solid rgba(34,197,94,.1)",borderRadius:12,padding:12,marginTop:8,borderLeft:"3px solid #22c55e"}}>
            <div style={{fontSize:9,color:"#22c55e",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:3}}>✅ Best Strategy</div>
            <div style={{fontSize:13,fontWeight:700,color:"white",marginBottom:4}}>"{od.bestOpt}"</div>
            {showExp&&<p style={{fontSize:14,lineHeight:1.5,color:"#d1d5db"}}>{od.bestExp}</p>}
          </div>}

          {showC&&<div style={{background:"linear-gradient(135deg,rgba(59,130,246,.04),rgba(168,85,247,.04))",border:"1px solid rgba(59,130,246,.12)",borderRadius:12,padding:12,marginTop:10,textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:2}}>💡</div>
            <div style={{fontSize:9,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:3}}>Key Concept</div>
            <p style={{fontSize:14,fontWeight:600,color:"white",lineHeight:1.45}}>{od.concept}</p>
          </div>}

          <button onClick={next} style={{...btn(dailyMode?"linear-gradient(135deg,#d97706,#f59e0b)":"linear-gradient(135deg,#2563eb,#3b82f6)"),...{marginTop:12,boxShadow:dailyMode?"0 4px 12px rgba(245,158,11,.25)":"0 4px 12px rgba(37,99,235,.25)"}}}>{dailyMode?"Back to Home →":"Next Challenge →"}</button>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:6}}>
            <button onClick={goHome} style={ghost}>Change Position</button>
            <button onClick={shareChallenge} style={{...ghost,color:"#3b82f6"}}>📎 Challenge a Friend</button>
          </div>

          {/* Pro upsell (non-annoying, after outcome) */}
          {!stats.isPro&&stats.gp>5&&stats.gp%5===0&&<div style={{marginTop:12,textAlign:"center",background:"rgba(245,158,11,.03)",border:"1px solid rgba(245,158,11,.1)",borderRadius:10,padding:"8px 12px"}}>
            <div style={{fontSize:11,color:"#f59e0b",fontWeight:600}}>⭐ Enjoying the game?</div>
            <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>Go Pro for unlimited play, advanced stats & no ads</div>
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
              <div><div style={{fontSize:18,fontWeight:800,color:"#22c55e"}}>{seasonAcc}%</div><div style={{fontSize:9,color:"#6b7280"}}>Accuracy</div></div>
              <div><div style={{fontSize:18,fontWeight:800,color:"#f59e0b"}}>{stats.seasonCorrect||0}</div><div style={{fontSize:9,color:"#6b7280"}}>Optimal</div></div>
              <div><div style={{fontSize:18,fontWeight:800,color:"#3b82f6"}}>{stats.seasonGame}</div><div style={{fontSize:9,color:"#6b7280"}}>Played</div></div>
            </div>}
            <button onClick={()=>{snd.play('tap');launchSeasonGame(stats.seasonGame)}} style={{...btn(`linear-gradient(135deg,${seasonStageIntro.color},${seasonStageIntro.color}cc)`),...{maxWidth:300,margin:"0 auto",boxShadow:`0 4px 15px ${seasonStageIntro.color}40`,animation:"su .5s ease-out .5s both"}}}>Play Ball!</button>
            <button onClick={goHome} style={{...ghost,display:"block",margin:"8px auto"}}>← Back to Home</button>
          </div>);
        })()}

        {/* SURVIVAL GAME OVER */}
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
                <div key={i}><div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{s.l}</div></div>
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
                      {!h.isOpt&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>Best: "{h.bestOpt}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>}
            <button onClick={startSurvival} style={{...btn("linear-gradient(135deg,#7c3aed,#a855f7)"),...{marginBottom:6,boxShadow:"0 4px 12px rgba(168,85,247,.25)"}}}>💀 Try Again</button>
            <button onClick={goHome} style={{...btn("rgba(255,255,255,.06)"),...{fontSize:12}}}>← Back to Home</button>
          </div>);
        })()}

        {/* SPEED ROUND RESULTS */}
        {screen==="speedResults"&&speedRound&&(()=>{
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
                <div key={i}><div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{s.l}</div></div>
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
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        button:hover{filter:brightness(1.05)}
        button:active{transform:scale(.98)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:2px}
      `}</style>
    </div>
  );
}
