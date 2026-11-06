# Entity Cards Testing Sandbox 📇

An interactive live testbed for **Entity Cards** (an extension of Auto-Cards by LewdLeah ❤️, developed by Randy Viosca [@Random_Variable](https://play.aidungeon.com/profile/Random_Variable)).

This scenario is a hands-on playground designed for players, authors, and scenario creators to experiment with automated, token-dense Named Entity Recognition (NER) story cards in real time.

---

## What is an "Entity"?

Large Language Models often struggle with the abstract concept of a generic "Story Card"—different tools and platforms define cards in wildly inconsistent ways.

However, LLMs possess deep, native training in **Named Entity Recognition (NER)**. In Entity Cards, an Entity is a concrete or abstract noun across 5 calibrated categories:
* **Person:** Characters, historical figures, NPCs (with archetypes and 4-letter **MBTI** profiles)
* **Location:** Cities, landmarks, realms, planets, atmospheric settings
* **Organization:** Factions, megacorps, syndicates, cults, guilds
* **Thing:** Artifacts, weapons, technology, relics, vehicles
* **Event:** Battles, crises, operations, historical turning points

By prompting the AI with structured YAML schemas rather than vague card templates, it produces high-density, plot-grounded lore that directly steers NPC motivations, scene dynamics, and character dialogue.

---

## How to Use This Scenario

You can test card generation in three ways:

### 1. Instant Direct Generation
Type `/ec <Name>` into the action input bar for any fictional, historical, or real-world entity:
* `/ec James Bond`
* `/ec Richard Nixon`
* `/ec Lake Michigan`
* `/ec Cyberpunk Megacorp`
* `/ec The TARDIS`

### 2. Explicit Entity Type Flags (`-<type>`)
Target an exact category using `-<type>` (before or after the title) to prune unused prompt schemas, save ~80% in tokens, and eliminate classification guesswork:
* `/ec James Bond -p` *(or `/ec -p James Bond`)*
* `/ec Neo-Tokyo -loc`
* `/ec -org Arasaka`
* `/ec Excalibur -item`
* `/ec The Great Calamity -event`

### 3. Collaborative Narrative Authoring
Roleplay or brainstorm freely with the AI to flesh out an original character, faction, or mystery. Once you are happy with the details, type `/ec <Name>` to have the engine compile your recent story history into a permanent, structured story card.

---

## Highlights & Sandbox Features

* **4-Letter MBTI Character Profiling:** Person entities include dense MBTI profiles (e.g. `INTJ - Architect`) for instant behavioral grounding in minimal tokens.
* **Containerized Lore:** Cards are neatly encapsulated inside `{ Entity: ... }` wrappers to prevent format bleed.
* **Model-Aware Presets:** Automatically detects your active AI Dungeon model and adapts schema complexity (or switch manually via `/ec preset standard`, `lite`, or `authoring`).
* **Dialogue Quote Support:** Commands work in Story or Do mode, or spoken naturally in Say mode (e.g. `> You say, "/ec -p Molly."`).
* **Live In-Game Customization:** You can customize prompt templates directly in-game by editing the description of the "Configure Entity Cards" companion story card.
* **Classic Auto-Cards Mode:** Toggle back to LewdLeah's classic prose and bulleted lore at any time via `/ec mode classic`.
* **Persistent Memory Tracking:** Automated long-term memory logging and summarization for active entities.

---

## Tips for Testers & Creators

* **Response Length Slider:** Setting your in-game **Response Length** slider to **250+ tokens** (in Gameplay Settings) allows complete entity cards to generate in a single turn!
* **Director Mode:** Open the flame menu (Gameplay Settings) and change your character name to "Author" to freely direct the AI without locking yourself into an in-game persona.
* **Lightweight Speed:** Type `/ec preset lite` if you want ultra-fast, compact cards (~60 tokens).
* **Instant System Diagnostics:** Type `/ec info` (or `/ec diag`) at any time to output a full diagnostic report of your story model, prompt cache status, script versions, and card counts.

---

## Full Script Documentation & Source Code

For the complete command manual, advanced configuration guide, and full script installation instructions for your own scenarios, see:
* **Scenario Script Guide:** [SCENARIO_DESCRIPTION.md](https://github.com/viosca/Entity-Cards/blob/main/SCENARIO_DESCRIPTION.md)
* **Entity Cards GitHub:** [github.com/viosca/Entity-Cards](https://github.com/viosca/Entity-Cards)
* **Inner Entity (Minds + Entities):** [github.com/viosca/Inner-Entity](https://github.com/viosca/Inner-Entity)
* **Original Auto-Cards by LewdLeah:** [play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards](https://play.aidungeon.com/scenario/Ddt0Akd-lVtj/auto-cards)

*Note: The generation prompts and schemas in this scenario are actively evolving and tested here. Feel free to experiment, tweak settings in the configuration cards, and have fun!*
