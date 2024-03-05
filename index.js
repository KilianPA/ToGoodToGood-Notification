const { sendMessage } = require("./telegram");
const TooGoodToGo = require("./tgtg");
const moment = require("moment");
const { delay } = require("./utils/delay");

/**
 * @param {TooGoodToGo} client
 */
const schedule = async (client) => {
  await client.checkItemsWorkflow();
  await delay(4000);
  await client.checkPackagesWorkflow();
  await delay(60000);
  await client.refreshToken();
  await schedule(client);
};

(async () => {
  const email = process.env.TGTG_EMAIL;
  const client = new TooGoodToGo({
    credentials: {
      email,
    },
  });
  try {
    await client.login();
    await schedule(client);
  } catch (err) {
    console.log(err);
    if ([401].includes(err.response.status)) {
      console.log("Token expired");
      await client.login(true);
    }
  }
})();
