const fs = require("fs");
const path = require("path");
const assert = require("assert");

const submodulePath = path.resolve(__dirname, "../submodules/aid-getopt/src/aid-getopt.js");
const siblingPath = path.resolve(__dirname, "../../aid-getopt/src/aid-getopt.js");
const AIDGetopt = fs.existsSync(submodulePath) ? require(submodulePath) : require(siblingPath);
const GetoptAID = AIDGetopt;

console.log("==================================================================");
console.log("  TESTING STANDALONE AID-Getopt LIBRARY");
console.log("==================================================================");

// Spec for general testing
const TEST_SPEC = {
    version:   { short: "v", type: "boolean" },
    help:      { short: "h", aliases: ["?"], type: "boolean" },
    info:      { short: "i", aliases: ["diag", "debug", "sysinfo"], type: "boolean" },
    mode:      { short: "m", type: "string", enum: ["entity", "classic"] },
    preset:    { short: "P", type: "string", enum: ["standard", "lite", "authoring"] },
    header:    { type: "string" },
    count:     { short: "c", type: "number", default: 1 },
    retry:     { short: "r", type: "string", optionalArg: true },
    retryAll:  { short: "R", aliases: ["retry-all"], type: "boolean" },

    // Entity types
    person:       { short: "p", aliases: ["char", "npc", "who"], type: "typeFlag", entityType: "Person" },
    location:     { short: "l", aliases: ["loc", "place", "where"], type: "typeFlag", entityType: "Location" },
    organization: { short: "o", aliases: ["org", "faction"], type: "typeFlag", entityType: "Organization" },
    thing:        { short: "t", aliases: ["item", "object"], type: "typeFlag", entityType: "Thing" },
    event:        { short: "e", aliases: ["when"], type: "typeFlag", entityType: "Event" }
};

// 1. Basic flags
{
    const r = GetoptAID.parse("-v", TEST_SPEC);
    assert.strictEqual(r.flags.version, true);
    assert.strictEqual(r.target, "");
    console.log("   ✔ -v boolean short flag parsed");

    const r2 = GetoptAID.parse("--version", TEST_SPEC);
    assert.strictEqual(r2.flags.version, true);
    console.log("   ✔ --version boolean long flag parsed");
}

// 2. Help and aliases
{
    const r1 = GetoptAID.parse("-h", TEST_SPEC);
    assert.strictEqual(r1.flags.help, true);

    const r2 = GetoptAID.parse("-?", TEST_SPEC);
    assert.strictEqual(r2.flags.help, true);

    const r3 = GetoptAID.parse("--help", TEST_SPEC);
    assert.strictEqual(r3.flags.help, true);
    console.log("   ✔ Help flag and -? alias parsed");
}

// 3. String value options (space vs equals)
{
    const r1 = GetoptAID.parse("-m classic", TEST_SPEC);
    assert.strictEqual(r1.flags.mode, "classic");

    const r2 = GetoptAID.parse("-m=classic", TEST_SPEC);
    assert.strictEqual(r2.flags.mode, "classic");

    const r3 = GetoptAID.parse("--mode classic", TEST_SPEC);
    assert.strictEqual(r3.flags.mode, "classic");

    const r4 = GetoptAID.parse("--mode=entity", TEST_SPEC);
    assert.strictEqual(r4.flags.mode, "entity");
    console.log("   ✔ Value options with space and = parsed cleanly");
}

// 4. Case-sensitive short flags: -P (preset) vs -p (person)
{
    const r1 = GetoptAID.parse("-P lite", TEST_SPEC);
    assert.strictEqual(r1.flags.preset, "lite");
    assert.strictEqual(r1.flags.person, undefined);

    const r2 = GetoptAID.parse("-p Molly", TEST_SPEC);
    assert.strictEqual(r2.flags.person, true);
    assert.strictEqual(r2.flags.entityType, "Person");
    assert.strictEqual(r2.flags.preset, undefined);
    assert.strictEqual(r2.target, "Molly");

    const r3 = GetoptAID.parse("Molly -p", TEST_SPEC);
    assert.strictEqual(r3.flags.person, true);
    assert.strictEqual(r3.target, "Molly");
    console.log("   ✔ Case sensitivity: -P (preset) and -p (person) are distinct");
}

// 5. Number types and defaults
{
    const r1 = GetoptAID.parse("Attack", TEST_SPEC);
    assert.strictEqual(r1.flags.count, 1); // default
    assert.strictEqual(r1.target, "Attack");

    const r2 = GetoptAID.parse("-c 5 Attack", TEST_SPEC);
    assert.strictEqual(r2.flags.count, 5);
    assert.strictEqual(r2.target, "Attack");
    console.log("   ✔ Number type conversion and defaults verified");
}

// 6. Name protection (titles never collide with command words)
{
    const r1 = GetoptAID.parse("Info", TEST_SPEC);
    assert.strictEqual(r1.flags.info, undefined);
    assert.strictEqual(r1.target, "Info");

    const r2 = GetoptAID.parse("Mode -p", TEST_SPEC);
    assert.strictEqual(r2.flags.mode, undefined);
    assert.strictEqual(r2.flags.entityType, "Person");
    assert.strictEqual(r2.target, "Mode");

    const r3 = GetoptAID.parse('"Info" -org', TEST_SPEC);
    assert.strictEqual(r3.flags.info, undefined);
    assert.strictEqual(r3.flags.entityType, "Organization");
    assert.strictEqual(r3.target, "Info");

    const r4 = GetoptAID.parse("Spider-Man", TEST_SPEC);
    assert.strictEqual(r4.target, "Spider-Man");
    console.log("   ✔ Name protection: titles matching flag names are never misinterpreted");
}

// 7. Mobile smart dashes and curly quotes
{
    const r1 = GetoptAID.parse('/ec —preset lite', TEST_SPEC);
    assert.strictEqual(r1.flags.preset, "lite");

    const r2 = GetoptAID.parse('/ec –p Molly', TEST_SPEC);
    assert.strictEqual(r2.flags.entityType, "Person");
    assert.strictEqual(r2.target, "/ec Molly");

    const r3 = GetoptAID.parse('“Smart Title” -t', TEST_SPEC);
    assert.strictEqual(r3.flags.entityType, "Thing");
    assert.strictEqual(r3.target, "Smart Title");
    console.log("   ✔ Mobile smart dashes (—, –) and smart quotes (“ ”, ‘ ’) normalized");
}

// 8. Quoted strings with trailing punctuation
{
    const r1 = GetoptAID.parse('--header "Codex Entities:"', TEST_SPEC);
    assert.strictEqual(r1.flags.header, "Codex Entities:");
    assert.strictEqual(r1.target, "");
    console.log("   ✔ Quotes with colons and punctuation preserved intact");
}

// 9. Dialogue Say mode wrapper stripping
{
    const r1 = GetoptAID.parse('Joe says, "/ec -p Molly."', TEST_SPEC);
    assert.strictEqual(r1.flags.entityType, "Person");
    assert.strictEqual(r1.target, "/ec Molly");

    const r2 = GetoptAID.parse('> You ask, "/ec -loc Neo-Tokyo!"', TEST_SPEC);
    assert.strictEqual(r2.flags.entityType, "Location");
    assert.strictEqual(r2.target, "/ec Neo-Tokyo");
    console.log("   ✔ Dialogue wrappers (You say, Joe asks) automatically unpacked");
}

// 10. End-of-options delimiter (--)
{
    const r1 = GetoptAID.parse('-- -v', TEST_SPEC);
    assert.strictEqual(r1.flags.version, undefined);
    assert.strictEqual(r1.target, "-v");
    console.log("   ✔ POSIX '--' delimiter stops option parsing");
}

console.log("\n==================================================================");
console.log("  🎉 ALL 10 AID-Getopt UNIT TESTS PASSED (100% SUCCESS)");
console.log("==================================================================");
