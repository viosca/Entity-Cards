# Entity Cards (EC) — Architecture, Design & Implementation Plan

> **Status:** Draft / Approved Design  
> **Target Repository:** `Entity-Cards` (Fork of Auto-Cards)  
> **Last Updated:** 2026-11-01  

---

## 1. Executive Summary & Core Objectives

Entity Cards (EC) is a structured, Named Entity Recognition (NER) evolution of LewdLeah’s **Auto-Cards (AC)** for AI Dungeon. While classic Auto-Cards generates narrative profile cards in free-form prose, Entity Cards organizes knowledge into **dense, standardized YAML entries** enclosed within XML/JFSH instruction packets.

### Key Objectives
1. **Extreme Token Density:** Replace wordy prose fillers with clean YAML key-value pairs, maintaining maximum information density (~500–650 characters / ~100–130 tokens per card).
2. **Dual-Audience Usability:**
   * **Casual Roleplayers / Gamers:** Seamless zero-setup experience right out of the box with sensible defaults.
   * **Authors & Writing Assistants:** Granular control over story anchors, hidden agendas, relationships, and narrative dynamics.
3. **Model Resilience Across All Tiers:** Reliable single-turn completion under AI Dungeon’s default **100-token response length slider** across 30+ AI models (from 8B/12B local models like Muse and Wayfarer Small up to 671B frontier models like DeepSeek).
4. **Backward Compatibility & Non-Destructive Operation:** Classic Auto-Cards remains 100% functional and switchable at runtime without data loss or corruption.

---

## 2. Empirical Benchmark Findings & Runtime Environment Discovery

### 2.1 Multi-Model Benchmarks (OpenRouter & AID Testing)
Through direct testing across multiple AI Dungeon models (`Wayfarer Small 2`, `Gemma 4 31B`, `GLM`, `Muse`, `DeepSeek`) and automated OpenRouter benchmarks (`Llama 3.1 8B`, `Gemma 2 27B`, `DeepSeek V3`):

* **15/15 Tests Passed with 100% Single-Turn Completion:** All 5 NER types (`Person`, `Location`, `Organization`, `Thing`, `Event`) completed in a single turn with both `ENTITY_BEGIN` and `ENTITY_END` sentinels across all model tiers.
* **Average Token Footprint:** ~94 tokens (ranging from 67 to 120 tokens), perfectly fitting AI Dungeon's default 100-token response length slider.

| Observed Behavior | Real-World Impact | Engine Solution in EC |
| :--- | :--- | :--- |
| **Markdown Code Fences (`'''yaml` / ```` ```yaml ````)** | Models wrapped structured data in code blocks. | Implement automated fence stripping in `outputModifier` and `constructCard`. |
| **Blank / Omitted Keys** | Listing 7+ keys in natural language (*"with keys: a, b, c..."*) caused models to output empty keys (`keylocations:\nconnections:`) when forced to be concise. | Use **scaffolded templates with `{Placeholders}`** rather than unstructured natural-language key lists. |
| **Default 100-Token Slider** | AID defaults to a 100-token slider (~400–500 chars). Unbounded lists caused Muse to truncate mid-sentence. | Strictly bound list items (max 2 items) to guarantee **single-turn completion (~85–95 tokens)**. |
| **Hyphenated vs. Bare Keys** | Some models generated `- entity: "Tokyo"` while others generated `entity: Tokyo`. | Implement bullet-agnostic auto-typing regex: `/^-?\s*Type:\s*([^,\n]+)/mi`. |
| **Em-Dash Bullets** | Muse generated em-dash bullets (`—Ginza`) instead of hyphens (`-`). | Add regex normalization to treat `—` and `–` as valid sequence item bullets. |
| **Conversational Chatter** | Muse prepended chatter (*"To generate a compact YAML entry for Tokyo City:"*). | Use `ENTITY_BEGIN` sentinel stripping to cleanly discard all text prior to the sentinel. |

### 2.2 Live AI Dungeon Runtime Probe (Production & Alpha)
Direct deep inspection of AI Dungeon's `isolated-vm` scripting sandbox across both Production and Alpha confirmed:

1. **Native Model Detection Exists:** AI Dungeon officially exposes:
   * `info.storyModel.name` (e.g. `"DeepSeek"`)
   * `info.storyModel.version`
   This allows Entity Cards to feature **automatic model-aware presets** without requiring manual configuration from players.
2. **Context & Token Metrics:**
   * `info.maxChars` = `64000` (64k context limit)
   * `info.contextTokens` (live context token tracking)
   * `memory` = `{ context, authorsNote }`
3. **The Response Slider Setting is Client-Side:**
   * Probing `Object.getOwnPropertyDescriptors(info)` revealed only: `["actionCount", "characters", "useCacheEfficient", "maxChars", "memoryLength", "contextTokens", "storyModel"]`.
   * The response length slider is **not exposed** in the script sandbox. This confirms why Leah wrote `estimateResponseLength()` (empirical tracking from `history`) and validates our prompt-based natural token governor design (~85–95 tokens).


---

## 3. Configuration & Card Lifecycle Architecture

### 3.1 Two-Card Architecture

To avoid cluttering the user interface, configuration is partitioned into two distinct story cards:

```
+-------------------------------------------------------------+
|               "Configure Auto-Cards" (Master)               |
|  - Engine cooldowns & turn delays                           |
|  - Title bans & memory summary compression                  |
|  - Operating Mode switch: "Entity Cards" vs "Classic"       |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|              "Configure Entity Cards" (Companion)           |
|  - Status: Active / Inactive (never deleted on mode switch) |
|  - Active Preset: Standard / Lite / Authoring / Custom       |
|  - Maximum Entry Length: 700                                |
|  - Container Header: "{ Entity: "                           |
|  - Live Editable Template Blocks (Custom mode)              |
+-------------------------------------------------------------+
```

### 3.2 Card Persistence Guarantee
* When switching to **Classic Auto-Cards**, the companion card `Configure Entity Cards` is **NEVER deleted**.
* Instead, it is marked:
  ```yaml
  > Status: Inactive
  ```
* All user modifications, custom prompts, and preset configurations remain safely preserved. When switching back to **Entity Cards**, the card is reactivated seamlessly.

### 3.3 Presets & Custom Template Lifecycle

1. **Standard Preset (Default):**
   * Balanced 5-type YAML schemas (~550 characters).
   * Calibrated for mid-to-large models (Hearthfire, Equinox, GLM, DeepSeek).
2. **Lite Preset:**
   * Ultra-compact 3–4 key schemas (~380 characters).
   * Zero nesting; ideal for 8B–12B models (Fable, Muse, Wayfarer Small).
3. **Authoring Preset:**
   * Narrative-driven keys (`Role:`, `Secrets:`, `Scene_Dynamics:`, `Motives:`).
   * Designed specifically for authors and scenario creators using AID as a co-writer.
4. **Custom Preset:**
   * Automatically activated if the user edits any template block inside `Configure Entity Cards`.
   * Can also be explicitly selected via setting or slash command.

---

## 4. The 5 Core NER Schemas (Token-Calibrated)

Every schema is bounded to **~500–650 characters** (~100–130 tokens) and concludes with **`description:`**, ensuring our smart 1-turn completion detector (`/-?\s*Description:\s*[\s\S]+?[\.!\?]["']?\s*$/i`) works across all 5 categories.

### 4.1 Person (~550 chars)
```yaml
entity: %{title}
type: Person
category: {Archetype / Profession, e.g. Rogue Detective, Cyber-Doc}
appearance: {2-3 prominent visual traits, attire, distinctive quirks}
personality: {Demeanor, voice/speech style, attitude toward player}
drive: {Primary motive, immediate goal, or secret fear}
connections: {Key relationships, faction ties, history with protagonist}
description: {1-2 sentence narrative role and background summary.}
```

### 4.2 Location (~550 chars)
```yaml
entity: %{title}
type: Location
category: {Metropolis / District / Facility / Wilderness / Landmark}
atmosphere: {Sensory tone: lighting, sounds, scents, ambient mood}
key_locations:
- {Landmark 1}: {brief 1-line note}
- {Landmark 2}: {brief 1-line note}
connections: {1-line note on ties to protagonists, factions, or plot}
description: {1-2 sentence narrative overview and significance.}
```

### 4.3 Organization (~600 chars)
```yaml
entity: %{title}
type: Organization
category: {Megacorp / Syndicate / Guild / Military Unit / Cult}
public_face: {Reputation, official operations, public standing}
true_agenda: {Hidden motives, doctrines, actual covert goals}
leadership: {Key leaders, hierarchy, or command structure}
reach: {Influence, resources, strongholds, territories}
stance: {Attitude toward protagonists and rival factions}
description: {1-2 sentence overview and role in ongoing conflicts.}
```

### 4.4 Thing (~520 chars)
```yaml
entity: %{title}
type: Thing
category: {Weapon / Relic / Vehicle / Tech Device / Document}
physical: {Form, materials, distinctive markings, wear}
function: {Abilities, utility, mechanics, or special effects}
rules: {Usage costs, drawbacks, ammo, or requirements}
bearer: {Current possessor or location where it is stored}
description: {1-2 sentence origin, lore significance, and value.}
```

### 4.5 Event (~550 chars)
```yaml
entity: %{title}
type: Event
category: {Incident / War / Catastrophe / Festival / Mystery}
status: {Past lore / Ongoing crisis / Impending deadline}
key_actors: {Instigators, participants, affected factions}
stakes: {Root cause, what is gained or lost}
atmosphere: {Current tension, aftermath, sensory tone}
description: {1-2 sentence summary of the event and its story fallout.}
```

---

## 5. Full XML + JFSH Generation Packet

When Entity Cards triggers an AI generation turn, the prompt packet injected into the story generation buffer is:

```text
<SYSTEM>
[# AI, stop the story and ignore previous instructions.
#! This is JellyFish (JFSH). Follow program flow and directives.
// From story context, determine the entityType of '%{title}' as Person, Location, Organization, Thing, or Event.
// Precedence if ambiguous: Person > Organization > Location > Event > Thing.
// Fill out the matching template with concise, plot-significant details.
// High token density is key. Be grounded. Avoid fluff. Replace all {Placeholders}.
// Output strictly between %SC_BEGIN_SENTINEL% and %SC_END_SENTINEL%.
// Anything outside the sentinels will be discarded. No conversational filler.

if (entityType is 'Person') {
print `
%SC_BEGIN_SENTINEL%
entity: %{title}
type: Person
category: {Archetype / Profession}
appearance: {Visual traits, attire, quirks}
personality: {Demeanor, voice, attitude toward player}
drive: {Primary motive or goal}
connections: {Key ties to player or factions}
description: {1-2 sentence narrative summary.}
%SC_END_SENTINEL%
`;
} else if (entityType is 'Location') {
print `
%SC_BEGIN_SENTINEL%
entity: %{title}
type: Location
category: {Metropolis / District / Facility / Wilderness}
atmosphere: {Sensory tone, lighting, mood}
key_locations:
- {Landmark 1}: {brief note}
- {Landmark 2}: {brief note}
connections: {Ties to protagonists or plot}
description: {1-2 sentence narrative summary.}
%SC_END_SENTINEL%
`;
} else if (entityType is 'Organization') {
print `
%SC_BEGIN_SENTINEL%
entity: %{title}
type: Organization
category: {Megacorp / Syndicate / Guild / Faction}
public_face: {Reputation and open business}
true_agenda: {Hidden motives and doctrines}
leadership: {Key leaders or hierarchy}
reach: {Influence, territory, resources}
stance: {Attitude toward player and rivals}
description: {1-2 sentence narrative summary.}
%SC_END_SENTINEL%
`;
} else if (entityType is 'Thing') {
print `
%SC_BEGIN_SENTINEL%
entity: %{title}
type: Thing
category: {Weapon / Relic / Vehicle / Tech}
physical: {Form, materials, markings}
function: {Abilities, mechanics, or effects}
rules: {Costs, limits, or requirements}
bearer: {Current owner or location}
description: {1-2 sentence origin and significance.}
%SC_END_SENTINEL%
`;
} else {
print `
%SC_BEGIN_SENTINEL%
entity: %{title}
type: Event
category: {Incident / Crisis / Festival / Historical}
status: {Past / Ongoing / Impending}
key_actors: {Instigators and participants}
stakes: {Cause and what is won or lost}
atmosphere: {Current tension and tone}
description: {1-2 sentence summary and fallout.}
%SC_END_SENTINEL%
`;
}
]
</SYSTEM>
```

---

## 6. Phased Implementation Roadmap

```
+-------------------------------------------------------------+
| Phase 1: Two-Card System & Lifecycle                        |
| - EC companion card singleton creation & parser             |
| - Inactive state marking (preserve custom data)             |
| - Bi-directional card synchronization                       |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Phase 2: Fence Cleaner & Parser Resilience                  |
| - Automated code fence stripper ('''yaml, ```yaml, etc.)    |
| - Bullet- and casing-agnostic auto-typing regex             |
| - Em-dash bullet normalizer (—, –)                          |
| - Universal multi-type smart completion detector            |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Phase 3: 5-Type JFSH Prompt & Preset Engine                 |
| - Embed full 5-type JFSH prompt in generation defaults      |
| - Define Standard, Lite, and Authoring preset dictionaries  |
| - Implement dirty-state detection (auto-switch to Custom)   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Phase 4: Automated Test Suite & Edge Cases                  |
| - Node.js regression and unit test suite in scratch/        |
| - Verify fence stripping, multi-type generation, & limits   |
| - Verify zero regressions in Classic mode                   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Phase 5: Documentation & Git Versioning                     |
| - Update README.md with two-card & authoring workflows      |
| - Ensure Unix LF line endings across all files              |
| - Git commit and push to origin/main                        |
+-------------------------------------------------------------+
```

---

## 7. Actionable Implementation Checklist

### Phase 1: Two-Card Configuration Architecture
- [x] Define `configureEntityCards` control variant in `getControlVariants()`.
- [x] Create `getECConfigureCardTemplate()` and `getECConfigureCardEntry()`.
- [x] Implement singleton acquisition and lifecycle management in `advanceChronometer()` / `checkSettings()`.
- [x] Implement `> Status: Inactive` marking when mode is switched to Classic Auto-Cards (prevent deletion).
- [x] Implement settings synchronization between `Configure Auto-Cards` and `Configure Entity Cards`.
- [x] Update `/ec mode` slash command to toggle both cards appropriately.

### Phase 2: Parser Resilience & Code Fence Stripping
- [x] Add regex fence stripper in `outputModifier` and `constructCard`:
  - Discard leading ```` ```yaml\s* ````, ```` ```\s* ````, `'''yaml\s*`, `'''\s*`.
  - Discard trailing ```` ```\s*$ ````, `'''\s*$`.
- [x] Update `entityTypeRegex` in `constructCard` to `/(?:^|\n)[-—–]?\s*Type:\s*["']?([^,\n"']+)/mi`.
- [x] Add em-dash list bullet normalizer (`/^[—–]\s*/` $\to$ `- `).
- [x] Generalize smart completion detection (`hasFinishedDescription`) to check for terminal punctuation following `description:` across all 5 types (`/(?:^|\n)[-—–]?\s*Description:\s*[\s\S]+?[\.!\?]["']?\s*$/i`).

### Phase 3: 5-Type JFSH Prompts & Presets
- [x] Embed the complete 5-type JFSH prompt into `DEFAULT_EC_CARD_GENERATION_PROMPT`.
- [x] Define `Standard`, `Lite`, and `Authoring` template dictionaries in `library.js`.
- [x] Add preset parser in `parseConfig` to handle `Active Preset: Standard / Lite / Authoring / Custom`.
- [x] Implement dirty-state checking: if template text in `Configure Entity Cards` differs from the active preset, automatically transition status to `Custom`.

### Phase 4: Verification & Testing
- [x] Create `scratch/test_phase1_two_cards.js` verifying card creation, inactive marking on Classic toggle, and data preservation.
- [x] Create `scratch/test_phase2_fences_and_parser.js` verifying removal of `'''yaml`, ```` ```yaml ````, trailing markdown fences, and bullet-agnostic parsing.
- [x] Create `scratch/test_regression_classic_and_entity.js` verifying generation, auto-typing, preset transitions, model detection, and zero regressions in Classic mode.
- [x] Verify zero regressions in Classic Auto-Cards mode.

### Phase 5: Documentation & Git Release
- [x] Update [README.md](file:///c:/git/Auto-Cards/README.md) with two-card configuration instructions, authoring tips, and preset choices.
- [x] Enforce Unix LF line endings across the repository.
- [x] Commit all changes with clear semantic commit messages and push to `origin/main`.
