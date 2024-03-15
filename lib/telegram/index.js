require("dotenv").config();
const Slimbot = require("slimbot");
const moment = require("moment");

const slimbot = new Slimbot(process.env.TELEGRAM_TOKEN);

exports.sendMessage = (telegramIds, text) => {
  if (!Array.isArray(telegramIds)) {
    telegramIds = [telegramIds];
  }
  telegramIds.map((id) => {
    slimbot.sendMessage(id, text);
  });
  console.log(`Message sent`);
};

exports.listen = () => {
  return new Promise((resolve) => {
    slimbot.on("message", (message) => {
      slimbot.stopPolling();
      resolve(message.text);
    });
    slimbot.startPolling();
  });
};

exports.listener = (callback) => {
  slimbot.on("message", (message) => {
    callback(message);
  });
  slimbot.startPolling();
};

exports.sendNotification = (telegramIds, item) => {
  this.sendMessage(
    telegramIds,
    `TooGoodToGo\n Un panier est disponible chez : \n${
      item.display_name
    } \nA récupérer entre le ${moment(item.pickup_interval.start).format(
      "LLLL"
    )} et le ${moment(item.pickup_interval.end).format(
      "LLLL"
    )} \n https://share.toogoodtogo.com/item/${item.item.item_id} \n\n`
  );
};

exports.sendPackageNotification = (telegramIds, item) => {
  this.sendMessage(
    telegramIds,
    `TooGoodToGo\n Un colis est disponible chez : \n${item.display_name}
\n https://share.toogoodtogo.com/item/${item.item.item_id} \n\n`
  );
};
