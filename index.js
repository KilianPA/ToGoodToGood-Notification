const { sendMessage } = require("./lib/telegram");
const TooGoodToGo = require("./class/tgtg");
const moment = require("moment");
const { delay } = require("./utils/delay");
const account = require("./model/account");
const clients = {};

/**
 * @param {TooGoodToGo} client
 */
const schedule = async () => {
  for (const [email, client] of Object.entries(clients)) {
    await client.checkItemsWorkflow();
    await delay(6000);
    await client.checkPackagesWorkflow();
    await delay(6000);
    await client.refreshToken();
  }
  await delay(6000);
  await setAccounts();
  await schedule();
};

const logAccounts = async (accounts) => {
  for (const account of accounts) {
    const state = Object.keys(account.state).length
      ? account.state
      : {
          credentials: {
            email: account.email,
          },
        };
    const client = new TooGoodToGo({
      ...state,
      accountId: account.id,
      telegramConversationIds: account.telegramConversationIds,
    });
    try {
      const token = await client.login();
      if (token) {
        clients[account.email] = client;
      }
    } catch (err) {
      console.log(err);
      if ([401].includes(err.response.status)) {
        console.log("Token expired");
        await client.login(true);
      }
    }
  }
};

const setAccounts = async () => {
  const accounts = await account.getAccounts();
  await logAccounts(accounts || []);
};

(async () => {
  await setAccounts();
  try {
    await schedule();
  } catch (err) {
    console.log(err);
    if ([401].includes(err.response.status)) {
      console.log("Token expired");
      await client.login(true);
    }
  }
})();
