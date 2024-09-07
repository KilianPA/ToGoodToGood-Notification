const { query } = require("../lib/mysql");

exports.getAccounts = async (id) => {
  const results = await query("SELECT * FROM account where enable = 1");
  if (results.length) {
    return results.map((result) => {
      return {
        id: result.id,
        email: result.email,
        telegramConversationIds: JSON.parse(result.telegram_conversation_ids),
        state: result.state ? JSON.parse(result.state) : {},
      };
    });
  }
};

exports.getAccountByConversationId = async (telegramConversationId) => {
  const results = await query(
    "SELECT * FROM account WHERE telegram_conversation_ids like '%?%'",
    [telegramConversationId]
  );
  if (results.length) {
    return {
      id: results[0].id,
      email: results[0].email,
      telegramConversationIds: JSON.parse(results[0].telegram_conversation_ids),
      state: results[0].state ? JSON.parse(results[0].state) : {},
    };
  }
};

exports.getAccountByEmail = async (email) => {
  const results = await query("SELECT * FROM account WHERE email = ?", [email]);
  if (results.length) {
    return {
      id: results[0].id,
      email: results[0].email,
      telegramConversationIds: JSON.parse(results[0].telegram_conversation_ids),
      state: results[0].state ? JSON.parse(results[0].state) : {},
    };
  }
};

exports.createAccount = async (email, telegramConversationId) => {
  const results = await query(
    "INSERT INTO account (email, telegram_conversation_ids) VALUES (?, ?)",
    [email, JSON.stringify([telegramConversationId])]
  );
  return results.length ? results[0] : null;
};

exports.updateState = async (id, state) => {
  const results = await query("UPDATE account SET state = ? WHERE id = ?", [
    JSON.stringify(state),
    id,
  ]);
  return results.length ? results[0] : null;
};
