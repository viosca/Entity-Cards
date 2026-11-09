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

// 2. /ec -v / --version
{
    const out = sandbox.AutoCards("input", "/ec -v");
    assert(out.includes("/EC version ->"), "Expected version response for /ec -v");
    assert(out.includes("Parser: GetoptAID"), "Expected GetoptAID reference in version");
    console.log("   ✔ /ec -v displays version and GetoptAID diagnostics");

    const outLong = sandbox.AutoCards("input", "/ec --version");
    assert(outLong.includes("/EC version ->"), "Expected version response for /ec --version");
    console.log("   ✔ /ec --version long flag parsed cleanly");
}

// 3. /ec -h / --help
{
    const out = sandbox.AutoCards("input", "/ec -h");
    assert(out.includes("/EC help -> Entity Cards Commands:"), "Expected help manual");
    console.log("   ✔ /ec -h displays command manual");
}

// 4. /ec -i / --info
{
    const out = sandbox.AutoCards("input", "/ec -i");
    assert(out.includes("/EC info ->"), "Expected system diagnostics header");
    assert(out.includes("Total Cards:"), "Expected card count stats");
    console.log("   ✔ /ec -i displays diagnostic system information");
}

// 5. Preset switching: /ec -P lite & /ec -P standard
{
    const out = sandbox.AutoCards("input", "/ec -P lite");
    assert(out.includes("/EC preset -> Set to Lite"), "Expected preset switch to Lite");
    console.log("   ✔ /ec -P lite switches preset cleanly");

    const outStd = sandbox.AutoCards("input", "/ec -P standard");
    assert(outStd.includes("/EC preset -> Set to Standard"), "Expected preset switch to Standard");
    console.log("   ✔ /ec -P standard switches back to Standard");
}

// 6. Entity type flag parsing & single-branch optimization: /ec Molly -p
{
    const out = sandbox.AutoCards("input", "/ec Molly -p");
    assert(out.includes("/EC {Molly} [-person] -> Success!"), "Expected card generation for Molly [-person]");
    console.log("   ✔ /ec Molly -p parsed entity type and generated card request");
}

// 7. Protected bareword titles: /ec "Info" -org
{
    const out = sandbox.AutoCards("input", '/ec "Info" -org');
    assert(out.includes("/EC {Info} [-organization] -> Success!"), "Expected quoted Info as title");
    console.log("   ✔ Quoted title protection (/ec \"Info\" -org) avoids flag collisions");
}

// 8. Dialogue unwrapping: Say & Do modes
{
    const outSay = sandbox.AutoCards("input", 'You say, "/ec -v"');
    assert(outSay.includes("/EC version ->"), "Expected Say-mode unwrapped execution");
    console.log("   ✔ Say mode unwrapped: You say, \"/ec -v\"");

    const outDo = sandbox.AutoCards("input", "> You /ec -P lite.");
    assert(outDo.includes("/EC preset -> Set to Lite"), "Expected Do-mode unwrapped execution");
    console.log("   ✔ Do mode unwrapped: > You /ec -P lite.");
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

console.log("==================================================================");
console.log("  🎉 ALL 10 Auto-Cards STANDALONE LIFECYCLE TESTS PASSED (100%)");
console.log("==================================================================");
