const { sendMessage } = require('./telegram');
const TooGoodToGo = require('./tgtg');
const moment = require('moment');

(async () => {
  const email = process.env.TGTG_EMAIL;
  const tgtg = new TooGoodToGo({
    email,
  });
  try {
    await tgtg.login();
    setInterval(async () => {
      console.log(`Checking for items at  ${moment().format('HH:mm:ss')}`);
      const items = await tgtg.getItems();
      if (items.length) {
        await Promise.all(
          items.map((item) =>
            sendMessage(
              `TooGoodToGo\n Un panier est disponible chez : \n${item.name} \nA récupérer entre le ${item.pickupStart} et le ${item.pickupEnd}`
            )
          )
        );
      }
    }, 60000);
  } catch (err) {
    if ([401].includes(err.response.status)) {
      console.log('Token expired');
      await tgtg.login(true);
    }
    console.log(err.message);
  }
})();
