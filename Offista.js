// Offista.js
const axios = require("axios");
const CONFIG_PATH = "./config.json";
const MONDETORY_EMPLOYEE_PATH = "./template/mondetory_employee.json";
const CONFIG = require(CONFIG_PATH);
const MONDETORY_EMPLOYEE = require(MONDETORY_EMPLOYEE_PATH);
module.exports = class Offista {
  #endpoint = CONFIG.demo_endpoint;
  #rn_list = CONFIG.rn_list;
  #station_id = CONFIG.users[0].station_id;
  #login_id = CONFIG.users[0].login_id;
  #login_pass = CONFIG.users[0].login_pass;
  #product_id = CONFIG.product_id;
  #email = CONFIG.email;
  #dump_log = false;

  constructor(init_object) {
    if ("is_dumpLog" in init_object && init_object.is_dumpLog == true)
      this.#dump_log = true;
    if ("is_demo" in init_object && init_object.is_demo == false)
      this.#endpoint = CONFIG.service_endpoint;
    if ("user_num" in init_object && init_object.user_num != 0) {
      const user_num = init_object.user_num;
      this.#station_id = CONFIG.users[user_num].station_id;
      this.#login_id = CONFIG.users[user_num].login_id;
      this.#login_pass = CONFIG.users[user_num].login_pass;
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
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return {};
    const { product_key, api_key } = response.data;
    return_obj.api_key = api_key;
    return_obj.product_key = product_key;
    return return_obj;
  }
  async get_api_key() {
    let return_obj = "";
    const api_name = "GET_API_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      eml: this.#email,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return "";
    return_obj = response.data.api_key;
    return return_obj;
  }
  async get_pid_key() {
    let return_obj = "";
    const api_name = "GET_PID_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      eml: this.#email,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return "";
    return_obj = response.data.product_key;
    return return_obj;
  }
  async get_ac_method() {
    let return_obj = { ac_method: "", ac_id: "", one_time_type: "" };
    const api_name = "GET_AC_METHOD";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return "";
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
  async get_employee(api_key, mut_stid, options) {
    let return_obj = [{}];
    const api_name = "GET_EMPLOYEE";
    let body_obj = {
      api_key: api_key,
      mut_stid: mut_stid,
      uid: this.#login_id,
    };
    const keys = [
      "family_ret",
      "retiree_ret",
      "employees_kbn_ret",
      "response_blank",
      "employees",
      "mut_emp",
    ];
    keys.forEach((key) => {
      if (key in options) body_obj[key] = option[key];
    });
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return [];
    return_obj = response.data.employees;
    return return_obj;
  }
  async get_consignment_customer(api_key) {
    let return_obj = [
      {
        identifire: "",
        customer_name: "",
      },
    ];
    const api_name = "GET_CONSIGNMENT_CUSTOMER";
    let body_obj = {
      api_key: api_key,
      uid: this.#login_id,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return [];
    return_obj = response.data.customers;
    return return_obj;
  }
  async get_office(api_key, mut_stid) {
    let return_obj = [{}];
    const api_name = "GET_OFFICE";
    let body_obj = {
      api_key: api_key,
      mut_stid: mut_stid,
      uid: this.#login_id,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return [];
    return_obj = response.data.offices;
    return return_obj;
  }
  async entry_employee(api_key, mut_stid, employees) {
    let return_obj = false;
    const api_name = "ENTRY_EMPLOYEE";
    if (employees.length > 100) {
      console.error("maximum resist employee num is 100 per request.");
      return false;
    }
    const mondetory_keys = Object.keys(MONDETORY_EMPLOYEE);
    for (let i = 0; i < employees.length; i++) {
      for (let j = 0; j < mondetory_keys.length; j++) {
        const key = mondetory_keys[j];
        if (!(key in employees[i])) {
          console.error(
            `index number ${i} employee object has not a key {${key}}.`
          );
          return false;
        }
      }
    }
    let body_obj = {
      api_key: api_key,
      mut_stid: mut_stid,
      uid: this.#login_id,
      upw: this.#login_pass,
      employees: employees,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return false;
    return_obj = true;
    return return_obj;
  }
  async modify_employee(api_key, mut_stid, employees) {
    let return_obj = false;
    const api_name = "MODIFY_EMPLOYEE";
    if (employees.length > 100) {
      console.error("maximum modefy employee num is 100 per request.");
      return false;
    }
    const mondetory_keys = Object.keys(MONDETORY_EMPLOYEE);
    for (let i = 0; i < employees.length; i++) {
      for (let j = 0; j < mondetory_keys.length; j++) {
        const key = mondetory_keys[j];
        if (!(key in employees[i])) {
          console.error(
            `index number ${i} employee object has not a key {${key}}.`
          );
          return false;
        }
      }
    }
    let body_obj = {
      api_key: api_key,
      mut_stid: mut_stid,
      uid: this.#login_id,
      upw: this.#login_pass,
      employees: employees,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return false;
    return_obj = true;
    return return_obj;
  }

  #make_params(api_name, body_obj) {
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
  async #post(api_name, body_obj) {
    let return_obj = {
      status: "response.status",
      statusText: "response.statusText",
      data: {},
    };
    const params = this.#make_params(api_name, body_obj);
    const response = await axios.post(params.url, body_obj, {
      headers: params.headers,
    });
    return_obj = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
    if (response.status != 200)
      console.error("post error: ", response.data.resultText);

    if (this.#dump_log) console.log(`\n${api_name}: `, return_obj);
    return return_obj;
  }
};
