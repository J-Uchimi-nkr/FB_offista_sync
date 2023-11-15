const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const cors = require("cors");
const path = require("path");
const Offista = require("./classes/Offista");
const Kintone = require("./classes/Kintone");
const CONFIG = require("./configs/server_config.json");

const SERVER_PORT = CONFIG.port;
const BINDING_PORT = CONFIG.binding_port;
const APP = express();
APP.use(cors()); // CORSミドルウェアを使用してクロスオリジンリクエストを許可
APP.use(bodyParser.json()); // JSONを解析するためのミドルウェアを追加
const OFFISTA_INSTANCE = new Offista({ is_dumpLog: true });

APP.post("/get-kintoneData", async (req, res) => {
  const jsonData = req.body;
  console.log("Received JSON:", jsonData);

  if (jsonData["record_url"] == undefined) {
    res.json({
      status: "failed",
      message: "record_url is necessary in the post data",
    });
    return;
  }

  const record_url = jsonData.record_url;
  const matchResult = record_url.match(/\/k\/(\d+)\/show#record=(\d+)/);

  if (matchResult) {
    const app_id = matchResult[1];
    const record_id = matchResult[2];
    console.log("app_id:", app_id);
    console.log("record_id:", record_id);

    const c = new Kintone(app_id);
    await c.build();
    const query_str = `レコード番号=${record_id}`;
    const result = await c.get(query_str);
    console.log(result);

    res.json({
      status: "success",
      message: JSON.stringify(result.records[0]),
    });
    return;
  } else {
    console.log("URLからapp_idとrecord_idを取得できませんでした。");
    res.json({
      status: "failed",
      message: "URLからapp_idとrecord_idを取得できませんでした。",
    });
    return;
  }
});

APP.get("/get-consignment", async (req, res) => {
  const api_key = await OFFISTA_INSTANCE.get_api_key();
  let result = await OFFISTA_INSTANCE.get_consignment_customer(api_key);
  res.json({ status: "success", message: JSON.stringify(result) });
});
// 404エラーが発生した際に呼び出されるハンドラ
APP.use((req, res) => {
  res.status(404);
  // GETリクエストの場合
  if (req.method === "GET") {
    res.sendFile(path.join(__dirname, "templates/html", "404.html"));
  } else {
    // POSTリクエストの場合
    res.json({ error: "404 Not Found" });
  }
});

// サーバーを指定のポートで起動;
APP.listen(SERVER_PORT, BINDING_PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress;
  // Ethernetが存在するか確認し、存在する場合はそれを使用
  if (networkInterfaces["Ethernet"]) {
    ipAddress = networkInterfaces["Ethernet"][0].address;
  } else {
    // Ethernetがない場合はWi-Fiを使用
    ipAddress = networkInterfaces["Wi-Fi"]
      ? networkInterfaces["Wi-Fi"][1].address
      : "127.0.0.1";
  }
  console.log(`Server is running on http://${ipAddress}:${SERVER_PORT}`);
});
