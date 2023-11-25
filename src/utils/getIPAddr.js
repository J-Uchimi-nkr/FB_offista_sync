const os = require("os");

// localhostのIPv4アドレスをstringでreturn
module.exports = () => {
  const networkInterfaces = os.networkInterfaces();

  // ネットワークインターフェースのキーを調査
  for (const interfaceKey in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceKey];

    // IPv4 アドレスを検索
    const ipv4AddressInfo = interfaceInfo.find(
      (info) => info.family === "IPv4"
    );

    // IPv4 アドレスが見つかれば返す
    if (ipv4AddressInfo) {
      return ipv4AddressInfo.address;
    }
  }

  return "127.0.0.1"; // どのネットワークインターフェースも見つからない場合はデフォルトでlocalhost
};
