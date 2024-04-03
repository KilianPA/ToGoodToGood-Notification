const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

class TooGoodToGoClient {
  client;

  constructor() {
    const jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        baseURL: "https://apptoogoodtogo.com/api",
        headers: {
          "User-Agent":
            "TooGoodToGo/23.8.10 (13872) (iPhone/iPhone 12; iOS 16.6; Scale/3.00/iOS)",
          "Content-Type": "application/json",
          "accept-language": "fr-FR",
          accept: "application/json",
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
      function (response) {
        return response;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
  }

  deleteHeaders(headers) {
    headers.forEach((header) => {
      delete this.client.defaults.headers.common[header];
    });
  }

  setBearerToken(token) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  setDatadomeCookie(datadome) {
    this.client.defaults.headers.common["Cookie"] = `datadome=${datadome}`;
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
    const datadome = response.config.jar
      .toJSON()
      .cookies.find((c) => c.key === "datadome").value;
    return { ...response.data, datadome };
  }

  async getItems(payload) {
    const response = await this.client.post("/discover/v1/bucket", payload);
    return response.data.mobile_bucket.items;
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
      action_types_accepted: [],
      display_types_accepted: ["LIST"],
      element_types_accepted: [
        "ITEM",
        "MANUFACTURER_STORY_CARD",
        "DUO_ITEMS",
        "TEXT",
        "NPS",
      ],
    });
    return response.data?.groups[0].elements.map((p) => p.item);
  }
}

module.exports = TooGoodToGoClient;
