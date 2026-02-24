import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================================
// BASEBALL STRATEGY MASTER V5 — 57 handcrafted + unlimited AI scenarios
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
      rates:[85,40,50,30],concept:"Getting ahead in the count is a pitcher's biggest advantage",anim:"strike"},
    {id:"p3",title:"Runner Threatening to Steal",diff:2,cat:"baserunners",
      description:"Speedster on 1st — 40 stolen bases this year. He's taking a big lead. Count is 1-0.",
      situation:{inning:"Top 4",outs:0,count:"1-0",runners:[1],score:[2,1]},
      options:["Throw over to first","Quick-pitch with a slide step","Pitch out","Ignore the runner — focus on the batter"],
      best:1,explanations:["Throwing over is fine, but the runner is still fast afterward.","The slide step cuts delivery from 1.5s to 1.2s — giving the catcher a real chance to throw him out.","A pitchout on 1-0 makes it 2-0 — terrible count.","Ignoring a 40-steal threat? He'll take 2nd easily."],
      rates:[50,80,35,25],concept:"The slide step controls the running game without hurting pitch count",anim:"strike"},
    {id:"p4",title:"Protecting a Lead",diff:2,cat:"late-game",
      description:"Top 8th, up 3-1, runners on 1st and 2nd, 1 out. Power hitter up. Your arm is tired.",
      situation:{inning:"Top 8",outs:1,count:"0-0",runners:[1,2],score:[3,1]},
      options:["Fastballs — go right after him","Pitch around him","Mix speeds — work the corners","Ask to come out"],
      best:2,explanations:["Tired arm = less velocity. Challenging a power hitter with diminished stuff is dangerous.","Pitching around loads the bases — tying run comes to the plate.","Smart! Changing speeds when tired beats trying to overpower. Keep him guessing.","That's the manager's call, not yours. Compete."],
      rates:[30,40,80,55],concept:"When fatigued, pitching smart (mixing speeds) beats pitching hard",anim:"strike"},
    {id:"p5",title:"Setting Up the Strikeout",diff:2,cat:"counts",
      description:"2 outs, 6th inning, nobody on. Count is 0-2 on a slugger who homered off you earlier.",
      situation:{inning:"Bot 6",outs:2,count:"0-2",runners:[],score:[5,3]},
      options:["Waste one in the dirt","Fastball up in the zone","Slider on the outside corner","Fastball down the middle — dare him"],
      best:0,explanations:["With 0-2 you can afford a ball. Expand his zone, then finish him.","He homered off your fastball. Don't give him another one he can see.","Good but risky — if the slider hangs, it's in his wheelhouse.","Never challenge a guy who already went deep off you!"],
      rates:[85,35,60,10],concept:"Use waste pitches on 0-2 to expand the zone before the strikeout pitch",anim:"strikeout"},
    {id:"p6",title:"Double Play Groundball",diff:2,cat:"situational",
      description:"Runners on 1st and 2nd, nobody out. Need a ground ball. Lefty batter likes the ball up. Count 1-1.",
      situation:{inning:"Bot 3",outs:0,count:"1-1",runners:[1,2],score:[2,2]},
      options:["Sinker down in the zone","High fastball where he likes it","Curveball in the dirt","Changeup away"],
      best:0,explanations:["Sinkers generate ground balls at nearly 2x the rate of four-seamers. Double play time.","Throwing where a hitter is comfortable when you need a groundball = bad combo.","Curveball in the dirt could be a wild pitch advancing both runners.","Changeup away can work, but the sinker is the ground ball gold standard."],
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
      rates:[40,35,85,25],concept:"Channel adrenaline into controlled aggression — establish the strike zone early",anim:"strike"},
  ],
  batter: [
    {id:"b1",title:"RBI Opportunity",diff:1,cat:"situational",
      description:"Runner on 3rd, 1 out, down 2-1 in the 7th. Pitcher throws mostly fastballs. Infield at normal depth.",
      situation:{inning:"Bot 7",outs:1,count:"1-1",runners:[3],score:[1,2]},
      options:["Swing for the fences","Fly ball — sacrifice fly","Ground ball to the right side","Work a walk"],
      best:1,explanations:["Swinging for a homer is selfish here. You just need 1 run to tie.","A fly ball to the outfield scores the runner even if you're out. Ties the game.","Ground ball with infield at normal depth might get the runner thrown out at home.","Walking doesn't help with the tying run 90 feet away."],
      rates:[25,85,45,30],concept:"With runner on 3rd, less than 2 outs: a fly ball is a productive out",anim:"flyout"},
    {id:"b2",title:"Two-Strike Approach",diff:2,cat:"counts",
      description:"0-2 count, runner on 2nd, 2 outs. The pitcher's slider has been devastating today.",
      situation:{inning:"Bot 5",outs:2,count:"0-2",runners:[2],score:[3,4]},
      options:["Sit on the slider","Choke up and battle — protect the plate","Look fastball, react to off-speed","Surprise bunt"],
      best:1,explanations:["Guessing one pitch on 0-2 is a gamble.","Perfect! Choke up for bat control and a shorter swing. Fight off tough pitches until you get something hittable.","Sitting fastball when the slider is dominant means you'll chase.","Foul bunt with 2 strikes = strikeout. Game over."],
      rates:[35,80,45,10],concept:"With 2 strikes, shorten your swing and focus on putting the ball in play",anim:"hit"},
    {id:"b3",title:"Hit and Run",diff:1,cat:"plays",
      description:"Coach gives the hit-and-run sign. Runner on 1st, 1 out, count 1-1.",
      situation:{inning:"Top 3",outs:1,count:"1-1",runners:[1],score:[1,1]},
      options:["Swing no matter what","Only swing if it's good","Bunt instead","Swing and pull for power"],
      best:0,explanations:["On a hit-and-run, the runner goes on the pitch. You MUST swing to protect him.","You can't be selective — the runner is committed and will be thrown out.","The sign was hit-and-run, not bunt. Don't change the play.","The goal is contact, not power."],
      rates:[85,30,40,20],concept:"On a hit-and-run, your job is to swing and make contact — protect the runner",anim:"hit"},
    {id:"b4",title:"Smart Aggression",diff:2,cat:"approach",
      description:"Leadoff, never faced this pitcher. Coach says 'see some pitches.' First pitch is a fastball right down the middle.",
      situation:{inning:"Top 1",outs:0,count:"0-0",runners:[],score:[0,0]},
      options:["Take it — see what he has","Swing — be aggressive on strikes","Bunt for a hit","Take until you see a strike"],
      best:1,explanations:["Seeing pitches is nice, but a meatball down the middle is the most hittable pitch you'll see.","Smart aggression! MLB hitters who swing at first-pitch strikes bat .340+.","Bunting a meatball wastes a gift.","That IS a strike. You're already in trouble at 0-1."],
      rates:[45,85,30,35],concept:"Be selectively aggressive — attack hittable pitches in the zone",anim:"hit"},
    {id:"b5",title:"Advancing the Runner",diff:1,cat:"situational",
      description:"Runner on 2nd, nobody out, tie game in the 7th. You're a #2 hitter with good contact.",
      situation:{inning:"Bot 7",outs:0,count:"0-0",runners:[2],score:[3,3]},
      options:["Pull for extra bases","Hit to the right side","Bunt him to 3rd","Swing for the fences"],
      best:1,explanations:["Pulling doesn't reliably advance the runner.","Hitting right side moves him to 3rd. From there he scores on a sac fly, wild pitch, or groundout.","Bunting is okay but a hit to the right side moves him AND potentially gets you on base.","Ignores the situation entirely."],
      rates:[30,85,60,15],concept:"Moving runners to 3rd with 0 outs creates multiple ways to score",anim:"hit"},
    {id:"b6",title:"Hitter's Count",diff:2,cat:"counts",
      description:"Bases loaded, 2 outs, down by 1. Count is 3-1. Pitcher has been wild.",
      situation:{inning:"Bot 8",outs:2,count:"3-1",runners:[1,2,3],score:[4,5]},
      options:["Take — a walk ties the game","Swing only at YOUR pitch","Swing at anything close","Grand slam swing"],
      best:1,explanations:["What if it's a perfect strike? Now you're 3-2 and defending.","3-1 is the best hitter's count. Only swing at YOUR pitch. If not perfect, take ball four.","Being too aggressive wastes the 3-1 advantage.","Grand slam swings change your mechanics. Trust your swing."],
      rates:[50,85,35,20],concept:"3-1 is a hitter's count — swing only at YOUR pitch",anim:"hit"},
    {id:"b7",title:"Going Opposite Field",diff:2,cat:"adjustments",
      description:"Pitcher keeps throwing outside. You've fouled off 3 pitches. Count 1-2. Runner on 1st.",
      situation:{inning:"Top 5",outs:1,count:"1-2",runners:[1],score:[2,2]},
      options:["Normal swing — he'll come inside","Go with the pitch — opposite field","Step closer to the plate","Bunt"],
      best:1,explanations:["If it's working, he won't change. YOU adjust.","Smart! When the pitcher works outside, drive it the other way. That's what the best hitters do.","Moving in the box doesn't fix your swing approach.","Bunting with 2 strikes risks a foul-bunt strikeout."],
      rates:[25,85,50,20],concept:"When the pitcher works away, go with it to the opposite field",anim:"hit"},
    {id:"b8",title:"Cold Off the Bench",diff:3,cat:"pressure",
      description:"Pinch hitting, bottom 9th, runner on 2nd, 2 outs, down by 1. You haven't batted all game. Pitcher throws 95.",
      situation:{inning:"Bot 9",outs:2,count:"0-0",runners:[2],score:[3,4]},
      options:["Take the first pitch to time his speed","Swing if it's hittable","Ambush a specific pitch","Bunt"],
      best:0,explanations:["Coming in cold against 95mph, you need to time him. One pitch of timing is invaluable.","Your timing will be off against 95mph without any at-bats.","Ambushing requires locked-in timing you don't have.","Bunting with 2 outs and a runner on 2nd makes no sense."],
      rates:[80,40,45,5],concept:"As a pinch hitter, take the first pitch to time the pitcher's velocity",anim:"strike"},
    {id:"b9",title:"Infield Playing In",diff:2,cat:"situational",
      description:"Runner on 3rd, 1 out. Infield drawn in. Count 2-2.",
      situation:{inning:"Bot 6",outs:1,count:"2-2",runners:[3],score:[2,3]},
      options:["Fly ball to score the runner","Hard grounder","Hit over the infield","Ground ball anywhere"],
      best:0,explanations:["With infield in, ground balls are more likely fielded. A fly ball scores the runner on a tag-up.","Infield in means they're positioned to throw the runner out at home.","Trying to hit over them changes your swing.","Ground ball contact is what the drawn-in defense wants."],
      rates:[80,35,40,30],concept:"When the infield plays in, fly balls are more valuable than ground balls",anim:"flyout"},
    {id:"b10",title:"After a Teammate's Homer",diff:1,cat:"approach",
      description:"Teammate just went deep. Pitcher walked the last batter on 4 pitches. He's rattled. Stadium is rocking.",
      situation:{inning:"Bot 5",outs:1,count:"0-0",runners:[1],score:[5,3]},
      options:["Swing first pitch — keep pressure","Take pitches — let him struggle","Look for YOUR pitch","Pull for another homer"],
      best:2,explanations:["Swinging at anything can bail him out with a cheap out.","Too patient — lets the pitcher reset and breathe.","When a pitcher is rattled, wait for your pitch and drive it.","Trying for homers changes your mechanics."],
      rates:[45,30,85,25],concept:"When a pitcher is struggling, look for YOUR pitch — don't bail him out",anim:"hit"},
    {id:"b11",title:"First At-Bat Data",diff:2,cat:"adjustments",
      description:"2nd at-bat against this pitcher. First time he struck you out on 3 straight sliders. What's different now?",
      situation:{inning:"Top 4",outs:0,count:"0-0",runners:[],score:[1,2]},
      options:["Sit slider — he'll start with it again","Look fastball, react to slider","Swing at the first pitch before he sets up","Crowd the plate"],
      best:1,explanations:["He knows you saw 3 sliders. Smart pitchers mix it up the 2nd time.","Right! Expect fastball, then react to the slider. If he starts slider, you're ready.","Aggressive but uninformed. Use what you learned.","Crowding the plate doesn't help you hit sliders."],
      rates:[40,85,35,30],concept:"Use your first at-bat to gather data — adjust in the second at-bat",anim:"hit"},
    {id:"b12",title:"Down to the Last Strike",diff:3,cat:"pressure",
      description:"Bottom 9th, 2 outs, down by 2. Runners on 1st and 2nd. Count is 2-2. You represent the tying run at the plate.",
      situation:{inning:"Bot 9",outs:2,count:"2-2",runners:[1,2],score:[3,5]},
      options:["Swing hard — need a big hit","Shorten up and put the ball in play","Sit on one pitch and guess right","Take — pray for a walk"],
      best:1,explanations:["Overswinging with 2 strikes leads to strikeouts. Keep your season alive.","In elimination situations, shorten your swing and find a way to keep the at-bat alive. Contact creates chaos.","Guessing wrong ends your season.","A walk only loads the bases. You still need a hit."],
      rates:[25,80,35,30],concept:"With your back against the wall, shorten up and make contact — keep the line moving",anim:"hit"},
  ],
  fielder: [
    {id:"f1",title:"Double Play Chance",diff:1,cat:"infield",
      description:"You're at 2nd base. Runner on 1st, 0 outs. Ground ball right at you. Runner isn't fast.",
      situation:{inning:"Top 5",outs:0,count:"-",runners:[1],score:[3,2]},
      options:["Tag 2nd, throw to 1st — double play","Throw to 1st for the sure out","Flip to SS covering 2nd","Hold and check the runner"],
      best:0,explanations:["Ball came right to you — step on 2nd (force out) and fire to 1st. Two outs!","One out is okay but you're leaving a free out on the field.","The flip adds an extra throw. You're right there — do it yourself.","Never hold the ball with runners moving!"],
      rates:[85,55,50,10],concept:"When a ground ball comes right to you, turn the double play yourself",anim:"doubleplay"},
    {id:"f2",title:"Cutoff Decision",diff:2,cat:"outfield",
      description:"You're the SS cutoff. Deep hit to left-center, runner from 1st trying to score. Throw coming to you.",
      situation:{inning:"Bot 6",outs:1,count:"-",runners:[1],score:[2,2]},
      options:["Cut it off and throw home","Let the throw go through","Cut and hold","Cut and throw to 3rd"],
      best:0,explanations:["Your relay is faster and more accurate than a bouncing outfield throw.","Letting throws through only works on perfect one-hoppers.","Holding lets the tying run score with no play.","Home is the priority, not 3rd."],
      rates:[80,35,25,40],concept:"The cutoff man relays accurate throws home — catch and throw, don't let it go",anim:"throwHome"},
    {id:"f3",title:"Pop Fly Priority",diff:1,cat:"communication",
      description:"You're center field. High pop between you, the right fielder, and the 2nd baseman.",
      situation:{inning:"Top 2",outs:1,count:"-",runners:[2],score:[0,1]},
      options:["Call 'I got it!' and wave off others","Let the infielder take it","Stay quiet and see who gets there","Back off for the right fielder"],
      best:0,explanations:["CF has priority on ALL fly balls they can reach. Call early and loud!","You're running in (easier). Outfielder coming in has priority over infielder going back.","NEVER stay quiet! Collisions happen when nobody communicates.","CF has priority over corner outfielders."],
      rates:[90,30,5,35],concept:"Center fielder has priority on all fly balls — call it early and loud!",anim:"catch"},
    {id:"f4",title:"Hit the Cutoff",diff:2,cat:"outfield",
      description:"You're in left. Single to you, runners on 1st and 2nd. Lead runner rounding 3rd.",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[1,2],score:[4,3]},
      options:["Throw home directly","Throw to 3rd","Throw to 2nd","Hit the cutoff man"],
      best:3,explanations:["A direct throw from left is long. If offline, everyone advances.","3rd isn't the priority — the run matters.","Throwing behind ignores the scoring runner.","The cutoff man can redirect to home or hold to prevent extras."],
      rates:[30,35,15,85],concept:"Always hit the cutoff man — he makes the best decision for the team",anim:"throwHome"},
    {id:"f5",title:"First Base Fundamentals",diff:1,cat:"infield",
      description:"You're at 1st. Grounder to the shortstop, nobody on. What do you do BEFORE the throw?",
      situation:{inning:"Bot 4",outs:0,count:"-",runners:[],score:[1,0]},
      options:["Get to the bag and give a target","Move toward the ball","Stay back from the bag","Cover home"],
      best:0,explanations:["Get to the bag, face the thrower, stretch toward the ball. Textbook.","SS has it. Your job is to receive the throw at the bag.","Staying back means you can't stretch for offline throws.","Nobody on base — no need to cover home."],
      rates:[90,20,40,5],concept:"First baseman: get to the bag early, face the thrower, stretch toward the throw",anim:"catch"},
    {id:"f6",title:"Bunt Against the Shift",diff:3,cat:"positioning",
      description:"You're 3B, shifted right vs a lefty pull hitter. He squares to bunt down the 3B line!",
      situation:{inning:"Top 3",outs:0,count:"1-0",runners:[1],score:[0,0]},
      options:["Sprint back to 3B position","Stay in the shift","Yell for the pitcher","Charge from where you are"],
      best:0,explanations:["React and get back! Don't let a bunt beat the shift.","Staying in the shift with a bunt coming gives a free base hit.","Pitcher coverage is limited. YOU make this play.","Charging from the wrong side — you won't get there."],
      rates:[80,10,30,25],concept:"Always adjust positioning when the batter shows bunt",anim:"catch"},
    {id:"f7",title:"Shallow Fly Tag-Up",diff:2,cat:"outfield",
      description:"You're in right. Runner on 3rd, 1 out. Shallow fly — you catch it. Runner tags up.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[3],score:[2,3]},
      options:["Throw home immediately","Throw to cutoff","Hold — too shallow","Throw to 2nd"],
      best:0,explanations:["Shallow = you're CLOSE to home. Direct throw has your best shot.","Cutoff relay adds time on a short throw.","Being shallow means you're CLOSER. Best chance ever.","Nobody is running to 2nd."],
      rates:[85,50,20,10],concept:"On shallow fly balls, throw directly home — the short distance is your advantage",anim:"throwHome"},
    {id:"f8",title:"Wheel Play",diff:3,cat:"plays",
      description:"You're 3B. Runner on 1st, 0 outs. Batter bunts. Coach called a wheel play — SS covers 3rd.",
      situation:{inning:"Top 4",outs:0,count:"0-0",runners:[1],score:[1,0]},
      options:["Charge hard (no plan)","Hold position","Charge, throw to 1st","Charge, spin-throw to 3rd"],
      best:3,explanations:["Charging without a throw target wastes time.","Holding lets the bunt die.","1st gets 1 out but lead runner advances to scoring position.","On a wheel play, charge and throw to 3rd. Getting the lead runner is worth more."],
      rates:[40,15,50,85],concept:"On bunt defense, getting the lead runner is more valuable than the sure out",anim:"throwHome"},
    {id:"f9",title:"Ball in the Sun",diff:2,cat:"outfield",
      description:"High fly ball headed right into the sun. You lose sight of it.",
      situation:{inning:"Top 7",outs:2,count:"-",runners:[1],score:[3,2]},
      options:["Glove up to shade your eyes","Keep running where you think it's going","Stop and call for help","Drop to one knee"],
      best:0,explanations:["The glove-up technique is standard sun defense. Practice it every spring.","Running blind is how you misplay balls badly.","By the time help arrives, the ball has landed.","Kneeling doesn't solve the sun problem."],
      rates:[85,25,35,30],concept:"Use your glove to shade the sun — fundamental outfield technique",anim:"catch"},
    {id:"f10",title:"Do-or-Die Play",diff:3,cat:"pressure",
      description:"Bottom 9th, tie game, runner on 2nd, 2 outs. Single to you in center. Runner going home.",
      situation:{inning:"Bot 9",outs:2,count:"-",runners:[2],score:[3,3]},
      options:["Field cleanly, set feet, strong throw home","Charge and throw on the run","Field and hit cutoff","Dive for the ball"],
      best:0,explanations:["This is it. Accuracy beats speed. Set your feet and make your best throw.","Throwing on the run sacrifices accuracy in the biggest moment.","Cutoff adds time on a game-ending throw.","Diving adds recovery time."],
      rates:[85,40,45,20],concept:"In do-or-die plays: field cleanly, set your feet, throw accurately",anim:"throwHome"},
    {id:"f11",title:"Backing Up Bases",diff:1,cat:"positioning",
      description:"You're in right field. Grounder to shortstop, runner on 2nd going to 3rd. Where should you go?",
      situation:{inning:"Top 3",outs:1,count:"-",runners:[2],score:[1,1]},
      options:["Stay in position","Back up 1st base","Back up 3rd base","Back up home"],
      best:1,explanations:["Staying in position means you can't help if there's an overthrow.","Correct! Right fielder backs up throws to 1st. If the ball gets away, you're there.","Left fielder backs up 3rd, not right fielder.","Catcher covers home."],
      rates:[20,85,30,15],concept:"Always back up the base where the throw is going — anticipate overthrows",anim:"catch"},
    {id:"f12",title:"Relay Position",diff:2,cat:"outfield",
      description:"Deep fly ball to the corner in right. Runner trying to score from 1st. You're the 2nd baseman going out for the relay.",
      situation:{inning:"Bot 5",outs:1,count:"-",runners:[1],score:[2,3]},
      options:["Line up between outfielder and home plate","Line up between outfielder and 3rd","Go to shallow right field","Stay near 2nd base"],
      best:0,explanations:["Perfect relay positioning! Get in a straight line between the outfielder and home plate.","The throw needs to go HOME, not 3rd. Line up accordingly.","Too close to the outfielder — you need distance for a relay.","Staying at 2nd means no relay. The throw bounces in."],
      rates:[85,35,25,15],concept:"On relay throws, line up directly between the outfielder and the target base",anim:"throwHome"},
  ],
  baserunner: [
    {id:"r1",title:"Stealing Second",diff:1,cat:"stealing",
      description:"You're on 1st, 2-1 count. Pitcher is slow to the plate, catcher has a weak arm. You've got speed.",
      situation:{inning:"Top 6",outs:0,count:"2-1",runners:[1],score:[2,3]},
      options:["Go! Steal on the next pitch","Wait for a better count","Stay — let the batter work","Take a bigger lead but don't go"],
      best:0,explanations:["Perfect conditions: slow pitcher, weak catcher, hitter's count. MLB runners succeed 85%+ here.","You might not get a better spot. All signs point to GO.","Too passive when everything favors you.","Indecisive! If you take a bigger lead, the pitcher throws over."],
      rates:[85,60,30,40],concept:"Steal when conditions align: slow pitcher, weak catcher, hitter's count",anim:"steal"},
    {id:"r2",title:"Tag Up Deep Fly",diff:1,cat:"tagging",
      description:"You're on 3rd, 1 out. Deep fly to center. Routine catch. Tie game, 8th inning.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[3],score:[3,3]},
      options:["Tag up and score after the catch","Go halfway","Stay on 3rd","Break for home immediately"],
      best:0,explanations:["Deep fly, 1 out — textbook tag up. The throw from deep center is long.","Halfway on a routine catch = can't score from there.","A deep fly with 1 out? That's your chance for the go-ahead run.","Leaving early = out on appeal. Wait for the catch!"],
      rates:[90,25,20,5],concept:"Always tag up on deep fly balls from 3rd with less than 2 outs",anim:"score"},
    {id:"r3",title:"Ball in the Dirt",diff:1,cat:"baserunning",
      description:"You're on 1st, 2 outs. Batter swings and misses, pitch bounces away from catcher.",
      situation:{inning:"Top 5",outs:2,count:"2-2",runners:[1],score:[1,2]},
      options:["Sprint to 2nd!","Wait for the catcher","Stay at 1st","Only go if it hits backstop"],
      best:0,explanations:["Run! With 2 outs, go on anything in the dirt. Catcher has to find, pick up, and throw.","Hesitation kills. By the time you decide, the catcher has recovered.","Having 2 outs makes advancing MORE important.","Any ball away from the catcher is your chance."],
      rates:[85,25,15,45],concept:"With 2 outs, always advance on balls in the dirt",anim:"steal"},
    {id:"r4",title:"First-to-Third",diff:2,cat:"baserunning",
      description:"You're on 1st, 1 out. Clean single to right. Right fielder has a strong arm.",
      situation:{inning:"Bot 4",outs:1,count:"-",runners:[1],score:[2,2]},
      options:["Round 2nd and read the coach","Sprint to 3rd no matter what","Stop at 2nd","Watch the throw first"],
      best:0,explanations:["Round 2nd aggressively and trust your 3rd base coach. He sees everything.","Running blind into a strong arm gets you thrown out.","Too conservative. At 3rd you score on a sac fly or wild pitch.","By the time you watch the throw, it's too late."],
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
      rates:[40,85,30,25],concept:"On extra base hits, sprint full speed and let the coach guide you",anim:"advance"},
    {id:"r9",title:"Freeze on a Line Drive",diff:2,cat:"baserunning",
      description:"You're on 2nd. Screaming line drive toward shortstop. It might be caught.",
      situation:{inning:"Bot 5",outs:0,count:"-",runners:[2],score:[2,1]},
      options:["FREEZE!","Sprint to 3rd","Go halfway","Break back to 2nd"],
      best:0,explanations:["On line drives, FREEZE. If caught, you're safe at 2nd. If it drops, advance.","Sprinting on a line drive = doubled off. The #1 baserunning mistake.","Even halfway is dangerous on a liner.","Breaking back means you can't advance if it's a hit."],
      rates:[85,10,30,40],concept:"FREEZE on line drives — running on a catch means an easy double play",anim:"freeze"},
    {id:"r10",title:"Scoring from 2nd",diff:2,cat:"baserunning",
      description:"You're on 2nd, 1 out. Single to left. LF fields it on one hop. Score or hold?",
      situation:{inning:"Bot 7",outs:1,count:"-",runners:[2],score:[3,4]},
      options:["Score!","Hold at 3rd","Round 3rd and read the coach","Score only if you're fast"],
      best:2,explanations:["Aggressive is good but running blind into a throw can end the rally.","Too conservative with 1 out in a close game.","Round 3rd hard and read your coach. He sees the throw and catcher.","Speed matters less than the coach's eyes on the play."],
      rates:[45,35,85,40],concept:"Round 3rd aggressively and read your coach — he sees the whole play",anim:"score"},
    {id:"r11",title:"Wild Pitch Awareness",diff:1,cat:"baserunning",
      description:"You're on 3rd, 2 outs. Pitcher throws a curveball that bounces 5 feet in front of the plate.",
      situation:{inning:"Bot 8",outs:2,count:"1-2",runners:[3],score:[2,3]},
      options:["Sprint home!","Wait — too risky with 2 outs","See where the ball goes first","Only go if it gets past the catcher"],
      best:0,explanations:["Any ball that bounces well in front of the plate is your chance. Be aggressive from 3rd with 2 outs!","With 2 outs, the risk-reward heavily favors going.","By the time you see, the catcher has recovered.","It bounced 5 feet in front — it WILL get away at least briefly. Go!"],
      rates:[85,20,35,50],concept:"On wild pitches with a runner on 3rd, react immediately — don't wait and watch",anim:"score"},
  ],
  manager: [
    {id:"m1",title:"Intentional Walk",diff:2,cat:"late-game",
      description:"Bottom 9th, runner on 2nd, 1 out, up by 1. The .310 hitter is up. .245 hitter (35 HRs) on deck.",
      situation:{inning:"Bot 9",outs:1,count:"-",runners:[2],score:[5,4]},
      options:["Walk him — set up the DP","Pitch to him","Walk both — load bases","Bring in a new pitcher"],
      best:0,explanations:["Walking the .310 hitter sets up a force at every base + potential DP. The .245 hitter strikes out more.","Pitching to a .310 hitter in a 1-run 9th is risky.","Loading bases means any walk/HBP/error scores the tying run.","A cold reliever with runners on is worse."],
      rates:[80,40,15,45],concept:"Intentional walks set up force plays and let you face a weaker hitter",anim:"walk"},
    {id:"m2",title:"Pinch Hitter Timing",diff:1,cat:"substitutions",
      description:"Bottom 8th, down 2, bases loaded, 1 out. Your pitcher is due up. He's been great.",
      situation:{inning:"Bot 8",outs:1,count:"-",runners:[1,2,3],score:[2,4]},
      options:["Pinch hit — need runs NOW","Let pitcher hit — he's earned it","Only if a good reliever is ready","Have the pitcher bunt"],
      best:0,explanations:["Bases loaded, down 2 — you need runs. Pitchers bat .120. A real hitter's odds are much better.","Loyalty is nice, but the job is winning.","Can't wait for ideal conditions. This IS the moment.","Bunting scores 1 max. You need 2."],
      rates:[85,15,60,20],concept:"Use pinch hitters in high-leverage spots — pitchers can't hit",anim:"hit"},
    {id:"m3",title:"Defensive Replacement",diff:2,cat:"late-game",
      description:"Top 9th, up by 1. Your LF went 3-4 with a HR but plays below-average defense. Gold Glover on bench.",
      situation:{inning:"Top 9",outs:0,count:"-",runners:[],score:[5,4]},
      options:["Bring in the Gold Glover","Keep the hot bat","Wait for runners","Switch if first batter gets on"],
      best:0,explanations:["In a 1-run 9th, one misplayed fly ball ties the game. Prioritize defense.","You're trying to win NOW. Defense matters more than potential extras.","Waiting until runners are on is too late if it's a misplay that puts them on.","That misplay could BE the first batter getting on."],
      rates:[85,30,35,40],concept:"In close late innings, prioritize defense — one play decides the game",anim:"catch"},
    {id:"m4",title:"Sacrifice Bunt",diff:1,cat:"plays",
      description:"Bottom 7th, tie. Runner on 2nd, nobody out. #7 hitter (.220) is up.",
      situation:{inning:"Bot 7",outs:0,count:"-",runners:[2],score:[2,2]},
      options:["Bunt the runner to 3rd","Let him swing","Hit-and-run","Squeeze play"],
      best:0,explanations:["A .220 hitter + 0 outs = the bunt moves the runner for multiple scoring chances.","A .220 hitter is more likely to make an unproductive out.","Hit-and-run from 2nd is risky if he misses.","Squeeze only works from 3rd."],
      rates:[80,35,40,10],concept:"Sacrifice bunts are smart with weak hitters and runners in scoring position",anim:"bunt"},
    {id:"m5",title:"Lefty vs. Lefty",diff:2,cat:"matchups",
      description:"Top 8th, up 1, runners on 1st and 3rd, 2 outs. Dangerous lefty up. Lefty specialist available.",
      situation:{inning:"Top 8",outs:2,count:"-",runners:[1,3],score:[4,3]},
      options:["Bring in the lefty","Trust your current pitcher","Wait until 2-0 to decide","Walk the lefty"],
      best:0,explanations:["L-on-L matchups are huge. Lefties bat 30-50 points lower vs lefty pitchers.","Platoon advantage is real. Use your specialist.","Waiting until 2-0 means your pitcher is already losing.","Walking puts the go-ahead run on base."],
      rates:[85,45,25,35],concept:"Lefty-on-lefty matchups give a significant platoon advantage",anim:"strikeout"},
    {id:"m6",title:"Stolen Base Call",diff:2,cat:"plays",
      description:"Bottom 6th, down 1. Fastest guy on 1st, nobody out. Slow pitcher. #3 hitter batting 1-0.",
      situation:{inning:"Bot 6",outs:0,count:"1-0",runners:[1],score:[2,3]},
      options:["Send him","Don't — let #3 drive him in","Hit-and-run","Let the runner decide"],
      best:0,explanations:["Fast runner + slow pitcher + hitter's count = green light. Get into scoring position.","He can drive him in from 2nd too. Scoring position helps.","Hit-and-run is fine but straight steal has better odds here.","Managers make the tactical calls."],
      rates:[85,40,55,30],concept:"Give the steal sign when the matchup heavily favors the runner",anim:"steal"},
    {id:"m7",title:"Lineup Construction",diff:1,cat:"pregame",
      description:"Setting your lineup. Leadoff: Player A (.320, speed, walks) vs Player B (.280, 20 HRs, speed).",
      situation:{inning:"Pre",outs:0,count:"-",runners:[],score:[0,0]},
      options:["Player A — OBP machine","Player B — power sets the tone","Alternate by pitcher","Best hitter leads off"],
      best:0,explanations:["Leadoff job = get on base. .320 + walks = highest OBP.","Power at leadoff = lower OBP = fewer baserunners.","OBP should lead off regardless.","Best hitter usually bats 2nd or 3rd in modern lineups."],
      rates:[85,40,50,35],concept:"The leadoff hitter's job is to get on base — OBP is king",anim:"hit"},
    {id:"m8",title:"Challenge the Call",diff:2,cat:"game-management",
      description:"Top 7th, tie. Close play at 1st — ump calls your runner out. Replay looks favorable. 1 challenge left.",
      situation:{inning:"Top 7",outs:1,count:"-",runners:[],score:[3,3]},
      options:["Challenge it","Save for later","Ask the bench coach","Only if clearly wrong"],
      best:0,explanations:["Tie game, 7th inning — every baserunner matters. Use it.","'Saving for later' often means never using it.","Getting input is good but you already think it's favorable. Don't overthink.","Too conservative. If replay looks good, go."],
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
      rates:[35,50,85,45],concept:"Save your closer for tight games — setup men can handle comfortable leads",anim:"strike"},
  ],
};

const ALL_POS = ["pitcher","batter","fielder","baserunner","manager"];
const POS_META = {
  pitcher:{label:"Pitcher",emoji:"⚾",color:"#ef4444",bg:"linear-gradient(135deg,#7f1d1d,#991b1b,#dc2626)",desc:"Control the game from the mound",icon:"🔥"},
  batter:{label:"Batter",emoji:"💪",color:"#3b82f6",bg:"linear-gradient(135deg,#1e3a5f,#1e40af,#3b82f6)",desc:"Drive in runs when it counts",icon:"⚡"},
  fielder:{label:"Fielder",emoji:"🧤",color:"#22c55e",bg:"linear-gradient(135deg,#14532d,#166534,#22c55e)",desc:"Make the plays that win games",icon:"🛡️"},
  baserunner:{label:"Runner",emoji:"🏃",color:"#f59e0b",bg:"linear-gradient(135deg,#78350f,#92400e,#d97706)",desc:"Run smart, score runs",icon:"💨"},
  manager:{label:"Manager",emoji:"📋",color:"#a855f7",bg:"linear-gradient(135deg,#3b0764,#581c87,#7c3aed)",desc:"Make championship decisions",icon:"🧠"},
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
  {id:"util",n:"Utility Player",d:"Play all 5 positions",e:"🔄",ck:s=>ALL_POS.every(p=>(s.ps[p]?.p||0)>=1)},
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
    util:[ALL_POS.filter(p=>(s.ps[p]?.p||0)>=1).length,5],
    c10:[Math.min(s.cl?.length||0,10),10],c20:[Math.min(s.cl?.length||0,20),20],
    daily3:[Math.min(s.ds||0,3),3],daily7:[Math.min(s.ds||0,7),7],perf5:[Math.min(s.sp||0,5),5]};
  return map[id]||[0,1];
}
function getLvl(p){for(let i=LEVELS.length-1;i>=0;i--)if(p>=LEVELS[i].min)return LEVELS[i];return LEVELS[0];}
function getNxt(p){for(const l of LEVELS)if(p<l.min)return l;return null;}

const DAILY_FREE = 15;
const STORAGE_KEY = "bsm_v5";
const DEFAULT = {pts:0,str:0,bs:0,gp:0,co:0,ps:{},achs:[],cl:[],ds:0,lastDay:null,todayPlayed:0,todayDate:null,sp:0,isPro:false,onboarded:false,soundOn:true,recentWrong:[],dailyDone:false,dailyDate:null,streakFreezes:0,survivalBest:0};

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
const POS_FOCUS = {
  pitcher:"pitch selection, count strategy, situational pitching, managing runners, fatigue management, pitch sequencing",
  batter:"situational hitting, count leverage, two-strike approach, driving in runs, plate discipline, adjusting to pitchers",
  fielder:"defensive positioning, cutoff throws, communication, double plays, bunt defense, relay throws, backing up bases",
  baserunner:"steal timing, tag-ups, reading pitchers, advancing on contact, line drive freeze, coach signals",
  manager:"lineup decisions, pitching changes, defensive substitutions, intentional walks, sacrifice bunts, matchup advantages"
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

POSITION FOCUS AREAS: ${POS_FOCUS[position]}

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
    }catch{}
  },[getCtx]);
  return{play,setEnabled:(v)=>{enabled.current=v}};
}

// Field SVG — Bright, fun, kid-friendly baseball field
function Field({runners=[],outcome=null,ak=0,anim=null}){
  const on=n=>runners.includes(n);
  // Coords: Home(200,282) 1B(284,206) 2B(200,140) 3B(116,206) Mound(200,218)
  // Player sprite — chunky, readable, fun
  const Guy=({x,y,jersey="#2563eb",cap="#1d4ed8",o=1,ring=false,bat=false,mask=false})=>(
    <g transform={`translate(${x},${y})`} opacity={o}>
      {ring&&<><circle r="16" fill="none" stroke="#f59e0b" strokeWidth="2.2" opacity=".6"><animate attributeName="r" values="16;19;16" dur="1.3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;.2;.6" dur="1.3s" repeatCount="indefinite"/></circle><circle r="16" fill="rgba(245,158,11,.06)"/></>}
      {/* Ground shadow */}
      <ellipse cy="11" rx="6" ry="2.5" fill="rgba(0,0,0,.18)"/>
      {/* Legs */}
      <rect x="-4.5" y="4" width="4" height="6.5" rx="1.5" fill="#eee"/>
      <rect x=".5" y="4" width="4" height="6.5" rx="1.5" fill="#e4e4e4"/>
      {/* Body */}
      <rect x="-5.5" y="-5" width="11" height="11" rx="3" fill={jersey} stroke="rgba(255,255,255,.15)" strokeWidth=".6"/>
      {/* Jersey number accent */}
      <rect x="-2" y="-2.5" width="4" height="3.5" rx="1" fill="rgba(255,255,255,.1)"/>
      {/* Head */}
      <circle cy="-10" r="5" fill="#e8c4a0"/>
      {/* Cap */}
      <ellipse cy="-13" rx="6" ry="2.8" fill={cap}/>
      <rect x="-6" y="-14.5" width="12" height="3.5" rx="2" fill={cap}/>
      <rect x="-1.5" y="-10.5" width="7.5" height="2.2" rx="1" fill={cap} opacity=".6"/>
      {/* Catcher mask */}
      {mask&&<><rect x="-4" y="-9" width="8" height="6" rx="1.5" fill="none" stroke="#555" strokeWidth=".8" opacity=".6"/><line x1="-3" y1="-7" x2="3" y2="-7" stroke="#555" strokeWidth=".5" opacity=".4"/><line x1="-3" y1="-5" x2="3" y2="-5" stroke="#555" strokeWidth=".5" opacity=".4"/></>}
      {/* Bat */}
      {bat&&<><line x1="5" y1="-5" x2="13" y2="-17" stroke="#c4956a" strokeWidth="2.2" strokeLinecap="round"/><line x1="12.5" y1="-16.5" x2="14.5" y2="-20" stroke="#a87a4a" strokeWidth="3" strokeLinecap="round"/></>}
    </g>
  );
  return(
    <svg viewBox="0 0 400 310" style={{width:"100%",maxWidth:420,display:"block",margin:"0 auto"}}>
      <defs>
        <radialGradient id="grs" cx="50%" cy="78%" r="62%">
          <stop offset="0%" stopColor="#52c46a"/>
          <stop offset="35%" stopColor="#44b45c"/>
          <stop offset="70%" stopColor="#38a24e"/>
          <stop offset="100%" stopColor="#2d8a42"/>
        </radialGradient>
        <linearGradient id="drt" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0%" stopColor="#dab07a"/>
          <stop offset="100%" stopColor="#c49462"/>
        </linearGradient>
        <linearGradient id="wal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a6030"/>
          <stop offset="100%" stopColor="#28843e"/>
        </linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="fc"><path d="M200,292 L32,100 Q32,42 200,42 Q368,42 368,100 Z"/></clipPath>
      </defs>

      {/* === DARK BACKGROUND === */}
      <rect width="400" height="310" fill="#0c1520"/>

      {/* === COMPACT SKY — just wall top + tiny sliver === */}
      {/* Stars — just a few */}
      {[[60,12],[140,8],[200,5],[260,10],[340,14]].map(([x,y],i)=><circle key={`s${i}`} cx={x} cy={y} r=".7" fill="white" opacity={.2+i*.04}/>)}

      {/* === OUTFIELD WALL === */}
      <path d="M20,86 Q20,26 200,26 Q380,26 380,86 L376,92 Q376,34 200,34 Q24,34 24,92 Z" fill="url(#wal)" stroke="#0d3318" strokeWidth=".5"/>
      {/* Bright yellow fence cap */}
      <path d="M20,86 Q20,26 200,26 Q380,26 380,86" fill="none" stroke="#facc15" strokeWidth="2.8"/>

      {/* === WARNING TRACK === */}
      <path d="M24,92 Q24,38 200,38 Q376,38 376,92 L368,100 Q368,48 200,48 Q32,48 32,100 Z" fill="#b0905e" opacity=".5"/>

      {/* === OUTFIELD GRASS === */}
      <path d="M200,292 L32,100 Q32,48 200,48 Q368,48 368,100 Z" fill="url(#grs)"/>
      {/* Mowing stripes — clean horizontal bands */}
      <g clipPath="url(#fc)">
        {[...Array(13)].map((_,i)=><rect key={`m${i}`} x="0" y={46+i*20} width="400" height="10" fill={i%2===0?"rgba(255,255,255,.045)":"rgba(0,0,0,.03)"}/>)}
      </g>

      {/* === FOUL LINES === */}
      <line x1="200" y1="292" x2="32" y2="100" stroke="white" strokeWidth="1.5" opacity=".55"/>
      <line x1="200" y1="292" x2="368" y2="100" stroke="white" strokeWidth="1.5" opacity=".55"/>

      {/* === INFIELD DIRT === */}
      <polygon points="200,282 284,206 200,140 116,206" fill="url(#drt)"/>

      {/* === INFIELD GRASS (slightly brighter than outfield) === */}
      <polygon points="200,260 260,214 200,172 140,214" fill="#48b85e"/>

      {/* === BASEPATH CHALK === */}
      {[[200,282,284,206],[284,206,200,140],[200,140,116,206],[116,206,200,282]].map(([x1,y1,x2,y2],i)=>
        <line key={`bp${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.18)" strokeWidth="2.8"/>
      )}

      {/* === DIRT CUTOUTS === */}
      <ellipse cx="200" cy="286" rx="18" ry="10" fill="url(#drt)"/>
      <circle cx="284" cy="206" r="12" fill="url(#drt)"/>
      <circle cx="200" cy="140" r="10" fill="url(#drt)"/>
      <circle cx="116" cy="206" r="12" fill="url(#drt)"/>

      {/* === MOUND === */}
      <ellipse cx="200" cy="218" rx="15" ry="7.5" fill="#cca068" stroke="#aa8450" strokeWidth=".4"/>
      <rect x="196.5" y="216" width="7" height="3" rx="1" fill="white" opacity=".9"/>

      {/* === HOME PLATE & BOXES === */}
      <polygon points="200,278 196,282 196,286 204,286 204,282" fill="white" stroke="#bbb" strokeWidth=".6"/>
      <rect x="182" y="274" width="11" height="16" rx="1.5" fill="none" stroke="white" strokeWidth=".6" opacity=".2"/>
      <rect x="207" y="274" width="11" height="16" rx="1.5" fill="none" stroke="white" strokeWidth=".6" opacity=".2"/>

      {/* === BASES === */}
      {[[284,206,1],[200,140,2],[116,206,3]].map(([x,y,n])=>(
        <g key={`b${n}`} transform={`translate(${x},${y}) rotate(45)`}>
          <rect x="-6" y="-6" width="12" height="12" rx="1.2" fill={on(n)?"#3b82f6":"white"} stroke={on(n)?"#60a5fa":"#ccc"} strokeWidth="1.5">
            {on(n)&&<animate attributeName="opacity" values="1;.5;1" dur="1.2s" repeatCount="indefinite"/>}
          </rect>
        </g>
      ))}

      {/* === FIELDERS (home team blue, visible but receded) === */}
      <Guy x={128} y={108} o={.42}/>
      <Guy x={200} y={86} o={.42}/>
      <Guy x={272} y={108} o={.42}/>
      <Guy x={155} y={182} o={.48}/>
      <Guy x={245} y={182} o={.48}/>
      <Guy x={272} y={200} o={.48}/>
      <Guy x={128} y={200} o={.48}/>

      {/* === PITCHER === */}
      {!outcome&&<Guy x={200} y={211} jersey="#1e40af" cap="#1e3a8a"/>}

      {/* === CATCHER === */}
      {!outcome&&<Guy x={200} y={296} jersey="#1e3a5f" cap="#1a3050" mask={true}/>}

      {/* === BATTER === */}
      {!outcome&&<Guy x={214} y={277} jersey="#dc2626" cap="#1a1a2e" bat={true}/>}

      {/* === RUNNERS (away team red, golden highlight ring) === */}
      {on(1)&&<Guy x={294} y={196} jersey="#dc2626" cap="#b91c1c" ring={true}/>}
      {on(2)&&<Guy x={200} y={129} jersey="#dc2626" cap="#b91c1c" ring={true}/>}
      {on(3)&&<Guy x={106} y={196} jersey="#dc2626" cap="#b91c1c" ring={true}/>}

      {/* ============ ANIMATIONS ============ */}
      {outcome&&<circle key={ak} cx="200" cy="210" r="0" fill={outcome==="success"?"rgba(34,197,94,.18)":outcome==="warning"?"rgba(245,158,11,.12)":"rgba(239,68,68,.12)"}><animate attributeName="r" from="0" to="180" dur=".55s" fill="freeze"/><animate attributeName="opacity" from=".5" to="0" dur=".55s" fill="freeze"/></circle>}

      {anim==="steal"&&outcome==="success"&&<g key={`a${ak}`}><circle r="5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".6s" fill="freeze" path="M284,206 Q244,170 200,140"/></circle><text x="242" y="155" textAnchor="middle" fontSize="12" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.2s" fill="freeze"/>SAFE!</text></g>}
      {anim==="score"&&outcome==="success"&&<g key={`s${ak}`}><circle r="5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".5s" fill="freeze" path="M116,206 Q160,248 200,282"/></circle><text x="200" y="258" textAnchor="middle" fontSize="14" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>SAFE!</text></g>}
      {anim==="hit"&&outcome==="success"&&<g key={`h${ak}`}><circle r="3" fill="#f59e0b" filter="url(#gl)"><animateMotion dur=".45s" fill="freeze" path="M200,282 Q252,178 306,75"/></circle><text x="265" y="112" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>BASE HIT</text></g>}
      {anim==="throwHome"&&<g key={`t${ak}`}><line x1="200" y1="140" x2="200" y2="282" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" opacity="0"><animate attributeName="opacity" from=".65" to="0" dur=".9s" fill="freeze"/></line><circle r="2.5" fill="#ef4444"><animateMotion dur=".35s" fill="freeze" path="M200,140 L200,282"/></circle></g>}
      {anim==="doubleplay"&&outcome==="success"&&<g key={`dp${ak}`}><circle r="3.5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".25s" fill="freeze" path="M284,206 Q244,170 200,140"/></circle><circle r="3.5" fill="#22c55e" filter="url(#gl)"><animateMotion dur=".25s" begin=".28s" fill="freeze" path="M200,140 Q244,170 284,206"/></circle><text x="200" y="175" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.1s" fill="freeze"/>DOUBLE PLAY!</text></g>}
      {(anim==="strike"||anim==="strikeout")&&outcome==="success"&&<g key={`st${ak}`}><circle r="2.5" fill="white" opacity=".9"><animateMotion dur=".2s" fill="freeze" path="M200,218 L200,280"/></circle><text x="200" y="255" textAnchor="middle" fontSize={anim==="strikeout"?13:10} fill={anim==="strikeout"?"#ef4444":"#f59e0b"} fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>{anim==="strikeout"?"STRUCK OUT!":"STRIKE!"}</text></g>}
      {anim==="groundout"&&outcome==="success"&&<g key={`go${ak}`}><circle r="2.5" fill="white" filter="url(#gl)"><animateMotion dur=".3s" fill="freeze" path="M200,282 Q232,248 254,228"/></circle><circle r="2.5" fill="#22c55e"><animateMotion dur=".2s" begin=".32s" fill="freeze" path="M254,228 L284,206"/></circle><text x="270" y="194" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1s" fill="freeze"/>OUT!</text></g>}
      {anim==="flyout"&&outcome==="success"&&<g key={`fl${ak}`}><circle r="3" fill="white" filter="url(#gl)"><animateMotion dur=".55s" fill="freeze" path="M200,282 Q242,118 282,108"/></circle><text x="282" y="95" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1.2s" fill="freeze"/>CAUGHT!</text></g>}
      {anim==="catch"&&outcome==="success"&&<g key={`ca${ak}`}><circle r="2.5" fill="white"><animateMotion dur=".35s" fill="freeze" path="M238,92 Q216,140 192,172"/></circle><circle cx="192" cy="172" r="0" fill="rgba(34,197,94,.25)"><animate attributeName="r" from="0" to="16" dur=".25s" begin=".35s" fill="freeze"/><animate attributeName="opacity" from=".6" to="0" dur=".25s" begin=".35s" fill="freeze"/></circle><text x="192" y="162" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>GOT IT!</text></g>}
      {anim==="advance"&&outcome==="success"&&<g key={`ad${ak}`}><circle r="4.5" fill="#3b82f6" filter="url(#gl)"><animateMotion dur=".5s" fill="freeze" path="M284,206 Q244,170 200,140"/></circle><text x="244" y="160" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1s" fill="freeze"/>ADVANCING!</text></g>}
      {anim==="walk"&&outcome==="success"&&<g key={`wk${ak}`}><circle r="4.5" fill="#3b82f6"><animateMotion dur=".7s" fill="freeze" path="M200,282 Q244,248 284,206"/></circle><text x="200" y="255" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>BALL FOUR</text></g>}
      {anim==="bunt"&&outcome==="success"&&<g key={`bn${ak}`}><circle r="2" fill="white"><animateMotion dur=".5s" fill="freeze" path="M200,282 Q198,265 192,250"/></circle><text x="180" y="242" textAnchor="middle" fontSize="9" fill="#22c55e" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;0;1;1;0" dur="1s" fill="freeze"/>BUNT!</text></g>}
      {anim==="safe"&&outcome==="success"&&<g key={`sf${ak}`}><circle cx="200" cy="206" r="0" fill="none" stroke="#22c55e" strokeWidth="2.5"><animate attributeName="r" from="0" to="32" dur=".45s" fill="freeze"/><animate attributeName="opacity" from=".8" to="0" dur=".45s" fill="freeze"/></circle><text x="200" y="192" textAnchor="middle" fontSize="13" fill="#22c55e" fontWeight="900" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>SAFE!</text></g>}
      {anim==="freeze"&&outcome==="success"&&<g key={`fr${ak}`}><text x="200" y="174" textAnchor="middle" fontSize="20" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.5s" fill="freeze"/><animate attributeName="y" from="180" to="168" dur=".35s" fill="freeze"/>⚠️</text><text x="200" y="192" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="1.3s" fill="freeze"/>FREEZE!</text></g>}

      {outcome&&outcome!=="success"&&(anim==="strike"||anim==="strikeout")&&<text key={`ws${ak}`} x="200" y="258" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>BALL</text>}
      {outcome&&outcome!=="success"&&anim==="steal"&&<text key={`wo${ak}`} x="242" y="160" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>OUT!</text>}
      {outcome&&outcome!=="success"&&(anim==="hit"||anim==="groundout"||anim==="flyout")&&<text key={`wh${ak}`} x="200" y="248" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="800" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" fill="freeze"/>{anim==="flyout"?"FLY OUT":"OUT"}</text>}
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
  const[aiMode,setAiMode]=useState(false); // true when playing AI-generated scenario
  const[dailyMode,setDailyMode]=useState(false); // true when playing daily diamond challenge
  // Speed Round state
  const[speedMode,setSpeedMode]=useState(false);
  const[speedRound,setSpeedRound]=useState(null); // {round,total,results:[],startTime}
  const[timer,setTimer]=useState(15);
  const timerRef=useRef(null);
  // Survival Mode state
  const[survivalMode,setSurvivalMode]=useState(false);
  const[survivalRun,setSurvivalRun]=useState(null); // {count,pts,concepts[]}
  const snd=useSound();

  const abortRef=useRef(null);

  // Load
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(STORAGE_KEY);if(r?.value){const d=JSON.parse(r.value);setStats({...DEFAULT,...d});snd.setEnabled(d.soundOn!==false);if(d.onboarded)setScreen("home");else setScreen("onboard");} else setScreen("onboard");}catch{setScreen("onboard")}})()},[]);
  // Save
  useEffect(()=>{(async()=>{try{await window.storage.set(STORAGE_KEY,JSON.stringify(stats))}catch{}})()},[stats]);
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

  const totalSc=Object.values(SCENARIOS).reduce((s,a)=>s+a.length,0);
  const remaining=DAILY_FREE-stats.todayPlayed;
  const atLimit=remaining<=0&&!stats.isPro;
  
  const getRand=useCallback((p)=>{
    const pool=SCENARIOS[p]||[];const seen=hist[p]||[];
    const unseen=pool.filter(s=>!seen.includes(s.id));
    const avail=unseen.length>0?unseen:pool;
    const s=avail[Math.floor(Math.random()*avail.length)];
    setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-pool.length+1)}));return s;
  },[hist]);

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
    
    // Determine if we should use AI
    const pool=SCENARIOS[p]||[];const seen=hist[p]||[];
    const unseen=pool.filter(s=>!seen.includes(s.id));
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
        // AI failed — fall back to random handcrafted
        const avail=pool;const s=avail[Math.floor(Math.random()*avail.length)];
        setHist(h=>({...h,[p]:[...(h[p]||[]),s.id].slice(-pool.length+1)}));
        setSc(s);setAiMode(false);
        s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
      }
    } else {
      // Use handcrafted
      setAiMode(false);
      const s=getRand(p);setSc(s);setScreen("play");
      s.options.forEach((_,i)=>{setTimeout(()=>setRi(i),120+i*80);});
    }
  },[getRand,snd,atLimit,hist,stats]);

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
    // Speed Round bonus: +1 pt per second remaining
    let speedBonus=0;
    if(speedMode&&isOpt&&timer>0){speedBonus=timer;pts+=speedBonus;}
    setFo(cat);setAk(k=>k+1);snd.play(isOpt?'correct':rate>=55?'near':'wrong');
    const o={cat,isOpt,exp:sc.explanations[idx],bestExp:sc.explanations[sc.best],bestOpt:sc.options[sc.best],concept:sc.concept,pts,chosen:sc.options[idx],rate,anim:sc.anim,speedBonus,timeLeft:timer};
    setOd(o);
    // Track speed round result
    if(speedMode)setSpeedRound(sr=>sr?{...sr,results:[...sr.results,{isOpt,pts,speedBonus,timeLeft:timer,concept:sc.concept,pos}]}:sr);
    // Track survival run result
    if(survivalMode)setSurvivalRun(sr=>sr?{...sr,count:sr.count+1,pts:sr.pts+pts,concepts:[...sr.concepts,sc.concept]}:sr);
    const prevLvl=getLvl(stats.pts);
    setStats(p=>{
      const today=new Date().toDateString();
      const ns={...p,pts:p.pts+pts,str:isOpt?p.str+1:0,bs:Math.max(p.bs,isOpt?p.str+1:p.bs),gp:p.gp+1,co:p.co+(isOpt?1:0),
        ps:{...p.ps,[pos]:{p:(p.ps[pos]?.p||0)+1,c:(p.ps[pos]?.c||0)+(isOpt?1:0)}},
        cl:isOpt&&!p.cl?.includes(sc.concept)?[...(p.cl||[]),sc.concept]:(p.cl||[]),
        recentWrong:isOpt?(p.recentWrong||[]):[...(p.recentWrong||[]),sc.concept].slice(-5),
        todayPlayed:(p.todayDate===today?p.todayPlayed:0)+1,todayDate:today,
        sp:isOpt?(p.sp||0)+1:0,
        dailyDone:dailyMode?true:p.dailyDone,dailyDate:dailyMode?today:(p.dailyDate||today)};
      ns.achs=checkAch(ns);
      const newLvl=getLvl(ns.pts);
      if(newLvl.n!==prevLvl.n){setTimeout(()=>{setLvlUp(newLvl);snd.play('lvl')},600)}
      return ns;
    });
    if(dailyMode)setTimeout(()=>snd.play('daily'),400);
    if(speedMode){
      // Speed mode: brief feedback then auto-advance
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>speedNext(),1200)},200)},250);
    }else if(survivalMode){
      if(!isOpt){
        // Wrong answer — update best and show game over
        snd.play('elimination');
        setStats(p=>({...p,survivalBest:Math.max(p.survivalBest||0,(survivalRun?.count||0)+1)}));
        setTimeout(()=>setScreen("survivalOver"),500);
      }else{
        // Correct — brief feedback then next
        setTimeout(()=>{setScreen("outcome");setTimeout(()=>{setShowC(true);setTimeout(()=>survivalNext(),1200)},200)},250);
      }
    }else{
      setTimeout(()=>{setScreen("outcome");setTimeout(()=>setShowC(true),400);},350);
    }
  },[choice,sc,pos,snd,checkAch,stats.pts,dailyMode,speedMode,timer,speedNext,survivalMode,survivalRun,survivalNext]);

  const next=useCallback(()=>{setLvlUp(null);if(speedMode){speedNext()}else if(survivalMode){survivalNext()}else if(dailyMode){goHome()}else{startGame(pos,aiMode)}},[pos,startGame,aiMode,dailyMode,speedMode,speedNext,survivalMode,survivalNext,goHome]);
  const goHome=useCallback(()=>{setScreen("home");setPos(null);setSc(null);setChoice(null);setOd(null);setFo(null);setPanel(null);setLvlUp(null);setDailyMode(false);setSpeedMode(false);setSpeedRound(null);setSurvivalMode(false);setSurvivalRun(null);if(timerRef.current)clearTimeout(timerRef.current)},[]);
  const finishOnboard=useCallback(()=>{setStats(p=>({...p,onboarded:true,todayDate:new Date().toDateString()}));setScreen("home")},[]);
  
  const lvl=getLvl(stats.pts);const nxt=getNxt(stats.pts);
  const prog=nxt?((stats.pts-lvl.min)/(nxt.min-lvl.min))*100:100;
  const acc=stats.gp>0?Math.round((stats.co/stats.gp)*100):0;

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
    if(speedMode&&screen==="play"&&choice===null&&timer<=0){
      // Time's up — pick a random wrong answer
      const wrongIdx=sc?[0,1,2,3].filter(i=>i!==sc.best)[0]:0;
      handleChoice(wrongIdx);
    }
  },[speedMode,screen,choice,aiLoading,timer,sc,handleChoice,snd]);

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

  // Survival Mode flow
  const startSurvival=useCallback(()=>{
    if(atLimit){setPanel('limit');return;}
    snd.play('tap');
    setSurvivalMode(true);setSpeedMode(false);setDailyMode(false);setAiMode(false);
    setSurvivalRun({count:0,pts:0,concepts:[]});
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
        <div style={{textAlign:"center",animation:"su .4s ease-out"}} onClick={e=>e.stopPropagation()}>
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
          <button onClick={finishOnboard} style={{...btn("linear-gradient(135deg,#d97706,#f59e0b)"),...{boxShadow:"0 4px 15px rgba(245,158,11,.3)",maxWidth:300}}}>Let's Play! →</button>
        </div>}

        {/* HOME */}
        {screen==="home"&&<div>
          <div style={{textAlign:"center",padding:"20px 0 14px"}}>
            <div style={{fontSize:48,marginBottom:4}}>⚾</div>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:"#f59e0b",lineHeight:1,marginBottom:4}}>STRATEGY MASTER</h1>
            <p style={{color:"#6b7280",fontSize:12,maxWidth:340,margin:"0 auto"}}>{totalSc} scenarios · 5 positions · Real MLB strategy</p>
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
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>setPanel(panel==='ach'?null:'ach')} style={{flex:1,background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.12)",borderRadius:10,padding:"8px 4px",color:"#f59e0b",fontSize:11,fontWeight:600,cursor:"pointer",minHeight:40}}>🏅 {(stats.achs||[]).length}/{ACHS.length}</button>
              <button onClick={()=>setPanel(panel==='concepts'?null:'concepts')} style={{flex:1,background:"rgba(59,130,246,.05)",border:"1px solid rgba(59,130,246,.12)",borderRadius:10,padding:"8px 4px",color:"#3b82f6",fontSize:11,fontWeight:600,cursor:"pointer",minHeight:40}}>🧠 {(stats.cl?.length||0)} concepts</button>
              <button onClick={()=>setPanel(panel==='stats'?null:'stats')} style={{flex:1,background:"rgba(34,197,94,.05)",border:"1px solid rgba(34,197,94,.12)",borderRadius:10,padding:"8px 4px",color:"#22c55e",fontSize:11,fontWeight:600,cursor:"pointer",minHeight:40}}>📊 Stats</button>
              <button onClick={()=>setPanel(panel==='progress'?null:'progress')} style={{flex:1,background:"rgba(168,85,247,.05)",border:"1px solid rgba(168,85,247,.12)",borderRadius:10,padding:"8px 4px",color:"#a855f7",fontSize:11,fontWeight:600,cursor:"pointer",minHeight:40}}>📈 Map</button>
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
            </div>
          </div>}

          {/* Position grid */}
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:"#6b7280",marginBottom:6,letterSpacing:2}}>CHOOSE YOUR POSITION</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {ALL_POS.map(p=>{const m=POS_META[p];const ps=stats.ps[p];const a=ps&&ps.p>0?Math.round((ps.c/ps.p)*100):null;return(
              <div key={p} onClick={()=>startGame(p)} style={{background:m.bg,borderRadius:14,padding:"16px 12px",cursor:"pointer",transition:"all .2s",textAlign:"center",border:"2px solid transparent",position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.borderColor=`${m.color}50`}}
                onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.borderColor="transparent"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 30% 20%,rgba(255,255,255,.07),transparent 60%)"}}/>
                <div style={{position:"relative"}}>
                  <div style={{fontSize:32,marginBottom:2}}>{m.emoji}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1.5}}>{m.label.toUpperCase()}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.55)",marginTop:2}}>{m.desc}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.35)",marginTop:3}}>{SCENARIOS[p].length} scenarios</div>
                  {a!==null&&<div style={{fontSize:9,color:"rgba(255,255,255,.6)",marginTop:2}}>{a}% · {ps.p} played</div>}
                </div>
              </div>
            )})}
          </div>

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

          {/* Sound toggle */}
          <div style={{textAlign:"center",marginTop:8}}>
            <button onClick={()=>{const v=!stats.soundOn;setStats(p=>({...p,soundOn:v}));snd.setEnabled(v)}} style={{...ghost,fontSize:10}}>{stats.soundOn?"🔊 Sound On":"🔇 Sound Off"}</button>
          </div>
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
              {aiMode&&<span style={{background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.25)",borderRadius:7,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#a855f7"}}>🤖 AI</span>}
              <span style={{fontSize:9,color:DIFF_TAG[(sc.diff||1)-1].c}}>{"⭐".repeat(sc.diff||1)}</span>
              <span style={{background:`${POS_META[pos].color}15`,border:`1px solid ${POS_META[pos].color}25`,borderRadius:7,padding:"2px 7px",fontSize:10,fontWeight:700,color:POS_META[pos].color}}>{POS_META[pos].emoji} {POS_META[pos].label}</span>
            </div>
          </div>

          {/* Speed Round timer bar */}
          {speedMode&&choice===null&&<div style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
              <span style={{fontSize:9,fontWeight:700,color:timer<=5?"#ef4444":timer<=10?"#f59e0b":"#22c55e"}}>⏱ {timer}s</span>
              <span style={{fontSize:9,color:"#6b7280"}}>+{timer} speed bonus</span>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,.03)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(timer/15)*100}%`,background:timer<=5?"#ef4444":timer<=10?"#f59e0b":"#22c55e",borderRadius:2,transition:"width 1s linear"}}/>
            </div>
          </div>}

          <div style={{background:"rgba(0,0,0,.25)",borderRadius:12,padding:6,marginBottom:8,border:"1px solid rgba(255,255,255,.03)"}}>
            <Field runners={sc.situation.runners} outcome={fo} ak={ak} anim={od?.isOpt?sc.anim:null}/>
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
          <div style={{textAlign:"center",marginTop:3}}>
            <button onClick={goHome} style={ghost}>Change Position</button>
          </div>

          {/* Pro upsell (non-annoying, after outcome) */}
          {!stats.isPro&&stats.gp>5&&stats.gp%5===0&&<div style={{marginTop:12,textAlign:"center",background:"rgba(245,158,11,.03)",border:"1px solid rgba(245,158,11,.1)",borderRadius:10,padding:"8px 12px"}}>
            <div style={{fontSize:11,color:"#f59e0b",fontWeight:600}}>⭐ Enjoying the game?</div>
            <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>Go Pro for unlimited play, advanced stats & no ads</div>
          </div>}
        </div>}

        {/* SURVIVAL GAME OVER */}
        {screen==="survivalOver"&&survivalRun&&(()=>{
          const count=survivalRun.count;const best=Math.max(stats.survivalBest||0,count);const isNewBest=count>=(stats.survivalBest||0)&&count>0;
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
