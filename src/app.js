const SERVER_CONFIG_PATH = "./config/server_config.json";
const GENERAL_CONFIG_PATH = "./config/general_config.json";
const ERROR_HTML_PATH = "./templates/html/404.html";
const INTERNAL_SERVER_ERROR_PATH = "./templates/html/500.html";
const UTILS_PATH = "./utils";
const GETIPADDR_PATH = UTILS_PATH + "/getIPAddr";
const GETKINTONERECORD_PATH = UTILS_PATH + "/getKintoneRecord";
const GETAPPINFO_PATH = UTILS_PATH + "/getInfoFromURL.js";
const RESISTENROLLMENT_PATH = UTILS_PATH + "/resistEnrollment";
const DATAUPLOADER_PATH = "./class/DataUploader.js";
const RESISTIPADDRKINTONE_PATH = UTILS_PATH + "/resistIPaddrKintone";
const HTTPS_KEY_PATH = "./src/cert/cert_server.key";
const HTTPS_CERT_PATH = "./src/cert/cert_server.crt";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
var fs = require("fs");
var https = require("https");
const HTTPS_OPTIONS = {
  key: fs.readFileSync(HTTPS_KEY_PATH),
  cert: fs.readFileSync(HTTPS_CERT_PATH),
};
const getIPAddr = require(GETIPADDR_PATH);
const getKintoneRecord = require(GETKINTONERECORD_PATH);
const getAppInfo = require(GETAPPINFO_PATH);
const resistEnrollment = require(RESISTENROLLMENT_PATH);
const SERVER_CONFIG = require(SERVER_CONFIG_PATH);
const SERVER_PORT = SERVER_CONFIG.port;
const BINDING_PORT = SERVER_CONFIG.binding_port;
const GENERAL_CONFIG = require(GENERAL_CONFIG_PATH);
const APP_NAME = GENERAL_CONFIG.app_name;
const resistIP = require(RESISTIPADDRKINTONE_PATH);
const DataUploader = require(DATAUPLOADER_PATH);
const data_uploader = new DataUploader();
let this_server_ip_addr = "";

const APP = express();
APP.use(cors()); // CORSミドルウェアを使用してクロスオリジンリクエストを許可
APP.use(bodyParser.json()); // JSONを解析するためのミドルウェアを追加

APP.post("/sync", async (req, res) => {
  const jsonData = req.body;
  if (jsonData["record_url"] == undefined) {
    res.status(500).json({
      message: "record_url is necessary in the post data",
    });
    return;
  }
  const app_info = getAppInfo(jsonData["record_url"]);
  if (
    !app_info ||
    app_info.app_id == undefined ||
    app_info.record_id == undefined
  ) {
    res.status(500).json({
      message: "internal server error: incorrect app_info.",
    });
    return;
  }

  const record = await getKintoneRecord(app_info.app_id, app_info.record_id);
  if (record == []) {
    res.status(500).json({
      message:
        "internal server error: failed to get record from kintone server.",
    });
    return;
  }

  const resist_enrollment_result = await data_uploader.resistEnroll(record);
  if (resist_enrollment_result.is_successed == false) {
    res.status(500).json({
      message: resist_enrollment_result.error_message,
    });
    return;
  }
  res.status(200).json({
    message: JSON.stringify(record),
  });
  return;

  // const resist_enrollment_result = await resistEnrollment(record);
  // if (resist_enrollment_result.is_successed == false) {
  //   res.status(500).json({
  //     message: resist_enrollment_result.error_message,
  //   });
  //   return;
  // }
  // res.status(200).json({
  //   message: JSON.stringify(record),
  // });
  // return;
});

// 404エラーが発生した際に呼び出されるハンドラ
APP.use((req, res, next) => {
  res.status(404);
  if (req.method === "GET") {
    try {
      const absolutePath = path.join(__dirname, ERROR_HTML_PATH);
      res.sendFile(absolutePath);
      return;
    } catch (e) {
      next(e);
    }
  } else {
    res.json({ error: "404 Not Found" });
    return;
  }
});

// Internal Server Error ハンドリング
APP.use((err, req, res, next) => {
  console.error(err.stack);
  const absolutePath = path.join(__dirname, INTERNAL_SERVER_ERROR_PATH);
  res.status(500).sendFile(absolutePath);
  return;
});

// サーバーを指定のポートで起動;
// APP.listen(SERVER_PORT, BINDING_PORT, async () => {
//   this_server_ip_addr = getIPAddr();
//   await resistIP(2988, APP_NAME, this_server_ip_addr, SERVER_PORT, true);
//   console.log(
//     `Server is running on http://${this_server_ip_addr}:${SERVER_PORT}`
//   );
// });

const webServer = https.createServer(HTTPS_OPTIONS, APP);
webServer.listen(SERVER_PORT, BINDING_PORT, async () => {
  this_server_ip_addr = getIPAddr();
  await resistIP(2988, APP_NAME, this_server_ip_addr, SERVER_PORT, true);
  console.log(
    `Server is running on https://${this_server_ip_addr}:${SERVER_PORT}`
  );
});
