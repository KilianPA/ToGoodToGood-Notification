const moment = require('moment');
moment.locale('fr');

const {
  login,
  authenticate,
  authByPinCode,
  setBearerToken,
  getItems,
  getSettings,
  setDatadomeCookie,
  refreshToken,
} = require('./client');
const prompt = require('async-prompt');

class TooGoodToGo {
  #accessToken;
  #accessTokenTtlSeconds;
  #datadome;
  #refreshToken;
  #pollingId;
  #user;
  #lastRefresh;
  #itemsSeen = [];

  constructor({ email, accessToken = null, datadome = null }) {
    this.#user = { email };
    this.#accessToken = accessToken;
    this.#datadome = datadome;
  }

  async login() {
    if (!this.#accessToken) {
      const { polling_id } = await login(this.#user.email);
      this.#pollingId = polling_id;
      await this.authenticate();
    }
    setBearerToken(this.#accessToken);
    setDatadomeCookie(this.#datadome);
    await this.setUser();
  }

  async setUser() {
    const { user } = await getSettings(this.#accessToken);
    this.#user = user;
  }

  async authenticate() {
    await authenticate(this.#user.email, this.#pollingId);
    const pinCode = await prompt('Enter pin code: ');
    const { access_token, access_token_ttl_seconds, refresh_token, datadome } =
      await this.authByPinCode(pinCode);
    this.#datadome = datadome;
    this.#accessToken = access_token;
    this.#accessTokenTtlSeconds = access_token_ttl_seconds;
    this.#refreshToken = refresh_token;
    this.#lastRefresh = moment();
  }

  async authByPinCode(pinCode) {
    return authByPinCode(this.#user.email, pinCode, this.#pollingId);
  }

  async getItems() {
    if (moment().diff(this.#lastRefresh, 'seconds') > this.#accessTokenTtlSeconds - 60) {
      await this.refreshToken();
    }
    let { items } = await getItems({
      diet_categories: [],
      discover: false,
      favorites_only: true,
      hidden_only: false,
      item_categories: [],
      origin: {
        latitude: 43.663787884626295,
        longitude: 7.188408548260815,
      },
      page: 1,
      page_size: 400,
      radius: 10,
      sort_option: 'RELEVANCE',
      user_id: this.#user.user_id,
      we_care_only: false,
      with_stock_only: true,
    });

    // Remove id in itemsSeen if not in items
    this.#itemsSeen = this.#itemsSeen.filter((id) =>
      items.find((item) => item.item.item_id === id)
    );

    // Remove items already seen
    items = items.filter((item) => !this.#itemsSeen.includes(item.item.item_id));

    // Add new items to itemsSeen
    this.#itemsSeen = [...this.#itemsSeen, ...items.map((item) => item.item.item_id)];

    return items.map((item) => ({
      identifier: item.item.item_id,
      name: item.display_name,
      pickupStart: moment(item.pickup_interval.start).format('LLLL'),
      pickupEnd: moment(item.pickup_interval.end).format('LLLL'),
    }));
  }

  async refreshToken() {
    const { access_token, access_token_ttl_seconds, refresh_token } = await refreshToken(
      this.#accessToken,
      this.#refreshToken
    );
    console.log('refreshing token');
    this.#accessToken = access_token;
    this.#accessTokenTtlSeconds = access_token_ttl_seconds;
    this.#refreshToken = refresh_token;
    this.#lastRefresh = moment();
    setBearerToken(this.#accessToken);
  }
}

module.exports = TooGoodToGo;
