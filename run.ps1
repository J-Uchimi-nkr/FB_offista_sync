# run.ps1

npm install uuid
npm install cors
npm install express
npm install request
npm install axios

# パスを指定
$path = pwd

# パスに移動
cd $path\src\cert

# 証明書生成スクリプトを実行
.\generate.ps1

# パスに移動
cd $path

# Node.jsアプリを実行
node .\src\app.js