require('dotenv').config();
const Slimbot = require('slimbot');

const slimbot = new Slimbot(process.env.TELEGRAM_TOKEN);

exports.sendMessage = (text) => {
  [process.env.TELEGRAM_ID].map((id) => {
    slimbot.sendMessage(id, text);
  });
  console.log(`Message sent`);
};
