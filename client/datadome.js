const { default: axios } = require("axios");

class Datadome {
  client;

  constructor() {
    this.client = axios.create({
      timeout: 1000,
      withCredentials: true,
      baseURL: "https://api-sdk.datadome.co/",
      headers: {
        "User-Agent": "TooGoodToGo/29805 CFNetwork/1568.100.1 Darwin/24.0.0",
        "Content-Type": "application/x-www-form-urlencoded",
        "accept-language": "fr-FR,fr;q=0.9",
        accept: "application/json",
        connection: "keep-alive",
        "accept-encoding": "gzip",
      },
    });
  }

  getCookie = async () => {
    const response = await this.client.post("sdk", {
      ddvc: "24.8.11",
      events:
        '[["message": "touch down", "source": "{"x":254, "y":695}", "date": 1725292897781, "id": 3], ["id": 3, "date": 1725292897878, "message": "touch up", "source": "{"x":254, "y":695}"], ["date": 1725292899748, "message": "touch down", "source": "{"x":267, "y":678}", "id": 3], ["source": "{"x":267, "y":678}", "date": 1725292899878, "id": 3, "message": "touch up"], ["id": 3, "source": "{"x":51, "y":254}", "date": 1725292928917, "message": "touch down"], ["date": 1725292928994, "source": "{"x":51, "y":254}", "message": "touch up", "id": 3], ["message": "touch down", "source": "{"x":264, "y":829}", "id": 3, "date": 1725292980356], ["date": 1725292980387, "id": 3, "message": "touch move", "source": "{"x":0, "y":-88}"], ["id": 1, "source": "sdk", "message": "response validation", "date": 1725356247729]]',
      inte: "alamofire",
      osn: "iOS",
      screen_d: 3.0,
      camera: JSON.stringify({ auth: false, info: "" }),
      mdl: "iPhone13,2",
      screen_y: 2532.0,
      ddv: "3.5.2",
      request: "https://apptoogoodtogo.com/api/auth/v5/authByRequestPollingId",
      osr: 18.0,
      ddk: "1D42C2CA6131C526E09F294FE96F94",
      screen_x: "1170.0",
      osv: "18.0",
      cid: "~dOXqA~iES4NhWfS3E_94rTrFejQt4LzOjbnI_SSle4x1zLE8_9QOGv80q0tLd5m7eGmrjso_0EMY0wYJ1L3wba_5GE4sJG05sOxE4Ye~J1vccirU23f3UegC9Ou7Vxy",
      os: "ios",
    });
    return response.data.cookie;
  };
}

module.exports = Datadome;
