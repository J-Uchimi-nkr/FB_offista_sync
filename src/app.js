const SERVER_CONFIG_PATH = "./config/server_config.json";
const GENERAL_CONFIG_PATH = "./config/general_config.json";
const ERROR_HTML_PATH = "./templates/html/404.html";
const INTERNAL_SERVER_ERROR_PATH = "./templates/html/500.html";
const UTILS_PATH = "./utils";
const GETIPADDR_PATH = UTILS_PATH + "/getIPAddr";
const GETKINTONERECORD_PATH = UTILS_PATH + "/getKintoneRecord";
const GETAPPINFO_PATH = UTILS_PATH + "/getInfoFromURL.js";
const GETLOCALTIMEISO_PATH = UTILS_PATH + "/getLocalTimeISO";
const RESISTIPADDRKINTONE_PATH = UTILS_PATH + "/resistIPaddrKintone";
const HTTPS_KEY_PATH = "./src/cert/cert_server.key";
const HTTPS_CERT_PATH = "./src/cert/cert_server.crt";
const DATAUPLOADER_PATH = "./class/DataUploader.js";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const SERVER_UUID = uuidv4();
const HTTPS_OPTIONS = {
  key: fs.readFileSync(HTTPS_KEY_PATH),
  cert: fs.readFileSync(HTTPS_CERT_PATH),
};
const getIPAddr = require(GETIPADDR_PATH);
const getKintoneRecord = require(GETKINTONERECORD_PATH);
const getAppInfo = require(GETAPPINFO_PATH);
const getTimeISO = require(GETLOCALTIMEISO_PATH);
const SERVER_CONFIG = require(SERVER_CONFIG_PATH);
const SERVER_PORT = SERVER_CONFIG.port;
const BINDING_PORT = SERVER_CONFIG.binding_port;
const SERVER_PROTOCOL = SERVER_CONFIG.protocol;
const REPORT_ALIVE_INTERVAL = SERVER_CONFIG.report_alive_interval;
const GENERAL_CONFIG = require(GENERAL_CONFIG_PATH);
const APP_NAME = GENERAL_CONFIG.app_name;
const resistIP = require(RESISTIPADDRKINTONE_PATH);
const DataUploader = require(DATAUPLOADER_PATH);
const data_uploader = new DataUploader();

const INIT_TIME = getTimeISO();
const LOG_FILE_PATH = `./src/log/${INIT_TIME.slice(0, 10).replace(
  /-/g,
  ""
)}_${SERVER_UUID}.json`;
let this_server_ip_addr = "";

const APP = express();
APP.use(cors()); // CORSミドルウェアを使用してクロスオリジンリクエストを許可
APP.use(bodyParser.json()); // JSONを解析するためのミドルウェアを追加

APP.post("/sync", async (req, res) => {
  const jsonData = req.body;
  const newData = {
    time: getTimeISO(),
    from: req.ip,
    originalUrl: req.originalUrl,
    method: req.method,
    body: req.body,
    referrer: req.get("Referer"),
    statusCode: 200,
    res: "",
  };
  try {
    if (jsonData["record_url"] == undefined)
      throw new Error("record_url is necessary in the post data");
    const app_info = getAppInfo(jsonData["record_url"]);
    if (
      !app_info ||
      app_info.app_id == undefined ||
      app_info.record_id == undefined
    )
      throw new Error("internal server error: incorrect app_info.");
    const record = await getKintoneRecord(app_info.app_id, app_info.record_id);
    if (record == [])
      throw new Error(
        "internal server error: failed to get record from kintone server."
      );
      const report_type=record["連絡種別_文字列"].value
    const sync_result = await data_uploader.sync(record);
    if (sync_result.is_successed == false)
      throw new Error(sync_result.error_message);
    newData.res = record;
    newData.statusCode = 200;
    res.status(200).json({
      message: JSON.stringify(record),
    });
  } catch (e) {
    newData.res = e.message;
    newData.statusCode = 500;
    res.status(500).json({
      message: JSON.stringify({ message: e.message }),
    });
  }
  update_log_file(newData);
  return;
});

// 404エラーが発生した際に呼び出されるハンドラ
APP.use((req, res) => {
  const newData = {
    time: getTimeISO(),
    from: req.ip,
    originalUrl: req.originalUrl,
    method: req.method,
    body: req.body,
    referrer: req.get("Referer"),
    res: "",
  };
  if (req.method === "GET") {
    const absolutePath = path.join(__dirname, ERROR_HTML_PATH);
    try {
      res.status(404).sendFile(absolutePath);
      newData.res = `endpoint=${req.originalUrl} is not defined in server`;
      newData.statusCode = 404;
    } catch (e) {
      console.error(e.stack);
      newData.res = `failed to load file: ${absolutePath}`;
      res.sendStatus(500);
      newData.statusCode = 500;
    }
  } else {
    newData.res = `endpoint=${req.originalUrl} is not defined in server`;
    newData.statusCode = 404;
    res.status(404).json({ error: "404 Not Found" });
  }
  update_log_file(newData);
  return;
});

if (SERVER_PROTOCOL === "https") {
  // HTTPSで起動
  const webServer = https.createServer(HTTPS_OPTIONS, APP);
  webServer.listen(SERVER_PORT, BINDING_PORT, async () => {
    make_log_file();
    update_alive();
    setInterval(update_alive, REPORT_ALIVE_INTERVAL);
  });
} else if (SERVER_PROTOCOL === "http") {
  // サーバーをHTTPの指定のポートで起動;
  APP.listen(SERVER_PORT, BINDING_PORT, async () => {
    this_server_ip_addr = getIPAddr();
    make_log_file();
    update_alive();
    setInterval(update_alive, REPORT_ALIVE_INTERVAL);
  });
}

async function update_alive() {
  this_server_ip_addr = getIPAddr();
  console.log(
    `Server is running on https://${this_server_ip_addr}:${SERVER_PORT}`
  );
  const arg_obj = {
    app_id: 2988,
    uuid: SERVER_UUID,
    app_name: APP_NAME,
    ip_addr: this_server_ip_addr,
    port: SERVER_PORT,
    is_active: true,
    dump_info: false,
  };
  const report_response = await resistIP(arg_obj);
  if (report_response) console.log(`alive report: ${new Date()}`);
  else {
    console.log("alive report error");
  }
}

function make_log_file() {
  const jsonData = [];
  // ファイルにJSONデータを書き込む
  fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      throw new Error(`faild to make server log file.\n${err}`);
    }
  });
}

function update_log_file(newData) {
  try {
    // 既存のJSONファイルを読み込む
    let existingData = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const fileContent = fs.readFileSync(LOG_FILE_PATH, "utf8");
      existingData = JSON.parse(fileContent);
    }

    // 新しいデータを追加
    existingData.push(newData);

    // 更新されたJSONデータをファイルに書き込む
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(existingData, null, 2));

    console.log("log file update successfully:", LOG_FILE_PATH);
  } catch (err) {
    console.error("failed to update log file:", err);
  }
}
