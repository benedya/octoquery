// SQL Server has no read-only transaction mode, and T-SQL batches do not
// even require semicolons between statements ("SELECT 1 DELETE FROM x" is a
// valid batch), so neither a transaction characteristic nor the semicolon
// check can enforce read-only on their own. This check is one of two layers:
//
// 1. The statement must start with SELECT or WITH, and — after stripping
//    string literals, quoted/bracketed identifiers, and comments — must not
//    contain keywords that modify data or transaction state anywhere in the
//    batch. COMMIT/ROLLBACK are forbidden because a smuggled COMMIT would end
//    the wrapper transaction and let the rest of the batch run in autocommit.
// 2. The handler runs the query inside a transaction that is always rolled
//    back, so anything that still slips through (SQL Server DDL and DML are
//    both transactional) is reverted.
const FORBIDDEN_KEYWORDS =
  /\b(insert|update|delete|merge|exec|execute|create|alter|drop|truncate|grant|revoke|deny|commit|rollback|save|begin|backup|restore|bulk|dbcc|kill|shutdown|use|into|waitfor|openrowset|opendatasource|reconfigure|setuser)\b/i

export const isMssqlReadStatement = (query: string): boolean => {
  const stripped = query
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/\[[^\]]*\]/g, '[]')
    .replace(/"[^"]*"/g, '""')
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  return (
    /^\s*(select|with)\b/i.test(stripped) && !FORBIDDEN_KEYWORDS.test(stripped)
  )
}
