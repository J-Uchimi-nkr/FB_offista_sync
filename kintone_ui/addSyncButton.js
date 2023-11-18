let server_info = {
  ipAddr: "127.0.0.1",
  port: 3000,
  endpoint: "/sync",
};

function addSyncButton() {
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
    console.error("Error:", error);
    alert(`failed to sync\n\ndetail: \n${error}`);
    // エラー処理を行う
  } finally {
    newButton.style.backgroundColor = "green"; // ボタンを元に戻す
    newButton.style.pointerEvents = "auto";
  }
}

async function get_offista_server_url() {
  //将来的にサーバー同期を取る可能性があるため、ミドルウェアを設置
  let ipAddr = server_info.ipAddr;
  let port = server_info.port;
  let endpoint = server_info.endpoint;
  return `http://${ipAddr}:${port}${endpoint}`;
}

kintone.events.on(
  ["mobile.app.record.detail.show", "app.record.detail.show"],
  addSyncButton
);
