var unique_key_value

(function() {
    "use strict"; 

    // ボタンと入力フィールドを追加する関数
    async function addSyncButton() {
        set_offista_server_info("offista_api"); // サーバー情報を設定
        console.log("\n\n\n\nadded button\n");

        // 新しいボタン要素を作成
        var button = document.createElement("button");
        button.innerHTML = "Office Station同期";
        button.className = "ui button";

        // ボタンのスタイルを直接設定
        button.style.backgroundColor = "green";
        button.style.color = "white";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.borderRadius = "8px"; // 角を丸くする
        button.style.padding = "10px 20px"; // 上下に10px、左右に20pxのパディングを追加
        button.style.margin = "17px 4px";

        // ボタンをクリックしたときの動作を定義
        button.onclick = async function () {
            // ボタンを灰色に変更し、クリックを無効化
            button.style.backgroundColor = "gray";
            button.style.pointerEvents = "none";
            await syncAllRecords(); 
        };

        // クラス名 "ui container fb-content" の要素を取得
        var container = document.querySelector('.ui.container.fb-content');

        // ボタンをコンテナに追加
        if (container) {
            container.appendChild(button);
        } else {
            console.error("コンテナが見つかりません");
        }
    }

    fb.events.finish.created.push(function (state) {
        unique_key_value = state.record.固有キー.value;
        console.log("固有キーは:" + unique_key_value);
        // ボタンを追加
        addSyncButton();
        return state;
    });

    const API_APP_NAME = "offista_api"; // APIアプリケーション名を定義
    const IP_ADDR_KINTONE_APITOKEN = "YkCdFk00GMKGMhOPXzikCNJG8433cixmPwh73LY8"; // Kintone APIトークンを定義

    // サーバー情報を格納するオブジェクト
    let server_info = {
        method: "https",
        ipAddr: "127.0.0.1",
        port: 3000,
        endpoint: "/sync",
    };

    // エラーメッセージを格納する配列
    let errorMessages = [];

    // 全レコード同期処理
    async function syncAllRecords() {
        const newButton = document.getElementById("syncButton"); // ボタン要素を取得

        try {
            const host_url = await get_offista_server_url(); // サーバーURLを取得

            const record_url = `https://nkr-group.cybozu.com/k/3253/show#record=000`;

            const postData = {
                record_url: record_url,
                unique_key_value: unique_key_value // 修正: 固有キーを送信データに追加
              };

            const response = await fetch(host_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData), // 送信データをJSONに変換
            });

            if (response.status === 404) {
                // レコードが存在しない場合
                console.log(`Record does not exist. Skipping...`);
            } else {
                const data = await response.json(); // レスポンスデータをJSONとして取得
            

                // レスポンスのステータスが200の場合
                if (response.status === 200) {
                    console.log(`Record synced successfully.`);
                } else {
                    const error_message = JSON.parse(data.message).message;
                    errorMessages.push(`failed to sync record.\n\ndetail: \n${error_message}`);
                }
            }

            alert(`Sync process completed.`);
        } catch (error) {
            console.error("syncOfficeStation Error:", error);
            errorMessages.push(`failed to sync\n\ndetail: \n${error}`);
        } finally {
            displayErrorMessages(); // エラーメッセージをポップアップで表示
            newButton.style.backgroundColor = "green"; // ボタンの色を元に戻す
            newButton.style.pointerEvents = "auto"; // クリックを再び有効化
        }
    }

    // エラーメッセージをポップアップで表示する関数
    async function displayErrorMessages() {
        if (errorMessages.length > 0) {
            alert(errorMessages.join("\n\n"));
        }
    }

    // サーバーURLを取得する関数
    async function get_offista_server_url() {
        let method = server_info.method;
        let ipAddr = server_info.ipAddr;
        let port = server_info.port;
        let endpoint = server_info.endpoint;
        return `${method}://${ipAddr}:${port}${endpoint}`;
    }

    // サーバー情報を設定する関数
    async function set_offista_server_info(api_app_name) {
        const body = {
            app: 2988, // アプリケーションIDを設定
            query: `app_name="${api_app_name}" order by レコード番号 desc`,
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
            console.log(e); // エラーが発生した場合はログに出力
        }
        const latest_record = result.records[0]; // 最新のレコードを取得
        server_info.ipAddr = latest_record.ip_addr.value; // サーバーIPアドレスを設定
        server_info.port = latest_record.port.value; // サーバーポートを設定
    }
})();
