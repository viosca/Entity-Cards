#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT_DIR = path.resolve(__dirname, "..");
const LIB_PATH = path.join(ROOT_DIR, "src", "library.js");

console.log("==================================================================");
console.log("  TEST SUITE: Auto-Cards / Entity-Cards Standalone Lifecycle");
console.log("  Target: " + LIB_PATH);
console.log("==================================================================");

function createMockAIDContext(initialCards = []) {
    const cards = [...initialCards];
    const logged = [];
    const sandbox = {
        log: (...args) => {
            logged.push(args.join(" "));
            console.log("   [AID LOG]:", ...args);
        },
        console: { log: (...args) => console.log("   [CONSOLE]:", ...args), error: console.error },
        Math, String, Array, Object, Number, RegExp, Set, Map, JSON,
        parseInt, parseFloat, isNaN, isFinite, Date,
        text: "",
        stop: false,
        history: [
            { text: "Karane said, \"Hakari's probably in the classroom.\"", type: "say" },
            { text: "Hakari stepped into the room and greeted Karane.", type: "story" }
        ],
        storyCards: cards,
        info: {
            maxChars: 64000,
            actionCount: 2,
            useCacheEfficient: false,
            storyModel: { name: "DeepSeek", version: "v3" }
        },
        state: {},
        addStoryCard(...args) {
            let card = (args.length === 1)
                ? { title: args[0], entry: "", keys: "", type: "class", description: "" }
                : { keys: args[0], entry: args[1], type: args[2], title: args[3], description: args[4] };
            cards.push(card);
            return card;
        },
        removeStoryCard(index) {
            cards.splice(index, 1);
        }
    };
    sandbox.globalThis = sandbox;
    return { sandbox, ctx: vm.createContext(sandbox), logged };
}

// 1. Script evaluation & AMS registration
const code = fs.readFileSync(LIB_PATH, "utf8");
const { sandbox } = createMockAIDContext();

vm.runInContext(code, vm.createContext(sandbox));
console.log("   ✔ Script parsed and evaluated cleanly");

assert.strictEqual(typeof sandbox.AutoCards, "function", "AutoCards must be exported");
assert.strictEqual(typeof sandbox.EntityCards, "function", "EntityCards must be exported");
console.log("   ✔ Global exports (AutoCards, EntityCards) verified");

// Check AMS module registration
const mod = sandbox.AID_MODULES?.["entity-cards"];
assert(mod, "AID_MODULES['entity-cards'] must be registered");
assert.strictEqual(mod.name, "EntityCards");
assert.strictEqual(typeof mod.version, "string");
assert.strictEqual(typeof mod.diag, "function");
console.log(`   ✔ AMS registration verified: ${mod.diag()}`);

// Helper to strip internal zero-width cross-slot handshake tokens
const clean = (s) => (typeof s === "string" ? s.replace(/\u200D\u200B\u200C\u200B\u200D/g, "") : s);

// 2. /ec -v / --version
{
    const promptIn = "/ec -v";
    const promptOut = sandbox.AutoCards("input", promptIn);
    assert.strictEqual(clean(promptOut), promptIn, "/ec -v must preserve user prompt on input");
    const storyOut = sandbox.AutoCards("output", "");
    assert(storyOut.includes("/EC version ->"), "Expected version response for /ec -v on output");
    assert(storyOut.includes("Parser: AID-Getopt") || storyOut.includes("Parser: GetoptAID"), "Expected parser reference in version");
    console.log("   ✔ /ec -v preserves prompt on input and delivers version via output hook");

    const promptLong = "/ec --version";
    const promptOutLong = sandbox.AutoCards("input", promptLong);
    assert.strictEqual(clean(promptOutLong), promptLong, "/ec --version must preserve user prompt on input");
    const storyOutLong = sandbox.AutoCards("output", "");
    assert(storyOutLong.includes("/EC version ->"), "Expected version response for /ec --version on output");
    console.log("   ✔ /ec --version long flag preserved on input and delivered on output");
}

// 3. /ec -h / --help
{
    const promptIn = "/ec -h";
    const promptOut = sandbox.AutoCards("input", promptIn);
    assert.strictEqual(clean(promptOut), promptIn, "/ec -h must preserve user prompt on input");
    const storyOut = sandbox.AutoCards("output", "");
    assert(storyOut.includes("/EC help -> Entity Cards Commands:"), "Expected help manual on output");
    console.log("   ✔ /ec -h preserves prompt on input and delivers command manual via output hook");
}

// 4. /ec -i / --info
{
    const promptIn = "/ec -i";
    const promptOut = sandbox.AutoCards("input", promptIn);
    assert.strictEqual(clean(promptOut), promptIn, "/ec -i must preserve user prompt on input");
    const storyOut = sandbox.AutoCards("output", "");
    assert(storyOut.includes("/EC info ->"), "Expected system diagnostics header on output");
    assert(storyOut.includes("Total Cards:"), "Expected card count stats on output");
    console.log("   ✔ /ec -i preserves prompt on input and delivers diagnostics via output hook");
}

// 5. Preset switching: /ec -P lite & /ec -P standard
{
    const promptLite = "/ec -P lite";
    const promptOutLite = sandbox.AutoCards("input", promptLite);
    assert.strictEqual(clean(promptOutLite), promptLite, "/ec -P lite must preserve user prompt on input");
    const storyOutLite = sandbox.AutoCards("output", "");
    assert(storyOutLite.includes("/EC preset -> Set to Lite"), "Expected preset switch to Lite on output");
    console.log("   ✔ /ec -P lite preserves prompt and delivers preset status via output hook");

    const promptStd = "/ec -P standard";
    const promptOutStd = sandbox.AutoCards("input", promptStd);
    assert.strictEqual(clean(promptOutStd), promptStd, "/ec -P standard must preserve user prompt on input");
    const storyOutStd = sandbox.AutoCards("output", "");
    assert(storyOutStd.includes("/EC preset -> Set to Standard"), "Expected preset switch to Standard on output");
    console.log("   ✔ /ec -P standard preserves prompt and delivers status via output hook");
}

// 6. Entity type flag parsing & single-branch optimization: /ec Molly -p
{
    // Default: old behavior (prompt rewritten with card generation request)
    const out = sandbox.AutoCards("input", "/ec Molly -p");
    assert(out.includes("/EC {Molly} [-person] -> Success!"), "Expected card generation for Molly [-person] (default old behavior)");
    console.log("   ✔ /ec Molly -p rewrites prompt by default (backward compatible)");

    // Configurable: new way (preserves prompt if cleanPromptOnCardGen: true)
    sandbox.state.AutoCards.config.cleanPromptOnCardGen = true;
    const cleanIn = "/ec Molly -p";
    const cleanOut = sandbox.AutoCards("input", cleanIn);
    assert.strictEqual(clean(cleanOut), cleanIn, "Expected clean prompt preservation when cleanPromptOnCardGen is true");
    sandbox.state.AutoCards.config.cleanPromptOnCardGen = false; // restore default
    console.log("   ✔ cleanPromptOnCardGen config option cleanly preserves prompt during manual card generation");
}

// 6b. Abort / Cancel commands (/ec -a, /ec --abort, /ec cancel)
{
    // Clean state to ensure idle
    sandbox.state.AutoCards.generation.pending = [];
    sandbox.state.AutoCards.generation.workpiece = {};
    sandbox.state.AutoCards.generation.completed = 0;
    sandbox.state.AutoCards.generation.lastConstructed = null;

    // Idle state abort
    const abortIn = "/ec -a";
    const abortOut = sandbox.AutoCards("input", abortIn);
    assert.strictEqual(clean(abortOut), abortIn, "/ec -a must preserve user prompt on input");
    const storyAbortIdle = sandbox.AutoCards("output", "");
    assert(storyAbortIdle.includes("/EC abort -> No card generation or compression is currently in progress."), "Expected idle abort message");
    console.log("   ✔ /ec -a in idle state cleanly reports no generation in progress");

    // In-progress card generation abort
    sandbox.state.AutoCards.generation.workpiece = {
        title: "Thorin",
        explicitType: "Person",
        entry: "ENTITY_BEGIN\nentity: Thorin\ntype: Person\nrole: Blacksmith\n",
        limit: 1200
    };
    sandbox.state.AutoCards.generation.completed = 2;
    const cancelIn = "/ec cancel";
    const cancelOut = sandbox.AutoCards("input", cancelIn);
    assert.strictEqual(clean(cancelOut), cancelIn, "/ec cancel must preserve user prompt on input");
    const storyCancelActive = sandbox.AutoCards("output", "");
    assert(storyCancelActive.includes('/EC abort -> Card generation for "Thorin" was aborted.'), "Expected active abort message for Thorin");
    assert.strictEqual(Object.keys(sandbox.state.AutoCards.generation.workpiece).length, 0, "Workpiece must be cleared after abort");
    assert.strictEqual(sandbox.state.AutoCards.generation.completed, 0, "Completed counter must reset to 0");
    console.log("   ✔ /ec cancel cleanly aborts active card workpiece and resets counters");

    // Option B: Notice after 100% completion
    sandbox.state.AutoCards.generation.lastConstructed = { title: "Thorin", turn: 5 };
    const cancelDoneIn = "/ec --abort";
    const cancelDoneOut = sandbox.AutoCards("input", cancelDoneIn);
    assert.strictEqual(clean(cancelDoneOut), cancelDoneIn, "/ec --abort must preserve prompt on input");
    const storyCancelDone = sandbox.AutoCards("output", "");
    assert(storyCancelDone.includes('already completed (100%) and was added to your Story Cards'), "Expected 100% completion notice");
    sandbox.state.AutoCards.generation.lastConstructed = null;
    console.log("   ✔ /ec --abort provides informative notice if card already completed (Option B)");
}

// 6c. Progress display: Card Title, Entity Type & Toast mode
{
    sandbox.state.AutoCards.config.doAC = true;
    // Active workpiece for progress formatting
    sandbox.state.AutoCards.generation.workpiece = {
        title: "Thorin",
        explicitType: "Person",
        entry: "ENTITY_BEGIN\nentity: Thorin\n",
        limit: 1200
    };
    sandbox.state.AutoCards.generation.completed = 1;
    sandbox.state.AutoCards.generation.permitted = 4;
    sandbox.state.AutoCards.config.progressDisplay = "story";

    // Default 'story' mode: includes title and entity type
    sandbox.text = "role: Blacksmith\n";
    const progStory = sandbox.AutoCards("output", "role: Blacksmith\n");
    assert(progStory.includes('Generating "Thorin" [Person]: please select "continue"'), "Progress message must include card title and type");
    console.log("   ✔ postOutputMessage displays active card title and entity type in progress prompt");

    // Configurable 'toast' mode: updates state.message overlay
    sandbox.state.AutoCards.config.progressDisplay = "toast";
    sandbox.state.AutoCards.generation.workpiece = {
        title: "Thorin",
        explicitType: "Person",
        entry: "ENTITY_BEGIN\nentity: Thorin\n",
        limit: 1200
    };
    sandbox.state.AutoCards.generation.completed = 1;
    sandbox.state.AutoCards.generation.permitted = 4;

    sandbox.text = "appearance: Muscular\n";
    const progToast = sandbox.AutoCards("output", "appearance: Muscular\n");
    assert.strictEqual(progToast.trim(), "", "Toast mode must suppress story line output");
    assert(sandbox.state.message.includes('[Entity-Cards] Generating "Thorin" [Person]: Progress:'), "Toast mode must update state.message in place");
    console.log("   ✔ progressDisplay: toast cleanly updates state.message without consuming story display lines");

    // 100% completion in story mode: announces card creation and allows player next action
    sandbox.state.AutoCards.config.progressDisplay = "story";
    sandbox.state.AutoCards.generation.workpiece = {
        title: "Thorin",
        type: "Person",
        explicitType: "Person",
        entry: "ENTITY_BEGIN\nentity: Thorin\nrole: Blacksmith\npersonality: Loyal\nDescription: A master blacksmith.\nENTITY_END\n",
        limit: 1200
    };
    sandbox.state.AutoCards.generation.completed = 2;
    sandbox.text = "Description: A master blacksmith.\nENTITY_END\n";
    const progDoneStory = sandbox.AutoCards("output", sandbox.text);
    assert(progDoneStory.includes('Generated "Thorin" [Person] (100%): Card added to Story Cards!'), "100% completion must announce card creation");
    assert(progDoneStory.includes('You may now take your next action (Do, Say, Story)'), "100% completion must invite user to take next action instead of saying please select continue");
    console.log("   ✔ 100% completion in story mode announces card added to Story Cards and prompts for next action");

    // 100% completion in toast mode
    sandbox.state.AutoCards.config.progressDisplay = "toast";
    sandbox.state.AutoCards.generation.workpiece = {
        title: "Thorin",
        type: "Person",
        explicitType: "Person",
        entry: "ENTITY_BEGIN\nentity: Thorin\nrole: Blacksmith\npersonality: Loyal\nDescription: A master blacksmith.\nENTITY_END\n",
        limit: 1200
    };
    sandbox.state.AutoCards.generation.completed = 2;
    sandbox.text = "Description: A master blacksmith.\nENTITY_END\n";
    const progDoneToast = sandbox.AutoCards("output", sandbox.text);
    assert.strictEqual(progDoneToast.trim(), "", "Toast mode on 100% must suppress story line output");
    assert(sandbox.state.message.includes('Generated "Thorin" [Person] (100%): Card added to Story Cards!'), "Toast mode on 100% must update state.message with completion notice");
    console.log("   ✔ 100% completion in toast mode updates state.message with completion notice");

    sandbox.state.AutoCards.config.progressDisplay = "story"; // restore default
    sandbox.state.AutoCards.config.doAC = false; // restore default
    sandbox.state.AutoCards.generation.workpiece = {}; // clean up
    sandbox.state.AutoCards.generation.completed = 0;
}

// 7. Protected bareword titles: /ec "Info" -org
{
    const out = sandbox.AutoCards("input", '/ec "Info" -org');
    assert(out.includes("/EC {Info} [-organization] -> Success!"), "Expected quoted Info as title");
    console.log("   ✔ Quoted title protection (/ec \"Info\" -org) avoids flag collisions");
}

// 8. Dialogue unwrapping: Say & Do modes
{
    const sayIn = 'You say, "/ec -v"';
    const outSay = sandbox.AutoCards("input", sayIn);
    assert.strictEqual(clean(outSay), sayIn, "Say mode must preserve prompt on input");
    const storySay = sandbox.AutoCards("output", "");
    assert(storySay.includes("/EC version ->"), "Expected Say-mode version output");
    console.log("   ✔ Say mode preserved on input and delivered on output");

    const doIn = "> You /ec -P lite.";
    const outDo = sandbox.AutoCards("input", doIn);
    assert.strictEqual(clean(outDo), doIn, "Do mode must preserve prompt on input");
    const storyDo = sandbox.AutoCards("output", "");
    assert(storyDo.includes("/EC preset -> Set to Lite"), "Expected Do-mode preset output");
    console.log("   ✔ Do mode preserved on input and delivered on output");
}

// 9. Narrative text passthrough
{
    const story = "The cold mountain wind howled across the crags of the pass.";
    const outStory = sandbox.AutoCards("input", story);
    assert.strictEqual(outStory, story, "Narrative story text must pass through untouched");
    console.log("   ✔ Normal story text cleanly passes through input hook");
}

// 10. Context & Output hooks
{
    const [ctxText, stop] = sandbox.AutoCards("context", "Some context prose", false);
    assert.strictEqual(typeof ctxText, "string");
    assert.strictEqual(typeof stop, "boolean");
    console.log("   ✔ Context hook executed cleanly: AutoCards('context', text, stop)");

    const outText = sandbox.AutoCards("output", "Story continuation output");
    assert.strictEqual(typeof outText, "string");
    console.log("   ✔ Output hook executed cleanly: AutoCards('output', text)");
}

// 11. Specific Card Generation Rejection Diagnostics
{
    // Clean state
    sandbox.state.AutoCards.generation.workpiece = {};
    sandbox.state.AutoCards.generation.pending = [];

    // 11a. Rejection when title is too short
    const shortOut = sandbox.AutoCards("input", "/ec a -p");
    assert(shortOut.includes('"a" is too short (minimum 2 characters)'), "Expected 'too short' diagnostic message");
    console.log("   ✔ Specific diagnostic: Title too short accurately identified");

    // 11b. Rejection when actively generating in workpiece
    sandbox.state.AutoCards.generation.workpiece = { title: "Elrond", steps: [] };
    const activeOut = sandbox.AutoCards("input", "/ec Elrond -p");
    assert(activeOut.includes('Card generation for "Elrond" is already in progress'), "Expected 'already in progress' diagnostic message");
    console.log("   ✔ Specific diagnostic: Workpiece in progress accurately identified");
    sandbox.state.AutoCards.generation.workpiece = {};

    // 11c. Rejection when queued in pending list
    sandbox.state.AutoCards.generation.pending = [{ title: "Galadriel" }];
    const pendingOut = sandbox.AutoCards("input", "/ec Galadriel -p");
    assert(pendingOut.includes('"Galadriel" is already queued in pending generation'), "Expected 'already queued' diagnostic message");
    console.log("   ✔ Specific diagnostic: Queued card in pending list accurately identified");
    sandbox.state.AutoCards.generation.pending = [];

    // 11d. Rejection when trigger key is claimed by an existing card (the "brenner" scenario)
    sandbox.storyCards = [
        {
            title: "Dr. Martin Brenner",
            keys: "brenner, dr brenner, papa",
            entry: "Director of Hawkins National Laboratory.",
            type: "character"
        }
    ];
    // Force refresh used titles
    sandbox.AutoCards().API.getUsedTitles();
    const brennerOut = sandbox.AutoCards("input", "/ec -p brenner");
    assert(brennerOut.includes('"brenner" is already used as a trigger key in Story Card "Dr. Martin Brenner"'), "Expected specific trigger key collision diagnostic for brenner");
    console.log("   ✔ Specific diagnostic: Trigger key collision on existing card accurately identified");

    // 11e. Rejection when exact Story Card title already exists
    const existingOut = sandbox.AutoCards("input", '/ec -p "Dr. Martin Brenner"');
    assert(existingOut.includes('Story Card "Dr. Martin Brenner" already exists'), "Expected specific existing card diagnostic");
    console.log("   ✔ Specific diagnostic: Existing Story Card title accurately identified");

    // 11f. Rejection when title is a reserved system keyword
    const reservedOut = sandbox.AutoCards("input", "/ec -p entity");
    assert(reservedOut.includes('"entity" is a reserved system keyword'), "Expected specific reserved system keyword diagnostic");
    console.log("   ✔ Specific diagnostic: Reserved system keyword accurately identified");
}

console.log("==================================================================");
console.log("  🎉 ALL 11 Auto-Cards STANDALONE LIFECYCLE TESTS PASSED (100%)");
console.log("==================================================================");
