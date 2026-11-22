# Discord Announcement & Thread Update Kit: Entity Cards

> **Note on Discord Markdown:** Discord uses a simplified Markdown engine. It does not support tables, HTML tags, or complex styling. The copy below uses Discord-safe formatting (headers, bold, bullet points `•`, backticks, code blocks, and blockquotes). Every post is verified to be under Discord's 2,000-character limit.

---

## Part 1: Thread Reply (Post This as a New Reply in Your Existing Thread)

*Character count: ~1,580 characters (Discord limit: 2,000)*

```markdown
📇 **Entity Cards v2.8.0 Release: Abort Controls, Smarter Continuation & CSCP Coordination**

A major update is live for **Entity Cards** (v2.8.0-EC), extending LewdLeah's Auto-Cards with structured Named Entity Recognition (NER) and 4-letter MBTI profiles!

### 🌟 What's New in v2.8.0-EC:
• **Card Abort Controls:** Cancel active card generations at any time by typing `/ec -a`, `/ec --abort`, or `/ec cancel`.
• **Prompt Preservation (`cleanPromptOnCardGen`):** When manually generating a card, your story prompt is now safely preserved instead of being cleared.
• **Toast Notifications (`progressDisplay`):** Multi-turn card progress can now display as a clean status toast (`state.message`) without cluttering narrative text lines.
• **Specific Rejection Diagnostics:** Descriptive feedback if a title is already queued, too short, or lacks story context.
• **Cross-Slot Coordination (CSCP):** Coordinates with downstream scripts (like Inner-Entity) to suppress background NPC thoughts during card compilation, preventing corrupted story cards!
• **100-Token Slider Calibrated:** Dense 5-type YAML schemas with 4-letter **MBTI** profiles designed to fit under AI Dungeon's default 100-token slider.

### 🎮 Quick Commands:
• `/ec <Title> -<type>` — Generate with explicit type (`-p`, `-loc`, `-org`, `-item`, `-event`).
• `/ec -a` — Abort active card generation.
• `/ec -P <preset>` — Switch schema preset (`standard`, `lite`, `authoring`, `custom`).
• `/ec -i` — Full cognitive engine and cache diagnostics.

🔗 **GitHub Repository:**
https://github.com/viosca/Entity-Cards
```

---

## Part 2: Improved Original Post (OP) for the Thread

*Character count: ~1,960 characters (Discord limit: 2,000)*

```markdown
📇 **[RELEASE] Entity Cards (NER) v2.8.0 — Automated Named Entity Recognition & Living World Lore**
*An extension of LewdLeah's legendary Auto-Cards engine ❤️ by Randy Viosca (@Random_Variable)*

**Entity Cards** extends Auto-Cards with structured Named Entity Recognition (NER), 4-letter MBTI profiles, calibrated YAML schemas, and cross-slot coordination!

🌟 **Key Capabilities:**
• **5 Typed Entity Schemas:** Indexes **Person** (with 4-letter MBTI), **Location**, **Organization**, **Thing**, and **Event**.
• **MBTI Psychological Grounding:** Packs behavioral depth and dialogue consistency into 4 to 8 tokens.
• **100-Token Slider Calibrated:** Schemas complete in a single turn (~94 tokens) under AID's default response slider.
• **Abort Controls & Diagnostics:** Cancel active card generations anytime with `/ec -a` (or `/ec cancel`), with clear feedback for queued or invalid titles.
• **Prompt Preservation & Toasts:** Set `cleanPromptOnCardGen` to keep story prompts intact, and `progressDisplay: toast` to show progress without cluttering story text.
• **Cross-Slot Coordination (CSCP):** Suppresses background NPC thoughts (like Inner-Entity) during card compilation, preventing corrupted story cards!
• **Two-Card Configuration:** Master *Configure Auto-Cards* card for cooldowns + Companion *Configure Entity Cards* card for live editable templates.
• **100% Backward Compatible:** Switch back to Classic Auto-Cards prose mode anytime via `/ec -m classic`.

🎮 **Quick Commands:**
• `/ec <Title> -<type>` — Generate with explicit type (`-p`, `-loc`, `-org`, `-item`, `-event`)
• `/ec -a` — Cancel active card generation
• `/ec -P <preset>` — Switch schema presets (`standard`, `lite`, `authoring`, `custom`)
• `/ec -i` — Cognitive engine diagnostics & card counts

🔗 **Add to your Scenario (Script Loader):**
https://play.aidungeon.com/script/05_w3s9zrrvt/entity-cards-ner

📖 **GitHub & Documentation:**
https://github.com/viosca/Entity-Cards
```

---

## Part 3: Unified Ecosystem Announcement (Overarching Post)

*Character count: ~1,930 characters (Discord limit: 2,000)*

```markdown
🚀 **Major AI Dungeon Script Release: The Modular Scripting Ecosystem is Live!** 📦🎭📇

A massive unified release is now live across **Entity Cards**, **Inner Entity**, **AID-Getopt**, and **AID-Modules**!

Powered by the **Cross-Slot Coordination Protocol (CSCP)**, these scripts now communicate across AI Dungeon's script execution pipeline—enabling zero-collision, multi-slot adventures with dynamic capability negotiation.

### 🌟 What’s New?

📇 **Entity Cards (v2.8.0-EC)**
• **Abort Controls:** Cancel active generations cleanly with `/ec -a`, `/ec --abort`, or `/ec cancel`.
• **Smarter Continuation:** Prompt preservation and toast notices (`cleanPromptOnCardGen`, `progressDisplay`).
• **Rejection Diagnostics:** Clear feedback for duplicate names, short titles, and empty inputs.
• **100-Token Slider Calibrated:** Dense 5-type YAML schemas with 4-letter **MBTI** profiles.

🎭 **Inner Entity (v2.8.0-IE)**
• **Autonomous NPC Cognition:** NPCs reflect in real time with private goals, secrets, and `🎭` thought badges.
• **Cross-VM Thought Suppression:** Inhibits NPC thoughts while Entity-Cards generates cards, preventing corrupted lore!
• **Dynamic Capability Yielding:** Mix All-in-One and Standalone scripts with zero double-engine collisions.

🎯 **AID-Getopt Router (v1.0.1)**
• **Waterfall Router:** Non-interfering command passthrough across multi-script setups.
• **Mobile Smart Punctuation:** Normalizes iOS/Android em-dashes (`—`) and curly quotes (`“ ”`).
• **Dialogue Quoting:** Type commands naturally in Say mode (`> You say, "/ec -p Molly."`).

📦 **AID-Modules (v1.1.0)**
• Open standard for module registration, SemVer discovery, and unified `/help` aggregation.

🔗 **Documentation & Code:**
• **Entity Cards:** https://github.com/viosca/Entity-Cards
• **Inner Entity:** https://github.com/viosca/Inner-Entity
• **Creator Guide:** Check `DYNAMIC_SLOT_MANAGEMENT_GUIDE.md` in the repos!
```
