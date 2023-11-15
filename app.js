const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const cors = require("cors");
const SERVER_CONFIG_PATH = "./configs/server_config.json";
const config = require(SERVER_CONFIG_PATH);

const server_port = config.port;
const app = express();
app.use(cors()); // CORSミドルウェアを使用してクロスオリジンリクエストを許可
app.use(bodyParser.json()); // JSONを解析するためのミドルウェアを追加

// POSTリクエストを処理するエンドポイント
app.post("/process-json", (req, res) => {
  const jsonData = req.body;
  console.log("Received JSON:", jsonData);
  res.json({ status: "success", message: "JSON processed successfully" });
});
app.get("/process-json", (req, res) => {
  const jsonData = req.body;
  console.log("Received JSON:", jsonData);
  res.json({ status: "success", message: "received get request" });
});

// サーバーを指定のポートで起動
app.listen(server_port, () => {
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
  console.log(`Server is running on http://${ipAddress}:${port}`);
});
