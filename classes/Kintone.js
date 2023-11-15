const axios = require("axios");
const CONFIG = require("../configs/kintone_config.json");

module.exports = class Kintone {
  #host;
  #id;
  #token;
  #fieldStructure = {}; // fieldCode: dataType
  #appInfo = "";

  constructor(id) {
    this.#id = String(id);
    this.#token = this.#getToken(id);
    this.#host = CONFIG.host_url;
  }

  #getToken(id) {
    try {
      if (CONFIG.ids && CONFIG.ids[id] && CONFIG.ids[id].api_token) {
        return CONFIG.ids[id].api_token;
      } else {
        throw new Error(`Token not found for ID: ${id}`);
      }
    } catch (error) {
      console.error(error);
      throw new Error("Error reading configuration or token not found");
    }
  }

  #makeParams(httpMethod, query, jsonType) {
    let url = `${this.#host}/k/v1/${jsonType}.json`;

    if (jsonType === "app") {
      url += `?id=${this.#id}`;
    } else if (jsonType === "records") {
      url += `?app=${this.#id}&query=${encodeURI(query)}`;
    }

    const params = {
      url,
      method: httpMethod,
      json: true,
      headers: {
        "X-Cybozu-API-Token": this.#token,
      },
    };

    if (httpMethod === "POST") {
      params.headers["Content-Type"] = "application/json";
    }

    return params;
  }

  async #request(params) {
    try {
      const response = await axios(params);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Fetch error");
    }
  }

  async build() {
    const row_data = await this.get("");
    const firstRecord = row_data.records[0];

    Object.keys(firstRecord).forEach((key) => {
      this.#fieldStructure[key] = firstRecord[key].type;
    });

    const params = this.#makeParams("GET", "", "app");
    this.#appInfo = await this.#request(params);
  }

  async get(queryStr) {
    const params = this.#makeParams("GET", queryStr, "records");
    return this.#request(params);
  }

  async post(recordObj) {
    const postObj = {};
    Object.keys(recordObj).forEach((key) => {
      postObj[key] = { value: recordObj[key] };
    });

    const postData = {
      app: this.#id,
      record: postObj,
    };

    const params = this.#makeParams("POST", "", "record");
    params.data = postData;

    console.log(params);

    return this.#request(params);
  }

  getParams() {
    return {
      appInfo: this.#appInfo,
      host: this.#host,
      token: this.#token,
      fieldStructure: this.#fieldStructure,
    };
  }
};
