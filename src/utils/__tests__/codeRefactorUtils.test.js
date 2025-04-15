
// Sample JS code for testing refactoring
const sampleJSCode = `
var name = "John";
var age = 30;
var items = ["apple", "banana", "orange"];

function processItems(items) {
  var result = [];
  for (var i = 0; i < items.length; i++) {
    result.push(items[i] + " processed");
  }
  return result;
}

function greet(name) {
  return "Hello, " + name + "!";
}

function fetchData() {
  return fetch("/api/data")
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      console.log("Error fetching data:", error);
    });
}

// Main function
function main() {
  console.log(greet(name));
  
  var processedItems = processItems(items);
  
  for (var i = 0; i < processedItems.length; i++) {
    console.log(processedItems[i]);
  }
  
  fetchData();
}

main();
`;

// Import the refactoring functions
import { refactorJavaScript } from "../codeRefactorUtils";

// Test the JavaScript refactoring
test("JavaScript code refactoring", () => {
  const refactoredCode = refactorJavaScript(sampleJSCode);
  
  // Check that 'var' was replaced with 'const' or 'let'
  expect(refactoredCode.includes("var name")).toBeFalsy();
  expect(refactoredCode.includes("const name")).toBeTruthy();
  
  // Check that string concatenation was replaced with template literals
  expect(refactoredCode.includes("Hello, " + name + "!")).toBeFalsy();
  expect(refactoredCode.includes("`Hello, ${name}!`")).toBeTruthy();
  
  // Check that traditional functions were converted to arrow functions
  expect(refactoredCode.includes("function processItems")).toBeFalsy();
  expect(refactoredCode.includes("const processItems =")).toBeTruthy();
  
  // Check that for loops were replaced with array methods
  expect(refactoredCode.includes("for (var i = 0; i < items.length; i++)")).toBeFalsy();
  expect(refactoredCode.includes(".forEach(") || 
         refactoredCode.includes(".map(")).toBeTruthy();
  
  // Check that promise chains were replaced with async/await
  expect(refactoredCode.includes("return fetch")).toBeFalsy();
  expect(refactoredCode.includes("const response = await fetch") || 
         refactoredCode.includes("try {")).toBeTruthy();
  
  // Check for proper docstrings
  expect(refactoredCode.includes("/**")).toBeTruthy();
  expect(refactoredCode.includes("@param")).toBeTruthy();
  
  // Check for use strict directive
  expect(refactoredCode.includes("use strict")).toBeTruthy();
  
  // Check for modern entry point pattern
  expect(refactoredCode.includes("main();")).toBeFalsy();
  expect(refactoredCode.includes("// Entry point")).toBeTruthy();
  expect(refactoredCode.includes("async ()")).toBeTruthy();
         
  // New checks for enhanced refactoring
  expect(refactoredCode.includes("try {")).toBeTruthy(); // Error handling
  expect(refactoredCode.includes("catch (error)")).toBeTruthy(); // Error catching
  expect(refactoredCode.includes("Debug info:")).toBeTruthy(); // Better logging
  
  console.log("Original code:", sampleJSCode);
  console.log("Refactored code:", refactoredCode);
});
