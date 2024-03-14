const account = require("./model/account");

(async () => {
  const accounts = await account.getAccounts();
  console.log(accounts);
  // const newAccount = await account.createAccount("
})();
