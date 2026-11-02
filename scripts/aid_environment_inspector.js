/**
 * ============================================================================
 * AI Dungeon Environment Diagnostic & State Inspector
 * ============================================================================
 * 
 * Paste this script into your AI Dungeon scenario script (either in the Library tab
 * or split across Input/Context/Output tabs) to inspect the live AID sandbox.
 * 
 * It will automatically create a Story Card named "[AID Diagnostic Dump]"
 * containing a complete JSON inspection of:
 *   1. info (all properties, context limits, action counts, etc.)
 *   2. state (all initial properties injected by AID before scripts run)
 *   3. globalThis (all non-standard globals injected by the AID engine)
 *   4. history (action object structure and recent action metadata)
 *   5. hook-specific properties during onInput, onContext, and onOutput
 * ============================================================================
 */

function runAIDDiagnostics(hookName) {
    const knownBuiltins = new Set([
        "undefined", "NaN", "Infinity", "eval", "isFinite", "isNaN", "parseFloat", "parseInt",
        "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "Object", "Function",
        "Array", "Number", "Boolean", "String", "Symbol", "Date", "Promise", "RegExp", "Error",
        "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError",
        "JSON", "Math", "Intl", "ArrayBuffer", "Uint8Array", "Int8Array", "Uint16Array", "Int16Array",
        "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "Uint8ClampedArray", "BigInt64Array",
        "BigUint64Array", "DataView", "Map", "Set", "WeakMap", "WeakSet", "Proxy", "Reflect",
        "BigInt", "console", "globalThis", "global", "queueMicrotask", "clearTimeout", "clearInterval",
        "setTimeout", "setInterval"
    ]);

    // Inspect non-standard globals
    const customGlobals = {};
    for (const key of Object.getOwnPropertyNames(globalThis)) {
        if (!knownBuiltins.has(key)) {
            try {
                const val = globalThis[key];
                customGlobals[key] = typeof val === "function" ? "[Function]" : typeof val === "object" ? (Array.isArray(val) ? `[Array(${val.length})]` : "[Object]") : val;
            } catch (e) {
                customGlobals[key] = `<Error: ${e.message}>`;
            }
        }
    }

    // Inspect `info`
    const infoDump = {};
    if (typeof info !== "undefined" && info !== null) {
        for (const key of Object.getOwnPropertyNames(info)) {
            try {
                infoDump[key] = info[key];
            } catch (e) {
                infoDump[key] = `<Error: ${e.message}>`;
            }
        }
    }

    // Inspect `state`
    const stateKeys = (typeof state === "object" && state !== null) ? Object.keys(state) : [];

    // Inspect recent action from history
    let lastAction = null;
    if (Array.isArray(history) && history.length > 0) {
        const rawAction = history[history.length - 1];
        lastAction = {};
        for (const key of Object.getOwnPropertyNames(rawAction)) {
            try {
                lastAction[key] = typeof rawAction[key] === "string" ? rawAction[key].slice(0, 100) : rawAction[key];
            } catch (e) {
                lastAction[key] = `<Error: ${e.message}>`;
            }
        }
    }

    const report = {
        hook: hookName,
        timestamp: new Date().toISOString(),
        info: infoDump,
        customGlobals: customGlobals,
        stateTopLevelKeys: stateKeys,
        lastActionSample: lastAction
    };

    const formattedReport = JSON.stringify(report, null, 2);

    // Save report to a Story Card named "[AID Diagnostic Dump]"
    if (Array.isArray(storyCards)) {
        let diagCard = storyCards.find(c => c && c.title === "[AID Diagnostic Dump]");
        if (!diagCard) {
            diagCard = {
                title: "[AID Diagnostic Dump]",
                keys: "diagnostic,sandbox,dump",
                entry: formattedReport,
                type: "class"
            };
            storyCards.unshift(diagCard);
        } else {
            diagCard.entry = formattedReport;
        }
    }

    if (typeof state === "object" && state !== null) {
        state.message = `[AID Diagnostic] Inspected ${hookName} (info keys: ${Object.keys(infoDump).join(", ")})`;
    }
}

// Hook entry points:
// In Input tab:
//   runAIDDiagnostics("input");
// In Context tab:
//   runAIDDiagnostics("context");
// In Output tab:
//   runAIDDiagnostics("output");
