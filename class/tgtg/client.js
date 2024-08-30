const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");
const Chance = require("chance");
const { password } = require("async-prompt");

class TooGoodToGoClient {
  client;
  chance;

  parent;

  /**
   * @returns {TooGoodToGoClient}
   */
  constructor(parent) {
    this.parent = parent;
    this.chance = new Chance();
    const jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        timeout: 1000,
        baseURL: "https://apptoogoodtogo.com/api",
        headers: {
          "User-Agent":
            "TooGoodToGo/24.5.10 (26520) (iPhone/iPhone 12; iOS 17.4.1; Scale/3.00/iOS)",
          "Content-Type": "application/json",
          "accept-language": "fr-FR",
          accept: "application/json",
          connection: "keep-alive",
          "accept-encoding": "gzip",
        },
        jar,
      })
    );

    this.client.interceptors.request.use(
      function (config) {
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      async (response) => {
        const datadomeCookie = this.getDatadomeCookie(response);
        if (datadomeCookie) {
          await this.setDatadomeCookie(datadomeCookie);
        }
        return response;
      },
      async (error) => {
        const datadomeCookie = this.getDatadomeCookie(error.response);
        if (datadomeCookie) {
          await this.setDatadomeCookie(datadomeCookie);
        }
        return Promise.reject(error);
      }
    );
  }

  getDatadomeCookie(response) {
    if (
      response.headers["set-cookie"] &&
      response.headers["set-cookie"].length &&
      response.headers["set-cookie"][0]
        .split(";")
        .find((c) => c.includes("datadome"))
    ) {
      return response.headers["set-cookie"][0]
        .split(";")
        .find((c) => c.includes("datadome"))
        .replace("datadome=", "");
    }
  }

  deleteHeaders(headers) {
    headers.forEach((header) => {
      delete this.client.defaults.headers.common[header];
    });
  }

  setBearerToken(token) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  async setDatadomeCookie(datadome) {
    console.log(`Last found datadome ${datadome}`);
    this.client.defaults.headers.common["Cookie"] = `datadome=${datadome}`;
    this.parent.state.session.datadome = datadome;
    await this.parent.saveState();
  }

  async login(email) {
    const response = await this.client.post("/auth/v4/authByEmail", {
      device_type: "IOS",
      email,
    });
    return response.data;
  }

  async authenticate(email, pollingId) {
    const response = await this.client.post("/auth/v4/authByRequestPollingId", {
      device_type: "IOS",
      email,
      request_polling_id: pollingId,
    });
    return response.data;
  }

  async authByPinCode(email, pinCode, pollingId) {
    const response = await this.client.post("/auth/v4/authByRequestPin", {
      device_type: "IOS",
      email,
      request_pin: pinCode,
      request_polling_id: pollingId,
    });
    return response.data;
  }

  async getItems(payload) {
    const response = await this.client.post("/discover/v1/bucket", payload);
    return response.data.mobile_bucket.items;
  }

  async getAppSettings() {
    const response = await this.client.post("/app/v1/app_settings");
    return response.data;
  }

  async postAnonymousEvents() {
    const data = {
      country_code: "FR",
      event_type: "BEFORE_COOKIE_CONSENT",
      uuid: this.chance.guid(),
    };
    const response = await this.client.post(
      "/tracking/v1/anonymousEvents",
      data
    );
    return response.data;
  }

  async getSettings() {
    const response = await this.client.post("/app/v1/onStartup");
    return response.data;
  }

  async refreshToken(accessToken, refreshToken) {
    const response = await this.client.post("/auth/v4/token/refresh", {
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async getPackages() {
    const response = await this.client.post("/manufactureritem/v2", {
      action_types_accepted: ["QUERY"],
      display_types_accepted: ["LIST"],
      element_types_accepted: ["ITEM"],
    });
    return response.data?.groups[0].elements.map((p) => p.item);
  }
}

module.exports = TooGoodToGoClient;
