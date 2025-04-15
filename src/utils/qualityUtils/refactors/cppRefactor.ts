
/**
 * Refactor C/C++ code
 */
export const refactorCPP = (code: string): string => {
  let refactored = code;
  
  // Replace NULL with nullptr
  refactored = refactored.replace(/\bNULL\b/g, 'nullptr');
  
  // Use auto for variable declarations where type is obvious
  refactored = refactored.replace(/(std::)?([a-zA-Z0-9_:]+)<[^>]+>\s+([a-zA-Z0-9_]+)\s*=\s*/g, 'auto $3 = ');
  
  // Replace raw loops with range-based for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (const auto& element : $2)'
  );
  
  // Convert raw pointers to smart pointers
  refactored = refactored.replace(
    /([a-zA-Z0-9_]+)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_]+)/g,
    'std::unique_ptr<$1> $2 = std::make_unique<$3>'
  );
  
  // Add comprehensive error handling
  refactored = refactored.replace(
    /try\s*{([^}]*)}(\s*)catch\s*\(([^)]*)\)\s*{([^}]*)}/g,
    'try {\n$1\n}$2catch (const $3& e) {\n    std::cerr << "Error: " << e.what() << std::endl;\n$4\n}'
  );
  
  return refactored;
};
