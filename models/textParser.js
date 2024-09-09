function parseTextToMap(text) {
  if (typeof text !== "string") {
    throw new TypeError("Input must be a string");
  }

  if (!text.trim()) {
    return "No text provided";
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const result = [];
  let currentMainSection = null;
  let currentAlphabetSubpoint = null;
  let currentDefinition = "";
  let inDefinition = false;

  const mainSectionRegex = /^(\d+(\.\d+)*)(\([a-z]\))?\s*\.?\s*(.*)/;
  const subpointRegex = /^\((\w+)\)\s*(.*)/;
  const definitionRegex = /^"([^"]+)"\s+means\s+(.*)/;
  const romanRegex = /^\((i+|v+|x+)\)\s*(.*)/i;

  for (const line of lines) {
    const mainSectionMatch = line.match(mainSectionRegex);
    const subpointMatch = line.match(subpointRegex);
    const definitionMatch = line.match(definitionRegex);
    const romanMatch = line.match(romanRegex);

    if (mainSectionMatch) {
      currentMainSection = {
        key: mainSectionMatch[1],
        text: mainSectionMatch[4].trim(),
        subpoints: []
      };
      const sub = mainSectionMatch[3] ? mainSectionMatch[3] : null;

      if (sub) {
        currentAlphabetSubpoint = {
          key: sub.replace(/[()]/g, ''),
          text: mainSectionMatch[4].trim(),
          subpoints: []
        };
        currentMainSection.subpoints.push(currentAlphabetSubpoint);
      } else {
        currentAlphabetSubpoint = null;
      }

      result.push(currentMainSection);
      currentDefinition = "";
      inDefinition = false;

    } else if (subpointMatch && currentMainSection) {
      let subpointKey = subpointMatch[1];
      let subpointText = subpointMatch[2].trim();

      if (subpointKey !== currentAlphabetSubpoint?.key) {
        currentAlphabetSubpoint = {
          key: subpointKey,
          text: subpointText,
          subpoints: []
        };
        currentMainSection.subpoints.push(currentAlphabetSubpoint);
      } else if (currentAlphabetSubpoint) {
        currentAlphabetSubpoint.text += " " + subpointText;
      }

    } else if (romanMatch && currentAlphabetSubpoint) {
      const romanKey = `${currentAlphabetSubpoint.key}.${romanMatch[1].toLowerCase()}`;
      const roman = {
        key: romanKey,
        text: romanMatch[2].trim()
      };

      currentAlphabetSubpoint.subpoints.push(roman);
    } else if (definitionMatch) {
      currentDefinition = definitionMatch[1];
      inDefinition = true;

      if (!currentMainSection.definitions) {
        currentMainSection.definitions = [];
      }

      currentMainSection.definitions.push({
        key: currentDefinition,
        text: definitionMatch[2].trim()
      });
    } else if (inDefinition && currentMainSection) {
      currentMainSection.definitions[currentMainSection.definitions.length - 1].text += " " + line.trim();
    } else if (currentAlphabetSubpoint) {
      currentAlphabetSubpoint.text += " " + line.trim();
    } else if (currentMainSection) {
      currentMainSection.text += " " + line.trim();
    }
  }

  return result;
}

module.exports = { parseTextToMap };
