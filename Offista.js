// Offista.js
const axios = require("axios");
const API_INFO_JSON_PASS = "./config.json";
const API_INFO = require(API_INFO_JSON_PASS);

module.exports = class Offista {
  #endpoint = API_INFO.demo_endpoint;
  #rn_list = API_INFO.rn_list;
  #station_id = API_INFO.users[0].station_id;
  #login_id = API_INFO.users[0].login_id;
  #login_pass = API_INFO.users[0].login_pass;
  #product_id = API_INFO.product_id;
  #email = API_INFO.email;
  #dump_log = false;

  constructor(init_object) {
    if ("is_dumpLog" in init_object && init_object.is_dumpLog == true)
      this.#dump_log = true;
    if ("is_demo" in init_object && init_object.is_demo == false)
      this.#endpoint = API_INFO.service_endpoint;
    if ("user_num" in init_object && init_object.user_num != 0) {
      const user_num = init_object.user_num;
      this.#station_id = API_INFO.users[user_num].station_id;
      this.#login_id = API_INFO.users[user_num].login_id;
      this.#login_pass = API_INFO.users[user_num].login_pass;
    }
    if ("product_id" in init_object) this.#product_id = init_object.product_id;
  }
  async create_api_key() {
    let return_obj = { api_key: "", product_key: "" };
    const api_name = "CREATE_API_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      pid: this.#product_id,
      eml: this.#email,
    };
    const response = await this.post(api_name, body_obj);
    if (response.status != 200) return {};
    const { product_key, api_key } = response.data;
    return_obj.api_key = api_key;
    return_obj.product_key = product_key;
    return return_obj;
  }
  async get_api_key() {
    const api_name = "GET_API_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      eml: this.#email,
    };
    const response = await this.post(api_name, body_obj);
    if (response.status != 200) return "";
    return response.data.api_key;
  }
  async get_pid_key() {
    const api_name = "GET_PID_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      eml: this.#email,
    };
    const response = await this.post(api_name, body_obj);
    if (response.status != 200) return "";
    return response.data.product_key;
  }
  async get_ac_method() {
    let return_obj = { ac_method: "", ac_id: "", one_time_type: "" };
    const api_name = "GET_AC_METHOD";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
    };
    const response = await this.post(api_name, body_obj);
    if (response.status != 200) return "";
    if (response.data.ac_method == -1) {
      console.error("ac_method is not defined. ");
      return {};
    }
    switch (response.data.ac_method) {
      case 0:
        return_obj.ac_method = "Symantec VIP token or GoogleAuthenticator";
        break;
      case 1:
        return_obj.ac_method = "RN list";
        break;
      case 9:
        return_obj.ac_method = "other";
        break;
      default:
        console.error("ac_method is not defined. ");
        return {};
    }
    return_obj.ac_id = response.data.ac_id;
    switch (response.data.ac_id) {
      case 1:
        return_obj.one_time_type = "Symantec VIP token";
        break;
      case 2:
        return_obj.one_time_type = "GoogleAuthenticator";
        break;
      default:
        console.error("OTP typ is not defined. ");
        return {};
    }
    return response.data.product_key;
  }
  async get_employee(api_key, option) {
    const api_name = "GET_EMPLOYEE";
    let body_obj = {
      api_key: api_key,
      mut_stid: this.#station_id,
      uid: this.#login_id,
    };
    if ("family_ret" in option) body_obj.family_ret = option.family_ret;
    if ("retiree_ret" in option) body_obj.retiree_ret = option.retiree_ret;
    if ("employees_kbn_ret" in option)
      body_obj.employees_kbn_ret = option.employees_kbn_ret;
    if ("response_blank" in option)
      body_obj.response_blank = option.response_blank;
    if ("employees" in option) body_obj.employees = option.employees;
    if ("mut_emp" in option) body_obj.mut_emp = option.mut_emp;

    const response = await this.post(api_name, body_obj);
    if (response.status != 200) return [];
    return response.data;
  }

  make_params(api_name, body_obj) {
    const params = {
      url: `${this.#endpoint}/${this.#station_id}/${api_name}`,
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      json: true,
      body: JSON.stringify(body_obj),
    };
    if (this.#dump_log) console.log("\nmake_params: ", params);
    return params;
  }

  async post(api_name, body_obj) {
    const params = this.make_params(api_name, body_obj);
    const response = await axios.post(params.url, body_obj, {
      headers: params.headers,
    });
    const return_obj = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
    if (response.status != 200)
      console.error("post error: ", response.statusText);
    if (this.#dump_log) console.log(`\n${api_name}: `, return_obj);
    return return_obj;
  }
};
