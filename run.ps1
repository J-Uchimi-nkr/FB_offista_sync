# run.ps1

# パスを指定
$path = pwd

# パスに移動
cd $path\src\cert

# 証明書生成スクリプトを実行
.\generate_cert.ps1

# パスに移動
cd $path

# Node.jsアプリを実行
node .\src\app.js