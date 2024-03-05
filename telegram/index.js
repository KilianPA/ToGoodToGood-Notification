require("dotenv").config();
const Slimbot = require("slimbot");
const moment = require("moment");

const slimbot = new Slimbot(process.env.TELEGRAM_TOKEN);

exports.sendMessage = (text) => {
  JSON.parse(process.env.TELEGRAM_IDS).map((id) => {
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

exports.sendNotification = (item) => {
  this.sendMessage(
    `TooGoodToGo\n Un panier est disponible chez : \n${
      item.display_name
    } \nA récupérer entre le ${moment(item.pickup_interval.start).format(
      "LLLL"
    )} et le ${moment(item.pickup_interval.end).format(
      "LLLL"
    )} \n https://share.toogoodtogo.com/item/${item.item.item_id} \n\n`
  );
};

exports.sendPackageNotification = (item) => {
  this.sendMessage(
    `TooGoodToGo\n Un colis est disponible chez : \n${item.display_name}
\n https://share.toogoodtogo.com/item/${item.item.item_id} \n\n`
  );
};
