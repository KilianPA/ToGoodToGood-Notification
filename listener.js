const TooGoodToGo = require("./class/tgtg");
const telegram = require("./lib/telegram");
const accountModel = require("./model/account");
const requestModel = require("./model/request");

const onMessage = async (message) => {
  const { chat, text } = message;
  const chatId = chat.id;
  let account;
  //   if (chatId) {
  //     account = await accountModel.getAccountByConversationId(chatId);
  //   }

  if (!text) return;
  else if (text.includes("/start")) {
    const email = text.split(" ")[1];
    if (!email) {
      telegram.sendMessage(chatId, "Please provide an email");
      return;
    }

    account = await accountModel.getAccountByEmail(email);
    if (account) {
      telegram.sendMessage(chatId, "Account already exists");
      return;
    }

    await accountModel.createAccount(email, chatId);
    await sendEmailCode(email);

    telegram.sendMessage(
      chatId,
      "Account created, send email code with /code <email> <code>"
    );
  } else if (text.includes("/code")) {
    const email = text.split(" ")[1];
    const code = text.split(" ")[2];

    if (!email) {
      telegram.sendMessage(chatId, "Please provide an email");
      return;
    }

    if (!code) {
      telegram.sendMessage(chatId, "Please provide a code");
      return;
    }

    account = await accountModel.getAccountByEmail(email);
    if (!account) {
      telegram.sendMessage(chatId, "Account not found");
      return;
    }

    const pendingRequest = await requestModel.getPendingRequest(
      account.id,
      "email_code"
    );
    if (!pendingRequest) {
      telegram.sendMessage(chatId, "No pending request found");
      return;
    }

    await requestModel.setRequestValue(pendingRequest.id, code);
    telegram.sendMessage(
      chatId,
      "Code received, account will be logged in shortly"
    );
  }
};

const sendEmailCode = async (email) => {
  account = await accountModel.getAccountByEmail(email);
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
  await client.login();
};

(async () => {
  telegram.listener(onMessage);
})();
