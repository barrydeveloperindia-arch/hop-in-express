/**
 * Simple heuristics-based copy generator (Simulating AI for demo speed).
 * In production, this would call OpenAI/Claude API.
 */
const TEMPLATES = {
    "Spicy": "Kick off the heat with our bold {item}. Perfect for spice lovers seeking a thrill.",
    "Sweet": "Indulge in the rich, sugary delight of {item}. A perfect treat for any time of day.",
    "Fresh": "Farm-fresh {item}, harvested at peak ripeness for maximum flavor and crunch.",
    "Frozen": "Convenient and delicious {item}, ready to cook straight from the freezer.",
    "Drink": "Refresh yourself with a cold {item}. The ultimate thirst quencher.",
    "Default": "Premium quality {item}, sourced with care to bring you the best taste experience."
};

const TAGS = {
    "Spicy": ["Hot", "Party", "Snack"],
    "Sweet": ["Dessert", "Indulgent", "Treat"],
    "Fresh": ["Healthy", "Organic", "Raw"],
    "Default": ["Essential", "Pantry", "Quality"]
};

// Simple keyword matching
function getCategory(name) {
    const n = name.toLowerCase();
    if (n.includes("chilli") || n.includes("spicy") || n.includes("wings")) return "Spicy";
    if (n.includes("cake") || n.includes("chocolate") || n.includes("ice cream")) return "Sweet";
    if (n.includes("banana") || n.includes("apple") || n.includes("veg")) return "Fresh";
    if (n.includes("pizza") || n.includes("fries")) return "Frozen";
    if (n.includes("cola") || n.includes("juice") || n.includes("water")) return "Drink";
    return "Default";
}

const args = process.argv.slice(2);
const itemName = args[0] || "Mystery Item";
const cat = getCategory(itemName);

const copy = TEMPLATES[cat].replace("{item}", itemName);
const tags = TAGS[cat] || TAGS["Default"];

console.log(`\n✨ Copy Suggestion for: "${itemName}"`);
console.log(`----------------------------------------`);
console.log(`📝 Description: ${copy}`);
console.log(`🏷️  Tags:        ${tags.join(", ")}`);
console.log(`----------------------------------------\n`);
