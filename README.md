# Entity Cards

**An extension of [Auto-Cards](https://github.com/LewdLeah/Auto-Cards) by LewdLeah ❤️**

---

### Attribution & Acknowledgments

> **Original Creator:** [LewdLeah](https://play.aidungeon.com/profile/LewdLeah) ([LewdLeah/Auto-Cards](https://github.com/LewdLeah/Auto-Cards))  
> All core background automation, turn monitoring, memory summarization and compression, title detection algorithms, and scenario script architecture were designed and built by LewdLeah. Please check out and star the [original Auto-Cards repository](https://github.com/LewdLeah/Auto-Cards)! ❤️
>
> **Entity Cards Fork:** Developed by Randy Viosca ([@Random_Variable](https://play.aidungeon.com/profile/Random_Variable)) to extend Auto-Cards with structured Named Entity Recognition (NER), story card containerization, typed card auto-detection, and flexible prompt/response controls.

---

## Overview

**Entity Cards** is a scenario script for [AI Dungeon](https://aidungeon.com/) that builds upon LewdLeah's **Auto-Cards** engine. While Auto-Cards automatically generates living background lore and summarizes long-term memories, Entity Cards extends this by structuring lore entries into typed **Named Entities** (Person, Organization, Location, Event, or Thing) using high-density character archetypes, MBTI profiles, and container wrappers.

You can switch between **Entity Cards** mode and **Classic Auto-Cards** mode at any time with a single setting or command.

---

## What Entity Cards Adds to Auto-Cards

* **Two-Card Clean Architecture:** Splits configuration into two purposeful cards:
  * **"Configure Auto-Cards" (Master):** Engine controls, cooldowns, turn delays, memory limits, and operating mode switcher (~18 lines).
  * **"Configure Entity Cards" (Companion):** Entity status, active presets, container sentinels, and live editable template blocks.
* **Card Persistence Guarantee:** When switched to Classic Auto-Cards mode, `Configure Entity Cards` is **never deleted**. It is safely preserved and marked `> Status: Inactive`. Switching back restores it seamlessly.
* **Named Entity Recognition (NER) Schemas:** Calibrated YAML schemas for 5 entity categories (`Person`, `Location`, `Organization`, `Thing`, and `Event`), designed to fit neatly under AI Dungeon's default **100-token slider** in a single turn. `Person` schemas include 4-letter **MBTI profiles** for dense psychological grounding in minimal tokens.
* **Model Awareness & Presets:** Automatically detects your active AI Dungeon model (`info.storyModel.name`) and selects the optimal schema tier:
  * **Standard (Default):** Balanced 5-type YAML schemas for mid-to-large models (DeepSeek, GLM, Gemma, Hearthfire, Equinox).
  * **Lite:** Ultra-compact schemas (~380 chars) for lightweight models (Fable, Muse, Wayfarer Small).
  * **Authoring:** Narrative-driven keys (`Role:`, `Secrets:`, `Scene_Dynamics:`, `Motives:`) for scenario writers.
  * **Custom:** Automatically activated if you edit any template block inside `Configure Entity Cards`.
* **Resilient Parsing & Code Fence Stripping:** Automatically strips markdown code fences (```` ```yaml ````, ```` ``` ````, `'''yaml`, `'''`) and sentinel markers, normalizing em-dash bullets (`—` / `–`) into clean, readable story cards.
* **Automatic Story Card Typing:** Automatically extracts the entity category and assigns AI Dungeon's native story card `type` property (e.g., categorizing as "Person" instead of a generic tag).
* **Story Card Encapsulation / Containers:** Optional `{ Entity: ... }` boundary wrappers with `ENTITY_BEGIN` and `ENTITY_END` sentinels to keep story card formatting clean and contained.
* **Dynamic Context Header:** Automatically replaces `"World Lore:"` with a customizable header (default `"Named Entities (NER):"`) during context building, without needing manual edits to your `Context` script tab.
* **Dual Script & Command Aliases:** Call either `EntityCards(...)` or `AutoCards(...)` in your scenario scripts, and use either `/ec` or `/ac` in-game commands.

---

## In-Game Commands

You can use either `/ec` or `/ac` in the AI Dungeon action input bar:

| Command | Description |
|---|---|
| `/ec` | Triggers immediate card generation if valid titles exist in recent turns |
| `/ec mode entity` | Switches the engine to **Entity Cards** mode (NER, YAML schemas, companion card) |
| `/ec mode classic` | Switches the engine to **Classic Auto-Cards** mode (prose prompt, bulleted lists) |
| `/ec preset standard` | Activates the **Standard** balanced 5-type YAML preset |
| `/ec preset lite` | Activates the ultra-compact **Lite** preset (ideal for 8B models) |
| `/ec preset authoring` | Activates the narrative **Authoring** preset (secrets, motives, scene dynamics) |
| `/ec preset custom` | Activates the **Custom** preset using your live edited templates |
| `/ec header <text>` | Sets a custom context header (e.g., `/ec header Codex Entities:`) |
| `/ec <Title>` | Manually directs card generation for a specific title |
| `/ec <Title> -<type>` | Generates a card with an explicit entity type flag (e.g. `/ec Smith -p` or `/ec -loc Tokyo`). Optimizes prompt to only that branch (~80% token savings)! |
| `/ec <Title> / {Details}` | Generates a card for a title with additional guidance details |
| `/ec redo <Title> [ -<type> ]` | Regenerates an existing story card, optionally overriding its type |
| `/ec redo all` | Regenerates all automatic story cards |
| `/ec -v, --version` | Displays active script build version and git commit hash |
| `/ec -h, --help` | Displays command help listing and type flag shorthands |

*(Classic `/ac` commands remain 100% compatible and functional.)*

### Explicit Entity Type Flags (`-<type>`)

When manually generating or redoing a card, you can specify the entity type using `-<type>` (or `--<type>`), either before or after the title:
- **Person:** `-p`, `-person`, `-char`, `-character`, `-npc`, `-who`
- **Location:** `-l`, `-loc`, `-location`, `-place`, `-where`
- **Organization:** `-o`, `-org`, `-organization`, `-faction`, `-group`, `-guild`
- **Thing:** `-t`, `-thing`, `-item`, `-object`, `-what`
- **Event:** `-e`, `-event`, `-incident`, `-when`

**Examples:**
* `/ec Jack -p` *(or `/ec -p Jack`)*
* `/ec Tokyo City -loc / {A sprawling cyberpunk metropolis}`
* `/ec -org Phantom Thieves`
* `/ec Holy Grail -item`
* `/ec The Great Calamity -e`
* `/ec redo Jack -person`

> **Token Optimization:** When an entity flag is provided, Entity-Cards dynamically isolates only the single matching JellyFish template branch, discarding the other 4 branches. This reduces the AI prompt from ~2,713 characters (~550 tokens) down to ~640 characters (~130 tokens)—an **~75–80% prompt token reduction** while eliminating schema hallucination! Hyphenated names (e.g., `Spider-Man` or `Top-Secret Facility`) are safely preserved.
>
> **Dialogue & Flame Menu Support:** Commands can be typed directly into Story or Do mode, or spoken naturally in Say mode dialogue (e.g. `> You say, "/ec -p Molly."` or `Joe says, "/ec -loc Citadel!"`). Punctuation, smart quotes, and dialogue wrappers are automatically stripped.

### Sample Generated Entity Card

Here is an example of a generated `Person` entity card using the default `Standard` preset:

```yaml
{ Entity:
entity: Molly Millions
type: Person
category: Street Samurai
mbti: ISTP - Virtuoso
appearance: Mirrored cybernetic lens implants, black leather jacket, retractable razor blades beneath burgundy nails.
personality: Cynical, calculating, and dryly sarcastic; hypervigilant in social settings.
drive: Survive freelance gigs and settle an old debt with the Chiba syndicate.
connections: Former bodyguard for Tessier-Ashpool; uneasy mercenary partner to the protagonist.
description: A legendary street samurai with cybernetic enhancements who navigates the criminal underworld with razor precision.
}
```

---

## Two-Card Configuration Architecture

Configuration is cleanly partitioned between two story cards:

### 1. "Configure Auto-Cards" (Master Card)
Pinned near the top of your story cards list, this compact card manages core engine parameters:
* `> Operating Mode:` Toggle between `Entity Cards` and `Classic Auto-Cards`
* `> Minimum turns cooldown for new cards:` Story progression turns between generations (default `28`)
* `> Maximum entry length for new cards:` Max character length (`700` in Entity mode, `600` in Classic mode)
* `> Pin this config card near the top:` Keeps configuration cards accessible
* `> Generate memories for new cards:` Memory update monitoring (`true`/`false`)
* `> Exclude all-caps from title detection:` Prevents false positives from capitalized UI text
* `> Manual commands bypass title filters:` Allows explicit `/ec` and `/ac` commands to generate common entities, real-world locations, and short character names (`true`/`false`, default `true`)
* `> Filter common entities from auto-detection:` Controls whether passive background auto-detection ignores common real-world cities, countries, and planets (`true`/`false`, default `true`)

### 2. "Configure Entity Cards" (Companion Card)
Dedicated to Named Entity Recognition and prompt customization:
* `> Status:` `Active` (when in Entity Cards mode) or `Inactive` (preserved when in Classic mode)
* `> Active Preset:` `Standard`, `Lite`, `Authoring`, or `Custom`
* `> Auto-select preset by model:` Automatically adapts schema complexity based on your active AI Dungeon model
* `> Context Header:` Custom header replacing `"World Lore:"` in context (default: `"Named Entities (NER):"`)
* `> Live Editable Template Blocks:` Edit the card's description to customize prompt schemas directly in-game; editing automatically switches the preset to **Custom**!

> [!TIP]
> **AI Dungeon Response Length:**  
> Setting your in-game **Response Length** slider to **250+ tokens** in AI Dungeon's gameplay settings allows complete Entity Cards to generate in a single turn. With shorter response length settings (e.g. 50–100 tokens), the script will automatically pause and prompt you with `>>> please select "continue" <<<` to construct the entity template across multiple turns.

---

## Scenario Script Installation Guide

1. Open the [AI Dungeon website](https://aidungeon.com/) on PC (or view as desktop if mobile-only).
2. [Create a new scenario](https://help.aidungeon.com/faq/what-are-scenarios) or edit one of your existing scenarios.
3. Open the **DETAILS** tab at the top while editing your scenario.
4. Scroll down to **Scripting** and toggle ON → **Scripts Enabled**.
5. Select **EDIT SCRIPTS**.

### 1. Input Tab
Select the **Input** tab on the left, delete any existing code, and paste:
```javascript
// Your "Input" tab
const modifier = (text) => {
  // Your other input modifier scripts go here (preferred)
  text = EntityCards("input", text);
  // Your other input modifier scripts go here (alternative)
  return {text};
};
modifier(text);
```

### 2. Context Tab
Select the **Context** tab on the left, delete any existing code, and paste:
```javascript
// Your "Context" tab
const modifier = (text) => {
  // Your other context modifier scripts go here (preferred)
  [text, stop] = EntityCards("context", text, stop);
  // Your other context modifier scripts go here (alternative)
  return {text, stop};
};
modifier(text);
```

### 3. Output Tab
Select the **Output** tab on the left, delete any existing code, and paste:
```javascript
// Your "Output" tab
const modifier = (text) => {
  // Your other output modifier scripts go here (preferred)
  text = EntityCards("output", text);
  // Your other output modifier scripts go here (alternative)
  return {text};
};
modifier(text);
```

### 4. Library Tab
1. Select the **Library** tab on the left and delete all existing code.
2. Open the full [Library code](./src/library.js) in a new browser tab.
3. Copy the full code and paste it into your empty **Library** tab.
4. Click the yellow **SAVE** button in the top right corner.

*(Note: `AutoCards(...)` also works identically if your scenario already has Auto-Cards installed—you only need to update the `Library` tab!)*

---

## Permission & License

Entity Cards is open-source and free to use in your own scenarios or scripts. General-purpose usefulness, interoperability, and compatibility are top priorities. You have full permission to use, copy, or modify Entity Cards. Please be respectful of the fact that not everyone wants to use automated cards, and never harass creators about installing scripts. Please enjoy! ❤️

---

## Useful Links

### Original Auto-Cards by LewdLeah
* **Auto-Cards Scenario Demo:** [play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards](https://play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards)
* **LewdLeah's Profile:** [play.aidungeon.com/profile/LewdLeah](https://play.aidungeon.com/profile/LewdLeah)
* **Upstream Auto-Cards Repo:** [github.com/LewdLeah/Auto-Cards](https://github.com/LewdLeah/Auto-Cards)
* **Official AI Dungeon Discord:** [discord.gg/MXNqpSbuZT](https://discord.gg/MXNqpSbuZT)

### Entity Cards by Randy Viosca
* **Random_Variable's AID Profile:** [play.aidungeon.com/profile/Random_Variable](https://play.aidungeon.com/profile/Random_Variable)
* **Entity Cards Repo:** [github.com/viosca/Entity-Cards](https://github.com/viosca/Entity-Cards)
* **Inner Entity Repo:** [github.com/viosca/Inner-Entity](https://github.com/viosca/Inner-Entity)
