# Entity Cards Testing Sandbox 🧪
### Interactive Testbed for Automated NER & Living Story Cards
**An experimental sandbox for Entity Cards / Auto-Cards**  
**Original engine by LewdLeah ❤️ · Extended by Randy Viosca ([@Random_Variable](https://play.aidungeon.com/profile/Random_Variable))**

---

## Welcome to the Sandbox!

This scenario is a live, ready-to-play testing environment for **Entity Cards**—an extension of LewdLeah's Auto-Cards that automatically identifies plot-significant nouns and structures them into living, token-dense YAML story cards.

### What is an "Entity"?

Large Language Models often struggle with the abstract concept of a "Story Card" because every platform defines cards differently. However, LLMs have deep, native training in **Named Entity Recognition (NER)**. An Entity is a concrete or abstract noun:

* **Person:** Characters, historical figures, companions, rivals, NPCs (includes 4-letter **MBTI profiles** and archetypes)
* **Location:** Cities, districts, landmarks, planets, wilderness realms
* **Organization:** Factions, megacorporations, syndicates, cults, guilds
* **Thing:** Artifacts, weapons, vehicles, relics, cyberware
* **Event:** Battles, crises, cyber-attacks, historical turning points

By prompting the model in terms of Entities and structured YAML rather than generic cards, the AI produces dense, plot-grounded lore that directly steers character dialogue, motivations, and scene dynamics.

---

## How to Test in This Sandbox

You can test card generation in three ways:

### 1. Instant Direct Generation
Type `/ec` into the action bar for any fictional, historical, or universe-specific entity:
* `/ec James Bond -p`
* `/ec -loc Neo-Tokyo`
* `/ec Arasaka Corporation -org`
* `/ec Excalibur -item`
* `/ec The Fall of Reach -event`

*Tip: Adding an entity type flag (`-p`, `-loc`, `-org`, `-t`, `-e`) isolates that single template branch, cutting prompt tokens by ~80% and preventing the AI from confusing people with places!*

### 2. Collaborative Narrative Authoring
Roleplay or brainstorm with the AI to develop a new character, place, or faction in your story. Once you are satisfied with the narrative details, type `/ec <Name>` to have the engine compile your story history into a permanent, structured story card.

### 3. Spoken in Dialogue (Say Mode)
You can even trigger commands inside character speech or 3rd-person flame text:
* `> You say, "/ec -p Molly Millions."`
* `Joe says, "/ec -loc Citadel Station!"`

---

## Key Sandbox Highlights

* **MBTI Psychological Profiles:** Character cards automatically generate 4-letter MBTI types (e.g. `INTJ - Architect`) for dense personality grounding in just 4–8 tokens.
* **Containerized Lore:** Cards are neatly wrapped in `{ Entity: ... }` containers with sentinels to prevent format bleed.
* **Model-Aware Presets:** Automatically detects your active AI Dungeon model to select the best schema tier:
  * `/ec preset standard` — Balanced 5-type YAML schema (default)
  * `/ec preset lite` — Ultra-compact schema (~380 chars, ideal for smaller models)
  * `/ec preset authoring` — Focused on narrative secrets, motives, and scene dynamics
* **Live In-Game Customization:** You can customize prompt schemas live by editing the description of the **"Configure Entity Cards"** companion story card.
* **Dynamic Context Header:** Substitutes `"Named Entities (NER):"` for `"World Lore:"` in context to keep reference material firmly anchored.

---

## Tips for Testing

* **Response Length Slider:** Set your in-game **Response Length** slider to **200–250+ tokens** in gameplay settings. This allows complete entity cards to generate cleanly in a single turn. (With shorter token budgets, simply click **Continue** when prompted).
* **Direct the Story as "Author":** Open the flame menu (Gameplay Settings) and change your character name to `"Author"` to freely prompt the AI without locking yourself into an in-game persona.
* **Need Instant 1-Turn Cards?** Type `/ec preset lite` to switch to ultra-compact cards that complete in ~60 tokens.

---

## Full Documentation & Scenario Installation

This sandbox is pre-configured and ready to play. If you would like to install Entity Cards into your own custom scenarios, read the complete command reference, or review the underlying script:

* **Full Script Documentation:** [SCENARIO_DESCRIPTION.md](https://github.com/viosca/Entity-Cards/blob/main/SCENARIO_DESCRIPTION.md)
* **Entity Cards GitHub:** [github.com/viosca/Entity-Cards](https://github.com/viosca/Entity-Cards)
* **Inner Entity GitHub:** [github.com/viosca/Inner-Entity](https://github.com/viosca/Inner-Entity)
* **Creator Profile:** [play.aidungeon.com/profile/Random_Variable](https://play.aidungeon.com/profile/Random_Variable)
* **Original Auto-Cards by LewdLeah:** [play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards](https://play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards)
