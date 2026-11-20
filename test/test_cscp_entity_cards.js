#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT_DIR = path.resolve(__dirname, "..");
const LIB_PATH = path.join(ROOT_DIR, "src", "library.js");
const ecCode = fs.readFileSync(LIB_PATH, "utf8");

// Path to aid-modules library artifact
const aidModulesLibPath = path.resolve(__dirname, "../../aid-modules/library-aid-modules.js");
const cscpClientPath = path.resolve(__dirname, "../../aid-modules/src/cscp-client.js");

console.log("==================================================================");
console.log("  TEST SUITE: Entity-Cards CSCP Capability Yielding & Multi-VM");
console.log("  Target: " + LIB_PATH);
console.log("==================================================================");

function createSlotVM(sharedCards, sharedInfo, sharedHistory, slotState) {
    const sandbox = {
        log: () => {},
        console: { log: () => {}, error: console.error },
        Math, String, Array, Object, Number, RegExp, Set, Map, JSON,
        parseInt, parseFloat, isNaN, isFinite, Date,
        text: "",
        stop: false,
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
    sandbox.globalThis = sandbox;
    return { sandbox, ctx: vm.createContext(sandbox) };
}

// ----------------------------------------------------------------------------
// Test 1: loadCSCP() Unit Verification inside Entity-Cards
// ----------------------------------------------------------------------------
console.log("\n--- Part 1: loadCSCP() Unit Verification ---");
{
    const { sandbox, ctx } = createSlotVM([], { actionCount: 1 }, [], {});
    vm.runInContext(ecCode, ctx);

    // With no story cards, loadCSCP() returns null safely
    assert.strictEqual(typeof sandbox.loadCSCP, "function", "loadCSCP must be exported");
    assert.strictEqual(sandbox.loadCSCP(), null, "loadCSCP() must return null with empty cards");
    console.log("   ✔ loadCSCP() safely returns null when no storyCards are present");
}

// ----------------------------------------------------------------------------
// Test 2: Primary Standalone Operation with AID-Modules in Slot 1
// ----------------------------------------------------------------------------
console.log("\n--- Part 2: Primary Operation with CSCP (No Capability Collision) ---");
{
    const sharedCards = [];
    const sharedInfo = { actionCount: 1 };
    const sharedHistory = [];

    // Slot 1: AID-Modules
    const slot1 = createSlotVM(sharedCards, sharedInfo, sharedHistory, {});
    const aidModulesCode = fs.readFileSync(aidModulesLibPath, "utf8");
    vm.runInContext(aidModulesCode, slot1.ctx);
    vm.runInContext("AID.hook('context', 'Story beginning...', false)", slot1.ctx);

    // Slot 2: Entity-Cards (Standalone)
    const slot2 = createSlotVM(sharedCards, sharedInfo, sharedHistory, {});
    vm.runInContext(ecCode, slot2.ctx);

    // Execute input and context hooks
    slot2.sandbox.AutoCards("input", "A warrior approaches.");
    const [ctxOut, stopOut] = slot2.sandbox.AutoCards("context", "Recent Story:\nA warrior approaches.", false);

    assert.strictEqual(slot2.sandbox._AID_DOUBLE_ENGINE_DETECTED, false, "Double engine must NOT be detected for single instance");
    assert.strictEqual(slot2.sandbox.AutoCards._isBypassed, undefined, "AutoCards must NOT be bypassed");
    assert.strictEqual(stopOut, false, "stop flag preserved");

    // Read CSCP packet from storyCards
    const cscpPacket = vm.runInContext("loadCSCP().read()", slot2.ctx);
    assert(cscpPacket, "CSCP packet must exist on storyCards");
    assert(cscpPacket.modules["entity-cards"], "entity-cards must be registered in CSCP modules");
    assert.deepStrictEqual(cscpPacket.owners["entity-cards"].moduleName, "entity-cards", "entity-cards must own the card capability");
    assert.strictEqual(cscpPacket.collisions.length, 0, "Collisions must be zero");

    console.log("   ✔ Entity-Cards announced and claimed 'entity-cards' capability with 0 collisions");
}

// ----------------------------------------------------------------------------
// Test 3: Downstream Entity-Cards yields when Upstream Slot claims 'entity-cards'
// ----------------------------------------------------------------------------
console.log("\n--- Part 3: Capability Collision Yielding to Upstream Slot ---");
{
    const sharedCards = [];
    const sharedInfo = { actionCount: 1 };
    const sharedHistory = [];

    // Slot 1: AID-Modules
    const slot1 = createSlotVM(sharedCards, sharedInfo, sharedHistory, {});
    const aidModulesCode = fs.readFileSync(aidModulesLibPath, "utf8");
    vm.runInContext(aidModulesCode, slot1.ctx);
    vm.runInContext("AID.hook('context', 'Story beginning...', false)", slot1.ctx);

    // Slot 2: Upstream All-in-One Engine (claims both "inner-entity" and "entity-cards")
    const slot2 = createSlotVM(sharedCards, sharedInfo, sharedHistory, {});
    const loaderCode = fs.readFileSync(path.resolve(__dirname, "../../aid-modules/library-cscp-loader.js"), "utf8");
    vm.runInContext(loaderCode, slot2.ctx);
    vm.runInContext(`
        const cscp = loadCSCP();
        cscp.announce({
            name: "inner-entity",
            displayName: "Inner-Entity [All-in-One]",
            version: "2.1.0",
            buildType: "all-in-one",
            provides: ["inner-entity", "entity-cards"],
            prefix: "/ie",
            commands: ["/ie", "/ec"]
        }, { phase: "input" });
    `, slot2.ctx);

    // Slot 3: Downstream Standalone Entity-Cards loads
    const slot3 = createSlotVM(sharedCards, sharedInfo, sharedHistory, {});
    vm.runInContext(ecCode, slot3.ctx);

    // Run input hook
    const inOut = slot3.sandbox.AutoCards("input", "Player talks to vendor.");

    // Run context hook
    const [ctxOut, stopOut] = slot3.sandbox.AutoCards("context", "Recent Story:\nPlayer talks to vendor.", false);

    // Assert that Slot 3 yielded gracefully
    assert.strictEqual(slot3.sandbox._AID_DOUBLE_ENGINE_DETECTED, true, "Double engine flag must be true in globalThis");
    assert.strictEqual(slot3.sandbox.state._aid_double_engine_detected, true, "Double engine flag must be true in state");
    assert.strictEqual(slot3.sandbox.AutoCards._isBypassed, true, "Downstream AutoCards must be bypassed");
    assert(slot3.sandbox.AutoCards._bypassReason.includes("entity-cards"), "Bypass reason must mention capability yield");
    assert.strictEqual(ctxOut, "Recent Story:\nPlayer talks to vendor.", "Context text must be returned untouched");

    // Verify CSCP packet recorded the collision cleanly
    const cscpPacket = vm.runInContext("loadCSCP().read()", slot3.ctx);
    assert.strictEqual(cscpPacket.collisions.length, 1, "Exactly 1 collision recorded in CSCP packet");
    assert.strictEqual(cscpPacket.collisions[0].capability, "entity-cards");
    assert.strictEqual(cscpPacket.collisions[0].primaryModule, "inner-entity");
    assert.strictEqual(cscpPacket.collisions[0].yieldedModule, "entity-cards");

    console.log("   ✔ Downstream Entity-Cards detected collision via CSCP, yielded gracefully, and bypassed context");
}

console.log("\n==================================================================");
console.log("  🎉 ALL Entity-Cards CSCP TESTS PASSED (100% SUCCESS)");
console.log("==================================================================");
