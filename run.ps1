# run.ps1
# モジュールの依存関係を解決した後に、HTTPS証明書の発行とサーバーの起動を行う


# 必要なモジュールのリスト
$requiredModules = @("uuid", "cors", "express", "request", "axios")

# インストールされているモジュールを取得
$installedModules = (npm list --depth=0 --json | ConvertFrom-Json).dependencies | ForEach-Object { $_.PSObject.Properties.Name }

# 不足しているモジュールを見つけてインストール
foreach ($module in $requiredModules) {
    if (-not $installedModules.Contains($module)) {
        Write-Host "Installing $module..."
        npm install $module
    }
}

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