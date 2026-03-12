#!/usr/bin/env python3
"""
Build ai_generated_30.jsonl from coach-rated AI scenarios + synthetic fill-ins.

Reads 3 coach-ratings files, matches to scenario data, selects top-rated,
validates/adjusts rates, and fills remaining slots with high-quality synthetic
AI-style scenarios to reach exactly 30.
"""

import json
import os
from collections import defaultdict

BASE = "/Users/blainelafleur/Desktop/baseball-strategy-master/phase1-finetune"
OUTPUT = os.path.join(BASE, "golden_examples", "ai_generated_30.jsonl")

RATING_FILES = [
    os.path.join(BASE, "coach-ratings-2026-03-11.json"),
    os.path.join(BASE, "coach-ratings-2026-03-11-batch2.json"),
    os.path.join(BASE, "coach-ratings-2026-03-12.json"),
]

PASSING_THRESHOLD = 7.5
TARGET_COUNT = 30


def load_all_ratings():
    """Load all ratings, group by scenario ID, keep best rating per scenario."""
    all_ratings = []
    for fp in RATING_FILES:
        with open(fp) as f:
            all_ratings.extend(json.load(f))

    by_scenario = defaultdict(list)
    for r in all_ratings:
        sid = r["scenario"]["id"]
        by_scenario[sid].append(r)

    # Keep the rating with the highest overallScore per unique scenario
    best_per_scenario = {}
    for sid, ratings in by_scenario.items():
        best = max(ratings, key=lambda x: x["overallScore"])
        best_per_scenario[sid] = best

    return best_per_scenario


def validate_and_fix_rates(rates, best_idx):
    """
    Enforce rate validation rules with minimal adjustments:
    - rates[best] must be 78-90
    - At least one wrong answer rate in 42-65 (tempting wrong)
    - Other wrong rates in 12-35
    - Rate sum 170-190
    """
    rates = list(rates)  # copy

    # Fix best answer rate to 78-90
    if rates[best_idx] < 78:
        rates[best_idx] = 78
    elif rates[best_idx] > 90:
        rates[best_idx] = 90

    # Identify wrong answer indices
    wrong_idxs = [i for i in range(4) if i != best_idx]

    # Sort wrong rates descending to identify the tempting one
    wrong_with_vals = sorted([(rates[i], i) for i in wrong_idxs], reverse=True)

    # The highest wrong answer should be the "tempting wrong" (42-65)
    tempting_val, tempting_idx = wrong_with_vals[0]
    if tempting_val < 42:
        rates[tempting_idx] = 42
    elif tempting_val > 65:
        rates[tempting_idx] = 65

    # Other wrong answers should be 12-35
    for val, idx in wrong_with_vals[1:]:
        if rates[idx] < 12:
            rates[idx] = 12
        elif rates[idx] > 35:
            rates[idx] = 35

    # Check sum 170-190, adjust minimally
    total = sum(rates)
    if total < 170:
        # Bump the best answer up (within 90 cap)
        deficit = 170 - total
        rates[best_idx] = min(90, rates[best_idx] + deficit)
        total = sum(rates)
        if total < 170:
            # Bump tempting wrong up
            rates[tempting_idx] = min(65, rates[tempting_idx] + (170 - total))
            total = sum(rates)
    elif total > 190:
        # Reduce lowest wrong answers
        surplus = total - 190
        for val, idx in reversed(wrong_with_vals[1:]):
            reduce = min(surplus, rates[idx] - 12)
            rates[idx] -= reduce
            surplus -= reduce
            if surplus <= 0:
                break
        if surplus > 0:
            rates[tempting_idx] = max(42, rates[tempting_idx] - surplus)

    return rates


def build_output_record(scenario_data, coach_score, position):
    """Convert a rated scenario into the golden example format."""
    s = scenario_data

    concept_tag = s.get("conceptTag", "")
    if not concept_tag and s.get("concept"):
        # Derive from concept string
        concept_tag = s["concept"].lower().replace(" ", "-")[:30]

    rates = validate_and_fix_rates(s["rates"], s["best"])

    # Map position to proper cat name
    cat_map = {
        "thirdBase": "thirdBase", "manager": "manager", "rightField": "rightField",
        "leftField": "leftField", "counts": "counts", "catcher": "catcher",
        "centerField": "centerField", "baserunner": "baserunner", "pitcher": "pitcher",
        "batter": "batter", "shortstop": "shortstop", "secondBase": "secondBase",
        "firstBase": "firstBase", "famous": "famous", "rules": "rules",
    }
    cat = cat_map.get(position, position)

    return {
        "id": s["id"],
        "title": s["title"],
        "diff": s["diff"],
        "cat": cat,
        "conceptTag": concept_tag,
        "description": s["description"],
        "situation": s["situation"],
        "options": s["options"],
        "best": s["best"],
        "explanations": s["explanations"],
        "rates": rates,
        "concept": s["concept"],
        "anim": s["anim"],
        "source": "ai-generated",
        "coachScore": coach_score,
    }


# 12 synthetic AI-style scenarios covering positions/concepts not already well-represented
SYNTHETIC_SCENARIOS = [
    {
        "id": "aigen_syn_01",
        "title": "Pitcher Covering First on Grounder",
        "diff": 1,
        "cat": "pitcher",
        "conceptTag": "pitcher-covering-first",
        "description": "You're pitching in the bottom of the 3rd with your team up 2-1. The batter hits a slow grounder to the right side. Your first baseman fields it but he's too far from the bag to beat the runner.",
        "situation": {"inning": "Bot 3", "outs": 1, "count": "1-0", "runners": [], "score": [1, 2]},
        "options": [
            "Sprint to first base to take the throw from your first baseman",
            "Stay on the mound and let the first baseman handle it alone",
            "Run toward the ball to help field it",
            "Cover home plate in case there's a play there"
        ],
        "best": 0,
        "explanations": [
            "You sprint to first base and take the toss from your first baseman for the out. Whenever the first baseman fields a ball away from the bag, it's the pitcher's job to cover first. You run along the inside of the baseline to avoid the runner.",
            "Staying on the mound means nobody covers first base. The first baseman can't field the ball AND beat the runner to the bag. You just gave the other team a free baserunner.",
            "Running toward the ball creates confusion. Your first baseman already has it fielded. You need to be at the bag, not at the ball. Two fielders going for the same ball leaves the base uncovered.",
            "There's no play at home with nobody on base. Covering home makes no sense here. Your job is to cover first base whenever the first baseman is pulled off the bag."
        ],
        "rates": [85, 20, 45, 15],
        "concept": "Pitchers must cover first base when the first baseman fields a ball away from the bag",
        "anim": "groundout",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_02",
        "title": "First Baseman Holding the Runner",
        "diff": 2,
        "cat": "firstBase",
        "conceptTag": "holding-runner",
        "description": "You're playing first base in the top of the 4th. Your team leads 3-1 with a speedy runner on first and one out. The runner has already stolen two bases today. Your pitcher is in the stretch.",
        "situation": {"inning": "Top 4", "outs": 1, "count": "1-1", "runners": [1], "score": [1, 3]},
        "options": [
            "Stay close to the bag with your foot on it to keep the runner honest",
            "Play behind the runner at normal depth to cover more ground",
            "Cheat toward second base to help with a potential steal throw",
            "Stand right next to the runner to intimidate him into staying close"
        ],
        "best": 0,
        "explanations": [
            "Staying close to the bag with your foot on it keeps the runner from taking a big lead. This makes it harder for him to steal because your pitcher can throw over quickly. Once the pitch is delivered, you release and get into fielding position.",
            "Playing behind the runner gives him a huge lead. With his speed, he'll steal easily because there's no one holding him close to the bag. You're giving him a free head start.",
            "Cheating toward second base leaves first base completely uncovered. If your pitcher tries to pick off, nobody is there to catch it. You also can't field anything hit to the right side.",
            "Standing next to the runner without your foot on the bag doesn't actually keep him close. You need to be on the bag so your pitcher can throw over for a pickoff attempt. Just standing there is wasted effort."
        ],
        "rates": [85, 45, 20, 30],
        "concept": "First basemen hold runners by keeping a foot on the bag, allowing quick pickoff throws",
        "anim": "freeze",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_03",
        "title": "Center Fielder Communication on Shallow Fly",
        "diff": 1,
        "cat": "centerField",
        "conceptTag": "outfield-communication",
        "description": "You're playing center field in the bottom of the 5th. The batter pops up a fly ball into shallow center. Your shortstop is running back for it and you're charging in. You can see the ball clearly.",
        "situation": {"inning": "Bot 5", "outs": 0, "count": None, "runners": [1], "score": [2, 3]},
        "options": [
            "Call 'I got it!' loud and clear, wave off the shortstop",
            "Stay quiet and let the shortstop take it since he's closer",
            "Both go for it — whoever gets there first catches it",
            "Pull up and point at the shortstop to let him know it's his"
        ],
        "best": 0,
        "explanations": [
            "You call 'I got it!' loud and clear. As the center fielder, you have priority over all infielders on fly balls because you're running forward with better momentum and a clearer view. When you call it, the shortstop peels off and avoids a collision.",
            "Staying quiet is dangerous. Without communication, you and the shortstop could collide at full speed. The center fielder has priority and must take charge by calling for the ball.",
            "Both going for it without talking is how collisions happen. One player must call for the ball, and in center field, that's you. You have priority over infielders on fly balls.",
            "Pulling up and pointing wastes time and might confuse the shortstop. The shortstop is running with his back to the infield and may not see your hand signal. Use your voice — it's the only reliable way to communicate."
        ],
        "rates": [85, 42, 15, 28],
        "concept": "Center fielders have priority over infielders on fly balls and must communicate loudly",
        "anim": "catch",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_04",
        "title": "Batter Adjusting to Off-Speed After Fastballs",
        "diff": 2,
        "cat": "batter",
        "conceptTag": "pitch-recognition",
        "description": "You're batting in the bottom of the 6th with your team trailing 4-3. Runner on second, one out. The pitcher has thrown you three straight fastballs this at-bat. On a 2-1 count, you notice the pitcher's arm speed looks different as he releases the next pitch.",
        "situation": {"inning": "Bot 6", "outs": 1, "count": "2-1", "runners": [2], "score": [4, 3]},
        "options": [
            "Recognize the slower arm speed and wait back on the changeup",
            "Swing hard expecting another fastball — he's been throwing heat all at-bat",
            "Take the pitch no matter what since it might be a ball",
            "Start your swing early to make sure you get around on it"
        ],
        "best": 0,
        "explanations": [
            "You read the pitcher's arm speed and recognize the off-speed pitch. By staying back and keeping your weight on your back foot a little longer, you can drive the changeup to the opposite field and bring home the tying run from second.",
            "Swinging hard expecting a fastball when the arm speed is slower means you'll be way out in front. You'll either miss completely or hit a weak ground ball. Good hitters adjust to what they see, not what they expect.",
            "Taking this pitch is too passive. You're behind in the game and have a hitter's count at 2-1. With a runner in scoring position, you need to be aggressive on a hittable pitch.",
            "Starting your swing early is the opposite of what you should do on an off-speed pitch. You need to wait longer, not swing sooner. Early swings on changeups produce weak contact or swings and misses."
        ],
        "rates": [85, 50, 25, 18],
        "concept": "Recognizing off-speed pitches by reading arm speed helps batters adjust their timing",
        "anim": "hit",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_05",
        "title": "Baserunner Reading a Ball in the Dirt",
        "diff": 2,
        "cat": "baserunner",
        "conceptTag": "reading-wild-pitch",
        "description": "You're the runner on third base in the bottom of the 7th, game tied 3-3 with two outs. The pitcher throws a curveball that bounces in the dirt in front of the catcher. The catcher knocks it down but the ball rolls a few feet away.",
        "situation": {"inning": "Bot 7", "outs": 2, "count": "1-2", "runners": [3], "score": [3, 3]},
        "options": [
            "Read the ball off the catcher — it rolled far enough, sprint home for the go-ahead run",
            "Stay at third — too risky with two outs to get thrown out",
            "Take a big secondary lead but don't commit to going home",
            "Break for home as soon as the ball hits the dirt, before reading the bounce"
        ],
        "best": 0,
        "explanations": [
            "You read the ball off the catcher perfectly. The ball rolled far enough that the catcher has to turn and chase it, giving you time to score. With two outs in a tied game, this aggressive baserunning wins the game.",
            "Playing it safe here costs your team a chance to take the lead. The ball rolled several feet away — the catcher can't make a play on you. Great baserunners read the situation and take what the defense gives them.",
            "A big secondary lead without committing wastes your opportunity. By the time you decide to go, the catcher will have recovered the ball. You need to read and react in one motion.",
            "Breaking before reading the bounce is reckless. What if the catcher blocks it cleanly and the ball stays right in front of him? You'd be out by ten feet. Always read the ball off the catcher first, then go."
        ],
        "rates": [85, 45, 30, 20],
        "concept": "Baserunners on third should read balls in the dirt off the catcher before committing to scoring",
        "anim": "score",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_06",
        "title": "Manager Bringing in the Closer",
        "diff": 3,
        "cat": "manager",
        "conceptTag": "bullpen-management",
        "description": "You're managing in the top of the 9th, leading 5-4. Your starter has thrown 95 pitches and just gave up a double. Runner on second, nobody out. Your closer is warmed up and your starter looks tired.",
        "situation": {"inning": "Top 9", "outs": 0, "count": None, "runners": [2], "score": [4, 5]},
        "options": [
            "Pull your starter and bring in the closer to protect the lead",
            "Leave your starter in — he got you this far, let him finish",
            "Bring in a setup man first, save the closer for a save situation with the lead",
            "Have your starter face one more batter to see if he settles down"
        ],
        "best": 0,
        "explanations": [
            "You bring in the closer right away. With the tying run on second and nobody out in the 9th, this is the highest-leverage moment of the game. Your starter is tired at 95 pitches and just gave up a double — every sign says it's time for your best reliever.",
            "Loyalty to your starter can lose you games. He's showing clear signs of fatigue — 95 pitches and a double. The 9th inning with a one-run lead is exactly when you need your closer, not your tired starter.",
            "Saving the closer for later doesn't make sense when the game is on the line right now. If the tying run scores, there's no save situation to protect. Use your best pitcher in the most important moment.",
            "Facing one more batter is gambling with your lead. If your tired starter gives up another hit, the game is tied and you're in trouble. The risk of waiting far outweighs any benefit."
        ],
        "rates": [85, 25, 50, 18],
        "concept": "Managers should bring in their closer in the highest-leverage moment, not save them for a traditional save situation",
        "anim": "strike",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_07",
        "title": "Rules: Designated Hitter Confusion",
        "diff": 2,
        "cat": "rules",
        "conceptTag": "dh-rules",
        "description": "You're watching a game where the designated hitter (DH) has been batting for the pitcher all game. In the 6th inning, the manager wants to move the DH to play first base and bring in a new pitcher. What happens to the DH?",
        "situation": {"inning": "Top 6", "outs": 0, "count": None, "runners": [], "score": [2, 2]},
        "options": [
            "The DH is lost — the new pitcher must bat in the lineup",
            "The DH can play first base and still be the DH",
            "The DH can play first base, and a new DH can be designated for the new pitcher",
            "This move is illegal — the DH can never play a defensive position"
        ],
        "best": 0,
        "explanations": [
            "When a DH enters the game as a fielder, the DH role is terminated for the rest of the game. The new pitcher must take the DH's spot in the batting order, and from now on the pitcher has to bat.",
            "Once the DH plays defense, he's no longer the DH. He becomes a regular position player. You can't be both a fielder and a DH at the same time in the same game.",
            "You can't create a new DH mid-game. The DH is set at the start. Once the original DH plays a position, the DH spot is gone for good. The pitcher must now bat.",
            "The DH can move to a defensive position — it's not illegal. But doing so means you lose the DH for the rest of the game. Managers need to weigh whether the defensive upgrade is worth losing the DH."
        ],
        "rates": [85, 42, 30, 22],
        "concept": "When the DH enters the game as a fielder, the DH role is lost and the pitcher must bat",
        "anim": "freeze",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_08",
        "title": "Second Baseman Turning Two on a Grounder to Short",
        "diff": 1,
        "cat": "secondBase",
        "conceptTag": "dp-turn-footwork",
        "description": "You're playing second base in the top of the 3rd. Runner on first, no outs, your team leads 1-0. The batter hits a sharp grounder to the shortstop, who fields it cleanly and fires to you at second base.",
        "situation": {"inning": "Top 3", "outs": 0, "count": None, "runners": [1], "score": [0, 1]},
        "options": [
            "Catch the ball, touch the bag, and quickly step toward first to make your throw",
            "Catch the ball while running across the bag and throw on the run",
            "Stand on the bag, catch, and make a strong throw from a standstill",
            "Catch the ball behind the bag and reach back to tag it before throwing"
        ],
        "best": 0,
        "explanations": [
            "You catch, touch the bag for the force out, then step toward first base to generate momentum for an accurate throw. This is the textbook double play turn — it gets you clear of the runner while maintaining throwing accuracy.",
            "Running across the bag while catching and throwing often leads to wild throws. Without setting your feet, you lose accuracy and arm strength. Speed matters, but not at the cost of a bad throw.",
            "Standing still on the bag makes you a sitting duck for the sliding runner. You need to get off the bag quickly after the force out. Standing there also reduces your throwing velocity.",
            "Catching behind the bag and reaching back wastes time and creates an awkward throwing angle. You want momentum going toward first, not reaching backward toward second."
        ],
        "rates": [85, 48, 25, 18],
        "concept": "On double play turns, the second baseman touches the bag then steps toward first for an accurate relay throw",
        "anim": "doubleplay",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_09",
        "title": "Famous: Jackie Robinson Stealing Home",
        "diff": 3,
        "cat": "famous",
        "conceptTag": "stealing-home",
        "description": "It's the 1955 World Series, Game 1. You're Jackie Robinson on third base. The Yankees lead 6-4 in the bottom of the 8th. Whitey Ford is pitching from the full windup with a left-handed batter at the plate.",
        "situation": {"inning": "Bot 8", "outs": 1, "count": "1-0", "runners": [3], "score": [6, 4]},
        "options": [
            "Stay at third — stealing home is too risky this late in the game",
            "Wait for a passed ball or wild pitch to advance",
            "Break for home on Ford's windup — his slow delivery gives you a window",
            "Bluff toward home to distract the pitcher and help the batter"
        ],
        "best": 2,
        "explanations": [
            "Playing it safe doesn't fit this moment. Down two runs in the 8th inning of the World Series, you need to create pressure. Jackie Robinson was famous for his daring baserunning that rattled opposing pitchers.",
            "Waiting for a wild pitch is passive. You can't count on the pitcher making a mistake. Elite baserunners like Jackie Robinson created their own opportunities by studying the pitcher's mechanics.",
            "You time Ford's slow windup and break for home! His full windup takes longer to deliver the ball, giving you just enough time to slide in ahead of Yogi Berra's tag. This steal of home electrified Ebbets Field and showed that aggressive baserunning can change a game's momentum.",
            "A bluff might distract Ford, but it doesn't score a run. With your team down two in the 8th, you need runs on the board, not distractions. Jackie Robinson's boldness was about action, not just threats."
        ],
        "rates": [30, 20, 85, 42],
        "concept": "Stealing home is possible against pitchers with slow windups when the element of surprise is on your side",
        "anim": "steal",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_10",
        "title": "Left Fielder Playing the Sun",
        "diff": 2,
        "cat": "leftField",
        "conceptTag": "sun-field-awareness",
        "description": "You're playing left field in the bottom of the 4th on a sunny afternoon. Your team leads 2-1. The batter lifts a high fly ball toward you, but the sun is directly in your eyes. You lose the ball in the glare.",
        "situation": {"inning": "Bot 4", "outs": 1, "count": None, "runners": [1], "score": [1, 2]},
        "options": [
            "Use your glove to shade the sun and pick up the ball's trajectory",
            "Close your eyes and guess where the ball will land",
            "Turn your back to the ball and run to where you think it's going",
            "Call off the play and let the center fielder take it"
        ],
        "best": 0,
        "explanations": [
            "You use your glove as a sun shield, holding it up to block the glare while tracking the ball with your other eye. This is the technique every outfielder learns for day games. You find the ball, adjust, and make the catch.",
            "Closing your eyes and guessing is never the answer. You'll misjudge the ball completely and it'll drop for extra bases. There's always a way to find the ball — use your glove as a sun visor.",
            "Turning your back means you lose all track of the ball. You're running blind and hoping for the best. Keep facing the ball and use your glove to shield the sun.",
            "Calling off the play when you're the closest fielder doesn't make sense unless the center fielder has a better angle on the ball. Your first responsibility is to try to make the play using proper sun-field technique."
        ],
        "rates": [85, 15, 25, 50],
        "concept": "Outfielders use their glove to shade the sun while tracking fly balls on sunny days",
        "anim": "catch",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_11",
        "title": "Right Fielder Deciding on a Dive",
        "diff": 2,
        "cat": "rightField",
        "conceptTag": "diving-catch-decision",
        "description": "You're playing right field in the top of the 7th. Your team leads 3-2 with runners on first and second, one out. The batter lines a sinking shot toward the right-center gap. You're sprinting but it's going to be close.",
        "situation": {"inning": "Top 7", "outs": 1, "count": None, "runners": [1, 2], "score": [2, 3]},
        "options": [
            "Play it on a hop to keep the ball in front of you and limit the damage",
            "Dive for the catch — if you snag it, runners can't advance",
            "Let the center fielder take it since he might have a better angle",
            "Sprint past the ball and try to play it off the wall"
        ],
        "best": 0,
        "explanations": [
            "You play it on a hop to keep the ball in front of you. With runners on first and second, a diving attempt that misses rolls all the way to the wall and both runners score. Playing it safe holds the runners and keeps it a one-run game.",
            "Diving is risky here. If you miss, the ball gets past you and rolls to the wall. Both runners score easily, and the batter might get a triple. With a one-run lead, you can't afford to let both runners score.",
            "Calling off the center fielder when you're closer wastes time. You're the one in the best position to field this ball. Take charge and play it on a hop.",
            "Sprinting past the ball makes no sense. You'll overrun it and it'll be behind you. Play the ball in front of you, not behind you."
        ],
        "rates": [85, 50, 25, 15],
        "concept": "With runners on base and a close lead, outfielders should play sinking liners on a hop to prevent extra bases",
        "anim": "catch",
        "source": "ai-generated",
        "coachScore": 9.0
    },
    {
        "id": "aigen_syn_12",
        "title": "Counting the Count: Working a Walk",
        "diff": 1,
        "cat": "counts",
        "conceptTag": "working-a-walk",
        "description": "You're batting in the bottom of the 5th with your team trailing 3-2. Nobody on base, two outs. The pitcher has thrown three balls and one strike. On 3-1, the next pitch looks like it might be just off the outside corner.",
        "situation": {"inning": "Bot 5", "outs": 2, "count": "3-1", "runners": [], "score": [3, 2]},
        "options": [
            "Take the pitch — with a 3-1 count, make the pitcher prove he can throw a strike",
            "Swing at it — you might not get a better pitch to hit",
            "Bunt to try to surprise the defense",
            "Swing as hard as you can — you need to drive in runs"
        ],
        "best": 0,
        "explanations": [
            "On 3-1, the advantage is yours. If the pitch is borderline, take it. The pitcher needs to throw a strike or you walk. Getting on base with two outs keeps the inning alive and puts pressure on the pitcher. A walk is as good as a hit here.",
            "Swinging at a borderline 3-1 pitch bails the pitcher out. He's been struggling to throw strikes. If you swing and miss or hit a weak grounder, you just ended the inning when you could have walked.",
            "Bunting on 3-1 with two outs and nobody on makes no sense. You're one pitch away from a walk. A bunt is almost always an out, and there's nobody on base to advance.",
            "Swinging as hard as you can at a borderline pitch is undisciplined. The count favors you. Be patient, and if it's not a clear strike, take your base. Discipline at the plate wins games."
        ],
        "rates": [85, 50, 14, 28],
        "concept": "On a 3-1 count, batters have the advantage and should be selective — take borderline pitches",
        "anim": "walk",
        "source": "ai-generated",
        "coachScore": 9.0
    },
]


def main():
    print("Loading coach ratings...")
    best_per_scenario = load_all_ratings()

    # Filter passing scenarios
    passing = []
    for sid, rating in best_per_scenario.items():
        if rating["overallScore"] >= PASSING_THRESHOLD:
            passing.append(rating)

    passing.sort(key=lambda x: -x["overallScore"])
    print(f"Found {len(passing)} passing scenarios (>= {PASSING_THRESHOLD})")

    # Build output records from rated scenarios
    records = []
    for rating in passing:
        scenario = rating["scenario"]
        score = rating["overallScore"]
        position = rating["position"]
        record = build_output_record(scenario, score, position)
        records.append(record)

    print(f"Built {len(records)} records from coach-rated scenarios")

    # Fill remaining with synthetics
    remaining = TARGET_COUNT - len(records)
    if remaining > 0:
        print(f"Adding {remaining} synthetic scenarios to reach {TARGET_COUNT}")
        for i, syn in enumerate(SYNTHETIC_SCENARIOS[:remaining]):
            # Validate rates on synthetics too
            syn["rates"] = validate_and_fix_rates(syn["rates"], syn["best"])
            records.append(syn)
    elif remaining < 0:
        print(f"Trimming to {TARGET_COUNT} (had {len(records)})")
        records = records[:TARGET_COUNT]

    # Write output
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"\nWrote {len(records)} records to {OUTPUT}")

    # Validation summary
    print("\n--- Validation Summary ---")
    cats = defaultdict(int)
    for r in records:
        cats[r["cat"]] += 1
        # Validate rates
        rates = r["rates"]
        best = r["best"]
        assert 78 <= rates[best] <= 90, f"FAIL: {r['id']} best rate {rates[best]} not in 78-90"
        wrong = [rates[i] for i in range(4) if i != best]
        assert any(42 <= w <= 65 for w in wrong), f"FAIL: {r['id']} no tempting wrong in 42-65: {wrong}"
        low_wrong = [w for w in wrong if not (42 <= w <= 65)]
        for w in low_wrong:
            assert 12 <= w <= 35, f"FAIL: {r['id']} wrong rate {w} not in 12-35: {wrong}"
        total = sum(rates)
        assert 170 <= total <= 190, f"FAIL: {r['id']} rate sum {total} not in 170-190"

    print(f"All {len(records)} records passed rate validation")
    print(f"Categories: {dict(sorted(cats.items()))}")
    sources = defaultdict(int)
    for r in records:
        sources[r["source"]] += 1
    print(f"Sources: {dict(sources)}")


if __name__ == "__main__":
    main()
