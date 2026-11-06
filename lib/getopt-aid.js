/**
 * GetoptAID - POSIX & GNU-style option parser for AI Dungeon scripts
 *
 * Designed specifically for text adventures and AI Dungeon scenarios:
 * - Robust against mobile keyboards: normalizes smart quotes (“ ” ‘ ’) and smart dashes (–, —).
 * - Dialogue aware: cleanly extracts slash commands from Say/Do/Story dialogue wrappers and trailing punctuation.
 * - Supports short flags (-v, -p), long flags (--version, --preset), and key-value pairs (--mode=classic, -m classic).
 * - POSIX '--' delimiter for end-of-options (preserves hyphenated names or text).
 * - Declarative option specifications with types (boolean, string, number), enums, and defaults.
 * - Zero dependencies, blazing fast, and 100% compatible with AI Dungeon's scripting sandbox.
 *
 * @author Randy Viosca (@Random_Variable on AI Dungeon)
 * @license MIT
 */
(function(root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.GetoptAID = factory();
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";

    /**
     * Tokenizes a command line string respecting single/double/smart quotes,
     * normalizing smart dashes, and preserving quoted literals.
     * 
     * @param {string} input Raw command line string
     * @returns {Array<{ text: string, isQuoted: boolean }>} Array of tokens
     */
    function tokenize(input) {
        if (!input || typeof input !== "string") return [];

        let str = input.trim();
        // AID dialogue wrapper: e.g. > You say, "..." or Joe says, "..."
        const sayMatch = str.match(/(?:^|\n)(?:>\s*)?(?:You|[A-Za-z0-9_]+)\s*(?:says?|asks?|exclaims?|shouts?),?\s*["“]([\s\S]*?)["”]\s*$/i);
        if (sayMatch) {
            str = sayMatch[1].trim();
        }
        // Clean trailing speech/sentence punctuation at end of command (preserving -? and closing quotes)
        if (str !== "-?" && str !== "--?") {
            str = str.replace(/(?<=\S)[.!?,;:)]+$/, "");
        }

        const tokens = [];
        const tokenRegex = /"([^"]*)"|'([^']*)'|“([^”]*?)”|‘([^’]*?)’|(\S+)/g;
        let match;
        while ((match = tokenRegex.exec(str)) !== null) {
            const val = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5];
            const isQuoted = (match[5] === undefined);
            tokens.push({ text: val, isQuoted });
        }
        return tokens;
    }

    /**
     * Parses tokens against a declarative options specification.
     * 
     * @param {string|Array} input String or pre-tokenized array
     * @param {Object} spec Options specification object
     * @returns {{ flags: Object, operands: Array<string>, target: string, errors: Array<string>, hasFlag: Function }}
     */
    function parse(input, spec = {}) {
        const tokens = Array.isArray(input)
            ? input.map(t => (typeof t === "string" ? { text: t, isQuoted: false } : t))
            : tokenize(input);

        const lookupExact = new Map();
        const lookupLower = new Map();

        for (const [key, def] of Object.entries(spec)) {
            const entry = { key, def };
            // Long option: --key and -key
            lookupLower.set(`--${key.toLowerCase()}`, entry);
            lookupLower.set(`-${key.toLowerCase()}`, entry);

            // Short flag: -s (stored in exact-case map for case-sensitive short flags like -p vs -P)
            if (def.short) {
                lookupExact.set(`-${def.short}`, entry);
                lookupExact.set(`--${def.short}`, entry);
            }

            // Aliases: e.g. ["diag", "debug"] or ["char", "npc"]
            if (Array.isArray(def.aliases)) {
                for (const alias of def.aliases) {
                    lookupLower.set(`--${alias.toLowerCase()}`, entry);
                    lookupLower.set(`-${alias.toLowerCase()}`, entry);
                    if (alias.length === 1) {
                        lookupExact.set(`-${alias}`, entry);
                    }
                }
            }
        }

        const flags = {};
        const operands = [];
        const errors = [];
        let endOfOptions = false;

        // Initialize defaults
        for (const [key, def] of Object.entries(spec)) {
            if (def.default !== undefined) {
                flags[key] = def.default;
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            let { text, isQuoted } = tokens[i];

            if (isQuoted || endOfOptions) {
                operands.push(text);
                continue;
            }

            if (text === "--") {
                endOfOptions = true;
                continue;
            }

            // Normalize mobile smart dashes (en-dash, em-dash)
            if (/^[—–]/.test(text)) {
                text = text.replace(/^[—–]{2}/, "--").replace(/^[—–]/, "-");
            }

            // Clean trailing punctuation on flags while preserving -?
            const cleanFlag = (text === "-?" || text === "--?") ? text : text.replace(/(?<=\w)[.!?,;:"”'’)]+$/, "");

            if (!cleanFlag.startsWith("-")) {
                operands.push(text);
                continue;
            }

            // Check for inline value: --flag=value or -f=value
            let flagName = cleanFlag;
            let inlineVal = null;
            const eqIdx = cleanFlag.indexOf("=");
            if (eqIdx !== -1) {
                flagName = cleanFlag.slice(0, eqIdx);
                inlineVal = cleanFlag.slice(eqIdx + 1).replace(/^["“'’]|["”'’]$/g, "");
            }

            // Match flag: try exact case first (for short flags like -P vs -p)
            let matched = lookupExact.get(flagName) || lookupLower.get(flagName.toLowerCase());

            if (!matched) {
                // Not in spec, treat as positional operand
                operands.push(text);
                continue;
            }

            const { key, def } = matched;
            const optType = def.type || (def.hasArg ? "string" : "boolean");

            if (optType === "boolean") {
                flags[key] = true;
                continue;
            }

            if (optType === "typeFlag") {
                flags[key] = true;
                if (def.entityType) {
                    flags.entityType = def.entityType;
                    flags.matchedAlias = flagName.replace(/^-{1,2}/, "").toLowerCase();
                }
                continue;
            }

            let val = inlineVal;
            if (val === null) {
                if (i + 1 < tokens.length && (!tokens[i + 1].text.startsWith("-") || tokens[i + 1].isQuoted)) {
                    val = tokens[++i].text;
                } else if (def.optionalArg) {
                    val = true;
                } else {
                    errors.push(`Missing argument for option ${flagName}`);
                    flags[key] = "";
                    continue;
                }
            }

            if (optType === "number") {
                const num = Number(val);
                flags[key] = isNaN(num) ? val : num;
            } else if (optType === "string") {
                flags[key] = String(val);
            } else {
                flags[key] = val;
            }

            if (Array.isArray(def.enum) && !def.enum.includes(flags[key])) {
                errors.push(`Invalid value '${flags[key]}' for ${flagName}. Expected: ${def.enum.join(", ")}`);
            }
        }

        return {
            flags,
            operands,
            target: operands.join(" ").trim(),
            errors,
            hasFlag: (name) => flags[name] !== undefined && flags[name] !== false
        };
    }

    return {
        tokenize,
        parse,
        getoptLong: parse
    };
});
