const fs = require("fs");
console.log("./scripts/prune.js - pruning JSON files to reduce bundle size");
const filePaths = process.argv.slice(2);
filePaths.forEach((fp) => {
  const file = fs.readFileSync(fp);
  const obj = JSON.parse(file);

  prune(obj, [/abi/, /ArrakisERC4626.*/, /Beefy.*/]);

  fs.writeFileSync(fp, JSON.stringify(obj, 0, 2));
});

/**
 * Recursively removes any properties from obj whose names match any of the regex in toRemove
 * @param obj - JSON object to prune
 * @param toRemove - Array of RegExp objects for identifying properties to prune
 */
function prune(obj, toRemove) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      for (const nameRegex of toRemove) {
        if (nameRegex.test(property)) {
          delete obj[property];
        }
      }

      if (typeof obj[property] == "object" && !Array.isArray(obj[property])) {
        prune(obj[property], toRemove);
      }
    }
  }
}
