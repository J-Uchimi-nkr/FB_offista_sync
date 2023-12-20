# run.zsh
# モジュールの依存関係を解決した後に、HTTPS証明書の発行とサーバーの起動を行う

npm install package.json

# パスを指定
path=$(pwd)

# パスに移動
cd $path/src/cert

# 証明書生成スクリプトを実行
./generate.sh

# パスに移動
cd $path

# Node.jsアプリを実行
node $path/src/app.js
