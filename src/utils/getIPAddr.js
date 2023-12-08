const os = require("os");
const { execSync } = require("child_process");

// ローカルホストのIPv4アドレスを文字列で返す
module.exports = () => {
  // WSLで実行しているか確認
  const isWSL = os.release().toLowerCase().includes("microsoft");

  if (isWSL) {
    try {
      // Windowsホスト名を取得
      const windowsHostname = execSync("wsl.exe hostname").toString().trim();

      // Windowsホスト名を解決してIPアドレスを取得
      const match = execSync(
        `nslookup ${windowsHostname} | grep Address | grep -oE '\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b'`
      )
        .toString()
        .match(/\b(192\.168\.[0-9]{1,3}\.[0-9]{1,3})\b/);

      if (match) {
        // WindowsホストのIPアドレスを取得できた場合
        return match[0];
      } else {
        console.warn(
          "WindowsのIPアドレスが見つかりませんでした。ローカルIPv4アドレスを使用します。"
        );
      }
    } catch (error) {
      console.error("WindowsのIPアドレスの取得エラー:", error.message);
    }
  }

  // WSLでない場合は、ローカルIPv4アドレスを取得する元のロジックを使用
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceKey in networkInterfaces) {
    if (interfaceKey === "lo") continue;
    const interfaceInfo = networkInterfaces[interfaceKey];

    const ipv4AddressInfo = interfaceInfo.find(
      (info) => info.family === "IPv4"
    );

    if (ipv4AddressInfo) {
      return ipv4AddressInfo.address;
    }
  }

  return "127.0.0.1";
};
