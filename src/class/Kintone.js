const axios = require("axios");
const { resourceLimits } = require("worker_threads");
const CONFIG_PATH = "../config/kintone_config.json";
const CONFIG = require(CONFIG_PATH);
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
    if (CONFIG.ids && CONFIG.ids[id] && CONFIG.ids[id].api_token) {
      return CONFIG.ids[id].api_token;
    } else {
      return new Error(`Token not found for ID: ${id}`);
    }
  }

  #makeParams(httpMethod, query, jsonType) {
    let params = {
      url: `${this.#host}/k/v1/${jsonType}.json`,
      method: httpMethod,
      json: true,
      headers: {
        "X-Cybozu-API-Token": this.#token,
      },
    };

    if (jsonType === "app") {
      params.url += `?id=${this.#id}`;
    } else if (jsonType === "records") {
      params.url += `?app=${this.#id}&query=${encodeURI(query)}`;
    } else if (jsonType == "app/form/fields") {
      params.url += `?app=${this.#id}`;
    }

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
      return new Error("Fetch error");
    }
  }

  async build() {
    try {
      const param = this.#makeParams("GET", "", "app/form/fields");
      const result = await this.#request(param);
      const field_data = result.properties;
      Object.keys(field_data).forEach((key) => {
        this.#fieldStructure[key] = field_data[key].type;
      });
      const params = this.#makeParams("GET", "", "app");
      this.#appInfo = await this.#request(params);
    } catch (e) {
      return new Error("failed to build Kintone class");
    }
  }

  async get(queryStr) {
    const params = this.#makeParams("GET", queryStr, "records");
    try {
      const result = await this.#request(params);
      return result;
    } catch (e) {
      return new Error("failed to get Kintone record");
    }
  }

  async post(recordObj) {
    //({key:value})=>
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

    try {
      const result = await this.#request(params);
      return result;
    } catch (e) {
      return new Error("failed to post to Kintone database");
    }
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
