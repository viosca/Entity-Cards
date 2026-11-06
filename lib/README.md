# GetoptAID: POSIX & GNU-Style Option Parser for AI Dungeon

A lightweight, zero-dependency, mobile-resilient command-line option parser designed specifically for AI Dungeon scripting and interactive fiction.

---

## Why GetoptAID?

Building slash commands (e.g. `/inv`, `/roll`, `/status`, `/ec`) in AI Dungeon typically leads to messy regexes and frustrating edge cases:
* **Mobile Smart Quotes & Dashes:** Mobile devices (iOS & Android) automatically replace `--` with em-dashes (`—`) or en-dashes (`–`), and straight quotes (`"`) with curly quotes (`“ ”`). Standard UNIX parsers break completely.
* **AI Dungeon Say Mode Wrappers:** When a player uses Say mode, AI Dungeon wraps their input in dialogue (e.g. `> You say, "/roll -d 20."` or `Joe says, "/give -i sword."`).
* **Name Collisions:** If your commands use barewords (like `/ec info` or `/inv drop`), character names like "Info" or "Drop" collide with subcommands.

**GetoptAID solves all of this out-of-the-box.**

---

## Features

* **Zero Dependencies:** Pure vanilla ECMAScript (ES2020+), under 200 lines, 100% compatible with AI Dungeon's QuickJS sandbox.
* **Mobile & Typography Tolerant:** Normalizes em-dashes (`—`), en-dashes (`–`), curly quotes (`“ ” ‘ ’`), and trailing speech punctuation (`."`, `!"`).
* **Dialogue-Aware:** Automatically unpacks commands inside Say/Do mode quotes.
* **GNU & POSIX Compliant:**
  * Short flags (`-v`, `-h`, `-p`)
  * Long flags (`--version`, `--help`, `--preset`)
  * Option arguments via space (`--mode classic`) or equals (`--mode=classic`, `-m=classic`)
  * POSIX end-of-options delimiter (`--`)
  * Interleaved arguments (flags can appear before, after, or between positional words)
* **Declarative Schemas:** Define options with types (`boolean`, `string`, `number`), aliases, defaults, and allowed enums.

---

## Installation in AI Dungeon

1. Open your scenario on [AI Dungeon](https://aidungeon.com/) on desktop.
2. In the **DETAILS** tab, toggle **Scripts Enabled**.
3. Go to the **Shared** tab (or the top of your **Input** modifier script).
4. Copy and paste the contents of `lib/getopt-aid.js`.

---

## Quick Start Examples

### Example 1: Dice Roller (`/roll`)

```javascript
const DICE_SPEC = {
    sides:     { short: "d", type: "number", default: 20 },
    modifier:  { short: "m", type: "number", default: 0 },
    advantage: { short: "a", aliases: ["adv"], type: "boolean" }
};

// Player types: /roll -d 6 -m 3 --adv Attack Roll
const { flags, target } = GetoptAID.parse(text, DICE_SPEC);

console.log(flags.sides);     // 6
console.log(flags.modifier);  // 3
console.log(flags.advantage); // true
console.log(target);          // "/roll Attack Roll"
```

### Example 2: Inventory Management (`/inv`)

```javascript
const INV_SPEC = {
    add:      { short: "a", type: "string" },
    drop:     { short: "d", type: "string" },
    quantity: { short: "q", type: "number", default: 1 },
    list:     { short: "l", type: "boolean" }
};

// Player types: /inv -a "Healing Potion" -q 3
const { flags, target } = GetoptAID.parse(text, INV_SPEC);

if (flags.add) {
    addToInventory(flags.add, flags.quantity); // "Healing Potion", 3
}
```

### Example 3: Character / Entity Cards (`/ec`)

```javascript
const EC_SPEC = {
    version: { short: "v", type: "boolean" },
    help:    { short: "h", type: "boolean" },
    info:    { short: "i", aliases: ["diag"], type: "boolean" },
    mode:    { short: "m", type: "string", enum: ["entity", "classic"] },
    preset:  { short: "P", type: "string", enum: ["standard", "lite", "authoring"] },
    person:  { short: "p", aliases: ["char", "npc"], type: "boolean" },
    location:{ short: "l", aliases: ["loc", "place"], type: "boolean" }
};

// Player types: /ec Molly Millions -p
const { flags, target } = GetoptAID.parse(text, EC_SPEC);

console.log(flags.person); // true
console.log(target);       // "/ec Molly Millions"
```

---

## API Reference

### `GetoptAID.tokenize(inputString)`
Splits a raw narrative or command string into an array of `{ text: string, isQuoted: boolean }` tokens.
* Strips external Say mode quotes if present.
* Respects single, double, and curly smart quotes.
* Preserves quoted tokens as literal operands.

### `GetoptAID.parse(input, spec)` *(alias: `GetoptAID.getoptLong`)*
Parses tokens or a raw string against an options specification.

#### Options Specification Object
Each key in `spec` represents an option name. Supported fields:
* `short`: Single character short flag (e.g. `"v"` for `-v`). Case-sensitive.
* `aliases`: Array of alias strings (e.g. `["diag", "diagnostics"]`).
* `type`: `"boolean"` (default), `"string"`, or `"number"`.
* `default`: Default value if option is not provided.
* `enum`: Array of allowed string values (generates an error if invalid).
* `optionalArg`: Boolean. If true, option can be used with or without an argument.

#### Return Object
* `flags`: Key-value map of parsed options and their values.
* `operands`: Array of positional string arguments (excluding flags and flag values).
* `target`: Space-joined string of all operands (handy for titles, item names, or noun phrases).
* `errors`: Array of validation error messages (e.g. missing required argument or invalid enum).
* `hasFlag(name)`: Helper function returning true if the flag was supplied.

---

## License

MIT © Randy Viosca
