const { query } = require('../lib/mysql');

exports.getAccounts = async (id) => {
  const results = await query('SELECT * FROM account');
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

exports.createAccount = async (email, telegramConversationId) => {
  const results = await query('INSERT INTO account (email, telegram_conversation_id) VALUES ?', [
    email,
    telegramConversationId,
  ]);
  return results.length ? results[0] : null;
};

exports.updateState = async (id, state) => {
  const results = await query('UPDATE account SET state = ? WHERE id = ?', [
    JSON.stringify(state),
    id,
  ]);
  return results.length ? results[0] : null;
};
