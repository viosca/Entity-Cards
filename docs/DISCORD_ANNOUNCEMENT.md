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

## Part 2: Suggested Edits for the Thread Original Post (OP)

When updating the top post of the thread:
1. Update version to **v2.8.0-EC**.
2. Add `/ec -a`, `/ec --abort`, and `/ec cancel` to the command cheat sheet.
3. Add a note about the new companion card options: `cleanPromptOnCardGen` and `progressDisplay`.
4. Link to `DYNAMIC_SLOT_MANAGEMENT_GUIDE.md` for creators using multi-slot script architectures.

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
