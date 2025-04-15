
/**
 * Refactor Java code
 */
export const refactorJava = (code: string): string => {
  let refactored = code;
  
  // Replace raw loops with enhanced for loops
  refactored = refactored.replace(
    /for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*0\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+)\.size\(\)\s*;\s*\1\+\+\s*\)/g, 
    'for (var item : $2)'
  );
  
  // Use var instead of explicit types where possible
  refactored = refactored.replace(/([A-Z][a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*=\s*new\s+\1/g, 'var $2 = new $1');
  
  // Use streams for filtering and mapping
  refactored = refactored.replace(
    /List<([a-zA-Z0-9_]+)>\s+([a-zA-Z0-9_]+)\s*=\s*new\s+ArrayList<>\(\);[\s\n]*for\s*\(([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\)\s*{\s*if\s*\(([^}]*)\)\s*{\s*([a-zA-Z0-9_]+)\.add\(([^;]*)\);\s*}\s*}/g,
    'List<$1> $2 = $5.stream()\n  .filter($4 -> $6)\n  .map($4 -> $8)\n  .collect(Collectors.toList());'
  );
  
  // Add robust javadoc
  refactored = refactored.replace(
    /public\s+([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g,
    '/**\n * $2 method\n *\n * @param $3\n * @return $1\n */\npublic $1 $2($3)'
  );
  
  return refactored;
};
