// VULNERABLE: query built by string concatenation (SQL injection).
export function findUser(db, username) {
  const sql = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.prepare(sql).get();
}

export function searchInvoices(db, term) {
  // Also concatenated — another injection point.
  return db.prepare('SELECT * FROM invoices WHERE detail LIKE "%' + term + '%"').all();
}
