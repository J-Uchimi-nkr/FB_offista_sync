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
