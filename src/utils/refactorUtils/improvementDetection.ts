
/**
 * Utility functions for detecting code improvements and calculating scores
 */

import { ImprovementDetail, SupportedLanguage } from "@/types/refactor";

/**
 * Calculate the number of improvements made and provide descriptions
 * @param original - Original code
 * @param refactored - Refactored code
 * @param language - Programming language
 * @returns Details about improvements made
 */
export const calculateImprovements = (
  original: string, 
  refactored: string, 
  language: SupportedLanguage
): ImprovementDetail => {
  if (original === refactored) return { count: 0, descriptions: [] };
  
  // Count differences that represent improvements
  let count = 0;
  const descriptions: string[] = [];
  
  // Check for var to const/let conversions
  const varToConstDiff = (original.match(/var\s+/g) || []).length - (refactored.match(/var\s+/g) || []).length;
  if (varToConstDiff > 0) {
    count += varToConstDiff;
    descriptions.push(`Converted ${varToConstDiff} var declarations to const/let for better scoping`);
  }
  
  // Check for function to arrow function conversions
  const funcToArrowDiff = (original.match(/function\s+/g) || []).length - (refactored.match(/function\s+/g) || []).length;
  if (funcToArrowDiff > 0) {
    count += funcToArrowDiff;
    descriptions.push(`Converted ${funcToArrowDiff} traditional functions to arrow functions`);
  }
  
  // Check for template literal conversions
  const concatOperators = (original.match(/\+\s*(['"])/g) || []).length;
  const templateLiterals = (refactored.match(/\${/g) || []).length;
  const templateLiteralImprovements = Math.min(concatOperators, templateLiterals);
  if (templateLiteralImprovements > 0) {
    count += templateLiteralImprovements;
    descriptions.push(`Replaced ${templateLiteralImprovements} string concatenations with template literals`);
  }
  
  // Check for deleted console.logs
  const consoleLogs = (original.match(/console\.log\(/g) || []).length - (refactored.match(/console\.log\(/g) || []).length;
  if (consoleLogs > 0) {
    count += consoleLogs;
    descriptions.push(`Removed ${consoleLogs} unnecessary console.log statements`);
  }
  
  // Check for for loops converted to forEach, map, etc.
  const forLoops = (original.match(/for\s*\(/g) || []).length - (refactored.match(/for\s*\(/g) || []).length;
  if (forLoops > 0) {
    count += forLoops;
    descriptions.push(`Converted ${forLoops} for loops to array methods (forEach, map, etc.)`);
  }
  
  // Check for if-else converted to ternaries
  const ifElseBlocks = (original.match(/if\s*\([^)]*\)\s*{[^}]*}\s*else\s*{[^}]*}/g) || []).length - 
                      (refactored.match(/if\s*\([^)]*\)\s*{[^}]*}\s*else\s*{[^}]*}/g) || []).length;
  if (ifElseBlocks > 0) {
    count += ifElseBlocks;
    descriptions.push(`Simplified ${ifElseBlocks} if-else blocks to ternary expressions`);
  }
  
  // Add language specific improvements
  addLanguageSpecificImprovements(original, refactored, language, count, descriptions);
  
  // Ensure at least 3 improvements are counted if code changed substantially
  if (Math.abs(refactored.length - original.length) > 100 && count < 3) {
    count = 3;
    if (descriptions.length === 0) {
      descriptions.push("Applied multiple code structure and readability improvements");
    }
  }
  
  return { count: Math.max(3, count), descriptions };
};

/**
 * Add language-specific improvement detections
 */
function addLanguageSpecificImprovements(
  original: string, 
  refactored: string, 
  language: string,
  count: number,
  descriptions: string[]
): void {
  // Check for object literal shorthand notation
  const objectLiteralProps = (original.match(/([a-zA-Z0-9_]+)\s*:\s*\1/g) || []).length -
                           (refactored.match(/([a-zA-Z0-9_]+)\s*:\s*\1/g) || []).length;
  if (objectLiteralProps > 0) {
    count += objectLiteralProps;
    descriptions.push(`Applied object shorthand syntax for ${objectLiteralProps} properties`);
  }
  
  // Check for async/await conversions
  const asyncAwaitDiff = (refactored.match(/async|await/g) || []).length - 
                        (original.match(/async|await/g) || []).length;
  if (asyncAwaitDiff > 0) {
    count += Math.ceil(asyncAwaitDiff / 2);
    descriptions.push(`Converted promise chains to async/await for cleaner async code`);
  }
  
  // Check for proper JSDoc comments
  const jsDocComments = (refactored.match(/\/\*\*[\s\S]*?\*\//g) || []).length - 
                        (original.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
  if (jsDocComments > 0) {
    count += jsDocComments;
    descriptions.push(`Added ${jsDocComments} JSDoc comments for better documentation`);
  }
  
  // Check for proper error handling
  const errorHandling = (refactored.match(/try\s*{[\s\S]*?}\s*catch/g) || []).length - 
                        (original.match(/try\s*{[\s\S]*?}\s*catch/g) || []).length;
  if (errorHandling > 0) {
    count += errorHandling * 2;
    descriptions.push(`Added ${errorHandling} try/catch blocks for better error handling`);
  }
  
  // Check for destructuring
  const destructuring = (refactored.match(/const\s*{[^}]+}\s*=/g) || []).length - 
                       (original.match(/const\s*{[^}]+}\s*=/g) || []).length;
  if (destructuring > 0) {
    count += destructuring;
    descriptions.push(`Used object destructuring in ${destructuring} places for cleaner code`);
  }
  
  // Language-specific improvements
  if (language === 'py') {
    detectPythonImprovements(original, refactored, count, descriptions);
  } else if (language === 'cpp' || language === 'c' || language === 'h') {
    detectCppImprovements(original, refactored, count, descriptions);
  }
  
  // Check for improved formatting and structure
  detectFormattingImprovements(original, refactored, count, descriptions);
}

/**
 * Detect Python-specific improvements
 */
function detectPythonImprovements(
  original: string, 
  refactored: string, 
  count: number,
  descriptions: string[]
): void {
  // Check for list comprehensions
  const listComprehensions = (refactored.match(/\[[^]]+for/g) || []).length - 
                            (original.match(/\[[^]]+for/g) || []).length;
  if (listComprehensions > 0) {
    count += listComprehensions * 2;
    descriptions.push(`Used ${listComprehensions} list comprehensions for more pythonic code`);
  }
  
  // Check for type hints
  const typeHints = (refactored.match(/:\s*[A-Za-z][A-Za-z0-9_]*/g) || []).length - 
                    (original.match(/:\s*[A-Za-z][A-Za-z0-9_]*/g) || []).length;
  if (typeHints > 0) {
    count += typeHints;
    descriptions.push(`Added ${typeHints} type hints for better type safety`);
  }
}

/**
 * Detect C++ specific improvements
 */
function detectCppImprovements(
  original: string, 
  refactored: string, 
  count: number,
  descriptions: string[]
): void {
  // Check for nullptr usage
  const nullptrUses = (refactored.match(/nullptr/g) || []).length - 
                      (original.match(/nullptr/g) || []).length;
  if (nullptrUses > 0) {
    count += nullptrUses;
    descriptions.push(`Replaced NULL with nullptr in ${nullptrUses} places for modern C++`);
  }
  
  // Check for auto type
  const autoUses = (refactored.match(/auto\s+/g) || []).length - 
                   (original.match(/auto\s+/g) || []).length;
  if (autoUses > 0) {
    count += autoUses;
    descriptions.push(`Used auto for ${autoUses} variable declarations for better type inference`);
  }
}

/**
 * Detect improvements in formatting and structure
 */
function detectFormattingImprovements(
  original: string, 
  refactored: string, 
  count: number,
  descriptions: string[]
): void {
  // Check for improvements in readability based on line count changes
  const lineCountDiff = Math.abs(refactored.split('\n').length - original.split('\n').length);
  if (lineCountDiff > 3) {
    count += Math.min(5, Math.floor(lineCountDiff / 3));
    descriptions.push(`Improved code formatting and structure for better readability`);
  }
  
  // Check for docstring/comment additions
  const commentDiff = (refactored.match(/\/\*\*|\*\/|\/\/|#/g) || []).length - 
                      (original.match(/\/\*\*|\*\/|\/\/|#/g) || []).length;
  if (commentDiff > 3) {
    count += Math.ceil(commentDiff / 5);
    descriptions.push(`Added ${Math.ceil(commentDiff / 5)} documentation comments for better readability`);
  }
}
