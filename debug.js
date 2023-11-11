const client = require("request");
// const fs = require("fs");
const api_info = require("./config.json");

const ENDPOINT = api_info.demo_endpoint;
const STATION_ID = api_info.station_id;
const RN_LIST = api_info.rn_list;
const LOGIN_ID = api_info.login_id;
const LOGIN_PASS = api_info.login_pass;
const PRODUCT_ID = api_info.product_id;
const email = api_info.email;

// const API_NAME = "GET_AC_METHOD";
// const API_NAME = "API_LOGIN_RN";
const API_NAME = "CREATE_API_KEY";

async function main() {
  let api_key = "";
  let product_key = "";
  let request_json = {
    uid: LOGIN_ID,
    upw: LOGIN_PASS,
    pid: PRODUCT_ID,
    eml: email,
  };
  let options = {
    url: `${ENDPOINT}/${STATION_ID}/${API_NAME}`,
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    // json: true,//bodyが自動でJSON.parseされる
    body: JSON.stringify(request_json),
  };
  console.log(options);
  await client(options, function (error, response, body) {
    console.log(error);
    // console.log(response);
    // console.log(body);
    try {
      const result_obj = JSON.parse(response.body);
      console.log(result_obj);
    } catch (e) {
      console.log(e);
      return;
    }
  });
}

async function rn_login() {
  const api_name = "API_LOGIN_RN";
  let request_json = {
    uid: LOGIN_ID,
    upw: LOGIN_PASS,
    inputs: [],
  };
  const COLUMNS = ["A", "B", "C", "D", "E"];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      request_json.inputs.push({
        x: COLUMNS[j],
        y: i + 1,
        number: RN_LIST[i][j],
      });
    }
  }
  // console.log(request_json);
  let options = {
    url: `${ENDPOINT}/${STATION_ID}/${api_name}`,
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    json: true, //bodyが自動でJSON.parseされる
    body: JSON.stringify(request_json),
  };
  await client(options, function (error, response, body) {
    if (body.result == 200) return body["session-id"];
    else {
      console.log("rn login error: ", body.message);
      return "";
    }
  });
}

main();
