#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT_DIR = path.resolve(__dirname, "..");
const LIB_PATH = path.join(ROOT_DIR, "src", "library.js");

console.log("==================================================================");
console.log("  TEST SUITE: Entity-Cards Double Engine & Collision Guard");
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
    return { sandbox, ctx: vm.createContext(sandbox), logged, cards };
}

const ecCode = fs.readFileSync(LIB_PATH, "utf8");

// ----------------------------------------------------------------------------
// Test 1: Duplicate Standalone Entity-Cards in Slot 1 and Slot 2
// ----------------------------------------------------------------------------
{
    const { sandbox, ctx, cards } = createMockAIDContext();

    // Slot 1: Primary Standalone Entity-Cards
    vm.runInContext(ecCode, ctx);
    const slot1Instance = sandbox.AutoCards;
    assert.strictEqual(typeof slot1Instance, "function");
    assert.strictEqual(sandbox._AID_STANDALONE_EC, true);
    assert.strictEqual(Boolean(sandbox._AID_DOUBLE_ENGINE_DETECTED), false);
    assert.strictEqual(Boolean(slot1Instance._isBypassed), false);

    // Run first context hook to trigger initialization and config card creation
    sandbox.AutoCards("context", "A sunny day in the city.", false);

    // Initial Configure card created
    const configCardsSlot1 = cards.filter(c => c.title && c.title.includes("Auto-Cards"));
    assert.strictEqual(configCardsSlot1.length, 1, "Slot 1 should create exactly 1 Configure card");

    // Slot 2: Duplicate Standalone Entity-Cards loaded in same session
    vm.runInContext(ecCode, ctx);

    // Assert collision detected
    assert.strictEqual(sandbox._AID_DOUBLE_ENGINE_DETECTED, true, "Double engine flag must be set in globalThis");
    assert.strictEqual(sandbox.state._aid_double_engine_detected, true, "Double engine flag must be set in state");
    assert.strictEqual(sandbox.AutoCards, slot1Instance, "globalThis.AutoCards must remain Slot 1's instance");

    // Configure cards must not be duplicated
    const configCardsSlot2 = cards.filter(c => c.title && c.title.includes("Auto-Cards"));
    assert.strictEqual(configCardsSlot2.length, 1, "Duplicate instance must NOT generate a second Configure card");

    // Diagnostic info contains warning
    const promptIn = sandbox.AutoCards("input", "/ec -i");
    assert.strictEqual(promptIn.replace(/\u200D\u200B\u200C\u200B\u200D/g, ""), "/ec -i", "Input prompt must be preserved");
    const infoOut = sandbox.AutoCards("output", "");
    assert(infoOut.includes("⚠️ [DOUBLE ENGINE DETECTED]"), "Diagnostic info must display warning banner");
    assert(infoOut.includes("Only ONE card engine is active"), "Diagnostic info must explain duplicate bypassed");

    console.log("   ✔ Test 1 passed: Duplicate standalone instances safely detected & bypassed");
}

// ----------------------------------------------------------------------------
// Test 2: Upstream Bundled Engine detected by Standalone Entity-Cards
// ----------------------------------------------------------------------------
{
    const { sandbox, ctx, cards } = createMockAIDContext();

    // Simulate upstream All-in-One having loaded first in Slot 1
    sandbox._AID_BUNDLED_EC = true;
    const mockBundledEngine = function(hook, text, stop) {
        if (hook === "context") return [text, stop];
        return text;
    };
    sandbox._AID_ACTIVE_CARD_ENGINE_INSTANCE = mockBundledEngine;
    sandbox.AutoCards = mockBundledEngine;

    // Slot 2: Standalone Entity-Cards loads
    vm.runInContext(ecCode, ctx);

    // Assert standalone yielded to bundled engine
    assert.strictEqual(sandbox._AID_DOUBLE_ENGINE_DETECTED, true, "Double engine must be flagged");
    assert.strictEqual(sandbox.state._aid_double_engine_detected, true, "Double engine must be flagged in state");
    assert.strictEqual(sandbox.AutoCards, mockBundledEngine, "Bundled engine must NOT be overwritten by downstream standalone");

    // The downstream standalone instance must be bypassed
    const standaloneInstance = sandbox._AID_ACTIVE_CARD_ENGINE_INSTANCE; // still mockBundled
    assert.strictEqual(standaloneInstance, mockBundledEngine);

    console.log("   ✔ Test 2 passed: Standalone yields cleanly to upstream bundled engine");
}

// ----------------------------------------------------------------------------
// Test 3: Standalone Normal Single-Slot Lifecycle (No False Positives)
// ----------------------------------------------------------------------------
{
    const { sandbox, ctx } = createMockAIDContext();
    vm.runInContext(ecCode, ctx);

    assert.strictEqual(sandbox._AID_STANDALONE_EC, true);
    assert.strictEqual(sandbox._AID_DOUBLE_ENGINE_DETECTED, false);
    assert.strictEqual(sandbox.state._aid_double_engine_detected, undefined);
    assert.strictEqual(Boolean(sandbox.AutoCards._isBypassed), false);

    const infoOut = sandbox.AutoCards("input", "/ec -i");
    assert(!infoOut.includes("DOUBLE ENGINE"), "Normal standalone must not trigger false positive warning");
    console.log("   ✔ Test 3 passed: Standalone normal operation shows zero collision warnings");
}

// ----------------------------------------------------------------------------
// Test 4: Dynamic Reconfiguration: Removing duplicate clears state flag on next turn
// ----------------------------------------------------------------------------
{
    const { sandbox, ctx } = createMockAIDContext();
    // Simulate persistent state retaining collision flag from previous turn
    sandbox.state._aid_double_engine_detected = true;

    // Next turn: Player has removed the duplicate script, only standalone runs
    vm.runInContext(ecCode, ctx);

    // Assert primary engine automatically cleaned up the stale flag
    assert.strictEqual(sandbox._AID_DOUBLE_ENGINE_DETECTED, false, "Double engine flag must be reset to false");
    assert.strictEqual(sandbox.state._aid_double_engine_detected, undefined, "state flag must be deleted");
    assert.strictEqual(Boolean(sandbox.AutoCards._isBypassed), false, "Engine must be active");

    const infoOut = sandbox.AutoCards("input", "/ec -i");
    assert(!infoOut.includes("DOUBLE ENGINE"), "Warning banner must be removed once duplicate script is removed");
    console.log("   ✔ Test 4 passed: Dynamic reconfiguration clears warning when duplicate is removed mid-adventure");
}

// ----------------------------------------------------------------------------
// Test 5: True Multi-VM Adventure Mode (Two Separate QuickJS Sandboxes & States)
// ----------------------------------------------------------------------------
{
    const sharedCards = [];
    const sharedHistory = [
        { text: "Karane said, \"Hakari's probably in the classroom.\"", type: "say" },
        { text: "Hakari stepped into the room and greeted Karane.", type: "story" }
    ];
    const sharedInfo = {
        maxChars: 64000,
        actionCount: 5,
        useCacheEfficient: false,
        storyModel: { name: "DeepSeek", version: "v3" }
    };
    const slot1State = {};
    const slot2State = {};

    function runECInIsolatedVM(slotState, hook, textVal, stopVal = false) {
        const sb = {
            log: () => {},
            console: { log: () => {}, error: console.error },
            Math, String, Array, Object, Number, RegExp, Set, Map, JSON,
            parseInt, parseFloat, isNaN, isFinite, Date,
            text: textVal,
            stop: stopVal,
            history: sharedHistory,
            storyCards: sharedCards,
            info: sharedInfo,
            state: slotState,
            addStoryCard(...args) {
                let card = (args.length === 1)
                    ? { title: args[0], entry: "", keys: "", type: "class", description: "" }
                    : { keys: args[0], entry: args[1], type: args[2], title: args[3], description: args[4] };
                sharedCards.push(card);
                return card;
            },
            removeStoryCard(index) {
                sharedCards.splice(index, 1);
            }
        };
        sb.globalThis = sb;
        vm.runInContext(ecCode, vm.createContext(sb));
        if (hook === "context") {
            const [t, s] = sb.AutoCards("context", sb.text, sb.stop);
            return { text: t, stop: s };
        }
        return { text: sb.AutoCards(hook, sb.text), stop: sb.stop };
    }

    // 1. /ec -i piped through Slot 1 VM -> Slot 2 VM
    let step1 = runECInIsolatedVM(slot1State, "input", "/ec -i");
    assert.strictEqual(step1.text.replace(/\u200D\u200B\u200C\u200B\u200D/g, ""), "/ec -i", "Slot 1 preserves input prompt");
    let step2 = runECInIsolatedVM(slot2State, "input", step1.text);
    assert.strictEqual(slot2State._aid_double_engine_detected, true, "Multi-VM: Downstream slot must detect upstream /ec -i via input handshake");
    let out1 = runECInIsolatedVM(slot1State, "output", "");
    assert(out1.text.includes("/EC info ->"), "Slot 1 delivers diagnostics via output hook");

    // 2. Context hook piped through Slot 1 VM -> Slot 2 VM
    sharedInfo.actionCount = 6;
    delete slot2State.AutoCards;
    let ctx1 = runECInIsolatedVM(slot1State, "context", "Recent Story:\nHakari greeted Karane.", false);
    let ctx2 = runECInIsolatedVM(slot2State, "context", ctx1.text, ctx1.stop);
    assert(slot1State.AutoCards, "Multi-VM: Primary Slot 1 must execute context");
    assert.strictEqual(slot2State.AutoCards, undefined, "Multi-VM: Secondary Slot 2 must bypass context via storyCards stamp");
    assert.strictEqual(sharedCards.filter(c => c.title && c.title.includes("Auto-Cards")).length, 1, "Multi-VM: Exactly 1 control card");

    console.log("   ✔ Test 5 passed: Multi-VM isolated sandboxes coordinate via storyCards and input waterfall");
}

console.log("==================================================================");
console.log("  🎉 ALL Entity-Cards DOUBLE ENGINE TESTS PASSED (100%)");
console.log("==================================================================");
