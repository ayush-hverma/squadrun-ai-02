
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

console.log("Original code:", sampleJSCode);
console.log("Refactored code:", refactorJavaScript(sampleJSCode));
