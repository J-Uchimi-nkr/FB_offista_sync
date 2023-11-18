const os = require("os");

// localhostのIPv4アドレスをstringでreturn
module.exports = function getIPv4Addr() {
  const networkInterfaces = os.networkInterfaces();
  if (networkInterfaces["イーサネット"]) {
    const ethernetInterface = networkInterfaces["イーサネット"];
    // IPv4 アドレスを検索
    const ipv4AddressInfo = ethernetInterface.find(
      (info) => info.family === "IPv4"
    );
    if (ipv4AddressInfo) {
      return ipv4AddressInfo.address;
    }
  }
  return "127.0.0.1"; // どのネットワークインターフェースも見つからない場合はデフォルトでlocalhost
};
