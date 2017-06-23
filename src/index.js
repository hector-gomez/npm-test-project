const packageA = require("npm-test-package-a");

console.log("This is a dummy project");
console.log("It requires package A, which requires package B");
console.log("-----------------------------------------------");
console.log(`Package A says:\n${packageA.message}`);
