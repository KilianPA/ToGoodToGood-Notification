const { query } = require("../lib/mysql");

exports.getPendingRequest = async (accountId, type) => {
  const results = await query(
    "SELECT * FROM request WHERE account_id = ? AND type = ? AND deleted_at is null",
    [accountId, type]
  );
  return results.length ? results[0] : null;
};

exports.createRequest = async (accountId, type, data) => {
  const results = await query(
    "INSERT INTO request (account_id, type, created_at) VALUES (?, ?, NOW())",
    [accountId, type]
  );
  return results.length ? results[0] : null;
};

exports.setRequestValue = async (id, value) => {
  const results = await query("UPDATE request SET value = ? WHERE id = ?", [
    value,
    id,
  ]);
  return results.length ? results[0] : null;
};

exports.deleteRequest = async (id) => {
  const results = await query(
    "UPDATE request SET deleted_at = NOW() WHERE id = ?",
    [id]
  );
  return results.length ? results[0] : null;
};
