const { sendMessage } = require('./telegram');
const TooGoodToGo = require('./tgtg');
const moment = require('moment');
const { delay } = require('./utils/delay');

/**
 * @param {TooGoodToGo} tgtg
 */
const schedule = async (tgtg) => {
  await delay(1000);
  await tgtg.checkItemsWorkflow();
  await delay(1000);
  await tgtg.checkItemsWorkflow();
  await delay(1000);
  await schedule(tgtg);
};

(async () => {
  const email = process.env.TGTG_EMAIL;
  const tgtg = new TooGoodToGo({
    credentials: {
      email,
    },
  });
  try {
    await tgtg.login();
    await schedule(tgtg);
  } catch (err) {
    console.log(err);
    if ([401].includes(err.response.status)) {
      console.log('Token expired');
      await tgtg.login(true);
    }
  }
})();
