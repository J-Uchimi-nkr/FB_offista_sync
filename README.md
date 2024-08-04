# Kintone-Offista-Sync

## setup

1. add .env file

   ```env
   CLIENT_ID=
   CLIENT_SECRET=
   REDIRECT_URI=http://localhost:3000/oauth2callback
   JWT_SECRET=
   ```

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
