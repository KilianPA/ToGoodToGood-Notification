require('dotenv').config();
const Slimbot = require('slimbot');

const slimbot = new Slimbot(process.env.TELEGRAM_TOKEN);

exports.sendMessage = (text) => {
  JSON.parse(process.env.TELEGRAM_IDS).map((id) => {
    slimbot.sendMessage(id, text);
  });
  console.log(`Message sent`);
};

// // Debug
// slimbot.on('message', (message) => {
//   console.log(message);
// });

// // Call API

// slimbot.startPolling();
