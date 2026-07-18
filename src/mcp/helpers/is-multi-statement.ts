// Detects a ";" separating statements, ignoring ones inside single-quoted
// literals, dollar-quoted strings, and comments. A trailing ";" is fine.
//
// This check is what makes the READ ONLY transaction wrapper sound. The
// Postgres simple query protocol executes a multi-statement string
// sequentially on the same connection, so a payload like
// "SELECT 1; COMMIT; DELETE FROM orders" would COMMIT the read-only
// transaction mid-string and run the rest in a fresh implicit read-write
// transaction. Session-level read-only defaults don't help either — they are
// not privileged and the payload could simply SET them back. Rejecting
// multi-statement queries guarantees every statement runs inside the
// read-only transaction that was opened for it.
export const isMultiStatement = (query: string): boolean => {
  const stripped = query
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1\$/g, "''")
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  return stripped.replace(/;\s*$/, '').includes(';')
}
