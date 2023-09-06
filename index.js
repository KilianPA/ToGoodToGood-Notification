const { sendMessage } = require('./telegram');
const TooGoodToGo = require('./tgtg');
const moment = require('moment');

(async () => {
  const email = process.env.TGTG_EMAIL;
  try {
    const tgtg = new TooGoodToGo({
      email,
    });
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
    console.log(err.message);
  }
})();
