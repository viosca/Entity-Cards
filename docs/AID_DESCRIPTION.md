---
title: "Entity Cards (NER)"
short_description: "Automated Named Entity Recognition (NER), MBTI character profiles, and structured YAML lore with multi-turn continuation, /ec -a abort controls, and CSCP coordination (v2.8.0)"
tags: ["utility", "script", "lore", "ner", "mbti", "cards", "autocards"]
version: "2.8.0-EC"
---

# Entity Cards 📇
### Automated Named Entity Recognition (NER) & Structured Lore for AI Dungeon
**An extension of Auto-Cards by LewdLeah ❤️**  
**Created and maintained by Randy Viosca ([@Random_Variable](https://play.aidungeon.com/profile/Random_Variable))**

Entity Cards automatically detects plot-significant people, places, factions, relics, and events in your adventure and summarizes them into structured, token-dense YAML story cards with 4-letter MBTI profiles.

---

### Key Capabilities
* **Named Entity Recognition (NER):** 5 distinct entity types (`Person`, `Location`, `Organization`, `Thing`, `Event`) formatted in token-dense YAML schemas.
* **MBTI Psychological Grounding:** Character cards include 4-letter MBTI profiles (e.g. `INTJ - Architect`, `ENFP - Campaigner`) to pack immense behavioral and dialogue depth into just 4 to 8 tokens.
* **100-Token Slider Calibrated:** Entity schemas are carefully engineered to fit neatly under AI Dungeon's default 100-token response length slider in a single turn (~94 tokens).
* **Multi-Turn Card Continuation:** Automatically prompts for continuation if generation exceeds a single turn, with companion card controls (`cleanPromptOnCardGen`, `progressDisplay`).
* **Generation Abort Controls:** Easily cancel or stop unwanted card generation in progress with `/ec -a`, `/ec --abort`, or `/ec cancel`.
* **Specific Rejection Diagnostics:** Clear, descriptive feedback for duplicate titles, short names, or empty prompts.
* **Model Awareness & Adaptive Presets:** Automatically detects your active AI Dungeon model and adapts schema complexity (`Standard`, `Lite`, `Authoring`, or `Custom`).
* **Instant Type Pruning:** Type `/ec Molly -p` or `/ec Neo-Tokyo -loc` to immediately generate a specific card with ~80% prompt token savings.
* **Cross-Slot Coordination (CSCP):** Fully coordinates with **Inner Entity** and **AID-Modules** in multi-slot setups to prevent duplicate generation and double-engine collisions.
* **100% Backward Compatible:** Supports all legacy `/ac` commands, `AutoCards()` function calls, and toggling to LewdLeah's classic Auto-Cards mode via `/ec -m classic`.

---

### In-Game Commands
* `/ec <Title>` — Generates a story card for a specific name or title.
* `/ec <Title> -<type>` — Generates with an explicit type flag (`-p` person, `-loc` location, `-org` organization, `-item` thing, `-event` event).
* `/ec -a`, `/ec --abort`, `/ec cancel` — Aborts active card generation in progress.
* `/ec -P <preset>` — Switches schema preset (`standard`, `lite`, `authoring`, `custom`).
* `/ec -m <mode>` — Switches operating mode (`entity` or `classic`).
* `/ec -i`, `--info`, `--diag` — Displays comprehensive cognitive engine and cache diagnostics.
* `/ec -v`, `--version` — Displays script build version, generation timestamp, and git commit hash.
* `/ec -h`, `--help` — Displays command syntax and flag options.

---

### Configuration Cards
When your adventure starts, two configuration story cards are created:
1. **"Configure Auto-Cards" (Master Card):** Manages cooldowns, turn delays, memory limits, and operating mode switcher.
2. **"Configure Entity Cards" (Companion Card):** Manages entity presets, container sentinels, prompt cleaning, and live editable template blocks.

---

### Documentation & Source Code
* **GitHub Repository:** [github.com/viosca/Entity-Cards](https://github.com/viosca/Entity-Cards)
* **Dynamic Slot Management Guide:** [DYNAMIC_SLOT_MANAGEMENT_GUIDE.md](https://github.com/viosca/Entity-Cards/blob/main/docs/DYNAMIC_SLOT_MANAGEMENT_GUIDE.md)
* **Original Auto-Cards by LewdLeah:** [play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards](https://play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards)
