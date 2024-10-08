// Offista.js

const path = require("path");
const config = require(path.join(process.cwd(), "config.json"));

const axios = require("axios");
const MONDETORY_EMPLOYEE_PATH = path.join(
  process.cwd(),
  config["path"]["mandetory_employee"]
);
const MONDETORY_EMPLOYEE = require(MONDETORY_EMPLOYEE_PATH);
const offista_config = require(path.join(
  process.cwd(),
  config["path"]["offista_config"]
));

module.exports = class Offista {
  #user_name = offista_config.user_name;
  #user = offista_config.users[this.#user_name];
  #endpoint_name = this.#user.endpoint_name;
  #endpoint = offista_config[this.#endpoint_name];
  #station_id = this.#user.station_id;
  #login_id = this.#user.login_id;
  #login_pass = this.#user.login_pass;
  #rn_list = offista_config.rn_list;
  #product_id = offista_config.product_id;
  #email = offista_config.email;
  #dump_log = false;

  #api_key = "";
  #product_key = "";
  #session_id = "";

  constructor(init_object) {
    if (
      init_object !== undefined &&
      "is_dumpLog" in init_object &&
      init_object.is_dumpLog == true
    )
      this.#dump_log = true;
  }

  async #create_api_key() {
    const api_name = "CREATE_API_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      pid: this.#product_id,
      eml: this.#email,
    };
    const response = await this.#post(api_name, body_obj);

    if (response.data.result == 200) {
      const { product_key, api_key } = response.data;
      this.#api_key = api_key;
      this.#product_key = product_key;
    }
    return;
  }

  async get_api_key() {
    if (this.#api_key !== "") return this.#api_key;
    let return_obj = "";
    const api_name = "GET_API_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      eml: this.#email,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.api_key != null) {
      this.#api_key = response.data.api_key;
    } else {
      this.#create_api_key();
    }
    return_obj = this.#api_key;
    return return_obj;
  }

  async get_pid_key() {
    let return_obj = "";
    if (this.#product_key !== "") return this.#product_key;
    const api_name = "GET_PID_KEY";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
      eml: this.#email,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) this.#create_api_key();
    else this.product_key = response.data.product_key;
    return_obj = this.#product_key;
    return return_obj;
  }

  // async #api_login_rn() {
  //   let return_obj = {
  //     is_successed: false,
  //     error_message: "",
  //     session_id: "",
  //   };
  //   if (this.#session_id !== "") {
  //     return_obj.session_id = this.#session_id;
  //     return_obj.is_successed = true;
  //     return return_obj;
  //   }
  //   const api_name = "API_LOGIN_RN";

  //   const ac_method = await this.get_ac_method();
  //   let ac_id = ac_method.ac_id;
  //   let rn = this.#rn_list[ac_id];
  //   let A1 = rn[0][0];
  //   let E5 = rn[4][4];

  //   let body_obj = {
  //     uid: this.#login_id,
  //     upw: this.#login_pass,
  //     inputs: [
  //       {
  //         x: "A",
  //         y: 1,
  //         number: A1,
  //       },

  //       {
  //         x: "E",
  //         y: 5,
  //         number: E5,
  //       },
  //     ],
  //   };
  //   const response = await this.#post(api_name, body_obj);
  //   if (response.data.result != 200) {
  //     return_obj.error_message = response.data.message;
  //   } else {
  //     this.#session_id = response.data["session-id"];
  //     return_obj.is_successed = true;
  //     return_obj.session_id = this.#session_id;
  //   }
  //   return return_obj;
  // }

  async get_ac_method() {
    let return_obj = { ac_method: "", ac_id: "", one_time_type: "" };
    const api_name = "GET_AC_METHOD";
    let body_obj = {
      uid: this.#login_id,
      upw: this.#login_pass,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result == 200) {
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
          if (this.#dump_log) console.error("ac_method is not defined. ");
          return return_obj;
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
          if (this.#dump_log) console.error("OTP typ is not defined. ");
          return return_obj;
      }
    }
    return return_obj;
  }

  async get_employee(mut_stid, options) {
    // options={"mut_emp : 1001"}->emp_id=1001の人のレコードだけ返ってくる
    let return_obj = [{}];
    const api_name = "GET_EMPLOYEE";
    let body_obj = {
      api_key: await this.get_api_key(),
      mut_stid: mut_stid,
      uid: this.#login_id,
    };
    const keys = [
      "family_ret",
      "retiree_ret",
      "employees_kbn_ret",
      "response_blank",
      "employees",
    ];
    if (typeof options == "object") {
      keys.forEach((key) => {
        if (key in options) body_obj[key] = options[key];
      });
    }
    console.log(body_obj);
    const response = await this.#post(api_name, body_obj);
    if (response.data.result == 200) return_obj = response.data.employees;
    return return_obj;
  }

  async get_consignment_customer() {
    let return_obj = []; //[{identifire: "", customer_name: ""}]
    const api_name = "GET_CONSIGNMENT_CUSTOMER";
    let body_obj = {
      api_key: await this.get_api_key(),
      uid: this.#login_id,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result == 200) return_obj = response.data.customers;
    return return_obj;
  }

  async get_mut_stid(company_name) {
    let return_obj = "";
    let data = await this.get_consignment_customer();
    // 株式会社レンシュウの要素をフィルタリング
    const filteredElements = data.filter(
      (item) => item.customer_name === company_name
    );
    // 対応するidentifierを取り出す
    const identifiers = filteredElements.map((item) => item.identifier);
    if (identifiers.length == 1) return_obj = identifiers[0];
    return return_obj;
  }

  async get_office(mut_stid) {
    let return_obj = [];
    const api_name = "GET_OFFICE";
    let body_obj = {
      api_key: await this.get_api_key(),
      mut_stid: mut_stid,
      uid: this.#login_id,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result != 200) return_obj = response.data.offices;
    return return_obj;
  }

  async entry_employee(mut_stid, employees) {
    let return_obj = { is_successed: true, error_message: "" };
    const api_name = "ENTRY_EMPLOYEE";
    if (employees.length > 100) {
      return {
        is_successed: false,
        error_message: "maximum resist employee num is 100 per request.",
      };
    }
    const mondetory_keys = Object.keys(MONDETORY_EMPLOYEE);
    for (let i = 0; i < employees.length; i++) {
      for (let j = 0; j < mondetory_keys.length; j++) {
        const key = mondetory_keys[j];
        if (!(key in employees[i])) {
          return {
            is_successed: false,
            error_message: `index number ${i} employee object has not a key {${key}}.`,
          };
        }
      }
    }
    let body_obj = {
      api_key: await this.get_api_key(),
      mut_stid: mut_stid,
      uid: this.#login_id,
      upw: this.#login_pass,
      employees: employees,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result == 200) {
      return { is_successed: true, error_message: "" };
    } else
      return {
        is_successed: false,
        error_message: `office station error: failed to entry data.\n"${response.data.error_detail}"`,
      };
  }

  async modify_employee(mut_stid, employees) {
    let return_obj = { is_successed: true, error_message: "" };
    const api_name = "MODIFY_EMPLOYEE";
    if (employees.length > 100) {
      return {
        is_successed: false,
        error_message: "maximum modefy employee num is 100 per request.",
      };
    }
    const mondetory_keys = Object.keys(MONDETORY_EMPLOYEE);
    for (let i = 0; i < employees.length; i++) {
      for (let j = 0; j < mondetory_keys.length; j++) {
        const key = mondetory_keys[j];
        if (!(key in employees[i])) {
          return {
            is_successed: false,
            error_message: `index number ${i} employee object has not a key {${key}}.`,
          };
        }
      }
    }
    let body_obj = {
      api_key: await this.get_api_key(),
      mut_stid: mut_stid,
      uid: this.#login_id,
      upw: this.#login_pass,
      employees: employees,
    };
    const response = await this.#post(api_name, body_obj);
    if (response.data.result == 200)
      return { is_successed: true, error_message: "" };
    else {
      return {
        is_successed: false,
        error_message: `office station error: failed to modify data.\n"${response.data.error_detail}"`,
      };
    }
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
    if (response.status != 200 && this.#dump_log)
      console.error("post error: ", response.data.resultText);

    if (this.#dump_log) console.log(`\n${api_name}: `, return_obj);
    return return_obj;
  }
};
