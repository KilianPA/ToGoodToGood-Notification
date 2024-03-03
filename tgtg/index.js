const moment = require('moment');
const fs = require('fs');
moment.locale('fr');
const telegram = require('../telegram');

const {
  login,
  authenticate,
  authByPinCode,
  setBearerToken,
  getItems,
  getSettings,
  setDatadomeCookie,
  refreshToken,
  deleteHeaders,
  getPackages,
} = require('./client');
const prompt = require('async-prompt');

class TooGoodToGo {
  #accessToken;
  #itemsSeen = [];
  #packagesEverSeen;
  state = {};

  constructor(state) {
    this.state = {
      session: {},
      credentials: {},
      items: [],
      packages: [],
      ...state,
    };
  }

  async login(force = false) {
    if (!force) this.loadState();

    if (!this.state.session?.accessToken || force) {
      this.state.session = {};
      deleteHeaders(['Authorization', 'Cookie']);
      const { polling_id } = await login(this.state.credentials.email);
      this.state.session.pollingId = polling_id;
      await this.authenticate();
    }
    setBearerToken(this.state.session.accessToken);
    setDatadomeCookie(this.state.session.datadome);
    this.saveState();
    await this.setUser();
  }

  async setUser() {
    const { user } = await getSettings();
    this.state.user = user;
    this.saveState();
  }

  async authenticate() {
    await authenticate(this.state.credentials.email, this.state.session.pollingId);
    const pinCode = await prompt('Enter pin code: ');
    const { access_token, access_token_ttl_seconds, refresh_token, datadome } =
      await this.authByPinCode(pinCode);
    this.state.session = {
      datadome,
      accessToken: access_token,
      accessTokenTtlSeconds: access_token_ttl_seconds,
      refreshToken: refresh_token,
      lastRefresh: moment(),
    };
  }

  async authByPinCode(pinCode) {
    return authByPinCode(this.state.credentials.email, pinCode, this.state.session.pollingId);
  }

  async checkItemsWorkflow() {
    console.log('[TooGoodToGo] checking items');
    return new Promise(async (resolve, reject) => {
      let items = await getItems({
        bucket: {
          filler_type: 'Favorites',
        },
        origin: {
          latitude: 43.66370861766941,
          longitude: 7.186696684895937,
        },
        paging: {
          page: 0,
          size: 50,
        },
        radius: 1,
        user_id: this.state.user.user_id,
      });

      // Remove items already seen
      items = items.filter(
        (item) => item.items_available > 0 && !this.state.items.includes(item.item.item_id)
      );

      // Add new items to itemsSeen
      this.state.items = [...this.state.items, ...items.map((item) => item.item.item_id)];

      await Promise.all(items.map((item) => telegram.sendNotification(item)));
      resolve('done');
      this.saveState();
    });
  }

  async refreshToken() {
    console.log(
      `Next refresh at ${moment(this.state.session.lastRefresh)
        .add(this.state.session.accessTokenTtlSeconds, 'seconds')
        .format('LLLL')}`
    );
    if (
      moment().diff(this.state.session.lastRefresh, 'seconds') >
      this.state.session.accessTokenTtlSeconds - 60
    ) {
      const { access_token, access_token_ttl_seconds, refresh_token } = await refreshToken(
        this.state.session.accessToken,
        this.state.session.refreshToken
      );
      console.log('[TooGoodToGo] refreshing token');
      this.state.session = {
        ...this.state.session,
        accessToken: access_token,
        accessTokenTtlSeconds: access_token_ttl_seconds,
        refreshToken: refresh_token,
        lastRefresh: moment(),
      };
      setBearerToken(access_token);
      this.saveState();
    }
  }

  async loadState() {
    if (fs.existsSync('./tgtg/state.json')) {
      const state = JSON.parse(fs.readFileSync('./tgtg/state.json'));
      if (Object.keys(state).length && state.constructor === Object) {
        this.state = JSON.parse(fs.readFileSync('./tgtg/state.json'));
      }
      console.log('[TooGoodToGo] state loaded');
    }
  }

  async saveState() {
    console.log('Saving state');
    fs.writeFileSync('./tgtg/state.json', JSON.stringify(this.state));
  }

  async checkPackagesWorkflow() {
    console.log('[TooGoodToGo] checking packages');
    return new Promise(async (resolve, reject) => {
      let packages = await getPackages();
      // Remove packages already seen
      packages = packages.filter(
        (p) =>
          p.items_available > 0 && !this.state.packages.find((sp) => sp.package_id === p.package_id)
      );

      // Add new packages to packagesSeen
      this.state.packages = [...this.state.packages, ...packages];

      await Promise.all(packages.map((item) => telegram.sendPackageNotification(item)));
      resolve('done');
      this.saveState();
    });
  }
}

module.exports = TooGoodToGo;
