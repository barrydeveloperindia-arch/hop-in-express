/**
 * Simple synonym generator for demo purposes.
 * In a real agent, this would query an LLM for synonyms.
 */
const COMMON_SYNONYMS = {
    "coke": ["soda", "pop", "cola", "drink", "soft drink"],
    "banana": ["fruit", "fresh", "snack", "potassium", "healthy"],
    "bread": ["bakery", "loaf", "sliced", "toast", "sandwich"],
    "milk": ["dairy", "calcium", "drink", "white"],
    "chocolate": ["sweet", "candy", "bar", "treat", "cocoa"],
    "rice": ["grain", "basmati", "carb", "pantry", "cooking"],
    "default": ["groceries", "item", "shop"]
};

const args = process.argv.slice(2);
const itemName = (args[0] || "").toLowerCase();

function getSynonyms(name) {
    let tags = new Set([name]);

    // Check known dictionary
    for (const key in COMMON_SYNONYMS) {
        if (name.includes(key)) {
            COMMON_SYNONYMS[key].forEach(t => tags.add(t));
        }
    }

    // Fallbacks
    if (tags.size === 1) {
        COMMON_SYNONYMS["default"].forEach(t => tags.add(t));
    }

    return Array.from(tags);
}

const suggested = getSynonyms(itemName);

console.log(`\n🔍 Search Optimization for: "${itemName}"`);
console.log(`----------------------------------------`);
console.log(`Current:  [${itemName}]`);
console.log(`Proposed: [${suggested.join(", ")}]`);
console.log(`----------------------------------------\n`);
