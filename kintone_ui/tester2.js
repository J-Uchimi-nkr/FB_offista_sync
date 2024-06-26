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

// ボタンと入力フィールドを追加する関数
async function addSyncButton() {
    set_offista_server_info(API_APP_NAME); // サーバー情報を設定
    console.log("\n\n\n\nadded button\n");

    // 新しい入力フィールド要素を作成
    let inputField = document.createElement("input");
    inputField.id = "appNumberInput";
    inputField.type = "text";
    inputField.placeholder = "アプリ番号を入力";

    let startRecordInput = document.createElement("input");
    startRecordInput.id = "startRecordInput";
    startRecordInput.type = "text";
    startRecordInput.placeholder = "開始レコード番号を入力";

    let endRecordInput = document.createElement("input");
    endRecordInput.id = "endRecordInput";
    endRecordInput.type = "text";
    endRecordInput.placeholder = "終了レコード番号を入力";

    // 新しいボタン要素を作成
    let newButton = document.createElement("button");
    newButton.id = "syncButton";
    newButton.innerHTML = "Office Station同期";

    // ボタンのスタイルを直接設定
    newButton.style.backgroundColor = "green";
    newButton.style.color = "white";
    newButton.style.border = "none";
    newButton.style.cursor = "pointer";
    newButton.style.borderRadius = "8px"; // 角を丸くする
    newButton.style.padding = "10px 20px"; // 上下に10px、左右に20pxのパディングを追加
    newButton.style.margin = "17px 4px";

    // ボタンクリック時の処理を設定
    newButton.onclick = function () {
        const appNumber = inputField.value;
        const startRecord = startRecordInput.value;
        const endRecord = endRecordInput.value;
        if (!appNumber || !startRecord || !endRecord) {
            alert("全てのフィールドに入力してください");
            return;
        }
        // ボタンを灰色に変更し、クリックを無効化
        newButton.style.backgroundColor = "gray";
        newButton.style.pointerEvents = "none";
        syncAllRecords(appNumber, startRecord, endRecord); 
    };

    // 既存の要素を取得し、新しい入力フィールドとボタンを追加
    try {
        let existingElement = document.getElementsByClassName(
            "gaia-argoui-app-index-toolbar"
        )[0];
        existingElement.appendChild(inputField);
        existingElement.appendChild(document.createElement("br")); // 改行
        existingElement.appendChild(startRecordInput); // 開始レコード番号フィールドを追加
        existingElement.appendChild(document.createElement("br")); // 改行
        existingElement.appendChild(endRecordInput); // 終了レコード番号フィールドを追加
        existingElement.appendChild(document.createElement("br")); // 改行
        existingElement.appendChild(newButton);
        existingElement.appendChild(document.createElement("br")); // 改行
    } catch (e) {
        console.error(e); // エラーが発生した場合はログに出力
    }
}

// 全レコード同期処理
async function syncAllRecords(appNumber, startRecord, endRecord) {
    const newButton = document.getElementById("syncButton"); // ボタン要素を取得

    try {
        const host_url = await get_offista_server_url(); // サーバーURLを取得

        // ベースURLを作成
        const baseUrl = `https://nkr-group.cybozu.com/k/${appNumber}/`;

        // レコード番号1番から指定の範囲までを順に同期
        let recordNumber = parseInt(startRecord);
        const endRecordNumber = parseInt(endRecord);

        while (recordNumber <= endRecordNumber) {
            const record_url = `${baseUrl}show#record=${recordNumber}`;
            const postData = {
                record_url: record_url,
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
                console.log(`Record ${recordNumber} does not exist. Skipping...`);
            } else {
                const data = await response.json(); // レスポンスデータをJSONとして取得
                console.log(data);

                // レスポンスのステータスが200の場合
                if (response.status === 200) {
                    console.log(`Record ${recordNumber} synced successfully.`);
                } else {
                    const error_message = JSON.parse(data.message).message;
                    errorMessages.push(`failed to sync record ${recordNumber}.\n\ndetail: \n${error_message}`);
                }
            }

            recordNumber++;
        }

        alert(`Sync process completed up to record number ${endRecordNumber}.`);
    } catch (error) {
        console.error("syncOfficeStation Error:", error);
        errorMessages.push(`failed to sync\n\ndetail: \n${error}`);
    } finally {
        await saveErrorMessagesToFile(); // エラーメッセージをファイルに書き出す
        newButton.style.backgroundColor = "green"; // ボタンの色を元に戻す
        newButton.style.pointerEvents = "auto"; // クリックを再び有効化
    }
}

// エラーメッセージをファイルに書き出す関数
async function saveErrorMessagesToFile() {
    if (errorMessages.length > 0) {
        const errorBlob = new Blob([errorMessages.join("\n\n")], { type: "text/plain" });
        const errorUrl = URL.createObjectURL(errorBlob);
        const a = document.createElement("a");
        a.href = errorUrl;
        a.download = "sync_errors.txt";
        a.click();
        URL.revokeObjectURL(errorUrl); // メモリを解放
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
