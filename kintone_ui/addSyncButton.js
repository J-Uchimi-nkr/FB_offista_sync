const API_APP_NAME = "offista_api";
const IP_ADDR_KINTONE_APITOKEN = "YkCdFk00GMKGMhOPXzikCNJG8433cixmPwh73LY8";
let server_info = {
  method: "https",
  ipAddr: "127.0.0.1",
  port: 3000,
  endpoint: "/sync",
};

async function addSyncButton() {
  set_offista_server_info();
  console.log("\n\n\n\nadded button\n");
  // 新しいボタン要素を作成
  let newButton = document.createElement("button");
  newButton.id = "syncButton";
  newButton.innerHTML = "Office Station同期";

  // ボタンのスタイルを直接設定
  newButton.style.backgroundColor = "green";
  newButton.style.color = "white";
  newButton.style.border = "none";
  newButton.style.cursor = "pointer";
  newButton.style.borderRadius = "8px"; // 角を落として丸みを持たせる
  newButton.style.padding = "10px 20px"; // 上下に10px、左右に20pxのパディングを追加
  newButton.style.margin = "17px 4px";

  // ボタンクリック時の処理を設定
  newButton.onclick = function () {
    // ボタンを灰色に変更
    newButton.style.backgroundColor = "gray";
    newButton.style.pointerEvents = "none"; // クリックを無効化
    syncOfficeStation();
  };

  // 既存の要素を取得
  try {
    let existingElement = document.getElementsByClassName(
      "kintone-app-record-headermenu-space"
    )[0];

    // 既存の要素に新しいbuttonを追加
    existingElement.appendChild(newButton);
  } catch (e) {
    console.error(e);
  }
}

// Office Station同期処理
async function syncOfficeStation() {
  const newButton = document.getElementById("syncButton");
  const postData = {
    record_url: location.href,
  };

  try {
    const host_url = await get_offista_server_url();
    const response = await fetch(host_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    if (response.status === 200) {
      alert("synced successfully.");
      console.log("Response:", data);
    } else {
      const error_message = data.message;
      alert(`failed to sync.\n\ndetail: \n${error_message}`);
    }
  } catch (error) {
    console.error("syncOfficeStation Error:", error);
    const message = `このダイアログを閉じると認証ページが開きます。\n->画面左下の「詳細設定」\n->${server_info.ipAddr}にアクセスする（安全ではありません）\nの順にクリックしてください。\n（Google Chromeの場合の操作例です）\n\nポップアップブロックが作動した場合は解除してください`;
    alert(`failed to sync\n\ndetail: \n${error}\n\n${message}`);
    window.open(`https://${server_info.ipAddr}:${server_info.port}`);
    // エラー処理を行う
  } finally {
    newButton.style.backgroundColor = "green"; // ボタンを元に戻す
    newButton.style.pointerEvents = "auto";
  }
}

async function get_offista_server_url() {
  //将来的にサーバー同期を取る可能性があるため、ミドルウェアを設置
  let method = server_info.method;
  let ipAddr = server_info.ipAddr;
  let port = server_info.port;
  let endpoint = server_info.endpoint;
  return `${method}://${ipAddr}:${port}${endpoint}`;
}
async function set_offista_server_info() {
  const body = {
    app: 2988,
    query: `app_name="${API_APP_NAME}" order by レコード番号 desc`,
  };
  const result = await kintone.api(
    kintone.api.url("/k/v1/records.json", true),
    "GET",
    body
  );
  try {
    if (result.records.length == 0) {
      alert(
        "IP address is not defined on the kintone database.\nhttps://nkr-group.cybozu.com/k/2988/"
      );
      return;
    }
  } catch (e) {
    console.log(e);
  }
  const latest_record = result.records[0];
  server_info.ipAddr = latest_record.ip_addr.value;
  server_info.port = latest_record.port.value;
}

kintone.events.on(
  ["mobile.app.record.detail.show", "app.record.detail.show"],
  addSyncButton
);
