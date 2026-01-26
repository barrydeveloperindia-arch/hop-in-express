
const SCENARIOS = {
    "Rainy Day": {
        title: "Stay Dry! 🌧️",
        body: "Don't go out in the rain. Get comfort food delivered in 20 mins! 🍲",
        matches: ["soup", "tea", "coffee", "chocolate"]
    },
    "Late Night": {
        title: "Midnight Cravings? 🌙",
        body: "We are still open! Grab a snack before bed. 🍪",
        matches: ["chips", "ice cream", "soda"]
    },
    "Lunch Rush": {
        title: "Lunch is Served 🥪",
        body: "Skip the queue. Fresh sandwiches and drinks ready for you.",
        matches: ["sandwich", "meal deal", "bakery"]
    },
    "Default": {
        title: "Your Daily Favorites 🛒",
        body: "Stock up on essentials now. Fast delivery to your door.",
        matches: []
    }
};

const args = process.argv.slice(2);
const scenarioKey = args[0] || "Default";
const scenario = SCENARIOS[scenarioKey] || SCENARIOS["Default"];

console.log(JSON.stringify({
    notification: {
        title: scenario.title,
        body: scenario.body,
    },
    data: {
        type: "campaign",
        filter_tags: scenario.matches
    }
}, null, 2));
