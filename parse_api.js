const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('api_response.json', 'utf8'));

    console.log("--- Targets.Production ---");
    console.log(JSON.stringify(data.targets?.production, null, 2));

    console.log("\n--- Checking for ALL keys in latest deployment ---");
    if (data.latestDeployments && data.latestDeployments[0]) {
        console.log(Object.keys(data.latestDeployments[0]).join(', '));
    }
} catch (e) {
    console.error(`Error parsing: ${e}`);
}
