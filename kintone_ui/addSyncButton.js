let server_info = {
  // host: "https://offistasync-qzfx6k62aq-an.a.run.app",
  host: "http://localhost:8080",
  endpoint: "/sync",
  token: undefined,
};

function getToken() {
  //hashからtokenを取得
  if (server_info.token != undefined) return server_info.token;
  const token = window.location.hash.split("token=")[1];
  return token;
}

async function addSyncButton() {
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

  // urlにtokenが含まれている場合
  if (window.location.hash.includes("token=")) {
    newButton.style.backgroundColor = "gray";
    newButton.style.pointerEvents = "none"; // クリックを無効化
    syncOfficeStation();
  }
}

// Office Station同期処理
async function syncOfficeStation() {
  const newButton = document.getElementById("syncButton");
  const postData = {
    record_url: location.href,
  };

  try {
    const url = server_info.host + server_info.endpoint;
    token = getToken(); // トークンを取得
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
      },
      body: JSON.stringify(postData),
    });

    // 401だったらserver_info.host/loginにリダイレクト. 呼び出し元のURLを/loginに渡す
    if (response.status === 401) {
      // const redirect_url = encodeURIComponent(location.href);
      const targetOrigin = encodeURIComponent(location.href);
      // window.location.href = `${server_info.host}/login?targetOrigin=${targetOrigin}`;
      // return;
      const fetch_url = `${server_info.host}/login?targetOrigin=${targetOrigin}`;
      const fetch_response = await fetch(fetch_url);
      const data = await fetch_response.json();
      const authorization_url = data.authorization_url;

      window.open(authorization_url, "_blank");

      // postMessageをlistenして、ログインが完了したら、トークンを取得して、syncOfficeStationを再度呼び出す
      console.log("listen postMessage");
      window.addEventListener("message", (event) => {
        if (event.origin === server_info.host) {
          const token = event.data;
          console.log("token:", token);
          server_info.token = token;
          syncOfficeStation();
          return;
        } else {
          console.log("Unkown origin:", event.origin);
        }
      });
      return;
    } else if (response.status === 403) {
      alert("Forbidden");
      // google アカウントでログインしているときはログアウトする.redirect_urlは現在のURL
      const redirect_url = encodeURIComponent(location.href);
      window.location.href = `${server_info.host}/logout?redirect_url=${redirect_url}`;
      return;
    }
    const data = await response.json();
    console.log(data);
    if (response.status === 200) {
      alert("synced successfully.");
      console.log("Response:", data);
    } else {
      const error_message = data.message;
      alert(`failed to sync.\n\ndetail: \n${error_message}`);
    }
  } catch (error) {
    console.error("syncOfficeStation Error:", error);
    alert(`failed to sync\n\ndetail: \n${error}\n\n${message}`);
    // エラー処理を行う
  } finally {
    newButton.style.backgroundColor = "green"; // ボタンを元に戻す
    newButton.style.pointerEvents = "auto";
  }
}

kintone.events.on(
  ["mobile.app.record.detail.show", "app.record.detail.show"],
  addSyncButton
);
