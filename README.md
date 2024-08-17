# Kintone-Offista-Sync

kintoneの詳細画面URLをpostすると，該当従業員のoffistaとデータ連携するサーバ

## setup

1. add .env file

   ```env
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   REDIRECT_URI=http://localhost:3000/oauth2callback
   JWT_SECRET=your_jwt_secret
   ```

   - `CLIENT_ID`と`CLIENT_SECRET`は[こちら](https://github.com/NKR-24/kintone_app_resister)を参考に取得
   - `JWT_SECRET`は任意の文字列

2. add config files

   > [!IMPORTANT]
   > must download above files into `src/json`
   >
   > - [kintone_config.json](https://drive.google.com/file/d/1hk_uxsLNvq8AgHY83Qs1Tos9CDlduUh-/view?usp=drive_link)
   > - [offista_config.json](https://drive.google.com/file/d/1E7ijrMsOt8Yc0MRKqbFdM6rqmwAWntgT/view?usp=drive_link)

3. install lib

    ```sh
    npm install
    ```

4. deploy

   ```sh
   gcloud run deploy
   ```

5. .envの内容をGoogle Cloud Runの環境変数に設定

   - [参考](https://cloud.google.com/run/docs/configuring/services/environment-variables?hl=ja#console)

6. 認証済みのURLに，deployしたサービスのURLを設定

   - [こちら](https://github.com/NKR-24/kintone_app_resister)を参照

## client

- `window.addEventListener`を用いて，ログイン完了イ ベントをlistenする

- ログイン完了時に，`event.data`にトークンが格納されているので，取得して利用する

   ```js
      // /syncにpostした結果をresponseで受け取る
      const response = await fetch(url, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
            },
            body: JSON.stringify(postData),
         });

      if (response.status === 401) {
            const targetOrigin = encodeURIComponent(location.href); // 呼び出し元のURL
            const fetch_url = `${server_info.host}/login?targetOrigin=${targetOrigin}`;
            const fetch_response = await fetch(fetch_url);
            const data = await fetch_response.json();
            const authorization_url = data.authorization_url; // 認証URL
            window.open(authorization_url, "_blank"); // 新しいタブで認証URLを開く

            // postMessageをlistenして、ログインが完了したら、トークンを取得して、syncOfficeStationを再度呼び出す
            window.addEventListener("message", (event) => {
            if (event.origin === server_info.host) {
               // オリジンが一致したら
               const token = event.data;
               server_info.token = token; // トークンを保存

               // tokenを用いた処理を記述
               // eg. 同期関数を再度呼び出す，localsotrageにtokenを保存など
               syncOfficeStation(); // 再度syncOfficeStationを呼び出す
            } else {
               console.log("Unkown origin:", event.origin);
            }
            return;
            });
            return;
         }
   ```
