// Allowlist of statements that are read-only by construction. Needed for
// MySQL, where a READ ONLY transaction blocks DML but not DDL: DDL statements
// (CREATE/ALTER/DROP/TRUNCATE/...) implicitly COMMIT the current transaction
// and then execute outside of it, escaping the read-only protection. Postgres
// does not need this check — its read-only transactions reject DDL as well.
//
// Writes hidden behind an allowed prefix (e.g. MySQL's "WITH ... DELETE")
// still fail: they are DML, which the READ ONLY transaction does block.
export const isReadStatement = (query: string): boolean => {
  const withoutLeadingComments = query.replace(
    /^(\s+|--[^\n]*\n?|#[^\n]*\n?|\/\*[\s\S]*?\*\/)+/,
    '',
  )

  return /^(select|with|show|describe|desc|explain)\b/i.test(
    withoutLeadingComments,
  )
}
