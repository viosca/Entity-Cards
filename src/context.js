// Your "Context" tab should look like this
const modifier = (text) => {
  // If running alongside Inner Self / Inner Entity:
  // (globalThis.InnerEntity || InnerSelf)("context");

  // Your other context modifier scripts go here (preferred)
  [text, stop] = AutoCards("context", text, stop);
  // Optional: Rename World Lore header to Named Entities (NER) if using NER/JFSH mode:
  // text = text.replace(/^World Lore:$/m, "Named Entities (NER):");
  // Your other context modifier scripts go here (alternative)
  return {text, stop};
};
modifier(text);
