# Entity Cards

**An extension of [Auto-Cards](https://github.com/LewdLeah/Auto-Cards) by LewdLeah ❤️**

---

### Attribution & Acknowledgments

> **Original Creator:** [LewdLeah](https://play.aidungeon.com/profile/LewdLeah) ([LewdLeah/Auto-Cards](https://github.com/LewdLeah/Auto-Cards))  
> All core background automation, turn monitoring, memory summarization and compression, title detection algorithms, and scenario script architecture were designed and built by LewdLeah. Please check out and star the [original Auto-Cards repository](https://github.com/LewdLeah/Auto-Cards)! ❤️
>
> **Entity Cards Fork:** Developed by Randy Viosca to extend Auto-Cards with structured Named Entity Recognition (NER), story card containerization, typed card auto-detection, and flexible prompt/response controls.

---

## Overview

**Entity Cards** is a scenario script for [AI Dungeon](https://aidungeon.com/) that builds upon LewdLeah's **Auto-Cards** engine. While Auto-Cards automatically generates living background lore and summarizes long-term memories, Entity Cards extends this by structuring lore entries into typed **Named Entities** (Person, Organization, Location, Event, or Thing) using high-density character archetypes, MBTI profiles, and container wrappers.

You can switch between **Entity Cards** mode and **Classic Auto-Cards** mode at any time with a single setting or command.

---

## What Entity Cards Adds to Auto-Cards

* **Named Entity Recognition (NER):** Detects entities and categorizes them into 5 distinct types: `Person`, `Organization`, `Location`, `Event`, or `Thing`.
* **JellyFish (JFSH) AI Prompting:** A structured pseudo-language template designed for high information density, including MBTI personality profiles, character archetypes, physical descriptions, and concise traits.
* **Automatic Story Card Typing:** Automatically extracts the entity category and assigns AI Dungeon's native story card `type` property (e.g., categorizing as "Person" instead of a generic tag).
* **Story Card Encapsulation / Containers:** Optional `{ Entity: ... }` boundary wrappers with `ENTITY_BEGIN` and `ENTITY_END` sentinels to keep story card formatting clean and contained.
* **Dynamic Context Header:** Automatically replaces `"World Lore:"` with a customizable header (default `"Named Entities (NER):"`) during context building, without needing manual edits to your `Context` script tab.
* **One-Click Mode Switcher:** Seamlessly toggle between `Entity Cards` and `Classic Auto-Cards` at any time—either from the in-game *"Configure"* story card or via the `/ec mode` command.
* **Smart Fragment Trimming:** Intelligent end-of-generation cleanup that detects abbreviations (`Mr.`, `Dr.`, `U.S.`) to avoid false phrase cuts, while stripping dangling sentences and unclosed quotes/brackets.
* **Dual Script & Command Aliases:** Call either `EntityCards(...)` or `AutoCards(...)` in your scenario scripts, and use either `/ec` or `/ac` in-game commands.

---

## In-Game Commands

You can use either `/ec` or `/ac` in the AI Dungeon action input bar:

| Command | Description |
|---|---|
| `/ec` | Triggers immediate card generation if valid titles exist in recent turns |
| `/ec mode entity` | Switches the engine to **Entity Cards** mode (NER, JFSH prompt, containerization) |
| `/ec mode classic` | Switches the engine to **Classic Auto-Cards** mode (prose prompt, bulleted lists) |
| `/ec header <text>` | Sets a custom context header (e.g., `/ec header Codex Entities:`) |
| `/ec <Title>` | Manually directs card generation for a specific title |
| `/ec <Title> / {Details}` | Generates a card for a title with additional guidance details |
| `/ec redo <Title>` | Regenerates an existing story card |
| `/ec redo all` | Regenerates all automatic story cards |

*(Classic `/ac` commands remain 100% compatible and functional.)*

---

## In-Game Configuration Card (`*EC` Options)

Once enabled in your adventure, a pinned story card titled **"Configure Auto-Cards"** allows you to customize settings in real time. Options labeled with **`*EC`** are specific to Entity Cards features:

| Option | Default | Description |
|---|---|---|
| `*EC Operating Mode:` | `"Entity Cards"` | Toggle between `"Entity Cards"` and `"Classic Auto-Cards"` |
| `*EC Context Header:` | `"Named Entities (NER):"` | Custom header replacing `"World Lore:"` in context |
| `*EC Raw AI Prompt Mode:` | `true` | Preserves structured JellyFish prompt without prose conversion |
| `*EC Raw AI Response Mode:` | `true` | Preserves archetype template formatting without forced bulleting |
| `*EC Auto-Type Story Cards:` | `true` | Automatically assigns native story card `type` (`Person`, `Location`, etc.) |
| `*EC Use custom story card container:` | `true` | Wraps entity cards inside `{ Entity: ... }` blocks |
| `*EC Custom container open string:` | `"{ Entity: "` | Opening string for story card containers |
| `*EC Custom container close string:` | `"\n}"` | Closing string for story card containers |
| `*EC Custom container AI begin sentinel:` | `"ENTITY_BEGIN"` | Boundary marker returned by AI |
| `*EC Custom container AI end sentinel:` | `"ENTITY_END"` | Boundary marker returned by AI |
| `*EC Trim card phrase frag:` | `true` | Smart fragment cleanup preventing cut-offs on abbreviations |
| `*EC Trim card quote frag:` | `true` | Strips trailing unclosed quotes and parentheses |
| `*EC Strip card asterisks:` | `true` | Removes markdown asterisks from generated card entries |
| `*EC Prettify card em dashes:` | `true` | Standardizes hyphens to clean em dashes |
| `*EC Log raw AI entry data:` | `false` | Debug log for raw card generation text |
| `*EC Log raw AI memory data:` | `false` | Debug log for raw card memory summarization |

*(Note: Settings parsing is fully flexible and case/prefix-tolerant, so editing options with or without the `*EC` label will work identically.)*

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
