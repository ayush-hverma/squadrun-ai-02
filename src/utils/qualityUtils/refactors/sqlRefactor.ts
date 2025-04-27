
import { RefactoringOptions } from './';

// Common SQL keywords map for formatting and identification
const SQL_KEYWORDS = {
  mainClauses: ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
  joins: ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN'],
  operations: ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'],
  modifiers: ['DISTINCT', 'UNION', 'ALL'],
  conditions: ['AND', 'OR', 'IN', 'NOT', 'NULL', 'IS'],
  flowControl: ['CASE', 'WHEN', 'THEN', 'ELSE', 'END']
};

const formatSQL = (sql: string): string => {
  const allKeywords = Object.values(SQL_KEYWORDS).flat();
  const keywordPattern = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'gi');
  
  return sql.replace(keywordPattern, match => match.toUpperCase());
};

const addIndentation = (sql: string): string => {
  return sql
    .replace(/\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY)\b/gi, '\n$1')
    .replace(/\b(LEFT |RIGHT |INNER |OUTER )?JOIN\b/gi, '\n  JOIN')
    .replace(/,\s*([^,\n]+)/g, ',\n  $1');
};

export const refactorSQL = (code: string, options: RefactoringOptions): string => {
  let refactoredCode = formatSQL(code);
  refactoredCode = addIndentation(refactoredCode);

  if (options.aggressive) {
    // Format subqueries
    refactoredCode = refactoredCode.replace(/\((SELECT[^)]+)\)/gi, '(\n  $1\n)');
    
    // Add descriptive comments if enabled
    if (options.techniques?.addComments) {
      const hasJoins = SQL_KEYWORDS.joins.some(join => 
        refactoredCode.toUpperCase().includes(join));
      const hasAggregations = /COUNT|SUM|AVG|MIN|MAX/i.test(refactoredCode);
      
      const comments = [
        hasJoins && '-- Joining tables',
        hasAggregations && '-- Query includes aggregations'
      ].filter(Boolean);
      
      if (comments.length > 0) {
        refactoredCode = `${comments.join('\n')}\n${refactoredCode}`;
      }
    }
  }

  return refactoredCode;
};

