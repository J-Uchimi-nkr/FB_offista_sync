# run.zsh
# モジュールの依存関係を解決した後に、HTTPS証明書の発行とサーバーの起動を行う


# 必要なモジュールのリスト
REQUIRED_MODULES=("uuid" "cors" "express" "request" "axios")

# インストールされているモジュールを取得
INSTALLED_MODULES=$(npm list --depth=0 --json | jq -r '.dependencies | keys[]')

# 不足しているモジュールを見つけてインストール
for module in "${REQUIRED_MODULES[@]}"; do
    if [[ ! "$INSTALLED_MODULES" =~ "$module" ]]; then
        echo "Installing $module..."
        npm install "$module"
    fi
done

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
