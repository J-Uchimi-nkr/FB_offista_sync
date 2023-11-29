# run.ps1

# パスを指定
$path = "C:\Users\社会保険労務士法人　日本経営労務\Desktop\playground\js\git_projects\offista_api"

# パスに移動
cd $path\src\cert

# 証明書生成スクリプトを実行
.\generate_cert.ps1

# パスに移動
cd $path

# Node.jsアプリを実行
node .\src\app.js