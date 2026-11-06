# Entity Cards 📇
### Automated Named Entity Recognition (NER) & Living Story Cards for AI Dungeon
**An extension of Auto-Cards by LewdLeah ❤️**  
**Created and maintained by Randy Viosca ([@Random_Variable](https://play.aidungeon.com/profile/Random_Variable))**

---

### Attribution & Acknowledgments

> **Original Engine Creator:** [LewdLeah](https://play.aidungeon.com/profile/LewdLeah) ([LewdLeah/Auto-Cards](https://github.com/LewdLeah/Auto-Cards))  
> All core background automation, turn monitoring, memory summarization, title detection algorithms, and scenario script architecture were designed and created by LewdLeah. Please check out and star the original Auto-Cards repository! ❤️
>
> **Entity Cards Extension:** Developed by Randy Viosca ([@Random_Variable](https://play.aidungeon.com/profile/Random_Variable)) to extend Auto-Cards with structured Named Entity Recognition (NER), 4-letter MBTI profiles, story card containerization, typed card auto-detection, and flexible prompt/response controls.

---

## Overview

**Entity Cards** is an advanced scenario script for AI Dungeon that automatically analyzes your story in the background, detects plot-significant people, places, factions, relics, and events, and creates living, structured story cards formatted in dense YAML.

While standard story generation can lose track of who is who over long adventures, Entity Cards builds a structured in-game codex that continuously grounds the AI with character archetypes, 4-letter MBTI psychological profiles, visual appearances, secret motivations, sensory atmospheric descriptions, and faction agendas.

You can switch between **Entity Cards** mode (structured YAML) and **Classic Auto-Cards** mode (free-form prose and bulleted lists) at any time with a single command or setting.

---

## Main Features

* **Named Entity Recognition (NER):** Calibrated YAML schemas across 5 distinct entity categories:
  * **Person:** Occupation, 4-letter MBTI profile, visual appearance, demeanor toward player, primary drive, connections, and narrative description.
  * **Location:** Atmosphere, sensory tone, key landmarks, connections, and summary.
  * **Organization:** Public reputation, covert agenda, territorial reach, and faction stance.
  * **Thing:** Physical form, capabilities/function, rules and risks, current bearer, and significance.
  * **Event:** Incident status (Past / Ongoing / Impending), key actors, stakes, atmosphere, and fallout.
* **Psychological Grounding with MBTI:** Character cards include 4-letter MBTI personality profiles (e.g. `INTJ - Architect`, `ENFP - Campaigner`) to pack immense behavioral and dialogue depth into just 4 to 8 tokens.
* **100-Token Slider Calibrated:** Entity schemas are carefully engineered to fit neatly under AI Dungeon's default 100-token response length slider in a single turn.
* **Model Awareness & Adaptive Presets:** Automatically detects your active AI Dungeon model and adapts schema complexity:
  * **Standard (Default):** Balanced 5-type YAML schemas for mid-to-large models (DeepSeek, GLM, Gemma, Hearthfire, Equinox).
  * **Lite:** Ultra-compact schemas (~380 characters) designed for lightweight 8B models (Fable, Muse, Wayfarer Small).
  * **Authoring:** Narrative-focused keys (Role, Secrets, Scene Dynamics) for story writers and scenario creators.
  * **Custom:** Automatically activated if you customize any template block inside your companion card.
* **Two-Card Clean Architecture:** Configuration is cleanly separated into two cards:
  * **"Configure Auto-Cards" (Master):** Manages cooldowns, turn delays, memory limits, and operating mode switcher (~18 lines).
  * **"Configure Entity Cards" (Companion):** Displays entity status, active presets, container sentinels, and live editable template blocks.
* **Card Persistence Guarantee:** When switched to Classic Auto-Cards mode, your `Configure Entity Cards` companion card is never deleted—it is safely preserved and marked Inactive. Switching back restores your settings immediately.
* **Single-Branch Token Optimization:** Explicit entity commands isolate only the matching schema branch, cutting prompt tokens by ~75–80% and preventing the AI from confusing people with locations.
* **Dialogue & Flame Menu Robustness:** Commands work seamlessly in Do or Story mode, or spoken naturally in Say mode dialogue (e.g. `> You say, "/ec -p Molly."` or 3rd-person flame text like `Joe says, "/ec -loc Citadel!"`). Punctuation and quotes are stripped automatically.
* **Resilient Parsing & Fence Stripping:** Automatically strips markdown code fences (```yaml, ```, '''yaml) and cleans up em-dash bullets for pristine story cards.
* **Dynamic Context Header:** Automatically replaces `"World Lore:"` with a customizable header (default: `"Named Entities (NER):"`) during context assembly.
* **100% Backward Compatible:** Supports all legacy `/ac` commands, `AutoCards()` function calls, and Classic Auto-Cards gameplay.

---

## Sample Generated Entity Card

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

## In-Game Commands

Enter any of these commands directly into the AI Dungeon action input bar using `/ec` (or `/ac`):

### Core Generation Commands
* `/ec`  
  Triggers immediate card generation for recently mentioned names or titles.
* `/ec <Title>`  
  Manually directs card generation for a specific title or character name.
* `/ec <Title> -<type>` *(or `/ec -<type> <Title>`)*  
  Generates a card with an explicit entity type flag. Prunes prompt tokens by ~80%!
* `/ec <Title> / {Details}`  
  Generates a card for a title with additional guidance notes or background details.
* `/ec redo <Title> [ -<type> ]`  
  Regenerates an existing story card, optionally overriding its entity type.
* `/ec redo all`  
  Regenerates all automatic story cards.

### Explicit Entity Type Flags
When using `/ec <Title> -<type>` or `/ec -<type> <Title>`, you can use any of these shorthands:
* **Person:** `-p`, `-person`, `-char`, `-character`, `-npc`, `-who`  
  *Example:* `/ec -p Jack` or `/ec Jack -p`
* **Location:** `-l`, `-loc`, `-location`, `-place`, `-where`  
  *Example:* `/ec Neo-Tokyo -loc` or `/ec -loc Neo-Tokyo`
* **Organization:** `-o`, `-org`, `-organization`, `-faction`, `-group`, `-guild`  
  *Example:* `/ec -org Arasaka`
* **Thing:** `-t`, `-thing`, `-item`, `-object`, `-what`  
  *Example:* `/ec Excalibur -item`
* **Event:** `-e`, `-event`, `-incident`, `-when`  
  *Example:* `/ec The Blackout -event`

### Configuration & Mode Commands
* `/ec mode entity`  
  Switches the engine to **Entity Cards** mode (structured YAML schemas and companion card).
* `/ec mode classic`  
  Switches the engine to **Classic Auto-Cards** mode (prose prompt and bulleted lists).
* `/ec preset standard`  
  Activates the **Standard** balanced 5-type YAML preset.
* `/ec preset lite`  
  Activates the ultra-compact **Lite** preset (ideal for smaller models or fast generation).
* `/ec preset authoring`  
  Activates the narrative **Authoring** preset (secrets, motives, scene dynamics).
* `/ec preset custom`  
  Activates the **Custom** preset using your live edited templates.
* `/ec header <text>`  
  Sets a custom context header replacing "World Lore:" (e.g. `/ec header Codex Entities:`).
* `/ec -v` *(or `/ec --version`)*  
  Displays the active script build version, generation timestamp, and git commit hash.
* `/ec -h` *(or `/ec --help`)*  
  Displays the in-game command help listing and entity type flag options.

---

## In-Game Configuration Cards

When your adventure starts, two configuration story cards are created:

### 1. "Configure Auto-Cards" (Master Card)
Pinned near the top of your story cards list, this card manages core engine parameters:
* **Operating Mode:** Toggle between `Entity Cards` and `Classic Auto-Cards`.
* **Minimum turns cooldown for new cards:** Progression turns between automatic generations (default: `28`).
* **Maximum entry length for new cards:** Maximum character limit (`700` in Entity mode, `600` in Classic mode).
* **Pin this config card near the top:** Keeps your settings cards easily accessible.
* **Generate memories for new cards:** Enables or disables memory update monitoring.
* **Exclude all-caps from title detection:** Prevents capitalized UI words from creating accidental cards.
* **Manual commands bypass title filters:** Allows explicit `/ec` commands to generate common cities or short names (default: `true`).
* **Filter common entities from auto-detection:** Controls whether background detection ignores common real-world countries and planets (default: `true`).

### 2. "Configure Entity Cards" (Companion Card)
Dedicated to Named Entity Recognition and prompt customization:
* **Status:** Displays `Active` (in Entity Cards mode) or `Inactive` (when in Classic mode).
* **Active Preset:** Displays `Standard`, `Lite`, `Authoring`, or `Custom`.
* **Auto-select preset by model:** Automatically adapts schema complexity based on your active AI Dungeon model.
* **Context Header:** The custom text replacing `"World Lore:"` in context (default: `"Named Entities (NER):"`).
* **Live Editable Template Blocks:** Edit the card's description in-game to tweak schemas; editing automatically switches the preset to **Custom**!

---

## Tips for Best Results

* **AI Dungeon Response Length:**  
  Setting your in-game **Response Length** slider to **200+ tokens** in AI Dungeon's gameplay settings ensures complete entity cards generate in a single turn. With shorter settings (e.g. 50–100 tokens), the script will pause and prompt you with `>>> please select "continue" <<<` to finish the entity template across turns.
* **Need Instant 1-Turn Generations?**  
  Switch to the lightweight preset by typing `/ec preset lite`. Its streamlined schemas generate in ~60 tokens, completing in a single turn even on short response sliders.
* **Ambiguous Names:**  
  If a character shares a name with a place or object (e.g. "Virginia" or "Rose"), always use an explicit flag: `/ec Virginia -p` or `/ec -p Virginia`. This guarantees the AI receives only the Person schema.

---

## Installing Entity Cards in Your Own Scenario

Want to add Entity Cards to your own scenario? It takes less than two minutes:

1. Open your scenario on [AI Dungeon](https://aidungeon.com/) on desktop.
2. In the **DETAILS** tab, scroll down to **Scripting** and toggle **ON → Scripts Enabled**.
3. Select **EDIT SCRIPTS**.
4. In the **Input**, **Context**, and **Output** tabs, wrap `EntityCards(hook, text)` (or copy the pre-made tabs from the [GitHub repository](https://github.com/viosca/Entity-Cards)).
5. In the **Library** tab, paste the complete code from [`src/library.js`](https://raw.githubusercontent.com/viosca/Entity-Cards/main/src/library.js).
6. Click **SAVE** in the top right corner.

*(If your scenario already has Auto-Cards installed, simply paste the new code into your Library tab—EntityCards is 100% drop-in compatible!)*

---

## Links & Community

* **Entity Cards GitHub:** [github.com/viosca/Entity-Cards](https://github.com/viosca/Entity-Cards)
* **Inner Entity GitHub:** [github.com/viosca/Inner-Entity](https://github.com/viosca/Inner-Entity)
* **Creator Profile:** [play.aidungeon.com/profile/Random_Variable](https://play.aidungeon.com/profile/Random_Variable)
* **Original Auto-Cards by LewdLeah:** [play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards](https://play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards)
* **AI Dungeon Official Discord:** [discord.gg/MXNqpSbuZT](https://discord.gg/MXNqpSbuZT)
