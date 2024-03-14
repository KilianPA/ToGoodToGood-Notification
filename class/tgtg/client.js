const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

let client;

const getClient = () => {
  if (!client) {
    const jar = new CookieJar();
    client = wrapper(
      axios.create({
        baseURL: 'https://apptoogoodtogo.com/api',
        headers: {
          'User-Agent': 'TooGoodToGo/23.8.10 (13872) (iPhone/iPhone 12; iOS 16.6; Scale/3.00/iOS)',
          'Content-Type': 'application/json',
          'accept-language': 'fr-FR',
          accept: 'application/json',
        },
        jar,
      })
    );

    client.interceptors.request.use(
      function (config) {
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );

    client.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
  }
  return client;
};

exports.deleteHeaders = (headers) => {
  client = getClient();
  headers.forEach((header) => {
    delete client.defaults.headers.common[header];
  });
};

exports.setBearerToken = (token) => {
  client = getClient();
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

exports.setDatadomeCookie = (datadome) => {
  client = getClient();
  client.defaults.headers.common['Cookie'] = `datadome=${datadome}`;
};

exports.login = async (email) => {
  const client = getClient();
  const response = await client.post(
    '/auth/v4/authByEmail',
    {
      device_type: 'IOS',
      email,
    },
    {
      timeout: 2000,
    }
  );
  return response.data;
};

exports.authenticate = async (email, pollingId) => {
  const client = getClient();
  const response = await client.post('/auth/v4/authByRequestPollingId', {
    device_type: 'IOS',
    email,
    request_polling_id: pollingId,
  });
  return response.data;
};

exports.authByPinCode = async (email, pinCode, pollingId) => {
  const client = getClient();
  const response = await client.post('/auth/v4/authByRequestPin', {
    device_type: 'IOS',
    email,
    request_pin: pinCode,
    request_polling_id: pollingId,
  });
  const datadome = response.config.jar.toJSON().cookies.find((c) => c.key === 'datadome').value;
  return { ...response.data, datadome };
};

exports.getItems = async (payload) => {
  const client = getClient();
  const response = await client.post('/discover/v1/bucket', payload);
  return response.data.mobile_bucket.items;
};

exports.getSettings = async () => {
  const client = getClient();
  const response = await client.post('/app/v1/onStartup');
  return response.data;
};

exports.refreshToken = async (accessToken, refreshToken) => {
  const client = getClient();
  const response = await client.post('/auth/v4/token/refresh', {
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return response.data;
};

exports.getPackages = async () => {
  const client = getClient();
  const response = await client.post('/manufactureritem/v1', {
    country_id: 'FR',
    page: 1,
    page_size: 50,
  });
  return response.data?.manufacturer_items;
};
