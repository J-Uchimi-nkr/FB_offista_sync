# run.zsh

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
